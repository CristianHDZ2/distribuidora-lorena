import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import FormularioUsuario from '../../components/Usuarios/FormularioUsuario';

const DetalleUsuarioPage = () => {
    const { user, token } = useAuth();
    const router = useRouter();
    const { id } = router.query;
    
    const [usuario, setUsuario] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [actividadReciente, setActividadReciente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados para modales
    const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false);

    // Cargar datos del usuario
    useEffect(() => {
        if (id) {
            cargarDatosUsuario();
        }
    }, [id, token]);

    const cargarDatosUsuario = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`/api/usuarios/obtener_usuario.php?id=${id}`, {
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

    // Eliminar usuario
    const eliminarUsuario = async () => {
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
                setTimeout(() => {
                    router.push('/usuarios');
                }, 2000);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    // Manejar éxito en formulario de edición
    const handleFormularioSuccess = () => {
        setMostrarFormularioEditar(false);
        cargarDatosUsuario();
        setSuccess('Usuario actualizado exitosamente');
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
            <ProtectedRoute requiredPermissions={['administrador']}>
                <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3 text-muted">Cargando datos del usuario...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error && !usuario) {
        return (
            <ProtectedRoute requiredPermissions={['administrador']}>
                <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="alert alert-danger">
                            <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                            <h5>Error al cargar usuario</h5>
                            <p>{error}</p>
                            <Link href="/usuarios" className="btn btn-primary">
                                Volver a Lista de Usuarios
                            </Link>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermissions={['administrador']}>
            <Head>
                <title>{usuario ? `${usuario.nombre_completo} - Usuario` : 'Usuario'} - Distribuidora Lorena</title>
                <meta name="description" content={`Detalles del usuario ${usuario?.nombre_completo || ''} en Distribuidora Lorena`} />
            </Head>

            <div className="min-vh-100 bg-light">
                {/* Header del sistema */}
                <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                    <div className="container-fluid">
                        <div className="d-flex align-items-center">
                            <img 
                                src="/logo.png" 
                                alt="Distribuidora Lorena" 
                                height="40"
                                className="me-3"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <div>
                                <span className="navbar-brand mb-0 h1">Distribuidora Lorena</span>
                                <div className="small text-light opacity-75">
                                    Sistema de Gestión
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center">
                            <div className="me-3">
                                <span className="text-light">
                                    <i className="fas fa-user me-2"></i>
                                    {user?.nombre_completo || 'Usuario'}
                                </span>
                                <div className="small text-light opacity-75">
                                    {user?.tipo_usuario || ''}
                                </div>
                            </div>
                            
                            <div className="dropdown">
                                <button 
                                    className="btn btn-outline-light btn-sm dropdown-toggle" 
                                    type="button" 
                                    data-bs-toggle="dropdown"
                                >
                                    <i className="fas fa-cog"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <Link href="/dashboard" className="dropdown-item">
                                            <i className="fas fa-tachometer-alt me-2"></i>
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/usuarios" className="dropdown-item">
                                            <i className="fas fa-users me-2"></i>
                                            Lista de Usuarios
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button 
                                            className="dropdown-item text-danger"
                                            onClick={() => {
                                                if (confirm('¿Estás seguro de cerrar sesión?')) {
                                                    window.location.href = '/login';
                                                }
                                            }}
                                        >
                                            <i className="fas fa-sign-out-alt me-2"></i>
                                            Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Breadcrumb */}
                <div className="container-fluid py-2 bg-white border-bottom">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link href="/dashboard" className="text-decoration-none">
                                    <i className="fas fa-home"></i> Dashboard
                                </Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href="/usuarios" className="text-decoration-none">
                                    <i className="fas fa-users"></i> Usuarios
                                </Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                <i className="fas fa-user"></i> {usuario?.nombre_completo || 'Usuario'}
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Alertas */}
                {error && (
                    <div className="container-fluid pt-3">
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    </div>
                )}
                
                {success && (
                    <div className="container-fluid pt-3">
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <i className="fas fa-check-circle me-2"></i>
                            {success}
                            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                        </div>
                    </div>
                )}

                {/* Contenido principal */}
                <div className="container-fluid py-4">
                    {usuario && (
                        <>
                            {/* Header del usuario */}
                            <div className="row mb-4">
                                <div className="col">
                                    <div className="card shadow-sm">
                                        <div className="card-body">
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    {usuario.foto_perfil ? (
                                                        <img
                                                            src={`/api/uploads/usuarios/${usuario.foto_perfil}`}
                                                            alt={usuario.nombre_completo}
                                                            className="rounded-circle"
                                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div 
                                                            className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
                                                            style={{ width: '80px', height: '80px' }}
                                                        >
                                                            <i className="fas fa-user fa-2x"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col">
                                                    <h2 className="mb-1">{usuario.nombre_completo}</h2>
                                                    <div className="mb-2">
                                                        <span className={getBadgeTipo(usuario.tipo_usuario) + ' me-2'}>
                                                            {usuario.tipo_usuario === 'administrador' ? 'Administrador' : 'Despachador'}
                                                        </span>
                                                        <span className={getBadgeEstado(usuario.estado) + ' me-2'}>
                                                            {usuario.estado}
                                                        </span>
                                                        <span className={getBadgeConexion(usuario.estado_conexion)}>
                                                            {usuario.estado_conexion}
                                                        </span>
                                                    </div>
                                                    <div className="text-muted">
                                                        <i className="fas fa-id-card me-2"></i>
                                                        DUI: <code>{usuario.dui}</code>
                                                        <span className="mx-3">
                                                            <i className="fas fa-envelope me-2"></i>
                                                            {usuario.email}
                                                        </span>
                                                        <span>
                                                            <i className="fas fa-phone me-2"></i>
                                                            {usuario.telefono}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-auto">
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-outline-warning"
                                                            onClick={() => setMostrarFormularioEditar(true)}
                                                        >
                                                            <i className="fas fa-edit me-2"></i>
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={eliminarUsuario}
                                                        >
                                                            <i className="fas fa-trash me-2"></i>
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                {/* Información detallada */}
                                <div className="col-md-8">
                                    <div className="card shadow-sm mb-4">
                                        <div className="card-header">
                                            <h5 className="mb-0">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Información Detallada
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <dl className="row">
                                                        <dt className="col-sm-5">Nombre completo:</dt>
                                                        <dd className="col-sm-7">{usuario.nombre_completo}</dd>
                                                        
                                                        <dt className="col-sm-5">DUI:</dt>
                                                        <dd className="col-sm-7"><code>{usuario.dui}</code></dd>
                                                        
                                                        <dt className="col-sm-5">Email:</dt>
                                                        <dd className="col-sm-7">
                                                            <a href={`mailto:${usuario.email}`} className="text-decoration-none">
                                                                {usuario.email}
                                                            </a>
                                                        </dd>
                                                        
                                                        <dt className="col-sm-5">Teléfono:</dt>
                                                        <dd className="col-sm-7">
                                                            <a href={`tel:${usuario.telefono}`} className="text-decoration-none">
                                                                {usuario.telefono}
                                                            </a>
                                                        </dd>
                                                    </dl>
                                                </div>
                                                <div className="col-md-6">
                                                    <dl className="row">
                                                        <dt className="col-sm-5">Tipo de usuario:</dt>
                                                        <dd className="col-sm-7">
                                                            <span className={getBadgeTipo(usuario.tipo_usuario)}>
                                                                {usuario.tipo_usuario === 'administrador' ? 'Administrador' : 'Despachador'}
                                                            </span>
                                                        </dd>
                                                        
                                                        <dt className="col-sm-5">Estado:</dt>
                                                        <dd className="col-sm-7">
                                                            <span className={getBadgeEstado(usuario.estado)}>
                                                                {usuario.estado}
                                                            </span>
                                                        </dd>
                                                        
                                                        <dt className="col-sm-5">Fecha de creación:</dt>
                                                        <dd className="col-sm-7">{usuario.fecha_creacion_formato}</dd>
                                                        
                                                        {usuario.ultimo_acceso_formato && (
                                                            <>
                                                                <dt className="col-sm-5">Último acceso:</dt>
                                                                <dd className="col-sm-7">{usuario.ultimo_acceso_formato}</dd>
                                                            </>
                                                        )}
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actividad reciente */}
                                    <div className="card shadow-sm">
                                        <div className="card-header">
                                            <h5 className="mb-0">
                                                <i className="fas fa-clock me-2"></i>
                                                Actividad Reciente
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            {actividadReciente.length > 0 ? (
                                                <div className="timeline">
                                                    {actividadReciente.map((actividad, index) => (
                                                        <div key={index} className="d-flex mb-3 pb-3 border-bottom">
                                                            <div className="me-3">
                                                                <i className={getIconoActividad(actividad.tipo)}></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="fw-bold">
                                                                    {actividad.descripcion}
                                                                </div>
                                                                <div className="text-muted small">
                                                                    {actividad.fecha_formato}
                                                                </div>
                                                                {actividad.estado && (
                                                                    <span className={`badge ${
                                                                        actividad.estado === 'completado' ? 'bg-success' : 
                                                                        actividad.estado === 'pendiente' ? 'bg-warning' : 'bg-secondary'
                                                                    } badge-sm mt-1`}>
                                                                        {actividad.estado}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-muted py-4">
                                                    <i className="fas fa-clock fa-3x mb-3"></i>
                                                    <h6>No hay actividad reciente</h6>
                                                    <p className="mb-0">Este usuario aún no ha realizado actividades en el sistema</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar con estadísticas */}
                                <div className="col-md-4">
                                    {/* Estadísticas (solo para despachadores) */}
                                    {estadisticas && usuario.tipo_usuario === 'despachador' && (
                                        <div className="card shadow-sm mb-4">
                                            <div className="card-header">
                                                <h5 className="mb-0">
                                                    <i className="fas fa-chart-bar me-2"></i>
                                                    Estadísticas
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-6">
                                                        <div className="text-center p-3 bg-light rounded">
                                                            <div className="h4 mb-1 text-success">{estadisticas.despachos_completados}</div>
                                                            <small className="text-muted">Completados</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="text-center p-3 bg-light rounded">
                                                            <div className="h4 mb-1 text-info">{estadisticas.despachos_hoy}</div>
                                                            <small className="text-muted">Hoy</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="text-center p-3 bg-light rounded">
                                                            <div className="h4 mb-1 text-warning">{estadisticas.despachos_semana}</div>
                                                            <small className="text-muted">Esta Semana</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <hr />
                                                
                                                <div className="mb-3">
                                                    <label className="form-label text-muted small">Ventas totales</label>
                                                    <div className="h5 text-success mb-0">
                                                        ${parseFloat(estadisticas.ventas_totales || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <label className="form-label text-muted small">Promedio por despacho</label>
                                                    <div className="h6 text-info mb-0">
                                                        ${parseFloat(estadisticas.promedio_venta || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                                
                                                {estadisticas.ultimo_despacho_formato && (
                                                    <div>
                                                        <label className="form-label text-muted small">Último despacho</label>
                                                        <div className="small">
                                                            {estadisticas.ultimo_despacho_formato}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Información adicional */}
                                    <div className="card shadow-sm">
                                        <div className="card-header">
                                            <h5 className="mb-0">
                                                <i className="fas fa-cog me-2"></i>
                                                Información del Sistema
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            {usuario.creado_por_nombre && (
                                                <div className="mb-3">
                                                    <label className="form-label text-muted small">Creado por</label>
                                                    <div>
                                                        <i className="fas fa-user-plus me-2 text-muted"></i>
                                                        {usuario.creado_por_nombre}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {usuario.modificado_por_nombre && (
                                                <div className="mb-3">
                                                    <label className="form-label text-muted small">Modificado por</label>
                                                    <div>
                                                        <i className="fas fa-user-edit me-2 text-muted"></i>
                                                        {usuario.modificado_por_nombre}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {usuario.fecha_modificacion_formato && (
                                                <div className="mb-3">
                                                    <label className="form-label text-muted small">Última modificación</label>
                                                    <div>
                                                        <i className="fas fa-calendar-edit me-2 text-muted"></i>
                                                        {usuario.fecha_modificacion_formato}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="mb-3">
                                                <label className="form-label text-muted small">Estado de conexión</label>
                                                <div>
                                                    <span className={getBadgeConexion(usuario.estado_conexion)}>
                                                        {usuario.estado_conexion}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="row mt-4">
                                <div className="col">
                                    <div className="d-flex justify-content-between">
                                        <Link href="/usuarios" className="btn btn-outline-secondary">
                                            <i className="fas fa-arrow-left me-2"></i>
                                            Volver a Lista de Usuarios
                                        </Link>
                                        
                                        <div>
                                            <button
                                                className="btn btn-warning me-2"
                                                onClick={() => setMostrarFormularioEditar(true)}
                                            >
                                                <i className="fas fa-edit me-2"></i>
                                                Editar Usuario
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={eliminarUsuario}
                                            >
                                                <i className="fas fa-trash me-2"></i>
                                                Eliminar Usuario
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal del formulario de edición */}
                {mostrarFormularioEditar && usuario && (
                    <FormularioUsuario
                        usuario={usuario}
                        modoEdicion={true}
                        onClose={() => setMostrarFormularioEditar(false)}
                        onSuccess={handleFormularioSuccess}
                    />
                )}

                {/* Footer */}
                <footer className="bg-dark text-light py-3 mt-5">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <small>© 2024 Distribuidora Lorena. Todos los derechos reservados.</small>
                            </div>
                            <div className="col-md-6 text-md-end">
                                <small>
                                    Sistema de Gestión v1.0 - Detalle de Usuario
                                </small>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
};

export default DetalleUsuarioPage;