// src/pages/inventario/salida.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { inventarioAPI, productosAPI } from '../../utils/api';

export default function SalidaManual() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosConStock, setProductosConStock] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  
  const [alertas, setAlertas] = useState({
    tipo: '',
    mensaje: ''
  });

  const motivosComunes = [
    'Producto dañado',
    'Producto vencido',
    'Muestra gratis',
    'Consumo interno',
    'Robo o pérdida',
    'Ajuste de inventario',
    'Otro'
  ];

  useEffect(() => {
    if (!authLoading && user?.tipo_usuario !== 'administrador') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      cargarProductos();
    }
  }, [user, authLoading]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      
      // Cargar productos con stock
      const response = await inventarioAPI.stockActual({ solo_con_stock: true });
      if (response.success) {
        const productosConStock = response.productos.filter(p => p.stock_actual > 0);
        setProductos(productosConStock);
        setProductosConStock(productosConStock);
        setProductosDisponibles(productosConStock);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      mostrarAlerta('danger', 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (tipo, mensaje) => {
    setAlertas({ tipo, mensaje });
    setTimeout(() => setAlertas({ tipo: '', mensaje: '' }), 5000);
  };

  const filtrarProductos = (busqueda) => {
    if (!busqueda.trim()) {
      setProductosDisponibles(productosConStock);
      return;
    }

    const filtrados = productosConStock.filter(producto =>
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
      stock_actual: producto.stock_actual,
      precio_compra: producto.precio_compra,
      unidades_por_paquete: producto.unidades_por_paquete,
      medida: producto.medida,
      cantidad: 1,
      motivo: '',
      observaciones: ''
    };

    setProductosSeleccionados([...productosSeleccionados, nuevoProducto]);
    setBusquedaProducto('');
    setProductosDisponibles(productosConStock);
  };

  const actualizarProducto = (index, campo, valor) => {
    const nuevosProductos = [...productosSeleccionados];
    nuevosProductos[index][campo] = valor;
    setProductosSeleccionados(nuevosProductos);
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = productosSeleccionados.filter((_, i) => i !== index);
    setProductosSeleccionados(nuevosProductos);
  };

  const validarFormulario = () => {
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
      
      if (producto.cantidad > producto.stock_actual) {
        mostrarAlerta('danger', `La cantidad del producto ${producto.nombre} excede el stock disponible (${producto.stock_actual})`);
        return false;
      }
      
      if (!producto.motivo.trim()) {
        mostrarAlerta('danger', `Debe especificar el motivo para ${producto.nombre}`);
        return false;
      }
    }

    return true;
  };

  const registrarSalida = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      const datosSalida = {
        productos: productosSeleccionados.map(producto => ({
          producto_id: producto.producto_id,
          cantidad: parseFloat(producto.cantidad),
          motivo: producto.motivo,
          observaciones: producto.observaciones
        }))
      };

      const response = await inventarioAPI.salidaProductos(datosSalida);
      
      if (response.success) {
        mostrarAlerta('success', 
          `Salida registrada exitosamente. ${response.total_productos} producto(s) procesados por valor de $${response.total_valor.toFixed(2)}`
        );
        
        // Limpiar formulario
        setProductosSeleccionados([]);
        
        // Recargar productos con stock actualizado
        await cargarProductos();
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push('/inventario');
        }, 3000);
      }
    } catch (error) {
      console.error('Error al registrar salida:', error);
      mostrarAlerta('danger', error.message || 'Error al registrar la salida');
    } finally {
      setLoading(false);
    }
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
                <i className="fas fa-minus-circle me-2 text-warning"></i>
                Salida Manual de Productos
              </h2>
              <p className="text-muted mb-0">
                Registrar salidas de inventario por diferentes motivos
              </p>
            </div>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => router.push('/inventario')}
            >
              <i className="fas fa-arrow-left me-1"></i>
              Volver al Inventario
            </button>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alertas.mensaje && (
        <div className="row mb-3">
          <div className="col-12">
            <div className={`alert alert-${alertas.tipo} alert-dismissible fade show`} role="alert">
              {alertas.mensaje}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setAlertas({ tipo: '', mensaje: '' })}
              ></button>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Buscador de productos */}
        <div className="col-lg-5 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-search me-2"></i>
                Buscar Productos
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Buscar producto con stock disponible
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre, categoría o grupo..."
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
              </div>

              {/* Lista de productos disponibles */}
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                {productosDisponibles.length > 0 ? (
                  <div className="list-group">
                    {productosDisponibles.map(producto => (
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
                            <br />
                            <small className="text-muted">
                              {producto.unidades_por_paquete} unidades/{producto.medida}
                            </small>
                          </div>
                          <div className="text-end">
                            <span className={`badge bg-${producto.color_badge} mb-1`}>
                              Stock: {producto.stock_actual}
                            </span>
                            <br />
                            <small className="text-muted">
                              ${producto.precio_compra}
                            </small>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-search fa-2x text-muted mb-2"></i>
                    <p className="text-muted mb-0">
                      {busquedaProducto ? 'No se encontraron productos' : 'Escriba para buscar productos'}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="alert alert-info mb-0">
                  <small>
                    <i className="fas fa-info-circle me-1"></i>
                    Solo se muestran productos con stock disponible
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos seleccionados para salida */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0">
                <i className="fas fa-list me-2 text-warning"></i>
                Productos para Salida ({productosSeleccionados.length})
              </h5>
            </div>
            <div className="card-body">
              {productosSeleccionados.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Producto</th>
                          <th>Stock</th>
                          <th>Cantidad</th>
                          <th>Motivo</th>
                          <th>Observaciones</th>
                          <th>Acciones</th>
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
                              <span className="fw-bold text-info">
                                {producto.stock_actual}
                              </span>
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                max={producto.stock_actual}
                                className="form-control form-control-sm"
                                value={producto.cantidad}
                                onChange={(e) => actualizarProducto(index, 'cantidad', e.target.value)}
                                style={{width: '80px'}}
                              />
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={producto.motivo}
                                onChange={(e) => actualizarProducto(index, 'motivo', e.target.value)}
                                style={{width: '150px'}}
                              >
                                <option value="">Seleccionar...</option>
                                {motivosComunes.map(motivo => (
                                  <option key={motivo} value={motivo}>
                                    {motivo}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={producto.observaciones}
                                onChange={(e) => actualizarProducto(index, 'observaciones', e.target.value)}
                                placeholder="Opcional..."
                                style={{width: '120px'}}
                              />
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

                  {/* Botones de acción */}
                  <div className="mt-4">
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={registrarSalida}
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
                            Registrar Salida
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setProductosSeleccionados([])}
                        disabled={loading}
                      >
                        <i className="fas fa-undo me-2"></i>
                        Limpiar Todo
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No hay productos seleccionados</h5>
                  <p className="text-muted">
                    Utilice el buscador de la izquierda para agregar productos
                  </p>
                </div>
              )}

              {/* Información adicional */}
              <div className="mt-4">
                <div className="alert alert-warning">
                  <h6 className="fw-bold mb-2">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Información Importante
                  </h6>
                  <ul className="mb-0">
                    <li>Esta acción reducirá permanentemente el stock de los productos</li>
                    <li>Los medios paquetes se ingresan como 0.5, 1.5, etc.</li>
                    <li>Es obligatorio especificar el motivo de la salida</li>
                    <li>No se puede exceder el stock disponible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}