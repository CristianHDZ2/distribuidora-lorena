// src/components/Inventario/EntradaFactura.js
import { useState, useEffect } from 'react';
import { inventarioAPI, productosAPI } from '../../utils/api';

export default function EntradaFactura({ onFacturaRegistrada }) {
  const [loading, setLoading] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [verificandoFactura, setVerificandoFactura] = useState(false);
  
  const [factura, setFactura] = useState({
    numero_factura: '',
    proveedor_id: '',
    fecha_factura: new Date().toISOString().split('T')[0]
  });

  const [alertas, setAlertas] = useState({
    tipo: '',
    mensaje: ''
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      const [responseProveedores, responseProductos] = await Promise.all([
        productosAPI.obtenerProveedores(),
        productosAPI.listar()
      ]);

      if (responseProveedores.success) {
        setProveedores(responseProveedores.proveedores);
      }

      if (responseProductos.success) {
        setProductos(responseProductos.productos);
        setProductosDisponibles(responseProductos.productos);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarAlerta('danger', 'Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (tipo, mensaje) => {
    setAlertas({ tipo, mensaje });
    setTimeout(() => setAlertas({ tipo: '', mensaje: '' }), 5000);
  };

  const verificarNumeroFactura = async (numeroFactura) => {
    if (!numeroFactura.trim()) return;
    
    try {
      setVerificandoFactura(true);
      const response = await inventarioAPI.verificarFactura(numeroFactura);
      
      if (response.existe) {
        mostrarAlerta('warning', `La factura #${numeroFactura} ya existe en el sistema`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error al verificar factura:', error);
      return false;
    } finally {
      setVerificandoFactura(false);
    }
  };

  const filtrarProductos = (busqueda) => {
    if (!busqueda.trim()) {
      setProductosDisponibles(productos);
      return;
    }

    const filtrados = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.categoria_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.grupo_nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setProductosDisponibles(filtrados);
  };

  const agregarProducto = (producto) => {
    const yaExiste = productosSeleccionados.find(p => p.producto_id === producto.id);
    if (yaExiste) {
      mostrarAlerta('warning', 'Este producto ya está en la lista');
      return;
    }

    const nuevoProducto = {
      producto_id: producto.id,
      nombre: producto.nombre,
      categoria_nombre: producto.categoria_nombre,
      unidades_por_paquete: producto.unidades_por_paquete,
      medida: producto.medida,
      cantidad: 1,
      precio_compra: '',
      precio_venta_custom: '',
      devolucion: 0,
      subtotal: 0
    };

    setProductosSeleccionados([...productosSeleccionados, nuevoProducto]);
    setBusquedaProducto('');
    setProductosDisponibles(productos);
  };

  const actualizarProducto = (index, campo, valor) => {
    const nuevosProductos = [...productosSeleccionados];
    nuevosProductos[index][campo] = valor;

    if (campo === 'cantidad' || campo === 'precio_compra') {
      const cantidad = parseFloat(nuevosProductos[index].cantidad) || 0;
      const precio = parseFloat(nuevosProductos[index].precio_compra) || 0;
      nuevosProductos[index].subtotal = cantidad * precio;
      
      if (!nuevosProductos[index].precio_venta_custom) {
        nuevosProductos[index].precio_venta_sugerido = precio * 1.10;
      }
    }

    setProductosSeleccionados(nuevosProductos);
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = productosSeleccionados.filter((_, i) => i !== index);
    setProductosSeleccionados(nuevosProductos);
  };

  const calcularTotalFactura = () => {
    return productosSeleccionados.reduce((total, producto) => {
      return total + (parseFloat(producto.subtotal) || 0);
    }, 0);
  };

  const validarFormulario = () => {
    if (!factura.numero_factura.trim()) {
      mostrarAlerta('danger', 'El número de factura es requerido');
      return false;
    }

    if (!factura.proveedor_id) {
      mostrarAlerta('danger', 'Debe seleccionar un proveedor');
      return false;
    }

    if (!factura.fecha_factura) {
      mostrarAlerta('danger', 'La fecha de factura es requerida');
      return false;
    }

    if (productosSeleccionados.length === 0) {
      mostrarAlerta('danger', 'Debe agregar al menos un producto');
      return false;
    }

    for (let i = 0; i < productosSeleccionados.length; i++) {
      const producto = productosSeleccionados[i];
      if (!producto.cantidad || producto.cantidad <= 0) {
        mostrarAlerta('danger', `La cantidad del producto ${producto.nombre} debe ser mayor a 0`);
        return false;
      }
      if (!producto.precio_compra || producto.precio_compra <= 0) {
        mostrarAlerta('danger', `El precio de compra del producto ${producto.nombre} debe ser mayor a 0`);
        return false;
      }
    }

    return true;
  };

  const registrarFactura = async () => {
    if (!validarFormulario()) return;

    const facturaValida = await verificarNumeroFactura(factura.numero_factura);
    if (!facturaValida) return;

    try {
      setLoading(true);

      const datosFactura = {
        ...factura,
        productos: productosSeleccionados.map(producto => ({
          producto_id: producto.producto_id,
          cantidad: parseFloat(producto.cantidad),
          precio_compra: parseFloat(producto.precio_compra),
          precio_venta_custom: producto.precio_venta_custom ? parseFloat(producto.precio_venta_custom) : null,
          devolucion: parseFloat(producto.devolucion) || 0
        }))
      };

      const response = await inventarioAPI.entradaFactura(datosFactura);
      
      if (response.success) {
        mostrarAlerta('success', `Factura registrada exitosamente. Total: $${response.total.toFixed(2)}`);
        
        // Limpiar formulario
        setFactura({
          numero_factura: '',
          proveedor_id: '',
          fecha_factura: new Date().toISOString().split('T')[0]
        });
        setProductosSeleccionados([]);
        
        // Notificar al componente padre
        if (onFacturaRegistrada) {
          onFacturaRegistrada(response);
        }
      }
    } catch (error) {
      console.error('Error al registrar factura:', error);
      mostrarAlerta('danger', error.message || 'Error al registrar la factura');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setFactura({
      numero_factura: '',
      proveedor_id: '',
      fecha_factura: new Date().toISOString().split('T')[0]
    });
    setProductosSeleccionados([]);
    setBusquedaProducto('');
    setAlertas({ tipo: '', mensaje: '' });
  };

  return (
    <div className="entrada-factura-component">
      {/* Alertas */}
      {alertas.mensaje && (
        <div className={`alert alert-${alertas.tipo} alert-dismissible fade show`} role="alert">
          {alertas.mensaje}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlertas({ tipo: '', mensaje: '' })}
          ></button>
        </div>
      )}

      <div className="row">
        {/* Información de la factura */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">
                <i className="fas fa-file-invoice me-2"></i>
                Información de Factura
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Número de Factura *</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={factura.numero_factura}
                    onChange={(e) => setFactura({...factura, numero_factura: e.target.value})}
                    onBlur={(e) => verificarNumeroFactura(e.target.value)}
                    placeholder="Ej: FAC-001"
                  />
                  {verificandoFactura && (
                    <span className="input-group-text">
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Proveedor *</label>
                <select
                  className="form-select"
                  value={factura.proveedor_id}
                  onChange={(e) => setFactura({...factura, proveedor_id: e.target.value})}
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(proveedor => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Fecha de Factura *</label>
                <input
                  type="date"
                  className="form-control"
                  value={factura.fecha_factura}
                  onChange={(e) => setFactura({...factura, fecha_factura: e.target.value})}
                />
              </div>

              <div className="mt-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Resumen</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Productos:</span>
                      <span className="fw-bold">{productosSeleccionados.length}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Total Factura:</span>
                      <span className="fw-bold text-primary">
                        ${calcularTotalFactura().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={registrarFactura}
                  disabled={loading || productosSeleccionados.length === 0}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Registrar Factura
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={limpiarFormulario}
                  disabled={loading}
                >
                  <i className="fas fa-undo me-2"></i>
                  Limpiar Todo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h6 className="mb-0">
                <i className="fas fa-boxes me-2 text-primary"></i>
                Productos de la Factura
              </h6>
            </div>
            <div className="card-body">
              {/* Buscador de productos */}
              <div className="mb-4">
                <label className="form-label fw-bold">Buscar y Agregar Productos</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar producto por nombre, categoría o grupo..."
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      filtrarProductos(e.target.value);
                    }}
                  />
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                </div>

                {/* Lista de productos disponibles */}
                {busquedaProducto && productosDisponibles.length > 0 && (
                  <div className="mt-2">
                    <div className="list-group" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {productosDisponibles.slice(0, 10).map(producto => (
                        <button
                          key={producto.id}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => agregarProducto(producto)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{producto.nombre}</strong>
                              <br />
                              <small className="text-muted">
                                {producto.categoria_nombre} - {producto.grupo_nombre}
                              </small>
                            </div>
                            <span className="badge bg-primary">
                              {producto.unidades_por_paquete} unidades
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabla de productos seleccionados */}
              {productosSeleccionados.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Compra</th>
                        <th>Precio Venta</th>
                        <th>Devolución</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosSeleccionados.map((producto, index) => (
                        <tr key={producto.producto_id}>
                          <td>
                            <div>
                              <strong>{producto.nombre}</strong>
                              <br />
                              <small className="text-muted">
                                {producto.categoria_nombre}
                              </small>
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              className="form-control form-control-sm"
                              value={producto.cantidad}
                              onChange={(e) => actualizarProducto(index, 'cantidad', e.target.value)}
                              style={{width: '80px'}}
                            />
                          </td>
                          <td>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="form-control"
                                value={producto.precio_compra}
                                onChange={(e) => actualizarProducto(index, 'precio_compra', e.target.value)}
                                style={{width: '90px'}}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="form-control"
                                value={producto.precio_venta_custom}
                                onChange={(e) => actualizarProducto(index, 'precio_venta_custom', e.target.value)}
                                placeholder={(producto.precio_venta_sugerido || 0).toFixed(2)}
                                style={{width: '90px'}}
                              />
                            </div>
                            <small className="text-muted">
                              Auto: ${(producto.precio_venta_sugerido || 0).toFixed(2)}
                            </small>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              className="form-control form-control-sm"
                              value={producto.devolucion}
                              onChange={(e) => actualizarProducto(index, 'devolucion', e.target.value)}
                              style={{width: '80px'}}
                            />
                          </td>
                          <td>
                            <strong>${(producto.subtotal || 0).toFixed(2)}</strong>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => eliminarProducto(index)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted">No hay productos agregados</h6>
                  <p className="text-muted mb-0">
                    Utilice el buscador para agregar productos a la factura
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