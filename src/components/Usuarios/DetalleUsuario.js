import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth'; // Cambio aquí: import default

const DetalleUsuario = ({ usuarioId, onClose, onEdit }) => {
    const { user } = useAuth(); // Obtenemos el usuario actual también
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
            
            // Por ahora usamos datos simulados hasta que tengamos la API
            // const response = await fetch(`/api/usuarios/obtener_usuario.php?id=${usuarioId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     }
            // });
            
            // Datos simulados para desarrollo
            const usuariosSimulados = {
                1: {
                    id: 1,
                    dui: '12345678-9',
                    nombre_completo: 'Administrador Sistema',
                    email: 'admin@distribuidora.com',
                    telefono: '7777-7777',
                    tipo_usuario: 'administrador',
                    estado: 'activo',
                    fecha_creacion: '2024-01-15',
                    ultimo_acceso: '2024-06-16 10:30:00',
                    direccion: 'San Salvador, El Salvador',
                    fecha_nacimiento: '1985-05-15',
                    foto_perfil: null
                },
                2: {
                    id: 2,
                    dui: '98765432-1',
                    nombre_completo: 'Despachador Principal',
                    email: 'despachador@distribuidora.com',
                    telefono: '7888-8888',
                    tipo_usuario: 'despachador',
                    estado: 'activo',
                    fecha_creacion: '2024-02-01',
                    ultimo_acceso: '2024-06-16 09:15:00',
                    direccion: 'Santa Ana, El Salvador',
                    fecha_nacimiento: '1990-08-22',
                    foto_perfil: null
                },
                3: {
                    id: 3,
                    dui: '11111111-1',
                    nombre_completo: 'María García',
                    email: 'maria@distribuidora.com',
                    telefono: '7999-9999',
                    tipo_usuario: 'despachador',
                    estado: 'activo',
                    fecha_creacion: '2024-03-15',
                    ultimo_acceso: '2024-06-15 16:45:00',
                    direccion: 'La Libertad, El Salvador',
                    fecha_nacimiento: '1988-12-03',
                    foto_perfil: null
                }
            };

            const usuarioEncontrado = usuariosSimulados[usuarioId];
            if (usuarioEncontrado) {
                setUsuario(usuarioEncontrado);
                
                // Estadísticas simuladas
                setEstadisticas({
                    total_sesiones: 45,
                    tiempo_total_sesiones: '25:30:00',
                    ultima_actividad: usuarioEncontrado.ultimo_acceso,
                    despachos_realizados: usuarioEncontrado.tipo_usuario === 'despachador' ? 12 : 0,
                    rutas_asignadas: usuarioEncontrado.tipo_usuario === 'despachador' ? 3 : 0
                });

                // Actividad reciente simulada
                setActividadReciente([
                    {
                        id: 1,
                        accion: 'Inicio de sesión',
                        descripcion: 'Usuario inició sesión en el sistema',
                        fecha: '2024-06-16 10:30:00',
                        ip: '192.168.1.100'
                    },
                    {
                        id: 2,
                        accion: 'Consulta inventario',
                        descripcion: 'Consultó el inventario de productos',
                        fecha: '2024-06-16 10:15:00',
                        ip: '192.168.1.100'
                    },
                    {
                        id: 3,
                        accion: 'Cierre de sesión',
                        descripcion: 'Usuario cerró sesión correctamente',
                        fecha: '2024-06-15 17:45:00',
                        ip: '192.168.1.100'
                    }
                ]);
            } else {
                throw new Error('Usuario no encontrado');
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

    // Formatear fecha
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-SV');
    };

    // Formatear fecha y hora
    const formatearFechaHora = (fechaHora) => {
        return new Date(fechaHora).toLocaleString('es-SV');
    };

    if (loading) {
        return (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-body text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2">Cargando datos del usuario...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Error</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body text-center py-5">
                            <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                            <h5 className="text-danger">Error al cargar datos</h5>
                            <p className="text-muted">{error}</p>
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
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-user me-2"></i>
                            Detalles del Usuario
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        {usuario && (
                            <>
                                {/* Información básica */}
                                <div className="row mb-4">
                                    <div className="col-md-4 text-center">
                                        <div className="position-relative d-inline-block">
                                            {usuario.foto_perfil ? (
                                                <img
                                                    src={`/api/uploads/usuarios/${usuario.foto_perfil}`}
                                                    alt="Foto de perfil"
                                                    className="rounded-circle"
                                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                                    style={{ width: '120px', height: '120px' }}
                                                >
                                                    <i className="fas fa-user text-muted fs-1"></i>
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="mt-3 mb-1">{usuario.nombre_completo}</h4>
                                        <p className="text-muted mb-2">{usuario.email}</p>
                                        <div className="d-flex justify-content-center gap-2">
                                            <span className={getBadgeTipo(usuario.tipo_usuario)}>
                                                {usuario.tipo_usuario}
                                            </span>
                                            <span className={getBadgeEstado(usuario.estado)}>
                                                {usuario.estado}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-8">
                                        <div className="row">
                                            <div className="col-sm-6 mb-3">
                                                <label className="form-label text-muted small">DUI</label>
                                                <p className="mb-0 fw-medium">{usuario.dui}</p>
                                            </div>
                                            <div className="col-sm-6 mb-3">
                                                <label className="form-label text-muted small">Teléfono</label>
                                                <p className="mb-0 fw-medium">{usuario.telefono}</p>
                                            </div>
                                            <div className="col-sm-6 mb-3">
                                                <label className="form-label text-muted small">Fecha de Creación</label>
                                                <p className="mb-0 fw-medium">{formatearFecha(usuario.fecha_creacion)}</p>
                                            </div>
                                            <div className="col-sm-6 mb-3">
                                                <label className="form-label text-muted small">Último Acceso</label>
                                                <p className="mb-0 fw-medium">{formatearFechaHora(usuario.ultimo_acceso)}</p>
                                            </div>
                                            {usuario.direccion && (
                                                <div className="col-12 mb-3">
                                                    <label className="form-label text-muted small">Dirección</label>
                                                    <p className="mb-0 fw-medium">{usuario.direccion}</p>
                                                </div>
                                            )}
                                            {usuario.fecha_nacimiento && (
                                                <div className="col-sm-6 mb-3">
                                                    <label className="form-label text-muted small">Fecha de Nacimiento</label>
                                                    <p className="mb-0 fw-medium">{formatearFecha(usuario.fecha_nacimiento)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Estadísticas */}
                                {estadisticas && (
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <h6 className="border-bottom pb-2 mb-3">
                                                <i className="fas fa-chart-bar me-2"></i>
                                                Estadísticas de Uso
                                            </h6>
                                            <div className="row">
                                                <div className="col-md-3 col-sm-6 mb-3">
                                                    <div className="card text-center border-0 bg-light">
                                                        <div className="card-body py-3">
                                                            <i className="fas fa-sign-in-alt text-primary fs-4 mb-2"></i>
                                                            <h5 className="mb-1">{estadisticas.total_sesiones}</h5>
                                                            <small className="text-muted">Total Sesiones</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-sm-6 mb-3">
                                                    <div className="card text-center border-0 bg-light">
                                                        <div className="card-body py-3">
                                                            <i className="fas fa-clock text-info fs-4 mb-2"></i>
                                                            <h5 className="mb-1">{estadisticas.tiempo_total_sesiones}</h5>
                                                            <small className="text-muted">Tiempo Total</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                {usuario.tipo_usuario === 'despachador' && (
                                                    <>
                                                        <div className="col-md-3 col-sm-6 mb-3">
                                                            <div className="card text-center border-0 bg-light">
                                                                <div className="card-body py-3">
                                                                    <i className="fas fa-truck text-warning fs-4 mb-2"></i>
                                                                    <h5 className="mb-1">{estadisticas.despachos_realizados}</h5>
                                                                    <small className="text-muted">Despachos</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 col-sm-6 mb-3">
                                                            <div className="card text-center border-0 bg-light">
                                                                <div className="card-body py-3">
                                                                    <i className="fas fa-route text-success fs-4 mb-2"></i>
                                                                    <h5 className="mb-1">{estadisticas.rutas_asignadas}</h5>
                                                                    <small className="text-muted">Rutas Asignadas</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actividad reciente */}
                                {actividadReciente.length > 0 && (
                                    <div className="row">
                                        <div className="col-12">
                                            <h6 className="border-bottom pb-2 mb-3">
                                                <i className="fas fa-history me-2"></i>
                                                Actividad Reciente
                                            </h6>
                                            <div className="list-group list-group-flush">
                                                {actividadReciente.slice(0, 5).map((actividad) => (
                                                    <div key={actividad.id} className="list-group-item px-0 border-0 border-bottom">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div className="flex-grow-1">
                                                                <h6 className="mb-1">{actividad.accion}</h6>
                                                                <p className="mb-1 text-muted small">{actividad.descripcion}</p>
                                                                <small className="text-muted">
                                                                    <i className="fas fa-globe me-1"></i>
                                                                    {actividad.ip}
                                                                </small>
                                                            </div>
                                                            <small className="text-muted">{formatearFechaHora(actividad.fecha)}</small>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cerrar
                        </button>
                        {/* Solo mostrar botón editar si no es el usuario actual */}
                        {usuario && usuario.id !== user?.id && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => onEdit(usuario)}
                            >
                                <i className="fas fa-edit me-1"></i>
                                Editar Usuario
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleUsuario;