import React, { useState, useEffect } from 'react';
import { rutasAPI } from '../../utils/api';

const FormularioRuta = ({ 
  ruta = null, 
  recursosDisponibles = { camiones: [], motoristas: [] },
  onClose, 
  onGuardado, 
  modoModal = true 
}) => {
  const [formData, setFormData] = useState({
    numero_ruta: '',
    lugar_recorrido: '',
    grupo_productos: 'Big Cola',
    camion_id: '',
    motorista_id: '',
    observaciones: '',
    activa: true
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [camionesDisponibles, setCamionesDisponibles] = useState([]);
  const [motoristasDisponibles, setMotoristasDisponibles] = useState([]);

  // Llenar formulario si se está editando
  useEffect(() => {
    if (ruta) {
      setFormData({
        numero_ruta: ruta.numero_ruta || '',
        lugar_recorrido: ruta.lugar_recorrido || '',
        grupo_productos: ruta.grupo_productos || 'Big Cola',
        camion_id: ruta.camion_id || '',
        motorista_id: ruta.motorista_id || '',
        observaciones: ruta.observaciones || '',
        activa: ruta.activa !== undefined ? ruta.activa : true
      });
    }
  }, [ruta]);

  // Actualizar recursos disponibles
  useEffect(() => {
    let camionesParaSelect = [...(recursosDisponibles.camiones || [])];
    let motoristasParaSelect = [...(recursosDisponibles.motoristas || [])];

    // Si estamos editando, agregar el camión y motorista actual a las opciones
    if (ruta) {
      // Agregar camión actual si no está en la lista
      const camionActual = camionesParaSelect.find(c => c.id === ruta.camion_id);
      if (!camionActual) {
        camionesParaSelect.unshift({
          id: ruta.camion_id,
          numero_placa: ruta.camion_placa
        });
      }

      // Agregar motorista actual si no está en la lista
      const motoristaActual = motoristasParaSelect.find(m => m.id === ruta.motorista_id);
      if (!motoristaActual) {
        motoristasParaSelect.unshift({
          id: ruta.motorista_id,
          nombre_completo: ruta.motorista_nombre,
          dui: ruta.motorista_dui,
          tipo_licencia: ruta.motorista_tipo_licencia
        });
      }
    }

    setCamionesDisponibles(camionesParaSelect);
    setMotoristasDisponibles(motoristasParaSelect);
  }, [recursosDisponibles, ruta]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

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

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar número de ruta
    if (!formData.numero_ruta.trim()) {
      nuevosErrores.numero_ruta = 'El número de ruta es requerido';
    } else if (formData.numero_ruta.trim().length < 2) {
      nuevosErrores.numero_ruta = 'El número de ruta debe tener al menos 2 caracteres';
    }

    // Validar lugar de recorrido
    if (!formData.lugar_recorrido.trim()) {
      nuevosErrores.lugar_recorrido = 'El lugar de recorrido es requerido';
    } else if (formData.lugar_recorrido.trim().length < 5) {
      nuevosErrores.lugar_recorrido = 'El lugar de recorrido debe tener al menos 5 caracteres';
    }

    // Validar grupo de productos
    if (!formData.grupo_productos) {
      nuevosErrores.grupo_productos = 'El grupo de productos es requerido';
    }

    // Validar camión
    if (!formData.camion_id) {
      nuevosErrores.camion_id = 'Debe seleccionar un camión';
    }

    // Validar motorista
    if (!formData.motorista_id) {
      nuevosErrores.motorista_id = 'Debe seleccionar un motorista';
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
      // Convertir IDs a números
      const dataToSend = {
        ...formData,
        camion_id: parseInt(formData.camion_id),
        motorista_id: parseInt(formData.motorista_id)
      };

      if (ruta) {
        // Editar ruta existente
        await rutasAPI.editar(ruta.id, dataToSend);
      } else {
        // Crear nueva ruta
        await rutasAPI.crear(dataToSend);
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
      console.error('Error al guardar ruta:', error);
      // Aquí iría el toast de error
      if (error.response?.data?.error) {
        setErrores({ general: error.response.data.error });
      } else {
        setErrores({ general: 'Error al guardar la ruta' });
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
        {/* Número de Ruta */}
        <div className="col-md-6 mb-3">
          <label htmlFor="numero_ruta" className="form-label">
            Número de Ruta <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errores.numero_ruta ? 'is-invalid' : ''}`}
            id="numero_ruta"
            name="numero_ruta"
            value={formData.numero_ruta}
            onChange={handleChange}
            placeholder="Ej: R001, Ruta-A, etc."
            disabled={loading}
          />
          {errores.numero_ruta && (
            <div className="invalid-feedback">{errores.numero_ruta}</div>
          )}
          <div className="form-text">Identificador único de la ruta</div>
        </div>

        {/* Grupo de Productos */}
        <div className="col-md-6 mb-3">
          <label htmlFor="grupo_productos" className="form-label">
            Grupo de Productos <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errores.grupo_productos ? 'is-invalid' : ''}`}
            id="grupo_productos"
            name="grupo_productos"
            value={formData.grupo_productos}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Seleccione un grupo</option>
            <option value="Big Cola">Big Cola</option>
            <option value="Otros Productos">Otros Productos</option>
          </select>
          {errores.grupo_productos && (
            <div className="invalid-feedback">{errores.grupo_productos}</div>
          )}
        </div>

        {/* Lugar de Recorrido */}
        <div className="col-12 mb-3">
          <label htmlFor="lugar_recorrido" className="form-label">
            Lugar de Recorrido <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errores.lugar_recorrido ? 'is-invalid' : ''}`}
            id="lugar_recorrido"
            name="lugar_recorrido"
            value={formData.lugar_recorrido}
            onChange={handleChange}
            placeholder="Ej: San Salvador - Santa Ana - Ahuachapán"
            disabled={loading}
          />
          {errores.lugar_recorrido && (
            <div className="invalid-feedback">{errores.lugar_recorrido}</div>
          )}
          <div className="form-text">Descripción del recorrido o lugares que visita la ruta</div>
        </div>

        {/* Camión Asignado */}
        <div className="col-md-6 mb-3">
          <label htmlFor="camion_id" className="form-label">
            Camión Asignado <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errores.camion_id ? 'is-invalid' : ''}`}
            id="camion_id"
            name="camion_id"
            value={formData.camion_id}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Seleccione un camión</option>
            {camionesDisponibles.map((camion) => (
              <option key={camion.id} value={camion.id}>
                {camion.numero_placa}
              </option>
            ))}
          </select>
          {errores.camion_id && (
            <div className="invalid-feedback">{errores.camion_id}</div>
          )}
          {camionesDisponibles.length === 0 && (
            <div className="form-text text-warning">
              <i className="fas fa-exclamation-triangle me-1"></i>
              No hay camiones disponibles
            </div>
          )}
        </div>

        {/* Motorista Asignado */}
        <div className="col-md-6 mb-3">
          <label htmlFor="motorista_id" className="form-label">
            Motorista Asignado <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errores.motorista_id ? 'is-invalid' : ''}`}
            id="motorista_id"
            name="motorista_id"
            value={formData.motorista_id}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Seleccione un motorista</option>
            {motoristasDisponibles.map((motorista) => (
              <option key={motorista.id} value={motorista.id}>
                {motorista.nombre_completo} ({motorista.dui}) - {motorista.tipo_licencia}
              </option>
            ))}
          </select>
          {errores.motorista_id && (
            <div className="invalid-feedback">{errores.motorista_id}</div>
          )}
          {motoristasDisponibles.length === 0 && (
            <div className="form-text text-warning">
              <i className="fas fa-exclamation-triangle me-1"></i>
              No hay motoristas disponibles
            </div>
          )}
        </div>

        {/* Estado (solo para edición) */}
        {ruta && (
          <div className="col-12 mb-3">
            <div className="card bg-light">
              <div className="card-body">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="activa"
                    name="activa"
                    checked={formData.activa}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="activa">
                    <strong>Ruta {formData.activa ? 'Activa' : 'Inactiva'}</strong>
                  </label>
                  <div className="form-text">
                    {formData.activa 
                      ? 'La ruta está activa y puede recibir despachos' 
                      : 'La ruta está inactiva y no puede recibir despachos'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observaciones */}
        <div className="col-12 mb-3">
          <label htmlFor="observaciones" className="form-label">Observaciones</label>
          <textarea
            className={`form-control ${errores.observaciones ? 'is-invalid' : ''}`}
            id="observaciones"
            name="observaciones"
            rows="3"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Notas adicionales sobre la ruta (opcional)"
            disabled={loading}
          />
          {errores.observaciones && (
            <div className="invalid-feedback">{errores.observaciones}</div>
          )}
        </div>
      </div>

      {/* Información de Recursos Seleccionados */}
      {(formData.camion_id || formData.motorista_id) && (
        <div className="card bg-info bg-opacity-10 mb-3">
          <div className="card-body">
            <h6 className="card-title">
              <i className="fas fa-info-circle me-2"></i>
              Recursos Asignados
            </h6>
            <div className="row">
              {formData.camion_id && (
                <div className="col-md-6">
                  <strong>Camión:</strong> {
                    camionesDisponibles.find(c => c.id == formData.camion_id)?.numero_placa || 'Seleccionado'
                  }
                </div>
              )}
              {formData.motorista_id && (
                <div className="col-md-6">
                  <strong>Motorista:</strong> {
                    motoristasDisponibles.find(m => m.id == formData.motorista_id)?.nombre_completo || 'Seleccionado'
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          disabled={loading || camionesDisponibles.length === 0 || motoristasDisponibles.length === 0}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Guardando...
            </>
          ) : (
            <>
              <i className="fas fa-save me-1"></i>
              {ruta ? 'Actualizar' : 'Crear'} Ruta
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
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-route me-2"></i>
                {ruta ? 'Editar' : 'Nueva'} Ruta
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
                  <i className="fas fa-route me-2"></i>
                  {ruta ? 'Editar' : 'Nueva'} Ruta
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

export default FormularioRuta;