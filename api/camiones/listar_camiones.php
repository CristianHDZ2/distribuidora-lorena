<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

// Verificar que sea GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar autenticación
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Token de autenticación requerido']);
    exit;
}

// Verificar sesión del usuario
$stmt = $pdo->prepare("SELECT id, tipo_usuario FROM usuarios WHERE id = ? AND activo = 1");
$stmt->execute([$token]);
$usuario = $stmt->fetch();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión inválida']);
    exit;
}

try {
    // Parámetros de consulta
    $id = $_GET['id'] ?? null;
    $buscar = $_GET['buscar'] ?? '';
    $estado = $_GET['estado'] ?? 'todos'; // todos, activos, inactivos
    $pagina = max(1, intval($_GET['pagina'] ?? 1));
    $limite = max(5, min(100, intval($_GET['limite'] ?? 10)));
    $offset = ($pagina - 1) * $limite;

    // Si se solicita un camión específico
    if ($id) {
        $stmt = $pdo->prepare("
            SELECT c.id, c.numero_placa, c.foto1, c.foto2, c.foto3, c.activo,
                   DATE_FORMAT(c.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion,
                   DATE_FORMAT(c.fecha_actualizacion, '%d/%m/%Y %H:%i') as fecha_actualizacion,
                   r.numero_ruta, r.lugar_recorrido, r.grupo_productos,
                   CONCAT(m.nombre_completo, ' (', m.dui, ')') as motorista_asignado
            FROM camiones c
            LEFT JOIN rutas r ON r.camion_id = c.id AND r.activa = 1
            LEFT JOIN motoristas m ON r.motorista_id = m.id AND m.activo = 1
            WHERE c.id = ?
        ");
        $stmt->execute([$id]);
        $camion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$camion) {
            http_response_code(404);
            echo json_encode(['error' => 'Camión no encontrado']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'camion' => $camion
        ]);
        exit;
    }

    // Construir consulta con filtros
    $whereConditions = ['1=1'];
    $params = [];

    // Filtro de búsqueda
    if (!empty($buscar)) {
        $whereConditions[] = 'c.numero_placa LIKE ?';
        $params[] = '%' . $buscar . '%';
    }

    // Filtro de estado
    if ($estado === 'activos') {
        $whereConditions[] = 'c.activo = 1';
    } elseif ($estado === 'inactivos') {
        $whereConditions[] = 'c.activo = 0';
    }

    $whereClause = implode(' AND ', $whereConditions);

    // Consulta principal con JOIN para obtener información de rutas
    $sql = "
        SELECT c.id, c.numero_placa, c.foto1, c.foto2, c.foto3, c.activo,
               DATE_FORMAT(c.fecha_creacion, '%d/%m/%Y') as fecha_creacion,
               r.numero_ruta, r.lugar_recorrido, r.grupo_productos,
               CASE 
                   WHEN r.id IS NOT NULL THEN 'Asignado'
                   ELSE 'Disponible'
               END as estado_asignacion
        FROM camiones c
        LEFT JOIN rutas r ON r.camion_id = c.id AND r.activa = 1
        WHERE {$whereClause}
        ORDER BY c.fecha_creacion DESC
        LIMIT ? OFFSET ?
    ";

    $params[] = $limite;
    $params[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $camiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar total de registros para paginación
    $sqlCount = "
        SELECT COUNT(*) as total
        FROM camiones c
        WHERE {$whereClause}
    ";
    
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute(array_slice($params, 0, -2)); // Excluir limit y offset
    $totalRegistros = $stmtCount->fetch()['total'];

    // Estadísticas generales
    $stats = [
        'total' => 0,
        'activos' => 0,
        'inactivos' => 0,
        'asignados' => 0,
        'disponibles' => 0
    ];

    $stmtStats = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN c.activo = 1 THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN c.activo = 0 THEN 1 ELSE 0 END) as inactivos,
            SUM(CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END) as asignados,
            SUM(CASE WHEN r.id IS NULL AND c.activo = 1 THEN 1 ELSE 0 END) as disponibles
        FROM camiones c
        LEFT JOIN rutas r ON r.camion_id = c.id AND r.activa = 1
    ");
    $stmtStats->execute();
    $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

    // Información de paginación
    $totalPaginas = ceil($totalRegistros / $limite);

    echo json_encode([
        'success' => true,
        'camiones' => $camiones,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $totalPaginas,
            'total_registros' => $totalRegistros,
            'registros_por_pagina' => $limite,
            'hay_siguiente' => $pagina < $totalPaginas,
            'hay_anterior' => $pagina > 1
        ],
        'estadisticas' => $stats,
        'filtros_aplicados' => [
            'buscar' => $buscar,
            'estado' => $estado
        ]
    ]);

} catch (Exception $e) {
    error_log("Error al listar camiones: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor']);
}
?>