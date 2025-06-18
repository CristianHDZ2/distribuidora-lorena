<?php
// api/inventario/movimientos.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Parámetros de paginación
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    
    // Parámetros de filtro
    $filtros = [];
    $params = [];
    
    if (!empty($_GET['producto_id'])) {
        $filtros[] = "m.producto_id = ?";
        $params[] = $_GET['producto_id'];
    }
    
    if (!empty($_GET['tipo_movimiento'])) {
        $filtros[] = "m.tipo_movimiento = ?";
        $params[] = $_GET['tipo_movimiento'];
    }
    
    if (!empty($_GET['fecha_desde'])) {
        $filtros[] = "DATE(m.fecha_movimiento) >= ?";
        $params[] = $_GET['fecha_desde'];
    }
    
    if (!empty($_GET['fecha_hasta'])) {
        $filtros[] = "DATE(m.fecha_movimiento) <= ?";
        $params[] = $_GET['fecha_hasta'];
    }
    
    if (!empty($_GET['factura_id'])) {
        $filtros[] = "m.factura_id = ?";
        $params[] = $_GET['factura_id'];
    }
    
    if (!empty($_GET['usuario_id'])) {
        $filtros[] = "m.usuario_id = ?";
        $params[] = $_GET['usuario_id'];
    }
    
    if (!empty($_GET['buscar'])) {
        $filtros[] = "(p.nombre LIKE ? OR m.observaciones LIKE ? OR f.numero_factura LIKE ?)";
        $buscar = '%' . $_GET['buscar'] . '%';
        $params[] = $buscar;
        $params[] = $buscar;
        $params[] = $buscar;
    }
    
    $where_clause = '';
    if (!empty($filtros)) {
        $where_clause = 'WHERE ' . implode(' AND ', $filtros);
    }

    // Consulta principal con paginación
    $sql = "
        SELECT 
            m.id,
            m.tipo_movimiento,
            m.cantidad,
            m.precio_unitario,
            m.observaciones,
            m.fecha_movimiento,
            p.nombre as producto_nombre,
            p.medida as producto_medida,
            p.unidades_por_paquete,
            u.nombre_completo as usuario_nombre,
            f.numero_factura,
            f.fecha_factura,
            pr.nombre as proveedor_nombre,
            (m.cantidad * m.precio_unitario) as valor_movimiento
        FROM movimientos_inventario m
        LEFT JOIN productos p ON m.producto_id = p.id
        LEFT JOIN usuarios u ON m.usuario_id = u.id
        LEFT JOIN facturas f ON m.factura_id = f.id
        LEFT JOIN proveedores pr ON f.proveedor_id = pr.id
        $where_clause
        ORDER BY m.fecha_movimiento DESC, m.id DESC
        LIMIT ? OFFSET ?
    ";

    $params_paginados = array_merge($params, [$limit, $offset]);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params_paginados);
    $movimientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar total de registros para paginación
    $sql_count = "
        SELECT COUNT(*) as total
        FROM movimientos_inventario m
        LEFT JOIN productos p ON m.producto_id = p.id
        LEFT JOIN usuarios u ON m.usuario_id = u.id
        LEFT JOIN facturas f ON m.factura_id = f.id
        LEFT JOIN proveedores pr ON f.proveedor_id = pr.id
        $where_clause
    ";

    $stmt_count = $pdo->prepare($sql_count);
    $stmt_count->execute($params);
    $total_registros = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];

    // Calcular estadísticas del período consultado
    $sql_stats = "
        SELECT 
            SUM(CASE WHEN m.tipo_movimiento = 'entrada' THEN m.cantidad ELSE 0 END) as total_entradas,
            SUM(CASE WHEN m.tipo_movimiento = 'salida' THEN m.cantidad ELSE 0 END) as total_salidas,
            SUM(CASE WHEN m.tipo_movimiento = 'entrada' THEN (m.cantidad * m.precio_unitario) ELSE 0 END) as valor_entradas,
            SUM(CASE WHEN m.tipo_movimiento = 'salida' THEN (m.cantidad * m.precio_unitario) ELSE 0 END) as valor_salidas,
            COUNT(DISTINCT m.producto_id) as productos_movidos,
            COUNT(DISTINCT m.factura_id) as facturas_procesadas
        FROM movimientos_inventario m
        LEFT JOIN productos p ON m.producto_id = p.id
        LEFT JOIN usuarios u ON m.usuario_id = u.id
        LEFT JOIN facturas f ON m.factura_id = f.id
        LEFT JOIN proveedores pr ON f.proveedor_id = pr.id
        $where_clause
    ";

    $stmt_stats = $pdo->prepare($sql_stats);
    $stmt_stats->execute($params);
    $estadisticas = $stmt_stats->fetch(PDO::FETCH_ASSOC);

    // Formatear los movimientos
    foreach ($movimientos as &$movimiento) {
        $movimiento['fecha_formateada'] = date('d/m/Y H:i', strtotime($movimiento['fecha_movimiento']));
        $movimiento['tipo_badge'] = $movimiento['tipo_movimiento'] === 'entrada' ? 'success' : 'danger';
        $movimiento['tipo_icono'] = $movimiento['tipo_movimiento'] === 'entrada' ? 'arrow-down' : 'arrow-up';
        $movimiento['cantidad_formateada'] = number_format($movimiento['cantidad'], 2);
        $movimiento['precio_formateado'] = '$' . number_format($movimiento['precio_unitario'], 2);
        $movimiento['valor_formateado'] = '$' . number_format($movimiento['valor_movimiento'], 2);
    }

    echo json_encode([
        'success' => true,
        'movimientos' => $movimientos,
        'estadisticas' => [
            'total_entradas' => floatval($estadisticas['total_entradas'] ?? 0),
            'total_salidas' => floatval($estadisticas['total_salidas'] ?? 0),
            'valor_entradas' => floatval($estadisticas['valor_entradas'] ?? 0),
            'valor_salidas' => floatval($estadisticas['valor_salidas'] ?? 0),
            'productos_movidos' => intval($estadisticas['productos_movidos'] ?? 0),
            'facturas_procesadas' => intval($estadisticas['facturas_procesadas'] ?? 0)
        ],
        'paginacion' => [
            'page' => $page,
            'limit' => $limit,
            'total_registros' => intval($total_registros),
            'total_paginas' => ceil($total_registros / $limit),
            'desde' => $offset + 1,
            'hasta' => min($offset + $limit, $total_registros)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage(),
        'details' => 'Error al obtener los movimientos de inventario'
    ]);
}
?>