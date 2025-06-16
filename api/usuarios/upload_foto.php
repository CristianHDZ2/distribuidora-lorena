<?php
require_once '../config/database.php';
require_once '../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar sesión
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {
    // Verificar que se envió un archivo
    if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No se recibió ningún archivo válido']);
        exit;
    }
    
    $usuarioId = $_POST['usuario_id'] ?? null;
    
    // Verificar que se proporcionó el ID del usuario
    if (!$usuarioId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de usuario requerido']);
        exit;
    }
    
    // Solo administradores pueden subir fotos de otros usuarios
    if ($usuarioId != $_SESSION['user_id'] && $_SESSION['user_tipo'] !== 'administrador') {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes permisos para subir foto de otro usuario']);
        exit;
    }
    
    $conexion = obtenerConexion();
    
    // Verificar que el usuario existe
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->execute([$usuarioId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }
    
    $archivo = $_FILES['foto'];
    $nombreArchivo = $archivo['name'];
    $tipoArchivo = $archivo['type'];
    $tamañoArchivo = $archivo['size'];
    $archivoTemporal = $archivo['tmp_name'];
    
    // Validaciones del archivo
    $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!in_array($tipoArchivo, $tiposPermitidos)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de archivo no permitido. Solo se permiten JPG, JPEG y PNG']);
        exit;
    }
    
    // Tamaño máximo: 5MB
    $tamañoMaximo = 5 * 1024 * 1024; // 5MB en bytes
    if ($tamañoArchivo > $tamañoMaximo) {
        http_response_code(400);
        echo json_encode(['error' => 'El archivo es demasiado grande. Máximo 5MB']);
        exit;
    }
    
    // Verificar que es una imagen válida
    $infoImagen = getimagesize($archivoTemporal);
    if ($infoImagen === false) {
        http_response_code(400);
        echo json_encode(['error' => 'El archivo no es una imagen válida']);
        exit;
    }
    
    // Crear directorio si no existe
    $directorioUploads = '../uploads/usuarios/';
    if (!file_exists($directorioUploads)) {
        if (!mkdir($directorioUploads, 0755, true)) {
            throw new Exception('No se pudo crear el directorio de uploads');
        }
    }
    
    // Generar nombre único para el archivo
    $extension = pathinfo($nombreArchivo, PATHINFO_EXTENSION);
    $nombreFinal = $usuarioId . '_' . time() . '.' . $extension;
    $rutaCompleta = $directorioUploads . $nombreFinal;
    
    // Eliminar foto anterior si existe
    $stmt = $conexion->prepare("SELECT foto_perfil FROM usuarios WHERE id = ?");
    $stmt->execute([$usuarioId]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($usuario && $usuario['foto_perfil']) {
        $fotoAnterior = $directorioUploads . $usuario['foto_perfil'];
        if (file_exists($fotoAnterior)) {
            unlink($fotoAnterior);
        }
    }
    
    // Mover archivo subido
    if (move_uploaded_file($archivoTemporal, $rutaCompleta)) {
        // Redimensionar imagen si es necesario
        redimensionarImagen($rutaCompleta, 300, 300);
        
        // Actualizar base de datos
        $stmt = $conexion->prepare("
            UPDATE usuarios 
            SET foto_perfil = ?, fecha_modificacion = NOW() 
            WHERE id = ?
        ");
        $resultado = $stmt->execute([$nombreFinal, $usuarioId]);
        
        if ($resultado) {
            echo json_encode([
                'success' => true,
                'message' => 'Foto subida exitosamente',
                'foto_perfil' => $nombreFinal,
                'url_foto' => '/api/uploads/usuarios/' . $nombreFinal
            ]);
        } else {
            // Si falla la BD, eliminar archivo
            unlink($rutaCompleta);
            throw new Exception('Error al actualizar la base de datos');
        }
    } else {
        throw new Exception('Error al subir el archivo');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}

function redimensionarImagen($rutaArchivo, $anchoMax, $altoMax) {
    $infoImagen = getimagesize($rutaArchivo);
    $ancho = $infoImagen[0];
    $alto = $infoImagen[1];
    $tipo = $infoImagen[2];
    
    // Si la imagen ya es más pequeña, no redimensionar
    if ($ancho <= $anchoMax && $alto <= $altoMax) {
        return;
    }
    
    // Calcular nuevas dimensiones manteniendo proporción
    $ratio = min($anchoMax / $ancho, $altoMax / $alto);
    $nuevoAncho = intval($ancho * $ratio);
    $nuevoAlto = intval($alto * $ratio);
    
    // Crear imagen desde archivo según el tipo
    switch ($tipo) {
        case IMAGETYPE_JPEG:
            $imagenOriginal = imagecreatefromjpeg($rutaArchivo);
            break;
        case IMAGETYPE_PNG:
            $imagenOriginal = imagecreatefrompng($rutaArchivo);
            break;
        default:
            return; // Tipo no soportado
    }
    
    // Crear nueva imagen redimensionada
    $imagenNueva = imagecreatetruecolor($nuevoAncho, $nuevoAlto);
    
    // Preservar transparencia para PNG
    if ($tipo == IMAGETYPE_PNG) {
        imagealphablending($imagenNueva, false);
        imagesavealpha($imagenNueva, true);
        $transparente = imagecolorallocatealpha($imagenNueva, 255, 255, 255, 127);
        imagefill($imagenNueva, 0, 0, $transparente);
    }
    
    // Redimensionar
    imagecopyresampled($imagenNueva, $imagenOriginal, 0, 0, 0, 0, $nuevoAncho, $nuevoAlto, $ancho, $alto);
    
    // Guardar imagen redimensionada
    switch ($tipo) {
        case IMAGETYPE_JPEG:
            imagejpeg($imagenNueva, $rutaArchivo, 85);
            break;
        case IMAGETYPE_PNG:
            imagepng($imagenNueva, $rutaArchivo, 6);
            break;
    }
    
    // Liberar memoria
    imagedestroy($imagenOriginal);
    imagedestroy($imagenNueva);
}
?>