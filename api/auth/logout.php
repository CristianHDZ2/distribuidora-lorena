<?php
// Archivo: api/auth/logout.php

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
    // Iniciar sesión PHP
    session_start();
    
    $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    
    // Registrar actividad de logout si hay usuario en sesión
    if ($user_id) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            $log_query = "INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())";
            $log_stmt = $db->prepare($log_query);
            $log_stmt->execute([
                $user_id, 
                'logout', 
                'Usuario cerró sesión desde IP: ' . $_SERVER['REMOTE_ADDR']
            ]);
            
            $database->closeConnection();
        } catch (Exception $e) {
            // Log error pero no fallar el logout
            logError("Error logging logout activity: " . $e->getMessage());
        }
    }
    
    // Destruir todas las variables de sesión
    $_SESSION = array();
    
    // Destruir la cookie de sesión si existe
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destruir la sesión
    session_destroy();
    
    // Responder con éxito
    sendResponse(true, 'Sesión cerrada exitosamente');
    
} catch (Exception $e) {
    logError("Error in logout: " . $e->getMessage());
    sendResponse(false, 'Error al cerrar sesión', null, 500);
}
?>