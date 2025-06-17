// src/components/Auth/Login.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import useAuth from '../../hooks/useAuth'
import styles from '../../styles/Login.module.css'

const Login = () => {
  const [formData, setFormData] = useState({
    dui: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { login, isLoggedIn } = useAuth()
  const router = useRouter()

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard')
    }
  }, [isLoggedIn, router])

  // Formatear DUI automáticamente
  const formatDUI = (value) => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, '')
    
    // Limitar a 9 dígitos
    if (numbers.length <= 9) {
      // Agregar guión después del octavo dígito
      if (numbers.length > 8) {
        return numbers.slice(0, 8) + '-' + numbers.slice(8)
      }
      return numbers
    }
    return value
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'dui') {
      const formattedDUI = formatDUI(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedDUI
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Limpiar mensajes al escribir
    if (error) setError('')
    if (success) setSuccess('')
  }

  const validateForm = () => {
    if (!formData.dui.trim()) {
      setError('El DUI es requerido')
      return false
    }
    
    if (!formData.password.trim()) {
      setError('La contraseña es requerida')
      return false
    }

    // Validar formato de DUI (8 números, guión, 1 número)
    const duiRegex = /^\d{8}-\d$/
    if (!duiRegex.test(formData.dui)) {
      setError('Formato de DUI inválido. Use el formato: 12345678-9')
      return false
    }

    return true
  }

  // FUNCIÓN CORREGIDA - Esta era la línea 101 problemática
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🔐 Enviando datos de login:', formData)
      
      // Llamar a la función login y verificar el resultado
      const result = await login(formData)
      
      if (result === true) {
        setSuccess('Inicio de sesión exitoso')
        
        // Redireccionar al dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        throw new Error('Error inesperado en el login')
      }
    } catch (error) {
      console.error('❌ Error de login en handleSubmit:', error)
      setError(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className="container-fluid vh-100">
        <div className="row h-100">
          {/* Panel izquierdo - Información de la empresa */}
          <div className={`col-md-6 ${styles.loginInfoPanel} d-none d-md-flex`}>
            <div className={styles.loginInfoContent}>
              <div className="text-center mb-4">
                <img 
                  src="/logo.png" 
                  alt="Distribuidora Lorena" 
                  className={styles.logoLogin}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <h2 className="text-white mb-3">Distribuidora Lorena</h2>
              <p className="text-white-50 mb-4">
                Sistema integral de gestión de inventario y despacho de bebidas
              </p>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <i className="fas fa-boxes text-primary me-2"></i>
                  <span className="text-white-50">Gestión de Inventario</span>
                </div>
                <div className={styles.featureItem}>
                  <i className="fas fa-truck text-primary me-2"></i>
                  <span className="text-white-50">Control de Despachos</span>
                </div>
                <div className={styles.featureItem}>
                  <i className="fas fa-chart-bar text-primary me-2"></i>
                  <span className="text-white-50">Reportes Detallados</span>
                </div>
                <div className={styles.featureItem}>
                  <i className="fas fa-bell text-primary me-2"></i>
                  <span className="text-white-50">Notificaciones en Tiempo Real</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario de login */}
          <div className={`col-md-6 ${styles.loginFormPanel}`}>
            <div className={styles.loginFormContainer}>
              <div className="text-center mb-4 d-md-none">
                <img 
                  src="/logo.png" 
                  alt="Distribuidora Lorena" 
                  className={styles.logoLoginMobile}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <h3 className="mt-2">Distribuidora Lorena</h3>
              </div>

              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <h4 className="card-title text-center mb-4">Iniciar Sesión</h4>
                  
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                      <i className="fas fa-check-circle me-2"></i>
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="dui" className="form-label">
                        <i className="fas fa-id-card me-2"></i>
                        DUI
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="dui"
                        name="dui"
                        value={formData.dui}
                        onChange={handleInputChange}
                        placeholder="12345678-9"
                        maxLength="10"
                        required
                        disabled={loading}
                      />
                      <div className="form-text">
                        Formato: 8 dígitos, guión, 1 dígito
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">
                        <i className="fas fa-lock me-2"></i>
                        Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Ingrese su contraseña"
                        required
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Iniciar Sesión
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-4">
                    <small className="text-muted">
                      <i className="fas fa-shield-alt me-1"></i>
                      Sistema seguro con autenticación
                    </small>
                  </div>
                </div>
              </div>

              {/* Información de usuarios por defecto (solo para desarrollo) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4">
                  <div className="card border-info">
                    <div className="card-header bg-info text-white">
                      <small><i className="fas fa-info-circle me-1"></i> Usuarios de Prueba</small>
                    </div>
                    <div className="card-body p-3">
                      <small>
                        <strong>Administrador:</strong><br />
                        DUI: 12345678-9<br />
                        Contraseña: Password<br /><br />
                        <strong>Despachador:</strong><br />
                        DUI: 98765432-1<br />
                        Contraseña: Password
                      </small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login