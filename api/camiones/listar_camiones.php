<?php
// api/camiones/listar_camiones.php
require_once '../config/database.php';

// Verificar autenticación
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Verificar método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Parámetros de búsqueda y filtros
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $estado = isset($_GET['estado']) ? trim($_GET['estado']) : '';
    $marca = isset($_GET['marca']) ? trim($_GET['marca']) : '';
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    // Parámetros de paginación
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $page = max(1, $page);
    $limit = min(100, max(1, $limit));
    $offset = ($page - 1) * $limit;
    
    // Si se solicita un camión específico
    if ($id > 0) {
        $stmt = $pdo->prepare("
            SELECT c.*, 
                   u.nombre_completo as created_by_name,
                   COUNT(DISTINCT d.id) as total_despachos,
                   MAX(d.fecha_salida) as ultima_actividad
            FROM camiones c
            LEFT JOIN usuarios u ON c.created_by = u.id
            LEFT JOIN rutas r ON c.id = r.camion_id
            LEFT JOIN despachos d ON r.id = d.ruta_id
            WHERE c.id = ? AND c.deleted_at IS NULL
            GROUP BY c.id
        ");
        $stmt->execute([$id]);
        $camion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$camion) {
            $database->closeConnection();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Camión no encontrado']);
            exit;
        }
        
        // Obtener fotos del camión si existen
        $fotos_stmt = $pdo->prepare("
            SELECT id, nombre_archivo, ruta_archivo, tipo_foto, created_at
            FROM camion_fotos 
            WHERE camion_id = ? 
            ORDER BY tipo_foto ASC, created_at ASC
        ");
        $fotos_stmt->execute([$id]);
        $camion['fotos'] = $fotos_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Obtener rutas asignadas
        $rutas_stmt = $pdo->prepare("
            SELECT r.id, r.numero_ruta, r.lugar_recorrido, r.grupo_productos, r.activa
            FROM rutas r
            WHERE r.camion_id = ? AND r.deleted_at IS NULL
        ");
        $rutas_stmt->execute([$id]);
        $camion['rutas_asignadas'] = $rutas_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $database->closeConnection();
        
        echo json_encode([
            'success' => true,
            'data' => $camion
        ]);
        exit;
    }
    
    // Construir WHERE clause para listado
    $where_conditions = ["c.deleted_at IS NULL"];
    $params = [];
    
    if (!empty($search)) {
        $where_conditions[] = "(c.placa LIKE ? OR c.marca LIKE ? OR c.modelo LIKE ?)";
        $search_param = "%$search%";
        $params[] = $search_param;
        $params[] = $search_param;
        $params[] = $search_param;
    }
    
    if (!empty($estado)) {
        $where_conditions[] = "c.estado = ?";
        $params[] = $estado;
    }
    
    if (!empty($marca)) {
        $where_conditions[] = "c.marca LIKE ?";
        $params[] = "%$marca%";
    }
    
    $where_clause = implode(' AND ', $where_conditions);
    
    // Contar total de registros
    $count_sql = "
        SELECT COUNT(*) as total
        FROM camiones c
        WHERE $where_clause
    ";
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($params);
    $total_records = $count_stmt->fetchColumn();
    
    // Obtener camiones con paginación
    $sql = "
        SELECT c.id, c.placa, c.marca, c.modelo, c.anio, 
               c.capacidad_carga, c.tipo_combustible, c.estado, 
               c.descripcion, c.created_at, c.updated_at,
               u.nombre_completo as created_by_name,
               COUNT(DISTINCT r.id) as rutas_asignadas,
               COUNT(DISTINCT d.id) as total_despachos,
               MAX(d.fecha_salida) as ultima_actividad
        FROM camiones c
        LEFT JOIN usuarios u ON c.created_by = u.id
        LEFT JOIN rutas r ON c.id = r.camion_id AND r.deleted_at IS NULL
        LEFT JOIN despachos d ON r.id = d.ruta_id AND d.deleted_at IS NULL
        WHERE $where_clause
        GROUP BY c.id
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $camiones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear datos de camiones
    foreach ($camiones as &$camion) {
        $camion['id'] = intval($camion['id']);
        $camion['anio'] = intval($camion['anio']);
        $camion['capacidad_carga'] = floatval($camion['capacidad_carga']);
        $camion['rutas_asignadas'] = intval($camion['rutas_asignadas']);
        $camion['total_despachos'] = intval($camion['total_despachos']);
        
        // Formatear fechas
        if ($camion['created_at']) {
            $camion['created_at'] = date('Y-m-d H:i:s', strtotime($camion['created_at']));
        }
        if ($camion['updated_at']) {
            $camion['updated_at'] = date('Y-m-d H:i:s', strtotime($camion['updated_at']));
        }
        if ($camion['ultima_actividad']) {
            $camion['ultima_actividad'] = date('Y-m-d H:i:s', strtotime($camion['ultima_actividad']));
        }
    }
    
    // Obtener estadísticas generales
    $stats = [
        'total' => 0,
        'activos' => 0,
        'inactivos' => 0,
        'en_reparacion' => 0
    ];
    
    if (empty($search) && empty($estado) && empty($marca)) {
        $stats_stmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN estado = 'en_reparacion' THEN 1 ELSE 0 END) as en_reparacion,
                SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as inactivos,
                SUM(capacidad_carga) as capacidad_total,
                COUNT(DISTINCT marca) as marcas_diferentes
            FROM camiones 
            WHERE deleted_at IS NULL
        ");
        $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Obtener marcas disponibles para filtros
    $marcas_stmt = $pdo->query("
        SELECT DISTINCT marca
        FROM camiones 
        WHERE deleted_at IS NULL
        ORDER BY marca ASC
    ");
    $marcas_disponibles = $marcas_stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Calcular información de paginación
    $total_pages = ceil($total_records / $limit);
    $pagination = [
        'total_records' => intval($total_records),
        'total_pages' => intval($total_pages),
        'current_page' => intval($page),
        'per_page' => intval($limit),
        'has_previous' => $page > 1,
        'has_next' => $page < $total_pages
    ];
    
    // Cerrar conexión
    $database->closeConnection();
    
    echo json_encode([
        'success' => true,
        'data' => $camiones,
        'pagination' => $pagination,
        'stats' => [
            'total' => intval($stats['total'] ?? 0),
            'activos' => intval($stats['activos'] ?? 0),
            'en_reparacion' => intval($stats['en_reparacion'] ?? 0),
            'inactivos' => intval($stats['inactivos'] ?? 0),
            'capacidad_total' => floatval($stats['capacidad_total'] ?? 0),
            'marcas_diferentes' => intval($stats['marcas_diferentes'] ?? 0)
        ],
        'filters' => [
            'marcas' => $marcas_disponibles,
            'estados_disponibles' => [
                ['value' => 'activo', 'label' => 'Activo'],
                ['value' => 'en_reparacion', 'label' => 'En Reparación'], 
                ['value' => 'inactivo', 'label' => 'Inactivo']
            ]
        ]
    ]);

} catch (Exception $e) {
    // Cerrar conexión en caso de error
    if (isset($database)) {
        $database->closeConnection();
    }
    
    error_log("Error listando camiones: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor: ' . $e->getMessage()
    ]);
}
?>