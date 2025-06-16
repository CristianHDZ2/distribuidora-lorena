import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const DetalleUsuario = ({ usuarioId, onClose, onEdit }) => {
    const { token } = useAuth();
    const [usuario, setUsuario] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [actividadReciente, setActividadReciente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Cargar datos del usuario
    useEffect(() => {
        cargarDatosUsuario();
    }, [usuarioId]);

    const cargarDatosUsuario = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`/api/usuarios/obtener_usuario.php?id=${usuarioId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al cargar datos del usuario');
            }
            
            const data = await response.json();
            
            if (data.success) {
                setUsuario(data.usuario);
                setEstadisticas(data.estadisticas);
                setActividadReciente(data.actividad_reciente || []);
            } else {
                throw new Error(data.error || 'Error al cargar datos');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Obtener clase de badge para estado
    const getBadgeEstado = (estado) => {
        return estado === 'activo' ? 'badge bg-success' : 'badge bg-secondary';
    };

    // Obtener clase de badge para tipo de usuario
    const getBadgeTipo = (tipo) => {
        return tipo === 'administrador' ? 'badge bg-primary' : 'badge bg-info';
    };

    // Obtener clase para estado de conexión
    const getBadgeConexion = (estadoConexion) => {
        switch (estadoConexion) {
            case 'En línea':
                return 'badge bg-success';
            case 'Hoy':
                return 'badge bg-warning';
            case 'Esta semana':
                return 'badge bg-info';
            default:
                return 'badge bg-secondary';
        }
    };

    // Obtener icono para tipo de actividad
    const getIconoActividad = (tipo) => {
        switch (tipo) {
            case 'despacho':
                return 'fas fa-truck text-primary';
            case 'inventario':
                return 'fas fa-boxes text-success';
            default:
                return 'fas fa-circle text-muted';
        }
    };

    if (loading) {
        return (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-body text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-3 text-muted">Cargando datos del usuario...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Error</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="alert alert-danger">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-user me-2"></i>
                            Detalles del Usuario
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="row">
                            {/* Información principal */}
                            <div className="col-md-4">
                                <div className="card h-100">
                                    <div className="card-body text-center">
                                        {/* Foto de perfil */}
                                        <div className="mb-3">
                                            {usuario.foto_perfil ? (
                                                <img
                                                    src={`/api/uploads/usuarios/${usuario.foto_perfil}`}
                                                    alt={usuario.nombre_completo}
                                                    className="rounded-circle"
                                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div 
                                                    className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white mx-auto"
                                                    style={{ width: '120px', height: '120px' }}
                                                >
                                                    <i className="fas fa-user fa-3x"></i>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Información básica */}
                                        <h4 className="mb-2">{usuario.nombre_completo}</h4>
                                        <div className="mb-2">
                                            <span className={getBadgeTipo(usuario.tipo_usuario)}>
                                                {usuario.tipo_usuario === 'administrador' ? 'Administrador' : 'Despachador'}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <span className={getBadgeEstado(usuario.estado)}>
                                                {usuario.estado}
                                            </span>
                                        </div>
                                        
                                        {/* Estado de conexión */}
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Estado de conexión</small>
                                            <span className={getBadgeConexion(usuario.estado_conexion)}>
                                                {usuario.estado_conexion}
                                            </span>
                                        </div>
                                        
                                        {/* Botón de editar */}
                                        <button
                                            className="btn btn-primary"
                                            onClick={onEdit}
                                        >
                                            <i className="fas fa-edit me-2"></i>
                                            Editar Usuario
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Información de contacto y detalles */}
                            <div className="col-md-4">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-address-card me-2"></i>
                                            Información de Contacto
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label text-muted small">DUI</label>
                                            <div className="fw-bold">
                                                <code>{usuario.dui}</code>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="form-label text-muted small">Email</label>
                                            <div>
                                                <i className="fas fa-envelope me-2 text-muted"></i>
                                                <a href={`mailto:${usuario.email}`} className="text-decoration-none">
                                                    {usuario.email}
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="form-label text-muted small">Teléfono</label>
                                            <div>
                                                <i className="fas fa-phone me-2 text-muted"></i>
                                                <a href={`tel:${usuario.telefono}`} className="text-decoration-none">
                                                    {usuario.telefono}
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <hr />
                                        
                                        <div className="mb-3">
                                            <label className="form-label text-muted small">Fecha de creación</label>
                                            <div>
                                                <i className="fas fa-calendar-plus me-2 text-muted"></i>
                                                {usuario.fecha_creacion_formato}
                                            </div>
                                        </div>
                                        
                                        {usuario.fecha_modificacion_formato && (
                                            <div className="mb-3">
                                                <label className="form-label text-muted small">Última modificación</label>
                                                <div>
                                                    <i className="fas fa-calendar-edit me-2 text-muted"></i>
                                                    {usuario.fecha_modificacion_formato}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {usuario.ultimo_acceso_formato && (
                                            <div className="mb-3">
                                                <label className="form-label text-muted small">Último acceso</label>
                                                <div>
                                                    <i className="fas fa-sign-in-alt me-2 text-muted"></i>
                                                    {usuario.ultimo_acceso_formato}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {usuario.creado_por_nombre && (
                                            <div className="mb-3">
                                                <label className="form-label text-muted small">Creado por</label>
                                                <div>
                                                    <i className="fas fa-user-plus me-2 text-muted"></i>
                                                    {usuario.creado_por_nombre}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Estadísticas y actividad */}
                            <div className="col-md-4">
                                {/* Estadísticas (solo para despachadores) */}
                                {estadisticas && usuario.tipo_usuario === 'despachador' && (
                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h6 className="mb-0">
                                                <i className="fas fa-chart-bar me-2"></i>
                                                Estadísticas
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <div className="text-center p-2 bg-light rounded">
                                                        <div className="h5 mb-0 text-primary">{estadisticas.total_despachos}</div>
                                                        <small className="text-muted">Total Despachos</small>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="text-center p-2 bg-light rounded">
                                                        <div className="h5 mb-0 text-success">{estadisticas.despachos_completados}</div>
                                                        <small className="text-muted">Completados</small>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="text-center p-2 bg-light rounded">
                                                        <div className="h5 mb-0 text-info">{estadisticas.despachos_hoy}</div>
                                                        <small className="text-muted">Hoy</small>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="text-center p-2 bg-light rounded">
                                                        <div className="h5 mb-0 text-warning">{estadisticas.despachos_semana}</div>
                                                        <small className="text-muted">Esta Semana</small>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <hr />
                                            
                                            <div className="mb-2">
                                                <small className="text-muted">Ventas totales</small>
                                                <div className="h5 text-success mb-0">
                                                    ${parseFloat(estadisticas.ventas_totales || 0).toFixed(2)}
                                                </div>
                                            </div>
                                            
                                            <div className="mb-2">
                                                <small className="text-muted">Promedio por despacho</small>
                                                <div className="h6 text-info mb-0">
                                                    ${parseFloat(estadisticas.promedio_venta || 0).toFixed(2)}
                                                </div>
                                            </div>
                                            
                                            {estadisticas.ultimo_despacho_formato && (
                                                <div>
                                                    <small className="text-muted">Último despacho</small>
                                                    <div className="small">
                                                        {estadisticas.ultimo_despacho_formato}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Actividad reciente */}
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-clock me-2"></i>
                                            Actividad Reciente
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        {actividadReciente.length > 0 ? (
                                            <div className="timeline">
                                                {actividadReciente.map((actividad, index) => (
                                                    <div key={index} className="d-flex mb-3">
                                                        <div className="me-3">
                                                            <i className={getIconoActividad(actividad.tipo)}></i>
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div className="small fw-bold">
                                                                {actividad.descripcion}
                                                            </div>
                                                            <div className="small text-muted">
                                                                {actividad.fecha_formato}
                                                            </div>
                                                            {actividad.estado && (
                                                                <span className={`badge ${
                                                                    actividad.estado === 'completado' ? 'bg-success' : 
                                                                    actividad.estado === 'pendiente' ? 'bg-warning' : 'bg-secondary'
                                                                } badge-sm`}>
                                                                    {actividad.estado}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-3">
                                                <i className="fas fa-clock fa-2x mb-2"></i>
                                                <p className="mb-0">No hay actividad reciente</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cerrar
                        </button>
                        <button type="button" className="btn btn-primary" onClick={onEdit}>
                            <i className="fas fa-edit me-2"></i>
                            Editar Usuario
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleUsuario;