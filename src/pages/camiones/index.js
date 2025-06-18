import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import ListaCamiones from '../../components/Camiones/ListaCamiones';

const CamionesIndex = () => {
    const { user } = useAuth();

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
                                            <small className="text-muted">
                                                {user?.tipo_usuario === 'administrador' ? 'Administrador' : 'Despachador'}
                                            </small>
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
                                        <Link href="/usuarios" className="dropdown-item">
                                            <i className="fas fa-users me-2"></i>
                                            Usuarios
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/motoristas" className="dropdown-item">
                                            <i className="fas fa-id-card me-2"></i>
                                            Motoristas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/camiones" className="dropdown-item">
                                            <i className="fas fa-truck me-2"></i>
                                            Camiones
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/rutas" className="dropdown-item">
                                            <i className="fas fa-route me-2"></i>
                                            Rutas
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
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
                            <li className="breadcrumb-item active" aria-current="page">
                                <i className="fas fa-truck me-1"></i>
                                Camiones
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Contenido principal */}
                <div className="container-fluid">
                    <ListaCamiones />
                </div>

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

export default CamionesIndex;