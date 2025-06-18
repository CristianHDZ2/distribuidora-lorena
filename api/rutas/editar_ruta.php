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

// Obtener ID de la ruta de la URL
$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de la ruta es requerido']);
    exit;
}

// Verificar que la ruta existe
$stmt = $pdo->prepare("SELECT * FROM rutas WHERE id = ?");
$stmt->execute([$id]);
$rutaExistente = $stmt->fetch();

if (!$rutaExistente) {
    http_response_code(404);
    echo json_encode(['error' => 'Ruta no encontrada']);
    exit;
}

// Obtener datos JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validar datos requeridos
$requiredFields = ['numero_ruta', 'lugar_recorrido', 'grupo_productos', 'camion_id', 'motorista_id'];
foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        http_response_code(400);
        echo json_encode(['error' => "El campo {$field} es requerido"]);
        exit;
    }
}

$numero_ruta = trim($input['numero_ruta']);
$lugar_recorrido = trim($input['lugar_recorrido']);
$grupo_productos = trim($input['grupo_productos']);
$camion_id = intval($input['camion_id']);
$motorista_id = intval($input['motorista_id']);
$observaciones = trim($input['observaciones'] ?? '');
$activa = isset($input['activa']) ? (bool)$input['activa'] : true;

try {
    // Validar grupo de productos
    $grupos_validos = ['Big Cola', 'Otros Productos'];
    if (!in_array($grupo_productos, $grupos_validos)) {
        http_response_code(400);
        echo json_encode(['error' => 'Grupo de productos inválido. Debe ser: Big Cola o Otros Productos']);
        exit;
    }

    // Verificar que el número de ruta no exista en otra ruta
    $stmt = $pdo->prepare("SELECT id FROM rutas WHERE numero_ruta = ? AND id != ?");
    $stmt->execute([$numero_ruta, $id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Ya existe otra ruta con este número']);
        exit;
    }

    // Verificar que el camión existe y está activo
    $stmt = $pdo->prepare("SELECT numero_placa FROM camiones WHERE id = ? AND activo = 1");
    $stmt->execute([$camion_id]);
    $camion = $stmt->fetch();
    if (!$camion) {
        http_response_code(400);
        echo json_encode(['error' => 'El camión seleccionado no existe o está inactivo']);
        exit;
    }

    // Verificar que el motorista existe y está activo
    $stmt = $pdo->prepare("SELECT nombre_completo, tipo_licencia FROM motoristas WHERE id = ? AND activo = 1");
    $stmt->execute([$motorista_id]);
    $motorista = $stmt->fetch();
    if (!$motorista) {
        http_response_code(400);
        echo json_encode(['error' => 'El motorista seleccionado no existe o está inactivo']);
        exit;
    }

    // Si el camión cambió, verificar que no esté asignado a otra ruta activa
    if ($camion_id != $rutaExistente['camion_id']) {
        $stmt = $pdo->prepare("
            SELECT numero_ruta 
            FROM rutas 
            WHERE camion_id = ? AND activa = 1 AND id != ?
        ");
        $stmt->execute([$camion_id, $id]);
        $rutaCamion = $stmt->fetch();
        if ($rutaCamion) {
            http_response_code(400);
            echo json_encode(['error' => "El camión {$camion['numero_placa']} ya está asignado a la ruta {$rutaCamion['numero_ruta']}"]);
            exit;
        }
    }

    // Si el motorista cambió, verificar que no esté asignado a otra ruta activa
    if ($motorista_id != $rutaExistente['motorista_id']) {
        $stmt = $pdo->prepare("
            SELECT numero_ruta 
            FROM rutas 
            WHERE motorista_id = ? AND activa = 1 AND id != ?
        ");
        $stmt->execute([$motorista_id, $id]);
        $rutaMotorista = $stmt->fetch();
        if ($rutaMotorista) {
            http_response_code(400);
            echo json_encode(['error' => "El motorista {$motorista['nombre_completo']} ya está asignado a la ruta {$rutaMotorista['numero_ruta']}"]);
            exit;
        }
    }

    // Actualizar ruta
    $stmt = $pdo->prepare("
        UPDATE rutas 
        SET numero_ruta = ?, lugar_recorrido = ?, grupo_productos = ?, 
            camion_id = ?, motorista_id = ?, observaciones = ?, 
            activa = ?, fecha_actualizacion = NOW()
        WHERE id = ?
    ");
    
    $resultado = $stmt->execute([
        $numero_ruta,
        $lugar_recorrido,
        $grupo_productos,
        $camion_id,
        $motorista_id,
        $observaciones,
        $activa ? 1 : 0,
        $id
    ]);
    
    if ($resultado) {
        // Obtener la ruta actualizada con información completa
        $stmt = $pdo->prepare("
            SELECT r.id, r.numero_ruta, r.lugar_recorrido, r.grupo_productos, 
                   r.observaciones, r.activa,
                   DATE_FORMAT(r.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion,
                   DATE_FORMAT(r.fecha_actualizacion, '%d/%m/%Y %H:%i') as fecha_actualizacion,
                   c.numero_placa as camion_placa,
                   c.id as camion_id,
                   c.foto1 as camion_foto,
                   m.nombre_completo as motorista_nombre,
                   m.dui as motorista_dui,
                   m.tipo_licencia as motorista_tipo_licencia,
                   m.telefono as motorista_telefono,
                   m.id as motorista_id
            FROM rutas r
            INNER JOIN camiones c ON r.camion_id = c.id
            INNER JOIN motoristas m ON r.motorista_id = m.id
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        $ruta = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Ruta actualizada exitosamente',
            'ruta' => $ruta
        ]);
    } else {
        throw new Exception('Error al actualizar la ruta');
    }

} catch (Exception $e) {
    error_log("Error al editar ruta: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>