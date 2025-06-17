import React, { useState, useEffect } from 'react';
import { camionesAPI } from '../../utils/api';

const FormularioCamion = ({ show, onHide, camion, isEditing, onSuccess }) => {
    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        capacidad_carga: '',
        tipo_combustible: 'diesel',
        estado: 'activo',
        descripcion: ''
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing && camion) {
            setFormData({
                placa: camion.placa || '',
                marca: camion.marca || '',
                modelo: camion.modelo || '',
                anio: camion.anio || new Date().getFullYear(),
                capacidad_carga: camion.capacidad_carga || '',
                tipo_combustible: camion.tipo_combustible || 'diesel',
                estado: camion.estado || 'activo',
                descripcion: camion.descripcion || ''
            });
        } else {
            // Reset form for new camion
            setFormData({
                placa: '',
                marca: '',
                modelo: '',
                anio: new Date().getFullYear(),
                capacidad_carga: '',
                tipo_combustible: 'diesel',
                estado: 'activo',
                descripcion: ''
            });
        }
        setErrors({});
    }, [isEditing, camion, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Formatear placa automáticamente
        if (name === 'placa') {
            let formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (formattedValue.length > 3) {
                formattedValue = formattedValue.slice(0, 4) + '-' + formattedValue.slice(4, 7);
            }
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validar placa
        if (!formData.placa) {
            newErrors.placa = 'La placa es requerida';
        } else if (!/^[A-Z]{1,2}\d{3}-\d{3}$/.test(formData.placa)) {
            newErrors.placa = 'Formato de placa inválido (ej: P123-456)';
        }
        
        // Validar marca
        if (!formData.marca.trim()) {
            newErrors.marca = 'La marca es requerida';
        } else if (formData.marca.length < 2) {
            newErrors.marca = 'La marca debe tener al menos 2 caracteres';
        }
        
        // Validar modelo
        if (!formData.modelo.trim()) {
            newErrors.modelo = 'El modelo es requerido';
        } else if (formData.modelo.length < 2) {
            newErrors.modelo = 'El modelo debe tener al menos 2 caracteres';
        }
        
        // Validar año
        const currentYear = new Date().getFullYear();
        const anio = parseInt(formData.anio);
        if (!anio) {
            newErrors.anio = 'El año es requerido';
        } else if (anio < 1990 || anio > currentYear + 1) {
            newErrors.anio = `El año debe estar entre 1990 y ${currentYear + 1}`;
        }
        
        // Validar capacidad de carga
        const capacidad = parseFloat(formData.capacidad_carga);
        if (!formData.capacidad_carga) {
            newErrors.capacidad_carga = 'La capacidad de carga es requerida';
        } else if (isNaN(capacidad) || capacidad <= 0) {
            newErrors.capacidad_carga = 'La capacidad debe ser un número mayor a 0';
        } else if (capacidad > 50) {
            newErrors.capacidad_carga = 'La capacidad máxima es 50 toneladas';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            let response;
            if (isEditing) {
                response = await camionesAPI.editar(camion.id, formData);
            } else {
                response = await camionesAPI.crear(formData);
            }
            
            if (response.success) {
                // Toast notification
                if (window.bootstrap) {
                    const toast = new window.bootstrap.Toast(document.getElementById('successToast'));
                    document.getElementById('toastMessage').textContent = response.message;
                    toast.show();
                }
                onSuccess();
            } else {
                setErrors({ general: response.message || 'Error al procesar la solicitud' });
            }
        } catch (error) {
            console.error('Error:', error);
            setErrors({ general: 'Error de conexión. Intente nuevamente.' });
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-truck me-2"></i>
                            {isEditing ? 'Editar Camión' : 'Nuevo Camión'}
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onHide}
                            disabled={loading}
                        ></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {errors.general && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.general}
                                </div>
                            )}

                            <div className="row g-3">
                                {/* Placa */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Placa <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.placa ? 'is-invalid' : ''}`}
                                        name="placa"
                                        value={formData.placa}
                                        onChange={handleChange}
                                        placeholder="P123-456"
                                        maxLength="8"
                                        disabled={loading}
                                    />
                                    {errors.placa && (
                                        <div className="invalid-feedback">{errors.placa}</div>
                                    )}
                                    <div className="form-text">
                                        Formato: P123-456 (se formatea automáticamente)
                                    </div>
                                </div>

                                {/* Estado */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Estado <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${errors.estado ? 'is-invalid' : ''}`}
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="mantenimiento">En Mantenimiento</option>
                                        <option value="reparacion">En Reparación</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                    {errors.estado && (
                                        <div className="invalid-feedback">{errors.estado}</div>
                                    )}
                                </div>

                                {/* Marca */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Marca <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.marca ? 'is-invalid' : ''}`}
                                        name="marca"
                                        value={formData.marca}
                                        onChange={handleChange}
                                        placeholder="Ford, Chevrolet, Toyota..."
                                        disabled={loading}
                                    />
                                    {errors.marca && (
                                        <div className="invalid-feedback">{errors.marca}</div>
                                    )}
                                </div>

                                {/* Modelo */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Modelo <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.modelo ? 'is-invalid' : ''}`}
                                        name="modelo"
                                        value={formData.modelo}
                                        onChange={handleChange}
                                        placeholder="F-150, NPR, Hilux..."
                                        disabled={loading}
                                    />
                                    {errors.modelo && (
                                        <div className="invalid-feedback">{errors.modelo}</div>
                                    )}
                                </div>

                                {/* Año */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Año <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.anio ? 'is-invalid' : ''}`}
                                        name="anio"
                                        value={formData.anio}
                                        onChange={handleChange}
                                        min="1990"
                                        max={new Date().getFullYear() + 1}
                                        disabled={loading}
                                    />
                                    {errors.anio && (
                                        <div className="invalid-feedback">{errors.anio}</div>
                                    )}
                                </div>

                                {/* Capacidad de Carga */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Capacidad de Carga (Toneladas) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.capacidad_carga ? 'is-invalid' : ''}`}
                                        name="capacidad_carga"
                                        value={formData.capacidad_carga}
                                        onChange={handleChange}
                                        step="0.1"
                                        min="0.1"
                                        max="50"
                                        placeholder="3.5"
                                        disabled={loading}
                                    />
                                    {errors.capacidad_carga && (
                                        <div className="invalid-feedback">{errors.capacidad_carga}</div>
                                    )}
                                    <div className="form-text">
                                        Capacidad máxima: 50 toneladas
                                    </div>
                                </div>

                                {/* Tipo de Combustible */}
                                <div className="col-12">
                                    <label className="form-label">
                                        Tipo de Combustible <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${errors.tipo_combustible ? 'is-invalid' : ''}`}
                                        name="tipo_combustible"
                                        value={formData.tipo_combustible}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="diesel">Diésel</option>
                                        <option value="gasolina">Gasolina</option>
                                        <option value="gas_natural">Gas Natural</option>
                                        <option value="electrico">Eléctrico</option>
                                        <option value="hibrido">Híbrido</option>
                                    </select>
                                    {errors.tipo_combustible && (
                                        <div className="invalid-feedback">{errors.tipo_combustible}</div>
                                    )}
                                </div>

                                {/* Descripción */}
                                <div className="col-12">
                                    <label className="form-label">Descripción / Observaciones</label>
                                    <textarea
                                        className="form-control"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Información adicional sobre el camión..."
                                        disabled={loading}
                                    ></textarea>
                                    <div className="form-text">
                                        Opcional: Información adicional, observaciones, etc.
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onHide}
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
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save me-2"></i>
                                        {isEditing ? 'Actualizar' : 'Crear'} Camión
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