// Archivo: src/hooks/useAuth.js

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { authAPI, setAuthData, clearAuthData, getCurrentUser, isAuthenticated } from '@/utils/api'

/**
 * Hook personalizado para manejar la autenticación
 * @returns {object} - Estado y funciones de autenticación
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  /**
   * Verificar sesión actual
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      
      // Verificar si hay token en localStorage
      if (!isAuthenticated()) {
        setUser(null)
        setIsLoggedIn(false)
        setLoading(false)
        return false
      }

      // Verificar sesión con el servidor
      const response = await authAPI.verifySession()
      
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        setIsLoggedIn(true)
        
        // Actualizar datos en localStorage si es necesario
        setAuthData(response.data.token, response.data.user)
        
        setLoading(false)
        return true
      } else {
        // Sesión inválida
        clearAuthData()
        setUser(null)
        setIsLoggedIn(false)
        setLoading(false)
        return false
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      clearAuthData()
      setUser(null)
      setIsLoggedIn(false)
      setLoading(false)
      return false
    }
  }, [])

  /**
   * Iniciar sesión
   * @param {object} credentials - Credenciales de login
   * @returns {Promise<boolean>}
   */
  const login = async (credentials) => {
    try {
      setLoading(true)
      
      const response = await authAPI.login(credentials)
      
      if (response.success && response.data) {
        const { token, user, permissions } = response.data
        
        // Guardar datos de autenticación
        setAuthData(token, { ...user, permissions })
        
        // Actualizar estado
        setUser({ ...user, permissions })
        setIsLoggedIn(true)
        
        toast.success(`¡Bienvenido ${user.nombre_completo}!`)
        
        setLoading(false)
        return true
      } else {
        toast.error(response.message || 'Error al iniciar sesión')
        setLoading(false)
        return false
      }
    } catch (error) {
      console.error('Error en login:', error)
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión'
      toast.error(errorMessage)
      setLoading(false)
      return false
    }
  }

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      setLoading(true)
      
      // Intentar cerrar sesión en el servidor
      try {
        await authAPI.logout()
      } catch (error) {
        console.error('Error cerrando sesión en servidor:', error)
        // Continuar con logout local aunque falle el servidor
      }
      
      // Limpiar datos locales
      clearAuthData()
      setUser(null)
      setIsLoggedIn(false)
      
      toast.success('Sesión cerrada correctamente')
      
      // Redireccionar al login
      router.push('/login')
      
      setLoading(false)
    } catch (error) {
      console.error('Error en logout:', error)
      // Forzar logout local
      clearAuthData()
      setUser(null)
      setIsLoggedIn(false)
      router.push('/login')
      setLoading(false)
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} permission - Permiso a verificar
   * @returns {boolean}
   */
  const hasPermission = useCallback((permission) => {
    if (!user?.permissions) return false
    return user.permissions[permission] === true
  }, [user])

  /**
   * Verificar si el usuario es administrador
   * @returns {boolean}
   */
  const isAdmin = useCallback(() => {
    return user?.tipo_usuario === 'administrador'
  }, [user])

  /**
   * Verificar si el usuario es despachador
   * @returns {boolean}
   */
  const isDespachador = useCallback(() => {
    return user?.tipo_usuario === 'despachador'
  }, [user])

  /**
   * Obtener datos del usuario actual
   * @returns {object|null}
   */
  const getUserData = useCallback(() => {
    return user
  }, [user])

  /**
   * Actualizar datos del usuario en estado
   * @param {object} newUserData - Nuevos datos del usuario
   */
  const updateUser = useCallback((newUserData) => {
    const updatedUser = { ...user, ...newUserData }
    setUser(updatedUser)
    
    // Actualizar también en localStorage
    const currentData = getCurrentUser()
    if (currentData) {
      setAuthData(localStorage.getItem('auth_token'), updatedUser)
    }
  }, [user])

  /**
   * Forzar logout (para casos de error de autenticación)
   */
  const forceLogout = useCallback(() => {
    clearAuthData()
    setUser(null)
    setIsLoggedIn(false)
    setLoading(false)
    router.push('/login')
  }, [router])

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Escuchar cambios en localStorage (para logout en múltiples pestañas)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' && !e.newValue) {
        // Token removido, hacer logout
        setUser(null)
        setIsLoggedIn(false)
        router.push('/login')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [router])

  // Verificar sesión periódicamente (cada 5 minutos)
  useEffect(() => {
    if (!isLoggedIn) return

    const interval = setInterval(() => {
      checkAuth().then(isValid => {
        if (!isValid) {
          toast.error('Tu sesión ha expirado')
          forceLogout()
        }
      })
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [isLoggedIn, checkAuth, forceLogout])

  return {
    // Estado
    user,
    loading,
    isLoggedIn,
    
    // Funciones principales
    login,
    logout,
    checkAuth,
    
    // Utilidades
    hasPermission,
    isAdmin,
    isDespachador,
    getUserData,
    updateUser,
    forceLogout,
    
    // Datos del usuario
    userType: user?.tipo_usuario || null,
    userName: user?.nombre_completo || null,
    userEmail: user?.correo_electronico || null,
    userPhoto: user?.foto_url || null,
  }
}

/**
 * Hook para proteger rutas que requieren autenticación
 * @param {object} options - Opciones de configuración
 * @returns {object}
 */
export const useAuthGuard = (options = {}) => {
  const {
    redirectTo = '/login',
    requiredPermission = null,
    adminOnly = false,
    despachadorOnly = false
  } = options

  const { user, loading, isLoggedIn, hasPermission, isAdmin, isDespachador } = useAuth()
  const router = useRouter()
  const [canAccess, setCanAccess] = useState(false)

  useEffect(() => {
    if (loading) return

    // Verificar si está autenticado
    if (!isLoggedIn) {
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

    setCanAccess(true)
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

  return {
    canAccess,
    loading,
    user
  }
}

/**
 * Context provider para autenticación (opcional)
 */
import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const auth = useAuth()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de AuthProvider')
  }
  return context
}

export default useAuth