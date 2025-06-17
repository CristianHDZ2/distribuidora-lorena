// src/components/Camiones/DetalleCamion.js
import React from 'react';

const DetalleCamion = ({ show, onHide, camion, onEdit }) => {
    if (!show || !camion) return null;

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'activo':
                return 'badge bg-success';
            case 'inactivo':
                return 'badge bg-secondary';
            case 'en_reparacion':
                return 'badge bg-warning text-dark';
            default:
                return 'badge bg-secondary';
        }
    };

    const getEstadoText = (estado) => {
        switch (estado) {
            case 'activo':
                return 'Activo';
            case 'inactivo':
                return 'Inactivo';
            case 'en_reparacion':
                return 'En Reparación';
            default:
                return 'Desconocido';
        }
    };

    const getTipoCombustibleText = (tipo) => {
        switch (tipo) {
            case 'diesel':
                return 'Diésel';
            case 'gasolina':
                return 'Gasolina';
            case 'gas_natural':
                return 'Gas Natural';
            case 'electrico':
                return 'Eléctrico';
            case 'hibrido':
                return 'Híbrido';
            default:
                return tipo || 'No especificado';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-truck me-2"></i>
                            Detalles del Camión
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onHide}
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="row">
                            {/* Información principal */}
                            <div className="col-md-6">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-header bg-primary text-white">
                                        <h6 className="mb-0">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Información General
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Placa:</label>
                                            <p className="mb-1 fs-5 text-primary fw-bold">{camion.placa}</p>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Estado:</label>
                                            <div>
                                                <span className={getEstadoBadge(camion.estado)}>
                                                    {getEstadoText(camion.estado)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Marca:</label>
                                            <p className="mb-1">{camion.marca}</p>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Modelo:</label>
                                            <p className="mb-1">{camion.modelo}</p>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Año:</label>
                                            <p className="mb-1">{camion.anio}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Especificaciones técnicas */}
                            <div className="col-md-6">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-header bg-success text-white">
                                        <h6 className="mb-0">
                                            <i className="fas fa-cogs me-2"></i>
                                            Especificaciones Técnicas
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Capacidad de Carga:</label>
                                            <p className="mb-1">
                                                <span className="fs-5 text-success fw-bold">
                                                    {camion.capacidad_carga} Toneladas
                                                </span>
                                            </p>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Tipo de Combustible:</label>
                                            <p className="mb-1">{getTipoCombustibleText(camion.tipo_combustible)}</p>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">ID del Sistema:</label>
                                            <p className="mb-1 text-muted">#{camion.id}</p>
                                        </div>
                                        
                                        {camion.created_at && (
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Fecha de Registro:</label>
                                                <p className="mb-1 small text-muted">
                                                    {formatDate(camion.created_at)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        {camion.descripcion && (
                            <div className="row mt-3">
                                <div className="col-12">
                                    <div className="card border-0 bg-light">
                                        <div className="card-header bg-info text-white">
                                            <h6 className="mb-0">
                                                <i className="fas fa-file-alt me-2"></i>
                                                Descripción / Observaciones
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <p className="mb-0">{camion.descripcion}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estadísticas adicionales (si están disponibles) */}
                        {(camion.total_despachos || camion.ultima_actividad) && (
                            <div className="row mt-3">
                                <div className="col-12">
                                    <div className="card border-0 bg-light">
                                        <div className="card-header bg-warning text-dark">
                                            <h6 className="mb-0">
                                                <i className="fas fa-chart-bar me-2"></i>
                                                Estadísticas de Uso
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                {camion.total_despachos && (
                                                    <div className="col-md-6">
                                                        <div className="text-center">
                                                            <h4 className="text-primary mb-1">{camion.total_despachos}</h4>
                                                            <small className="text-muted">Despachos Realizados</small>
                                                        </div>
                                                    </div>
                                                )}
                                                {camion.ultima_actividad && (
                                                    <div className="col-md-6">
                                                        <div className="text-center">
                                                            <p className="mb-1 small">
                                                                <strong>Última Actividad:</strong>
                                                            </p>
                                                            <p className="text-muted small">
                                                                {formatDate(camion.ultima_actividad)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onHide}
                        >
                            <i className="fas fa-times me-2"></i>
                            Cerrar
                        </button>
                        {onEdit && (
                            <button 
                                type="button" 
                                className="btn btn-warning" 
                                onClick={() => onEdit(camion)}
                            >
                                <i className="fas fa-edit me-2"></i>
                                Editar Camión
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleCamion;