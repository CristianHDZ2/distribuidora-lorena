<?php
require_once '../config/database.php';
require_once '../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar sesión
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'administrador') {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Solo administradores pueden listar usuarios']);
    exit;
}

try {
    $database = new Database();
    $conexion = $database->getConnection();
    
    // Parámetros de búsqueda y paginación
    $busqueda = $_GET['busqueda'] ?? '';
    $tipo = $_GET['tipo'] ?? '';
    $estado = $_GET['estado'] ?? '';
    $pagina = max(1, intval($_GET['pagina'] ?? 1));
    $porPagina = max(5, min(50, intval($_GET['por_pagina'] ?? 10)));
    $offset = ($pagina - 1) * $porPagina;
    
    // Construir consulta base
    $whereConditions = [];
    $params = [];
    
    if (!empty($busqueda)) {
        $whereConditions[] = "(nombre_completo LIKE ? OR dui LIKE ? OR correo_electronico LIKE ?)";
        $busquedaParam = "%$busqueda%";
        $params = array_merge($params, [$busquedaParam, $busquedaParam, $busquedaParam]);
    }
    
    if (!empty($tipo) && in_array($tipo, ['administrador', 'despachador'])) {
        $whereConditions[] = "tipo_usuario = ?";
        $params[] = $tipo;
    }
    
    if (!empty($estado)) {
        if ($estado === 'activo') {
            $whereConditions[] = "activo = 1";
        } elseif ($estado === 'inactivo') {
            $whereConditions[] = "activo = 0";
        }
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Consulta para contar total de registros
    $stmtCount = $conexion->prepare("
        SELECT COUNT(*) as total 
        FROM usuarios 
        $whereClause
    ");
    $stmtCount->execute($params);
    $totalRegistros = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Consulta principal con paginación
    $stmt = $conexion->prepare("
        SELECT 
            u.id,
            u.dui,
            u.nombre_completo,
            u.correo_electronico as email,
            u.telefono,
            u.tipo_usuario,
            CASE WHEN u.activo = 1 THEN 'activo' ELSE 'inactivo' END as estado,
            u.foto,
            DATE_FORMAT(u.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion_formato,
            DATE_FORMAT(u.fecha_actualizacion, '%d/%m/%Y %H:%i') as ultimo_acceso_formato,
            CASE 
                WHEN u.fecha_actualizacion IS NULL THEN 'Nunca'
                WHEN u.fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 'En línea'
                WHEN u.fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Hoy'
                WHEN u.fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Esta semana'
                ELSE 'Hace tiempo'
            END as estado_conexion
        FROM usuarios u
        $whereClause
        ORDER BY u.fecha_creacion DESC
        LIMIT ? OFFSET ?
    ");
    
    $params[] = $porPagina;
    $params[] = $offset;
    $stmt->execute($params);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Agregar URLs de fotos
    foreach ($usuarios as &$usuario) {
        $usuario['foto_perfil'] = $usuario['foto'];
        $usuario['nombre'] = explode(' ', $usuario['nombre_completo'])[0];
        $usuario['apellido'] = implode(' ', array_slice(explode(' ', $usuario['nombre_completo']), 1));
        unset($usuario['foto']);
    }
    
    // Estadísticas adicionales
    $stmtStats = $conexion->prepare("
        SELECT 
            COUNT(*) as total_usuarios,
            SUM(CASE WHEN tipo_usuario = 'administrador' THEN 1 ELSE 0 END) as administradores,
            SUM(CASE WHEN tipo_usuario = 'despachador' THEN 1 ELSE 0 END) as despachadores,
            SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos,
            SUM(CASE WHEN fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 1 ELSE 0 END) as en_linea,
            SUM(CASE WHEN fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as activos_hoy
        FROM usuarios
    ");
    $stmtStats->execute();
    $estadisticas = $stmtStats->fetch(PDO::FETCH_ASSOC);
    
    // Calcular paginación
    $totalPaginas = ceil($totalRegistros / $porPagina);
    
    $database->closeConnection();
    
    echo json_encode([
        'success' => true,
        'usuarios' => $usuarios,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'por_pagina' => $porPagina,
            'total_registros' => $totalRegistros,
            'total_paginas' => $totalPaginas,
            'tiene_anterior' => $pagina > 1,
            'tiene_siguiente' => $pagina < $totalPaginas
        ],
        'estadisticas' => $estadisticas,
        'filtros_aplicados' => [
            'busqueda' => $busqueda,
            'tipo' => $tipo,
            'estado' => $estado
        ]
    ]);
    
} catch (Exception $e) {
    if (isset($database)) {
        $database->closeConnection();
    }
    logError("Error listing users: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>