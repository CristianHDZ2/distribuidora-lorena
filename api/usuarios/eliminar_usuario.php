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
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] !== 'administrador') {
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
    
    $conexion = obtenerConexion();
    
    // Verificar que el usuario existe
    $stmt = $conexion->prepare("SELECT id, nombre, apellido, tipo_usuario FROM usuarios WHERE id = ?");
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
    $tablas = [
        'despachos' => 'usuario_id',
        'movimientos_inventario' => 'usuario_id',
        'facturas' => 'creado_por',
        'usuarios' => 'creado_por'  // Usuarios creados por este usuario
    ];
    
    foreach ($tablas as $tabla => $campo) {
        $stmt = $conexion->prepare("SELECT COUNT(*) as total FROM $tabla WHERE $campo = ?");
        $stmt->execute([$data['id']]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        if ($count > 0) {
            $tieneRegistros = true;
            break;
        }
    }
    
    if ($tieneRegistros) {
        // Si tiene registros, solo desactivar
        $stmt = $conexion->prepare("
            UPDATE usuarios 
            SET estado = 'inactivo', 
                fecha_modificacion = NOW(), 
                modificado_por = ? 
            WHERE id = ?
        ");
        $resultado = $stmt->execute([$_SESSION['user_id'], $data['id']]);
        
        if ($resultado) {
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
            $fotoPerfil = "../uploads/usuarios/" . $data['id'] . ".jpg";
            if (file_exists($fotoPerfil)) {
                unlink($fotoPerfil);
            }
            
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
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>