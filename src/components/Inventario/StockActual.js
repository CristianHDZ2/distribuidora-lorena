// src/components/Inventario/StockActual.js
import { useState, useEffect } from 'react';
import { inventarioAPI, productosAPI } from '../../utils/api';

export default function StockActual({ 
  soloConStock = false, 
  seleccionable = false, 
  onProductoSeleccionado,
  filtrosIniciales = {},
  mostrarFiltros = true,
  mostrarEstadisticas = true 
}) {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [grupos, setGrupos] = useState([]);
  
  const [filtros, setFiltros] = useState({
    buscar: '',
    categoria_id: '',
    proveedor_id: '',
    grupo_id: '',
    propietario: '',
    estado_stock: '',
    solo_con_stock: soloConStock,
    ...filtrosIniciales
  });

  const [ordenamiento, setOrdenamiento] = useState({
    campo: 'nombre',
    direccion: 'asc'
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarStock();
    }, 300);

    return () => clearTimeout(timer);
  }, [filtros, ordenamiento]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      if (mostrarFiltros) {
        const [responseCategorias, responseProveedores, responseGrupos] = await Promise.all([
          productosAPI.obtenerCategorias(),
          productosAPI.obtenerProveedores(),
          productosAPI.obtenerGrupos()
        ]);

        if (responseCategorias.success) setCategorias(responseCategorias.categorias);
        if (responseProveedores.success) setProveedores(responseProveedores.proveedores);
        if (responseGrupos.success) setGrupos(responseGrupos.grupos);
      }

      await cargarStock();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarStock = async () => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== '' && filtros[key] !== false) {
          params.append(key, filtros[key]);
        }
      });

      const response = await inventarioAPI.stockActual(params);
      
      if (response.success) {
        let productosOrdenados = [...response.productos];
        
        productosOrdenados.sort((a, b) => {
          const valorA = a[ordenamiento.campo];
          const valorB = b[ordenamiento.campo];
          
          if (typeof valorA === 'string') {
            const resultado = valorA.localeCompare(valorB);
            return ordenamiento.direccion === 'asc' ? resultado : -resultado;
          } else {
            const resultado = valorA - valorB;
            return ordenamiento.direccion === 'asc' ? resultado : -resultado;
          }
        });
        
        setProductos(productosOrdenados);
        setEstadisticas(response.estadisticas);
      }
    } catch (error) {
      console.error('Error al cargar stock:', error);
    }
  };

  const cambiarOrdenamiento = (campo) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      buscar: '',
      categoria_id: '',
      proveedor_id: '',
      grupo_id: '',
      propietario: '',
      estado_stock: '',
      solo_con_stock: soloConStock,
      ...filtrosIniciales
    });
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  const obtenerIconoOrdenamiento = (campo) => {
    if (ordenamiento.campo !== campo) {
      return 'fas fa-sort text-muted';
    }
    return ordenamiento.direccion === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
  };

  const manejarSeleccionProducto = (producto) => {
    if (seleccionable && onProductoSeleccionado) {
      onProductoSeleccionado(producto);
    }
  };

  return (
    <div className="stock-actual-component">
      {/* Estadísticas */}
      {mostrarEstadisticas && (
        <div className="row mb-4">
          <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
            <div className="card border-0 bg-light">
              <div className="card-body text-center py-2">
                <h6 className="fw-bold text-dark mb-1">{estadisticas.total_productos}</h6>
                <small className="text-muted">Total</small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
            <div className="card border-0 bg-success bg-opacity-10">
              <div className="card-body text-center py-2">
                <h6 className="fw-bold text-success mb-1">{estadisticas.productos_alto_stock}</h6>
                <small className="text-muted">Alto</small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
            <div className="card border-0 bg-info bg-opacity-10">
              <div className="card-body text-center py-2">
                <h6 className="fw-bold text-info mb-1">{estadisticas.productos_stock_intermedio}</h6>
                <small className="text-muted">Intermedio</small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
            <div className="card border-0 bg-warning bg-opacity-10">
              <div className="card-body text-center py-2">
                <h6 className="fw-bold text-warning mb-1">{estadisticas.productos_stock_bajo}</h6>
                <small className="text-muted">Bajo</small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
            <div className="card border-0 bg-danger bg-opacity-10">
              <div className="card-body text-center py-2">
                <h6 className="fw-bold text-danger mb-1">{estadisticas.productos_agotados}</h6>
                <small className="text-muted">Agotados</small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
            <div className="card border-0 bg-primary bg-opacity-10">
              <div className="card-body text-center py-2">
                <h6 className="fw-bold text-primary mb-1 small">
                  {formatearMoneda(estadisticas.valor_total_inventario)}
                </h6>
                <small className="text-muted">Valor Total</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      {mostrarFiltros && (
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
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar producto..."
                      value={filtros.buscar}
                      onChange={(e) => setFiltros({...filtros, buscar: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-lg-2 col-md-6">
                    <select
                      className="form-select"
                      value={filtros.categoria_id}
                      onChange={(e) => setFiltros({...filtros, categoria_id: e.target.value})}
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-2 col-md-6">
                    <select
                      className="form-select"
                      value={filtros.grupo_id}
                      onChange={(e) => setFiltros({...filtros, grupo_id: e.target.value})}
                    >
                      <option value="">Todos los grupos</option>
                      {grupos.map(grupo => (
                        <option key={grupo.id} value={grupo.id}>
                          {grupo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-2 col-md-6">
                    <select
                      className="form-select"
                      value={filtros.propietario}
                      onChange={(e) => setFiltros({...filtros, propietario: e.target.value})}
                    >
                      <option value="">Todos los propietarios</option>
                      <option value="Lorena Campos">Lorena Campos</option>
                      <option value="Francisco Pineda">Francisco Pineda</option>
                    </select>
                  </div>

                  <div className="col-lg-2 col-md-6">
                    <select
                      className="form-select"
                      value={filtros.estado_stock}
                      onChange={(e) => setFiltros({...filtros, estado_stock: e.target.value})}
                    >
                      <option value="">Todos los estados</option>
                      <option value="alto">Alto (≥50)</option>
                      <option value="intermedio">Intermedio (11-49)</option>
                      <option value="bajo">Bajo (1-10)</option>
                      <option value="agotado">Agotado (0)</option>
                    </select>
                  </div>

                  <div className="col-lg-1 col-md-6 d-flex align-items-end">
                    <button 
                      className="btn btn-outline-secondary w-100"
                      onClick={limpiarFiltros}
                    >
                      <i className="fas fa-eraser"></i>
                    </button>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-lg-3 col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="soloConStock"
                        checked={filtros.solo_con_stock}
                        onChange={(e) => setFiltros({...filtros, solo_con_stock: e.target.checked})}
                      />
                      <label className="form-check-label" htmlFor="soloConStock">
                        Solo productos con stock
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0">
          <h6 className="mb-0">
            <i className="fas fa-table me-2"></i>
            Productos ({productos.length})
            {loading && (
              <span className="spinner-border spinner-border-sm ms-2" role="status"></span>
            )}
          </h6>
        </div>
        <div className="card-body p-0">
          {productos.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th 
                      className="cursor-pointer"
                      onClick={() => cambiarOrdenamiento('nombre')}
                    >
                      Producto
                      <i className={`ms-2 ${obtenerIconoOrdenamiento('nombre')}`}></i>
                    </th>
                    <th>Categoría</th>
                    <th>Grupo</th>
                    <th>Propietario</th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => cambiarOrdenamiento('stock_actual')}
                    >
                      Stock
                      <i className={`ms-2 ${obtenerIconoOrdenamiento('stock_actual')}`}></i>
                    </th>
                    <th>Estado</th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => cambiarOrdenamiento('precio_venta')}
                    >
                      Precio Venta
                      <i className={`ms-2 ${obtenerIconoOrdenamiento('precio_venta')}`}></i>
                    </th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => cambiarOrdenamiento('valor_inventario')}
                    >
                      Valor Stock
                      <i className={`ms-2 ${obtenerIconoOrdenamiento('valor_inventario')}`}></i>
                    </th>
                    {seleccionable && <th>Acción</th>}
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr 
                      key={producto.id}
                      className={seleccionable ? 'cursor-pointer' : ''}
                      onClick={() => manejarSeleccionProducto(producto)}
                    >
                      <td>
                        <div>
                          <strong>{producto.nombre}</strong>
                          <br />
                          <small className="text-muted">
                            {producto.unidades_por_paquete} unidades / {producto.medida}
                          </small>
                        </div>
                      </td>
                      <td>{producto.categoria_nombre}</td>
                      <td>
                        <span className={`badge ${producto.grupo_nombre === 'Big Cola' ? 'bg-primary' : 'bg-secondary'}`}>
                          {producto.grupo_nombre}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">{producto.propietario}</small>
                      </td>
                      <td>
                        <span className="fw-bold">{producto.stock_actual}</span>
                      </td>
                      <td>
                        <span className={`badge bg-${producto.color_badge}`}>
                          {producto.estado_stock.toUpperCase()}
                        </span>
                      </td>
                      <td>{formatearMoneda(producto.precio_venta)}</td>
                      <td>{formatearMoneda(producto.valor_inventario)}</td>
                      {seleccionable && (
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              manejarSeleccionProducto(producto);
                            }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Seleccionar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No se encontraron productos</h5>
              <p className="text-muted">
                {filtros.solo_con_stock ? 'No hay productos con stock disponible' : 'Intente modificar los filtros de búsqueda'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
          user-select: none;
        }
        .cursor-pointer:hover {
          background-color: rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
}