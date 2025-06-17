<?php
// api/camiones/listar_camiones.php
require_once '../config/database.php';

// Verificar autenticación - CORREGIDO
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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
            SELECT c.id, c.placa, c.marca, c.modelo, c.anio, 
                   c.capacidad_carga, c.tipo_combustible, c.estado, 
                   c.descripcion,
                   CASE 
                       WHEN c.created_at IS NULL OR c.created_at = '' OR c.created_at = '0000-00-00 00:00:00' 
                       THEN NULL 
                       ELSE c.created_at 
                   END as created_at,
                   CASE 
                       WHEN c.updated_at IS NULL OR c.updated_at = '' OR c.updated_at = '0000-00-00 00:00:00' 
                       THEN NULL 
                       ELSE c.updated_at 
                   END as updated_at,
                   u.nombre_completo as created_by_name
            FROM camiones c
            LEFT JOIN usuarios u ON c.created_by = u.id
            WHERE c.id = ? AND (c.deleted_at IS NULL OR c.deleted_at = '' OR c.deleted_at = '0000-00-00 00:00:00')
        ");
        $stmt->execute([$id]);
        $camion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$camion) {
            $database->closeConnection();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Camión no encontrado']);
            exit;
        }
        
        // Datos adicionales simulados
        $camion['fotos'] = [];
        $camion['rutas_asignadas'] = [];
        $camion['total_despachos'] = 0;
        $camion['ultima_actividad'] = null;
        
        $database->closeConnection();
        
        echo json_encode([
            'success' => true,
            'data' => $camion
        ]);
        exit;
    }
    
    // Construir WHERE clause para listado
    $where_conditions = ["(c.deleted_at IS NULL OR c.deleted_at = '' OR c.deleted_at = '0000-00-00 00:00:00')"];
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
    
    // Obtener camiones con paginación - SQL CORREGIDO PARA TIMESTAMPS
    $sql = "
        SELECT c.id, c.placa, c.marca, c.modelo, c.anio, 
               c.capacidad_carga, c.tipo_combustible, c.estado, 
               c.descripcion,
               CASE 
                   WHEN c.created_at IS NULL OR c.created_at = '' OR c.created_at = '0000-00-00 00:00:00' 
                   THEN NULL 
                   ELSE c.created_at 
               END as created_at,
               CASE 
                   WHEN c.updated_at IS NULL OR c.updated_at = '' OR c.updated_at = '0000-00-00 00:00:00' 
                   THEN NULL 
                   ELSE c.updated_at 
               END as updated_at,
               u.nombre_completo as created_by_name
        FROM camiones c
        LEFT JOIN usuarios u ON c.created_by = u.id
        WHERE $where_clause
        ORDER BY c.id DESC
        LIMIT ? OFFSET ?
    ";
    
    // Agregar parámetros de límite y offset
    $final_params = array_merge($params, [$limit, $offset]);
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($final_params);
    $camiones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear datos de camiones
    foreach ($camiones as &$camion) {
        $camion['id'] = intval($camion['id']);
        $camion['anio'] = intval($camion['anio']);
        $camion['capacidad_carga'] = floatval($camion['capacidad_carga']);
        $camion['rutas_asignadas'] = 0;
        $camion['total_despachos'] = 0;
        $camion['ultima_actividad'] = null;
        
        // Formatear fechas solo si son válidas
        if ($camion['created_at'] && $camion['created_at'] !== '0000-00-00 00:00:00') {
            $camion['created_at'] = date('Y-m-d H:i:s', strtotime($camion['created_at']));
        } else {
            $camion['created_at'] = null;
        }
        
        if ($camion['updated_at'] && $camion['updated_at'] !== '0000-00-00 00:00:00') {
            $camion['updated_at'] = date('Y-m-d H:i:s', strtotime($camion['updated_at']));
        } else {
            $camion['updated_at'] = null;
        }
    }
    
    // Obtener estadísticas generales
    $stats_stmt = $pdo->query("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN estado = 'en_reparacion' THEN 1 ELSE 0 END) as en_reparacion,
            SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as inactivos
        FROM camiones 
        WHERE deleted_at IS NULL OR deleted_at = '' OR deleted_at = '0000-00-00 00:00:00'
    ");
    $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Obtener marcas disponibles para filtros
    $marcas_stmt = $pdo->query("
        SELECT DISTINCT marca
        FROM camiones 
        WHERE (deleted_at IS NULL OR deleted_at = '' OR deleted_at = '0000-00-00 00:00:00') 
        AND marca IS NOT NULL AND marca != ''
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
            'capacidad_total' => 0,
            'marcas_diferentes' => count($marcas_disponibles)
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