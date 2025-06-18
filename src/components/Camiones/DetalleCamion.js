import React from 'react';

const DetalleCamion = ({ mostrar, onClose, camion }) => {
    if (!mostrar || !camion) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-truck me-2"></i>
                            Detalles del Camión - {camion.numero_placa}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    <div className="modal-body">
                        <div className="row">
                            {/* Información básica */}
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Información Básica
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Número de Placa:</strong></td>
                                                    <td>
                                                        <span className="badge bg-primary fs-6">
                                                            {camion.numero_placa}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Estado:</strong></td>
                                                    <td>
                                                        <span className={`badge ${camion.activo ? 'bg-success' : 'bg-secondary'}`}>
                                                            {camion.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Fecha de Registro:</strong></td>
                                                    <td>{camion.fecha_creacion}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Última Actualización:</strong></td>
                                                    <td>{camion.fecha_actualizacion || 'N/A'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Asignación de ruta */}
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-route me-2"></i>
                                            Asignación de Ruta
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        {camion.numero_ruta ? (
                                            <div>
                                                <div className="alert alert-warning" role="alert">
                                                    <i className="fas fa-route me-2"></i>
                                                    <strong>Camión Asignado</strong>
                                                </div>
                                                
                                                <table className="table table-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td><strong>Número de Ruta:</strong></td>
                                                            <td>
                                                                <span className="badge bg-warning text-dark">
                                                                    {camion.numero_ruta}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Lugar de Recorrido:</strong></td>
                                                            <td>{camion.lugar_recorrido}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Grupo de Productos:</strong></td>
                                                            <td>
                                                                <span className={`badge ${
                                                                    camion.grupo_productos === 'Big Cola' 
                                                                        ? 'bg-danger' 
                                                                        : 'bg-info'
                                                                }`}>
                                                                    {camion.grupo_productos}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        {camion.motorista_asignado && (
                                                            <tr>
                                                                <td><strong>Motorista:</strong></td>
                                                                <td>{camion.motorista_asignado}</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="fas fa-parking fa-3x text-muted mb-3"></i>
                                                <h6 className="text-muted">Sin Asignación</h6>
                                                <p className="text-muted mb-0">
                                                    Este camión está disponible para ser asignado a una ruta
                                                </p>
                                                <div className="alert alert-info mt-3" role="alert">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    <strong>Disponible</strong> para asignación
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Galería de fotos */}
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-camera me-2"></i>
                                            Galería de Fotos
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            {[1, 2, 3].map(num => {
                                                const foto = camion[`foto${num}`];
                                                return (
                                                    <div key={num} className="col-md-4 mb-3">
                                                        <div className="card">
                                                            <div className="card-header text-center">
                                                                <small className="text-muted">Foto {num}</small>
                                                            </div>
                                                            {foto ? (
                                                                <div className="position-relative">
                                                                    <img
                                                                        src={`/api/uploads/camiones/${foto}`}
                                                                        alt={`Foto ${num} del camión ${camion.numero_placa}`}
                                                                        className="card-img-top"
                                                                        style={{ 
                                                                            height: '200px', 
                                                                            objectFit: 'cover',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        onClick={() => {
                                                                            // Abrir imagen en nueva ventana
                                                                            window.open(`/api/uploads/camiones/${foto}`, '_blank');
                                                                        }}
                                                                    />
                                                                    <div className="position-absolute top-0 end-0 p-2">
                                                                        <span className="badge bg-success">
                                                                            <i className="fas fa-check me-1"></i>
                                                                            Disponible
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    className="card-img-top d-flex align-items-center justify-content-center bg-light"
                                                                    style={{ height: '200px' }}
                                                                >
                                                                    <div className="text-center text-muted">
                                                                        <i className="fas fa-camera fa-3x mb-2"></i>
                                                                        <br />
                                                                        <small>Sin foto</small>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="row mt-3">
                                            <div className="col-12">
                                                <div className="alert alert-info" role="alert">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    <strong>Información:</strong> 
                                                    {[camion.foto1, camion.foto2, camion.foto3].filter(f => f).length} de 3 fotos cargadas.
                                                    {[camion.foto1, camion.foto2, camion.foto3].filter(f => f).length === 0 && 
                                                        " Las fotos no son obligatorias pero ayudan a identificar el camión."
                                                    }
                                                    Haz clic en las fotos para verlas en tamaño completo.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas de uso (simuladas por ahora) */}
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-chart-bar me-2"></i>
                                            Estadísticas de Uso
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row text-center">
                                            <div className="col-md-3">
                                                <div className="border rounded p-3">
                                                    <h4 className="text-primary mb-1">
                                                        {camion.numero_ruta ? '1' : '0'}
                                                    </h4>
                                                    <small className="text-muted">Rutas Asignadas</small>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="border rounded p-3">
                                                    <h4 className="text-success mb-1">0</h4>
                                                    <small className="text-muted">Despachos Realizados</small>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="border rounded p-3">
                                                    <h4 className="text-warning mb-1">
                                                        {camion.activo ? 'Activo' : 'Inactivo'}
                                                    </h4>
                                                    <small className="text-muted">Estado Actual</small>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="border rounded p-3">
                                                    <h4 className="text-info mb-1">
                                                        {[camion.foto1, camion.foto2, camion.foto3].filter(f => f).length}
                                                    </h4>
                                                    <small className="text-muted">Fotos Cargadas</small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <small className="text-muted">
                                                <i className="fas fa-info-circle me-1"></i>
                                                Las estadísticas de despachos se actualizarán cuando el módulo de despachos esté implementado.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            <i className="fas fa-times me-2"></i>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleCamion;