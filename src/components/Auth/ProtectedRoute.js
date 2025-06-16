// src/components/Auth/ProtectedRoute.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useAuth from '../../hooks/useAuth'

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null, 
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

        // Verificar permisos específicos
        if (requiredPermission && !hasPermission(requiredPermission)) {
          console.error('No tienes permisos para acceder a esta página')
          router.push('/dashboard')
          return
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

  // Si no tiene acceso, no renderizar nada (ya se redirigió)
  if (!canAccess) {
    return null
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