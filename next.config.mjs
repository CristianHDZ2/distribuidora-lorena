/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuración de imágenes
  images: {
    domains: ['localhost', '127.0.0.1'],
    unoptimized: true
  },
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/distribuidora-lorena/api'
  },
  
  // Redirecciones
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
  
  // Rewrites para manejar la API y mejorar el routing
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost/distribuidora-lorena/api/:path*',
      },
    ]
  },
  
  // Headers de seguridad y CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      // Headers específicos para la API
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          }
        ]
      }
    ]
  },
  
  // Configuración de transpilación
  transpilePackages: [],
  
  // Configuración de webpack para optimizaciones
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Mejorar la resolución de módulos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    
    // Optimizaciones para desarrollo
    if (dev) {
      config.devtool = 'eval-source-map'
    }
    
    return config
  },
  
  // Configuración experimental para mejor rendimiento
  experimental: {
    // Usar SWC para minificación más rápida
    swcMinify: true,
    // Mejorar la velocidad de compilación
    esmExternals: true,
  },
  
  // Configuración del servidor de desarrollo
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  
  // Configuración de compresión
  compress: true,
  
  // Configuración de páginas estáticas
  trailingSlash: false,
  
  // Configuración de salida para producción
  output: 'standalone',
  
  // Configuración de optimizaciones
  optimizeFonts: true,
  
  // Configuración de API routes timeout
  serverRuntimeConfig: {
    apiTimeout: 30000, // 30 segundos
  },
  
  // Configuración de variables públicas en runtime
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/distribuidora-lorena/api',
  }
}

export default nextConfig
