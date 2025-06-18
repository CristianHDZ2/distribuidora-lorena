import React, { useState, useEffect } from 'react';
import { motoristasAPI } from '../../utils/api';
import FormularioMotorista from './FormularioMotorista';

const DetalleMotorista = ({ motoristaId, onVolver, onEliminar }) => {
  const [motorista, setMotorista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Cargar datos del motorista
  const cargarMotorista = async () => {
    try {
      setLoading(true);
      const response = await motoristasAPI.obtener(motoristaId);
      setMotorista(response.motorista);
    } catch (error) {
      console.error('Error al cargar motorista:', error);
      // Toast de error aquí
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (motoristaId) {
      cargarMotorista();
    }
  }, [motoristaId]);

  // Toggle estado activo/inactivo
  const toggleEstado = async () => {
    try {
      await motoristasAPI.editar(motorista.id, { 
        ...motorista, 
        activo: !motorista.activo 
      });
      await cargarMotorista();
      // Toast de éxito aquí
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      // Toast de error aquí
    }
  };

  // Eliminar motorista
  const eliminarMotorista = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al motorista ${motorista.nombre_completo}?`)) {
      return;
    }

    try {
      await motoristasAPI.eliminar(motorista.id);
      if (onEliminar) {
        onEliminar();
      }
      // Toast de éxito aquí
    } catch (error) {
      console.error('Error al eliminar motorista:', error);
      // Toast de error aquí
    }
  };

  // Callback cuando se guarda el motorista
  const handleMotoristaGuardado = () => {
    cargarMotorista();
    setMostrarFormulario(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!motorista) {
    return (
      <div className="text-center p-4">
        <i className="fas fa-user-times fa-3x text-muted mb-3"></i>
        <h5>Motorista no encontrado</h5>
        <p className="text-muted">El motorista solicitado no existe o ha sido eliminado.</p>
        <button className="btn btn-primary" onClick={onVolver}>
          <i className="fas fa-arrow-left me-1"></i>
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        {/* Header con acciones */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle bg-primary text-white me-3">
                    {motorista.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="mb-1">{motorista.nombre_completo}</h4>
                    <div className="d-flex gap-2 flex-wrap">
                      <span className={`badge ${motorista.activo ? 'bg-success' : 'bg-secondary'}`}>
                        {motorista.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className={`badge ${
                        motorista.tipo_licencia === 'Pesada' ? 'bg-danger' :
                        motorista.tipo_licencia === 'Liviana' ? 'bg-success' : 'bg-info'
                      }`}>
                        Licencia {motorista.tipo_licencia}
                      </span>
                      {motorista.estado_asignacion === 'Asignado' ? (
                        <span className="badge bg-warning">Asignado a Ruta</span>
                      ) : (
                        <span className="badge bg-success">Disponible</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={onVolver}
                  >
                    <i className="fas fa-arrow-left me-1"></i>
                    Volver
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setMostrarFormulario(true)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Editar
                  </button>
                  <button
                    className={`btn btn-sm ${motorista.activo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={toggleEstado}
                  >
                    <i className={`fas ${motorista.activo ? 'fa-pause' : 'fa-play'} me-1`}></i>
                    {motorista.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={eliminarMotorista}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Información Personal
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label text-muted small">Nombre Completo</label>
                  <div className="fw-semibold">{motorista.nombre_completo}</div>
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small">DUI</label>
                  <div className="font-monospace">{motorista.dui}</div>
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small">Teléfono</label>
                  <div className="font-monospace">
                    {motorista.telefono || (
                      <span className="text-muted">No registrado</span>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small">Dirección</label>
                  <div>
                    {motorista.direccion || (
                      <span className="text-muted">No registrada</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Licencia */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-id-card me-2"></i>
                Información de Licencia
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label text-muted small">Número de Licencia</label>
                  <div className="font-monospace fw-semibold">{motorista.numero_licencia}</div>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small">Tipo de Licencia</label>
                  <div>
                    <span className={`badge fs-6 ${
                      motorista.tipo_licencia === 'Pesada' ? 'bg-danger' :
                      motorista.tipo_licencia === 'Liviana' ? 'bg-success' : 'bg-info'
                    }`}>
                      {motorista.tipo_licencia}
                    </span>
                    <div className="small text-muted mt-1">
                      {motorista.tipo_licencia === 'Pesada' && 'Autorizado para vehículos pesados y carga'}
                      {motorista.tipo_licencia === 'Liviana' && 'Autorizado para vehículos livianos'}
                      {motorista.tipo_licencia === 'Particular' && 'Solo para uso particular'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Asignación */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-road me-2"></i>
                Estado de Asignación
              </h6>
            </div>
            <div className="card-body">
              {motorista.estado_asignacion === 'Asignado' ? (
                <div className="alert alert-warning">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-route fa-2x me-3"></i>
                    <div>
                      <h6 className="alert-heading mb-1">Asignado a Ruta</h6>
                      <p className="mb-1">
                        <strong>Ruta:</strong> {motorista.numero_ruta} - {motorista.lugar_recorrido}
                      </p>
                      <p className="mb-0">
                        <strong>Grupo de Productos:</strong> 
                        <span className={`badge ms-2 ${
                          motorista.grupo_productos === 'Big Cola' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {motorista.grupo_productos}
                        </span>
                      </p>
                      {motorista.camion_asignado && (
                        <p className="mb-0 mt-1">
                          <strong>Camión:</strong> {motorista.camion_asignado}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-success">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-user-check fa-2x me-3"></i>
                    <div>
                      <h6 className="alert-heading mb-1">Disponible</h6>
                      <p className="mb-0">
                        Este motorista está disponible para ser asignado a una ruta.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Información del Sistema
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted small">Fecha de Registro</label>
                  <div>{motorista.fecha_creacion}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Última Actualización</label>
                  <div>
                    {motorista.fecha_actualizacion || (
                      <span className="text-muted">No actualizado</span>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Estado del Registro</label>
                  <div>
                    <span className={`badge ${motorista.activo ? 'bg-success' : 'bg-secondary'}`}>
                      {motorista.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">ID del Sistema</label>
                  <div className="font-monospace text-muted">#{motorista.id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {mostrarFormulario && (
        <FormularioMotorista
          motorista={motorista}
          onClose={() => setMostrarFormulario(false)}
          onGuardado={handleMotoristaGuardado}
          modoModal={true}
        />
      )}

      <style jsx>{`
        .avatar-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.5rem;
        }
        
        .card {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border: 1px solid rgba(0, 0, 0, 0.125);
        }
        
        .alert {
          border: none;
          border-radius: 0.5rem;
        }
        
        .badge.fs-6 {
          font-size: 0.875rem !important;
          padding: 0.5rem 0.75rem;
        }
        
        @media (max-width: 768px) {
          .d-flex.gap-2.flex-wrap {
            flex-direction: column;
            gap: 0.5rem !important;
          }
          
          .btn-sm {
            width: 100%;
            justify-content: center;
          }
          
          .avatar-circle {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </>
  );
};

export default DetalleMotorista;