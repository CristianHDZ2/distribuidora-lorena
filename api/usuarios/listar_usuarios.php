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
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] !== 'administrador') {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Solo administradores pueden listar usuarios']);
    exit;
}

try {
    $conexion = obtenerConexion();
    
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
        $whereConditions[] = "(nombre LIKE ? OR apellido LIKE ? OR dui LIKE ? OR email LIKE ?)";
        $busquedaParam = "%$busqueda%";
        $params = array_merge($params, [$busquedaParam, $busquedaParam, $busquedaParam, $busquedaParam]);
    }
    
    if (!empty($tipo) && in_array($tipo, ['administrador', 'despachador'])) {
        $whereConditions[] = "tipo_usuario = ?";
        $params[] = $tipo;
    }
    
    if (!empty($estado) && in_array($estado, ['activo', 'inactivo'])) {
        $whereConditions[] = "estado = ?";
        $params[] = $estado;
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
            u.nombre,
            u.apellido,
            CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
            u.telefono,
            u.email,
            u.tipo_usuario,
            u.estado,
            u.foto_perfil,
            DATE_FORMAT(u.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion_formato,
            DATE_FORMAT(u.ultimo_acceso, '%d/%m/%Y %H:%i') as ultimo_acceso_formato,
            CASE 
                WHEN u.ultimo_acceso IS NULL THEN 'Nunca'
                WHEN u.ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 'En línea'
                WHEN u.ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Hoy'
                WHEN u.ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Esta semana'
                ELSE 'Hace tiempo'
            END as estado_conexion,
            creador.nombre as creado_por_nombre
        FROM usuarios u
        LEFT JOIN usuarios creador ON u.creado_por = creador.id
        $whereClause
        ORDER BY u.fecha_creacion DESC
        LIMIT ? OFFSET ?
    ");
    
    $params[] = $porPagina;
    $params[] = $offset;
    $stmt->execute($params);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Estadísticas adicionales
    $stmtStats = $conexion->prepare("
        SELECT 
            COUNT(*) as total_usuarios,
            SUM(CASE WHEN tipo_usuario = 'administrador' THEN 1 ELSE 0 END) as administradores,
            SUM(CASE WHEN tipo_usuario = 'despachador' THEN 1 ELSE 0 END) as despachadores,
            SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as inactivos,
            SUM(CASE WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 1 ELSE 0 END) as en_linea,
            SUM(CASE WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as activos_hoy
        FROM usuarios
    ");
    $stmtStats->execute();
    $estadisticas = $stmtStats->fetch(PDO::FETCH_ASSOC);
    
    // Calcular paginación
    $totalPaginas = ceil($totalRegistros / $porPagina);
    
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
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>