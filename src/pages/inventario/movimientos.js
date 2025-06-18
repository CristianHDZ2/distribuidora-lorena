// src/pages/inventario/movimientos.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { inventarioAPI, productosAPI } from '../../utils/api';

export default function MovimientosInventario() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [paginacion, setPaginacion] = useState({});
  const [productos, setProductos] = useState([]);
  
  const [filtros, setFiltros] = useState({
    buscar: '',
    producto_id: '',
    tipo_movimiento: '',
    fecha_desde: '',
    fecha_hasta: '',
    factura_id: '',
    usuario_id: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    if (!authLoading && user?.tipo_usuario !== 'administrador') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      cargarDatosIniciales();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarMovimientos();
    }, 500);

    return () => clearTimeout(timer);
  }, [filtros]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar productos para el filtro
      const responseProductos = await productosAPI.listar();
      if (responseProductos.success) {
        setProductos(responseProductos.productos);
      }

      // Cargar movimientos iniciales
      await cargarMovimientos();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async () => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== '' && filtros[key] !== null) {
          params.append(key, filtros[key]);
        }
      });

      const response = await inventarioAPI.movimientos(params);
      
      if (response.success) {
        setMovimientos(response.movimientos);
        setEstadisticas(response.estadisticas);
        setPaginacion(response.paginacion);
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      buscar: '',
      producto_id: '',
      tipo_movimiento: '',
      fecha_desde: '',
      fecha_hasta: '',
      factura_id: '',
      usuario_id: '',
      page: 1,
      limit: 20
    });
  };

  const exportarMovimientos = () => {
    // Implementar exportación
    console.log('Exportar movimientos');
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  if (authLoading || loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-0">
                <i className="fas fa-exchange-alt me-2 text-primary"></i>
                Movimientos de Inventario
              </h2>
              <p className="text-muted mb-0">
                Historial completo de entradas y salidas de productos
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-success"
                onClick={exportarMovimientos}
              >
                <i className="fas fa-file-excel me-1"></i>
                Exportar
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={cargarMovimientos}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Actualizar
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => router.push('/inventario')}
              >
                <i className="fas fa-arrow-left me-1"></i>
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas del período */}
      <div className="row mb-4">
        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-0 bg-success bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <i className="fas fa-arrow-down fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">
                {estadisticas.total_entradas?.toFixed(2) || '0.00'}
              </h6>
              <small className="text-muted">Total Entradas</small>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-0 bg-danger bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-danger mb-2">
                <i className="fas fa-arrow-up fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">
                {estadisticas.total_salidas?.toFixed(2) || '0.00'}
              </h6>
              <small className="text-muted">Total Salidas</small>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-0 bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-primary mb-2">
                <i className="fas fa-dollar-sign fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1 small">
                {formatearMoneda(estadisticas.valor_entradas || 0)}
              </h6>
              <small className="text-muted">Valor Entradas</small>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-0 bg-warning bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <i className="fas fa-dollar-sign fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1 small">
                {formatearMoneda(estadisticas.valor_salidas || 0)}
              </h6>
              <small className="text-muted">Valor Salidas</small>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-0 bg-info bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-info mb-2">
                <i className="fas fa-boxes fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">
                {estadisticas.productos_movidos || 0}
              </h6>
              <small className="text-muted">Productos</small>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-0 bg-secondary bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-secondary mb-2">
                <i className="fas fa-file-invoice fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">
                {estadisticas.facturas_procesadas || 0}
              </h6>
              <small className="text-muted">Facturas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light border-0">
              <h6 className="mb-0">
                <i className="fas fa-filter me-2"></i>
                Filtros de Búsqueda
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                  <label className="form-label fw-bold">Buscar</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Producto, factura, observaciones..."
                    value={filtros.buscar}
                    onChange={(e) => setFiltros({...filtros, buscar: e.target.value})}
                  />
                </div>
                
                <div className="col-lg-2 col-md-6">
                  <label className="form-label fw-bold">Producto</label>
                  <select
                    className="form-select"
                    value={filtros.producto_id}
                    onChange={(e) => setFiltros({...filtros, producto_id: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-2 col-md-6">
                  <label className="form-label fw-bold">Tipo Movimiento</label>
                  <select
                    className="form-select"
                    value={filtros.tipo_movimiento}
                    onChange={(e) => setFiltros({...filtros, tipo_movimiento: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>

                <div className="col-lg-2 col-md-6">
                  <label className="form-label fw-bold">Fecha Desde</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filtros.fecha_desde}
                    onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                  />
                </div>

                <div className="col-lg-2 col-md-6">
                  <label className="form-label fw-bold">Fecha Hasta</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filtros.fecha_hasta}
                    onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                  />
                </div>

                <div className="col-lg-1 col-md-6 d-flex align-items-end">
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={limpiarFiltros}
                  >
                    <i className="fas fa-eraser me-1"></i>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de movimientos */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Movimientos 
                  {paginacion.total_registros && (
                    <span className="text-muted">
                      ({paginacion.desde} - {paginacion.hasta} de {paginacion.total_registros})
                    </span>
                  )}
                </h6>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label mb-0 me-2">Mostrar:</label>
                  <select
                    className="form-select form-select-sm"
                    style={{width: 'auto'}}
                    value={filtros.limit}
                    onChange={(e) => setFiltros({...filtros, limit: parseInt(e.target.value), page: 1})}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {movimientos.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Fecha/Hora</th>
                          <th>Tipo</th>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unitario</th>
                          <th>Valor Total</th>
                          <th>Factura</th>
                          <th>Usuario</th>
                          <th>Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimientos.map((movimiento) => (
                          <tr key={movimiento.id}>
                            <td>
                              <div>
                                <strong>{movimiento.fecha_formateada}</strong>
                              </div>
                            </td>
                            <td>
                              <span className={`badge bg-${movimiento.tipo_badge}`}>
                                <i className={`fas fa-${movimiento.tipo_icono} me-1`}></i>
                                {movimiento.tipo_movimiento.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div>
                                <strong>{movimiento.producto_nombre}</strong>
                                <br />
                                <small className="text-muted">
                                  {movimiento.unidades_por_paquete} unidades/{movimiento.producto_medida}
                                </small>
                              </div>
                            </td>
                            <td>
                              <span className="fw-bold">
                                {movimiento.cantidad_formateada}
                              </span>
                            </td>
                            <td>{movimiento.precio_formateado}</td>
                            <td>
                              <strong>{movimiento.valor_formateado}</strong>
                            </td>
                            <td>
                              {movimiento.numero_factura ? (
                                <div>
                                  <strong>#{movimiento.numero_factura}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {movimiento.proveedor_nombre}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <small>{movimiento.usuario_nombre}</small>
                            </td>
                            <td>
                              <small className="text-muted">
                                {movimiento.observaciones || '-'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {paginacion.total_paginas > 1 && (
                    <div className="card-footer bg-white border-0">
                      <nav>
                        <ul className="pagination pagination-sm mb-0 justify-content-center">
                          <li className={`page-item ${paginacion.page === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => cambiarPagina(paginacion.page - 1)}
                              disabled={paginacion.page === 1}
                            >
                              <i className="fas fa-chevron-left"></i>
                            </button>
                          </li>
                          
                          {Array.from({ length: Math.min(5, paginacion.total_paginas) }, (_, i) => {
                            let pageNum;
                            if (paginacion.total_paginas <= 5) {
                              pageNum = i + 1;
                            } else if (paginacion.page <= 3) {
                              pageNum = i + 1;
                            } else if (paginacion.page >= paginacion.total_paginas - 2) {
                              pageNum = paginacion.total_paginas - 4 + i;
                            } else {
                              pageNum = paginacion.page - 2 + i;
                            }
                            
                            return (
                              <li key={pageNum} className={`page-item ${paginacion.page === pageNum ? 'active' : ''}`}>
                                <button 
                                  className="page-link"
                                  onClick={() => cambiarPagina(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          })}
                          
                          <li className={`page-item ${paginacion.page === paginacion.total_paginas ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => cambiarPagina(paginacion.page + 1)}
                              disabled={paginacion.page === paginacion.total_paginas}
                            >
                              <i className="fas fa-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No se encontraron movimientos</h5>
                  <p className="text-muted">
                    Intente modificar los filtros de búsqueda
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}