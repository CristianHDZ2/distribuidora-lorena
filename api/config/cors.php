<?php
// Archivo: api/config/cors.php

// Configuración CORS para permitir peticiones desde Next.js
function setCorsHeaders() {
    // Permitir origen del frontend Next.js
    $allowed_origins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
    ];
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    // Métodos permitidos
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    
    // Headers permitidos
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    
    // Permitir credenciales
    header("Access-Control-Allow-Credentials: true");
    
    // Tiempo de vida del preflight
    header("Access-Control-Max-Age: 3600");
    
    // Tipo de contenido por defecto
    header("Content-Type: application/json; charset=UTF-8");
}

// Manejar peticiones OPTIONS (preflight)
function handlePreflight() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        setCorsHeaders();
        http_response_code(200);
        exit();
    }
}

// Función para inicializar CORS en cada endpoint
function initCors() {
    setCorsHeaders();
    handlePreflight();
}

// Función para manejar errores CORS
function corsError($message = "CORS error") {
    setCorsHeaders();
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit();
}

// Verificar si la petición viene de un origen permitido
function isAllowedOrigin() {
    $allowed_origins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
    ];
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
    
    // Verificar por origin
    if (!empty($origin) && in_array($origin, $allowed_origins)) {
        return true;
    }
    
    // Verificar por referer si no hay origin
    if (!empty($referer)) {
        foreach ($allowed_origins as $allowed) {
            if (strpos($referer, $allowed) === 0) {
                return true;
            }
        }
    }
    
    // Permitir peticiones locales sin origin (como Postman)
    if (empty($origin) && empty($referer)) {
        return true;
    }
    
    return false;
}

// Función para configurar headers de seguridad adicionales
function setSecurityHeaders() {
    // Prevenir XSS
    header("X-XSS-Protection: 1; mode=block");
    
    // Prevenir clickjacking
    header("X-Frame-Options: SAMEORIGIN");
    
    // Prevenir MIME type sniffing
    header("X-Content-Type-Options: nosniff");
    
    // Política de referrer
    header("Referrer-Policy: strict-origin-when-cross-origin");
}

// Función completa de inicialización
function initSecurity() {
    initCors();
    setSecurityHeaders();
    
    // Verificar origen si es necesario (comentar para desarrollo)
    // if (!isAllowedOrigin()) {
    //     corsError("Origin not allowed");
    // }
}

?>