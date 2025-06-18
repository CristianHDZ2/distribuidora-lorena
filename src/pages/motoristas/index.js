import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import ListaMotoristas from '../../components/Motoristas/ListaMotoristas';
import DetalleMotorista from '../../components/Motoristas/DetalleMotorista';

const MotoristasPage = () => {
  const router = useRouter();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [motoristaEditando, setMotoristaEditando] = useState(null);
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' o 'detalle'
  const [motoristaSeleccionado, setMotoristaSeleccionado] = useState(null);

  // Crear nuevo motorista
  const crearNuevoMotorista = () => {
    setMotoristaEditando(null);
    setMostrarFormulario(true);
  };

  // Ver detalle de motorista
  const verDetalleMotorista = (motoristaId) => {
    setMotoristaSeleccionado(motoristaId);
    setVistaActual('detalle');
  };

  // Volver a la lista
  const volverALista = () => {
    setVistaActual('lista');
    setMotoristaSeleccionado(null);
  };

  // Cuando se elimina un motorista desde el detalle
  const handleMotoristaEliminado = () => {
    volverALista();
  };

  // Ir a página de creación dedicada
  const irACrearMotorista = () => {
    router.push('/motoristas/crear');
  };

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <Head>
        <title>Gestión de Motoristas - Distribuidora Lorena</title>
        <meta name="description" content="Gestión de motoristas de Distribuidora Lorena" />
      </Head>

      <div className="container-fluid">
        {vistaActual === 'lista' ? (
          <>
            {/* Header */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-1">
                      <i className="fas fa-users me-2 text-primary"></i>
                      Gestión de Motoristas
                    </h2>
                    <p className="text-muted mb-0">
                      Administra los motoristas de la distribuidora
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={crearNuevoMotorista}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Nuevo Motorista
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={irACrearMotorista}
                    >
                      <i className="fas fa-user-plus me-1"></i>
                      Crear Motorista
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Motoristas */}
            <ListaMotoristas
              mostrarFormulario={mostrarFormulario}
              setMostrarFormulario={setMostrarFormulario}
              motoristaEditando={motoristaEditando}
              setMotoristaEditando={setMotoristaEditando}
              onMotoristaGuardado={() => {
                setMostrarFormulario(false);
                setMotoristaEditando(null);
              }}
              modoModal={true}
            />
          </>
        ) : (
          /* Detalle de Motorista */
          <DetalleMotorista
            motoristaId={motoristaSeleccionado}
            onVolver={volverALista}
            onEliminar={handleMotoristaEliminado}
          />
        )}
      </div>

      <style jsx>{`
        .container-fluid {
          padding: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .container-fluid {
            padding: 1rem;
          }
          
          .d-flex.gap-2 {
            flex-direction: column;
            gap: 0.5rem !important;
          }
          
          .btn {
            width: 100%;
          }
          
          h2 {
            font-size: 1.5rem;
          }
        }
        
        @media (max-width: 576px) {
          .d-flex.justify-content-between {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
};

export default MotoristasPage;