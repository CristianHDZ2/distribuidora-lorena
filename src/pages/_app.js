// Archivo: src/pages/_app.js

import '@/styles/globals.css'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Head from 'next/head'
import Script from 'next/script'

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
    <>
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
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        strategy="beforeInteractive"
      />
      
      {/* Chart.js para gráficas */}
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="lazyOnload"
      />

      {/* Componente principal */}
      <div className="main-layout">
        <Component {...pageProps} />
        
        {/* Container para notificaciones toast */}
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
          toastClassName="toast-custom"
          bodyClassName="toast-body-custom"
        />
      </div>

      {/* Estilos personalizados para las notificaciones */}
      <style jsx global>{`
        .toast-custom {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .toast-body-custom {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
        }
        
        .Toastify__toast--success {
          background-color: #d1e7dd;
          color: #0f5132;
        }
        
        .Toastify__toast--error {
          background-color: #f8d7da;
          color: #842029;
        }
        
        .Toastify__toast--warning {
          background-color: #fff3cd;
          color: #664d03;
        }
        
        .Toastify__toast--info {
          background-color: #d1ecf1;
          color: #055160;
        }
        
        .Toastify__progress-bar--success {
          background-color: #198754;
        }
        
        .Toastify__progress-bar--error {
          background-color: #dc3545;
        }
        
        .Toastify__progress-bar--warning {
          background-color: #ffc107;
        }
        
        .Toastify__progress-bar--info {
          background-color: #0dcaf0;
        }

        /* Loading states */
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0d6efd;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Animations */
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .Toastify__toast-container {
            width: 95vw;
            left: 50%;
            transform: translateX(-50%);
            padding: 0;
          }
        }
      `}</style>
    </>
  )
}