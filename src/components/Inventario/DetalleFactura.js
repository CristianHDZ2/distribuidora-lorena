// src/components/Inventario/DetalleFactura.js
import { useState, useEffect } from 'react';
import { inventarioAPI } from '../../utils/api';
import MovimientosInventario from './MovimientosInventario';

export default function DetalleFactura({ facturaId, numeroFactura, onCerrar }) {
  const [loading, setLoading] = useState(false);
  const [factura, setFactura] = useState(null);
  const [productos, setProductos] = useState([]);
  const [mostrarMovimientos, setMostrarMovimientos] = useState(false);

  useEffect(() => {
    if (facturaId) {
      cargarDetalleFactura();
    }
  }, [facturaId]);

  const cargarDetalleFactura = async () => {
    try {
      setLoading(true);
      
      // Cargar movimientos de la factura para obtener el detalle
      const response = await inventarioAPI.movimientos({ factura_id: facturaId, limit: 100 });
      
      if (response.success && response.movimientos.length > 0) {
        // Agrupar productos y calcular totales
        const productosAgrupados = {};
        let totalFactura = 0;
        
        response.movimientos.forEach(mov => {
          const key = mov.producto_id;
          if (!productosAgrupados[key]) {
            productosAgrupados[key] = {
              id: mov.producto_id,
              nombre: mov.producto_nombre,
              unidades_por_paquete: mov.unidades_por_paquete,
              medida: mov.producto_medida,
              cantidad_entrada: 0,
              cantidad_devolucion: 0,
              precio_compra: mov.precio_unitario,
              subtotal: 0
            };
          }
          
          if (mov.tipo_movimiento === 'entrada') {
            productosAgrupados[key].cantidad_entrada += parseFloat(mov.cantidad);
          } else if (mov.tipo_movimiento === 'salida' && mov.observaciones.includes('Devolución')) {
            productosAgrupados[key].cantidad_devolucion += parseFloat(mov.cantidad);
          }
          
          productosAgrupados[key].subtotal += parseFloat(mov.cantidad) * parseFloat(mov.precio_unitario);
          totalFactura += parseFloat(mov.cantidad) * parseFloat(mov.precio_unitario);
        });

        setProductos(Object.values(productosAgrupados));
        
        // Obtener información básica de la factura del primer movimiento
        const primerMovimiento = response.movimientos[0];
        setFactura({
          numero_factura: primerMovimiento.numero_factura,
          fecha_factura: primerMovimiento.fecha_factura,
          proveedor_nombre: primerMovimiento.proveedor_nombre,
          total_factura: totalFactura,
          usuario_nombre: primerMovimiento.usuario_nombre,
          fecha_movimiento: primerMovimiento.fecha_movimiento
        });
      }
    } catch (error) {
      console.error('Error al cargar detalle de factura:', error);
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

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando detalle de factura...</p>
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-file-invoice fa-3x text-muted mb-3"></i>
        <h5 className="text-muted">No se encontró la factura</h5>
        <p className="text-muted">La factura solicitada no existe o no tiene productos asociados</p>
        {onCerrar && (
          <button className="btn btn-outline-secondary" onClick={onCerrar}>
            <i className="fas fa-arrow-left me-1"></i>
            Volver
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="detalle-factura-component">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">
                <i className="fas fa-file-invoice me-2 text-primary"></i>
                Factura #{factura.numero_factura}
              </h4>
              <p className="text-muted mb-0">
                Detalle completo de productos y movimientos
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-info"
                onClick={() => setMostrarMovimientos(!mostrarMovimientos)}
              >
                <i className={`fas fa-${mostrarMovimientos ? 'eye-slash' : 'eye'} me-1`}></i>
                {mostrarMovimientos ? 'Ocultar' : 'Ver'} Movimientos
              </button>
              {onCerrar && (
                <button className="btn btn-outline-secondary" onClick={onCerrar}>
                  <i className="fas fa-times me-1"></i>
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información de la factura */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Información de la Factura
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <strong>Número de Factura:</strong>
                  <p className="mb-2">{factura.numero_factura}</p>
                </div>
                <div className="col-md-3">
                  <strong>Proveedor:</strong>
                  <p className="mb-2">{factura.proveedor_nombre}</p>
                </div>
                <div className="col-md-3">
                  <strong>Fecha de Factura:</strong>
                  <p className="mb-2">{formatearFecha(factura.fecha_factura)}</p>
                </div>
                <div className="col-md-3">
                  <strong>Total de Factura:</strong>
                  <p className="mb-2 text-primary fw-bold">
                    {formatearMoneda(factura.total_factura)}
                  </p>
                </div>
                <div className="col-md-6">
                  <strong>Registrado por:</strong>
                  <p className="mb-2">{factura.usuario_nombre}</p>
                </div>
                <div className="col-md-6">
                  <strong>Fecha de Registro:</strong>
                  <p className="mb-2">{formatearFecha(factura.fecha_movimiento)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle de productos */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h6 className="mb-0">
                <i className="fas fa-boxes me-2 text-primary"></i>
                Productos de la Factura ({productos.length})
              </h6>
            </div>
            <div className="card-body p-0">
              {productos.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad Entrada</th>
                        <th>Devolución</th>
                        <th>Cantidad Neta</th>
                        <th>Precio Compra</th>
                        <th>Subtotal</th>
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
                          <td>
                            <span className="fw-bold text-success">
                              +{producto.cantidad_entrada}
                            </span>
                          </td>
                          <td>
                            {producto.cantidad_devolucion > 0 ? (
                              <span className="fw-bold text-danger">
                                -{producto.cantidad_devolucion}
                              </span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          <td>
                            <span className="fw-bold">
                              {(producto.cantidad_entrada - producto.cantidad_devolucion).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            {formatearMoneda(producto.precio_compra)}
                          </td>
                          <td>
                            <strong>{formatearMoneda(producto.subtotal)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-secondary">
                        <td colSpan="5" className="text-end fw-bold">
                          Total de la Factura:
                        </td>
                        <td className="fw-bold">
                          {formatearMoneda(factura.total_factura)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted">No hay productos en esta factura</h6>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de la factura */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-primary mb-2">
                <i className="fas fa-cubes fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">
                {productos.length}
              </h6>
              <small className="text-muted">Productos Diferentes</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-success bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <i className="fas fa-plus-circle fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">
                {productos.reduce((total, p) => total + p.cantidad_entrada, 0).toFixed(2)}
              </h6>
              <small className="text-muted">Total Entrada</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-warning bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <i className="fas fa-minus-circle fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">
                {productos.reduce((total, p) => total + p.cantidad_devolucion, 0).toFixed(2)}
              </h6>
              <small className="text-muted">Total Devoluciones</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 bg-info bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-info mb-2">
                <i className="fas fa-dollar-sign fa-2x"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">
                {formatearMoneda(factura.total_factura)}
              </h6>
              <small className="text-muted">Valor Total</small>
            </div>
          </div>
        </div>
      </div>

      {/* Movimientos detallados */}
      {mostrarMovimientos && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0">
                  <i className="fas fa-exchange-alt me-2 text-info"></i>
                  Movimientos de Inventario Relacionados
                </h6>
              </div>
              <div className="card-body">
                <MovimientosInventario 
                  facturaId={facturaId}
                  mostrarFiltros={false}
                  limite={50}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="row">
        <div className="col-12">
          <div className="alert alert-info">
            <h6 className="fw-bold mb-2">
              <i className="fas fa-info-circle me-2"></i>
              Información sobre esta Factura
            </h6>
            <ul className="mb-0">
              <li>Esta factura fue registrada el {formatearFecha(factura.fecha_movimiento)} por {factura.usuario_nombre}</li>
              <li>Los productos fueron agregados automáticamente al inventario</li>
              <li>Las devoluciones fueron descontadas del stock disponible</li>
              <li>Los precios de venta se calcularon con un 10% de ganancia sobre el precio de compra</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}