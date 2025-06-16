// Archivo: src/pages/login.js

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import useAuth from '@/hooks/useAuth'

export default function Login() {
  const router = useRouter()
  const { login, isLoggedIn, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm()

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      router.push('/dashboard')
    }
  }, [isLoggedIn, authLoading, router])

  // Formatear DUI automáticamente
  const duiValue = watch('dui')
  useEffect(() => {
    if (duiValue) {
      const formatted = formatDUI(duiValue)
      if (formatted !== duiValue) {
        setValue('dui', formatted)
      }
    }
  }, [duiValue, setValue])

  /**
   * Formatear DUI con guión automático
   */
  const formatDUI = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '')
    if (cleaned.length <= 8) {
      return cleaned
    }
    return cleaned.slice(0, 8) + '-' + cleaned.slice(8, 9)
  }

  /**
   * Manejar envío del formulario
   */
  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      
      const success = await login({
        dui: data.dui,
        password: data.password
      })
      
      if (success) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error en login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Manejar entrada de DUI
   */
  const handleDUIChange = (e) => {
    const value = e.target.value
    const formatted = formatDUI(value)
    setValue('dui', formatted)
  }

  // Mostrar loading si está verificando autenticación
  if (authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Iniciar Sesión - Distribuidora Lorena</title>
        <meta name="description" content="Inicia sesión en el sistema de Distribuidora Lorena" />
      </Head>

      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  {/* Logo */}
                  <div className="text-center mb-4">
                    <Image
                      src="/logo.png"
                      alt="Distribuidora Lorena"
                      width={120}
                      height={120}
                      className="mb-3"
                      priority
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    <h2 className="fw-bold text-primary mb-1">Distribuidora Lorena</h2>
                    <p className="text-muted">Sistema de Gestión de Despacho</p>
                  </div>

                  {/* Formulario de Login */}
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* DUI */}
                    <div className="form-group mb-3">
                      <label htmlFor="dui" className="form-label fw-medium">
                        <i className="bi bi-person-fill me-2"></i>
                        DUI
                      </label>
                      <input
                        type="text"
                        id="dui"
                        className={`form-control form-control-lg ${errors.dui ? 'is-invalid' : ''}`}
                        placeholder="12345678-9"
                        maxLength="10"
                        {...register('dui', {
                          required: 'El DUI es requerido',
                          pattern: {
                            value: /^\d{8}-\d$/,
                            message: 'Formato de DUI inválido (Ej: 12345678-9)'
                          }
                        })}
                        onChange={handleDUIChange}
                        disabled={isLoading}
                      />
                      {errors.dui && (
                        <div className="invalid-feedback">
                          {errors.dui.message}
                        </div>
                      )}
                    </div>

                    {/* Contraseña */}
                    <div className="form-group mb-4">
                      <label htmlFor="password" className="form-label fw-medium">
                        <i className="bi bi-lock-fill me-2"></i>
                        Contraseña
                      </label>
                      <input
                        type="password"
                        id="password"
                        className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Ingresa tu contraseña"
                        {...register('password', {
                          required: 'La contraseña es requerida',
                          minLength: {
                            value: 6,
                            message: 'La contraseña debe tener al menos 6 caracteres'
                          }
                        })}
                        disabled={isLoading}
                      />
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password.message}
                        </div>
                      )}
                    </div>

                    {/* Botón de Login */}
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 fw-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </span>
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Iniciar Sesión
                        </>
                      )}
                    </button>
                  </form>

                  {/* Información de usuarios demo */}
                  <div className="mt-4 pt-4 border-top">
                    <h6 className="text-muted mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      Usuarios de Prueba
                    </h6>
                    <div className="row g-2">
                      <div className="col-12">
                        <div className="card bg-light border-0">
                          <div className="card-body p-3">
                            <h6 className="card-title mb-1 text-primary">
                              <i className="bi bi-person-gear me-1"></i>
                              Administrador
                            </h6>
                            <p className="card-text small mb-1">
                              <strong>DUI:</strong> 12345678-9
                            </p>
                            <p className="card-text small mb-0">
                              <strong>Contraseña:</strong> Password
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="card bg-light border-0">
                          <div className="card-body p-3">
                            <h6 className="card-title mb-1 text-success">
                              <i className="bi bi-truck me-1"></i>
                              Despachador
                            </h6>
                            <p className="card-text small mb-1">
                              <strong>DUI:</strong> 98765432-1
                            </p>
                            <p className="card-text small mb-0">
                              <strong>Contraseña:</strong> Password
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-4">
                <p className="text-muted small">
                  © 2024 Distribuidora Lorena. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos específicos para la página de login */}
      <style jsx>{`
        .min-vh-100 {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .card {
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        .btn-primary {
          background: linear-gradient(45deg, #0d6efd, #0056b3);
          border: none;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          transform: none;
        }
        
        .card-title {
          font-size: 0.875rem;
        }
        
        .card-text {
          font-size: 0.75rem;
        }
        
        @media (max-width: 576px) {
          .card-body {
            padding: 2rem !important;
          }
          
          .container {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  )
}