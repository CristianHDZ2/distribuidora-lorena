import React, { useState, useEffect } from 'react';
import { camionesAPI } from '../../utils/api';
import FormularioCamion from './FormularioCamion';
import DetalleCamion from './DetalleCamion';
import FotosCamion from './FotosCamion';

const ListaCamiones = () => {
    const [camiones, setCamiones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Filtros y paginación
    const [buscar, setBuscar] = useState('');
    const [estado, setEstado] = useState('todos');
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    
    // Estadísticas
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        activos: 0,
        inactivos: 0,
        asignados: 0,
        disponibles: 0
    });
    
    // Modales
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [mostrarFotos, setMostrarFotos] = useState(false);
    const [camionSeleccionado, setCamionSeleccionado] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);

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
            
            const response = await camionesAPI.listar(params);
            
            if (response.success) {
                setCamiones(response.camiones);
                setTotalPaginas(response.paginacion.total_paginas);
                setTotalRegistros(response.paginacion.total_registros);
                setEstadisticas(response.estadisticas);
            }
        } catch (error) {
            console.error('Error al cargar camiones:', error);
            setError('Error al cargar los camiones');
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        setPaginaActual(1);
        cargarCamiones();
    };

    const cambiarPagina = (nuevaPagina) => {
        setPaginaActual(nuevaPagina);
    };

    const abrirFormularioNuevo = () => {
        setCamionSeleccionado(null);
        setModoEdicion(false);
        setMostrarFormulario(true);
    };

    const abrirFormularioEdicion = (camion) => {
        setCamionSeleccionado(camion);
        setModoEdicion(true);
        setMostrarFormulario(true);
    };

    const abrirDetalle = async (id) => {
        try {
            const response = await camionesAPI.obtener(id);
            if (response.success) {
                setCamionSeleccionado(response.camion);
                setMostrarDetalle(true);
            }
        } catch (error) {
            setError('Error al cargar los detalles del camión');
        }
    };

    const abrirFotos = (camion) => {
        setCamionSeleccionado(camion);
        setMostrarFotos(true);
    };

    const handleEliminar = async (id, numeroPlaca) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar el camión ${numeroPlaca}?`)) {
            return;
        }

        try {
            const response = await camionesAPI.eliminar(id);
            if (response.success) {
                setSuccess(response.message);
                cargarCamiones();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al eliminar el camión');
            setTimeout(() => setError(''), 3000);
        }
    };

    const toggleEstado = async (camion) => {
        try {
            const nuevoEstado = !camion.activo;
            const response = await camionesAPI.editar(camion.id, {
                numero_placa: camion.numero_placa,
                activo: nuevoEstado
            });
            
            if (response.success) {
                setSuccess(`Camión ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
                cargarCamiones();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al cambiar el estado del camión');
            setTimeout(() => setError(''), 3000);
        }
    };

    const onFormularioExito = (mensaje) => {
        setSuccess(mensaje);
        setMostrarFormulario(false);
        cargarCamiones();
        setTimeout(() => setSuccess(''), 3000);
    };

    const onFotosActualizadas = () => {
        cargarCamiones();
        setSuccess('Fotos actualizadas exitosamente');
        setTimeout(() => setSuccess(''), 3000);
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
                <button 
                    className="btn btn-primary"
                    onClick={abrirFormularioNuevo}
                >
                    <i className="fas fa-plus me-2"></i>
                    Nuevo Camión
                </button>
            </div>

            {/* Alertas */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
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
                                    placeholder="Ejemplo: P001-2024"
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
                                    Total: {totalRegistros} camiones
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
                                onClick={abrirFormularioNuevo}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Agregar Primer Camión
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Placa</th>
                                            <th>Fotos</th>
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
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => abrirFotos(camion)}
                                                        title="Ver/Gestionar fotos"
                                                    >
                                                        <i className="fas fa-camera me-1"></i>
                                                        {[camion.foto1, camion.foto2, camion.foto3].filter(f => f).length}/3
                                                    </button>
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
                                                            onClick={() => abrirDetalle(camion.id)}
                                                            title="Ver detalles"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-warning"
                                                            onClick={() => abrirFormularioEdicion(camion)}
                                                            title="Editar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm ${
                                                                camion.activo 
                                                                    ? 'btn-outline-secondary' 
                                                                    : 'btn-outline-success'
                                                            }`}
                                                            onClick={() => toggleEstado(camion)}
                                                            title={camion.activo ? 'Desactivar' : 'Activar'}
                                                        >
                                                            <i className={`fas ${
                                                                camion.activo 
                                                                    ? 'fa-toggle-on' 
                                                                    : 'fa-toggle-off'
                                                            }`}></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleEliminar(camion.id, camion.numero_placa)}
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

                            {/* Paginación */}
                            {totalPaginas > 1 && (
                                <nav className="mt-4">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => cambiarPagina(paginaActual - 1)}
                                                disabled={paginaActual === 1}
                                            >
                                                Anterior
                                            </button>
                                        </li>
                                        
                                        {[...Array(totalPaginas)].map((_, index) => {
                                            const numero = index + 1;
                                            if (
                                                numero === 1 || 
                                                numero === totalPaginas || 
                                                (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                                            ) {
                                                return (
                                                    <li key={numero} className={`page-item ${paginaActual === numero ? 'active' : ''}`}>
                                                        <button 
                                                            className="page-link"
                                                            onClick={() => cambiarPagina(numero)}
                                                        >
                                                            {numero}
                                                        </button>
                                                    </li>
                                                );
                                            } else if (
                                                numero === paginaActual - 2 || 
                                                numero === paginaActual + 2
                                            ) {
                                                return (
                                                    <li key={numero} className="page-item disabled">
                                                        <span className="page-link">...</span>
                                                    </li>
                                                );
                                            }
                                            return null;
                                        })}
                                        
                                        <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => cambiarPagina(paginaActual + 1)}
                                                disabled={paginaActual === totalPaginas}
                                            >
                                                Siguiente
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modales */}
            {mostrarFormulario && (
                <FormularioCamion
                    mostrar={mostrarFormulario}
                    onClose={() => setMostrarFormulario(false)}
                    onSuccess={onFormularioExito}
                    camion={camionSeleccionado}
                    modoEdicion={modoEdicion}
                />
            )}

            {mostrarDetalle && camionSeleccionado && (
                <DetalleCamion
                    mostrar={mostrarDetalle}
                    onClose={() => setMostrarDetalle(false)}
                    camion={camionSeleccionado}
                />
            )}

            {mostrarFotos && camionSeleccionado && (
                <FotosCamion
                    mostrar={mostrarFotos}
                    onClose={() => setMostrarFotos(false)}
                    camion={camionSeleccionado}
                    onFotosActualizadas={onFotosActualizadas}
                />
            )}
        </div>
    );
};

export default ListaCamiones;