<?php
// Archivo: api/auth/login.php

require_once '../config/database.php';
require_once '../config/cors.php';

// Inicializar CORS y seguridad
initSecurity();

// Verificar que sea método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
    exit;
}

try {
    // Obtener datos JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendResponse(false, 'Datos inválidos');
        exit;
    }
    
    // Validar campos requeridos
    $required_fields = ['dui', 'password'];
    $missing_fields = validateRequiredFields($input, $required_fields);
    
    if (!empty($missing_fields)) {
        sendResponse(false, 'Campos requeridos: ' . implode(', ', $missing_fields));
        exit;
    }
    
    // Limpiar datos
    $dui = cleanInput($input['dui']);
    $password = cleanInput($input['password']);
    
    // Formatear DUI
    $dui = formatDUI($dui);
    
    // Validar formato de DUI
    if (!validateDUI($dui)) {
        sendResponse(false, 'Formato de DUI inválido. Use el formato: 12345678-9');
        exit;
    }
    
    // Conectar a la base de datos
    $database = new Database();
    $db = $database->getConnection();
    
    // Buscar usuario por DUI
    $query = "SELECT 
                id, 
                nombre_completo, 
                correo_electronico, 
                dui, 
                nombre_usuario,
                password, 
                telefono, 
                direccion, 
                tipo_usuario, 
                foto, 
                activo,
                fecha_creacion
              FROM usuarios 
              WHERE dui = ? AND activo = 1";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$dui]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendResponse(false, 'DUI no registrado en el sistema');
        exit;
    }
    
    // Verificar contraseña
    if (!verifyPassword($password, $user['password'])) {
        sendResponse(false, 'Contraseña incorrecta');
        exit;
    }
    
    // Generar token de sesión (por simplicidad usamos un hash del ID y timestamp)
    $token = hash('sha256', $user['id'] . time() . 'distribuidora_lorena_secret');
    
    // Iniciar sesión PHP
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_type'] = $user['tipo_usuario'];
    $_SESSION['token'] = $token;
    $_SESSION['login_time'] = time();
    
    // Preparar datos del usuario para respuesta (sin contraseña)
    unset($user['password']);
    $user['foto_url'] = $user['foto'] ? getFileUrl('usuarios/' . $user['foto']) : null;
    
    // Registrar actividad de login
    try {
        $log_query = "INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())";
        $log_stmt = $db->prepare($log_query);
        $log_stmt->execute([
            $user['id'], 
            'login', 
            'Usuario inició sesión desde IP: ' . $_SERVER['REMOTE_ADDR']
        ]);
    } catch (Exception $e) {
        // Log error pero no fallar el login
        logError("Error logging login activity: " . $e->getMessage());
    }
    
    // Actualizar última conexión
    try {
        $update_query = "UPDATE usuarios SET fecha_actualizacion = NOW() WHERE id = ?";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->execute([$user['id']]);
    } catch (Exception $e) {
        logError("Error updating last login: " . $e->getMessage());
    }
    
    $database->closeConnection();
    
    // Responder con éxito
    sendResponse(true, 'Inicio de sesión exitoso', [
        'token' => $token,
        'user' => $user,
        'permissions' => [
            'can_manage_users' => $user['tipo_usuario'] === 'administrador',
            'can_manage_inventory' => true,
            'can_manage_dispatch' => true,
            'can_view_reports' => true,
            'can_manage_products' => $user['tipo_usuario'] === 'administrador',
            'can_manage_routes' => $user['tipo_usuario'] === 'administrador',
        ]
    ]);
    
} catch (PDOException $e) {
    logError("Database error in login: " . $e->getMessage());
    sendResponse(false, 'Error de conexión a la base de datos', null, 500);
} catch (Exception $e) {
    logError("General error in login: " . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>