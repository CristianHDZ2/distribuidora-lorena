import React, { useState, useEffect } from 'react';
import { camionesAPI } from '../../utils/api';

const FormularioCamion = ({ mostrar, onClose, onSuccess, camion, modoEdicion }) => {
    const [formData, setFormData] = useState({
        numero_placa: '',
        activo: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (modoEdicion && camion) {
            setFormData({
                numero_placa: camion.numero_placa || '',
                activo: camion.activo || true
            });
        } else {
            setFormData({
                numero_placa: '',
                activo: true
            });
        }
        setError('');
        setErrores({});
    }, [modoEdicion, camion, mostrar]);

    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validar número de placa
        if (!formData.numero_placa.trim()) {
            nuevosErrores.numero_placa = 'El número de placa es obligatorio';
        } else if (!/^[A-Z0-9\-]{1,10}$/.test(formData.numero_placa.toUpperCase())) {
            nuevosErrores.numero_placa = 'Formato de placa inválido (solo letras, números y guiones)';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value.toUpperCase()
        }));

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errores[name]) {
            setErrores(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            let response;
            
            if (modoEdicion) {
                response = await camionesAPI.editar(camion.id, formData);
            } else {
                response = await camionesAPI.crear(formData);
            }

            if (response.success) {
                onSuccess(response.message);
            }
        } catch (error) {
            console.error('Error al guardar camión:', error);
            setError(error.response?.data?.error || 'Error al guardar el camión');
        } finally {
            setLoading(false);
        }
    };

    const formatearPlaca = (valor) => {
        // Convertir a mayúsculas y eliminar caracteres no válidos
        let placaLimpia = valor.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
        
        // Limitar longitud
        if (placaLimpia.length > 10) {
            placaLimpia = placaLimpia.substring(0, 10);
        }
        
        return placaLimpia;
    };

    const handlePlacaChange = (e) => {
        const placaFormateada = formatearPlaca(e.target.value);
        setFormData(prev => ({
            ...prev,
            numero_placa: placaFormateada
        }));

        // Limpiar error si existe
        if (errores.numero_placa) {
            setErrores(prev => ({
                ...prev,
                numero_placa: ''
            }));
        }
    };

    if (!mostrar) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-truck me-2"></i>
                            {modoEdicion ? 'Editar Camión' : 'Nuevo Camión'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={loading}
                        ></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            <div className="row">
                                <div className="col-md-8">
                                    <div className="mb-3">
                                        <label htmlFor="numero_placa" className="form-label">
                                            Número de Placa <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errores.numero_placa ? 'is-invalid' : ''}`}
                                            id="numero_placa"
                                            name="numero_placa"
                                            value={formData.numero_placa}
                                            onChange={handlePlacaChange}
                                            placeholder="Ejemplo: P001-2024"
                                            maxLength="10"
                                            disabled={loading}
                                            autoFocus
                                        />
                                        {errores.numero_placa && (
                                            <div className="invalid-feedback">
                                                {errores.numero_placa}
                                            </div>
                                        )}
                                        <div className="form-text">
                                            Formato: Solo letras, números y guiones. Máximo 10 caracteres.
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="mb-3">
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
                                        <div className="form-text">
                                            Solo los camiones activos pueden ser asignados a rutas
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información adicional para modo edición */}
                            {modoEdicion && camion && (
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <h6 className="text-muted mb-3">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Información Adicional
                                        </h6>
                                        
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="card bg-light">
                                                    <div className="card-body">
                                                        <h6 className="card-title">Fotos del Camión</h6>
                                                        <p className="card-text">
                                                            <strong>
                                                                {[camion.foto1, camion.foto2, camion.foto3].filter(f => f).length} de 3 fotos
                                                            </strong>
                                                        </p>
                                                        <small className="text-muted">
                                                            Gestiona las fotos desde la lista principal
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <div className="card bg-light">
                                                    <div className="card-body">
                                                        <h6 className="card-title">Asignación</h6>
                                                        {camion.numero_ruta ? (
                                                            <div>
                                                                <p className="card-text mb-1">
                                                                    <strong>Ruta:</strong> {camion.numero_ruta}
                                                                </p>
                                                                <p className="card-text mb-1">
                                                                    <strong>Grupo:</strong> {camion.grupo_productos}
                                                                </p>
                                                                <small className="text-warning">
                                                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                                                    Camión asignado a ruta activa
                                                                </small>
                                                            </div>
                                                        ) : (
                                                            <p className="card-text text-muted">
                                                                Sin asignación de ruta
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="row mt-3">
                                            <div className="col-md-6">
                                                <small className="text-muted">
                                                    <strong>Registrado:</strong> {camion.fecha_creacion}
                                                </small>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted">
                                                    <strong>Última actualización:</strong> {camion.fecha_actualizacion || 'N/A'}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Advertencias */}
                            {modoEdicion && !formData.activo && (
                                <div className="alert alert-warning mt-3" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <strong>Advertencia:</strong> Al desactivar este camión, no podrá ser asignado a nuevas rutas.
                                    Si está asignado actualmente, la asignación se mantendrá hasta que sea removida manualmente.
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
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
                                        {modoEdicion ? 'Actualizando...' : 'Creando...'}
                                    </>
                                ) : (
                                    <>
                                        <i className={`fas ${modoEdicion ? 'fa-save' : 'fa-plus'} me-2`}></i>
                                        {modoEdicion ? 'Actualizar Camión' : 'Crear Camión'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormularioCamion;