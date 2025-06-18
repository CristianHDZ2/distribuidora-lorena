// Archivo: src/utils/api.js

import axios from 'axios'
import { toast } from 'react-toastify'

// Configuración base de la API - CORREGIDA
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-dominio.com/api' 
  : 'http://localhost/distribuidora-lorena/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Para enviar cookies de sesión
})

// Interceptor para peticiones
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log de peticiones en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    // Log de respuestas exitosas en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    
    return response
  },
  (error) => {
    // Log de errores
    console.error('❌ API Error:', error)
    
    // Manejo de errores específicos
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Token expirado o no autorizado
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
          // Redireccionar al login
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          break
          
        case 403:
          toast.error('No tienes permisos para realizar esta acción.')
          break
          
        case 404:
          toast.error('Recurso no encontrado.')
          break
          
        case 422:
          // Errores de validación
          if (data.errors) {
            Object.values(data.errors).forEach(errorArray => {
              if (Array.isArray(errorArray)) {
                errorArray.forEach(error => toast.error(error))
              } else {
                toast.error(errorArray)
              }
            })
          } else if (data.message) {
            toast.error(data.message)
          }
          break
          
        case 500:
          toast.error('Error interno del servidor. Por favor, intenta más tarde.')
          break
          
        default:
          if (data?.message) {
            toast.error(data.message)
          } else {
            toast.error('Ha ocurrido un error inesperado.')
          }
      }
    } else if (error.request) {
      // Error de red
      toast.error('Error de conexión. Verifica tu conexión a internet.')
    } else {
      // Error desconocido
      toast.error('Ha ocurrido un error inesperado.')
    }
    
    return Promise.reject(error)
  }
)

// Funciones auxiliares para peticiones

/**
 * Realizar petición GET
 * @param {string} url - Endpoint de la API
 * @param {object} params - Parámetros de consulta
 * @returns {Promise}
 */
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Realizar petición POST
 * @param {string} url - Endpoint de la API
 * @param {object} data - Datos a enviar
 * @returns {Promise}
 */
export const post = async (url, data = {}) => {
  try {
    const response = await api.post(url, data)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Realizar petición PUT
 * @param {string} url - Endpoint de la API
 * @param {object} data - Datos a enviar
 * @returns {Promise}
 */
export const put = async (url, data = {}) => {
  try {
    const response = await api.put(url, data)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Realizar petición DELETE
 * @param {string} url - Endpoint de la API
 * @returns {Promise}
 */
export const del = async (url) => {
  try {
    const response = await api.delete(url)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Subir archivo
 * @param {string} url - Endpoint de la API
 * @param {FormData} formData - Datos del formulario con archivo
 * @param {function} onProgress - Callback para progreso de subida
 * @returns {Promise}
 */
export const uploadFile = async (url, formData, onProgress = null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(progress)
      }
    }
    
    const response = await api.post(url, formData, config)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Descargar archivo
 * @param {string} url - URL del archivo
 * @param {string} filename - Nombre del archivo a descargar
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    })
    
    // Crear blob URL
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    
    // Crear elemento para descarga
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    
    // Limpiar
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    return response.data
  } catch (error) {
    throw error
  }
}

// Endpoints específicos de la aplicación

// Autenticación
export const authAPI = {
  login: (credentials) => post('/auth/login.php', credentials),
  logout: () => post('/auth/logout.php'),
  verifySession: () => get('/auth/verify_session.php'),
}

// Usuarios
export const usuariosAPI = {
  listar: (params) => get('/usuarios/listar_usuarios.php', params),
  crear: (data) => post('/usuarios/crear_usuario.php', data),
  obtener: (id) => get(`/usuarios/listar_usuarios.php?id=${id}`),
  editar: (id, data) => put(`/usuarios/editar_usuario.php?id=${id}`, data),
  eliminar: (id) => del(`/usuarios/eliminar_usuario.php?id=${id}`),
  subirFoto: (formData) => uploadFile('/usuarios/upload_foto.php', formData),
}

// Motoristas
export const motoristasAPI = {
  listar: (params) => get('/motoristas/listar_motoristas.php', params),
  crear: (data) => post('/motoristas/crear_motorista.php', data),
  obtener: (id) => get(`/motoristas/listar_motoristas.php?id=${id}`),
  editar: (id, data) => put(`/motoristas/editar_motorista.php?id=${id}`, data),
  eliminar: (id) => del(`/motoristas/eliminar_motorista.php?id=${id}`),
}

// Camiones - CONFIGURACIÓN COMPLETA
export const camionesAPI = {
  listar: (params) => get('/camiones/listar_camiones.php', params),
  crear: (data) => post('/camiones/crear_camion.php', data),
  obtener: (id) => get(`/camiones/listar_camiones.php?id=${id}`),
  editar: (id, data) => put(`/camiones/editar_camion.php?id=${id}`, data),
  eliminar: (id) => del(`/camiones/eliminar_camion.php?id=${id}`),
  subirFotos: (formData) => uploadFile('/camiones/upload_fotos.php', formData),
}

// Rutas
export const rutasAPI = {
  listar: (params) => get('/rutas/listar_rutas.php', params),
  crear: (data) => post('/rutas/crear_ruta.php', data),
  obtener: (id) => get(`/rutas/listar_rutas.php?id=${id}`),
  editar: (id, data) => put(`/rutas/editar_ruta.php?id=${id}`, data),
  eliminar: (id) => del(`/rutas/eliminar_ruta.php?id=${id}`),
}

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
}

// Inventario
export const inventarioAPI = {
  entradaFactura: (data) => post('/inventario/entrada_factura.php', data),
  salidaProductos: (data) => post('/inventario/salida_productos.php', data),
  movimientos: (params) => get('/inventario/movimientos.php', params),
  stockActual: (params) => get('/inventario/stock_actual.php', params),
  verificarFactura: (numeroFactura) => get(`/inventario/verificar_factura.php?numero=${numeroFactura}`),
}

// Despacho
export const despachoAPI = {
  listar: (params) => get('/despacho/listar_despachos.php', params),
  crear: (data) => post('/despacho/crear_despacho.php', data),
  obtener: (id) => get(`/despacho/listar_despachos.php?id=${id}`),
  editar: (id, data) => put(`/despacho/editar_despacho.php?id=${id}`, data),
  confirmar: (id, data) => post(`/despacho/confirmar_despacho.php?id=${id}`, data),
  calcularVentas: (id) => get(`/despacho/calcular_ventas.php?id=${id}`),
  productosRuta: (rutaId) => get(`/despacho/productos_ruta.php?ruta_id=${rutaId}`),
  misDespachos: (params) => get('/despacho/listar_despachos.php?mis_despachos=1', params),
}

// Reportes
export const reportesAPI = {
  inventario: (params) => get('/reportes/reporte_inventario.php', params),
  ventas: (params) => get('/reportes/reporte_ventas.php', params),
  productos: (params) => get('/reportes/reporte_productos.php', params),
  despachos: (params) => get('/reportes/reporte_despachos.php', params),
  generarPDF: (tipo, params) => get(`/reportes/generar_pdf.php?tipo=${tipo}`, params),
  graficas: (tipo, params) => get(`/reportes/graficas.php?tipo=${tipo}`, params),
}

// Notificaciones
export const notificacionesAPI = {
  listar: (params) => get('/notificaciones/listar_notificaciones.php', params),
  crear: (data) => post('/notificaciones/crear_notificacion.php', data),
  marcarLeida: (id) => post(`/notificaciones/marcar_leida.php?id=${id}`),
  stockBajo: () => get('/notificaciones/stock_bajo.php'),
}

// Funciones de utilidad

/**
 * Manejar errores de forma consistente
 * @param {Error} error - Error capturado
 * @param {string} defaultMessage - Mensaje por defecto
 */
export const handleApiError = (error, defaultMessage = 'Ha ocurrido un error') => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  return defaultMessage
}

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('auth_token')
}

/**
 * Obtener datos del usuario actual
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null
  const userData = localStorage.getItem('user_data')
  return userData ? JSON.parse(userData) : null
}

/**
 * Guardar datos de autenticación
 * @param {string} token - Token de autenticación
 * @param {object} user - Datos del usuario
 */
export const setAuthData = (token, user) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
  localStorage.setItem('user_data', JSON.stringify(user))
}

/**
 * Limpiar datos de autenticación
 */
export const clearAuthData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_data')
}

/**
 * Formatear respuesta de la API
 * @param {object} response - Respuesta de la API
 * @returns {object}
 */
export const formatApiResponse = (response) => {
  return {
    success: response?.success || false,
    message: response?.message || '',
    data: response?.data || null,
    pagination: response?.pagination || null,
  }
}

/**
 * Crear URL completa para archivos
 * @param {string} path - Ruta del archivo
 * @returns {string}
 */
export const getFileUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_BASE_URL}/uploads/${path}`
}

/**
 * Validar respuesta de la API
 * @param {object} response - Respuesta de la API
 * @returns {boolean}
 */
export const isValidApiResponse = (response) => {
  return response && typeof response === 'object' && 'success' in response
}

// Exportar la instancia de axios para casos especiales
export default api