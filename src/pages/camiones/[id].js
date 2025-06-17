import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import DetalleCamion from '../../components/Camiones/DetalleCamion';
import FormularioCamion from '../../components/Camiones/FormularioCamion';
import { camionesAPI } from '../../utils/api';

const DetalleCamionPage = () => {
    const router = useRouter();
    const { id } = router.query;
    
    const [camion, setCamion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (id) {
            cargarCamion();
        }
    }, [id]);

    const cargarCamion = async () => {
        try {
            setLoading(true);
            const response = await camionesAPI.obtener(parseInt(id));
            
            if (response.success) {
                setCamion(response.data);
            } else {
                setError(response.message || 'Camión no encontrado');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al cargar el camión');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (camionData) => {
        setCamion(camionData);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        cargarCamion(); // Recargar datos actualizados
    };

    const handleBackToList = () => {
        router.push('/camiones');
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermission="manage_trucks">
                <div className="min-vh-100 d-flex justify-content-center align-items-center">
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="text-muted">Cargando información del camión...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute requiredPermission="manage_trucks">
                <Head>
                    <title>Error - Distribuidora Lorena</title>
                </Head>
                
                <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
                    <div className="text-center">
                        <div className="card shadow">
                            <div className="card-body p-5">
                                <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                                <h4 className="text-danger">Error al cargar el camión</h4>
                                <p className="text-muted mb-4">{error}</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleBackToList}
                                >
                                    <i className="fas fa-arrow-left me-2"></i>
                                    Volver a la Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission="manage_trucks">
            <Head>
                <title>{`Camión ${camion?.placa} - Distribuidora Lorena`}</title>
                <meta name="description" content={`Detalles del camión ${camion?.placa} - ${camion?.marca} ${camion?.modelo}`} />
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
                                        <small className="text-muted">
                                            Camión {camion?.placa} - {camion?.marca} {camion?.modelo}
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="d-flex justify-content-end align-items-center">
                                    <button 
                                        className="btn btn-outline-secondary me-3"
                                        onClick={handleBackToList}
                                    >
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Volver a la Lista
                                    </button>
                                    
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb mb-0">
                                            <li className="breadcrumb-item">
                                                <a href="/dashboard" className="text-decoration-none">
                                                    <i className="fas fa-home"></i> Dashboard
                                                </a>
                                            </li>
                                            <li className="breadcrumb-item">
                                                <a href="/camiones" className="text-decoration-none">
                                                    <i className="fas fa-truck"></i> Camiones
                                                </a>
                                            </li>
                                            <li className="breadcrumb-item active" aria-current="page">
                                                {camion?.placa}
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
                    {camion && (
                        <DetalleCamion
                            show={true}
                            onHide={handleBackToList}
                            camion={camion}
                            onEdit={handleEdit}
                            onRefresh={cargarCamion}
                        />
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            {showEditModal && camion && (
                <FormularioCamion
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    camion={camion}
                    isEditing={true}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Toast Notifications */}
            <div className="toast-container position-fixed top-0 end-0 p-3">
                <div id="successToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header bg-success text-white">
                        <i className="fas fa-check-circle me-2"></i>
                        <strong className="me-auto">Éxito</strong>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                    </div>
                    <div className="toast-body">
                        <span id="toastMessage">Operación completada exitosamente</span>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default DetalleCamionPage;