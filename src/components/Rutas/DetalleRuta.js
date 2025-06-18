import React, { useState, useEffect } from 'react';
import { rutasAPI } from '../../utils/api';
import FormularioRuta from './FormularioRuta';

const DetalleRuta = ({ rutaId, onVolver, onEliminar }) => {
  const [ruta, setRuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recursosDisponibles, setRecursosDisponibles] = useState({ camiones: [], motoristas: [] });

  // Cargar datos de la ruta
  const cargarRuta = async () => {
    try {
      setLoading(true);
      const response = await rutasAPI.obtener(rutaId);
      setRuta(response.ruta);
    } catch (error) {
      console.error('Error al cargar ruta:', error);
      // Toast de error aquí
    } finally {
      setLoading(false);
    }
  };

  // Cargar recursos disponibles
  const cargarRecursos = async () => {
    try {
      const response = await rutasAPI.listar({ limite: 1 }); // Solo para obtener recursos
      setRecursosDisponibles(response.recursos_disponibles);
    } catch (error) {
      console.error('Error al cargar recursos:', error);
    }
  };

  useEffect(() => {
    if (rutaId) {
      cargarRuta();
      cargarRecursos();
    }
  }, [rutaId]);

  // Toggle estado activo/inactivo
  const toggleEstado = async () => {
    try {
      await rutasAPI.editar(ruta.id, { 
        ...ruta, 
        activa: !ruta.activa 
      });
      await cargarRuta();
      // Toast de éxito aquí
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      // Toast de error aquí
    }
  };

  // Eliminar ruta
  const eliminarRuta = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la ruta ${ruta.numero_ruta}?`)) {
      return;
    }

    try {
      await rutasAPI.eliminar(ruta.id);
      if (onEliminar) {
        onEliminar();
      }
      // Toast de éxito aquí
    } catch (error) {
      console.error('Error al eliminar ruta:', error);
      // Toast de error aquí
    }
  };

  // Callback cuando se guarda la ruta
  const handleRutaGuardada = () => {
    cargarRuta();
    cargarRecursos();
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

  if (!ruta) {
    return (
      <div className="text-center p-4">
        <i className="fas fa-route fa-3x text-muted mb-3"></i>
        <h5>Ruta no encontrada</h5>
        <p className="text-muted">La ruta solicitada no existe o ha sido eliminada.</p>
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
                  <div className="route-icon bg-primary text-white me-3">
                    <i className="fas fa-route"></i>
                  </div>
                  <div>
                    <h4 className="mb-1">Ruta {ruta.numero_ruta}</h4>
                    <p className="text-muted mb-1">{ruta.lugar_recorrido}</p>
                    <div className="d-flex gap-2 flex-wrap">
                      <span className={`badge ${ruta.activa ? 'bg-success' : 'bg-secondary'}`}>
                        {ruta.activa ? 'Activa' : 'Inactiva'}
                      </span>
                      <span className={`badge ${
                        ruta.grupo_productos === 'Big Cola' ? 'bg-info' : 'bg-secondary'
                      }`}>
                        {ruta.grupo_productos}
                      </span>
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
                    className={`btn btn-sm ${ruta.activa ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={toggleEstado}
                  >
                    <i className={`fas ${ruta.activa ? 'fa-pause' : 'fa-play'} me-1`}></i>
                    {ruta.activa ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={eliminarRuta}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la Ruta */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Información de la Ruta
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label text-muted small">Número de Ruta</label>
                  <div className="fw-semibold">{ruta.numero_ruta}</div>
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small">Grupo de Productos</label>
                  <div>
                    <span className={`badge fs-6 ${
                      ruta.grupo_productos === 'Big Cola' ? 'bg-info' : 'bg-secondary'
                    }`}>
                      {ruta.grupo_productos}
                    </span>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small">Lugar de Recorrido</label>
                  <div>{ruta.lugar_recorrido}</div>
                </div>
                {ruta.observaciones && (
                  <div className="col-12">
                    <label className="form-label text-muted small">Observaciones</label>
                    <div className="text-muted">{ruta.observaciones}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Camión Asignado */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-truck me-2"></i>
                Camión Asignado
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center">
                {ruta.camion_foto && (
                  <img
                    src={`/api/uploads/camiones/${ruta.camion_foto}`}
                    alt="Camión"
                    className="rounded me-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h5 className="mb-1">{ruta.camion_placa}</h5>
                  <p className="text-muted mb-0">ID del Camión: #{ruta.camion_id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motorista Asignado */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Motorista Asignado
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label text-muted small">Nombre Completo</label>
                  <div className="fw-semibold">{ruta.motorista_nombre}</div>
                </div>
                <div className="col-md-3">
                  <label className="form-label text-muted small">DUI</label>
                  <div className="font-monospace">{ruta.motorista_dui}</div>
                </div>
                <div className="col-md-3">
                  <label className="form-label text-muted small">Tipo de Licencia</label>
                  <div>
                    <span className={`badge ${
                      ruta.motorista_tipo_licencia === 'Pesada' ? 'bg-danger' :
                      ruta.motorista_tipo_licencia === 'Liviana' ? 'bg-success' : 'bg-info'
                    }`}>
                      {ruta.motorista_tipo_licencia}
                    </span>
                  </div>
                </div>
                <div className="col-md-2">
                  <label className="form-label text-muted small">ID Motorista</label>
                  <div className="text-muted">#{ruta.motorista_id}</div>
                </div>
                {ruta.motorista_telefono && (
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Teléfono</label>
                    <div className="font-monospace">{ruta.motorista_telefono}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estado y Estadísticas */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Estado y Estadísticas
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label text-muted small">Estado Actual</label>
                  <div>
                    {ruta.activa ? (
                      <div className="alert alert-success py-2 mb-0">
                        <i className="fas fa-check-circle me-2"></i>
                        <strong>Ruta Activa</strong> - Disponible para despachos
                      </div>
                    ) : (
                      <div className="alert alert-secondary py-2 mb-0">
                        <i className="fas fa-pause-circle me-2"></i>
                        <strong>Ruta Inactiva</strong> - No disponible para despachos
                      </div>
                    )}
                  </div>
                </div>
                {/* Aquí se pueden agregar más estadísticas como número de despachos, etc. */}
              </div>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-cog me-2"></i>
                Información del Sistema
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label text-muted small">Fecha de Creación</label>
                  <div>{ruta.fecha_creacion}</div>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small">Última Actualización</label>
                  <div>
                    {ruta.fecha_actualizacion || (
                      <span className="text-muted">No actualizada</span>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small">ID del Sistema</label>
                  <div className="font-monospace text-muted">#{ruta.id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {mostrarFormulario && (
        <FormularioRuta
          ruta={ruta}
          recursosDisponibles={recursosDisponibles}
          onClose={() => setMostrarFormulario(false)}
          onGuardado={handleRutaGuardada}
          modoModal={true}
        />
      )}

      <style jsx>{`
        .route-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
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
          
          .route-icon {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </>
  );
};

export default DetalleRuta;