import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { camionesAPI } from '../../utils/api';

const NuevoCamion = () => {
    const { user } = useAuth();
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        numero_placa: '',
        activo: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errores, setErrores] = useState({});

    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validar número de placa
        if (!formData.numero_placa.trim()) {
            nuevosErrores.numero_placa = 'El número de placa es obligatorio';
        } else if (!/^[A-Z0-9\-]{1,10}$/.test(formData.numero_placa.toUpperCase())) {
            nuevosErrores.numero_placa = 'Formato de placa inválido (solo letras, números y guiones)';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const formatearPlaca = (valor) => {
        // Convertir a mayúsculas y eliminar caracteres no válidos
        let placaLimpia = valor.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
        
        // Limitar longitud
        if (placaLimpia.length > 10) {
            placaLimpia = placaLimpia.substring(0, 10);
        }
        
        return placaLimpia;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'numero_placa') {
            const placaFormateada = formatearPlaca(value);
            setFormData(prev => ({
                ...prev,
                [name]: placaFormateada
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errores[name]) {
            setErrores(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await camionesAPI.crear(formData);
            
            if (response.success) {
                // Redireccionar con mensaje de éxito
                router.push('/camiones?success=' + encodeURIComponent(response.message));
            }
        } catch (error) {
            console.error('Error al crear camión:', error);
            setError(error.response?.data?.error || 'Error al crear el camión');
        } finally {
            setLoading(false);
        }
    };

    const handleVolver = () => {
        router.push('/camiones');
    };

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
                                Nuevo Camión
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Contenido principal */}
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">
                                        <i className="fas fa-plus me-2"></i>
                                        Registrar Nuevo Camión
                                    </h5>
                                </div>
                                
                                <div className="card-body">
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-8">
                                                <div className="mb-4">
                                                    <label htmlFor="numero_placa" className="form-label">
                                                        Número de Placa <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-lg ${errores.numero_placa ? 'is-invalid' : ''}`}
                                                        id="numero_placa"
                                                        name="numero_placa"
                                                        value={formData.numero_placa}
                                                        onChange={handleChange}
                                                        placeholder="Ejemplo: P001-2024"
                                                        maxLength="10"
                                                        disabled={loading}
                                                        autoFocus
                                                    />
                                                    {errores.numero_placa && (
                                                        <div className="invalid-feedback">
                                                            {errores.numero_placa}
                                                        </div>
                                                    )}
                                                    <div className="form-text">
                                                        <i className="fas fa-info-circle me-1"></i>
                                                        Formato: Solo letras, números y guiones. Máximo 10 caracteres.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="mb-4">
                                                    <label className="form-label">Estado del Camión</label>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="activo"
                                                            name="activo"
                                                            checked={formData.activo}
                                                            onChange={handleChange}
                                                            disabled={loading}
                                                        />
                                                        <label className="form-check-label" htmlFor="activo">
                                                            <span className={`badge ${formData.activo ? 'bg-success' : 'bg-secondary'}`}>
                                                                {formData.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div className="form-text">
                                                        Solo los camiones activos pueden ser asignados a rutas
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        <div className="alert alert-info" role="alert">
                                            <i className="fas fa-lightbulb me-2"></i>
                                            <strong>Información:</strong> Después de crear el camión, podrás subir hasta 3 fotos 
                                            del vehículo desde la lista de camiones. Las fotos ayudan a identificar el camión 
                                            pero no son obligatorias.
                                        </div>

                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            <button
                                                type="button"
                                                className="btn btn-secondary me-md-2"
                                                onClick={handleVolver}
                                                disabled={loading}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Volver a Lista
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Creando Camión...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-save me-2"></i>
                                                        Crear Camión
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
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
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
};

export default NuevoCamion;