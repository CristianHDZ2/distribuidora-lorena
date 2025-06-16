import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import FormularioUsuario from './FormularioUsuario';
import DetalleUsuario from './DetalleUsuario';

const ListaUsuarios = () => {
    const { token } = useAuth();
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

    // Cargar usuarios
    const cargarUsuarios = async (pagina = 1) => {
        try {
            setLoading(true);
            setError('');
            
            const params = new URLSearchParams({
                pagina: pagina.toString(),
                por_pagina: paginacion.por_pagina.toString(),
                ...filtros
            });
            
            const response = await fetch(`/api/usuarios/listar_usuarios.php?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al cargar usuarios');
            }
            
            const data = await response.json();
            
            if (data.success) {
                setUsuarios(data.usuarios);
                setPaginacion(data.paginacion);
                setEstadisticas(data.estadisticas);
            } else {
                throw new Error(data.error || 'Error al cargar usuarios');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar usuarios inicialmente
    useEffect(() => {
        cargarUsuarios();
    }, []);

    // Efecto para recargar cuando cambien los filtros
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            cargarUsuarios(1);
        }, 500);
        
        return () => clearTimeout(timeoutId);
    }, [filtros]);

    // Manejar cambios en filtros
    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Manejar paginación
    const handlePaginaChange = (nuevaPagina) => {
        cargarUsuarios(nuevaPagina);
    };

    // Abrir formulario para crear usuario
    const abrirFormularioCrear = () => {
        setUsuarioSeleccionado(null);
        setModoEdicion(false);
        setMostrarFormulario(true);
    };

    // Abrir formulario para editar usuario
    const abrirFormularioEditar = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setModoEdicion(true);
        setMostrarFormulario(true);
    };

    // Abrir detalle de usuario
    const abrirDetalle = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setMostrarDetalle(true);
    };

    // Eliminar usuario
    const eliminarUsuario = async (usuario) => {
        if (!confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre_completo}?`)) {
            return;
        }

        try {
            const response = await fetch('/api/usuarios/eliminar_usuario.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: usuario.id })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                cargarUsuarios(paginacion.pagina_actual);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    // Manejar éxito en formulario
    const handleFormularioSuccess = () => {
        setMostrarFormulario(false);
        cargarUsuarios(paginacion.pagina_actual);
        setSuccess(modoEdicion ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
        setTimeout(() => setSuccess(''), 3000);
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

    if (loading && usuarios.length === 0) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Alertas */}
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

            {/* Header */}
            <div className="row mb-4">
                <div className="col">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-0">
                                <i className="fas fa-users me-2 text-primary"></i>
                                Gestión de Usuarios
                            </h2>
                            <p className="text-muted mb-0">Administra los usuarios del sistema</p>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={abrirFormularioCrear}
                        >
                            <i className="fas fa-plus me-2"></i>
                            Nuevo Usuario
                        </button>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-primary mb-2">
                                    <i className="fas fa-users fa-2x"></i>
                                </div>
                                <h4 className="mb-0">{estadisticas.total_usuarios}</h4>
                                <small className="text-muted">Total Usuarios</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-success mb-2">
                                    <i className="fas fa-user-check fa-2x"></i>
                                </div>
                                <h4 className="mb-0">{estadisticas.activos}</h4>
                                <small className="text-muted">Usuarios Activos</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-info mb-2">
                                    <i className="fas fa-user-shield fa-2x"></i>
                                </div>
                                <h4 className="mb-0">{estadisticas.administradores}</h4>
                                <small className="text-muted">Administradores</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-warning mb-2">
                                    <i className="fas fa-truck fa-2x"></i>
                                </div>
                                <h4 className="mb-0">{estadisticas.despachadores}</h4>
                                <small className="text-muted">Despachadores</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Buscar usuarios</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por nombre, DUI o email..."
                                    value={filtros.busqueda}
                                    onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Tipo de usuario</label>
                            <select
                                className="form-select"
                                value={filtros.tipo}
                                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                            >
                                <option value="">Todos los tipos</option>
                                <option value="administrador">Administradores</option>
                                <option value="despachador">Despachadores</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Estado</label>
                            <select
                                className="form-select"
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="activo">Activos</option>
                                <option value="inactivo">Inactivos</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Por página</label>
                            <select
                                className="form-select"
                                value={paginacion.por_pagina}
                                onChange={(e) => {
                                    setPaginacion(prev => ({
                                        ...prev,
                                        por_pagina: parseInt(e.target.value)
                                    }));
                                    cargarUsuarios(1);
                                }}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="fas fa-users fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No se encontraron usuarios</h5>
                            <p className="text-muted">Ajusta los filtros o crea un nuevo usuario</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Usuario</th>
                                            <th>DUI</th>
                                            <th>Contacto</th>
                                            <th>Tipo</th>
                                            <th>Estado</th>
                                            <th>Conexión</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map(usuario => (
                                            <tr key={usuario.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="me-3">
                                                            {usuario.foto_perfil ? (
                                                                <img
                                                                    src={`/api/uploads/usuarios/${usuario.foto_perfil}`}
                                                                    alt={usuario.nombre_completo}
                                                                    className="rounded-circle"
                                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                                                                    <i className="fas fa-user"></i>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold">{usuario.nombre_completo}</div>
                                                            <small className="text-muted">
                                                                Creado: {usuario.fecha_creacion_formato}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <code>{usuario.dui}</code>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="small">
                                                            <i className="fas fa-envelope me-1"></i>
                                                            {usuario.email}
                                                        </div>
                                                        <div className="small text-muted">
                                                            <i className="fas fa-phone me-1"></i>
                                                            {usuario.telefono}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={getBadgeTipo(usuario.tipo_usuario)}>
                                                        {usuario.tipo_usuario === 'administrador' ? 'Admin' : 'Despachador'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={getBadgeEstado(usuario.estado)}>
                                                        {usuario.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={getBadgeConexion(usuario.estado_conexion)}>
                                                        {usuario.estado_conexion}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => abrirDetalle(usuario)}
                                                            title="Ver detalles"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-warning"
                                                            onClick={() => abrirFormularioEditar(usuario)}
                                                            title="Editar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => eliminarUsuario(usuario)}
                                                            title="Eliminar"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {paginacion.total_paginas > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div className="text-muted">
                                        Mostrando {(paginacion.pagina_actual - 1) * paginacion.por_pagina + 1} a{' '}
                                        {Math.min(paginacion.pagina_actual * paginacion.por_pagina, paginacion.total_registros)} de{' '}
                                        {paginacion.total_registros} usuarios
                                    </div>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className={`page-item ${!paginacion.tiene_anterior ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePaginaChange(paginacion.pagina_actual - 1)}
                                                    disabled={!paginacion.tiene_anterior}
                                                >
                                                    Anterior
                                                </button>
                                            </li>
                                            
                                            {[...Array(Math.min(5, paginacion.total_paginas))].map((_, i) => {
                                                const startPage = Math.max(1, paginacion.pagina_actual - 2);
                                                const pageNum = startPage + i;
                                                
                                                if (pageNum > paginacion.total_paginas) return null;
                                                
                                                return (
                                                    <li key={pageNum} className={`page-item ${paginacion.pagina_actual === pageNum ? 'active' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePaginaChange(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            
                                            <li className={`page-item ${!paginacion.tiene_siguiente ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePaginaChange(paginacion.pagina_actual + 1)}
                                                    disabled={!paginacion.tiene_siguiente}
                                                >
                                                    Siguiente
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modales */}
            {mostrarFormulario && (
                <FormularioUsuario
                    usuario={usuarioSeleccionado}
                    modoEdicion={modoEdicion}
                    onClose={() => setMostrarFormulario(false)}
                    onSuccess={handleFormularioSuccess}
                />
            )}

            {mostrarDetalle && usuarioSeleccionado && (
                <DetalleUsuario
                    usuarioId={usuarioSeleccionado.id}
                    onClose={() => setMostrarDetalle(false)}
                    onEdit={() => {
                        setMostrarDetalle(false);
                        abrirFormularioEditar(usuarioSeleccionado);
                    }}
                />
            )}
        </div>
    );
};

export default ListaUsuarios;