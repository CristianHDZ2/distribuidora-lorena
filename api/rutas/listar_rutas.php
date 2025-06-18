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
    $grupo_productos = $_GET['grupo_productos'] ?? 'todos'; // todos, Big Cola, Otros Productos
    $estado = $_GET['estado'] ?? 'todos'; // todos, activas, inactivas
    $pagina = max(1, intval($_GET['pagina'] ?? 1));
    $limite = max(5, min(100, intval($_GET['limite'] ?? 10)));
    $offset = ($pagina - 1) * $limite;

    // Si se solicita una ruta específica
    if ($id) {
        $stmt = $pdo->prepare("
            SELECT r.id, r.numero_ruta, r.lugar_recorrido, r.grupo_productos, 
                   r.observaciones, r.activa,
                   DATE_FORMAT(r.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion,
                   DATE_FORMAT(r.fecha_actualizacion, '%d/%m/%Y %H:%i') as fecha_actualizacion,
                   c.numero_placa as camion_placa,
                   c.id as camion_id,
                   c.foto1 as camion_foto,
                   m.nombre_completo as motorista_nombre,
                   m.dui as motorista_dui,
                   m.tipo_licencia as motorista_tipo_licencia,
                   m.telefono as motorista_telefono,
                   m.id as motorista_id
            FROM rutas r
            INNER JOIN camiones c ON r.camion_id = c.id
            INNER JOIN motoristas m ON r.motorista_id = m.id
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        $ruta = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$ruta) {
            http_response_code(404);
            echo json_encode(['error' => 'Ruta no encontrada']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'ruta' => $ruta
        ]);
        exit;
    }

    // Construir consulta con filtros
    $whereConditions = ['1=1'];
    $params = [];

    // Filtro de búsqueda (número de ruta, lugar, camión o motorista)
    if (!empty($buscar)) {
        $whereConditions[] = '(r.numero_ruta LIKE ? OR r.lugar_recorrido LIKE ? OR c.numero_placa LIKE ? OR m.nombre_completo LIKE ?)';
        $params[] = '%' . $buscar . '%';
        $params[] = '%' . $buscar . '%';
        $params[] = '%' . $buscar . '%';
        $params[] = '%' . $buscar . '%';
    }

    // Filtro por grupo de productos
    if ($grupo_productos !== 'todos') {
        $whereConditions[] = 'r.grupo_productos = ?';
        $params[] = $grupo_productos;
    }

    // Filtro de estado
    if ($estado === 'activas') {
        $whereConditions[] = 'r.activa = 1';
    } elseif ($estado === 'inactivas') {
        $whereConditions[] = 'r.activa = 0';
    }

    $whereClause = implode(' AND ', $whereConditions);

    // Consulta principal con JOIN para obtener información completa
    $sql = "
        SELECT r.id, r.numero_ruta, r.lugar_recorrido, r.grupo_productos, 
               r.observaciones, r.activa,
               DATE_FORMAT(r.fecha_creacion, '%d/%m/%Y') as fecha_creacion,
               c.numero_placa as camion_placa,
               c.id as camion_id,
               c.foto1 as camion_foto,
               m.nombre_completo as motorista_nombre,
               m.dui as motorista_dui,
               m.tipo_licencia as motorista_tipo_licencia,
               m.id as motorista_id
        FROM rutas r
        INNER JOIN camiones c ON r.camion_id = c.id AND c.activo = 1
        INNER JOIN motoristas m ON r.motorista_id = m.id AND m.activo = 1
        WHERE {$whereClause}
        ORDER BY r.fecha_creacion DESC
        LIMIT ? OFFSET ?
    ";

    $params[] = $limite;
    $params[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rutas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar total de registros para paginación
    $sqlCount = "
        SELECT COUNT(*) as total
        FROM rutas r
        INNER JOIN camiones c ON r.camion_id = c.id AND c.activo = 1
        INNER JOIN motoristas m ON r.motorista_id = m.id AND m.activo = 1
        WHERE {$whereClause}
    ";
    
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute(array_slice($params, 0, -2)); // Excluir limit y offset
    $totalRegistros = $stmtCount->fetch()['total'];

    // Estadísticas generales
    $stmtStats = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN r.activa = 1 THEN 1 ELSE 0 END) as activas,
            SUM(CASE WHEN r.activa = 0 THEN 1 ELSE 0 END) as inactivas,
            SUM(CASE WHEN r.grupo_productos = 'Big Cola' AND r.activa = 1 THEN 1 ELSE 0 END) as big_cola,
            SUM(CASE WHEN r.grupo_productos = 'Otros Productos' AND r.activa = 1 THEN 1 ELSE 0 END) as otros_productos
        FROM rutas r
        INNER JOIN camiones c ON r.camion_id = c.id AND c.activo = 1
        INNER JOIN motoristas m ON r.motorista_id = m.id AND m.activo = 1
    ");
    $stmtStats->execute();
    $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

    // Obtener listas para formularios
    $camionesDisponibles = [];
    $motoristasDisponibles = [];

    // Solo si es administrador, obtener recursos disponibles
    if ($usuario['tipo_usuario'] === 'administrador') {
        // Camiones disponibles (activos y no asignados a rutas activas)
        $stmtCamiones = $pdo->prepare("
            SELECT c.id, c.numero_placa
            FROM camiones c
            LEFT JOIN rutas r ON r.camion_id = c.id AND r.activa = 1
            WHERE c.activo = 1 AND r.id IS NULL
            ORDER BY c.numero_placa
        ");
        $stmtCamiones->execute();
        $camionesDisponibles = $stmtCamiones->fetchAll(PDO::FETCH_ASSOC);

        // Motoristas disponibles (activos y no asignados a rutas activas)
        $stmtMotoristas = $pdo->prepare("
            SELECT m.id, m.nombre_completo, m.dui, m.tipo_licencia
            FROM motoristas m
            LEFT JOIN rutas r ON r.motorista_id = m.id AND r.activa = 1
            WHERE m.activo = 1 AND r.id IS NULL
            ORDER BY m.nombre_completo
        ");
        $stmtMotoristas->execute();
        $motoristasDisponibles = $stmtMotoristas->fetchAll(PDO::FETCH_ASSOC);
    }

    // Información de paginación
    $totalPaginas = ceil($totalRegistros / $limite);

    echo json_encode([
        'success' => true,
        'rutas' => $rutas,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $totalPaginas,
            'total_registros' => $totalRegistros,
            'registros_por_pagina' => $limite,
            'hay_siguiente' => $pagina < $totalPaginas,
            'hay_anterior' => $pagina > 1
        ],
        'estadisticas' => $stats,
        'recursos_disponibles' => [
            'camiones' => $camionesDisponibles,
            'motoristas' => $motoristasDisponibles
        ],
        'filtros_aplicados' => [
            'buscar' => $buscar,
            'grupo_productos' => $grupo_productos,
            'estado' => $estado
        ]
    ]);

} catch (Exception $e) {
    error_log("Error al listar rutas: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>