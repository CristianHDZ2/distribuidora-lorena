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
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] !== 'administrador') {
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
    
    $conexion = obtenerConexion();
    
    // Verificar que el usuario existe
    $stmt = $conexion->prepare("SELECT id, dui, email FROM usuarios WHERE id = ?");
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
        } elseif (!validarDUI($data['dui'])) {
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
    
    // Validar nombre
    if (isset($data['nombre'])) {
        if (empty($data['nombre'])) {
            $errores[] = 'El nombre no puede estar vacío';
        } elseif (strlen($data['nombre']) < 2) {
            $errores[] = 'El nombre debe tener al menos 2 caracteres';
        } else {
            $camposActualizar[] = "nombre = ?";
            $parametros[] = $data['nombre'];
        }
    }
    
    // Validar apellido
    if (isset($data['apellido'])) {
        if (empty($data['apellido'])) {
            $errores[] = 'El apellido no puede estar vacío';
        } elseif (strlen($data['apellido']) < 2) {
            $errores[] = 'El apellido debe tener al menos 2 caracteres';
        } else {
            $camposActualizar[] = "apellido = ?";
            $parametros[] = $data['apellido'];
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
    if (isset($data['email']) && $data['email'] !== $usuarioExistente['email']) {
        if (empty($data['email'])) {
            $errores[] = 'El email no puede estar vacío';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errores[] = 'Formato de email inválido';
        } else {
            // Verificar que no exista otro usuario con este email
            $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
            $stmt->execute([$data['email'], $data['id']]);
            if ($stmt->fetch()) {
                $errores[] = 'Ya existe otro usuario con este email';
            } else {
                $camposActualizar[] = "email = ?";
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
        if (!in_array($data['estado'], ['activo', 'inactivo'])) {
            $errores[] = 'Estado inválido';
        } else {
            $camposActualizar[] = "estado = ?";
            $parametros[] = $data['estado'];
        }
    }
    
    // Validar nueva contraseña si se proporciona
    if (isset($data['nueva_password']) && !empty($data['nueva_password'])) {
        if (strlen($data['nueva_password']) < 6) {
            $errores[] = 'La nueva contraseña debe tener al menos 6 caracteres';
        } else {
            $camposActualizar[] = "password = ?";
            $parametros[] = password_hash($data['nueva_password'], PASSWORD_DEFAULT);
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
    $camposActualizar[] = "fecha_modificacion = NOW()";
    $camposActualizar[] = "modificado_por = ?";
    $parametros[] = $_SESSION['user_id'];
    $parametros[] = $data['id'];
    
    // Actualizar usuario
    $sql = "UPDATE usuarios SET " . implode(', ', $camposActualizar) . " WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $resultado = $stmt->execute($parametros);
    
    if ($resultado) {
        // Obtener los datos actualizados del usuario
        $stmt = $conexion->prepare("
            SELECT 
                id, dui, nombre, apellido, telefono, email, tipo_usuario, estado,
                DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion_formato,
                DATE_FORMAT(fecha_modificacion, '%d/%m/%Y %H:%i') as fecha_modificacion_formato
            FROM usuarios 
            WHERE id = ?
        ");
        $stmt->execute([$data['id']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente',
            'usuario' => $usuario
        ]);
    } else {
        throw new Exception('Error al actualizar el usuario');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}

function validarDUI($dui) {
    // Formato: 12345678-9
    if (!preg_match('/^\d{8}-\d$/', $dui)) {
        return false;
    }
    
    // Extraer números para validación
    $numeros = str_replace('-', '', $dui);
    $digitos = str_split($numeros);
    $digitoVerificador = array_pop($digitos);
    
    // Algoritmo de validación DUI El Salvador
    $suma = 0;
    for ($i = 0; $i < 8; $i++) {
        $suma += $digitos[$i] * (9 - $i);
    }
    
    $residuo = $suma % 10;
    $digitoCalculado = $residuo == 0 ? 0 : 10 - $residuo;
    
    return $digitoCalculado == $digitoVerificador;
}
?>