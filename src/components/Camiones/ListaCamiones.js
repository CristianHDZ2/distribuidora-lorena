// src/components/Camiones/ListaCamiones.js
import React, { useState, useEffect } from 'react';
import FormularioCamion from './FormularioCamion';
import DetalleCamion from './DetalleCamion';
import { camionesAPI } from '../../utils/api';

const ListaCamiones = () => {
    const [camiones, setCamiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        activos: 0,
        inactivos: 0,
        en_reparacion: 0
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        per_page: 10
    });
    const [filters, setFilters] = useState({
        marcas: [],
        modelos: []
    });
    
    // Estados de filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [marcaFilter, setMarcaFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Estados para modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCamion, setSelectedCamion] = useState(null);

    useEffect(() => {
        cargarCamiones();
    }, [currentPage, searchTerm, estadoFilter, marcaFilter]);

    const cargarCamiones = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
                estado: estadoFilter,
                marca: marcaFilter
            };

            console.log('🚀 Cargando camiones con parámetros:', params);
            const response = await camionesAPI.listar(params);
            console.log('✅ Respuesta de la API:', response);
            
            if (response && response.success) {
                setCamiones(response.data || []);
                setStats(response.stats || {});
                setPagination(response.pagination || {});
                setFilters(response.filters || {});
                setError('');
            } else {
                setError(response?.message || 'Error al cargar camiones');
                // Establecer datos por defecto si hay error
                setCamiones([]);
                setStats({ total: 0, activos: 0, inactivos: 0, en_reparacion: 0 });
            }
        } catch (error) {
            console.error('❌ Error:', error);
            setError('Error de conexión al cargar camiones');
            // Datos de fallback en caso de error
            setCamiones([]);
            setStats({ total: 0, activos: 0, inactivos: 0, en_reparacion: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleEstadoFilter = (e) => {
        setEstadoFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleMarcaFilter = (e) => {
        setMarcaFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCreate = () => {
        setSelectedCamion(null);
        setShowCreateModal(true);
    };

    const handleEdit = (camion) => {
        setSelectedCamion(camion);
        setShowEditModal(true);
    };

    const handleDetail = (camion) => {
        setSelectedCamion(camion);
        setShowDetailModal(true);
    };

    const handleSuccess = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        cargarCamiones();
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este camión?')) {
            try {
                const response = await camionesAPI.eliminar(id);
                if (response && response.success) {
                    cargarCamiones();
                } else {
                    alert(response?.message || 'Error al eliminar camión');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión al eliminar camión');
            }
        }
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'activo':
                return 'badge bg-success';
            case 'inactivo':
                return 'badge bg-secondary';
            case 'en_reparacion':
                return 'badge bg-warning text-dark';
            default:
                return 'badge bg-secondary';
        }
    };

    const getEstadoText = (estado) => {
        switch (estado) {
            case 'activo':
                return 'Activo';
            case 'inactivo':
                return 'Inactivo';
            case 'en_reparacion':
                return 'En Reparación';
            default:
                return 'Desconocido';
        }
    };
    // Renderizar páginas de paginación
    const renderPagination = () => {
        if (pagination.total_pages <= 1) return null;

        const pages = [];
        const totalPages = pagination.total_pages;
        const current = pagination.current_page;

        // Página anterior
        pages.push(
            <li key="prev" className={`page-item ${current === 1 ? 'disabled' : ''}`}>
                <button 
                    className="page-link" 
                    onClick={() => handlePageChange(current - 1)}
                    disabled={current === 1}
                >
                    Anterior
                </button>
            </li>
        );

        // Páginas numeradas
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
                pages.push(
                    <li key={i} className={`page-item ${i === current ? 'active' : ''}`}>
                        <button 
                            className="page-link" 
                            onClick={() => handlePageChange(i)}
                        >
                            {i}
                        </button>
                    </li>
                );
            } else if (i === current - 3 || i === current + 3) {
                pages.push(
                    <li key={i} className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
        }

        // Página siguiente
        pages.push(
            <li key="next" className={`page-item ${current === totalPages ? 'disabled' : ''}`}>
                <button 
                    className="page-link" 
                    onClick={() => handlePageChange(current + 1)}
                    disabled={current === totalPages}
                >
                    Siguiente
                </button>
            </li>
        );

        return (
            <nav>
                <ul className="pagination justify-content-center">
                    {pages}
                </ul>
            </nav>
        );
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="h3 mb-0">
                                <i className="fas fa-truck me-2 text-primary"></i>
                                Gestión de Camiones
                            </h2>
                            <p className="text-muted mb-0">Administra la flota de camiones</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreate}
                        >
                            <i className="fas fa-plus me-2"></i>
                            Nuevo Camión
                        </button>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="text-primary mb-2">
                                <i className="fas fa-truck fa-2x"></i>
                            </div>
                            <h3 className="mb-1">{stats.total || 0}</h3>
                            <p className="text-muted mb-0 small">Total Camiones</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="text-success mb-2">
                                <i className="fas fa-check-circle fa-2x"></i>
                            </div>
                            <h3 className="mb-1">{stats.activos || 0}</h3>
                            <p className="text-muted mb-0 small">Activos</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="text-warning mb-2">
                                <i className="fas fa-wrench fa-2x"></i>
                            </div>
                            <h3 className="mb-1">{stats.en_reparacion || 0}</h3>
                            <p className="text-muted mb-0 small">En Reparación</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="text-secondary mb-2">
                                <i className="fas fa-pause-circle fa-2x"></i>
                            </div>
                            <h3 className="mb-1">{stats.inactivos || 0}</h3>
                            <p className="text-muted mb-0 small">Inactivos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Buscar camión</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por placa, marca, modelo..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Estado</label>
                            <select
                                className="form-select"
                                value={estadoFilter}
                                onChange={handleEstadoFilter}
                            >
                                <option value="">Todos los estados</option>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                                <option value="en_reparacion">En Reparación</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Marca</label>
                            <select
                                className="form-select"
                                value={marcaFilter}
                                onChange={handleMarcaFilter}
                            >
                                <option value="">Todas las marcas</option>
                                {filters.marcas && filters.marcas.map(marca => (
                                    <option key={marca} value={marca}>
                                        {marca}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => {
                                    setSearchTerm('');
                                    setEstadoFilter('');
                                    setMarcaFilter('');
                                    setCurrentPage(1);
                                }}
                            >
                                <i className="fas fa-times me-2"></i>
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {/* Lista de camiones */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">
                        Lista de Camiones
                        {pagination.total_records > 0 && (
                            <small className="text-muted ms-2">
                                ({pagination.total_records} registros)
                            </small>
                        )}
                    </h5>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2 text-muted">Cargando camiones...</p>
                        </div>
                    ) : camiones.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-truck fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No hay camiones registrados</h5>
                            <p className="text-muted mb-3">Comienza agregando el primer camión</p>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Crear Primer Camión
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Placa</th>
                                            <th>Marca</th>
                                            <th>Modelo</th>
                                            <th>Año</th>
                                            <th>Capacidad</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {camiones.map((camion) => (
                                            <tr key={camion.id}>
                                                <td>
                                                    <strong>{camion.placa}</strong>
                                                </td>
                                                <td>{camion.marca}</td>
                                                <td>{camion.modelo}</td>
                                                <td>{camion.anio}</td>
                                                <td>{camion.capacidad_carga} Ton</td>
                                                <td>
                                                    <span className={getEstadoBadge(camion.estado)}>
                                                        {getEstadoText(camion.estado)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleDetail(camion)}
                                                            title="Ver detalles"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-warning"
                                                            onClick={() => handleEdit(camion)}
                                                            title="Editar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(camion.id)}
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
                            {pagination.total_pages > 1 && (
                                <div className="card-footer bg-white">
                                    {renderPagination()}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modales */}
            <FormularioCamion
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onSuccess={handleSuccess}
                camion={null}
            />

            <FormularioCamion
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                onSuccess={handleSuccess}
                camion={selectedCamion}
            />

            <DetalleCamion
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                camion={selectedCamion}
                onEdit={handleEdit}
            />
        </div>
    );
};

export default ListaCamiones;