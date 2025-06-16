// src/pages/dashboard/index.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/Auth/ProtectedRoute'
import useAuth from '../../hooks/useAuth'
import styles from '../../styles/Dashboard.module.css'

const Dashboard = () => {
  const { user, isAdmin, isDespachador, logout } = useAuth()
  const [dashboardStats, setDashboardStats] = useState({
    productos_total: 0,
    productos_bajo_stock: 0,
    despachos_hoy: 0,
    ventas_hoy: 0,
    usuarios_activos: 0,
    rutas_activas: 0
  })
  const router = useRouter()

  useEffect(() => {
    // Cargar estadísticas del dashboard
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      // Aquí cargaremos las estadísticas reales cuando tengamos los endpoints
      // Por ahora usamos datos simulados
      setDashboardStats({
        productos_total: 145,
        productos_bajo_stock: 8,
        despachos_hoy: 12,
        ventas_hoy: 2340.50,
        usuarios_activos: 5,
        rutas_activas: 8
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
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
      </Head>

      <div className={styles.dashboardContainer}>
        <div className="container-fluid py-4">
          {/* Header de bienvenida */}
          <div className="row mb-4">
            <div className="col-12">
              <div className={`card border-0 ${styles.welcomeHeader}`}>
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h2 className="mb-1 text-white">
                        {getGreeting()}, {user?.nombre_completo}
                      </h2>
                      <p className="mb-0 text-white opacity-75">
                        <i className="fas fa-user-tag me-2"></i>
                        {user?.tipo_usuario === 'administrador' ? 'Administrador del Sistema' : 'Despachador'}
                      </p>
                      <p className="mb-0 text-white opacity-75">
                        <i className="fas fa-calendar me-2"></i>
                        {new Date().toLocaleDateString('es-SV', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="col-md-4 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-3">
                        <div className="user-avatar">
                          <img
                            src={user?.foto_url || '/assets/images/default-user.png'}
                            alt={user?.nombre_completo}
                            className="rounded-circle"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = '/assets/images/default-user.png'
                            }}
                          />
                        </div>
                        <div>
                          <button 
                            className="btn btn-outline-light btn-sm"
                            onClick={handleLogout}
                            title="Cerrar Sesión"
                          >
                            <i className="fas fa-sign-out-alt me-2"></i>
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className={`${styles.iconCircle} bg-primary mb-3`}>
                    <i className="fas fa-boxes text-white"></i>
                  </div>
                  <h3 className="fw-bold text-primary">{dashboardStats.productos_total}</h3>
                  <p className="text-muted mb-0">Total Productos</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className={`${styles.iconCircle} bg-warning mb-3`}>
                    <i className="fas fa-exclamation-triangle text-white"></i>
                  </div>
                  <h3 className="fw-bold text-warning">{dashboardStats.productos_bajo_stock}</h3>
                  <p className="text-muted mb-0">Stock Bajo</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className={`${styles.iconCircle} bg-success mb-3`}>
                    <i className="fas fa-truck text-white"></i>
                  </div>
                  <h3 className="fw-bold text-success">{dashboardStats.despachos_hoy}</h3>
                  <p className="text-muted mb-0">Despachos Hoy</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className={`${styles.iconCircle} bg-info mb-3`}>
                    <i className="fas fa-dollar-sign text-white"></i>
                  </div>
                  <h3 className="fw-bold text-info">{formatCurrency(dashboardStats.ventas_hoy)}</h3>
                  <p className="text-muted mb-0">Ventas Hoy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accesos rápidos por tipo de usuario */}
          <div className="row mb-4">
            <div className="col-12">
              <h4 className="mb-3">
                <i className="fas fa-tachometer-alt me-2"></i>
                Accesos Rápidos
              </h4>
            </div>

            {isAdmin() ? (
              // Accesos para Administrador
              <>
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/usuarios')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-users fa-2x text-primary mb-2"></i>
                      <p className="mb-0 fw-semibold">Usuarios</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/productos')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-boxes fa-2x text-success mb-2"></i>
                      <p className="mb-0 fw-semibold">Productos</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/inventario')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-warehouse fa-2x text-info mb-2"></i>
                      <p className="mb-0 fw-semibold">Inventario</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/motoristas')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-user-tie fa-2x text-warning mb-2"></i>
                      <p className="mb-0 fw-semibold">Motoristas</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/camiones')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-truck fa-2x text-secondary mb-2"></i>
                      <p className="mb-0 fw-semibold">Camiones</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/rutas')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-route fa-2x text-danger mb-2"></i>
                      <p className="mb-0 fw-semibold">Rutas</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Accesos para Despachador
              <>
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/inventario')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-warehouse fa-2x text-info mb-2"></i>
                      <p className="mb-0 fw-semibold">Ver Inventario</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/despacho')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-truck-loading fa-2x text-primary mb-2"></i>
                      <p className="mb-0 fw-semibold">Despachos</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/despacho/mis-despachos')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-list-alt fa-2x text-success mb-2"></i>
                      <p className="mb-0 fw-semibold">Mis Despachos</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${styles.quickAccessCard}`} 
                       onClick={() => handleNavigate('/reportes')}>
                    <div className="card-body text-center p-3">
                      <i className="fas fa-chart-bar fa-2x text-warning mb-2"></i>
                      <p className="mb-0 fw-semibold">Reportes</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Información adicional */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent">
                  <h5 className="mb-0">
                    <i className="fas fa-bell me-2 text-warning"></i>
                    Notificaciones Recientes
                  </h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-warning border-0" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    8 productos con stock bajo requieren atención
                  </div>
                  <div className="alert alert-info border-0" role="alert">
                    <i className="fas fa-info-circle me-2"></i>
                    Sistema funcionando correctamente
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-3">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent">
                  <h5 className="mb-0">
                    <i className="fas fa-clock me-2 text-info"></i>
                    Actividad Reciente
                  </h5>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-2">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Último acceso: {new Date().toLocaleString('es-SV')}
                  </p>
                  <p className="text-muted small mb-2">
                    <i className="fas fa-truck me-2"></i>
                    Último despacho: Hace 2 horas
                  </p>
                  <p className="text-muted small mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    Ventas del día: {formatCurrency(dashboardStats.ventas_hoy)}
                  </p>
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