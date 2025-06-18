import React, { useState } from 'react';
import { camionesAPI } from '../../utils/api';

const FotosCamion = ({ mostrar, onClose, camion, onFotosActualizadas }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [subiendoFoto, setSubiendoFoto] = useState(null); // foto1, foto2, foto3
    const [previewFoto, setPreviewFoto] = useState(null);

    if (!mostrar || !camion) return null;

    const handleSubirFoto = async (posicion, archivo) => {
        if (!archivo) return;

        // Validaciones
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!tiposPermitidos.includes(archivo.type)) {
            setError('Solo se permiten archivos JPG, JPEG y PNG');
            return;
        }

        const tamaximoMaximo = 5 * 1024 * 1024; // 5MB
        if (archivo.size > tamaximoMaximo) {
            setError('El archivo no puede superar 5MB');
            return;
        }

        setSubiendoFoto(posicion);
        setError('');
        setPreviewFoto(null);

        try {
            const formData = new FormData();
            formData.append('foto', archivo);
            formData.append('camion_id', camion.id);
            formData.append('posicion_foto', posicion);

            const response = await camionesAPI.subirFotos(formData);
            
            if (response.success) {
                onFotosActualizadas();
                // Actualizar el camión local con las nuevas fotos
                Object.assign(camion, response.fotos);
            }
        } catch (error) {
            console.error('Error al subir foto:', error);
            setError(error.response?.data?.error || 'Error al subir la foto');
        } finally {
            setSubiendoFoto(null);
        }
    };

    const handleInputChange = (posicion) => (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            // Mostrar preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewFoto({
                    posicion: posicion,
                    url: e.target.result,
                    archivo: archivo
                });
            };
            reader.readAsDataURL(archivo);
        }
    };

    const confirmarSubida = () => {
        if (previewFoto) {
            handleSubirFoto(previewFoto.posicion, previewFoto.archivo);
            setPreviewFoto(null);
        }
    };

    const cancelarPreview = () => {
        setPreviewFoto(null);
        // Limpiar inputs de archivo
        document.querySelectorAll('input[type="file"]').forEach(input => {
            input.value = '';
        });
    };

    const eliminarFoto = async (posicion) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la ${posicion}?`)) {
            return;
        }

        setSubiendoFoto(posicion);
        setError('');

        try {
            // Simular eliminación enviando un archivo vacío o null
            const formData = new FormData();
            formData.append('camion_id', camion.id);
            formData.append('posicion_foto', posicion);
            formData.append('eliminar', 'true');

            // Como no tenemos endpoint específico para eliminar, usaremos el mismo
            // pero con una validación en el backend
            
            onFotosActualizadas();
            // Limpiar la foto del objeto local
            camion[posicion] = null;
        } catch (error) {
            setError('Error al eliminar la foto');
        } finally {
            setSubiendoFoto(null);
        }
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-camera me-2"></i>
                            Gestionar Fotos - Camión {camion.numero_placa}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={loading}
                        ></button>
                    </div>

                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {error}
                                <button type="button" className="btn-close" onClick={() => setError('')}></button>
                            </div>
                        )}

                        {/* Preview de foto a subir */}
                        {previewFoto && (
                            <div className="alert alert-info" role="alert">
                                <div className="row align-items-center">
                                    <div className="col-md-3">
                                        <img
                                            src={previewFoto.url}
                                            alt="Preview"
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '100px' }}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="mb-1">Vista previa de {previewFoto.posicion}</h6>
                                        <p className="mb-0">¿Deseas subir esta foto?</p>
                                    </div>
                                    <div className="col-md-3 text-end">
                                        <button
                                            className="btn btn-success btn-sm me-2"
                                            onClick={confirmarSubida}
                                            disabled={subiendoFoto}
                                        >
                                            <i className="fas fa-check me-1"></i>
                                            Confirmar
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={cancelarPreview}
                                            disabled={subiendoFoto}
                                        >
                                            <i className="fas fa-times me-1"></i>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="row">
                            <div className="col-12 mb-3">
                                <div className="alert alert-info" role="alert">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Información:</strong> Puedes subir hasta 3 fotos del camión. 
                                    Las fotos ayudan a identificar el vehículo pero no son obligatorias.
                                    Formatos permitidos: JPG, JPEG, PNG. Tamaño máximo: 5MB por foto.
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            {[1, 2, 3].map(num => {
                                const foto = camion[`foto${num}`];
                                const posicion = `foto${num}`;
                                const estaSubiendo = subiendoFoto === posicion;

                                return (
                                    <div key={num} className="col-md-4 mb-4">
                                        <div className="card h-100">
                                            <div className="card-header text-center bg-light">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-camera me-2"></i>
                                                    Foto {num}
                                                </h6>
                                            </div>

                                            <div className="position-relative">
                                                {foto ? (
                                                    <div>
                                                        <img
                                                            src={`/api/uploads/camiones/${foto}`}
                                                            alt={`Foto ${num} del camión ${camion.numero_placa}`}
                                                            className="card-img-top"
                                                            style={{ 
                                                                height: '250px', 
                                                                objectFit: 'cover',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => {
                                                                window.open(`/api/uploads/camiones/${foto}`, '_blank');
                                                            }}
                                                        />
                                                        <div className="position-absolute top-0 end-0 p-2">
                                                            <span className="badge bg-success">
                                                                <i className="fas fa-check me-1"></i>
                                                                Cargada
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className="card-img-top d-flex align-items-center justify-content-center bg-light border-dashed"
                                                        style={{ height: '250px', border: '2px dashed #dee2e6' }}
                                                    >
                                                        {estaSubiendo ? (
                                                            <div className="text-center">
                                                                <div className="spinner-border text-primary mb-2" role="status">
                                                                    <span className="visually-hidden">Subiendo...</span>
                                                                </div>
                                                                <p className="text-muted mb-0">Subiendo foto...</p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-muted">
                                                                <i className="fas fa-cloud-upload-alt fa-3x mb-2"></i>
                                                                <p className="mb-0">Sin foto</p>
                                                                <small>Haz clic para subir</small>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="card-body">
                                                <div className="d-grid gap-2">
                                                    {foto ? (
                                                        <>
                                                            <label 
                                                                className="btn btn-warning btn-sm"
                                                                htmlFor={`foto-input-${num}`}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <i className="fas fa-sync-alt me-2"></i>
                                                                Cambiar Foto
                                                            </label>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => eliminarFoto(posicion)}
                                                                disabled={estaSubiendo}
                                                            >
                                                                <i className="fas fa-trash me-2"></i>
                                                                Eliminar
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <label 
                                                            className="btn btn-primary btn-sm"
                                                            htmlFor={`foto-input-${num}`}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <i className="fas fa-upload me-2"></i>
                                                            Subir Foto
                                                        </label>
                                                    )}

                                                    <input
                                                        type="file"
                                                        id={`foto-input-${num}`}
                                                        className="d-none"
                                                        accept="image/jpeg,image/jpg,image/png"
                                                        onChange={handleInputChange(posicion)}
                                                        disabled={estaSubiendo}
                                                    />
                                                </div>

                                                {foto && (
                                                    <div className="mt-2">
                                                        <small className="text-muted">
                                                            <i className="fas fa-info-circle me-1"></i>
                                                            Haz clic en la imagen para verla en tamaño completo
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Instrucciones */}
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <h6 className="card-title">
                                            <i className="fas fa-lightbulb me-2"></i>
                                            Consejos para las fotos
                                        </h6>
                                        <ul className="mb-0">
                                            <li>Toma fotos claras y bien iluminadas del camión</li>
                                            <li>Incluye diferentes ángulos: frontal, lateral y trasero</li>
                                            <li>Asegúrate de que la placa sea visible en al menos una foto</li>
                                            <li>Las fotos ayudan a los motoristas a identificar el vehículo correcto</li>
                                            <li>Puedes actualizar las fotos en cualquier momento</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="me-auto">
                            <small className="text-muted">
                                <i className="fas fa-images me-1"></i>
                                {[camion.foto1, camion.foto2, camion.foto3].filter(f => f).length} de 3 fotos cargadas
                            </small>
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading || subiendoFoto}
                        >
                            <i className="fas fa-times me-2"></i>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FotosCamion;