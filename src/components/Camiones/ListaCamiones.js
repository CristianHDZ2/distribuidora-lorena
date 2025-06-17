import React, { useState, useEffect } from 'react';
import { camionesAPI } from '../../utils/api';
import FormularioCamion from './FormularioCamion';
import DetalleCamion from './DetalleCamion';

const ListaCamiones = () => {
    const [camiones, setCamiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({});
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({});
    
    // Estados de filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [marcaFilter, setMarcaFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Estados de modales
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCamion, setSelectedCamion] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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

            const response = await camionesAPI.listar(params);
            
            if (response.success) {
                setCamiones(response.data);
                setStats(response.stats);
                setPagination(response.pagination);
                setFilters(response.filters);
            } else {
                setError(response.message || 'Error al cargar camiones');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al cargar camiones');
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

    const handleNuevoCamion = () => {
        setSelectedCamion(null);
        setIsEditing(false);
        setShowFormModal(true);
    };

    const handleEditarCamion = (camion) => {
        setSelectedCamion(camion);
        setIsEditing(true);
        setShowFormModal(true);
    };

    const handleVerDetalle = async (camion) => {
        try {
            const response = await camionesAPI.obtener(camion.id);
            if (response.success) {
                setSelectedCamion(response.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEliminarCamion = async (camion) => {
        if (window.confirm(`¿Está seguro de eliminar el camión ${camion.placa}?`)) {
            try {
                const response = await camionesAPI.eliminar(camion.id);
                if (response.success) {
                    cargarCamiones();
                    // Toast notification
                    if (window.bootstrap) {
                        const toast = new window.bootstrap.Toast(document.getElementById('successToast'));
                        document.getElementById('toastMessage').textContent = response.message;
                        toast.show();
                    }
                } else {
                    alert(response.message || 'Error al eliminar camión');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión al eliminar camión');
            }
        }
    };

    const handleModalSuccess = () => {
        setShowFormModal(false);
        setSelectedCamion(null);
        cargarCamiones();
    };

    const getEstadoBadgeClass = (estado) => {
        switch (estado) {
            case 'activo':
                return 'bg-success';
            case 'mantenimiento':
                return 'bg-warning';
            case 'reparacion':
                return 'bg-danger';
            case 'inactivo':
                return 'bg-secondary';
            default:
                return 'bg-secondary';
        }
    };

    const renderPagination = () => {
        const pages = [];
        const maxPages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(pagination.total_pages, startPage + maxPages - 1);

        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <nav aria-label="Paginación de camiones">
                <ul className="pagination pagination-sm justify-content-center">
                    <li className={`page-item ${!pagination.has_previous ? 'disabled' : ''}`}>
                        <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!pagination.has_previous}
                        >
                            Anterior
                        </button>
                    </li>
                    
                    {pages.map(page => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        </li>
                    ))}
                    
                    <li className={`page-item ${!pagination.has_next ? 'disabled' : ''}`}>
                        <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!pagination.has_next}
                        >
                            Siguiente
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Estadísticas */}
            <div className="row mb-4">
                <div className="col-md-3 col-6 mb-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Total Camiones</h6>
                                    <h3 className="mb-0">{stats.total_camiones || 0}</h3>
                                </div>
                                <i className="fas fa-truck fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-3 col-6 mb-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Activos</h6>
                                    <h3 className="mb-0">{stats.camiones_activos || 0}</h3>
                                </div>
                                <i className="fas fa-check-circle fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-3 col-6 mb-3">
                    <div className="card bg-warning text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Mantenimiento</h6>
                                    <h3 className="mb-0">{stats.en_mantenimiento || 0}</h3>
                                </div>
                                <i className="fas fa-tools fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-3 col-6 mb-3">
                    <div className="card bg-info text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Capacidad Total</h6>
                                    <h3 className="mb-0">{stats.capacidad_total || 0}T</h3>
                                </div>
                                <i className="fas fa-weight-hanging fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header con filtros */}
            <div className="card mb-4">
                <div className="card-header">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h5 className="mb-0">
                                <i className="fas fa-truck me-2"></i>
                                Gestión de Camiones
                            </h5>
                        </div>
                        <div className="col-md-6 text-end">
                            <button 
                                className="btn btn-primary"
                                onClick={handleNuevoCamion}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Nuevo Camión
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Buscar</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por placa, marca o modelo..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        
                        <div className="col-md-4">
                            <label className="form-label">Estado</label>
                            <select
                                className="form-select"
                                value={estadoFilter}
                                onChange={handleEstadoFilter}
                            >
                                <option value="">Todos los estados</option>
                                {filters.estados_disponibles?.map(estado => (
                                    <option key={estado.value} value={estado.value}>
                                        {estado.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="col-md-4">
                            <label className="form-label">Marca</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por marca..."
                                value={marcaFilter}
                                onChange={handleMarcaFilter}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de camiones */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    {camiones.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="fas fa-truck fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No se encontraron camiones</h5>
                            <p className="text-muted">
                                {searchTerm || estadoFilter || marcaFilter 
                                    ? 'Intente ajustar los filtros de búsqueda'
                                    : 'Agregue el primer camión al sistema'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Placa</th>
                                            <th>Marca/Modelo</th>
                                            <th>Año</th>
                                            <th>Capacidad</th>
                                            <th>Combustible</th>
                                            <th>Estado</th>
                                            <th>Rutas</th>
                                            <th>Fotos</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {camiones.map(camion => (
                                            <tr key={camion.id}>
                                                <td>
                                                    <strong>{camion.placa}</strong>
                                                </td>
                                                <td>
                                                    {camion.marca} {camion.modelo}
                                                </td>
                                                <td>{camion.anio}</td>
                                                <td>{camion.capacidad_carga}T</td>
                                                <td>
                                                    <small className="text-muted">
                                                        {camion.combustible_texto}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getEstadoBadgeClass(camion.estado)}`}>
                                                        {camion.estado_texto}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info">
                                                        {camion.rutas_asignadas || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-secondary">
                                                        {camion.total_fotos || 0}/3
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-info"
                                                            onClick={() => handleVerDetalle(camion)}
                                                            title="Ver detalles"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-warning"
                                                            onClick={() => handleEditarCamion(camion)}
                                                            title="Editar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleEliminarCamion(camion)}
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
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <small className="text-muted">
                                        Mostrando {pagination.records_per_page * (currentPage - 1) + 1} - {Math.min(pagination.records_per_page * currentPage, pagination.total_records)} de {pagination.total_records} camiones
                                    </small>
                                    {renderPagination()}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal Formulario */}
            {showFormModal && (
                <FormularioCamion
                    show={showFormModal}
                    onHide={() => setShowFormModal(false)}
                    camion={selectedCamion}
                    isEditing={isEditing}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* Modal Detalle */}
            {showDetailModal && selectedCamion && (
                <DetalleCamion
                    show={showDetailModal}
                    onHide={() => setShowDetailModal(false)}
                    camion={selectedCamion}
                    onEdit={handleEditarCamion}
                    onRefresh={cargarCamiones}
                />
            )}
        </div>
    );
};

export default ListaCamiones;