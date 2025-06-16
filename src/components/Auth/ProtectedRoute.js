// Archivo: src/components/Auth/ProtectedRoute.js

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import useAuth from '@/hooks/useAuth'

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @param {string} props.requiredPermission - Permiso específico requerido
 * @param {boolean} props.adminOnly - Solo administradores
 * @param {boolean} props.despachadorOnly - Solo despachadores
 * @param {string} props.redirectTo - Ruta de redirección si no tiene acceso
 * @param {React.ReactNode} props.fallback - Componente a mostrar mientras verifica
 * @returns {React.ReactElement}
 */
const ProtectedRoute = ({
  children,
  requiredPermission = null,
  adminOnly = false,
  despachadorOnly = false,
  redirectTo = '/login',
  fallback = null
}) => {
  const router = useRouter()
  const { 
    user, 
    loading, 
    isLoggedIn, 
    hasPermission, 
    isAdmin, 
    isDespachador 
  } = useAuth()
  
  const [canAccess, setCanAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      // Esperar a que termine la verificación de autenticación
      if (loading) {
        return
      }

      setIsChecking(true)

      try {
        // Verificar si está autenticado
        if (!isLoggedIn) {
          toast.info('Debes iniciar sesión para acceder')
          router.push(redirectTo)
          return
        }

        // Verificar permisos específicos
        if (requiredPermission && !hasPermission(requiredPermission)) {
          toast.error('No tienes permisos para acceder a esta página')
          router.push('/dashboard')
          return
        }

        // Verificar si requiere ser administrador
        if (adminOnly && !isAdmin()) {
          toast.error('Solo los administradores pueden acceder a esta página')
          router.push('/dashboard')
          return
        }

        // Verificar si requiere ser despachador
        if (despachadorOnly && !isDespachador()) {
          toast.error('Solo los despachadores pueden acceder a esta página')
          router.push('/dashboard')
          return
        }

        // Si pasa todas las verificaciones, permitir acceso
        setCanAccess(true)
      } catch (error) {
        console.error('Error verificando acceso:', error)
        toast.error('Error verificando permisos')
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

/**
 * HOC para envolver páginas que requieren autenticación
 * @param {React.Component} Component - Componente de página
 * @param {object} options - Opciones de protección
 * @returns {React.Component}
 */
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

/**
 * Componente para mostrar contenido solo si el usuario tiene permisos específicos
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido a mostrar
 * @param {string} props.permission - Permiso requerido
 * @param {boolean} props.adminOnly - Solo para administradores
 * @param {boolean} props.despachadorOnly - Solo para despachadores
 * @param {React.ReactNode} props.fallback - Contenido alternativo
 * @returns {React.ReactElement|null}
 */
export const PermissionGate = ({
  children,
  permission = null,
  adminOnly = false,
  despachadorOnly = false,
  fallback = null
}) => {
  const { user, hasPermission, isAdmin, isDespachador } = useAuth()

  // Si no hay usuario, no mostrar nada
  if (!user) {
    return fallback
  }

  // Verificar permiso específico
  if (permission && !hasPermission(permission)) {
    return fallback
  }

  // Verificar si requiere ser administrador
  if (adminOnly && !isAdmin()) {
    return fallback
  }

  // Verificar si requiere ser despachador
  if (despachadorOnly && !isDespachador()) {
    return fallback
  }

  // Si pasa todas las verificaciones, mostrar contenido
  return children
}

/**
 * Hook para verificar permisos de manera condicional
 * @param {object} options - Opciones de verificación
 * @returns {object}
 */
export const usePermissions = (options = {}) => {
  const {
    permission = null,
    adminOnly = false,
    despachadorOnly = false
  } = options

  const { user, hasPermission, isAdmin, isDespachador } = useAuth()

  const canAccess = () => {
    if (!user) return false
    
    if (permission && !hasPermission(permission)) return false
    if (adminOnly && !isAdmin()) return false
    if (despachadorOnly && !isDespachador()) return false
    
    return true
  }

  return {
    canAccess: canAccess(),
    user,
    isAdmin: isAdmin(),
    isDespachador: isDespachador(),
    hasPermission
  }
}

export default ProtectedRoute