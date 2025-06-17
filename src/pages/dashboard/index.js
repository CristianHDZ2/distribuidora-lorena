// src/pages/dashboard/index.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/Auth/ProtectedRoute'
import useAuth from '../../hooks/useAuth'
import { camionesAPI } from '../../utils/api'
import styles from '../../styles/Dashboard.module.css'

const Dashboard = () => {
  const { user, isAdmin, isDespachador, logout } = useAuth()
  const [dashboardStats, setDashboardStats] = useState({
    productos_total: 0,
    productos_bajo_stock: 0,
    despachos_hoy: 0,
    ventas_hoy: 0,
    usuarios_activos: 0,
    rutas_activas: 0,
    // Nuevas estadísticas de camiones
    total_camiones: 0,
    camiones_activos: 0,
    en_mantenimiento: 0,
    capacidad_total: 0
  })
  const router = useRouter()

  useEffect(() => {
    // Cargar estadísticas del dashboard
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      // Cargar estadísticas de camiones
      const camionesResponse = await camionesAPI.listar({ limit: 1 });
      
      let camionesStats = {
        total_camiones: 0,
        camiones_activos: 0,
        en_mantenimiento: 0,
        capacidad_total: 0
      };

      if (camionesResponse.success && camionesResponse.stats) {
        camionesStats = {
          total_camiones: camionesResponse.stats.total_camiones || 0,
          camiones_activos: camionesResponse.stats.camiones_activos || 0,
          en_mantenimiento: camionesResponse.stats.en_mantenimiento || 0,
          capacidad_total: camionesResponse.stats.capacidad_total || 0
        };
      }

      // Aquí cargaremos las estadísticas reales cuando tengamos los endpoints
      // Por ahora usamos datos simulados para las demás
      setDashboardStats({
        productos_total: 145,
        productos_bajo_stock: 8,
        despachos_hoy: 12,
        ventas_hoy: 2340.50,
        usuarios_activos: 5,
        rutas_activas: 8,
        ...camionesStats
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
      // En caso de error, mantener datos simulados
      setDashboardStats({
        productos_total: 145,
        productos_bajo_stock: 8,
        despachos_hoy: 12,
        ventas_hoy: 2340.50,
        usuarios_activos: 5,
        rutas_activas: 8,
        total_camiones: 0,
        camiones_activos: 0,
        en_mantenimiento: 0,
        capacidad_total: 0
      })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const handleNavigate = (path) => {
    router.push(path)
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await logout()
    }
  }

  return (
    <>
      <Head>
        <title>Dashboard - Distribuidora Lorena</title>
        <meta name="description" content="Panel de control principal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-vh-100 bg-light">
        {/* Header de bienvenida */}
        <div className="bg-white shadow-sm border-bottom">
          <div className="container-fluid">
            <div className="row align-items-center py-3">
              <div className="col-md-8">
                <div className="d-flex align-items-center">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="me-3"
                    style={{ height: '50px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <h4 className="mb-0 text-primary">
                      {getGreeting()}, {user?.nombre_completo}
                    </h4>
                    <p className="mb-0 text-muted">
                      <i className="fas fa-user-shield me-1"></i>
                      {user?.tipo_usuario === 'administrador' ? 'Administrador del Sistema' : 'Despachador'}
                    </p>
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      {new Date().toLocaleDateString('es-SV', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center justify-content-end">
                  <img 
                    src={user?.foto_perfil || '/assets/images/default-user.png'} 
                    alt="Perfil" 
                    className="rounded-circle me-3"
                    style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/assets/images/default-user.png'
                    }}
                  />
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-1"></i>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid py-4">
          {/* Tarjetas de estadísticas */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Total Productos</h6>
                      <h3 className="mb-0">{dashboardStats.productos_total}</h3>
                    </div>
                    <i className="fas fa-boxes fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card bg-warning text-white h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Stock Bajo</h6>
                      <h3 className="mb-0">{dashboardStats.productos_bajo_stock}</h3>
                    </div>
                    <i className="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card bg-success text-white h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Despachos Hoy</h6>
                      <h3 className="mb-0">{dashboardStats.despachos_hoy}</h3>
                    </div>
                    <i className="fas fa-truck fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Ventas Hoy</h6>
                      <h3 className="mb-0">{formatCurrency(dashboardStats.ventas_hoy)}</h3>
                    </div>
                    <i className="fas fa-dollar-sign fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas adicionales de camiones (solo para admin) */}
          {isAdmin() && (
            <div className="row mb-4">
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card bg-dark text-white h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Total Camiones</h6>
                        <h3 className="mb-0">{dashboardStats.total_camiones}</h3>
                      </div>
                      <i className="fas fa-truck fa-2x opacity-75"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card bg-success text-white h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Camiones Activos</h6>
                        <h3 className="mb-0">{dashboardStats.camiones_activos}</h3>
                      </div>
                      <i className="fas fa-check-circle fa-2x opacity-75"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card bg-warning text-white h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">En Mantenimiento</h6>
                        <h3 className="mb-0">{dashboardStats.en_mantenimiento}</h3>
                      </div>
                      <i className="fas fa-tools fa-2x opacity-75"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card bg-info text-white h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Capacidad Total</h6>
                        <h3 className="mb-0">{dashboardStats.capacidad_total}T</h3>
                      </div>
                      <i className="fas fa-weight-hanging fa-2x opacity-75"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Accesos rápidos por tipo de usuario */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-tachometer-alt me-2"></i>
                Accesos Rápidos
              </h5>
            </div>

            <div className="card-body">
              {isAdmin() ? (
                // Accesos para Administrador
                <div className="row">
                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/usuarios')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-users fa-3x text-primary"></i>
                        </div>
                        <h5 className="card-title mb-2">Usuarios</h5>
                        <p className="card-text text-muted">
                          Gestionar usuarios del sistema
                        </p>
                        <div className="text-sm">
                          <span className="text-success">
                            <i className="fas fa-user-check me-1"></i>
                            {dashboardStats.usuarios_activos} Activos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/productos')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-boxes fa-3x text-success"></i>
                        </div>
                        <h5 className="card-title mb-2">Productos</h5>
                        <p className="card-text text-muted">
                          Catálogo y gestión de productos
                        </p>
                        <div className="d-flex justify-content-between text-sm">
                          <span className="text-primary">
                            <i className="fas fa-box me-1"></i>
                            {dashboardStats.productos_total} Total
                          </span>
                          <span className="text-warning">
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            {dashboardStats.productos_bajo_stock} Bajo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/inventario')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-warehouse fa-3x text-info"></i>
                        </div>
                        <h5 className="card-title mb-2">Inventario</h5>
                        <p className="card-text text-muted">
                          Control de stock y movimientos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/motoristas')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-id-card fa-3x text-secondary"></i>
                        </div>
                        <h5 className="card-title mb-2">Motoristas</h5>
                        <p className="card-text text-muted">
                          Gestión de conductores
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/camiones')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-truck fa-3x text-warning"></i>
                        </div>
                        <h5 className="card-title mb-2">Camiones</h5>
                        <p className="card-text text-muted">
                          Administrar flota de camiones
                        </p>
                        <div className="d-flex justify-content-between text-sm">
                          <span className="text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            {dashboardStats.camiones_activos} Activos
                          </span>
                          <span className="text-warning">
                            <i className="fas fa-tools me-1"></i>
                            {dashboardStats.en_mantenimiento} Mant.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/rutas')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-route fa-3x text-danger"></i>
                        </div>
                        <h5 className="card-title mb-2">Rutas</h5>
                        <p className="card-text text-muted">
                          Configuración de rutas de reparto
                        </p>
                        <div className="text-sm">
                          <span className="text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            {dashboardStats.rutas_activas} Activas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Accesos para Despachador
                <div className="row">
                  <div className="col-lg-6 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/inventario')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-eye fa-3x text-info"></i>
                        </div>
                        <h5 className="card-title mb-2">Ver Inventario</h5>
                        <p className="card-text text-muted">
                          Consultar productos disponibles
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/despacho')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-shipping-fast fa-3x text-primary"></i>
                        </div>
                        <h5 className="card-title mb-2">Despachos</h5>
                        <p className="card-text text-muted">
                          Realizar nuevos despachos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/despacho/mis-despachos')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-clipboard-list fa-3x text-success"></i>
                        </div>
                        <h5 className="card-title mb-2">Mis Despachos</h5>
                        <p className="card-text text-muted">
                          Ver y gestionar mis despachos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 mb-3">
                    <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => handleNavigate('/reportes')} style={{ cursor: 'pointer' }}>
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-chart-bar fa-3x text-warning"></i>
                        </div>
                        <h5 className="card-title mb-2">Reportes</h5>
                        <p className="card-text text-muted">
                          Generar reportes de despachos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="row mt-4">
            <div className="col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-bell text-warning me-2"></i>
                    Notificaciones Recientes
                  </h6>
                </div>
                <div className="card-body">
                  <div className="alert alert-warning alert-sm mb-2">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {dashboardStats.productos_bajo_stock} productos con stock bajo requieren atención
                  </div>
                  <div className="alert alert-success alert-sm mb-0">
                    <i className="fas fa-check-circle me-2"></i>
                    Sistema funcionando correctamente
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-clock text-info me-2"></i>
                    Actividad Reciente
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <small className="text-muted">Último acceso:</small>
                    <div>{new Date().toLocaleString('es-SV')}</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Último despacho:</small>
                    <div>Hace 2 horas</div>
                  </div>
                  <div className="mb-0">
                    <small className="text-muted">Ventas del día:</small>
                    <div className="fw-bold text-success">{formatCurrency(dashboardStats.ventas_hoy)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}