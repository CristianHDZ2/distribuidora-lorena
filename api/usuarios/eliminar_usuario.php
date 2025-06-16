<?php
require_once '../config/database.php';
require_once '../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar sesión
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'administrador') {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Solo administradores pueden eliminar usuarios']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de usuario requerido']);
        exit;
    }
    
    $database = new Database();
    $conexion = $database->getConnection();
    
    // Verificar que el usuario existe
    $stmt = $conexion->prepare("SELECT id, nombre_completo, tipo_usuario FROM usuarios WHERE id = ?");
    $stmt->execute([$data['id']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }
    
    // No permitir que se elimine a sí mismo
    if ($data['id'] == $_SESSION['user_id']) {
        http_response_code(400);
        echo json_encode(['error' => 'No puedes eliminarte a ti mismo']);
        exit;
    }
    
    // Verificar si el usuario tiene registros relacionados
    $tieneRegistros = false;
    
    // Verificar en activity_logs
    if (!$tieneRegistros) {
        $stmt = $conexion->prepare("SELECT COUNT(*) as total FROM activity_logs WHERE user_id = ?");
        $stmt->execute([$data['id']]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        if ($count > 0) {
            $tieneRegistros = true;
        }
    }
    
    // Verificar otras tablas cuando existan (despachos, etc.)
    // Cuando implementes otras tablas, agrégalas aquí
    
    if ($tieneRegistros) {
        // Si tiene registros, solo desactivar
        $stmt = $conexion->prepare("
            UPDATE usuarios 
            SET activo = 0, 
                fecha_actualizacion = NOW()
            WHERE id = ?
        ");
        $resultado = $stmt->execute([$data['id']]);
        
        if ($resultado) {
            // Registrar actividad
            logActivity($_SESSION['user_id'], 'deactivate_user', "Desactivó usuario: {$usuario['nombre_completo']} (ID: {$data['id']})");
            
            $database->closeConnection();
            
            echo json_encode([
                'success' => true,
                'message' => 'Usuario desactivado exitosamente (tiene registros asociados)',
                'accion' => 'desactivado'
            ]);
        } else {
            throw new Exception('Error al desactivar el usuario');
        }
    } else {
        // Si no tiene registros, eliminar completamente
        $stmt = $conexion->prepare("DELETE FROM usuarios WHERE id = ?");
        $resultado = $stmt->execute([$data['id']]);
        
        if ($resultado) {
            // Eliminar foto de perfil si existe
            $fotoDir = ensureUploadDirectory('usuarios');
            $fotoFiles = glob($fotoDir . '/' . $data['id'] . '_*');
            foreach ($fotoFiles as $fotoFile) {
                if (file_exists($fotoFile)) {
                    unlink($fotoFile);
                }
            }
            
            // Registrar actividad
            logActivity($_SESSION['user_id'], 'delete_user', "Eliminó usuario: {$usuario['nombre_completo']} (ID: {$data['id']})");
            
            $database->closeConnection();
            
            echo json_encode([
                'success' => true,
                'message' => 'Usuario eliminado exitosamente',
                'accion' => 'eliminado'
            ]);
        } else {
            throw new Exception('Error al eliminar el usuario');
        }
    }
    
} catch (Exception $e) {
    if (isset($database)) {
        $database->closeConnection();
    }
    logError("Error deleting user: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>