import React, { useState } from 'react';
import { camionesAPI } from '../../utils/api';

const DetalleCamion = ({ show, onHide, camion, onEdit, onRefresh }) => {
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [tipoFoto, setTipoFoto] = useState('general');

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert('Solo se permiten archivos JPG, PNG y GIF');
                return;
            }
            
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 5MB');
                return;
            }
            
            setSelectedFile(file);
        }
    };

    const handleUploadPhoto = async () => {
        if (!selectedFile) {
            alert('Seleccione una foto primero');
            return;
        }

        if (camion.fotos && camion.fotos.length >= 3) {
            alert('Máximo 3 fotos por camión. Elimine una foto existente primero.');
            return;
        }

        setUploadingPhoto(true);
        
        try {
            const formData = new FormData();
            formData.append('foto', selectedFile);
            formData.append('camion_id', camion.id);
            formData.append('tipo_foto', tipoFoto);

            const response = await camionesAPI.subirFotos(formData);
            
            if (response.success) {
                // Toast notification
                if (window.bootstrap) {
                    const toast = new window.bootstrap.Toast(document.getElementById('successToast'));
                    document.getElementById('toastMessage').textContent = 'Foto subida exitosamente';
                    toast.show();
                }
                
                // Actualizar datos del camión
                onRefresh();
                setSelectedFile(null);
                document.getElementById('fileInput').value = '';
            } else {
                alert(response.message || 'Error al subir la foto');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al subir la foto');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const getEstadoBadgeClass = (estado) => {
        switch (estado) {
            case 'activo':
                return 'bg-success';
            case 'mantenimiento':
                return 'bg-warning';
            case 'reparacion':
                return 'bg-danger';
            case 'inactivo':
                return 'bg-secondary';
            default:
                return 'bg-secondary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!show || !camion) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-truck me-2"></i>
                            Detalles del Camión - {camion.placa}
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onHide}
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="row">
                            {/* Información Principal */}
                            <div className="col-md-8">
                                <div className="card mb-4">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Información Principal
                                        </h6>
                                        <button
                                            className="btn btn-sm btn-outline-warning"
                                            onClick={() => onEdit(camion)}
                                        >
                                            <i className="fas fa-edit me-1"></i>
                                            Editar
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label text-muted">Placa</label>
                                                <div className="fw-bold fs-5">{camion.placa}</div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <label className="form-label text-muted">Estado</label>
                                                <div>
                                                    <span className={`badge ${getEstadoBadgeClass(camion.estado)} fs-6`}>
                                                        {camion.estado_texto}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <label className="form-label text-muted">Marca</label>
                                                <div className="fw-bold">{camion.marca}</div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <label className="form-label text-muted">Modelo</label>
                                                <div className="fw-bold">{camion.modelo}</div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <label className="form-label text-muted">Año</label>
                                                <div>{camion.anio}</div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <label className="form-label text-muted">Capacidad de Carga</label>
                                                <div className="fw-bold text-primary">
                                                    {camion.capacidad_carga} Toneladas
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <label className="form-label text-muted">Tipo de Combustible</label>
                                                <div>{camion.combustible_texto}</div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <label className="form-label text-muted">Edad del Vehículo</label>
                                                <div>
                                                    {new Date().getFullYear() - camion.anio} años
                                                </div>
                                            </div>
                                            
                                            {camion.descripcion && (
                                                <div className="col-12">
                                                    <label className="form-label text-muted">Descripción</label>
                                                    <div className="bg-light p-2 rounded">
                                                        {camion.descripcion}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Rutas Asignadas */}
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-route me-2"></i>
                                            Rutas Asignadas ({camion.rutas_asignadas?.length || 0})
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        {camion.rutas_asignadas && camion.rutas_asignadas.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Número</th>
                                                            <th>Recorrido</th>
                                                            <th>Grupo</th>
                                                            <th>Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {camion.rutas_asignadas.map(ruta => (
                                                            <tr key={ruta.id}>
                                                                <td>
                                                                    <span className="badge bg-info">
                                                                        {ruta.numero_ruta}
                                                                    </span>
                                                                </td>
                                                                <td>{ruta.lugar_recorrido}</td>
                                                                <td>
                                                                    <span className={`badge ${ruta.grupo_productos === 'big_cola' ? 'bg-primary' : 'bg-secondary'}`}>
                                                                        {ruta.grupo_productos === 'big_cola' ? 'Big Cola' : 'Otros Productos'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${ruta.estado === 'activa' ? 'bg-success' : 'bg-secondary'}`}>
                                                                        {ruta.estado === 'activa' ? 'Activa' : 'Inactiva'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-3">
                                                <i className="fas fa-route fa-2x mb-2"></i>
                                                <p>No hay rutas asignadas a este camión</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Panel Lateral - Fotos y Metadata */}
                            <div className="col-md-4">
                                {/* Fotos del Camión */}
                                <div className="card mb-4">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">
                                            <i className="fas fa-camera me-2"></i>
                                            Fotos ({camion.fotos?.length || 0}/3)
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        {/* Galería de fotos */}
                                        {camion.fotos && camion.fotos.length > 0 ? (
                                            <div className="row g-2 mb-3">
                                                {camion.fotos.map(foto => (
                                                    <div key={foto.id} className="col-12">
                                                        <div className="card">
                                                            <img
                                                                src={foto.ruta_archivo}
                                                                className="card-img-top"
                                                                alt={`Foto ${foto.tipo_foto}`}
                                                                style={{ height: '150px', objectFit: 'cover' }}
                                                                onError={(e) => {
                                                                    e.target.src = '/assets/images/default-truck.png';
                                                                }}
                                                            />
                                                            <div className="card-body p-2">
                                                                <small className="text-muted">
                                                                    <i className="fas fa-tag me-1"></i>
                                                                    {foto.tipo_foto}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted mb-3">
                                                <i className="fas fa-camera fa-2x mb-2"></i>
                                                <p className="mb-0">No hay fotos</p>
                                            </div>
                                        )}

                                        {/* Subir nueva foto */}
                                        {(!camion.fotos || camion.fotos.length < 3) && (
                                            <div className="border-top pt-3">
                                                <h6 className="mb-2">Subir Nueva Foto</h6>
                                                
                                                <div className="mb-2">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={tipoFoto}
                                                        onChange={(e) => setTipoFoto(e.target.value)}
                                                    >
                                                        <option value="general">General</option>
                                                        <option value="frontal">Frontal</option>
                                                        <option value="lateral">Lateral</option>
                                                        <option value="posterior">Posterior</option>
                                                        <option value="interior">Interior</option>
                                                    </select>
                                                </div>
                                                
                                                <div className="mb-2">
                                                    <input
                                                        type="file"
                                                        id="fileInput"
                                                        className="form-control form-control-sm"
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                        disabled={uploadingPhoto}
                                                    />
                                                </div>
                                                
                                                <button
                                                    className="btn btn-sm btn-primary w-100"
                                                    onClick={handleUploadPhoto}
                                                    disabled={!selectedFile || uploadingPhoto}
                                                >
                                                    {uploadingPhoto ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                                            Subiendo...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-upload me-1"></i>
                                                            Subir Foto
                                                        </>
                                                    )}
                                                </button>
                                                
                                                <small className="text-muted d-block mt-1">
                                                    Máximo 5MB. JPG, PNG, GIF
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-info me-2"></i>
                                            Información del Sistema
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label text-muted">Creado por</label>
                                            <div>{camion.created_by_name || 'N/A'}</div>
                                            <small className="text-muted">{formatDate(camion.created_at)}</small>
                                        </div>
                                        
                                        {camion.updated_at && camion.updated_at !== camion.created_at && (
                                            <div className="mb-3">
                                                <label className="form-label text-muted">Última modificación</label>
                                                <div>{camion.updated_by_name || 'N/A'}</div>
                                                <small className="text-muted">{formatDate(camion.updated_at)}</small>
                                            </div>
                                        )}
                                        
                                        <div className="row g-2 text-center">
                                            <div className="col-6">
                                                <div className="bg-light p-2 rounded">
                                                    <div className="fw-bold text-primary">
                                                        {camion.rutas_asignadas?.length || 0}
                                                    </div>
                                                    <small className="text-muted">Rutas</small>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="bg-light p-2 rounded">
                                                    <div className="fw-bold text-success">
                                                        {camion.fotos?.length || 0}/3
                                                    </div>
                                                    <small className="text-muted">Fotos</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onHide}
                        >
                            Cerrar
                        </button>
                        <button
                            className="btn btn-warning"
                            onClick={() => onEdit(camion)}
                        >
                            <i className="fas fa-edit me-2"></i>
                            Editar Camión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleCamion;