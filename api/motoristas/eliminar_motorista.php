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

// Obtener ID del motorista de la URL
$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID del motorista es requerido']);
    exit;
}

try {
    // Verificar que el motorista existe
    $stmt = $pdo->prepare("SELECT nombre_completo FROM motoristas WHERE id = ?");
    $stmt->execute([$id]);
    $motorista = $stmt->fetch();
    
    if (!$motorista) {
        http_response_code(404);
        echo json_encode(['error' => 'Motorista no encontrado']);
        exit;
    }

    // Verificar si el motorista está asignado a alguna ruta activa
    $stmt = $pdo->prepare("
        SELECT r.numero_ruta 
        FROM rutas r 
        WHERE r.motorista_id = ? AND r.activa = 1
    ");
    $stmt->execute([$id]);
    $rutaAsignada = $stmt->fetch();
    
    if ($rutaAsignada) {
        http_response_code(400);
        echo json_encode([
            'error' => 'No se puede eliminar el motorista porque está asignado a la ruta: ' . $rutaAsignada['numero_ruta'] . '. Primero desactívelo de la ruta.'
        ]);
        exit;
    }

    // Verificar si el motorista tiene historial de rutas (para decidir si eliminar o desactivar)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total_rutas
        FROM rutas r 
        WHERE r.motorista_id = ?
    ");
    $stmt->execute([$id]);
    $historial = $stmt->fetch();
    
    if ($historial['total_rutas'] > 0) {
        // Si tiene historial, solo desactivar
        $stmt = $pdo->prepare("
            UPDATE motoristas 
            SET activo = 0, fecha_actualizacion = NOW() 
            WHERE id = ?
        ");
        $resultado = $stmt->execute([$id]);
        
        if ($resultado) {
            echo json_encode([
                'success' => true,
                'message' => 'Motorista desactivado exitosamente (tiene historial de rutas)',
                'action' => 'deactivated'
            ]);
        } else {
            throw new Exception('Error al desactivar el motorista');
        }
    } else {
        // Si no tiene historial, eliminar completamente
        $stmt = $pdo->prepare("DELETE FROM motoristas WHERE id = ?");
        $resultado = $stmt->execute([$id]);
        
        if ($resultado) {
            echo json_encode([
                'success' => true,
                'message' => 'Motorista eliminado exitosamente',
                'action' => 'deleted'
            ]);
        } else {
            throw new Exception('Error al eliminar el motorista');
        }
    }

} catch (Exception $e) {
    error_log("Error al eliminar motorista: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>