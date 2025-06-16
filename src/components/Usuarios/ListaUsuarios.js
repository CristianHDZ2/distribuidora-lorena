import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import FormularioUsuario from './FormularioUsuario';
import DetalleUsuario from './DetalleUsuario';

const ListaUsuarios = () => {
    const { user } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados para filtros y búsqueda
    const [filtros, setFiltros] = useState({
        busqueda: '',
        tipo: '',
        estado: ''
    });
    
    // Estados para paginación
    const [paginacion, setPaginacion] = useState({
        pagina_actual: 1,
        por_pagina: 10,
        total_registros: 0,
        total_paginas: 0
    });
    
    // Estados para estadísticas
    const [estadisticas, setEstadisticas] = useState(null);
    
    // Estados para modales
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        cargarUsuarios();
        cargarEstadisticas();
    }, []);

    // Cargar usuarios cuando cambian los filtros
    useEffect(() => {
        cargarUsuarios(1);
    }, [filtros]);

    // Cargar usuarios
    const cargarUsuarios = async (pagina = 1) => {
        try {
            setLoading(true);
            setError('');
            
            // Datos simulados para desarrollo
            const usuariosSimulados = [
                {
                    id: 1,
                    dui: '12345678-9',
                    nombre_completo: 'Administrador Sistema',
                    email: 'admin@distribuidora.com',
                    telefono: '7777-7777',
                    tipo_usuario: 'administrador',
                    estado: 'activo',
                    fecha_creacion: '2024-01-15',
                    ultimo_acceso: '2024-06-16 10:30:00'
                },
                {
                    id: 2,
                    dui: '98765432-1',
                    nombre_completo: 'Despachador Principal',
                    email: 'despachador@distribuidora.com',
                    telefono: '7888-8888',
                    tipo_usuario: 'despachador',
                    estado: 'activo',
                    fecha_creacion: '2024-02-01',
                    ultimo_acceso: '2024-06-16 09:15:00'
                },
                {
                    id: 3,
                    dui: '11111111-1',
                    nombre_completo: 'María García',
                    email: 'maria@distribuidora.com',
                    telefono: '7999-9999',
                    tipo_usuario: 'despachador',
                    estado: 'inactivo',
                    fecha_creacion: '2024-03-15',
                    ultimo_acceso: '2024-06-15 16:45:00'
                },
                {
                    id: 4,
                    dui: '44444444-4',
                    nombre_completo: 'Juan Pérez',
                    email: 'juan@distribuidora.com',
                    telefono: '7555-5555',
                    tipo_usuario: 'despachador',
                    estado: 'activo',
                    fecha_creacion: '2024-04-10',
                    ultimo_acceso: '2024-06-14 14:20:00'
                }
            ];

            // Filtrar usuarios simulados
            let usuariosFiltrados = usuariosSimulados;
            if (filtros.busqueda) {
                usuariosFiltrados = usuariosSimulados.filter(usuario =>
                    usuario.nombre_completo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                    usuario.dui.includes(filtros.busqueda) ||
                    usuario.email.toLowerCase().includes(filtros.busqueda.toLowerCase())
                );
            }
            if (filtros.tipo) {
                usuariosFiltrados = usuariosFiltrados.filter(usuario => usuario.tipo_usuario === filtros.tipo);
            }
            if (filtros.estado) {
                usuariosFiltrados = usuariosFiltrados.filter(usuario => usuario.estado === filtros.estado);
            }

            setUsuarios(usuariosFiltrados);
            setPaginacion({
                pagina_actual: pagina,
                por_pagina: 10,
                total_registros: usuariosFiltrados.length,
                total_paginas: Math.ceil(usuariosFiltrados.length / 10)
            });
            
        } catch (err) {
            setError('Error al cargar usuarios: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cargar estadísticas
    const cargarEstadisticas = async () => {
        try {
            setEstadisticas({
                total_usuarios: 15,
                administradores: 3,
                despachadores: 12,
                usuarios_activos: 14,
                usuarios_inactivos: 1,
                conexiones_hoy: 8
            });
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
        }
    };

    // Cambiar estado del usuario (activar/desactivar)
    const cambiarEstadoUsuario = async (usuarioId, nuevoEstado) => {
        try {
            // Simular cambio de estado
            setUsuarios(prevUsuarios =>
                prevUsuarios.map(usuario =>
                    usuario.id === usuarioId
                        ? { ...usuario, estado: nuevoEstado }
                        : usuario
                )
            );
            
            setSuccess(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
            
            // Ocultar mensaje después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            setError('Error al cambiar estado del usuario: ' + err.message);
        }
    };

    // Eliminar usuario
    const eliminarUsuario = async (usuarioId) => {
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (!confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre_completo}?`)) {
            return;
        }

        try {
            // Simular eliminación
            setUsuarios(prevUsuarios => prevUsuarios.filter(u => u.id !== usuarioId));
            setSuccess('Usuario eliminado correctamente');
            
            // Ocultar mensaje después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            setError('Error al eliminar usuario: ' + err.message);
        }
    };

    // Manejar cambios en filtros
    const manejarCambioFiltro = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            tipo: '',
            estado: ''
        });
    };

    // Obtener clase CSS para el badge de estado
    const getBadgeEstado = (estado) => {
        return estado === 'activo' ? 'badge bg-success' : 'badge bg-secondary';
    };

    // Obtener clase CSS para el badge de tipo
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

    return (
        <div className="container-fluid">
            {/* Estadísticas rápidas */}
            {estadisticas && (
                <div className="row mb-4">
                    <div className="col-md-2 col-sm-4 col-6 mb-3">
                        <div className="card text-center border-0 shadow-sm">
                            <div className="card-body py-3">
                                <i className="fas fa-users text-primary fs-4 mb-2"></i>
                                <h5 className="mb-1">{estadisticas.total_usuarios}</h5>
                                <small className="text-muted">Total Usuarios</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6 mb-3">
                        <div className="card text-center border-0 shadow-sm">
                            <div className="card-body py-3">
                                <i className="fas fa-user-shield text-info fs-4 mb-2"></i>
                                <h5 className="mb-1">{estadisticas.administradores}</h5>
                                <small className="text-muted">Administradores</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6 mb-3">
                        <div className="card text-center border-0 shadow-sm">
                            <div className="card-body py-3">
                                <i className="fas fa-user-cog text-warning fs-4 mb-2"></i>
                                <h5 className="mb-1">{estadisticas.despachadores}</h5>
                                <small className="text-muted">Despachadores</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6 mb-3">
                        <div className="card text-center border-0 shadow-sm">
                            <div className="card-body py-3">
                                <i className="fas fa-check-circle text-success fs-4 mb-2"></i>
                                <h5 className="mb-1">{estadisticas.usuarios_activos}</h5>
                                <small className="text-muted">Activos</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6 mb-3">
                        <div className="card text-center border-0 shadow-sm">
                            <div className="card-body py-3">
                                <i className="fas fa-pause-circle text-secondary fs-4 mb-2"></i>
                                <h5 className="mb-1">{estadisticas.usuarios_inactivos}</h5>
                                <small className="text-muted">Inactivos</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-6 mb-3">
                        <div className="card text-center border-0 shadow-sm">
                            <div className="card-body py-3">
                                <i className="fas fa-wifi text-primary fs-4 mb-2"></i>
                                <h5 className="mb-1">{estadisticas.conexiones_hoy}</h5>
                                <small className="text-muted">Conectados Hoy</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros y búsqueda */}
            <div className="card mb-4">
                <div className="card-header bg-white">
                    <h6 className="mb-0">
                        <i className="fas fa-filter me-2"></i>
                        Filtros de Búsqueda
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Buscar usuario</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nombre, DUI o email..."
                                    value={filtros.busqueda}
                                    onChange={(e) => manejarCambioFiltro('busqueda', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Tipo de usuario</label>
                            <select
                                className="form-select"
                                value={filtros.tipo}
                                onChange={(e) => manejarCambioFiltro('tipo', e.target.value)}
                            >
                                <option value="">Todos los tipos</option>
                                <option value="administrador">Administrador</option>
                                <option value="despachador">Despachador</option>
                            </select>
                        </div>
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Estado</label>
                            <select
                                className="form-select"
                                value={filtros.estado}
                                onChange={(e) => manejarCambioFiltro('estado', e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div className="col-md-2 mb-3">
                            <label className="form-label">&nbsp;</label>
                            <div>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100"
                                    onClick={limpiarFiltros}
                                >
                                    <i className="fas fa-eraser me-1"></i>
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensajes de estado */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
            )}

            {/* Tabla de usuarios */}
            <div className="card">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                        <i className="fas fa-list me-2"></i>
                        Lista de Usuarios
                    </h6>
                    <span className="badge bg-primary">
                        {paginacion.total_registros} usuarios
                    </span>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2 text-muted">Cargando usuarios...</p>
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-users text-muted fs-1 mb-3"></i>
                            <h5 className="text-muted">No se encontraron usuarios</h5>
                            <p className="text-muted">No hay usuarios que coincidan con los filtros aplicados.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">Usuario</th>
                                        <th scope="col">Contacto</th>
                                        <th scope="col">Tipo</th>
                                        <th scope="col">Estado</th>
                                        <th scope="col">Último Acceso</th>
                                        <th scope="col" className="text-center" style={{ minWidth: '200px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((usuario) => (
                                        <tr key={usuario.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-circle me-3">
                                                        <i className="fas fa-user"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">{usuario.nombre_completo}</h6>
                                                        <small className="text-muted">DUI: {usuario.dui}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <small className="d-block">{usuario.email}</small>
                                                    <small className="text-muted">{usuario.telefono}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={getBadgeTipo(usuario.tipo_usuario)}>
                                                    {usuario.tipo_usuario}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={getBadgeEstado(usuario.estado)}>
                                                    {usuario.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {formatearFechaHora(usuario.ultimo_acceso)}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1 justify-content-center flex-wrap">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Ver detalles"
                                                        onClick={() => {
                                                            setUsuarioSeleccionado(usuario);
                                                            setMostrarDetalle(true);
                                                        }}
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success"
                                                        title="Editar usuario"
                                                        onClick={() => {
                                                            setUsuarioSeleccionado(usuario);
                                                            setModoEdicion(true);
                                                            setMostrarFormulario(true);
                                                        }}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>

                                                    {/* Solo mostrar botones de estado y eliminar si no es el usuario actual */}
                                                    {usuario.id !== user?.id && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className={`btn btn-sm ${usuario.estado === 'activo' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                                title={usuario.estado === 'activo' ? 'Desactivar usuario' : 'Activar usuario'}
                                                                onClick={() => cambiarEstadoUsuario(usuario.id, usuario.estado === 'activo' ? 'inactivo' : 'activo')}
                                                            >
                                                                <i className={`fas ${usuario.estado === 'activo' ? 'fa-pause' : 'fa-play'}`}></i>
                                                            </button>
                                                            
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                title="Eliminar usuario"
                                                                onClick={() => eliminarUsuario(usuario.id)}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {paginacion.total_paginas > 1 && (
                    <div className="card-footer bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">
                                Mostrando {((paginacion.pagina_actual - 1) * paginacion.por_pagina) + 1} a {Math.min(paginacion.pagina_actual * paginacion.por_pagina, paginacion.total_registros)} de {paginacion.total_registros} registros
                            </span>
                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${paginacion.pagina_actual === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => cargarUsuarios(paginacion.pagina_actual - 1)}
                                            disabled={paginacion.pagina_actual === 1}
                                        >
                                            Anterior
                                        </button>
                                    </li>
                                    {[...Array(paginacion.total_paginas)].map((_, index) => (
                                        <li key={index + 1} className={`page-item ${paginacion.pagina_actual === index + 1 ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => cargarUsuarios(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${paginacion.pagina_actual === paginacion.total_paginas ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => cargarUsuarios(paginacion.pagina_actual + 1)}
                                            disabled={paginacion.pagina_actual === paginacion.total_paginas}
                                        >
                                            Siguiente
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Modales */}
            {mostrarFormulario && (
                <FormularioUsuario
                    usuario={modoEdicion ? usuarioSeleccionado : null}
                    modoEdicion={modoEdicion}
                    onClose={() => {
                        setMostrarFormulario(false);
                        setModoEdicion(false);
                        setUsuarioSeleccionado(null);
                    }}
                    onSuccess={() => {
                        setMostrarFormulario(false);
                        setModoEdicion(false);
                        setUsuarioSeleccionado(null);
                        cargarUsuarios();
                        setSuccess(modoEdicion ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
                    }}
                />
            )}

            {mostrarDetalle && usuarioSeleccionado && (
                <DetalleUsuario
                    usuarioId={usuarioSeleccionado.id}
                    onClose={() => {
                        setMostrarDetalle(false);
                        setUsuarioSeleccionado(null);
                    }}
                    onEdit={(usuario) => {
                        setMostrarDetalle(false);
                        setUsuarioSeleccionado(usuario);
                        setModoEdicion(true);
                        setMostrarFormulario(true);
                    }}
                />
            )}

            {/* Estilos adicionales */}
            <style jsx>{`
                .avatar-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: #f8f9fa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6c757d;
                    flex-shrink: 0;
                }
                
                .table td {
                    vertical-align: middle;
                }
                
                .btn-sm {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.875rem;
                }
                
                .pagination-sm .page-link {
                    padding: 0.375rem 0.75rem;
                }

                .d-flex.gap-1 {
                    gap: 0.25rem !important;
                }

                @media (max-width: 768px) {
                    .d-flex.gap-1 {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .btn-sm {
                        min-width: 35px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ListaUsuarios;