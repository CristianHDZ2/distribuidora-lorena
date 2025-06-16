import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth'; // Cambio aquí: import default
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import FormularioUsuario from '../../components/Usuarios/FormularioUsuario';

const DetalleUsuarioPage = () => {
    const { user } = useAuth(); // Obtenemos el usuario actual
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
    }, [id]);

    const cargarDatosUsuario = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Por ahora usamos datos simulados hasta que tengamos la API
            // const response = await fetch(`/api/usuarios/obtener_usuario.php?id=${id}`, {
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

            const usuarioEncontrado = usuariosSimulados[id];
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

    // Eliminar usuario
    const eliminarUsuario = async () => {
        if (!confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre_completo}?`)) {
            return;
        }

        try {
            // Por ahora simulamos la eliminación
            // const response = await fetch(`/api/usuarios/eliminar.php`, {
            //     method: 'DELETE',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            //     },
            //     body: JSON.stringify({ id: usuario.id })
            // });

            setSuccess('Usuario eliminado correctamente');
            setTimeout(() => {
                router.push('/usuarios');
            }, 1500);
            
        } catch (err) {
            setError('Error al eliminar usuario: ' + err.message);
        }
    };

    // Formatear fecha
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-SV');
    };

    // Formatear fecha y hora
    const formatearFechaHora = (fechaHora) => {
        return new Date(fechaHora).toLocaleString('es-SV');
    };

    // Obtener clase de badge para estado
    const getBadgeEstado = (estado) => {
        return estado === 'activo' ? 'badge bg-success' : 'badge bg-secondary';
    };

    // Obtener clase de badge para tipo de usuario
    const getBadgeTipo = (tipo) => {
        return tipo === 'administrador' ? 'badge bg-primary' : 'badge bg-info';
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermissions={['manage_users']}>
                <div className="min-vh-100 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-2">Cargando datos del usuario...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute requiredPermissions={['manage_users']}>
                <Head>
                    <title>Error - Distribuidora Lorena</title>
                </Head>
                <div className="min-vh-100 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                        <h3 className="text-danger">Error al cargar usuario</h3>
                        <p className="text-muted">{error}</p>
                        <Link href="/usuarios" className="btn btn-primary">
                            <i className="fas fa-arrow-left me-2"></i>
                            Volver a Usuarios
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermissions={['manage_users']}>
            <Head>
                <title>{usuario?.nombre_completo} - Usuarios - Distribuidora Lorena</title>
                <meta name="description" content={`Detalles del usuario ${usuario?.nombre_completo}`} />
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
                                    <i className="fas fa-cog me-1"></i>
                                    Opciones
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <Link href="/dashboard" className="dropdown-item">
                                            <i className="fas fa-home me-2"></i>Dashboard
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button 
                                            className="dropdown-item text-danger"
                                            onClick={() => {
                                                if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                                                    window.location.href = '/login';
                                                }
                                            }}
                                        >
                                            <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Contenido principal */}
                <main className="container-fluid p-4">
                    {/* Breadcrumb */}
                    <nav aria-label="breadcrumb" className="mb-4">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link href="/dashboard">Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href="/usuarios">Usuarios</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {usuario?.nombre_completo}
                            </li>
                        </ol>
                    </nav>

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

                    {usuario && (
                        <>
                            {/* Header del usuario */}
                            <div className="card mb-4">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-2 text-center">
                                            {usuario.foto_perfil ? (
                                                <img
                                                    src={`/api/uploads/usuarios/${usuario.foto_perfil}`}
                                                    alt="Foto de perfil"
                                                    className="rounded-circle"
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                                                    style={{ width: '80px', height: '80px' }}
                                                >
                                                    <i className="fas fa-user text-muted fs-3"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <h3 className="mb-1">{usuario.nombre_completo}</h3>
                                            <p className="text-muted mb-2">{usuario.email}</p>
                                            <div className="d-flex gap-2 mb-0">
                                                <span className={getBadgeTipo(usuario.tipo_usuario)}>
                                                    {usuario.tipo_usuario}
                                                </span>
                                                <span className={getBadgeEstado(usuario.estado)}>
                                                    {usuario.estado}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            <div className="btn-group" role="group">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => setMostrarFormularioEditar(true)}
                                                >
                                                    <i className="fas fa-edit me-1"></i>
                                                    Editar
                                                </button>
                                                {/* Solo mostrar botón eliminar si no es el usuario actual */}
                                                {usuario.id !== user?.id && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={eliminarUsuario}
                                                    >
                                                        <i className="fas fa-trash me-1"></i>
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información detallada */}
                            <div className="row">
                                {/* Información básica */}
                                <div className="col-md-6 mb-4">
                                    <div className="card h-100">
                                        <div className="card-header">
                                            <h6 className="mb-0">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Información Básica
                                            </h6>
                                        </div>
                                        <div className="card-body">
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
                                </div>

                                {/* Estadísticas */}
                                <div className="col-md-6 mb-4">
                                    <div className="card h-100">
                                        <div className="card-header">
                                            <h6 className="mb-0">
                                                <i className="fas fa-chart-bar me-2"></i>
                                                Estadísticas de Uso
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            {estadisticas && (
                                                <div className="row">
                                                    <div className="col-6 mb-3">
                                                        <div className="text-center">
                                                            <i className="fas fa-sign-in-alt text-primary fs-4 mb-2"></i>
                                                            <h5 className="mb-1">{estadisticas.total_sesiones}</h5>
                                                            <small className="text-muted">Total Sesiones</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 mb-3">
                                                        <div className="text-center">
                                                            <i className="fas fa-clock text-info fs-4 mb-2"></i>
                                                            <h5 className="mb-1">{estadisticas.tiempo_total_sesiones}</h5>
                                                            <small className="text-muted">Tiempo Total</small>
                                                        </div>
                                                    </div>
                                                    {usuario.tipo_usuario === 'despachador' && (
                                                        <>
                                                            <div className="col-6 mb-3">
                                                                <div className="text-center">
                                                                    <i className="fas fa-truck text-warning fs-4 mb-2"></i>
                                                                    <h5 className="mb-1">{estadisticas.despachos_realizados}</h5>
                                                                    <small className="text-muted">Despachos</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 mb-3">
                                                                <div className="text-center">
                                                                    <i className="fas fa-route text-success fs-4 mb-2"></i>
                                                                    <h5 className="mb-1">{estadisticas.rutas_asignadas}</h5>
                                                                    <small className="text-muted">Rutas Asignadas</small>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actividad reciente */}
                            {actividadReciente.length > 0 && (
                                <div className="row">
                                    <div className="col-12">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-history me-2"></i>
                                                    Actividad Reciente
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="list-group list-group-flush">
                                                    {actividadReciente.slice(0, 10).map((actividad) => (
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
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Modal para editar usuario */}
                    {mostrarFormularioEditar && usuario && (
                        <FormularioUsuario
                            usuario={usuario}
                            modoEdicion={true}
                            onClose={() => setMostrarFormularioEditar(false)}
                            onSuccess={() => {
                                setMostrarFormularioEditar(false);
                                cargarDatosUsuario();
                                setSuccess('Usuario actualizado correctamente');
                            }}
                        />
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
};

export default DetalleUsuarioPage;