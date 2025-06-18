import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import DetalleRuta from '../../components/Rutas/DetalleRuta';

const RutaDetallePage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Volver a la lista de rutas
  const volverALista = () => {
    router.push('/rutas');
  };

  // Cuando se elimina la ruta
  const handleRutaEliminada = () => {
    // Mostrar mensaje de éxito y redirigir
    // Aquí iría el toast de éxito
    router.push('/rutas');
  };

  // Si no hay ID, mostrar loading o redirigir
  if (!id) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <Head>
        <title>Detalle de Ruta - Distribuidora Lorena</title>
        <meta name="description" content="Detalle de la ruta en Distribuidora Lorena" />
      </Head>

      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  <i className="fas fa-route me-2 text-primary"></i>
                  Detalle de la Ruta
                </h2>
                <p className="text-muted mb-0">
                  Información completa de la ruta seleccionada
                </p>
              </div>
              <button
                className="btn btn-outline-secondary"
                onClick={volverALista}
              >
                <i className="fas fa-arrow-left me-1"></i>
                Volver a Lista
              </button>
            </div>
          </div>
        </div>

        {/* Detalle de la Ruta */}
        <DetalleRuta
          rutaId={id}
          onVolver={volverALista}
          onEliminar={handleRutaEliminada}
        />
      </div>

      <style jsx>{`
        .container-fluid {
          padding: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .container-fluid {
            padding: 1rem;
          }
          
          .d-flex.justify-content-between {
            flex-direction: column;
            gap: 1rem;
          }
          
          .btn {
            width: 100%;
          }
          
          h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
};

export default RutaDetallePage;