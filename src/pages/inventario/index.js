// src/pages/inventario/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { inventarioAPI } from '../../utils/api';

export default function InventarioIndex() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    total_productos: 0,
    productos_alto_stock: 0,
    productos_stock_intermedio: 0,
    productos_stock_bajo: 0,
    productos_agotados: 0,
    valor_total_inventario: 0
  });
  const [productosRecientes, setProductosRecientes] = useState([]);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas de stock
      const responseStock = await inventarioAPI.stockActual();
      if (responseStock.success) {
        setEstadisticas(responseStock.estadisticas);
        
        // Obtener solo los primeros 5 productos para mostrar en el dashboard
        const productosConStock = responseStock.productos
          .filter(p => p.stock_actual > 0)
          .slice(0, 5);
        setProductosRecientes(productosConStock);
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
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
                <i className="fas fa-boxes me-2 text-primary"></i>
                Gestión de Inventario
              </h2>
              <p className="text-muted mb-0">
                Control y seguimiento de stock de productos
              </p>
            </div>
            <div>
              <button 
                className="btn btn-outline-primary me-2"
                onClick={cargarDashboard}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="row mb-4">
        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-primary mb-2">
                <i className="fas fa-cubes fa-2x"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {estadisticas.total_productos}
              </h5>
              <p className="text-muted mb-0 small">Total Productos</p>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <i className="fas fa-arrow-up fa-2x"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {estadisticas.productos_alto_stock}
              </h5>
              <p className="text-muted mb-0 small">Stock Alto</p>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-info mb-2">
                <i className="fas fa-minus fa-2x"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {estadisticas.productos_stock_intermedio}
              </h5>
              <p className="text-muted mb-0 small">Stock Intermedio</p>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <i className="fas fa-exclamation-triangle fa-2x"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {estadisticas.productos_stock_bajo}
              </h5>
              <p className="text-muted mb-0 small">Stock Bajo</p>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-danger mb-2">
                <i className="fas fa-times-circle fa-2x"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {estadisticas.productos_agotados}
              </h5>
              <p className="text-muted mb-0 small">Agotados</p>
            </div>
          </div>
        </div>

        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <i className="fas fa-dollar-sign fa-2x"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1 small">
                {formatearMoneda(estadisticas.valor_total_inventario)}
              </h5>
              <p className="text-muted mb-0 small">Valor Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0">
                <i className="fas fa-tachometer-alt me-2 text-primary"></i>
                Accesos Rápidos
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {user?.tipo_usuario === 'administrador' && (
                  <>
                    <div className="col-lg-3 col-md-6 mb-3">
                      <Link href="/inventario/entrada" className="text-decoration-none">
                        <div className="card h-100 border-primary hover-shadow">
                          <div className="card-body text-center">
                            <i className="fas fa-plus-circle fa-3x text-primary mb-3"></i>
                            <h6 className="fw-bold text-dark">Entrada por Factura</h6>
                            <p className="text-muted small mb-0">
                              Registrar productos de facturas
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">
                      <Link href="/inventario/salida" className="text-decoration-none">
                        <div className="card h-100 border-warning hover-shadow">
                          <div className="card-body text-center">
                            <i className="fas fa-minus-circle fa-3x text-warning mb-3"></i>
                            <h6 className="fw-bold text-dark">Salida Manual</h6>
                            <p className="text-muted small mb-0">
                              Registrar salidas manuales
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">
                      <Link href="/inventario/movimientos" className="text-decoration-none">
                        <div className="card h-100 border-info hover-shadow">
                          <div className="card-body text-center">
                            <i className="fas fa-exchange-alt fa-3x text-info mb-3"></i>
                            <h6 className="fw-bold text-dark">Movimientos</h6>
                            <p className="text-muted small mb-0">
                              Historial de movimientos
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </>
                )}

                <div className="col-lg-3 col-md-6 mb-3">
                  <Link href="/inventario/stock" className="text-decoration-none">
                    <div className="card h-100 border-success hover-shadow">
                      <div className="card-body text-center">
                        <i className="fas fa-list-ul fa-3x text-success mb-3"></i>
                        <h6 className="fw-bold text-dark">Stock Actual</h6>
                        <p className="text-muted small mb-0">
                          Ver inventario disponible
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos con stock disponible */}
      {productosRecientes.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-box me-2 text-primary"></i>
                    Productos con Stock Disponible
                  </h5>
                  <Link href="/inventario/stock" className="btn btn-sm btn-outline-primary">
                    Ver Todo el Stock
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Precio Venta</th>
                        <th>Valor Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosRecientes.map((producto) => (
                        <tr key={producto.id}>
                          <td>
                            <div>
                              <strong>{producto.nombre}</strong>
                              <br />
                              <small className="text-muted">
                                {producto.unidades_por_paquete} unidades/{producto.medida}
                              </small>
                            </div>
                          </td>
                          <td>{producto.categoria_nombre}</td>
                          <td>
                            <span className="fw-bold">
                              {producto.stock_actual}
                            </span>
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
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-shadow {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .hover-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
}