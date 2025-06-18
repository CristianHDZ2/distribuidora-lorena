import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import DetalleMotorista from '../../components/Motoristas/DetalleMotorista';

const MotoristaDetallePage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Volver a la lista de motoristas
  const volverALista = () => {
    router.push('/motoristas');
  };

  // Cuando se elimina el motorista
  const handleMotoristaEliminado = () => {
    // Mostrar mensaje de éxito y redirigir
    // Aquí iría el toast de éxito
    router.push('/motoristas');
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
        <title>Detalle de Motorista - Distribuidora Lorena</title>
        <meta name="description" content="Detalle del motorista en Distribuidora Lorena" />
      </Head>

      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  <i className="fas fa-user me-2 text-primary"></i>
                  Detalle del Motorista
                </h2>
                <p className="text-muted mb-0">
                  Información completa del motorista seleccionado
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

        {/* Detalle del Motorista */}
        <DetalleMotorista
          motoristaId={id}
          onVolver={volverALista}
          onEliminar={handleMotoristaEliminado}
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

export default MotoristaDetallePage;