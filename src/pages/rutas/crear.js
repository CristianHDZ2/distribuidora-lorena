import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import FormularioRuta from '../../components/Rutas/FormularioRuta';
import { rutasAPI } from '../../utils/api';

const CrearRutaPage = () => {
  const router = useRouter();
  const [recursosDisponibles, setRecursosDisponibles] = useState({ camiones: [], motoristas: [] });
  const [loading, setLoading] = useState(true);

  // Cargar recursos disponibles
  const cargarRecursos = async () => {
    try {
      setLoading(true);
      const response = await rutasAPI.listar({ limite: 1 }); // Solo para obtener recursos
      setRecursosDisponibles(response.recursos_disponibles);
    } catch (error) {
      console.error('Error al cargar recursos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRecursos();
  }, []);

  // Volver a la lista de rutas
  const volverALista = () => {
    router.push('/rutas');
  };

  // Cuando se guarda la ruta
  const handleRutaGuardada = () => {
    // Mostrar mensaje de éxito y redirigir
    // Aquí iría el toast de éxito
    router.push('/rutas');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando recursos...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <Head>
        <title>Crear Ruta - Distribuidora Lorena</title>
        <meta name="description" content="Crear nueva ruta en Distribuidora Lorena" />
      </Head>

      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  <i className="fas fa-road me-2 text-primary"></i>
                  Crear Nueva Ruta
                </h2>
                <p className="text-muted mb-0">
                  Asigna un camión y motorista a una nueva ruta de distribución
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

        {/* Información de Recursos Disponibles */}
        {(recursosDisponibles.camiones.length === 0 || recursosDisponibles.motoristas.length === 0) && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-warning">
                <h6 className="alert-heading">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Recursos Insuficientes
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <strong>Camiones disponibles:</strong> {recursosDisponibles.camiones.length}
                    {recursosDisponibles.camiones.length === 0 && (
                      <div className="text-danger small">
                        No hay camiones disponibles. Necesitas registrar camiones o liberar camiones de otras rutas.
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <strong>Motoristas disponibles:</strong> {recursosDisponibles.motoristas.length}
                    {recursosDisponibles.motoristas.length === 0 && (
                      <div className="text-danger small">
                        No hay motoristas disponibles. Necesitas registrar motoristas o liberar motoristas de otras rutas.
                      </div>
                    )}
                  </div>
                </div>
                <hr />
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => router.push('/camiones/crear')}
                  >
                    <i className="fas fa-truck me-1"></i>
                    Registrar Camión
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => router.push('/motoristas/crear')}
                  >
                    <i className="fas fa-user-plus me-1"></i>
                    Registrar Motorista
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => router.push('/rutas')}
                  >
                    <i className="fas fa-list me-1"></i>
                    Ver Rutas Existentes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumen de Recursos */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white p-3 rounded me-3">
                    <i className="fas fa-truck fa-lg"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Camiones Disponibles</h6>
                    <h4 className="mb-0 text-primary">{recursosDisponibles.camiones.length}</h4>
                    <small className="text-muted">Para asignar a rutas</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-success text-white p-3 rounded me-3">
                    <i className="fas fa-users fa-lg"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Motoristas Disponibles</h6>
                    <h4 className="mb-0 text-success">{recursosDisponibles.motoristas.length}</h4>
                    <small className="text-muted">Para asignar a rutas</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="row">
          <div className="col-12">
            <FormularioRuta
              ruta={null}
              recursosDisponibles={recursosDisponibles}
              onClose={volverALista}
              onGuardado={handleRutaGuardada}
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
          
          .d-flex.gap-2.flex-wrap {
            flex-direction: column;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
};

export default CrearRutaPage;