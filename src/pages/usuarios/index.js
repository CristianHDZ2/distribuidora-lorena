import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useAuth from '../../hooks/useAuth';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import ListaUsuarios from '../../components/Usuarios/ListaUsuarios';
import FormularioUsuario from '../../components/Usuarios/FormularioUsuario';

const UsuariosPage = () => {
    const { user, logout } = useAuth();
    const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);

    const handleLogout = async () => {
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            await logout();
        }
    };

    return (
        <ProtectedRoute requiredPermissions={['manage_users']}>
            <Head>
                <title>Gestión de Usuarios - Distribuidora Lorena</title>
                <meta name="description" content="Gestiona los usuarios del sistema de Distribuidora Lorena" />
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
                                    id="dropdownMenuButton"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <i className="fas fa-cog me-1"></i>
                                    Opciones
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                                    <li>
                                        <Link href="/dashboard" className="dropdown-item">
                                            <i className="fas fa-home me-2"></i>Dashboard
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button 
                                            className="dropdown-item text-danger"
                                            onClick={handleLogout}
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
                            <li className="breadcrumb-item active" aria-current="page">
                                Usuarios
                            </li>
                        </ol>
                    </nav>

                    {/* Título y descripción */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h1 className="h3 mb-1">
                                        <i className="fas fa-users me-2 text-primary"></i>
                                        Gestión de Usuarios
                                    </h1>
                                    <p className="text-muted mb-0">
                                        Administra los usuarios del sistema
                                    </p>
                                </div>
                                <div>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => setMostrarFormularioNuevo(true)}
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Nuevo Usuario
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Componente de lista de usuarios */}
                    <div className="row">
                        <div className="col-12">
                            <ListaUsuarios />
                        </div>
                    </div>

                    {/* Modal para nuevo usuario */}
                    {mostrarFormularioNuevo && (
                        <FormularioUsuario
                            usuario={null}
                            modoEdicion={false}
                            onClose={() => setMostrarFormularioNuevo(false)}
                            onSuccess={() => {
                                setMostrarFormularioNuevo(false);
                                // Aquí podrías recargar la lista de usuarios
                                window.location.reload();
                            }}
                        />
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
};

export default UsuariosPage;