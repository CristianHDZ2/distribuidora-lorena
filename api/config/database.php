<?php
// Archivo: api/config/database.php

// Configuración CORS MEJORADA
header('Content-Type: application/json; charset=utf-8');

// Origen permitidos (agregar más según necesidad)
$allowed_origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:3000");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 3600');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class Database {
    private $host = "localhost";
    private $db_name = "distribuidora_lorena";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                )
            );
        } catch(PDOException $exception) {
            error_log("Error de conexión: " . $exception->getMessage());
            die(json_encode(array(
                "success" => false,
                "message" => "Error de conexión a la base de datos"
            )));
        }

        return $this->conn;
    }

    public function closeConnection() {
        $this->conn = null;
    }
}

// Función auxiliar para respuestas JSON
function sendResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    
    $response = array(
        'success' => $success,
        'message' => $message
    );
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

// Función para validar campos requeridos
function validateRequiredFields($data, $required_fields) {
    $missing_fields = array();
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $missing_fields[] = $field;
        }
    }
    
    return $missing_fields;
}

// Función para limpiar datos de entrada
function cleanInput($data) {
    if (is_array($data)) {
        return array_map('cleanInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)));
}

// Función para validar DUI
function validateDUI($dui) {
    $pattern = '/^\d{8}-\d$/';
    return preg_match($pattern, $dui);
}

// Función para formatear DUI
function formatDUI($dui) {
    $cleaned = preg_replace('/[^0-9]/', '', $dui);
    if (strlen($cleaned) === 9) {
        return substr($cleaned, 0, 8) . '-' . substr($cleaned, 8, 1);
    }
    return $dui;
}

// Función para validar email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Función para validar contraseña
function validatePassword($password) {
    // Al menos 6 caracteres, una mayúscula, un número y un símbolo
    $pattern = '/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/';
    return preg_match($pattern, $password);
}

// Función para generar hash de contraseña
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Función para verificar contraseña
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Función para crear URL completa de archivos
function getFileUrl($path) {
    if (empty($path)) {
        return null;
    }
    
    // Obtener el protocolo (http o https)
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    
    // Obtener el host
    $host = $_SERVER['HTTP_HOST'];
    
    // Construir la URL base
    $base_url = $protocol . '://' . $host;
    
    // Asegurarse de que la ruta empiece con /
    if (!str_starts_with($path, '/')) {
        $path = '/' . $path;
    }
    
    // Si la ruta no incluye /api/uploads/, agregarla
    if (!str_contains($path, '/api/uploads/')) {
        $path = '/distribuidora-lorena/api/uploads' . $path;
    }
    
    return $base_url . $path;
}

// Función para manejar uploads de archivos
function handleFileUpload($file, $upload_dir, $allowed_types = array('jpg', 'jpeg', 'png'), $max_size = 5242880) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return array('success' => false, 'message' => 'Error al subir el archivo');
    }
    
    $file_size = $file['size'];
    $file_tmp = $file['tmp_name'];
    $file_name = $file['name'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    
    if (!in_array($file_ext, $allowed_types)) {
        return array('success' => false, 'message' => 'Tipo de archivo no permitido');
    }
    
    if ($file_size > $max_size) {
        return array('success' => false, 'message' => 'El archivo es demasiado grande');
    }
    
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $new_file_name = uniqid() . '.' . $file_ext;
    $file_path = $upload_dir . '/' . $new_file_name;
    
    if (move_uploaded_file($file_tmp, $file_path)) {
        return array('success' => true, 'filename' => $new_file_name, 'path' => $file_path);
    } else {
        return array('success' => false, 'message' => 'Error al mover el archivo');
    }
}

// Función para generar nombres de usuario basados en DUI
function generateUsername($dui) {
    return str_replace('-', '', $dui);
}

// Función para validar stock
function validateStock($cantidad, $stock_disponible) {
    return $cantidad <= $stock_disponible && $cantidad > 0;
}

// Función para calcular precio con ganancia
function calculateSalePrice($purchase_price, $margin = 0.10) {
    return $purchase_price * (1 + $margin);
}

// Función para formatear números decimales
function formatDecimal($number, $decimals = 2) {
    return number_format($number, $decimals, '.', '');
}

// Función para formatear moneda
function formatCurrency($amount) {
    return '$' . number_format($amount, 2, '.', ',');
}

// Función para validar fechas
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

// Función para logging de errores
function logError($message) {
    $log_file = __DIR__ . '/../logs/error.log';
    $log_dir = dirname($log_file);
    
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0777, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[{$timestamp}] {$message}" . PHP_EOL;
    
    file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);
}

// Función para logging de actividades
function logActivity($user_id, $action, $details = '') {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id, $action, $details]);
        
        $database->closeConnection();
    } catch (Exception $e) {
        logError("Error logging activity: " . $e->getMessage());
    }
}

// Función para generar códigos únicos
function generateUniqueCode($prefix = '', $length = 8) {
    $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $code = $prefix;
    
    for ($i = 0; $i < $length; $i++) {
        $code .= $characters[rand(0, strlen($characters) - 1)];
    }
    
    return $code;
}

// Función para paginar resultados
function paginate($total_records, $records_per_page = 10, $current_page = 1) {
    $total_pages = ceil($total_records / $records_per_page);
    $offset = ($current_page - 1) * $records_per_page;
    
    return array(
        'total_records' => $total_records,
        'total_pages' => $total_pages,
        'current_page' => $current_page,
        'records_per_page' => $records_per_page,
        'offset' => $offset,
        'has_previous' => $current_page > 1,
        'has_next' => $current_page < $total_pages
    );
}

// Función para validar permisos de usuario
function validateUserPermission($user_type, $required_permission) {
    $permissions = array(
        'administrador' => array(
            'manage_users', 'manage_products', 'manage_inventory', 
            'manage_dispatch', 'manage_routes', 'manage_drivers', 
            'manage_trucks', 'view_reports', 'manage_reports', 'system_settings'
        ),
        'despachador' => array(
            'view_inventory', 'manage_dispatch', 'view_my_dispatches', 'view_reports'
        )
    );
    
    return isset($permissions[$user_type]) && in_array($required_permission, $permissions[$user_type]);
}

// Función para crear directorio de uploads si no existe
function ensureUploadDirectory($path) {
    $upload_dir = __DIR__ . '/../uploads/' . $path;
    
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    return $upload_dir;
}

// Establecer zona horaria para El Salvador
date_default_timezone_set('America/El_Salvador');

// Inicializar sesiones si no están iniciadas
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

?>