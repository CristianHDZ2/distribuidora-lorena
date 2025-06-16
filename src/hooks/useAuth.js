// src/hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react'
import { useRouter } from 'next/router'
import { authAPI, getCurrentUser, isAuthenticated, setAuthData, clearAuthData } from '../utils/api'

// Crear contexto de autenticación
const AuthContext = createContext({})

// Provider de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth()
  }, [])

  // Verificar estado de autenticación
  const checkAuth = async () => {
    try {
      setLoading(true)
      
      // Verificar si hay token en localStorage
      if (!isAuthenticated()) {
        setIsLoggedIn(false)
        setUser(null)
        setLoading(false)
        return
      }

      // Verificar sesión con el servidor
      const response = await authAPI.verifySession()
      
      if (response.success) {
        setUser(response.data.user)
        setIsLoggedIn(true)
        
        // Actualizar datos en localStorage
        setAuthData(response.data.token, response.data.user)
      } else {
        // Sesión inválida, limpiar datos
        clearAuthData()
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      clearAuthData()
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Función de login
  const login = async (credentials) => {
    try {
      setLoading(true)
      
      const response = await authAPI.login(credentials)
      
      if (response.success) {
        setUser(response.data.user)
        setIsLoggedIn(true)
        
        // Guardar datos de autenticación
        setAuthData(response.data.token, response.data.user)
        
        return true
      } else {
        throw new Error(response.message || 'Error al iniciar sesión')
      }
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Función de logout
  const logout = async () => {
    try {
      setLoading(true)
      
      // Llamar al endpoint de logout
      try {
        await authAPI.logout()
      } catch (error) {
        console.error('Error en logout del servidor:', error)
        // Continuar con logout local aunque falle el servidor
      }
      
      // Limpiar estado local
      clearAuthData()
      setIsLoggedIn(false)
      setUser(null)
      
      // Redireccionar al login
      router.push('/login')
      
      return true
    } catch (error) {
      console.error('Error en logout:', error)
      
      // Aunque falle la llamada al servidor, limpiar datos locales
      clearAuthData()
      setIsLoggedIn(false)
      setUser(null)
      router.push('/login')
      
      return true
    } finally {
      setLoading(false)
    }
  }

  // Verificar permisos
  const hasPermission = (permission) => {
    if (!user) return false
    
    // Permisos específicos por tipo de usuario
    const permissions = {
      administrador: [
        'manage_users',
        'manage_products',
        'manage_inventory',
        'manage_dispatch',
        'manage_routes',
        'manage_drivers',
        'manage_trucks',
        'view_reports',
        'manage_reports',
        'system_settings'
      ],
      despachador: [
        'view_inventory',
        'manage_dispatch',
        'view_my_dispatches',
        'view_reports'
      ]
    }
    
    const userPermissions = permissions[user.tipo_usuario] || []
    return userPermissions.includes(permission)
  }

  // Verificar si es administrador
  const isAdmin = () => {
    return user?.tipo_usuario === 'administrador'
  }

  // Verificar si es despachador
  const isDespachador = () => {
    return user?.tipo_usuario === 'despachador'
  }

  // Actualizar datos del usuario
  const updateUser = (userData) => {
    setUser(userData)
    // Obtener token actual del localStorage
    const currentToken = localStorage.getItem('auth_token')
    if (currentToken) {
      setAuthData(currentToken, userData)
    }
  }

  const value = {
    user,
    loading,
    isLoggedIn,
    login,
    logout,
    checkAuth,
    hasPermission,
    isAdmin,
    isDespachador,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar el contexto de autenticación
const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  
  return context
}

export default useAuth