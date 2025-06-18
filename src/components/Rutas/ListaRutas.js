import React, { useState, useEffect } from 'react';
import { rutasAPI } from '../../utils/api';
import FormularioRuta from './FormularioRuta';

const ListaRutas = ({ 
  mostrarFormulario, 
  setMostrarFormulario, 
  rutaEditando, 
  setRutaEditando,
  onRutaGuardada,
  modoModal = true 
}) => {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({});
  const [paginacion, setPaginacion] = useState({});
  const [recursosDisponibles, setRecursosDisponibles] = useState({ camiones: [], motoristas: [] });
  const [filtros, setFiltros] = useState({
    buscar: '',
    grupo_productos: 'todos',
    estado: 'todos',
    pagina: 1,
    limite: 10
  });

  // Cargar rutas
  const cargarRutas = async () => {
    try {
      setLoading(true);
      const response = await rutasAPI.listar(filtros);
      setRutas(response.rutas);
      setEstadisticas(response.estadisticas);
      setPaginacion(response.paginacion);
      setRecursosDisponibles(response.recursos_disponibles);
    } catch (error) {
      console.error('Error al cargar rutas:', error);
      // Toast de error aquí
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar rutas
  useEffect(() => {
    cargarRutas();
  }, [filtros]);

  // Manejar cambios en filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      pagina: key !== 'pagina' ? 1 : value // Reset página excepto cuando se cambia la página
    }));
  };

  // Buscar rutas
  const handleBuscar = (e) => {
    e.preventDefault();
    const busqueda = e.target.buscar.value;
    handleFiltroChange('buscar', busqueda);
  };

  // Toggle estado activo/inactivo
  const toggleEstadoRuta = async (id, estadoActual) => {
    try {
      const ruta = rutas.find(r => r.id === id);
      await rutasAPI.editar(id, { 
        ...ruta, 
        activa: !estadoActual 
      });
      cargarRutas();
      // Toast de éxito aquí
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      // Toast de error aquí
    }
  };

  // Eliminar ruta
  const eliminarRuta = async (id, numeroRuta) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la ruta ${numeroRuta}?`)) {
      return;
    }

    try {
      await rutasAPI.eliminar(id);
      cargarRutas();
      // Toast de éxito aquí
    } catch (error) {
      console.error('Error al eliminar ruta:', error);
      // Toast de error aquí
    }
  };

  // Editar ruta
  const editarRuta = (ruta) => {
    setRutaEditando(ruta);
    setMostrarFormulario(true);
  };

  // Callback cuando se guarda una ruta
  const handleRutaGuardada = () => {
    cargarRutas();
    if (onRutaGuardada) {
      onRutaGuardada();
    }
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

  return (
    <>
      {/* Estadísticas */}
      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Total Rutas</h6>
                  <h3 className="mb-0">{estadisticas.total || 0}</h3>
                </div>
                <i className="fas fa-route fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Activas</h6>
                  <h3 className="mb-0">{estadisticas.activas || 0}</h3>
                </div>
                <i className="fas fa-check-circle fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Big Cola</h6>
                  <h3 className="mb-0">{estadisticas.big_cola || 0}</h3>
                </div>
                <i className="fas fa-bottles fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Otros Productos</h6>
                  <h3 className="mb-0">{estadisticas.otros_productos || 0}</h3>
                </div>
                <i className="fas fa-box fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleBuscar}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="buscar" className="form-label">Buscar</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="buscar"
                    name="buscar"
                    placeholder="Número, lugar, camión o motorista..."
                    defaultValue={filtros.buscar}
                  />
                  <button className="btn btn-outline-primary" type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
              <div className="col-md-3">
                <label htmlFor="grupo_productos" className="form-label">Grupo de Productos</label>
                <select
                  className="form-select"
                  id="grupo_productos"
                  value={filtros.grupo_productos}
                  onChange={(e) => handleFiltroChange('grupo_productos', e.target.value)}
                >
                  <option value="todos">Todos los grupos</option>
                  <option value="Big Cola">Big Cola</option>
                  <option value="Otros Productos">Otros Productos</option>
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="estado" className="form-label">Estado</label>
                <select
                  className="form-select"
                  id="estado"
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="activas">Activas</option>
                  <option value="inactivas">Inactivas</option>
                </select>
              </div>
              <div className="col-md-2">
                <label htmlFor="limite" className="form-label">Por página</label>
                <select
                  className="form-select"
                  id="limite"
                  value={filtros.limite}
                  onChange={(e) => handleFiltroChange('limite', parseInt(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Tabla de Rutas */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Rutas</h5>
          <div className="d-flex gap-2">
            <span className="badge bg-secondary">
              {paginacion.total_registros || 0} registros
            </span>
          </div>
        </div>
        <div className="card-body p-0">
          {rutas.length === 0 ? (
            <div className="text-center p-4">
              <i className="fas fa-route fa-3x text-muted mb-3"></i>
              <p className="text-muted">No se encontraron rutas</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Número de Ruta</th>
                    <th>Lugar de Recorrido</th>
                    <th>Grupo Productos</th>
                    <th>Camión</th>
                    <th>Motorista</th>
                    <th>Estado</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rutas.map((ruta) => (
                    <tr key={ruta.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="route-icon bg-primary text-white me-2">
                            <i className="fas fa-route"></i>
                          </div>
                          <div>
                            <div className="fw-semibold">{ruta.numero_ruta}</div>
                            <small className="text-muted">
                              ID: #{ruta.id}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-wrap" style={{ maxWidth: '200px' }}>
                          {ruta.lugar_recorrido}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          ruta.grupo_productos === 'Big Cola' ? 'bg-info' : 'bg-secondary'
                        }`}>
                          {ruta.grupo_productos}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {ruta.camion_foto && (
                            <img
                              src={`/api/uploads/camiones/${ruta.camion_foto}`}
                              alt="Camión"
                              className="rounded me-2"
                              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold">{ruta.camion_placa}</div>
                            <small className="text-muted">ID: {ruta.camion_id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{ruta.motorista_nombre}</div>
                          <small className="text-muted">
                            {ruta.motorista_dui} - {ruta.motorista_tipo_licencia}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={ruta.activa}
                            onChange={() => toggleEstadoRuta(ruta.id, ruta.activa)}
                          />
                          <label className="form-check-label">
                            <span className={`badge ${ruta.activa ? 'bg-success' : 'bg-secondary'}`}>
                              {ruta.activa ? 'Activa' : 'Inactiva'}
                            </span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">{ruta.fecha_creacion}</span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => editarRuta(ruta)}
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminarRuta(ruta.id, ruta.numero_ruta)}
                            title="Eliminar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {paginacion.total_paginas > 1 && (
          <div className="card-footer">
            <nav aria-label="Paginación de rutas">
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${!paginacion.hay_anterior ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handleFiltroChange('pagina', filtros.pagina - 1)}
                    disabled={!paginacion.hay_anterior}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </li>
                
                {/* Páginas */}
                {Array.from({ length: Math.min(5, paginacion.total_paginas) }, (_, i) => {
                  const startPage = Math.max(1, filtros.pagina - 2);
                  const pageNumber = startPage + i;
                  
                  if (pageNumber <= paginacion.total_paginas) {
                    return (
                      <li 
                        key={pageNumber} 
                        className={`page-item ${filtros.pagina === pageNumber ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handleFiltroChange('pagina', pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  }
                  return null;
                })}

                <li className={`page-item ${!paginacion.hay_siguiente ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handleFiltroChange('pagina', filtros.pagina + 1)}
                    disabled={!paginacion.hay_siguiente}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
            
            <div className="text-center mt-2">
              <small className="text-muted">
                Página {paginacion.pagina_actual} de {paginacion.total_paginas} - 
                Mostrando {Math.min(filtros.limite, paginacion.total_registros)} de {paginacion.total_registros} registros
              </small>
            </div>
          </div>
        )}
      </div>

      {/* Modal/Formulario de Ruta */}
      {mostrarFormulario && (
        <FormularioRuta
          ruta={rutaEditando}
          recursosDisponibles={recursosDisponibles}
          onClose={() => {
            setMostrarFormulario(false);
            setRutaEditando(null);
          }}
          onGuardado={handleRutaGuardada}
          modoModal={modoModal}
        />
      )}

      <style jsx>{`
        .route-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
        }
        
        .table td {
          vertical-align: middle;
        }
        
        .badge {
          font-size: 0.75rem;
        }
        
        .btn-group .btn {
          padding: 0.25rem 0.5rem;
        }
        
        .text-wrap {
          word-wrap: break-word;
          word-break: break-word;
        }
        
        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.875rem;
          }
          
          .btn-group .btn {
            padding: 0.125rem 0.375rem;
          }
          
          .route-icon {
            width: 28px;
            height: 28px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default ListaRutas;