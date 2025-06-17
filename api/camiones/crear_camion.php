<?php
// api/camiones/crear_camion.php
require_once '../config/database.php';

// Verificar autenticación
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Solo administradores pueden crear camiones
if ($_SESSION['user_type'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Sin permisos para esta acción']);
    exit;
}

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    // Obtener y decodificar datos JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Datos JSON inválidos');
    }
    
    // Validar campos requeridos
    $required_fields = ['placa', 'marca', 'modelo', 'anio', 'capacidad_carga'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            throw new Exception("El campo $field es requerido");
        }
    }
    
    // Validar y sanitizar datos
    $placa = strtoupper(trim($data['placa']));
    $marca = trim($data['marca']);
    $modelo = trim($data['modelo']);
    $anio = intval($data['anio']);
    $capacidad_carga = floatval($data['capacidad_carga']);
    $tipo_combustible = isset($data['tipo_combustible']) ? trim($data['tipo_combustible']) : 'diesel';
    $estado = isset($data['estado']) ? trim($data['estado']) : 'activo';
    $descripcion = isset($data['descripcion']) ? trim($data['descripcion']) : '';
    
    // Validaciones específicas
    if (!preg_match('/^[A-Z]{1,2}\d{4,6}$/', $placa)) {
        throw new Exception('Formato de placa inválido (ej: P123456)');
    }
    
    if (strlen($marca) < 2 || strlen($marca) > 50) {
        throw new Exception('La marca debe tener entre 2 y 50 caracteres');
    }
    
    if (strlen($modelo) < 2 || strlen($modelo) > 50) {
        throw new Exception('El modelo debe tener entre 2 y 50 caracteres');
    }
    
    $current_year = date('Y');
    if ($anio < 1990 || $anio > ($current_year + 1)) {
        throw new Exception("El año debe estar entre 1990 y " . ($current_year + 1));
    }
    
    if ($capacidad_carga <= 0 || $capacidad_carga > 50) {
        throw new Exception('La capacidad de carga debe estar entre 0.1 y 50 toneladas');
    }
    
    $tipos_combustible_validos = ['diesel', 'gasolina', 'gas_natural', 'electrico', 'hibrido'];
    if (!in_array($tipo_combustible, $tipos_combustible_validos)) {
        throw new Exception('Tipo de combustible inválido');
    }
    
    $estados_validos = ['activo', 'inactivo', 'en_reparacion'];
    if (!in_array($estado, $estados_validos)) {
        throw new Exception('Estado inválido');
    }
    
    if (strlen($descripcion) > 500) {
        throw new Exception('La descripción no puede exceder 500 caracteres');
    }
    
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Verificar que la placa no exista
    $check_stmt = $pdo->prepare("
        SELECT id FROM camiones 
        WHERE placa = ? AND deleted_at IS NULL
    ");
    $check_stmt->execute([$placa]);
    
    if ($check_stmt->fetch()) {
        throw new Exception('Ya existe un camión con esta placa');
    }
    
    // Iniciar transacción
    $pdo->beginTransaction();
    
    try {
        // Insertar camión
        $stmt = $pdo->prepare("
            INSERT INTO camiones (
                placa, marca, modelo, anio, capacidad_carga, 
                tipo_combustible, estado, descripcion, 
                created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $placa,
            $marca,
            $modelo,
            $anio,
            $capacidad_carga,
            $tipo_combustible,
            $estado,
            $descripcion,
            $_SESSION['user_id']
        ]);
        
        $camion_id = $pdo->lastInsertId();
        
        // Registrar en log de actividades
        $log_stmt = $pdo->prepare("
            INSERT INTO activity_logs (
                user_id, action, table_name, record_id, 
                details, created_at
            ) VALUES (?, 'CREATE', 'camiones', ?, ?, NOW())
        ");
        
        $log_details = json_encode([
            'placa' => $placa,
            'marca' => $marca,
            'modelo' => $modelo,
            'anio' => $anio,
            'capacidad_carga' => $capacidad_carga
        ]);
        
        $log_stmt->execute([
            $_SESSION['user_id'],
            $camion_id,
            $log_details
        ]);
        
        // Confirmar transacción
        $pdo->commit();
        
        // Obtener el camión creado
        $get_stmt = $pdo->prepare("
            SELECT c.*, u.nombre_completo as created_by_name
            FROM camiones c
            LEFT JOIN usuarios u ON c.created_by = u.id
            WHERE c.id = ?
        ");
        $get_stmt->execute([$camion_id]);
        $camion_creado = $get_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Cerrar conexión
        $database->closeConnection();
        
        echo json_encode([
            'success' => true,
            'message' => "Camión {$placa} creado exitosamente",
            'data' => $camion_creado
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    // Cerrar conexión en caso de error
    if (isset($database)) {
        $database->closeConnection();
    }
    
    error_log("Error creando camión: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>