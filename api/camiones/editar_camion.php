<?php
require_once '../config/database.php';

// Verificar autenticación
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Solo administradores pueden editar camiones
if ($_SESSION['user_type'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Sin permisos para esta acción']);
    exit;
}

// Verificar método PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    // Obtener ID del camión
    $camion_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($camion_id <= 0) {
        throw new Exception('ID de camión inválido');
    }
    
    // Obtener datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar campos requeridos
    $required_fields = ['placa', 'marca', 'modelo', 'anio', 'capacidad_carga', 'tipo_combustible', 'estado'];
    
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            throw new Exception("El campo $field es requerido");
        }
    }
    
    // Sanitizar datos
    $placa = strtoupper(trim($input['placa']));
    $marca = trim($input['marca']);
    $modelo = trim($input['modelo']);
    $anio = intval($input['anio']);
    $capacidad_carga = floatval($input['capacidad_carga']);
    $tipo_combustible = trim($input['tipo_combustible']);
    $estado = trim($input['estado']);
    $descripcion = isset($input['descripcion']) ? trim($input['descripcion']) : '';
    
    // Validaciones específicas
    
    // Validar formato de placa (formato salvadoreño: P123-456)
    if (!preg_match('/^[A-Z]{1,2}\d{3}-\d{3}$/', $placa)) {
        throw new Exception('Formato de placa inválido. Use formato: P123-456');
    }
    
    // Validar año
    $current_year = date('Y');
    if ($anio < 1990 || $anio > $current_year + 1) {
        throw new Exception('Año debe estar entre 1990 y ' . ($current_year + 1));
    }
    
    // Validar capacidad de carga
    if ($capacidad_carga <= 0 || $capacidad_carga > 50) {
        throw new Exception('Capacidad de carga debe estar entre 0.1 y 50 toneladas');
    }
    
    // Validar tipo de combustible
    $combustibles_validos = ['gasolina', 'diesel', 'gas_natural', 'electrico', 'hibrido'];
    if (!in_array($tipo_combustible, $combustibles_validos)) {
        throw new Exception('Tipo de combustible no válido');
    }
    
    // Validar estado
    $estados_validos = ['activo', 'mantenimiento', 'inactivo', 'reparacion'];
    if (!in_array($estado, $estados_validos)) {
        throw new Exception('Estado no válido');
    }
    
    $database = new Database();
    $conexion = $database->getConnection();
    
    // Verificar que el camión existe
    $stmt = $pdo->prepare("SELECT placa FROM camiones WHERE id = ? AND deleted_at IS NULL");
    $stmt->execute([$camion_id]);
    $camion_actual = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$camion_actual) {
        throw new Exception('Camión no encontrado');
    }
    
    // Verificar que la placa no exista en otro camión
    if ($placa !== $camion_actual['placa']) {
        $stmt = $pdo->prepare("SELECT id FROM camiones WHERE placa = ? AND id != ? AND deleted_at IS NULL");
        $stmt->execute([$placa, $camion_id]);
        
        if ($stmt->rowCount() > 0) {
            throw new Exception('Ya existe otro camión con esta placa');
        }
    }
    
    // Actualizar camión
    $sql = "UPDATE camiones SET 
                placa = ?, marca = ?, modelo = ?, anio = ?, 
                capacidad_carga = ?, tipo_combustible = ?, estado = ?, 
                descripcion = ?, updated_by = ?, updated_at = NOW()
            WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $placa, $marca, $modelo, $anio, $capacidad_carga,
        $tipo_combustible, $estado, $descripcion, 
        $_SESSION['user_id'], $camion_id
    ]);
    
    // Obtener el camión actualizado
    $stmt = $pdo->prepare("
        SELECT c.*, 
               u.nombre_completo as created_by_name,
               uu.nombre_completo as updated_by_name,
               CASE 
                   WHEN c.estado = 'activo' THEN 'Activo'
                   WHEN c.estado = 'mantenimiento' THEN 'En Mantenimiento'
                   WHEN c.estado = 'inactivo' THEN 'Inactivo'
                   WHEN c.estado = 'reparacion' THEN 'En Reparación'
               END as estado_texto,
               CASE 
                   WHEN c.tipo_combustible = 'gasolina' THEN 'Gasolina'
                   WHEN c.tipo_combustible = 'diesel' THEN 'Diésel'
                   WHEN c.tipo_combustible = 'gas_natural' THEN 'Gas Natural'
                   WHEN c.tipo_combustible = 'electrico' THEN 'Eléctrico'
                   WHEN c.tipo_combustible = 'hibrido' THEN 'Híbrido'
               END as combustible_texto
        FROM camiones c
        LEFT JOIN usuarios u ON c.created_by = u.id
        LEFT JOIN usuarios uu ON c.updated_by = uu.id
        WHERE c.id = ?
    ");
    $stmt->execute([$camion_id]);
    $camion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Log de actividad
    $log_stmt = $pdo->prepare("
        INSERT INTO logs_actividad (
            user_id, accion, modulo, descripcion, created_at
        ) VALUES (?, 'UPDATE', 'CAMIONES', ?, NOW())
    ");
    $log_stmt->execute([
        $_SESSION['user_id'],
        "Camión actualizado: {$placa} - {$marca} {$modelo}"
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Camión actualizado exitosamente',
        'data' => $camion
    ]);

} catch (Exception $e) {
    error_log("Error editando camión: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>