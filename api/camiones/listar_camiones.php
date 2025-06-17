<?php
require_once '../config/database.php';

// Verificar autenticación
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

try {
    $database = new Database();
    $conexion = $database->getConnection();
    
    // Obtener parámetros de consulta
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 10;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $estado = isset($_GET['estado']) ? trim($_GET['estado']) : '';
    $marca = isset($_GET['marca']) ? trim($_GET['marca']) : '';
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    $offset = ($page - 1) * $limit;
    
    // Si se solicita un camión específico
    if ($id) {
        $stmt = $pdo->prepare("
            SELECT c.*, 
                   u.nombre_completo as created_by_name,
                   uu.nombre_completo as updated_by_name,
                   CASE 
                       WHEN c.estado = 'activo' THEN 'Activo'
                       WHEN c.estado = 'mantenimiento' THEN 'En Mantenimiento'
                       WHEN c.estado = 'inactivo' THEN 'Inactivo'
                       WHEN c.estado = 'reparacion' THEN 'En Reparación'
                   END as estado_texto,
                   CASE 
                       WHEN c.tipo_combustible = 'gasolina' THEN 'Gasolina'
                       WHEN c.tipo_combustible = 'diesel' THEN 'Diésel'
                       WHEN c.tipo_combustible = 'gas_natural' THEN 'Gas Natural'
                       WHEN c.tipo_combustible = 'electrico' THEN 'Eléctrico'
                       WHEN c.tipo_combustible = 'hibrido' THEN 'Híbrido'
                   END as combustible_texto
            FROM camiones c
            LEFT JOIN usuarios u ON c.created_by = u.id
            LEFT JOIN usuarios uu ON c.updated_by = uu.id
            WHERE c.id = ? AND c.deleted_at IS NULL
        ");
        $stmt->execute([$id]);
        $camion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$camion) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Camión no encontrado']);
            exit;
        }
        
        // Obtener fotos del camión
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
            SELECT r.id, r.numero_ruta, r.lugar_recorrido, r.grupo_productos, r.estado
            FROM rutas r
            WHERE r.camion_id = ? AND r.deleted_at IS NULL
        ");
        $rutas_stmt->execute([$id]);
        $camion['rutas_asignadas'] = $rutas_stmt->fetchAll(PDO::FETCH_ASSOC);
        
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
    
    $where_clause = implode(" AND ", $where_conditions);
    
    // Contar total de registros
    $count_sql = "SELECT COUNT(*) FROM camiones c WHERE $where_clause";
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($params);
    $total_records = $count_stmt->fetchColumn();
    
    // Obtener registros paginados
    $sql = "
        SELECT c.id, c.placa, c.marca, c.modelo, c.anio, c.capacidad_carga,
               c.tipo_combustible, c.estado, c.created_at,
               u.nombre_completo as created_by_name,
               CASE 
                   WHEN c.estado = 'activo' THEN 'Activo'
                   WHEN c.estado = 'mantenimiento' THEN 'En Mantenimiento'
                   WHEN c.estado = 'inactivo' THEN 'Inactivo'
                   WHEN c.estado = 'reparacion' THEN 'En Reparación'
               END as estado_texto,
               CASE 
                   WHEN c.tipo_combustible = 'gasolina' THEN 'Gasolina'
                   WHEN c.tipo_combustible = 'diesel' THEN 'Diésel'
                   WHEN c.tipo_combustible = 'gas_natural' THEN 'Gas Natural'
                   WHEN c.tipo_combustible = 'electrico' THEN 'Eléctrico'
                   WHEN c.tipo_combustible = 'hibrido' THEN 'Híbrido'
               END as combustible_texto,
               (SELECT COUNT(*) FROM rutas r WHERE r.camion_id = c.id AND r.deleted_at IS NULL) as rutas_asignadas,
               (SELECT COUNT(*) FROM camion_fotos cf WHERE cf.camion_id = c.id) as total_fotos
        FROM camiones c
        LEFT JOIN usuarios u ON c.created_by = u.id
        WHERE $where_clause
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $camiones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Obtener estadísticas para el dashboard del módulo
    $stats_sql = "
        SELECT 
            COUNT(*) as total_camiones,
            SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as camiones_activos,
            SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as en_mantenimiento,
            SUM(CASE WHEN estado = 'reparacion' THEN 1 ELSE 0 END) as en_reparacion,
            SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as inactivos,
            AVG(YEAR(NOW()) - anio) as edad_promedio,
            SUM(capacidad_carga) as capacidad_total
        FROM camiones 
        WHERE deleted_at IS NULL
    ";
    
    $stats_stmt = $pdo->query($stats_sql);
    $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Obtener marcas más comunes
    $marcas_stmt = $pdo->query("
        SELECT marca, COUNT(*) as cantidad
        FROM camiones 
        WHERE deleted_at IS NULL
        GROUP BY marca
        ORDER BY cantidad DESC
        LIMIT 5
    ");
    $marcas_populares = $marcas_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calcular información de paginación
    $pagination = paginate($total_records, $limit, $page);
    
    echo json_encode([
        'success' => true,
        'data' => $camiones,
        'pagination' => $pagination,
        'stats' => [
            'total_camiones' => intval($stats['total_camiones']),
            'camiones_activos' => intval($stats['camiones_activos']),
            'en_mantenimiento' => intval($stats['en_mantenimiento']),
            'en_reparacion' => intval($stats['en_reparacion']),
            'inactivos' => intval($stats['inactivos']),
            'edad_promedio' => round($stats['edad_promedio'], 1),
            'capacidad_total' => floatval($stats['capacidad_total']),
            'marcas_populares' => $marcas_populares
        ],
        'filters' => [
            'estados_disponibles' => [
                ['value' => 'activo', 'label' => 'Activo'],
                ['value' => 'mantenimiento', 'label' => 'En Mantenimiento'],
                ['value' => 'reparacion', 'label' => 'En Reparación'],
                ['value' => 'inactivo', 'label' => 'Inactivo']
            ],
            'combustibles_disponibles' => [
                ['value' => 'gasolina', 'label' => 'Gasolina'],
                ['value' => 'diesel', 'label' => 'Diésel'],
                ['value' => 'gas_natural', 'label' => 'Gas Natural'],
                ['value' => 'electrico', 'label' => 'Eléctrico'],
                ['value' => 'hibrido', 'label' => 'Híbrido']
            ]
        ]
    ]);

} catch (Exception $e) {
    error_log("Error listando camiones: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor'
    ]);
}
?>