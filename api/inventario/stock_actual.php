<?php
// api/inventario/stock_actual.php
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
    
    // Parámetros de filtro
    $filtros = [];
    $params = [];
    
    if (!empty($_GET['categoria_id'])) {
        $filtros[] = "p.categoria_id = ?";
        $params[] = $_GET['categoria_id'];
    }
    
    if (!empty($_GET['proveedor_id'])) {
        $filtros[] = "p.proveedor_id = ?";
        $params[] = $_GET['proveedor_id'];
    }
    
    if (!empty($_GET['grupo_id'])) {
        $filtros[] = "p.grupo_id = ?";
        $params[] = $_GET['grupo_id'];
    }
    
    if (!empty($_GET['propietario'])) {
        $filtros[] = "p.propietario = ?";
        $params[] = $_GET['propietario'];
    }
    
    if (!empty($_GET['buscar'])) {
        $filtros[] = "p.nombre LIKE ?";
        $params[] = '%' . $_GET['buscar'] . '%';
    }
    
    if (isset($_GET['solo_con_stock']) && $_GET['solo_con_stock'] === 'true') {
        $filtros[] = "p.stock_actual > 0";
    }
    
    if (isset($_GET['estado_stock'])) {
        switch ($_GET['estado_stock']) {
            case 'alto':
                $filtros[] = "p.stock_actual >= 50";
                break;
            case 'intermedio':
                $filtros[] = "p.stock_actual BETWEEN 11 AND 49";
                break;
            case 'bajo':
                $filtros[] = "p.stock_actual BETWEEN 1 AND 10";
                break;
            case 'agotado':
                $filtros[] = "p.stock_actual = 0";
                break;
        }
    }
    
    $where_clause = '';
    if (!empty($filtros)) {
        $where_clause = 'WHERE ' . implode(' AND ', $filtros);
    }

    $sql = "
        SELECT 
            p.id,
            p.nombre,
            p.medida,
            p.unidades_por_paquete,
            p.stock_actual,
            p.precio_compra,
            p.precio_venta,
            p.propietario,
            c.nombre as categoria_nombre,
            pr.nombre as proveedor_nombre,
            g.nombre as grupo_nombre,
            CASE 
                WHEN p.stock_actual = 0 THEN 'agotado'
                WHEN p.stock_actual BETWEEN 1 AND 10 THEN 'bajo'
                WHEN p.stock_actual BETWEEN 11 AND 49 THEN 'intermedio'
                WHEN p.stock_actual >= 50 THEN 'alto'
                ELSE 'desconocido'
            END as estado_stock,
            CASE 
                WHEN p.stock_actual = 0 THEN 'danger'
                WHEN p.stock_actual BETWEEN 1 AND 10 THEN 'warning'
                WHEN p.stock_actual BETWEEN 11 AND 49 THEN 'info'
                WHEN p.stock_actual >= 50 THEN 'success'
                ELSE 'secondary'
            END as color_badge,
            (p.stock_actual * p.precio_venta) as valor_inventario
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
        LEFT JOIN grupos_productos g ON p.grupo_id = g.id
        $where_clause
        AND p.activo = 1
        ORDER BY p.nombre ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calcular estadísticas
    $estadisticas = [
        'total_productos' => count($productos),
        'productos_alto_stock' => 0,
        'productos_stock_intermedio' => 0,
        'productos_stock_bajo' => 0,
        'productos_agotados' => 0,
        'valor_total_inventario' => 0
    ];

    foreach ($productos as $producto) {
        $estadisticas['valor_total_inventario'] += $producto['valor_inventario'];
        
        switch ($producto['estado_stock']) {
            case 'alto':
                $estadisticas['productos_alto_stock']++;
                break;
            case 'intermedio':
                $estadisticas['productos_stock_intermedio']++;
                break;
            case 'bajo':
                $estadisticas['productos_stock_bajo']++;
                break;
            case 'agotado':
                $estadisticas['productos_agotados']++;
                break;
        }
    }

    // Verificar productos con stock bajo para notificaciones
    if ($estadisticas['productos_stock_bajo'] > 0 || $estadisticas['productos_agotados'] > 0) {
        // Crear notificación si hay productos con stock bajo
        $mensaje = "Hay {$estadisticas['productos_stock_bajo']} producto(s) con stock bajo y {$estadisticas['productos_agotados']} agotado(s)";
        
        $stmt = $pdo->prepare("
            INSERT INTO notificaciones (tipo, titulo, mensaje, usuario_id) 
            VALUES ('stock_bajo', 'Alerta de Stock', ?, NULL)
            ON DUPLICATE KEY UPDATE mensaje = VALUES(mensaje), fecha_creacion = CURRENT_TIMESTAMP
        ");
        $stmt->execute([$mensaje]);
    }

    echo json_encode([
        'success' => true,
        'productos' => $productos,
        'estadisticas' => $estadisticas,
        'total_registros' => count($productos)
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage(),
        'details' => 'Error al obtener el stock actual'
    ]);
}
?>