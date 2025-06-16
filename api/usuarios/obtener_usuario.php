<?php
require_once '../config/database.php';
require_once '../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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
    $usuarioId = $_GET['id'] ?? null;
    
    if (!$usuarioId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de usuario requerido']);
        exit;
    }
    
    // Solo administradores pueden ver datos de otros usuarios
    if ($usuarioId != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'administrador') {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes permisos para ver datos de otro usuario']);
        exit;
    }
    
    $database = new Database();
    $conexion = $database->getConnection();
    
    // Obtener datos básicos del usuario
    $stmt = $conexion->prepare("
        SELECT 
            u.id,
            u.dui,
            u.nombre_completo,
            u.correo_electronico as email,
            u.telefono,
            u.direccion,
            u.tipo_usuario,
            CASE WHEN u.activo = 1 THEN 'activo' ELSE 'inactivo' END as estado,
            u.foto,
            DATE_FORMAT(u.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion_formato,
            DATE_FORMAT(u.fecha_actualizacion, '%d/%m/%Y %H:%i') as fecha_modificacion_formato,
            DATE_FORMAT(u.fecha_actualizacion, '%d/%m/%Y %H:%i') as ultimo_acceso_formato,
            CASE 
                WHEN u.fecha_actualizacion IS NULL THEN 'Nunca'
                WHEN u.fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 'En línea'
                WHEN u.fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Hoy'
                WHEN u.fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Esta semana'
                ELSE 'Hace tiempo'
            END as estado_conexion
        FROM usuarios u
        WHERE u.id = ?
    ");
    $stmt->execute([$usuarioId]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }
    
    // Separar nombre y apellido
    $nombreParts = explode(' ', $usuario['nombre_completo']);
    $usuario['nombre'] = $nombreParts[0];
    $usuario['apellido'] = implode(' ', array_slice($nombreParts, 1));
    $usuario['foto_perfil'] = $usuario['foto'];
    
    // Obtener estadísticas del usuario (solo si es despachador)
    $estadisticas = null;
    if ($usuario['tipo_usuario'] === 'despachador') {
        // Por ahora estadísticas básicas, cuando implementes despachos completar estas consultas
        $estadisticas = [
            'total_despachos' => 0,
            'despachos_completados' => 0,
            'despachos_hoy' => 0,
            'despachos_semana' => 0,
            'ventas_totales' => 0,
            'promedio_venta' => 0,
            'ultimo_despacho' => null,
            'ultimo_despacho_formato' => null
        ];
        
        // Cuando implementes la tabla despachos, descomenta esto:
        /*
        $stmt = $conexion->prepare("
            SELECT 
                COUNT(DISTINCT d.id) as total_despachos,
                COUNT(DISTINCT CASE WHEN d.estado = 'completado' THEN d.id END) as despachos_completados,
                COUNT(DISTINCT CASE WHEN DATE(d.fecha_salida) = CURDATE() THEN d.id END) as despachos_hoy,
                COUNT(DISTINCT CASE WHEN WEEK(d.fecha_salida) = WEEK(NOW()) THEN d.id END) as despachos_semana,
                COALESCE(SUM(CASE WHEN d.estado = 'completado' THEN d.total_venta END), 0) as ventas_totales,
                COALESCE(AVG(CASE WHEN d.estado = 'completado' THEN d.total_venta END), 0) as promedio_venta,
                MAX(d.fecha_salida) as ultimo_despacho
            FROM despachos d
            WHERE d.usuario_id = ?
        ");
        $stmt->execute([$usuarioId]);
        $estadisticas = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($estadisticas['ultimo_despacho']) {
            $estadisticas['ultimo_despacho_formato'] = date('d/m/Y H:i', strtotime($estadisticas['ultimo_despacho']));
        }
        */
    }
    
    // Obtener actividad reciente del usuario
    $actividadReciente = [];
    
    // Actividad de logs del sistema
    $stmt = $conexion->prepare("
        SELECT 
            'sistema' as tipo,
            CONCAT('Acción: ', action, ' - ', details) as descripcion,
            created_at as fecha,
            'completado' as estado
        FROM activity_logs
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$usuarioId]);
    $actividadReciente = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear fechas de actividad
    foreach ($actividadReciente as &$actividad) {
        $actividad['fecha_formato'] = date('d/m/Y H:i', strtotime($actividad['fecha']));
    }
    
    // URL de la foto si existe
    $urlFoto = null;
    if ($usuario['foto']) {
        $urlFoto = getFileUrl('usuarios/' . $usuario['foto']);
    }
    
    $database->closeConnection();
    
    echo json_encode([
        'success' => true,
        'usuario' => $usuario,
        'estadisticas' => $estadisticas,
        'actividad_reciente' => array_slice($actividadReciente, 0, 8),
        'url_foto' => $urlFoto
    ]);
    
} catch (Exception $e) {
    if (isset($database)) {
        $database->closeConnection();
    }
    logError("Error fetching user details: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>