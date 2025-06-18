// src/utils/api.js - PARTE 1: Configuración base y funciones existentes
const API_BASE_URL = 'http://localhost/distribuidora-lorena/api';

// Función base para hacer peticiones
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Funciones auxiliares
const get = (url, params) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  return makeRequest(`${url}${queryString}`);
};

const post = (url, data) => makeRequest(url, {
  method: 'POST',
  body: JSON.stringify(data),
});

const put = (url, data) => makeRequest(url, {
  method: 'PUT',
  body: JSON.stringify(data),
});

const del = (url) => makeRequest(url, {
  method: 'DELETE',
});

const uploadFile = async (url, formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download Error:', error);
    throw error;
  }
};

// Auth
export const authAPI = {
  login: (credentials) => post('/auth/login.php', credentials),
  logout: () => post('/auth/logout.php'),
  verifySession: () => get('/auth/verify_session.php'),
};

// Usuarios
export const usuariosAPI = {
  listar: (params) => get('/usuarios/listar_usuarios.php', params),
  crear: (data) => post('/usuarios/crear_usuario.php', data),
  obtener: (id) => get(`/usuarios/listar_usuarios.php?id=${id}`),
  editar: (id, data) => put(`/usuarios/editar_usuario.php?id=${id}`, data),
  eliminar: (id) => del(`/usuarios/eliminar_usuario.php?id=${id}`),
  subirFoto: (formData) => uploadFile('/usuarios/upload_foto.php', formData),
};

// Motoristas
export const motoristasAPI = {
  listar: (params) => get('/motoristas/listar_motoristas.php', params),
  crear: (data) => post('/motoristas/crear_motorista.php', data),
  obtener: (id) => get(`/motoristas/listar_motoristas.php?id=${id}`),
  editar: (id, data) => put(`/motoristas/editar_motorista.php?id=${id}`, data),
  eliminar: (id) => del(`/motoristas/eliminar_motorista.php?id=${id}`),
};

// Camiones
export const camionesAPI = {
  listar: (params) => get('/camiones/listar_camiones.php', params),
  crear: (data) => post('/camiones/crear_camion.php', data),
  obtener: (id) => get(`/camiones/listar_camiones.php?id=${id}`),
  editar: (id, data) => put(`/camiones/editar_camion.php?id=${id}`, data),
  eliminar: (id) => del(`/camiones/eliminar_camion.php?id=${id}`),
  subirFotos: (formData) => uploadFile('/camiones/upload_fotos.php', formData),
};

// Rutas
export const rutasAPI = {
  listar: (params) => get('/rutas/listar_rutas.php', params),
  crear: (data) => post('/rutas/crear_ruta.php', data),
  obtener: (id) => get(`/rutas/listar_rutas.php?id=${id}`),
  editar: (id, data) => put(`/rutas/editar_ruta.php?id=${id}`, data),
  eliminar: (id) => del(`/rutas/eliminar_ruta.php?id=${id}`),
};

// Productos
export const productosAPI = {
  listar: (params) => get('/productos/listar_productos.php', params),
  crear: (data) => post('/productos/crear_producto.php', data),
  obtener: (id) => get(`/productos/listar_productos.php?id=${id}`),
  editar: (id, data) => put(`/productos/editar_producto.php?id=${id}`, data),
  eliminar: (id) => del(`/productos/eliminar_producto.php?id=${id}`),
  importarExcel: (formData) => uploadFile('/productos/importar_excel.php', formData),
  exportarExcel: () => get('/productos/exportar_excel.php'),
  descargarPlantilla: () => downloadFile('/productos/plantilla_excel.php', 'plantilla_productos.xlsx'),
  obtenerCategorias: () => get('/productos/categorias.php'),
  obtenerProveedores: () => get('/productos/proveedores.php'),
  obtenerGrupos: () => get('/productos/grupos.php'),
};

// Inventario - NUEVAS FUNCIONES
export const inventarioAPI = {
  entradaFactura: (data) => post('/inventario/entrada_factura.php', data),
  salidaProductos: (data) => post('/inventario/salida_productos.php', data),
  movimientos: (params) => get('/inventario/movimientos.php', params),
  stockActual: (params) => get('/inventario/stock_actual.php', params),
  verificarFactura: (numeroFactura) => get(`/inventario/verificar_factura.php?numero=${numeroFactura}`),
};

// Despacho
export const despachoAPI = {
  crear: (data) => post('/despacho/crear_despacho.php', data),
  listar: (params) => get('/despacho/listar_despachos.php', params),
  obtener: (id) => get(`/despacho/listar_despachos.php?id=${id}`),
  editar: (id, data) => put(`/despacho/editar_despacho.php?id=${id}`, data),
  confirmar: (id, data) => post(`/despacho/confirmar_despacho.php?id=${id}`, data),
  misDespachos: (params) => get('/despacho/mis_despachos.php', params),
  productosRuta: (rutaId) => get(`/despacho/productos_ruta.php?ruta_id=${rutaId}`),
  calcularVentas: (data) => post('/despacho/calcular_ventas.php', data),
};

// Reportes
export const reportesAPI = {
  inventario: (params) => get('/reportes/reporte_inventario.php', params),
  ventas: (params) => get('/reportes/reporte_ventas.php', params),
  productos: (params) => get('/reportes/reporte_productos.php', params),
  despachos: (params) => get('/reportes/reporte_despachos.php', params),
  generarPDF: (tipo, params) => downloadFile(`/reportes/generar_pdf.php?tipo=${tipo}`, `reporte_${tipo}.pdf`),
  graficas: (params) => get('/reportes/graficas.php', params),
};

// Notificaciones
export const notificacionesAPI = {
  listar: (params) => get('/notificaciones/listar_notificaciones.php', params),
  marcarLeida: (id) => post(`/notificaciones/marcar_leida.php?id=${id}`),
  crear: (data) => post('/notificaciones/crear_notificacion.php', data),
  stockBajo: () => get('/notificaciones/stock_bajo.php'),
};