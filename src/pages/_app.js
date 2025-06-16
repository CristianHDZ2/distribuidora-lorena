// src/pages/_app.js
import '@/styles/globals.css'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Head from 'next/head'
import Script from 'next/script'
import { AuthProvider } from '../hooks/useAuth'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Inicializar Bootstrap JavaScript cuando el componente se monte
    const loadBootstrap = async () => {
      if (typeof window !== 'undefined') {
        // Cargar Bootstrap JS dinámicamente
        const { default: bootstrap } = await import('bootstrap/dist/js/bootstrap.bundle.min.js')
        window.bootstrap = bootstrap
      }
    }
    
    loadBootstrap()
  }, [])

  return (
    <AuthProvider>
      <Head>
        <title>Distribuidora Lorena - Sistema de Despacho</title>
        <meta name="description" content="Sistema de gestión de despacho para Distribuidora Lorena" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
        
        {/* Preload de fuentes importantes */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          as="style" 
        />
        
        {/* Meta tags para PWA (opcional para futuro) */}
        <meta name="theme-color" content="#0d6efd" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Distribuidora Lorena" />
      </Head>

      {/* Scripts externos */}
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        strategy="lazyOnload"
        integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
        crossOrigin="anonymous"
      />
      
      <Script
        src="https://kit.fontawesome.com/your-kit-id.js"
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />

      <Component {...pageProps} />

      {/* Contenedor de notificaciones Toast */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
    </AuthProvider>
  )
}