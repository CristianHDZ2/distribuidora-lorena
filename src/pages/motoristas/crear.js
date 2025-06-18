import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import FormularioMotorista from '../../components/Motoristas/FormularioMotorista';

const CrearMotoristaPage = () => {
  const router = useRouter();

  // Volver a la lista de motoristas
  const volverALista = () => {
    router.push('/motoristas');
  };

  // Cuando se guarda el motorista
  const handleMotoristaGuardado = () => {
    // Mostrar mensaje de éxito y redirigir
    // Aquí iría el toast de éxito
    router.push('/motoristas');
  };

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <Head>
        <title>Crear Motorista - Distribuidora Lorena</title>
        <meta name="description" content="Crear nuevo motorista en Distribuidora Lorena" />
      </Head>

      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  <i className="fas fa-user-plus me-2 text-primary"></i>
                  Crear Nuevo Motorista
                </h2>
                <p className="text-muted mb-0">
                  Registra un nuevo motorista en el sistema
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

        {/* Formulario */}
        <div className="row">
          <div className="col-12">
            <FormularioMotorista
              motorista={null}
              onClose={volverALista}
              onGuardado={handleMotoristaGuardado}
              modoModal={false}
            />
          </div>
        </div>
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

export default CrearMotoristaPage;