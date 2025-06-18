<?php
// api/inventario/entrada_factura.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos requeridos
    if (empty($input['numero_factura']) || empty($input['proveedor_id']) || 
        empty($input['fecha_factura']) || empty($input['productos'])) {
        throw new Exception('Datos requeridos faltantes');
    }

    $database = new Database();
    $pdo = $database->getConnection();
    
    // Verificar que el número de factura no exista
    $stmt = $pdo->prepare("SELECT id FROM facturas WHERE numero_factura = ?");
    $stmt->execute([$input['numero_factura']]);
    if ($stmt->fetch()) {
        throw new Exception('El número de factura ya existe');
    }

    // Iniciar transacción
    $pdo->beginTransaction();

    try {
        // Insertar factura
        $stmt = $pdo->prepare("
            INSERT INTO facturas (numero_factura, proveedor_id, fecha_factura, usuario_id) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['numero_factura'],
            $input['proveedor_id'],
            $input['fecha_factura'],
            $_SESSION['usuario_id'] ?? 1
        ]);
        
        $factura_id = $pdo->lastInsertId();
        $total_factura = 0;

        // Procesar cada producto
        foreach ($input['productos'] as $producto) {
            if (empty($producto['producto_id']) || empty($producto['cantidad']) || 
                empty($producto['precio_compra'])) {
                throw new Exception('Datos de producto incompletos');
            }

            $cantidad = floatval($producto['cantidad']);
            $precio_compra = floatval($producto['precio_compra']);
            $precio_venta = $precio_compra * 1.10; // 10% de ganancia por defecto
            $devolucion = floatval($producto['devolucion'] ?? 0);
            
            // Si se proporciona precio de venta personalizado
            if (!empty($producto['precio_venta_custom'])) {
                $precio_venta = floatval($producto['precio_venta_custom']);
            }

            $subtotal = $cantidad * $precio_compra;
            $total_factura += $subtotal;

            // Insertar detalle de factura
            $stmt = $pdo->prepare("
                INSERT INTO detalle_factura 
                (factura_id, producto_id, cantidad, precio_compra_unitario, 
                 precio_venta_unitario, subtotal, devolucion_cantidad) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $factura_id,
                $producto['producto_id'],
                $cantidad,
                $precio_compra,
                $precio_venta,
                $subtotal,
                $devolucion
            ]);

            // Registrar movimiento de entrada
            $cantidad_entrada = $cantidad - $devolucion;
            if ($cantidad_entrada > 0) {
                $stmt = $pdo->prepare("
                    INSERT INTO movimientos_inventario 
                    (tipo_movimiento, producto_id, cantidad, precio_unitario, 
                     factura_id, usuario_id, observaciones) 
                    VALUES ('entrada', ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $producto['producto_id'],
                    $cantidad_entrada,
                    $precio_compra,
                    $factura_id,
                    $_SESSION['usuario_id'] ?? 1,
                    'Entrada por factura #' . $input['numero_factura']
                ]);
            }

            // Si hay devoluciones, registrar movimiento de salida
            if ($devolucion > 0) {
                $stmt = $pdo->prepare("
                    INSERT INTO movimientos_inventario 
                    (tipo_movimiento, producto_id, cantidad, precio_unitario, 
                     factura_id, usuario_id, observaciones) 
                    VALUES ('salida', ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $producto['producto_id'],
                    $devolucion,
                    $precio_compra,
                    $factura_id,
                    $_SESSION['usuario_id'] ?? 1,
                    'Devolución factura #' . $input['numero_factura']
                ]);
            }
        }

        // Actualizar total de factura
        $stmt = $pdo->prepare("UPDATE facturas SET total_factura = ? WHERE id = ?");
        $stmt->execute([$total_factura, $factura_id]);

        // Crear notificación para administradores
        $stmt = $pdo->prepare("
            INSERT INTO notificaciones (tipo, titulo, mensaje, usuario_id) 
            VALUES ('general', 'Nueva Factura Registrada', ?, NULL)
        ");
        $stmt->execute([
            'Se registró la factura #' . $input['numero_factura'] . ' por $' . number_format($total_factura, 2)
        ]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Factura registrada exitosamente',
            'factura_id' => $factura_id,
            'total' => $total_factura
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage(),
        'details' => 'Error al registrar la factura'
    ]);
}
?>