// src/components/Auth/ProtectedRoute.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useAuth from '../../hooks/useAuth' // Cambio aquí: import default

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null, 
  requiredPermissions = [], // Agregado para compatibilidad
  adminOnly = false, 
  despachadorOnly = false,
  redirectTo = '/login',
  fallback = null 
}) => {
  const { loading, isLoggedIn, hasPermission, isAdmin, isDespachador } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [canAccess, setCanAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsChecking(true)

        // Esperar a que termine la verificación inicial de autenticación
        if (loading) {
          return
        }

        // Verificar si está autenticado
        if (!isLoggedIn) {
          router.push(redirectTo)
          return
        }

        // Verificar permisos específicos (individual)
        if (requiredPermission && !hasPermission(requiredPermission)) {
          console.error('No tienes permisos para acceder a esta página')
          router.push('/dashboard')
          return
        }

        // Verificar permisos específicos (array) - para compatibilidad
        if (requiredPermissions.length > 0) {
          const tienePermiso = requiredPermissions.some(permission => {
            // Si el permiso es solo texto, verificar si es administrador
            if (permission === 'administrador') {
              return isAdmin()
            }
            if (permission === 'despachador') {
              return isDespachador()
            }
            if (permission === 'manage_users') {
              return isAdmin()
            }
            // Usar la función hasPermission para otros permisos
            return hasPermission(permission)
          })

          if (!tienePermiso) {
            console.error('No tienes permisos para acceder a esta página')
            router.push('/dashboard')
            return
          }
        }

        // Verificar si requiere ser administrador
        if (adminOnly && !isAdmin()) {
          console.error('Solo los administradores pueden acceder a esta página')
          router.push('/dashboard')
          return
        }

        // Verificar si requiere ser despachador
        if (despachadorOnly && !isDespachador()) {
          console.error('Solo los despachadores pueden acceder a esta página')
          router.push('/dashboard')
          return
        }

        // Si pasa todas las verificaciones, permitir acceso
        setCanAccess(true)
      } catch (error) {
        console.error('Error verificando acceso:', error)
        router.push('/dashboard')
      } finally {
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [
    loading,
    isLoggedIn,
    hasPermission,
    isAdmin,
    isDespachador,
    requiredPermission,
    requiredPermissions,
    adminOnly,
    despachadorOnly,
    router,
    redirectTo
  ])

  // Mostrar loading mientras verifica autenticación o acceso
  if (loading || isChecking) {
    if (fallback) {
      return fallback
    }

    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Verificando permisos...</h5>
          <p className="text-muted small">Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  // Si no tiene acceso, mostrar mensaje de acceso denegado
  if (!canAccess) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning fs-1 mb-3"></i>
          <h3 className="text-warning">Acceso Denegado</h3>
          <p className="text-muted">No tienes permisos para acceder a esta sección.</p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn btn-primary"
          >
            <i className="fas fa-home me-2"></i>
            Ir al Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Si tiene acceso, renderizar componentes hijos
  return children
}

// HOC para envolver páginas que requieren autenticación
export const withAuth = (Component, options = {}) => {
  const AuthenticatedComponent = (props) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }

  // Preservar nombre del componente para debugging
  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`

  return AuthenticatedComponent
}

// Componente para mostrar contenido solo si el usuario tiene permisos específicos
export const PermissionGuard = ({ 
  children, 
  permission = null, 
  adminOnly = false, 
  despachadorOnly = false,
  fallback = null 
}) => {
  const { hasPermission, isAdmin, isDespachador } = useAuth()

  // Verificar permisos
  const hasAccess = () => {
    if (adminOnly && !isAdmin()) return false
    if (despachadorOnly && !isDespachador()) return false
    if (permission && !hasPermission(permission)) return false
    return true
  }

  // Si no tiene acceso, mostrar fallback o nada
  if (!hasAccess()) {
    return fallback || null
  }

  // Si tiene acceso, mostrar contenido
  return children
}

export default ProtectedRoute