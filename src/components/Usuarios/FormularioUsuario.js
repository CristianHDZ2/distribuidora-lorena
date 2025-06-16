import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';

const FormularioUsuario = ({ usuario, modoEdicion, onClose, onSuccess }) => {
    const { token } = useAuth();
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
        confirmar_nueva_password: ''
    });
    
    const [fotoPreview, setFotoPreview] = useState(null);
    const [archivoFoto, setArchivoFoto] = useState(null);

    // Cargar datos del usuario si está en modo edición
    useEffect(() => {
        if (modoEdicion && usuario) {
            setFormData({
                dui: usuario.dui,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                telefono: usuario.telefono,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario,
                estado: usuario.estado,
                password: '',
                confirmar_password: '',
                nueva_password: '',
                confirmar_nueva_password: ''
            });
            
            // Mostrar foto existente si la tiene
            if (usuario.foto_perfil) {
                setFotoPreview(`/api/uploads/usuarios/${usuario.foto_perfil}`);
            }
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

    // Manejar selección de foto
    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!tiposPermitidos.includes(file.type)) {
                setError('Solo se permiten archivos JPG, JPEG y PNG');
                return;
            }
            
            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                setError('El archivo es demasiado grande. Máximo 5MB');
                return;
            }
            
            setArchivoFoto(file);
            
            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setFotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    // Remover foto
    const removerFoto = () => {
        setArchivoFoto(null);
        setFotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Validar formulario
    const validarFormulario = () => {
        const errores = [];
        
        if (!formData.dui.trim()) {
            errores.push('El DUI es requerido');
        } else if (!/^\d{8}-\d$/.test(formData.dui)) {
            errores.push('Formato de DUI inválido');
        }
        
        if (!formData.nombre.trim()) {
            errores.push('El nombre es requerido');
        } else if (formData.nombre.trim().length < 2) {
            errores.push('El nombre debe tener al menos 2 caracteres');
        }
        
        if (!formData.apellido.trim()) {
            errores.push('El apellido es requerido');
        } else if (formData.apellido.trim().length < 2) {
            errores.push('El apellido debe tener al menos 2 caracteres');
        }
        
        if (!formData.telefono.trim()) {
            errores.push('El teléfono es requerido');
        } else if (!/^[267]\d{3}-\d{4}$/.test(formData.telefono)) {
            errores.push('Formato de teléfono inválido');
        }
        
        if (!formData.email.trim()) {
            errores.push('El email es requerido');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errores.push('Formato de email inválido');
        }
        
        if (!modoEdicion) {
            if (!formData.password) {
                errores.push('La contraseña es requerida');
            } else if (formData.password.length < 6) {
                errores.push('La contraseña debe tener al menos 6 caracteres');
            }
            
            if (formData.password !== formData.confirmar_password) {
                errores.push('Las contraseñas no coinciden');
            }
        } else {
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
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            let response;
            
            if (modoEdicion) {
                // Actualizar usuario
                const datosActualizar = {
                    id: usuario.id,
                    dui: formData.dui,
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    telefono: formData.telefono,
                    email: formData.email,
                    tipo_usuario: formData.tipo_usuario,
                    estado: formData.estado
                };
                
                if (formData.nueva_password) {
                    datosActualizar.nueva_password = formData.nueva_password;
                }
                
                response = await fetch('/api/usuarios/editar_usuario.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(datosActualizar)
                });
            } else {
                // Crear usuario
                response = await fetch('/api/usuarios/crear_usuario.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        dui: formData.dui,
                        nombre: formData.nombre,
                        apellido: formData.apellido,
                        telefono: formData.telefono,
                        email: formData.email,
                        tipo_usuario: formData.tipo_usuario,
                        password: formData.password
                    })
                });
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Si hay foto, subirla
                if (archivoFoto) {
                    await subirFoto(modoEdicion ? usuario.id : data.usuario.id);
                }
                
                setSuccess(data.message);
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Subir foto
    const subirFoto = async (usuarioId) => {
        if (!archivoFoto) return;
        
        const formDataFoto = new FormData();
        formDataFoto.append('foto', archivoFoto);
        formDataFoto.append('usuario_id', usuarioId);
        
        const response = await fetch('/api/usuarios/upload_foto.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formDataFoto
        });
        
        const data = await response.json();
        if (!data.success) {
            throw new Error('Error al subir la foto: ' + data.error);
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className={`fas ${modoEdicion ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                            {modoEdicion ? 'Editar Usuario' : 'Crear Usuario'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Alertas */}
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
                                    <label className="form-label">Foto de perfil</label>
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            {fotoPreview ? (
                                                <img
                                                    src={fotoPreview}
                                                    alt="Preview"
                                                    className="rounded-circle"
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div 
                                                    className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
                                                    style={{ width: '80px', height: '80px' }}
                                                >
                                                    <i className="fas fa-user fa-2x"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="form-control mb-2"
                                                accept="image/jpeg,image/jpg,image/png"
                                                onChange={handleFotoChange}
                                            />
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <i className="fas fa-upload me-1"></i>
                                                    Seleccionar
                                                </button>
                                                {fotoPreview && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={removerFoto}
                                                    >
                                                        <i className="fas fa-trash me-1"></i>
                                                        Remover
                                                    </button>
                                                )}
                                            </div>
                                            <small className="text-muted">
                                                JPG, JPEG o PNG. Máximo 5MB
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Datos personales */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">DUI *</label>
                                    <input
                                        type="text"
                                        name="dui"
                                        className="form-control"
                                        placeholder="12345678-9"
                                        value={formData.dui}
                                        onChange={handleInputChange}
                                        maxLength="10"
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Teléfono *</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        className="form-control"
                                        placeholder="7XXX-XXXX"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        maxLength="9"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        className="form-control"
                                        placeholder="Ingresa el nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Apellido *</label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        className="form-control"
                                        placeholder="Ingresa el apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="usuario@ejemplo.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            {/* Configuración del usuario */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Tipo de usuario *</label>
                                    <select
                                        name="tipo_usuario"
                                        className="form-select"
                                        value={formData.tipo_usuario}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="despachador">Despachador</option>
                                        <option value="administrador">Administrador</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Estado</label>
                                    <select
                                        name="estado"
                                        className="form-select"
                                        value={formData.estado}
                                        onChange={handleInputChange}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Contraseñas */}
                            {!modoEdicion ? (
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Contraseña *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control"
                                            placeholder="Mínimo 6 caracteres"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            minLength="6"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Confirmar contraseña *</label>
                                        <input
                                            type="password"
                                            name="confirmar_password"
                                            className="form-control"
                                            placeholder="Confirma la contraseña"
                                            value={formData.confirmar_password}
                                            onChange={handleInputChange}
                                            minLength="6"
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <hr />
                                    <h6 className="text-muted mb-3">
                                        <i className="fas fa-key me-2"></i>
                                        Cambiar contraseña (opcional)
                                    </h6>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Nueva contraseña</label>
                                            <input
                                                type="password"
                                                name="nueva_password"
                                                className="form-control"
                                                placeholder="Dejar vacío para mantener actual"
                                                value={formData.nueva_password}
                                                onChange={handleInputChange}
                                                minLength="6"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Confirmar nueva contraseña</label>
                                            <input
                                                type="password"
                                                name="confirmar_nueva_password"
                                                className="form-control"
                                                placeholder="Confirma la nueva contraseña"
                                                value={formData.confirmar_nueva_password}
                                                onChange={handleInputChange}
                                                minLength="6"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="modal-footer">
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
                                        {modoEdicion ? 'Actualizando...' : 'Creando...'}
                                    </>
                                ) : (
                                    <>
                                        <i className={`fas ${modoEdicion ? 'fa-save' : 'fa-plus'} me-2`}></i>
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