<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

// Verificar que sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar autenticación
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Token de autenticación requerido']);
    exit;
}

// Verificar sesión del usuario
$stmt = $pdo->prepare("SELECT id, tipo_usuario FROM usuarios WHERE id = ? AND activo = 1");
$stmt->execute([$token]);
$usuario = $stmt->fetch();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión inválida']);
    exit;
}

// Solo administradores pueden crear camiones
if ($usuario['tipo_usuario'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado. Solo administradores pueden crear camiones']);
    exit;
}

try {
    // Obtener datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);
    
    $numero_placa = trim($input['numero_placa'] ?? '');

    // Validaciones
    if (empty($numero_placa)) {
        http_response_code(400);
        echo json_encode(['error' => 'El número de placa es obligatorio']);
        exit;
    }

    // Validar formato de placa (opcional: ajustar según formato de El Salvador)
    if (!preg_match('/^[A-Z0-9\-]{1,10}$/', strtoupper($numero_placa))) {
        http_response_code(400);
        echo json_encode(['error' => 'Formato de placa inválido']);
        exit;
    }

    // Verificar que no exista la placa
    $stmt = $pdo->prepare("SELECT id FROM camiones WHERE numero_placa = ?");
    $stmt->execute([strtoupper($numero_placa)]);
    
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Ya existe un camión con este número de placa']);
        exit;
    }

    // Insertar camión
    $stmt = $pdo->prepare("
        INSERT INTO camiones (numero_placa, activo, fecha_creacion) 
        VALUES (?, 1, NOW())
    ");
    
    $resultado = $stmt->execute([strtoupper($numero_placa)]);
    
    if ($resultado) {
        $camion_id = $pdo->lastInsertId();
        
        // Obtener el camión creado
        $stmt = $pdo->prepare("
            SELECT id, numero_placa, foto1, foto2, foto3, activo, 
                   DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion
            FROM camiones 
            WHERE id = ?
        ");
        $stmt->execute([$camion_id]);
        $camion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Camión creado exitosamente',
            'camion' => $camion
        ]);
    } else {
        throw new Exception('Error al crear el camión');
    }

} catch (Exception $e) {
    error_log("Error al crear camión: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>