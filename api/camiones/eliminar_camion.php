<?php
require_once '../config/database.php';

// Verificar autenticación
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Solo administradores pueden eliminar camiones
if ($_SESSION['user_type'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Sin permisos para esta acción']);
    exit;
}

// Verificar método DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    // Obtener ID del camión
    $camion_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($camion_id <= 0) {
        throw new Exception('ID de camión inválido');
    }
    
    $database = new Database();
    $conexion = $database->getConnection();
    
    // Verificar que el camión existe
    $stmt = $pdo->prepare("
        SELECT c.placa, c.marca, c.modelo, c.estado,
               COUNT(r.id) as rutas_asignadas
        FROM camiones c
        LEFT JOIN rutas r ON c.id = r.camion_id AND r.deleted_at IS NULL
        WHERE c.id = ? AND c.deleted_at IS NULL
        GROUP BY c.id
    ");
    $stmt->execute([$camion_id]);
    $camion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$camion) {
        throw new Exception('Camión no encontrado');
    }
    
    // Verificar si el camión tiene rutas asignadas activas
    if ($camion['rutas_asignadas'] > 0) {
        throw new Exception('No se puede eliminar el camión porque tiene rutas asignadas. Primero desasigne las rutas.');
    }
    
    // Verificar si hay despachos pendientes o en curso con este camión
    $despachos_stmt = $pdo->prepare("
        SELECT COUNT(*) as despachos_activos
        FROM despachos d
        INNER JOIN rutas r ON d.ruta_id = r.id
        WHERE r.camion_id = ? 
        AND d.estado IN ('en_proceso', 'salida', 'recarga')
        AND d.deleted_at IS NULL
    ");
    $despachos_stmt->execute([$camion_id]);
    $despachos_activos = $despachos_stmt->fetchColumn();
    
    if ($despachos_activos > 0) {
        throw new Exception('No se puede eliminar el camión porque tiene despachos activos. Complete los despachos primero.');
    }
    
    // Iniciar transacción
    $pdo->beginTransaction();
    
    try {
        // Soft delete del camión
        $stmt = $pdo->prepare("
            UPDATE camiones 
            SET deleted_at = NOW(), deleted_by = ?
            WHERE id = ?
        ");
        $stmt->execute([$_SESSION['user_id'], $camion_id]);
        
        // Log de actividad
        $log_stmt = $pdo->prepare("
            INSERT INTO logs_actividad (
                user_id, accion, modulo, descripcion, created_at
            ) VALUES (?, 'DELETE', 'CAMIONES', ?, NOW())
        ");
        $log_stmt->execute([
            $_SESSION['user_id'],
            "Camión eliminado: {$camion['placa']} - {$camion['marca']} {$camion['modelo']}"
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Camión eliminado exitosamente'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Error eliminando camión: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>