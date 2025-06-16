// src/pages/login.js
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Login from '../components/Auth/Login'
import useAuth from '../hooks/useAuth'

export default function LoginPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.push('/dashboard')
    }
  }, [isLoggedIn, loading, router])

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar login
  if (isLoggedIn) {
    return null
  }

  return (
    <>
      <Head>
        <title>Iniciar Sesión - Distribuidora Lorena</title>
        <meta name="description" content="Inicia sesión en el sistema de gestión de Distribuidora Lorena" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Login />
    </>
  )
}