// src/pages/inventario/stock.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { inventarioAPI, productosAPI } from '../../utils/api';

export default function StockActual() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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
    solo_con_stock: false
  });

  const [ordenamiento, setOrdenamiento] = useState({
    campo: 'nombre',
    direccion: 'asc'
  });

  useEffect(() => {
    if (user) {
      cargarDatosIniciales();
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarStock();
    }, 500);

    return () => clearTimeout(timer);
  }, [filtros]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías, proveedores y grupos
      const [responseCategorias, responseProveedores, responseGrupos] = await Promise.all([
        productosAPI.obtenerCategorias(),
        productosAPI.obtenerProveedores(),
        productosAPI.obtenerGrupos()
      ]);

      if (responseCategorias.success) setCategorias(responseCategorias.categorias);
      if (responseProveedores.success) setProveedores(responseProveedores.proveedores);
      if (responseGrupos.success) setGrupos(responseGrupos.grupos);

      // Cargar stock inicial
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
        
        // Aplicar ordenamiento
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
      solo_con_stock: false
    });
  };

  const exportarExcel = () => {
    // Implementar exportación a Excel
    console.log('Exportar a Excel');
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
                <i className="fas fa-list-ul me-2 text-primary"></i>
                Stock Actual
              </h2>
              <p className="text-muted mb-0">
                Inventario disponible de todos los productos
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-success"
                onClick={exportarExcel}
              >
                <i className="fas fa-file-excel me-1"></i>
                Exportar
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={cargarStock}
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

      {/* Estadísticas rápidas */}
      <div className="row mb-4">
        <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
          <div className="card border-0 bg-light">
            <div className="card-body text-center py-3">
              <h6 className="fw-bold text-dark mb-1">{estadisticas.total_productos}</h6>
              <small className="text-muted">Total Productos</small>
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
          <div className="card border-0 bg-success bg-opacity-10">
            <div className="card-body text-center py-3">
              <h6 className="fw-bold text-success mb-1">{estadisticas.productos_alto_stock}</h6>
              <small className="text-muted">Stock Alto</small>
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
          <div className="card border-0 bg-info bg-opacity-10">
            <div className="card-body text-center py-3">
              <h6 className="fw-bold text-info mb-1">{estadisticas.productos_stock_intermedio}</h6>
              <small className="text-muted">Stock Intermedio</small>
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
          <div className="card border-0 bg-warning bg-opacity-10">
            <div className="card-body text-center py-3">
              <h6 className="fw-bold text-warning mb-1">{estadisticas.productos_stock_bajo}</h6>
              <small className="text-muted">Stock Bajo</small>
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
          <div className="card border-0 bg-danger bg-opacity-10">
            <div className="card-body text-center py-3">
              <h6 className="fw-bold text-danger mb-1">{estadisticas.productos_agotados}</h6>
              <small className="text-muted">Agotados</small>
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
          <div className="card border-0 bg-primary bg-opacity-10">
            <div className="card-body text-center py-3">
              <h6 className="fw-bold text-primary mb-1 small">
                {formatearMoneda(estadisticas.valor_total_inventario)}
              </h6>
              <small className="text-muted">Valor Total</small>
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
                  <label className="form-label fw-bold">Buscar Producto</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre del producto..."
                    value={filtros.buscar}
                    onChange={(e) => setFiltros({...filtros, buscar: e.target.value})}
                  />
                </div>
                
                <div className="col-lg-2 col-md-6">
                  <label className="form-label fw-bold">Categoría</label>
                  <select
                    className="form-select"
                    value={filtros.categoria_id}
                    onChange={(e) => setFiltros({...filtros, categoria_id: e.target.value})}
                  >
                    <option value="">Todas</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-2 col-md-6">
                  <label className="form-label fw-bold">Proveedor</label>
                  <select
                    className="form-select"
                    value={filtros.proveedor_id}
                    onChange={(e) => setFiltros({...filtros, proveedor_id: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {proveedores.map(proveedor => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-2 col-md-6">
                  <label className="form-label fw-bold">Grupo</label>
                  <select
                    className="form-select"
                    value={filtros.grupo_id}
                    onChange={(e) => setFiltros({...filtros, grupo_id: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {grupos.map(grupo => (
                      <option key={grupo.id} value={grupo.id}>
                        {grupo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-2 col-md-6">
                  <label className="form-label fw-bold">Propietario</label>
                  <select
                    className="form-select"
                    value={filtros.propietario}
                    onChange={(e) => setFiltros({...filtros, propietario: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="Lorena Campos">Lorena Campos</option>
                    <option value="Francisco Pineda">Francisco Pineda</option>
                  </select>
                </div>

                <div className="col-lg-1 col-md-6">
                  <label className="form-label fw-bold">Estado</label>
                  <select
                    className="form-select"
                    value={filtros.estado_stock}
                    onChange={(e) => setFiltros({...filtros, estado_stock: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="alto">Alto</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="bajo">Bajo</option>
                    <option value="agotado">Agotado</option>
                  </select>
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
                    <label className="form-check-label fw-bold" htmlFor="soloConStock">
                      Solo productos con stock
                    </label>
                  </div>
                </div>
                <div className="col-lg-9 col-md-6 text-end">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={limpiarFiltros}
                  >
                    <i className="fas fa-eraser me-1"></i>
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-table me-2"></i>
                  Lista de Productos ({productos.length})
                </h6>
              </div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((producto) => (
                        <tr key={producto.id}>
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
                    Intente modificar los filtros de búsqueda
                  </p>
                </div>
              )}
            </div>
          </div>
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