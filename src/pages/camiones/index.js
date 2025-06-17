// src/pages/camiones/index.js
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import ListaCamiones from '../../components/Camiones/ListaCamiones';

const CamionesPage = () => {
    return (
        <ProtectedRoute requiredPermission="manage_trucks">
            <Head>
                <title>Gestión de Camiones - Distribuidora Lorena</title>
                <meta name="description" content="Gestión y administración de la flota de camiones" />
            </Head>
            
            <div className="min-vh-100 bg-light">
                {/* Navigation breadcrumb */}
                <div className="bg-white border-bottom">
                    <div className="container-fluid">
                        <nav aria-label="breadcrumb" className="py-2">
                            <ol className="breadcrumb mb-0">
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
                </div>

                {/* Main content */}
                <ListaCamiones />
            </div>
        </ProtectedRoute>
    );
};

export default CamionesPage;