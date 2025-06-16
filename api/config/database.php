<?php
// Archivo: api/config/database.php

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

// Función para validar fechas
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

// Función para obtener estado de stock
function getStockStatus($current_stock, $min_stock = 10, $medium_stock = 50) {
    if ($current_stock == 0) {
        return 'sin_stock';
    } elseif ($current_stock <= $min_stock) {
        return 'bajo';
    } elseif ($current_stock <= $medium_stock) {
        return 'intermedio';
    } else {
        return 'alto';
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

// Función para log de errores personalizados
function logError($message, $context = '') {
    $log_message = date('Y-m-d H:i:s') . " - " . $message;
    if (!empty($context)) {
        $log_message .= " - Context: " . $context;
    }
    error_log($log_message . "\n", 3, __DIR__ . "/../logs/error.log");
}

// Función para log de actividades
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

// Crear directorio de logs si no existe
if (!is_dir(__DIR__ . "/../logs")) {
    mkdir(__DIR__ . "/../logs", 0777, true);
}

?>