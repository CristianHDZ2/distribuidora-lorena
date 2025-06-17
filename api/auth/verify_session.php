<?php
// Archivo: api/auth/verify_session.php

require_once '../config/database.php';
require_once '../config/cors.php';

// Inicializar CORS y seguridad
initSecurity();

// Verificar que sea método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
    exit;
}

try {
    // Iniciar sesión PHP - CORREGIDO
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Verificar si existe sesión activa
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['token'])) {
        sendResponse(false, 'No hay sesión activa', null, 401);
        exit;
    }
    
    // Verificar tiempo de sesión (24 horas)
    $session_timeout = 24 * 60 * 60; // 24 horas en segundos
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > $session_timeout) {
        // Limpiar sesión expirada
        session_destroy();
        sendResponse(false, 'Sesión expirada', null, 401);
        exit;
    }
    
    // Obtener token del header Authorization - CORREGIDO: OPCIONAL
    $headers = getallheaders();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Solo verificar token si se proporciona
    if (!empty($auth_header)) {
        // Extraer token (formato: "Bearer token")
        $token_parts = explode(' ', $auth_header);
        if (count($token_parts) === 2 && $token_parts[0] === 'Bearer') {
            $provided_token = $token_parts[1];
            
            // Verificar que el token coincida con el de la sesión
            if ($provided_token !== $_SESSION['token']) {
                session_destroy();
                sendResponse(false, 'Token inválido', null, 401);
                exit;
            }
        } else {
            sendResponse(false, 'Formato de token inválido', null, 401);
            exit;
        }
    }
    // Si no hay header Authorization, continuar con solo la verificación de sesión PHP
    
    // Conectar a la base de datos
    $database = new Database();
    $db = $database->getConnection();
    
    // Obtener datos actualizados del usuario
    $query = "SELECT 
                id, 
                nombre_completo, 
                correo_electronico, 
                dui, 
                nombre_usuario,
                telefono, 
                direccion, 
                tipo_usuario, 
                foto, 
                activo,
                fecha_creacion,
                fecha_actualizacion
              FROM usuarios 
              WHERE id = ? AND activo = 1";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Usuario no encontrado o desactivado
        session_destroy();
        sendResponse(false, 'Usuario no válido', null, 401);
        exit;
    }
    
    // Preparar datos del usuario
    $user['foto_url'] = $user['foto'] ? getFileUrl('usuarios/' . $user['foto']) : null;
    
    // Actualizar tiempo de última actividad en sesión
    $_SESSION['last_activity'] = time();
    
    $database->closeConnection();
    
    // Responder con datos de usuario válidos - AGREGADO manage_trucks
    sendResponse(true, 'Sesión válida', [
        'token' => $_SESSION['token'],
        'user' => $user,
        'session_info' => [
            'login_time' => $_SESSION['login_time'],
            'last_activity' => $_SESSION['last_activity'],
            'expires_at' => $_SESSION['login_time'] + $session_timeout
        ],
        'permissions' => [
            'can_manage_users' => $user['tipo_usuario'] === 'administrador',
            'can_manage_inventory' => true,
            'can_manage_dispatch' => true,
            'can_view_reports' => true,
            'can_manage_products' => $user['tipo_usuario'] === 'administrador',
            'can_manage_routes' => $user['tipo_usuario'] === 'administrador',
            'can_manage_trucks' => $user['tipo_usuario'] === 'administrador', // AGREGADO
        ]
    ]);
    
} catch (PDOException $e) {
    logError("Database error in verify session: " . $e->getMessage());
    sendResponse(false, 'Error de conexión a la base de datos', null, 500);
} catch (Exception $e) {
    logError("General error in verify session: " . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}
?>