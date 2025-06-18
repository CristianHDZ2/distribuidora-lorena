import React, { useState, useEffect } from 'react';
import { camionesAPI } from '../../utils/api';

const ListaCamiones = () => {
    const [camiones, setCamiones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Filtros y paginación
    const [buscar, setBuscar] = useState('');
    const [estado, setEstado] = useState('todos');
    const [paginaActual, setPaginaActual] = useState(1);
    
    // Estadísticas
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        activos: 0,
        inactivos: 0,
        asignados: 0,
        disponibles: 0
    });

    useEffect(() => {
        cargarCamiones();
    }, [paginaActual, buscar, estado]);

    const cargarCamiones = async () => {
        try {
            setLoading(true);
            setError('');
            
            const params = {
                pagina: paginaActual,
                limite: 10,
                buscar: buscar,
                estado: estado
            };
            
            // Intentar cargar desde el API
            const response = await camionesAPI.listar(params);
            
            if (response.success) {
                setCamiones(response.camiones || []);
                setEstadisticas(response.estadisticas || {
                    total: 0,
                    activos: 0,
                    inactivos: 0,
                    asignados: 0,
                    disponibles: 0
                });
            } else {
                throw new Error(response.message || 'Error al cargar camiones');
            }
        } catch (error) {
            console.error('Error al cargar camiones:', error);
            
            // Mostrar datos simulados si hay error de conexión
            setCamiones([
                {
                    id: 1,
                    numero_placa: 'CAM-001',
                    activo: 1,
                    fecha_creacion: '15/01/2024',
                    estado_asignacion: 'Disponible',
                    numero_ruta: null,
                    grupo_productos: null
                },
                {
                    id: 2,
                    numero_placa: 'CAM-002',
                    activo: 1,
                    fecha_creacion: '20/01/2024',
                    estado_asignacion: 'Asignado',
                    numero_ruta: 'R001',
                    grupo_productos: 'Big Cola'
                }
            ]);
            
            setEstadisticas({
                total: 2,
                activos: 2,
                inactivos: 0,
                asignados: 1,
                disponibles: 1
            });
            
            setError('Mostrando datos de ejemplo. Error de conexión: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        setPaginaActual(1);
        cargarCamiones();
    };

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>
                        <i className="fas fa-truck me-2 text-primary"></i>
                        Gestión de Camiones
                    </h2>
                    <p className="text-muted mb-0">Administra los camiones de la distribuidora</p>
                </div>
                <div className="btn-group" role="group">
                    <button 
                        className="btn btn-outline-primary"
                        onClick={() => window.location.href = '/camiones/crear'}
                        title="Crear en página dedicada"
                    >
                        <i className="fas fa-plus me-2"></i>
                        Crear Camión
                    </button>
                    <button 
                        className="btn btn-primary"
                        onClick={() => window.location.href = '/camiones/nuevo'}
                        title="Crear en modal"
                    >
                        <i className="fas fa-plus me-2"></i>
                        Nuevo Camión
                    </button>
                </div>
            </div>

            {/* Alertas */}
            {error && (
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
            )}

            {/* Estadísticas */}
            <div className="row mb-4">
                <div className="col-md-2">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Total</h6>
                                    <h3 className="mb-0">{estadisticas.total}</h3>
                                </div>
                                <i className="fas fa-truck fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Activos</h6>
                                    <h3 className="mb-0">{estadisticas.activos}</h3>
                                </div>
                                <i className="fas fa-check-circle fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card bg-secondary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Inactivos</h6>
                                    <h3 className="mb-0">{estadisticas.inactivos}</h3>
                                </div>
                                <i className="fas fa-times-circle fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Asignados</h6>
                                    <h3 className="mb-0">{estadisticas.asignados}</h3>
                                </div>
                                <i className="fas fa-route fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Disponibles</h6>
                                    <h3 className="mb-0">{estadisticas.disponibles}</h3>
                                </div>
                                <i className="fas fa-parking fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleBuscar}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Buscar por placa</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ejemplo: CAM-001"
                                    value={buscar}
                                    onChange={(e) => setBuscar(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Estado</label>
                                <select
                                    className="form-select"
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="activos">Activos</option>
                                    <option value="inactivos">Inactivos</option>
                                </select>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <button type="submit" className="btn btn-primary me-2">
                                    <i className="fas fa-search me-2"></i>
                                    Buscar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setBuscar('');
                                        setEstado('todos');
                                        setPaginaActual(1);
                                    }}
                                >
                                    Limpiar
                                </button>
                            </div>
                            <div className="col-md-2 text-end">
                                <small className="text-muted">
                                    Total: {camiones.length} camiones
                                </small>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Tabla de camiones */}
            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2">Cargando camiones...</p>
                        </div>
                    ) : camiones.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-truck fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No hay camiones registrados</h5>
                            <p className="text-muted">Comienza agregando un nuevo camión</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => window.location.href = '/camiones/nuevo'}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Agregar Primer Camión
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Placa</th>
                                        <th>Estado</th>
                                        <th>Asignación</th>
                                        <th>Ruta</th>
                                        <th>Fecha Registro</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {camiones.map(camion => (
                                        <tr key={camion.id}>
                                            <td>
                                                <strong>{camion.numero_placa}</strong>
                                            </td>
                                            <td>
                                                <span className={`badge ${camion.activo ? 'bg-success' : 'bg-secondary'}`}>
                                                    {camion.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    camion.estado_asignacion === 'Asignado' 
                                                        ? 'bg-warning' 
                                                        : 'bg-info'
                                                }`}>
                                                    {camion.estado_asignacion}
                                                </span>
                                            </td>
                                            <td>
                                                {camion.numero_ruta ? (
                                                    <div>
                                                        <strong>{camion.numero_ruta}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {camion.grupo_productos}
                                                        </small>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">Sin asignar</span>
                                                )}
                                            </td>
                                            <td>{camion.fecha_creacion}</td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={() => alert('Ver detalles - En desarrollo')}
                                                        title="Ver detalles"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-warning"
                                                        onClick={() => alert('Editar - En desarrollo')}
                                                        title="Editar"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => alert('Gestionar fotos - En desarrollo')}
                                                        title="Fotos"
                                                    >
                                                        <i className="fas fa-camera"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => alert('Eliminar - En desarrollo')}
                                                        title="Eliminar"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListaCamiones;