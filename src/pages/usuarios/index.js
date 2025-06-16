import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import ListaUsuarios from '../../components/Usuarios/ListaUsuarios';

const UsuariosPage = () => {
    const { user } = useAuth();

    return (
        <ProtectedRoute requiredPermissions={['administrador']}>
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
                            <li className="breadcrumb-item active" aria-current="page">
                                <i className="fas fa-users"></i> Usuarios
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Contenido principal */}
                <div className="container-fluid py-4">
                    <ListaUsuarios />
                </div>

                {/* Footer */}
                <footer className="bg-dark text-light py-3 mt-auto">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <small>© 2024 Distribuidora Lorena. Todos los derechos reservados.</small>
                            </div>
                            <div className="col-md-6 text-md-end">
                                <small>
                                    Sistema de Gestión v1.0 - Módulo de Usuarios
                                </small>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
};

export default UsuariosPage;