import React, { useState, useEffect } from 'react';
import { motoristasAPI } from '../../utils/api';
import FormularioMotorista from './FormularioMotorista';

const ListaMotoristas = ({ 
  mostrarFormulario, 
  setMostrarFormulario, 
  motoristaEditando, 
  setMotoristaEditando,
  onMotoristaGuardado,
  modoModal = true 
}) => {
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({});
  const [paginacion, setPaginacion] = useState({});
  const [filtros, setFiltros] = useState({
    buscar: '',
    tipo_licencia: 'todos',
    estado: 'todos',
    pagina: 1,
    limite: 10
  });

  // Cargar motoristas
  const cargarMotoristas = async () => {
    try {
      setLoading(true);
      const response = await motoristasAPI.listar(filtros);
      setMotoristas(response.motoristas);
      setEstadisticas(response.estadisticas);
      setPaginacion(response.paginacion);
    } catch (error) {
      console.error('Error al cargar motoristas:', error);
      // Toast de error aquí
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar motoristas
  useEffect(() => {
    cargarMotoristas();
  }, [filtros]);

  // Manejar cambios en filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      pagina: key !== 'pagina' ? 1 : value // Reset página excepto cuando se cambia la página
    }));
  };

  // Buscar motoristas
  const handleBuscar = (e) => {
    e.preventDefault();
    const busqueda = e.target.buscar.value;
    handleFiltroChange('buscar', busqueda);
  };

  // Toggle estado activo/inactivo
  const toggleEstadoMotorista = async (id, estadoActual) => {
    try {
      await motoristasAPI.editar(id, { activo: !estadoActual });
      cargarMotoristas();
      // Toast de éxito aquí
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      // Toast de error aquí
    }
  };

  // Eliminar motorista
  const eliminarMotorista = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al motorista ${nombre}?`)) {
      return;
    }

    try {
      await motoristasAPI.eliminar(id);
      cargarMotoristas();
      // Toast de éxito aquí
    } catch (error) {
      console.error('Error al eliminar motorista:', error);
      // Toast de error aquí
    }
  };

  // Editar motorista
  const editarMotorista = (motorista) => {
    setMotoristaEditando(motorista);
    setMostrarFormulario(true);
  };

  // Callback cuando se guarda un motorista
  const handleMotoristaGuardado = () => {
    cargarMotoristas();
    if (onMotoristaGuardado) {
      onMotoristaGuardado();
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
                  <h6 className="card-title mb-0">Total Motoristas</h6>
                  <h3 className="mb-0">{estadisticas.total || 0}</h3>
                </div>
                <i className="fas fa-users fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Activos</h6>
                  <h3 className="mb-0">{estadisticas.activos || 0}</h3>
                </div>
                <i className="fas fa-check-circle fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Asignados</h6>
                  <h3 className="mb-0">{estadisticas.asignados || 0}</h3>
                </div>
                <i className="fas fa-road fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Disponibles</h6>
                  <h3 className="mb-0">{estadisticas.disponibles || 0}</h3>
                </div>
                <i className="fas fa-user-check fa-2x opacity-75"></i>
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
                    placeholder="Nombre, DUI o número de licencia..."
                    defaultValue={filtros.buscar}
                  />
                  <button className="btn btn-outline-primary" type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
              <div className="col-md-3">
                <label htmlFor="tipo_licencia" className="form-label">Tipo de Licencia</label>
                <select
                  className="form-select"
                  id="tipo_licencia"
                  value={filtros.tipo_licencia}
                  onChange={(e) => handleFiltroChange('tipo_licencia', e.target.value)}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="Liviana">Liviana</option>
                  <option value="Pesada">Pesada</option>
                  <option value="Particular">Particular</option>
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
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
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

      {/* Tabla de Motoristas */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Motoristas</h5>
          <div className="d-flex gap-2">
            <span className="badge bg-secondary">
              {paginacion.total_registros || 0} registros
            </span>
          </div>
        </div>
        <div className="card-body p-0">
          {motoristas.length === 0 ? (
            <div className="text-center p-4">
              <i className="fas fa-user-times fa-3x text-muted mb-3"></i>
              <p className="text-muted">No se encontraron motoristas</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nombre Completo</th>
                    <th>DUI</th>
                    <th>Licencia</th>
                    <th>Tipo Licencia</th>
                    <th>Estado</th>
                    <th>Asignación</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {motoristas.map((motorista) => (
                    <tr key={motorista.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle bg-primary text-white me-2">
                            {motorista.nombre_completo.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold">{motorista.nombre_completo}</div>
                            <small className="text-muted">
                              Registrado: {motorista.fecha_creacion}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-monospace">{motorista.dui}</span>
                      </td>
                      <td>
                        <span className="font-monospace">{motorista.numero_licencia}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          motorista.tipo_licencia === 'Pesada' ? 'bg-danger' :
                          motorista.tipo_licencia === 'Liviana' ? 'bg-success' : 'bg-info'
                        }`}>
                          {motorista.tipo_licencia}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={motorista.activo}
                            onChange={() => toggleEstadoMotorista(motorista.id, motorista.activo)}
                          />
                          <label className="form-check-label">
                            <span className={`badge ${motorista.activo ? 'bg-success' : 'bg-secondary'}`}>
                              {motorista.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </label>
                        </div>
                      </td>
                      <td>
                        {motorista.estado_asignacion === 'Asignado' ? (
                          <div>
                            <span className="badge bg-warning mb-1">Asignado</span>
                            <div className="small text-muted">
                              Ruta: {motorista.numero_ruta}<br />
                              {motorista.lugar_recorrido}
                            </div>
                          </div>
                        ) : (
                          <span className="badge bg-success">Disponible</span>
                        )}
                      </td>
                      <td>
                        {motorista.telefono ? (
                          <span className="font-monospace">{motorista.telefono}</span>
                        ) : (
                          <span className="text-muted">No registrado</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => editarMotorista(motorista)}
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminarMotorista(motorista.id, motorista.nombre_completo)}
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
            <nav aria-label="Paginación de motoristas">
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

      {/* Modal/Formulario de Motorista */}
      {mostrarFormulario && (
        <FormularioMotorista
          motorista={motoristaEditando}
          onClose={() => {
            setMostrarFormulario(false);
            setMotoristaEditando(null);
          }}
          onGuardado={handleMotoristaGuardado}
          modoModal={modoModal}
        />
      )}

      <style jsx>{`
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
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
        
        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.875rem;
          }
          
          .btn-group .btn {
            padding: 0.125rem 0.375rem;
          }
          
          .avatar-circle {
            width: 32px;
            height: 32px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
};

export default ListaMotoristas;