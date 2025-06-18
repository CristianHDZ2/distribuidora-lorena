<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

// Verificar que sea DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

// Verificar sesión del usuario y que sea administrador
$stmt = $pdo->prepare("SELECT id, tipo_usuario FROM usuarios WHERE id = ? AND activo = 1");
$stmt->execute([$token]);
$usuario = $stmt->fetch();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión inválida']);
    exit;
}

if ($usuario['tipo_usuario'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para realizar esta acción']);
    exit;
}

// Obtener ID de la ruta de la URL
$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de la ruta es requerido']);
    exit;
}

try {
    // Verificar que la ruta existe
    $stmt = $pdo->prepare("
        SELECT r.numero_ruta, r.lugar_recorrido,
               c.numero_placa as camion,
               m.nombre_completo as motorista
        FROM rutas r
        INNER JOIN camiones c ON r.camion_id = c.id
        INNER JOIN motoristas m ON r.motorista_id = m.id
        WHERE r.id = ?
    ");
    $stmt->execute([$id]);
    $ruta = $stmt->fetch();
    
    if (!$ruta) {
        http_response_code(404);
        echo json_encode(['error' => 'Ruta no encontrada']);
        exit;
    }

    // Verificar si la ruta tiene despachos asociados
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total_despachos
        FROM despachos d 
        WHERE d.ruta_id = ?
    ");
    $stmt->execute([$id]);
    $historial = $stmt->fetch();
    
    if ($historial['total_despachos'] > 0) {
        // Si tiene despachos, solo desactivar
        $stmt = $pdo->prepare("
            UPDATE rutas 
            SET activa = 0, fecha_actualizacion = NOW() 
            WHERE id = ?
        ");
        $resultado = $stmt->execute([$id]);
        
        if ($resultado) {
            echo json_encode([
                'success' => true,
                'message' => 'Ruta desactivada exitosamente (tiene historial de despachos)',
                'action' => 'deactivated'
            ]);
        } else {
            throw new Exception('Error al desactivar la ruta');
        }
    } else {
        // Si no tiene despachos, eliminar completamente
        $stmt = $pdo->prepare("DELETE FROM rutas WHERE id = ?");
        $resultado = $stmt->execute([$id]);
        
        if ($resultado) {
            echo json_encode([
                'success' => true,
                'message' => 'Ruta eliminada exitosamente',
                'action' => 'deleted'
            ]);
        } else {
            throw new Exception('Error al eliminar la ruta');
        }
    }

} catch (Exception $e) {
    error_log("Error al eliminar ruta: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>