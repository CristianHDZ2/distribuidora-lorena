// src/components/Inventario/AlertasStock.js
import { useState, useEffect } from 'react';
import { inventarioAPI } from '../../utils/api';

export default function AlertasStock({ autoRefresh = true, intervalo = 30000 }) {
  const [loading, setLoading] = useState(false);
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [productosAgotados, setProductosAgotados] = useState([]);
  const [mostrarAlertas, setMostrarAlertas] = useState(true);

  useEffect(() => {
    cargarAlertasStock();

    if (autoRefresh) {
      const interval = setInterval(cargarAlertasStock, intervalo);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, intervalo]);

  const cargarAlertasStock = async () => {
    try {
      setLoading(true);
      
      // Cargar productos con stock bajo
      const responseBajo = await inventarioAPI.stockActual({ estado_stock: 'bajo' });
      if (responseBajo.success) {
        setProductosStockBajo(responseBajo.productos);
      }

      // Cargar productos agotados
      const responseAgotados = await inventarioAPI.stockActual({ estado_stock: 'agotado' });
      if (responseAgotados.success) {
        setProductosAgotados(responseAgotados.productos);
      }
    } catch (error) {
      console.error('Error al cargar alertas de stock:', error);
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

  const totalProductosConProblemas = productosStockBajo.length + productosAgotados.length;

  if (!mostrarAlertas || totalProductosConProblemas === 0) {
    return null;
  }

  return (
    <div className="alertas-stock-component">
      {/* Alerta de productos con stock bajo */}
      {productosStockBajo.length > 0 && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <i className="fas fa-exclamation-triangle fa-2x"></i>
            </div>
            <div className="flex-grow-1">
              <h6 className="alert-heading mb-2">
                <strong>Stock Bajo Detectado</strong>
                {loading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
              </h6>
              <p className="mb-2">
                Hay <strong>{productosStockBajo.length}</strong> producto(s) con stock bajo (1-10 unidades):
              </p>
              
              <div className="row">
                {productosStockBajo.slice(0, 6).map((producto) => (
                  <div key={producto.id} className="col-lg-4 col-md-6 mb-2">
                    <div className="card border-warning bg-warning bg-opacity-10">
                      <div className="card-body py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong className="text-dark">{producto.nombre}</strong>
                            <br />
                            <small className="text-muted">{producto.categoria_nombre}</small>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-warning text-dark">
                              Stock: {producto.stock_actual}
                            </span>
                            <br />
                            <small className="text-muted">
                              Valor: {formatearMoneda(producto.valor_inventario)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {productosStockBajo.length > 6 && (
                <p className="mb-0">
                  <small className="text-muted">
                    ... y {productosStockBajo.length - 6} producto(s) más con stock bajo
                  </small>
                </p>
              )}
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMostrarAlertas(false)}
          ></button>
        </div>
      )}

      {/* Alerta de productos agotados */}
      {productosAgotados.length > 0 && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <i className="fas fa-times-circle fa-2x"></i>
            </div>
            <div className="flex-grow-1">
              <h6 className="alert-heading mb-2">
                <strong>Productos Agotados</strong>
                {loading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
              </h6>
              <p className="mb-2">
                Hay <strong>{productosAgotados.length}</strong> producto(s) completamente agotados:
              </p>
              
              <div className="row">
                {productosAgotados.slice(0, 6).map((producto) => (
                  <div key={producto.id} className="col-lg-4 col-md-6 mb-2">
                    <div className="card border-danger bg-danger bg-opacity-10">
                      <div className="card-body py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong className="text-dark">{producto.nombre}</strong>
                            <br />
                            <small className="text-muted">{producto.categoria_nombre}</small>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-danger">
                              AGOTADO
                            </span>
                            <br />
                            <small className="text-muted">
                              {producto.grupo_nombre}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {productosAgotados.length > 6 && (
                <p className="mb-0">
                  <small className="text-muted">
                    ... y {productosAgotados.length - 6} producto(s) más agotados
                  </small>
                </p>
              )}
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMostrarAlertas(false)}
          ></button>
        </div>
      )}

      {/* Resumen y acciones */}
      <div className="card border-0 bg-light">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h6 className="mb-1">
                <i className="fas fa-clipboard-list me-2 text-primary"></i>
                Resumen de Alertas de Stock
              </h6>
              <p className="mb-0 text-muted">
                Total de productos con problemas de stock: <strong>{totalProductosConProblemas}</strong>
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="btn-group" role="group">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={cargarAlertasStock}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  ) : (
                    <i className="fas fa-sync-alt me-1"></i>
                  )}
                  Actualizar
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setMostrarAlertas(false)}
                >
                  <i className="fas fa-times me-1"></i>
                  Ocultar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}