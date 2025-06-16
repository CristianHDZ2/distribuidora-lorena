<?php
require_once '../config/database.php';
require_once '../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar sesión
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'administrador') {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Solo administradores pueden editar usuarios']);
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
    $stmt = $conexion->prepare("SELECT id, dui, correo_electronico, nombre_completo FROM usuarios WHERE id = ?");
    $stmt->execute([$data['id']]);
    $usuarioExistente = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuarioExistente) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }
    
    // Validaciones
    $errores = [];
    $camposActualizar = [];
    $parametros = [];
    
    // Validar DUI si se proporciona
    if (isset($data['dui']) && $data['dui'] !== $usuarioExistente['dui']) {
        if (empty($data['dui'])) {
            $errores[] = 'El DUI no puede estar vacío';
        } elseif (!validateDUI($data['dui'])) {
            $errores[] = 'Formato de DUI inválido';
        } else {
            // Verificar que no exista otro usuario con este DUI
            $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE dui = ? AND id != ?");
            $stmt->execute([$data['dui'], $data['id']]);
            if ($stmt->fetch()) {
                $errores[] = 'Ya existe otro usuario con este DUI';
            } else {
                $camposActualizar[] = "dui = ?";
                $parametros[] = $data['dui'];
            }
        }
    }
    
    // Validar nombre completo
    if (isset($data['nombre']) || isset($data['apellido'])) {
        $nombre = $data['nombre'] ?? explode(' ', $usuarioExistente['nombre_completo'])[0];
        $apellido = $data['apellido'] ?? implode(' ', array_slice(explode(' ', $usuarioExistente['nombre_completo']), 1));
        
        if (empty($nombre)) {
            $errores[] = 'El nombre no puede estar vacío';
        } elseif (strlen($nombre) < 2) {
            $errores[] = 'El nombre debe tener al menos 2 caracteres';
        } elseif (empty($apellido)) {
            $errores[] = 'El apellido no puede estar vacío';
        } elseif (strlen($apellido) < 2) {
            $errores[] = 'El apellido debe tener al menos 2 caracteres';
        } else {
            $nombreCompleto = $nombre . ' ' . $apellido;
            $camposActualizar[] = "nombre_completo = ?";
            $parametros[] = $nombreCompleto;
        }
    }
    
    // Validar teléfono
    if (isset($data['telefono'])) {
        if (empty($data['telefono'])) {
            $errores[] = 'El teléfono no puede estar vacío';
        } elseif (!preg_match('/^[267]\d{3}-\d{4}$/', $data['telefono'])) {
            $errores[] = 'Formato de teléfono inválido';
        } else {
            $camposActualizar[] = "telefono = ?";
            $parametros[] = $data['telefono'];
        }
    }
    
    // Validar email
    if (isset($data['email']) && $data['email'] !== $usuarioExistente['correo_electronico']) {
        if (empty($data['email'])) {
            $errores[] = 'El email no puede estar vacío';
        } elseif (!validateEmail($data['email'])) {
            $errores[] = 'Formato de email inválido';
        } else {
            // Verificar que no exista otro usuario con este email
            $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE correo_electronico = ? AND id != ?");
            $stmt->execute([$data['email'], $data['id']]);
            if ($stmt->fetch()) {
                $errores[] = 'Ya existe otro usuario con este email';
            } else {
                $camposActualizar[] = "correo_electronico = ?";
                $parametros[] = $data['email'];
            }
        }
    }
    
    // Validar tipo de usuario
    if (isset($data['tipo_usuario'])) {
        if (!in_array($data['tipo_usuario'], ['administrador', 'despachador'])) {
            $errores[] = 'Tipo de usuario inválido';
        } else {
            $camposActualizar[] = "tipo_usuario = ?";
            $parametros[] = $data['tipo_usuario'];
        }
    }
    
    // Validar estado
    if (isset($data['estado'])) {
        $activo = $data['estado'] === 'activo' ? 1 : 0;
        $camposActualizar[] = "activo = ?";
        $parametros[] = $activo;
    }
    
    // Validar nueva contraseña si se proporciona
    if (isset($data['nueva_password']) && !empty($data['nueva_password'])) {
        if (strlen($data['nueva_password']) < 6) {
            $errores[] = 'La nueva contraseña debe tener al menos 6 caracteres';
        } else {
            $camposActualizar[] = "password = ?";
            $parametros[] = hashPassword($data['nueva_password']);
        }
    }
    
    if (!empty($errores)) {
        http_response_code(400);
        echo json_encode(['error' => implode(', ', $errores)]);
        exit;
    }
    
    if (empty($camposActualizar)) {
        http_response_code(400);
        echo json_encode(['error' => 'No hay campos para actualizar']);
        exit;
    }
    
    // Agregar campos de auditoría
    $camposActualizar[] = "fecha_actualizacion = NOW()";
    $parametros[] = $data['id'];
    
    // Actualizar usuario
    $sql = "UPDATE usuarios SET " . implode(', ', $camposActualizar) . " WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $resultado = $stmt->execute($parametros);
    
    if ($resultado) {
        // Registrar actividad
        logActivity($_SESSION['user_id'], 'update_user', "Actualizó usuario ID: {$data['id']}");
        
        // Obtener los datos actualizados del usuario
        $stmt = $conexion->prepare("
            SELECT 
                id, dui, nombre_completo, correo_electronico as email, telefono, tipo_usuario, 
                CASE WHEN activo = 1 THEN 'activo' ELSE 'inactivo' END as estado,
                DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion_formato,
                DATE_FORMAT(fecha_actualizacion, '%d/%m/%Y %H:%i') as fecha_modificacion_formato
            FROM usuarios 
            WHERE id = ?
        ");
        $stmt->execute([$data['id']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Separar nombre y apellido
        $nombreParts = explode(' ', $usuario['nombre_completo']);
        $usuario['nombre'] = $nombreParts[0];
        $usuario['apellido'] = implode(' ', array_slice($nombreParts, 1));
        
        $database->closeConnection();
        
        echo json_encode([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente',
            'usuario' => $usuario
        ]);
    } else {
        throw new Exception('Error al actualizar el usuario');
    }
    
} catch (Exception $e) {
    if (isset($database)) {
        $database->closeConnection();
    }
    logError("Error updating user: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>