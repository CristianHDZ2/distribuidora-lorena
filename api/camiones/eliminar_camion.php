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

// Verificar sesión del usuario
$stmt = $pdo->prepare("SELECT id, tipo_usuario FROM usuarios WHERE id = ? AND activo = 1");
$stmt->execute([$token]);
$usuario = $stmt->fetch();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión inválida']);
    exit;
}

// Solo administradores pueden eliminar camiones
if ($usuario['tipo_usuario'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado. Solo administradores pueden eliminar camiones']);
    exit;
}

try {
    // Obtener ID del camión
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID del camión requerido']);
        exit;
    }

    // Verificar que el camión existe
    $stmt = $pdo->prepare("SELECT id, numero_placa FROM camiones WHERE id = ?");
    $stmt->execute([$id]);
    $camion = $stmt->fetch();

    if (!$camion) {
        http_response_code(404);
        echo json_encode(['error' => 'Camión no encontrado']);
        exit;
    }

    // Verificar si el camión tiene registros relacionados
    $tieneRegistros = false;
    $mensajeError = '';

    // Verificar rutas asignadas
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM rutas WHERE camion_id = ?");
    $stmt->execute([$id]);
    $rutasCount = $stmt->fetch()['total'];

    if ($rutasCount > 0) {
        $tieneRegistros = true;
        $mensajeError = "No se puede eliminar el camión porque tiene {$rutasCount} ruta(s) asignada(s). ";
    }

    // Si tiene registros, solo desactivar
    if ($tieneRegistros) {
        $stmt = $pdo->prepare("UPDATE camiones SET activo = 0, fecha_actualizacion = NOW() WHERE id = ?");
        $resultado = $stmt->execute([$id]);
        
        if ($resultado) {
            echo json_encode([
                'success' => true,
                'message' => $mensajeError . 'El camión ha sido desactivado en su lugar.',
                'accion' => 'desactivado'
            ]);
        } else {
            throw new Exception('Error al desactivar el camión');
        }
    } else {
        // Si no tiene registros, eliminar físicamente
        
        // Eliminar fotos si existen
        $stmt = $pdo->prepare("SELECT foto1, foto2, foto3 FROM camiones WHERE id = ?");
        $stmt->execute([$id]);
        $fotos = $stmt->fetch();
        
        if ($fotos) {
            $directorioFotos = '../uploads/camiones/';
            foreach (['foto1', 'foto2', 'foto3'] as $foto) {
                if (!empty($fotos[$foto]) && file_exists($directorioFotos . $fotos[$foto])) {
                    unlink($directorioFotos . $fotos[$foto]);
                }
            }
        }
        
        // Eliminar camión
        $stmt = $pdo->prepare("DELETE FROM camiones WHERE id = ?");
        $resultado = $stmt->execute([$id]);
        
        if ($resultado) {
            echo json_encode([
                'success' => true,
                'message' => 'Camión eliminado exitosamente',
                'accion' => 'eliminado'
            ]);
        } else {
            throw new Exception('Error al eliminar el camión');
        }
    }

} catch (Exception $e) {
    error_log("Error al eliminar camión: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>