// src/pages/index.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import useAuth from '../hooks/useAuth'

export default function Home() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        // Si está autenticado, ir al dashboard
        router.push('/dashboard')
      } else {
        // Si no está autenticado, ir al login
        router.push('/login')
      }
    }
  }, [isLoggedIn, loading, router])

  // Mostrar loading mientras redirecciona
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando...</span>
        </div>
        <h5 className="text-muted">Distribuidora Lorena</h5>
        <p className="text-muted small">Cargando sistema...</p>
      </div>
    </div>
  )
}