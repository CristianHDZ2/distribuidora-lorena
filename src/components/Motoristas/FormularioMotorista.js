import React, { useState, useEffect } from 'react';
import { motoristasAPI } from '../../utils/api';

const FormularioMotorista = ({ 
  motorista = null, 
  onClose, 
  onGuardado, 
  modoModal = true 
}) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    dui: '',
    numero_licencia: '',
    tipo_licencia: 'Liviana',
    telefono: '',
    direccion: '',
    activo: true
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  // Llenar formulario si se está editando
  useEffect(() => {
    if (motorista) {
      setFormData({
        nombre_completo: motorista.nombre_completo || '',
        dui: motorista.dui || '',
        numero_licencia: motorista.numero_licencia || '',
        tipo_licencia: motorista.tipo_licencia || 'Liviana',
        telefono: motorista.telefono || '',
        direccion: motorista.direccion || '',
        activo: motorista.activo !== undefined ? motorista.activo : true
      });
    }
  }, [motorista]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    // Formatear DUI automáticamente
    if (name === 'dui') {
      newValue = formatearDUI(value);
    }

    // Formatear teléfono automáticamente
    if (name === 'telefono') {
      newValue = formatearTelefono(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Formatear DUI
  const formatearDUI = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 8) {
      return numeros;
    }
    return `${numeros.slice(0, 8)}-${numeros.slice(8, 9)}`;
  };

  // Formatear teléfono
  const formatearTelefono = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 4) {
      return numeros;
    }
    return `${numeros.slice(0, 4)}-${numeros.slice(4, 8)}`;
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar nombre completo
    if (!formData.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = 'El nombre completo es requerido';
    } else if (formData.nombre_completo.trim().length < 3) {
      nuevosErrores.nombre_completo = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar DUI
    if (!formData.dui.trim()) {
      nuevosErrores.dui = 'El DUI es requerido';
    } else if (!/^\d{8}-\d$/.test(formData.dui)) {
      nuevosErrores.dui = 'El DUI debe tener el formato 12345678-9';
    }

    // Validar número de licencia
    if (!formData.numero_licencia.trim()) {
      nuevosErrores.numero_licencia = 'El número de licencia es requerido';
    } else if (formData.numero_licencia.trim().length < 5) {
      nuevosErrores.numero_licencia = 'El número de licencia debe tener al menos 5 caracteres';
    }

    // Validar tipo de licencia
    if (!formData.tipo_licencia) {
      nuevosErrores.tipo_licencia = 'El tipo de licencia es requerido';
    }

    // Validar teléfono (opcional)
    if (formData.telefono && !/^\d{4}-\d{4}$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener el formato 1234-5678';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      if (motorista) {
        // Editar motorista existente
        await motoristasAPI.editar(motorista.id, formData);
      } else {
        // Crear nuevo motorista
        await motoristasAPI.crear(formData);
      }

      // Notificar éxito
      if (onGuardado) {
        onGuardado();
      }

      // Cerrar formulario
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error('Error al guardar motorista:', error);
      // Aquí iría el toast de error
      if (error.response?.data?.error) {
        setErrores({ general: error.response.data.error });
      } else {
        setErrores({ general: 'Error al guardar el motorista' });
      }
    } finally {
      setLoading(false);
    }
  };

  const contenidoFormulario = (
    <form onSubmit={handleSubmit}>
      {/* Error general */}
      {errores.general && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {errores.general}
        </div>
      )}

      <div className="row">
        {/* Nombre Completo */}
        <div className="col-md-6 mb-3">
          <label htmlFor="nombre_completo" className="form-label">
            Nombre Completo <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errores.nombre_completo ? 'is-invalid' : ''}`}
            id="nombre_completo"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            placeholder="Ingrese el nombre completo"
            disabled={loading}
          />
          {errores.nombre_completo && (
            <div className="invalid-feedback">{errores.nombre_completo}</div>
          )}
        </div>

        {/* DUI */}
        <div className="col-md-6 mb-3">
          <label htmlFor="dui" className="form-label">
            DUI <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errores.dui ? 'is-invalid' : ''}`}
            id="dui"
            name="dui"
            value={formData.dui}
            onChange={handleChange}
            placeholder="12345678-9"
            maxLength={10}
            disabled={loading}
          />
          {errores.dui && (
            <div className="invalid-feedback">{errores.dui}</div>
          )}
          <div className="form-text">Formato: 12345678-9</div>
        </div>

        {/* Número de Licencia */}
        <div className="col-md-6 mb-3">
          <label htmlFor="numero_licencia" className="form-label">
            Número de Licencia <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errores.numero_licencia ? 'is-invalid' : ''}`}
            id="numero_licencia"
            name="numero_licencia"
            value={formData.numero_licencia}
            onChange={handleChange}
            placeholder="Ingrese el número de licencia"
            disabled={loading}
          />
          {errores.numero_licencia && (
            <div className="invalid-feedback">{errores.numero_licencia}</div>
          )}
        </div>

        {/* Tipo de Licencia */}
        <div className="col-md-6 mb-3">
          <label htmlFor="tipo_licencia" className="form-label">
            Tipo de Licencia <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errores.tipo_licencia ? 'is-invalid' : ''}`}
            id="tipo_licencia"
            name="tipo_licencia"
            value={formData.tipo_licencia}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Seleccione un tipo</option>
            <option value="Liviana">Liviana</option>
            <option value="Pesada">Pesada</option>
            <option value="Particular">Particular</option>
          </select>
          {errores.tipo_licencia && (
            <div className="invalid-feedback">{errores.tipo_licencia}</div>
          )}
        </div>

        {/* Teléfono */}
        <div className="col-md-6 mb-3">
          <label htmlFor="telefono" className="form-label">Teléfono</label>
          <input
            type="text"
            className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="1234-5678"
            maxLength={9}
            disabled={loading}
          />
          {errores.telefono && (
            <div className="invalid-feedback">{errores.telefono}</div>
          )}
          <div className="form-text">Formato: 1234-5678 (opcional)</div>
        </div>

        {/* Estado (solo para edición) */}
        {motorista && (
          <div className="col-md-6 mb-3">
            <label className="form-label">Estado</label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="activo">
                {formData.activo ? 'Activo' : 'Inactivo'}
              </label>
            </div>
          </div>
        )}

        {/* Dirección */}
        <div className="col-12 mb-3">
          <label htmlFor="direccion" className="form-label">Dirección</label>
          <textarea
            className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
            id="direccion"
            name="direccion"
            rows="3"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Ingrese la dirección completa"
            disabled={loading}
          />
          {errores.direccion && (
            <div className="invalid-feedback">{errores.direccion}</div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="d-flex gap-2 justify-content-end">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          <i className="fas fa-times me-1"></i>
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Guardando...
            </>
          ) : (
            <>
              <i className="fas fa-save me-1"></i>
              {motorista ? 'Actualizar' : 'Crear'} Motorista
            </>
          )}
        </button>
      </div>
    </form>
  );

  // Si es modal
  if (modoModal) {
    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-user-plus me-2"></i>
                {motorista ? 'Editar' : 'Nuevo'} Motorista
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
              ></button>
            </div>
            <div className="modal-body">
              {contenidoFormulario}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no es modal (página completa)
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-user-plus me-2"></i>
                  {motorista ? 'Editar' : 'Nuevo'} Motorista
                </h5>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={onClose}
                  disabled={loading}
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Volver
                </button>
              </div>
            </div>
            <div className="card-body">
              {contenidoFormulario}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container-fluid {
          padding: 1rem;
        }
        
        @media (max-width: 768px) {
          .container-fluid {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FormularioMotorista;