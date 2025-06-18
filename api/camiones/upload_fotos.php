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

// Solo administradores pueden subir fotos
if ($usuario['tipo_usuario'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado. Solo administradores pueden subir fotos']);
    exit;
}

try {
    // Obtener ID del camión
    $camion_id = $_POST['camion_id'] ?? null;
    $posicion_foto = $_POST['posicion_foto'] ?? null; // foto1, foto2, foto3
    
    if (!$camion_id || !$posicion_foto) {
        http_response_code(400);
        echo json_encode(['error' => 'ID del camión y posición de foto requeridos']);
        exit;
    }

    // Validar posición de foto
    if (!in_array($posicion_foto, ['foto1', 'foto2', 'foto3'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Posición de foto inválida']);
        exit;
    }

    // Verificar que el camión existe
    $stmt = $pdo->prepare("SELECT id, numero_placa, {$posicion_foto} FROM camiones WHERE id = ?");
    $stmt->execute([$camion_id]);
    $camion = $stmt->fetch();

    if (!$camion) {
        http_response_code(404);
        echo json_encode(['error' => 'Camión no encontrado']);
        exit;
    }

    // Verificar que se subió un archivo
    if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No se subió ningún archivo o hubo un error']);
        exit;
    }

    $archivo = $_FILES['foto'];
    
    // Validar tipo de archivo
    $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!in_array($archivo['type'], $tiposPermitidos)) {
        http_response_code(400);
        echo json_encode(['error' => 'Solo se permiten archivos JPG, JPEG y PNG']);
        exit;
    }

    // Validar tamaño (máximo 5MB)
    $tamaximoMaximo = 5 * 1024 * 1024; // 5MB
    if ($archivo['size'] > $tamaximoMaximo) {
        http_response_code(400);
        echo json_encode(['error' => 'El archivo no puede superar 5MB']);
        exit;
    }

    // Crear directorio si no existe
    $directorioDestino = '../uploads/camiones/';
    if (!file_exists($directorioDestino)) {
        mkdir($directorioDestino, 0777, true);
    }

    // Generar nombre único para el archivo
    $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
    $nombreArchivo = "camion_{$camion_id}_{$posicion_foto}_" . time() . '.' . $extension;
    $rutaCompleta = $directorioDestino . $nombreArchivo;

    // Eliminar foto anterior si existe
    if (!empty($camion[$posicion_foto])) {
        $fotoAnterior = $directorioDestino . $camion[$posicion_foto];
        if (file_exists($fotoAnterior)) {
            unlink($fotoAnterior);
        }
    }

    // Mover archivo
    if (move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
        // Actualizar base de datos
        $stmt = $pdo->prepare("
            UPDATE camiones 
            SET {$posicion_foto} = ?, fecha_actualizacion = NOW()
            WHERE id = ?
        ");
        
        $resultado = $stmt->execute([$nombreArchivo, $camion_id]);
        
        if ($resultado) {
            // Obtener fotos actualizadas
            $stmt = $pdo->prepare("SELECT foto1, foto2, foto3 FROM camiones WHERE id = ?");
            $stmt->execute([$camion_id]);
            $fotos = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'message' => 'Foto subida exitosamente',
                'fotos' => $fotos,
                'foto_subida' => $nombreArchivo,
                'posicion' => $posicion_foto
            ]);
        } else {
            // Si falla la BD, eliminar archivo subido
            if (file_exists($rutaCompleta)) {
                unlink($rutaCompleta);
            }
            throw new Exception('Error al actualizar la base de datos');
        }
    } else {
        throw new Exception('Error al mover el archivo subido');
    }

} catch (Exception $e) {
    error_log("Error al subir foto: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>