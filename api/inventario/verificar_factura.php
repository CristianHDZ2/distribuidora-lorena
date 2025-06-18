<?php
// api/inventario/verificar_factura.php
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
    if (empty($_GET['numero'])) {
        throw new Exception('Número de factura requerido');
    }

    $database = new Database();
    $pdo = $database->getConnection();
    
    $stmt = $pdo->prepare("
        SELECT 
            f.id,
            f.numero_factura,
            f.fecha_factura,
            p.nombre as proveedor_nombre,
            f.total_factura
        FROM facturas f
        LEFT JOIN proveedores p ON f.proveedor_id = p.id
        WHERE f.numero_factura = ?
    ");
    $stmt->execute([$_GET['numero']]);
    $factura = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($factura) {
        echo json_encode([
            'existe' => true,
            'factura' => $factura,
            'message' => 'La factura ya existe en el sistema'
        ]);
    } else {
        echo json_encode([
            'existe' => false,
            'message' => 'Número de factura disponible'
        ]);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage(),
        'details' => 'Error al verificar la factura'
    ]);
}
?>