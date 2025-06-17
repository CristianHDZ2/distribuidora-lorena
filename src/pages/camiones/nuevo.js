import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import FormularioCamion from '../../components/Camiones/FormularioCamion';

const NuevoCamionPage = () => {
    const router = useRouter();
    const [showForm, setShowForm] = useState(true);

    const handleSuccess = () => {
        // Redirigir a la lista de camiones después de crear exitosamente
        router.push('/camiones');
    };

    const handleCancel = () => {
        // Redirigir a la lista de camiones si cancela
        router.push('/camiones');
    };

    return (
        <ProtectedRoute requiredPermission="manage_trucks">
            <Head>
                <title>Nuevo Camión - Distribuidora Lorena</title>
                <meta name="description" content="Crear nuevo camión en el sistema" />
            </Head>

            <div className="min-vh-100 bg-light">
                {/* Header */}
                <div className="bg-white shadow-sm border-bottom">
                    <div className="container-fluid">
                        <div className="row align-items-center py-3">
                            <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                    <img 
                                        src="/logo.png" 
                                        alt="Logo" 
                                        className="me-3"
                                        style={{ height: '40px' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div>
                                        <h4 className="mb-0 text-primary">Distribuidora Lorena</h4>
                                        <small className="text-muted">Crear Nuevo Camión</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="d-flex justify-content-end align-items-center">
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb mb-0">
                                            <li className="breadcrumb-item">
                                                <Link href="/dashboard" className="text-decoration-none">
                                                    <i className="fas fa-home"></i> Dashboard
                                                </Link>
                                            </li>
                                            <li className="breadcrumb-item">
                                                <Link href="/camiones" className="text-decoration-none">
                                                    <i className="fas fa-truck"></i> Camiones
                                                </Link>
                                            </li>
                                            <li className="breadcrumb-item active" aria-current="page">
                                                <i className="fas fa-plus"></i> Nuevo
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">
                                        <i className="fas fa-truck me-2"></i>
                                        Registrar Nuevo Camión
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted mb-4">
                                        Complete la información requerida para registrar un nuevo camión en el sistema.
                                        Los campos marcados con asterisco (*) son obligatorios.
                                    </p>
                                    
                                    {/* Formulario embebido */}
                                    <FormularioCamion
                                        show={showForm}
                                        onHide={handleCancel}
                                        camion={null}
                                        isEditing={false}
                                        onSuccess={handleSuccess}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <div className="toast-container position-fixed top-0 end-0 p-3">
                <div id="successToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header bg-success text-white">
                        <i className="fas fa-check-circle me-2"></i>
                        <strong className="me-auto">Éxito</strong>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                    </div>
                    <div className="toast-body">
                        <span id="toastMessage">Camión creado exitosamente</span>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default NuevoCamionPage;