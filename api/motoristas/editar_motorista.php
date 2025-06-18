<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

// Verificar que sea PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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

// Verificar sesión del usuario y que sea administrador
$stmt = $pdo->prepare("SELECT id, tipo_usuario FROM usuarios WHERE id = ? AND activo = 1");
$stmt->execute([$token]);
$usuario = $stmt->fetch();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión inválida']);
    exit;
}

if ($usuario['tipo_usuario'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para realizar esta acción']);
    exit;
}

// Obtener ID del motorista de la URL
$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID del motorista es requerido']);
    exit;
}

// Verificar que el motorista existe
$stmt = $pdo->prepare("SELECT * FROM motoristas WHERE id = ?");
$stmt->execute([$id]);
$motoristaExistente = $stmt->fetch();

if (!$motoristaExistente) {
    http_response_code(404);
    echo json_encode(['error' => 'Motorista no encontrado']);
    exit;
}

// Obtener datos JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validar datos requeridos
$requiredFields = ['nombre_completo', 'dui', 'numero_licencia', 'tipo_licencia'];
foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        http_response_code(400);
        echo json_encode(['error' => "El campo {$field} es requerido"]);
        exit;
    }
}

$nombre_completo = trim($input['nombre_completo']);
$dui = trim($input['dui']);
$numero_licencia = trim($input['numero_licencia']);
$tipo_licencia = trim($input['tipo_licencia']);
$telefono = trim($input['telefono'] ?? '');
$direccion = trim($input['direccion'] ?? '');
$activo = isset($input['activo']) ? (bool)$input['activo'] : true;

try {
    // Validar formato DUI
    if (!preg_match('/^\d{8}-\d$/', $dui)) {
        http_response_code(400);
        echo json_encode(['error' => 'El DUI debe tener el formato 12345678-9']);
        exit;
    }

    // Validar tipo de licencia
    $tipos_licencia_validos = ['Liviana', 'Pesada', 'Particular'];
    if (!in_array($tipo_licencia, $tipos_licencia_validos)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de licencia inválido. Debe ser: Liviana, Pesada o Particular']);
        exit;
    }

    // Validar teléfono si se proporciona
    if (!empty($telefono) && !preg_match('/^\d{4}-\d{4}$/', $telefono)) {
        http_response_code(400);
        echo json_encode(['error' => 'El teléfono debe tener el formato 1234-5678']);
        exit;
    }

    // Verificar que el DUI no exista en otro motorista
    $stmt = $pdo->prepare("SELECT id FROM motoristas WHERE dui = ? AND id != ?");
    $stmt->execute([$dui, $id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Ya existe otro motorista con este DUI']);
        exit;
    }

    // Verificar que el número de licencia no exista en otro motorista
    $stmt = $pdo->prepare("SELECT id FROM motoristas WHERE numero_licencia = ? AND id != ?");
    $stmt->execute([$numero_licencia, $id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Ya existe otro motorista con este número de licencia']);
        exit;
    }

    // Si se está desactivando el motorista, verificar que no esté asignado a una ruta activa
    if (!$activo) {
        $stmt = $pdo->prepare("
            SELECT r.numero_ruta 
            FROM rutas r 
            WHERE r.motorista_id = ? AND r.activa = 1
        ");
        $stmt->execute([$id]);
        $rutaAsignada = $stmt->fetch();
        
        if ($rutaAsignada) {
            http_response_code(400);
            echo json_encode([
                'error' => 'No se puede desactivar el motorista porque está asignado a la ruta: ' . $rutaAsignada['numero_ruta']
            ]);
            exit;
        }
    }

    // Actualizar motorista
    $stmt = $pdo->prepare("
        UPDATE motoristas 
        SET nombre_completo = ?, dui = ?, numero_licencia = ?, tipo_licencia = ?, 
            telefono = ?, direccion = ?, activo = ?, fecha_actualizacion = NOW()
        WHERE id = ?
    ");
    
    $resultado = $stmt->execute([
        $nombre_completo,
        $dui,
        $numero_licencia,
        $tipo_licencia,
        $telefono,
        $direccion,
        $activo ? 1 : 0,
        $id
    ]);
    
    if ($resultado) {
        // Obtener el motorista actualizado
        $stmt = $pdo->prepare("
            SELECT m.id, m.nombre_completo, m.dui, m.numero_licencia, m.tipo_licencia, 
                   m.telefono, m.direccion, m.activo,
                   DATE_FORMAT(m.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion,
                   DATE_FORMAT(m.fecha_actualizacion, '%d/%m/%Y %H:%i') as fecha_actualizacion,
                   CASE 
                       WHEN r.id IS NOT NULL THEN 'Asignado'
                       ELSE 'Disponible'
                   END as estado_asignacion,
                   r.numero_ruta, r.lugar_recorrido, r.grupo_productos,
                   c.numero_placa as camion_asignado
            FROM motoristas m
            LEFT JOIN rutas r ON r.motorista_id = m.id AND r.activa = 1
            LEFT JOIN camiones c ON r.camion_id = c.id AND c.activo = 1
            WHERE m.id = ?
        ");
        $stmt->execute([$id]);
        $motorista = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Motorista actualizado exitosamente',
            'motorista' => $motorista
        ]);
    } else {
        throw new Exception('Error al actualizar el motorista');
    }

} catch (Exception $e) {
    error_log("Error al editar motorista: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>