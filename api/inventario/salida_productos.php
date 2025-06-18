<?php
// api/inventario/salida_productos.php
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
    if (empty($input['productos']) || !is_array($input['productos'])) {
        throw new Exception('Lista de productos requerida');
    }

    $database = new Database();
    $pdo = $database->getConnection();
    
    // Iniciar transacción
    $pdo->beginTransaction();

    try {
        $productos_procesados = [];
        $total_valor_salida = 0;

        // Procesar cada producto
        foreach ($input['productos'] as $producto) {
            if (empty($producto['producto_id']) || empty($producto['cantidad'])) {
                throw new Exception('Datos de producto incompletos');
            }

            $producto_id = intval($producto['producto_id']);
            $cantidad = floatval($producto['cantidad']);
            $motivo = $producto['motivo'] ?? 'Salida manual';
            $observaciones = $producto['observaciones'] ?? '';

            // Verificar que la cantidad sea válida
            if ($cantidad <= 0) {
                throw new Exception('La cantidad debe ser mayor a 0');
            }

            // Obtener información del producto y verificar stock
            $stmt = $pdo->prepare("
                SELECT 
                    nombre, 
                    stock_actual, 
                    precio_compra,
                    precio_venta,
                    unidades_por_paquete
                FROM productos 
                WHERE id = ? AND activo = 1
            ");
            $stmt->execute([$producto_id]);
            $info_producto = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$info_producto) {
                throw new Exception('Producto no encontrado o inactivo');
            }

            // Verificar stock disponible
            if ($cantidad > $info_producto['stock_actual']) {
                throw new Exception(
                    "Stock insuficiente para {$info_producto['nombre']}. " .
                    "Stock actual: {$info_producto['stock_actual']}, Solicitado: {$cantidad}"
                );
            }

            // Usar precio de compra para el cálculo del valor
            $precio_unitario = $info_producto['precio_compra'];
            $valor_salida = $cantidad * $precio_unitario;
            $total_valor_salida += $valor_salida;

            // Registrar movimiento de salida
            $observaciones_completas = "Salida manual - {$motivo}";
            if (!empty($observaciones)) {
                $observaciones_completas .= " | {$observaciones}";
            }

            $stmt = $pdo->prepare("
                INSERT INTO movimientos_inventario 
                (tipo_movimiento, producto_id, cantidad, precio_unitario, 
                 usuario_id, observaciones) 
                VALUES ('salida', ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $producto_id,
                $cantidad,
                $precio_unitario,
                $_SESSION['usuario_id'] ?? 1,
                $observaciones_completas
            ]);

            $productos_procesados[] = [
                'producto_id' => $producto_id,
                'nombre' => $info_producto['nombre'],
                'cantidad' => $cantidad,
                'precio_unitario' => $precio_unitario,
                'valor_salida' => $valor_salida,
                'stock_anterior' => $info_producto['stock_actual'],
                'stock_nuevo' => $info_producto['stock_actual'] - $cantidad,
                'motivo' => $motivo,
                'observaciones' => $observaciones
            ];
        }

        // Crear notificación para administradores
        $mensaje = "Se registró salida manual de " . count($productos_procesados) . 
                   " producto(s) por valor de $" . number_format($total_valor_salida, 2);
        
        $stmt = $pdo->prepare("
            INSERT INTO notificaciones (tipo, titulo, mensaje, usuario_id) 
            VALUES ('general', 'Salida Manual Registrada', ?, NULL)
        ");
        $stmt->execute([$mensaje]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Salida de productos registrada exitosamente',
            'productos_procesados' => $productos_procesados,
            'total_productos' => count($productos_procesados),
            'total_valor' => $total_valor_salida
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage(),
        'details' => 'Error al registrar la salida de productos'
    ]);
}
?>