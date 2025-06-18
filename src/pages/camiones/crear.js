import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import FormularioCamion from '../../components/Camiones/FormularioCamion';

const CrearCamionPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [mostrarFormulario, setMostrarFormulario] = useState(true);

    const handleClose = () => {
        router.push('/camiones');
    };

    const handleSuccess = (mensaje) => {
        // Redireccionar con mensaje de éxito
        router.push('/camiones?success=' + encodeURIComponent(mensaje));
    };

    return (
        <>
            <Head>
                <title>Crear Camión - Distribuidora Lorena</title>
                <meta name="description" content="Registrar un nuevo camión en el sistema" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/logo.png" />
            </Head>

            <ProtectedRoute requiredRole="administrador">
                <div className="min-vh-100 bg-light d-flex flex-column">
                    {/* Header */}
                    <header className="bg-primary text-white shadow-sm">
                        <div className="container-fluid">
                            <div className="row align-items-center py-3">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center">
                                        <img src="/logo.png" alt="Logo" height="40" className="me-3" />
                                        <div>
                                            <h5 className="mb-0">Distribuidora Lorena</h5>
                                            <small className="opacity-75">Sistema de Gestión</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <span className="me-3">
                                        <i className="fas fa-user-circle me-2"></i>
                                        {user?.nombre_completo}
                                    </span>
                                    <span className="badge bg-light text-dark">
                                        {user?.tipo_usuario === 'administrador' ? 'Administrador' : 'Despachador'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Breadcrumb */}
                    <div className="bg-light border-bottom">
                        <div className="container-fluid">
                            <nav aria-label="breadcrumb" className="py-2">
                                <ol className="breadcrumb mb-0">
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
                                        Crear Camión
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <main className="flex-grow-1 py-4">
                        <div className="container-fluid">
                            {/* Encabezado de la página */}
                            <div className="row justify-content-center">
                                <div className="col-lg-8">
                                    <div className="text-center mb-4">
                                        <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                             style={{ width: '80px', height: '80px' }}>
                                            <i className="fas fa-truck fa-2x text-white"></i>
                                        </div>
                                        <h2 className="mb-2">Registrar Nuevo Camión</h2>
                                        <p className="text-muted mb-0">
                                            Agrega un nuevo camión a la flota de la distribuidora
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Información y guía */}
                            <div className="row justify-content-center mb-4">
                                <div className="col-lg-8">
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-body text-center">
                                                    <div className="bg-info rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                                         style={{ width: '50px', height: '50px' }}>
                                                        <i className="fas fa-id-card text-white"></i>
                                                    </div>
                                                    <h6 className="card-title">Placa Obligatoria</h6>
                                                    <p className="card-text small text-muted">
                                                        El número de placa es el único campo obligatorio
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-body text-center">
                                                    <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                                         style={{ width: '50px', height: '50px' }}>
                                                        <i className="fas fa-camera text-white"></i>
                                                    </div>
                                                    <h6 className="card-title">Fotos Opcionales</h6>
                                                    <p className="card-text small text-muted">
                                                        Puedes agregar hasta 3 fotos después de crear el camión
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-body text-center">
                                                    <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                                         style={{ width: '50px', height: '50px' }}>
                                                        <i className="fas fa-route text-white"></i>
                                                    </div>
                                                    <h6 className="card-title">Asignación de Rutas</h6>
                                                    <p className="card-text small text-muted">
                                                        Los camiones activos pueden ser asignados a rutas
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-12">
                                            <div className="alert alert-info" role="alert">
                                                <div className="d-flex">
                                                    <div className="flex-shrink-0">
                                                        <i className="fas fa-lightbulb fa-lg"></i>
                                                    </div>
                                                    <div className="flex-grow-1 ms-3">
                                                        <h6 className="alert-heading">Consejos para el registro</h6>
                                                        <ul className="mb-0 small">
                                                            <li>Usa un formato claro para la placa (ej: CAM-001, P001-2024)</li>
                                                            <li>Verifica que la placa no esté registrada en otro camión</li>
                                                            <li>Los camiones se crean activos por defecto</li>
                                                            <li>Las fotos se pueden agregar después de crear el camión</li>
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
                                <Link href="/camiones" className="btn btn-outline-secondary">
                                    <i className="fas fa-arrow-left me-2"></i>
                                    Volver a Lista de Camiones
                                </Link>
                                
                                <div className="text-muted small">
                                    <i className="fas fa-shield-alt me-1"></i>
                                    Solo administradores pueden crear camiones
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Modal del formulario */}
                    {mostrarFormulario && (
                        <FormularioCamion
                            mostrar={mostrarFormulario}
                            onClose={handleClose}
                            onSuccess={handleSuccess}
                            camion={null}
                            modoEdicion={false}
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
                                        Sistema de Gestión v1.0 - Crear Camión
                                    </small>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </ProtectedRoute>
        </>
    );
};

export default CrearCamionPage;