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
    $tipo_licencia = $_GET['tipo_licencia'] ?? 'todos'; // todos, Liviana, Pesada, Particular
    $estado = $_GET['estado'] ?? 'todos'; // todos, activos, inactivos
    $pagina = max(1, intval($_GET['pagina'] ?? 1));
    $limite = max(5, min(100, intval($_GET['limite'] ?? 10)));
    $offset = ($pagina - 1) * $limite;

    // Si se solicita un motorista específico
    if ($id) {
        $stmt = $pdo->prepare("
            SELECT m.id, m.nombre_completo, m.dui, m.numero_licencia, m.tipo_licencia, 
                   m.telefono, m.direccion, m.activo,
                   DATE_FORMAT(m.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion,
                   DATE_FORMAT(m.fecha_actualizacion, '%d/%m/%Y %H:%i') as fecha_actualizacion,
                   CASE 
                       WHEN r.id IS NOT NULL THEN 'Asignado'
                       ELSE 'Disponible'
                   END as estado_asignacion,
                   r.numero_ruta, r.lugar_recorrido, r.grupo_productos,
                   c.numero_placa as camion_asignado
            FROM motoristas m
            LEFT JOIN rutas r ON r.motorista_id = m.id AND r.activa = 1
            LEFT JOIN camiones c ON r.camion_id = c.id AND c.activo = 1
            WHERE m.id = ?
        ");
        $stmt->execute([$id]);
        $motorista = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$motorista) {
            http_response_code(404);
            echo json_encode(['error' => 'Motorista no encontrado']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'motorista' => $motorista
        ]);
        exit;
    }

    // Construir consulta con filtros
    $whereConditions = ['1=1'];
    $params = [];

    // Filtro de búsqueda (nombre, DUI o número de licencia)
    if (!empty($buscar)) {
        $whereConditions[] = '(m.nombre_completo LIKE ? OR m.dui LIKE ? OR m.numero_licencia LIKE ?)';
        $params[] = '%' . $buscar . '%';
        $params[] = '%' . $buscar . '%';
        $params[] = '%' . $buscar . '%';
    }

    // Filtro por tipo de licencia
    if ($tipo_licencia !== 'todos') {
        $whereConditions[] = 'm.tipo_licencia = ?';
        $params[] = $tipo_licencia;
    }

    // Filtro de estado
    if ($estado === 'activos') {
        $whereConditions[] = 'm.activo = 1';
    } elseif ($estado === 'inactivos') {
        $whereConditions[] = 'm.activo = 0';
    }

    $whereClause = implode(' AND ', $whereConditions);

    // Consulta principal con JOIN para obtener información de rutas
    $sql = "
        SELECT m.id, m.nombre_completo, m.dui, m.numero_licencia, m.tipo_licencia, 
               m.telefono, m.direccion, m.activo,
               DATE_FORMAT(m.fecha_creacion, '%d/%m/%Y') as fecha_creacion,
               CASE 
                   WHEN r.id IS NOT NULL THEN 'Asignado'
                   ELSE 'Disponible'
               END as estado_asignacion,
               r.numero_ruta, r.lugar_recorrido, r.grupo_productos,
               c.numero_placa as camion_asignado
        FROM motoristas m
        LEFT JOIN rutas r ON r.motorista_id = m.id AND r.activa = 1
        LEFT JOIN camiones c ON r.camion_id = c.id AND c.activo = 1
        WHERE {$whereClause}
        ORDER BY m.fecha_creacion DESC
        LIMIT ? OFFSET ?
    ";

    $params[] = $limite;
    $params[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $motoristas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar total de registros para paginación
    $sqlCount = "
        SELECT COUNT(*) as total
        FROM motoristas m
        WHERE {$whereClause}
    ";
    
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute(array_slice($params, 0, -2)); // Excluir limit y offset
    $totalRegistros = $stmtCount->fetch()['total'];

    // Estadísticas generales
    $stmtStats = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN m.activo = 1 THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN m.activo = 0 THEN 1 ELSE 0 END) as inactivos,
            SUM(CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END) as asignados,
            SUM(CASE WHEN r.id IS NULL AND m.activo = 1 THEN 1 ELSE 0 END) as disponibles,
            SUM(CASE WHEN m.tipo_licencia = 'Liviana' AND m.activo = 1 THEN 1 ELSE 0 END) as licencia_liviana,
            SUM(CASE WHEN m.tipo_licencia = 'Pesada' AND m.activo = 1 THEN 1 ELSE 0 END) as licencia_pesada,
            SUM(CASE WHEN m.tipo_licencia = 'Particular' AND m.activo = 1 THEN 1 ELSE 0 END) as licencia_particular
        FROM motoristas m
        LEFT JOIN rutas r ON r.motorista_id = m.id AND r.activa = 1
    ");
    $stmtStats->execute();
    $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

    // Información de paginación
    $totalPaginas = ceil($totalRegistros / $limite);

    echo json_encode([
        'success' => true,
        'motoristas' => $motoristas,
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
            'tipo_licencia' => $tipo_licencia,
            'estado' => $estado
        ]
    ]);

} catch (Exception $e) {
    error_log("Error al listar motoristas: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>