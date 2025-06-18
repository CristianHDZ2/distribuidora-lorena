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

// Verificar sesión del usuario
$stmt = $pdo->prepare("SELECT id, tipo_usuario FROM usuarios WHERE id = ? AND activo = 1");
$stmt->execute([$token]);
$usuario = $stmt->fetch();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión inválida']);
    exit;
}

// Solo administradores pueden editar camiones
if ($usuario['tipo_usuario'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado. Solo administradores pueden editar camiones']);
    exit;
}

try {
    // Obtener ID del camión
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID del camión requerido']);
        exit;
    }

    // Verificar que el camión existe
    $stmt = $pdo->prepare("SELECT id, numero_placa FROM camiones WHERE id = ?");
    $stmt->execute([$id]);
    $camionExistente = $stmt->fetch();

    if (!$camionExistente) {
        http_response_code(404);
        echo json_encode(['error' => 'Camión no encontrado']);
        exit;
    }

    // Obtener datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);
    
    $numero_placa = trim($input['numero_placa'] ?? '');
    $activo = isset($input['activo']) ? (bool)$input['activo'] : true;

    // Validaciones
    if (empty($numero_placa)) {
        http_response_code(400);
        echo json_encode(['error' => 'El número de placa es obligatorio']);
        exit;
    }

    // Validar formato de placa
    if (!preg_match('/^[A-Z0-9\-]{1,10}$/', strtoupper($numero_placa))) {
        http_response_code(400);
        echo json_encode(['error' => 'Formato de placa inválido']);
        exit;
    }

    // Verificar que no exista otra placa igual (excluyendo el actual)
    $stmt = $pdo->prepare("SELECT id FROM camiones WHERE numero_placa = ? AND id != ?");
    $stmt->execute([strtoupper($numero_placa), $id]);
    
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Ya existe otro camión con este número de placa']);
        exit;
    }

    // Si se está desactivando el camión, verificar que no esté asignado a una ruta activa
    if (!$activo) {
        $stmt = $pdo->prepare("
            SELECT r.numero_ruta 
            FROM rutas r 
            WHERE r.camion_id = ? AND r.activa = 1
        ");
        $stmt->execute([$id]);
        $rutaAsignada = $stmt->fetch();
        
        if ($rutaAsignada) {
            http_response_code(400);
            echo json_encode([
                'error' => 'No se puede desactivar el camión porque está asignado a la ruta: ' . $rutaAsignada['numero_ruta']
            ]);
            exit;
        }
    }

    // Actualizar camión
    $stmt = $pdo->prepare("
        UPDATE camiones 
        SET numero_placa = ?, activo = ?, fecha_actualizacion = NOW()
        WHERE id = ?
    ");
    
    $resultado = $stmt->execute([
        strtoupper($numero_placa),
        $activo ? 1 : 0,
        $id
    ]);
    
    if ($resultado) {
        // Obtener el camión actualizado
        $stmt = $pdo->prepare("
            SELECT c.id, c.numero_placa, c.foto1, c.foto2, c.foto3, c.activo,
                   DATE_FORMAT(c.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion,
                   DATE_FORMAT(c.fecha_actualizacion, '%d/%m/%Y %H:%i') as fecha_actualizacion,
                   r.numero_ruta, r.lugar_recorrido, r.grupo_productos,
                   CONCAT(m.nombre_completo, ' (', m.dui, ')') as motorista_asignado
            FROM camiones c
            LEFT JOIN rutas r ON r.camion_id = c.id AND r.activa = 1
            LEFT JOIN motoristas m ON r.motorista_id = m.id AND m.activo = 1
            WHERE c.id = ?
        ");
        $stmt->execute([$id]);
        $camion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Camión actualizado exitosamente',
            'camion' => $camion
        ]);
    } else {
        throw new Exception('Error al actualizar el camión');
    }

} catch (Exception $e) {
    error_log("Error al editar camión: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>