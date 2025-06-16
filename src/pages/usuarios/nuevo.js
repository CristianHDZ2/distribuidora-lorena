import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import FormularioUsuario from '../../components/Usuarios/FormularioUsuario';

const NuevoUsuarioPage = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [success, setSuccess] = useState('');

    const handleLogout = async () => {
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            await logout();
        }
    };

    const handleSuccess = () => {
        setSuccess('Usuario creado correctamente');
        setTimeout(() => {
            router.push('/usuarios');
        }, 2000);
    };

    const handleCancel = () => {
        router.push('/usuarios');
    };

    return (
        <ProtectedRoute requiredPermissions={['manage_users']}>
            <Head>
                <title>Nuevo Usuario - Distribuidora Lorena</title>
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
                            <li className="breadcrumb-item">
                                <Link href="/usuarios">Usuarios</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Nuevo Usuario
                            </li>
                        </ol>
                    </nav>

                    {/* Mensaje de éxito */}
                    {success && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <i className="fas fa-check-circle me-2"></i>
                            {success}
                            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                        </div>
                    )}

                    {/* Título */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h1 className="h3 mb-1">
                                        <i className="fas fa-user-plus me-2 text-primary"></i>
                                        Nuevo Usuario
                                    </h1>
                                    <p className="text-muted mb-0">
                                        Crear un nuevo usuario en el sistema
                                    </p>
                                </div>
                                <div>
                                    <Link href="/usuarios" className="btn btn-outline-secondary">
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Volver a Usuarios
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario en tarjeta */}
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-10 col-xl-8">
                            <div className="card shadow-sm">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">
                                        <i className="fas fa-user-plus me-2"></i>
                                        Información del Nuevo Usuario
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <FormularioUsuarioInline 
                                        onSuccess={handleSuccess}
                                        onCancel={handleCancel}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
};

// Componente de formulario inline (sin modal)
const FormularioUsuarioInline = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        dui: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        tipo_usuario: 'despachador',
        estado: 'activo',
        password: '',
        confirmar_password: '',
        direccion: '',
        fecha_nacimiento: ''
    });
    
    const [fotoPreview, setFotoPreview] = useState(null);
    const [archivoFoto, setArchivoFoto] = useState(null);

    // Manejar cambios en inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Formatear DUI automáticamente
        if (name === 'dui') {
            let valorLimpio = value.replace(/\D/g, '');
            if (valorLimpio.length >= 8) {
                valorLimpio = valorLimpio.substring(0, 8) + '-' + valorLimpio.substring(8, 9);
            }
            setFormData(prev => ({
                ...prev,
                [name]: valorLimpio
            }));
            return;
        }

        // Formatear teléfono automáticamente
        if (name === 'telefono') {
            let valorLimpio = value.replace(/\D/g, '');
            if (valorLimpio.length >= 4) {
                valorLimpio = valorLimpio.substring(0, 4) + '-' + valorLimpio.substring(4, 8);
            }
            setFormData(prev => ({
                ...prev,
                [name]: valorLimpio
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar cambio de foto
    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setError('Por favor, selecciona una imagen válida');
                return;
            }

            // Validar tamaño (máximo 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('La imagen no debe superar los 2MB');
                return;
            }

            setArchivoFoto(file);
            
            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setFotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Validar formulario
    const validarFormulario = () => {
        const errores = [];

        // Validar DUI
        if (!formData.dui || formData.dui.length !== 10) {
            errores.push('El DUI debe tener el formato correcto (12345678-9)');
        }

        // Validar nombre y apellido
        if (!formData.nombre.trim()) {
            errores.push('El nombre es requerido');
        }
        if (!formData.apellido.trim()) {
            errores.push('El apellido es requerido');
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errores.push('El email debe tener un formato válido');
        }

        // Validar teléfono
        if (!formData.telefono || formData.telefono.length !== 9) {
            errores.push('El teléfono debe tener el formato correcto (7777-7777)');
        }

        // Validar contraseñas
        if (!formData.password || formData.password.length < 6) {
            errores.push('La contraseña debe tener al menos 6 caracteres');
        }
        if (formData.password !== formData.confirmar_password) {
            errores.push('Las contraseñas no coinciden');
        }

        return errores;
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errores = validarFormulario();
        if (errores.length > 0) {
            setError(errores.join(', '));
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Por ahora simulamos el envío
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccess('Usuario creado correctamente');
            
            setTimeout(() => {
                onSuccess();
            }, 1500);
            
        } catch (err) {
            setError('Error al procesar la solicitud: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Mensajes de estado */}
            {error && (
                <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                </div>
            )}

            {/* Foto de perfil */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">
                                <i className="fas fa-image me-2"></i>
                                Foto de Perfil
                            </h6>
                        </div>
                        <div className="card-body text-center">
                            <div className="mb-3">
                                {fotoPreview ? (
                                    <img
                                        src={fotoPreview}
                                        alt="Preview"
                                        className="rounded-circle"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                                        style={{ width: '100px', height: '100px' }}
                                    >
                                        <i className="fas fa-user text-muted fs-2"></i>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleFotoChange}
                                ref={fileInputRef}
                            />
                            <small className="text-muted">
                                Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 2MB
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información personal */}
            <div className="row mb-3">
                <div className="col-12">
                    <h6 className="border-bottom pb-2 mb-3">
                        <i className="fas fa-user me-2"></i>
                        Información Personal
                    </h6>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        DUI <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="dui"
                        value={formData.dui}
                        onChange={handleInputChange}
                        placeholder="12345678-9"
                        maxLength="10"
                        required
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Teléfono <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="7777-7777"
                        maxLength="9"
                        required
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Ingresa el nombre"
                        required
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Apellido <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        placeholder="Ingresa el apellido"
                        required
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Email <span className="text-danger">*</span>
                    </label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="usuario@distribuidora.com"
                        required
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Nacimiento</label>
                    <input
                        type="date"
                        className="form-control"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-12 mb-3">
                    <label className="form-label">Dirección</label>
                    <textarea
                        className="form-control"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder="Dirección completa del usuario"
                        rows="2"
                    />
                </div>
            </div>

            {/* Información del sistema */}
            <div className="row mb-3">
                <div className="col-12">
                    <h6 className="border-bottom pb-2 mb-3">
                        <i className="fas fa-cog me-2"></i>
                        Configuración del Sistema
                    </h6>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Tipo de Usuario <span className="text-danger">*</span>
                    </label>
                    <select
                        className="form-select"
                        name="tipo_usuario"
                        value={formData.tipo_usuario}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="despachador">Despachador</option>
                        <option value="administrador">Administrador</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Estado <span className="text-danger">*</span>
                    </label>
                    <select
                        className="form-select"
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
            </div>

            {/* Contraseñas */}
            <div className="row mb-3">
                <div className="col-12">
                    <h6 className="border-bottom pb-2 mb-3">
                        <i className="fas fa-lock me-2"></i>
                        Contraseña
                    </h6>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Contraseña <span className="text-danger">*</span>
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        required
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Confirmar Contraseña <span className="text-danger">*</span>
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        name="confirmar_password"
                        value={formData.confirmar_password}
                        onChange={handleInputChange}
                        placeholder="Repite la contraseña"
                        required
                    />
                </div>
            </div>

            {/* Botones */}
            <div className="d-flex gap-2 justify-content-end">
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={onCancel}
                    disabled={loading}
                >
                    <i className="fas fa-times me-2"></i>
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Creando Usuario...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-save me-2"></i>
                            Crear Usuario
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default NuevoUsuarioPage;