import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import ListaRutas from '../../components/Rutas/ListaRutas';
import DetalleRuta from '../../components/Rutas/DetalleRuta';

const RutasPage = () => {
  const router = useRouter();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [rutaEditando, setRutaEditando] = useState(null);
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' o 'detalle'
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

  // Crear nueva ruta
  const crearNuevaRuta = () => {
    setRutaEditando(null);
    setMostrarFormulario(true);
  };

  // Ver detalle de ruta
  const verDetalleRuta = (rutaId) => {
    setRutaSeleccionada(rutaId);
    setVistaActual('detalle');
  };

  // Volver a la lista
  const volverALista = () => {
    setVistaActual('lista');
    setRutaSeleccionada(null);
  };

  // Cuando se elimina una ruta desde el detalle
  const handleRutaEliminada = () => {
    volverALista();
  };

  // Ir a página de creación dedicada
  const irACrearRuta = () => {
    router.push('/rutas/crear');
  };

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <Head>
        <title>Gestión de Rutas - Distribuidora Lorena</title>
        <meta name="description" content="Gestión de rutas de Distribuidora Lorena" />
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
                      <i className="fas fa-route me-2 text-primary"></i>
                      Gestión de Rutas
                    </h2>
                    <p className="text-muted mb-0">
                      Administra las rutas con asignación de camiones y motoristas
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={crearNuevaRuta}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Nueva Ruta
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={irACrearRuta}
                    >
                      <i className="fas fa-road me-1"></i>
                      Crear Ruta
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Rutas */}
            <ListaRutas
              mostrarFormulario={mostrarFormulario}
              setMostrarFormulario={setMostrarFormulario}
              rutaEditando={rutaEditando}
              setRutaEditando={setRutaEditando}
              onRutaGuardada={() => {
                setMostrarFormulario(false);
                setRutaEditando(null);
              }}
              modoModal={true}
            />
          </>
        ) : (
          /* Detalle de Ruta */
          <DetalleRuta
            rutaId={rutaSeleccionada}
            onVolver={volverALista}
            onEliminar={handleRutaEliminada}
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

export default RutasPage;