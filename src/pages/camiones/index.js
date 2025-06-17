import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import ListaCamiones from '../../components/Camiones/ListaCamiones';

const CamionesPage = () => {
    return (
        <ProtectedRoute>
            <Head>
                <title>Gestión de Camiones - Distribuidora Lorena</title>
                <meta name="description" content="Sistema de gestión de camiones para distribuidora de bebidas" />
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
                                        <small className="text-muted">Sistema de Gestión de Camiones</small>
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
                                            <li className="breadcrumb-item active" aria-current="page">
                                                <i className="fas fa-truck"></i> Camiones
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
                    <ListaCamiones />
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default CamionesPage;