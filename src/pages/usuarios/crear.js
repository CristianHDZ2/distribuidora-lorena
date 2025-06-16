import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import FormularioUsuario from '../../components/Usuarios/FormularioUsuario';

const CrearUsuarioPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [mostrarFormulario, setMostrarFormulario] = useState(true);

    const handleSuccess = () => {
        // Redirigir a la lista de usuarios después de crear
        router.push('/usuarios');
    };

    const handleClose = () => {
        // Volver a la lista de usuarios si cancela
        router.push('/usuarios');
    };

    return (
        <ProtectedRoute requiredPermissions={['administrador']}>
            <Head>
                <title>Crear Usuario - Distribuidora Lorena</title>
                <meta name="description" content="Crear nuevo usuario en el sistema de Distribuidora Lorena" />
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
                                        <a className="dropdown-item" href="/dashboard">
                                            <i className="fas fa-tachometer-alt me-2"></i>
                                            Dashboard
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="/usuarios">
                                            <i className="fas fa-users me-2"></i>
                                            Lista de Usuarios
                                        </a>
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
                                <a href="/dashboard" className="text-decoration-none">
                                    <i className="fas fa-home"></i> Dashboard
                                </a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href="/usuarios" className="text-decoration-none">
                                    <i className="fas fa-users"></i> Usuarios
                                </a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                <i className="fas fa-plus"></i> Crear Usuario
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Contenido principal */}
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow-sm">
                                <div className="card-header bg-primary text-white">
                                    <h4 className="mb-0">
                                        <i className="fas fa-user-plus me-2"></i>
                                        Crear Nuevo Usuario
                                    </h4>
                                    <p className="mb-0 opacity-75">
                                        Completa la información para crear un nuevo usuario en el sistema
                                    </p>
                                </div>
                                <div className="card-body p-0">
                                    {/* Mostrar el formulario directamente en la página */}
                                    <div className="p-4">
                                        <div className="row mb-4">
                                            <div className="col-12">
                                                <div className="alert alert-info d-flex align-items-center" role="alert">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    <div>
                                                        <strong>Información importante:</strong>
                                                        <ul className="mb-0 mt-2">
                                                            <li>Todos los campos marcados con (*) son obligatorios</li>
                                                            <li>El DUI debe tener el formato: 12345678-9</li>
                                                            <li>El teléfono debe tener el formato: 7XXX-XXXX</li>
                                                            <li>La contraseña debe tener al menos 6 caracteres</li>
                                                            <li>La foto de perfil es opcional (máximo 5MB)</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Botones de acción */}
                            <div className="d-flex justify-content-between mt-3">
                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={handleClose}
                                >
                                    <i className="fas fa-arrow-left me-2"></i>
                                    Volver a Lista de Usuarios
                                </button>
                                
                                <div className="text-muted small">
                                    <i className="fas fa-shield-alt me-1"></i>
                                    Solo administradores pueden crear usuarios
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal del formulario */}
                {mostrarFormulario && (
                    <FormularioUsuario
                        usuario={null}
                        modoEdicion={false}
                        onClose={handleClose}
                        onSuccess={handleSuccess}
                    />
                )}

                {/* Footer */}
                <footer className="bg-dark text-light py-3 mt-auto">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <small>© 2024 Distribuidora Lorena. Todos los derechos reservados.</small>
                            </div>
                            <div className="col-md-6 text-md-end">
                                <small>
                                    Sistema de Gestión v1.0 - Crear Usuario
                                </small>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
};

export default CrearUsuarioPage;