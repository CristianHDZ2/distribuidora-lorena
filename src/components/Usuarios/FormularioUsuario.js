import React, { useState, useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';

const FormularioUsuario = ({ usuario, modoEdicion, onClose, onSuccess }) => {
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
        nueva_password: '',
        confirmar_nueva_password: '',
        direccion: '',
        fecha_nacimiento: ''
    });
    
    const [fotoPreview, setFotoPreview] = useState(null);
    const [archivoFoto, setArchivoFoto] = useState(null);

    // Cargar datos del usuario si está en modo edición
    useEffect(() => {
        if (modoEdicion && usuario) {
            // Dividir nombre completo en nombre y apellido
            const nombreCompleto = usuario.nombre_completo || '';
            const partesNombre = nombreCompleto.split(' ');
            const nombre = partesNombre[0] || '';
            const apellido = partesNombre.slice(1).join(' ') || '';

            setFormData({
                dui: usuario.dui || '',
                nombre: nombre,
                apellido: apellido,
                telefono: usuario.telefono || '',
                email: usuario.email || '',
                tipo_usuario: usuario.tipo_usuario || 'despachador',
                estado: usuario.estado || 'activo',
                password: '',
                confirmar_password: '',
                nueva_password: '',
                confirmar_nueva_password: '',
                direccion: usuario.direccion || '',
                fecha_nacimiento: usuario.fecha_nacimiento || ''
            });
            
            // Mostrar foto existente si la tiene
            if (usuario.foto_perfil) {
                setFotoPreview(`/api/uploads/usuarios/${usuario.foto_perfil}`);
            }
        } else {
            // Limpiar formulario para nuevo usuario
            setFormData({
                dui: '',
                nombre: '',
                apellido: '',
                telefono: '',
                email: '',
                tipo_usuario: 'despachador',
                estado: 'activo',
                password: '',
                confirmar_password: '',
                nueva_password: '',
                confirmar_nueva_password: '',
                direccion: '',
                fecha_nacimiento: ''
            });
            setFotoPreview(null);
            setArchivoFoto(null);
        }
    }, [modoEdicion, usuario]);

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
        if (!modoEdicion) {
            if (!formData.password || formData.password.length < 6) {
                errores.push('La contraseña debe tener al menos 6 caracteres');
            }
            if (formData.password !== formData.confirmar_password) {
                errores.push('Las contraseñas no coinciden');
            }
        } else {
            // En modo edición, solo validar si se quiere cambiar la contraseña
            if (formData.nueva_password) {
                if (formData.nueva_password.length < 6) {
                    errores.push('La nueva contraseña debe tener al menos 6 caracteres');
                }
                if (formData.nueva_password !== formData.confirmar_nueva_password) {
                    errores.push('Las nuevas contraseñas no coinciden');
                }
            }
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
            
            setSuccess(modoEdicion ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
            
            setTimeout(() => {
                onSuccess();
            }, 1500);
            
        } catch (err) {
            setError('Error al procesar la solicitud: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Manejar cierre del modal (incluir backdrop click)
    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="modal fade show" 
            style={{ 
                display: 'block', 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                zIndex: 1050 
            }}
            onClick={handleModalClick}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-user-plus me-2"></i>
                            {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
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
                                        {modoEdicion ? 'Cambiar Contraseña (Opcional)' : 'Contraseña'}
                                    </h6>
                                </div>
                            </div>

                            {!modoEdicion ? (
                                <div className="row">
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
                            ) : (
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="nueva_password"
                                            value={formData.nueva_password}
                                            onChange={handleInputChange}
                                            placeholder="Dejar vacío para mantener actual"
                                        />
                                        <small className="text-muted">
                                            Solo completa si deseas cambiar la contraseña
                                        </small>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Confirmar Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="confirmar_nueva_password"
                                            value={formData.confirmar_nueva_password}
                                            onChange={handleInputChange}
                                            placeholder="Confirma la nueva contraseña"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Información adicional para modo edición */}
                            {modoEdicion && usuario && (
                                <div className="row">
                                    <div className="col-12">
                                        <div className="alert alert-info">
                                            <h6 className="alert-heading">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Información del Usuario
                                            </h6>
                                            <p className="mb-0">
                                                <strong>Creado el:</strong> {new Date(usuario.fecha_creacion).toLocaleDateString('es-SV')}<br />
                                                <strong>Último acceso:</strong> {new Date(usuario.ultimo_acceso).toLocaleString('es-SV')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer" style={{ flexShrink: 0 }}>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onClose}
                                disabled={loading}
                            >
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
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save me-2"></i>
                                        {modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormularioUsuario;