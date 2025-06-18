import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { camionesAPI } from '../../utils/api';
import FormularioCamion from '../../components/Camiones/FormularioCamion';
import FotosCamion from '../../components/Camiones/FotosCamion';

const DetalleCamion = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { id } = router.query;
    
    const [camion, setCamion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Modales
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarFotos, setMostrarFotos] = useState(false);

    useEffect(() => {
        if (id) {
            cargarCamion();
        }
    }, [id]);

    useEffect(() => {
        // Verificar si hay mensaje de éxito en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const successMessage = urlParams.get('success');
        if (successMessage) {
            setSuccess(decodeURIComponent(successMessage));
            // Limpiar la URL
            router.replace(`/camiones/${id}`, undefined, { shallow: true });
            setTimeout(() => setSuccess(''), 5000);
        }
    }, [id, router]);

    const cargarCamion = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await camionesAPI.obtener(id);
            
            if (response.success) {
                setCamion(response.camion);
            }
        } catch (error) {
            console.error('Error al cargar camión:', error);
            setError('Error al cargar los detalles del camión');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async () => {
        if (!camion) return;
        
        if (!confirm(`¿Estás seguro de que deseas eliminar el camión ${camion.numero_placa}?`)) {
            return;
        }

        try {
            const response = await camionesAPI.eliminar(camion.id);
            if (response.success) {
                router.push('/camiones?success=' + encodeURIComponent(response.message));
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al eliminar el camión');
            setTimeout(() => setError(''), 3000);
        }
    };

    const toggleEstado = async () => {
        if (!camion) return;
        
        try {
            const nuevoEstado = !camion.activo;
            const response = await camionesAPI.editar(camion.id, {
                numero_placa: camion.numero_placa,
                activo: nuevoEstado
            });
            
            if (response.success) {
                setSuccess(`Camión ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
                cargarCamion();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al cambiar el estado del camión');
            setTimeout(() => setError(''), 3000);
        }
    };

    const onFormularioExito = (mensaje) => {
        setSuccess(mensaje);
        setMostrarFormulario(false);
        cargarCamion();
        setTimeout(() => setSuccess(''), 3000);
    };

    const onFotosActualizadas = () => {
        cargarCamion();
        setSuccess('Fotos actualizadas exitosamente');
        setTimeout(() => setSuccess(''), 3000);
    };

    if (loading) {
        return (
            <ProtectedRoute requiredRole="administrador">
                <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <h5>Cargando detalles del camión...</h5>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error && !camion) {
        return (
            <ProtectedRoute requiredRole="administrador">
                <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h5 className="text-danger">Error al cargar el camión</h5>
                        <p className="text-muted">{error}</p>
                        <button 
                            className="btn btn-primary me-2"
                            onClick={cargarCamion}
                        >
                            <i className="fas fa-sync-alt me-2"></i>
                            Reintentar
                        </button>
                        <button 
                            className="btn btn-secondary"
                            onClick={() => router.push('/camiones')}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            Volver a Lista
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="administrador">
            <div className="min-vh-100 bg-light">
                {/* Navigation */}
                <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                    <div className="container-fluid">
                        <div className="d-flex align-items-center">
                            <img src="/logo.png" alt="Logo" height="40" className="me-3" />
                            <div>
                                <h5 className="navbar-brand mb-0">Distribuidora Lorena</h5>
                                <small className="text-light">Sistema de Gestión</small>
                            </div>
                        </div>
                        
                        <div className="navbar-nav ms-auto">
                            <div className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown">
                                    <i className="fas fa-user-circle me-2"></i>
                                    {user?.nombre_completo}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <span className="dropdown-item-text">
                                            <small className="text-muted">Administrador</small>
                                        </span>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <Link href="/dashboard" className="dropdown-item">
                                            <i className="fas fa-tachometer-alt me-2"></i>
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={() => {
                                            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                                                window.location.href = '/api/auth/logout.php';
                                            }
                                        }}>
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
                <div className="container-fluid mt-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link href="/dashboard" className="text-decoration-none">
                                    <i className="fas fa-home me-1"></i>
                                    Dashboard
                                </Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href="/camiones" className="text-decoration-none">
                                    <i className="fas fa-truck me-1"></i>
                                    Camiones
                                </Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {camion?.numero_placa || 'Detalle'}
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Contenido principal */}
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

                    {camion && (
                        <>
                            {/* Header del camión */}
                            <div className="card mb-4 shadow">
                                <div className="card-header bg-primary text-white">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-0">
                                                <i className="fas fa-truck me-2"></i>
                                                Camión {camion.numero_placa}
                                            </h5>
                                            <small>
                                                Estado: 
                                                <span className={`badge ms-2 ${camion.activo ? 'bg-success' : 'bg-secondary'}`}>
                                                    {camion.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </small>
                                        </div>
                                        <div className="btn-group" role="group">
                                            <button
                                                className="btn btn-light btn-sm"
                                                onClick={() => setMostrarFormulario(true)}
                                                title="Editar"
                                            >
                                                <i className="fas fa-edit me-1"></i>
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => setMostrarFotos(true)}
                                                title="Gestionar fotos"
                                            >
                                                <i className="fas fa-camera me-1"></i>
                                                Fotos
                                            </button>
                                            <button
                                                className={`btn btn-sm ${camion.activo ? 'btn-secondary' : 'btn-success'}`}
                                                onClick={toggleEstado}
                                                title={camion.activo ? 'Desactivar' : 'Activar'}
                                            >
                                                <i className={`fas ${camion.activo ? 'fa-toggle-on' : 'fa-toggle-off'} me-1`}></i>
                                                {camion.activo ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={handleEliminar}
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash me-1"></i>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                {/* Información básica */}
                                <div className="col-md-6">
                                    <div className="card h-100 shadow">
                                        <div className="card-header">
                                            <h6 className="mb-0">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Información Básica
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-borderless">
                                                <tbody>
                                                    <tr>
                                                        <td className="fw-bold">Número de Placa:</td>
                                                        <td>
                                                            <span className="badge bg-primary fs-6">
                                                                {camion.numero_placa}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold">Estado:</td>
                                                        <td>
                                                            <span className={`badge ${camion.activo ? 'bg-success' : 'bg-secondary'}`}>
                                                                {camion.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold">Fecha de Registro:</td>
                                                        <td>{camion.fecha_creacion}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold">Última Actualización:</td>
                                                        <td>{camion.fecha_actualizacion || 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold">Fotos:</td>
                                                        <td>
                                                            <span className="badge bg-info">
                                                                {[camion.foto1, camion.foto2, camion.foto3].filter(f => f).length}/3
                                                            </span>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary ms-2"
                                                                onClick={() => setMostrarFotos(true)}
                                                            >
                                                                <i className="fas fa-camera me-1"></i>
                                                                Gestionar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Asignación de ruta */}
                                <div className="col-md-6">
                                    <div className="card h-100 shadow">
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
                                                    
                                                    <table className="table table-borderless">
                                                        <tbody>
                                                            <tr>
                                                                <td className="fw-bold">Número de Ruta:</td>
                                                                <td>
                                                                    <span className="badge bg-warning text-dark">
                                                                        {camion.numero_ruta}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold">Lugar de Recorrido:</td>
                                                                <td>{camion.lugar_recorrido}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold">Grupo de Productos:</td>
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
                                                                    <td className="fw-bold">Motorista:</td>
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
                                    <div className="card shadow">
                                        <div className="card-header">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-camera me-2"></i>
                                                    Galería de Fotos
                                                </h6>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => setMostrarFotos(true)}
                                                >
                                                    <i className="fas fa-edit me-1"></i>
                                                    Gestionar Fotos
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                {[1, 2, 3].map(num => {
                                                    const foto = camion[`foto${num}`];
                                                    return (
                                                        <div key={num} className="col-md-4 mb-3">
                                                            <div className="card">
                                                                <div className="card-header text-center bg-light">
                                                                    <small className="text-muted fw-bold">Foto {num}</small>
                                                                </div>
                                                                {foto ? (
                                                                    <div className="position-relative">
                                                                        <img
                                                                            src={`/api/uploads/camiones/${foto}`}
                                                                            alt={`Foto ${num} del camión ${camion.numero_placa}`}
                                                                            className="card-img-top"
                                                                            style={{ 
                                                                                height: '250px', 
                                                                                objectFit: 'cover',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                            onClick={() => {
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
                                                                        className="card-img-top d-flex align-items-center justify-content-center bg-light border-dashed"
                                                                        style={{ height: '250px', border: '2px dashed #dee2e6' }}
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

                            {/* Acciones rápidas */}
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="card shadow">
                                        <div className="card-header">
                                            <h6 className="mb-0">
                                                <i className="fas fa-bolt me-2"></i>
                                                Acciones Rápidas
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="row text-center">
                                                <div className="col-md-3">
                                                    <button
                                                        className="btn btn-outline-primary w-100 mb-2"
                                                        onClick={() => setMostrarFormulario(true)}
                                                    >
                                                        <i className="fas fa-edit fa-2x mb-2 d-block"></i>
                                                        Editar Información
                                                    </button>
                                                </div>
                                                <div className="col-md-3">
                                                    <button
                                                        className="btn btn-outline-warning w-100 mb-2"
                                                        onClick={() => setMostrarFotos(true)}
                                                    >
                                                        <i className="fas fa-camera fa-2x mb-2 d-block"></i>
                                                        Gestionar Fotos
                                                    </button>
                                                </div>
                                                <div className="col-md-3">
                                                    <Link
                                                        href="/rutas"
                                                        className="btn btn-outline-info w-100 mb-2 text-decoration-none"
                                                    >
                                                        <i className="fas fa-route fa-2x mb-2 d-block"></i>
                                                        Ver Rutas
                                                    </Link>
                                                </div>
                                                <div className="col-md-3">
                                                    <Link
                                                        href="/camiones"
                                                        className="btn btn-outline-secondary w-100 mb-2 text-decoration-none"
                                                    >
                                                        <i className="fas fa-list fa-2x mb-2 d-block"></i>
                                                        Lista de Camiones
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Modales */}
                {mostrarFormulario && camion && (
                    <FormularioCamion
                        mostrar={mostrarFormulario}
                        onClose={() => setMostrarFormulario(false)}
                        onSuccess={onFormularioExito}
                        camion={camion}
                        modoEdicion={true}
                    />
                )}

                {mostrarFotos && camion && (
                    <FotosCamion
                        mostrar={mostrarFotos}
                        onClose={() => setMostrarFotos(false)}
                        camion={camion}
                        onFotosActualizadas={onFotosActualizadas}
                    />
                )}

                {/* Footer */}
                <footer className="bg-dark text-light py-4 mt-5">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-6">
                                <h6>Distribuidora Lorena</h6>
                                <p className="mb-0">Sistema de Gestión de Inventario y Despacho</p>
                            </div>
                            <div className="col-md-6 text-md-end">
                                <p className="mb-0">
                                    <small>© 2024 - Todos los derechos reservados</small>
                                </p>
                                <p className="mb-0">
                                    <small>Versión 1.0</small>
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
};

export default DetalleCamion;