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
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'administrador') {
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
    } elseif (!validateDUI($data['dui'])) {
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
    } elseif (!validateEmail($data['email'])) {
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
    
    $database = new Database();
    $conexion = $database->getConnection();
    
    // Verificar si el DUI ya existe
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE dui = ?");
    $stmt->execute([$data['dui']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Ya existe un usuario con este DUI']);
        exit;
    }
    
    // Verificar si el email ya existe
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE correo_electronico = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Ya existe un usuario con este email']);
        exit;
    }
    
    // Encriptar contraseña
    $passwordHash = hashPassword($data['password']);
    
    // Crear nombre completo
    $nombreCompleto = $data['nombre'] . ' ' . $data['apellido'];
    
    // Generar nombre de usuario basado en DUI
    $nombreUsuario = generateUsername($data['dui']);
    
    // Insertar usuario
    $stmt = $conexion->prepare("
        INSERT INTO usuarios 
        (dui, nombre_completo, nombre_usuario, correo_electronico, telefono, tipo_usuario, password, activo, fecha_creacion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
    ");
    
    $resultado = $stmt->execute([
        $data['dui'],
        $nombreCompleto,
        $nombreUsuario,
        $data['email'],
        $data['telefono'],
        $data['tipo_usuario'],
        $passwordHash
    ]);
    
    if ($resultado) {
        $nuevoUsuarioId = $conexion->lastInsertId();
        
        // Registrar actividad
        logActivity($_SESSION['user_id'], 'create_user', "Creó usuario: $nombreCompleto (DUI: {$data['dui']})");
        
        // Obtener los datos del usuario creado
        $stmt = $conexion->prepare("
            SELECT id, dui, nombre_completo, correo_electronico, telefono, tipo_usuario, activo,
                   DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion_formato
            FROM usuarios 
            WHERE id = ?
        ");
        $stmt->execute([$nuevoUsuarioId]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $database->closeConnection();
        
        echo json_encode([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'usuario' => $usuario
        ]);
    } else {
        throw new Exception('Error al crear el usuario');
    }
    
} catch (Exception $e) {
    if (isset($database)) {
        $database->closeConnection();
    }
    logError("Error creating user: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>