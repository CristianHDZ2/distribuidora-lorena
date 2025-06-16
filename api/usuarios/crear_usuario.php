<?php
require_once '../config/database.php';
require_once '../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar sesión
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_tipo'] !== 'administrador') {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Solo administradores pueden crear usuarios']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validaciones
    $errores = [];
    
    if (empty($data['dui'])) {
        $errores[] = 'El DUI es requerido';
    } elseif (!validarDUI($data['dui'])) {
        $errores[] = 'Formato de DUI inválido. Debe ser 12345678-9';
    }
    
    if (empty($data['nombre'])) {
        $errores[] = 'El nombre es requerido';
    } elseif (strlen($data['nombre']) < 2) {
        $errores[] = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (empty($data['apellido'])) {
        $errores[] = 'El apellido es requerido';
    } elseif (strlen($data['apellido']) < 2) {
        $errores[] = 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (empty($data['telefono'])) {
        $errores[] = 'El teléfono es requerido';
    } elseif (!preg_match('/^[267]\d{3}-\d{4}$/', $data['telefono'])) {
        $errores[] = 'Formato de teléfono inválido. Debe ser 7XXX-XXXX o 2XXX-XXXX o 6XXX-XXXX';
    }
    
    if (empty($data['email'])) {
        $errores[] = 'El email es requerido';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errores[] = 'Formato de email inválido';
    }
    
    if (empty($data['tipo_usuario'])) {
        $errores[] = 'El tipo de usuario es requerido';
    } elseif (!in_array($data['tipo_usuario'], ['administrador', 'despachador'])) {
        $errores[] = 'Tipo de usuario inválido';
    }
    
    if (empty($data['password'])) {
        $errores[] = 'La contraseña es requerida';
    } elseif (strlen($data['password']) < 6) {
        $errores[] = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!empty($errores)) {
        http_response_code(400);
        echo json_encode(['error' => implode(', ', $errores)]);
        exit;
    }
    
    $conexion = obtenerConexion();
    
    // Verificar si el DUI ya existe
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE dui = ?");
    $stmt->execute([$data['dui']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Ya existe un usuario con este DUI']);
        exit;
    }
    
    // Verificar si el email ya existe
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Ya existe un usuario con este email']);
        exit;
    }
    
    // Encriptar contraseña
    $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insertar usuario
    $stmt = $conexion->prepare("
        INSERT INTO usuarios 
        (dui, nombre, apellido, telefono, email, tipo_usuario, password, estado, fecha_creacion, creado_por) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'activo', NOW(), ?)
    ");
    
    $resultado = $stmt->execute([
        $data['dui'],
        $data['nombre'],
        $data['apellido'],
        $data['telefono'],
        $data['email'],
        $data['tipo_usuario'],
        $passwordHash,
        $_SESSION['user_id']
    ]);
    
    if ($resultado) {
        $nuevoUsuarioId = $conexion->lastInsertId();
        
        // Obtener los datos del usuario creado
        $stmt = $conexion->prepare("
            SELECT id, dui, nombre, apellido, telefono, email, tipo_usuario, estado, 
                   DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion_formato
            FROM usuarios 
            WHERE id = ?
        ");
        $stmt->execute([$nuevoUsuarioId]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'usuario' => $usuario
        ]);
    } else {
        throw new Exception('Error al crear el usuario');
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