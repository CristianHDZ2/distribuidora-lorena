<?php
require_once '../config/database.php';

// Verificar autenticación
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Solo administradores pueden subir fotos
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
    // Obtener ID del camión
    $camion_id = isset($_POST['camion_id']) ? intval($_POST['camion_id']) : 0;
    $tipo_foto = isset($_POST['tipo_foto']) ? trim($_POST['tipo_foto']) : 'general';
    
    if ($camion_id <= 0) {
        throw new Exception('ID de camión inválido');
    }
    
    // Validar tipo de foto
    $tipos_validos = ['frontal', 'lateral', 'posterior', 'interior', 'general'];
    if (!in_array($tipo_foto, $tipos_validos)) {
        $tipo_foto = 'general';
    }
    
    // Verificar que se subió un archivo
    if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No se pudo subir la imagen');
    }
    
    $file = $_FILES['foto'];
    
    // Validar tipo de archivo
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    $file_type = $file['type'];
    
    if (!in_array($file_type, $allowed_types)) {
        throw new Exception('Tipo de archivo no válido. Solo se permiten JPG, PNG y GIF');
    }
    
    // Validar tamaño (máximo 5MB)
    $max_size = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $max_size) {
        throw new Exception('El archivo es demasiado grande. Máximo 5MB');
    }
    
    $database = new Database();
    $conexion = $database->getConnection();
    
    // Verificar que el camión existe
    $stmt = $pdo->prepare("SELECT placa FROM camiones WHERE id = ? AND deleted_at IS NULL");
    $stmt->execute([$camion_id]);
    $camion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$camion) {
        throw new Exception('Camión no encontrado');
    }
    
    // Verificar límite de fotos por camión (máximo 3)
    $count_stmt = $pdo->prepare("SELECT COUNT(*) FROM camion_fotos WHERE camion_id = ?");
    $count_stmt->execute([$camion_id]);
    $total_fotos = $count_stmt->fetchColumn();
    
    if ($total_fotos >= 3) {
        throw new Exception('Máximo 3 fotos por camión. Elimine una foto existente primero.');
    }
    
    // Crear directorio de uploads si no existe
    $upload_dir = ensureUploadDirectory('camiones');
    
    // Generar nombre único para el archivo
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $unique_name = 'camion_' . $camion_id . '_' . time() . '_' . rand(1000, 9999) . '.' . $file_extension;
    $file_path = $upload_dir . '/' . $unique_name;
    $relative_path = '/api/uploads/camiones/' . $unique_name;
    
    // Mover archivo
    if (!move_uploaded_file($file['tmp_name'], $file_path)) {
        throw new Exception('Error al guardar la imagen');
    }
    
    // Guardar información en base de datos
    $stmt = $pdo->prepare("
        INSERT INTO camion_fotos (
            camion_id, nombre_archivo, ruta_archivo, tipo_foto, 
            tamaño_archivo, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $camion_id,
        $unique_name,
        $relative_path,
        $tipo_foto,
        $file['size'],
        $_SESSION['user_id']
    ]);
    
    $foto_id = $pdo->lastInsertId();
    
    // Obtener la foto recién creada
    $foto_stmt = $pdo->prepare("
        SELECT cf.*, u.nombre_completo as uploaded_by_name
        FROM camion_fotos cf
        LEFT JOIN usuarios u ON cf.created_by = u.id
        WHERE cf.id = ?
    ");
    $foto_stmt->execute([$foto_id]);
    $foto_info = $foto_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Log de actividad
    $log_stmt = $pdo->prepare("
        INSERT INTO logs_actividad (
            user_id, accion, modulo, descripcion, created_at
        ) VALUES (?, 'UPLOAD', 'CAMIONES', ?, NOW())
    ");
    $log_stmt->execute([
        $_SESSION['user_id'],
        "Foto subida para camión: {$camion['placa']} - Tipo: {$tipo_foto}"
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Foto subida exitosamente',
        'data' => $foto_info
    ]);

} catch (Exception $e) {
    // Eliminar archivo si se subió pero hubo error en BD
    if (isset($file_path) && file_exists($file_path)) {
        unlink($file_path);
    }
    
    error_log("Error subiendo foto de camión: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>