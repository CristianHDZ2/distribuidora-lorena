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
    if ($usuarioId != $_SESSION['user_id'] && $_SESSION['user_tipo'] !== 'administrador') {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes permisos para ver datos de otro usuario']);
        exit;
    }
    
    $conexion = obtenerConexion();
    
    // Obtener datos básicos del usuario
    $stmt = $conexion->prepare("
        SELECT 
            u.id,
            u.dui,
            u.nombre,
            u.apellido,
            CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
            u.telefono,
            u.email,
            u.tipo_usuario,
            u.estado,
            u.foto_perfil,
            DATE_FORMAT(u.fecha_creacion, '%d/%m/%Y %H:%i') as fecha_creacion_formato,
            DATE_FORMAT(u.fecha_modificacion, '%d/%m/%Y %H:%i') as fecha_modificacion_formato,
            DATE_FORMAT(u.ultimo_acceso, '%d/%m/%Y %H:%i') as ultimo_acceso_formato,
            CASE 
                WHEN u.ultimo_acceso IS NULL THEN 'Nunca'
                WHEN u.ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 'En línea'
                WHEN u.ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Hoy'
                WHEN u.ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Esta semana'
                ELSE 'Hace tiempo'
            END as estado_conexion,
            creador.nombre as creado_por_nombre,
            modificador.nombre as modificado_por_nombre
        FROM usuarios u
        LEFT JOIN usuarios creador ON u.creado_por = creador.id
        LEFT JOIN usuarios modificador ON u.modificado_por = modificador.id
        WHERE u.id = ?
    ");
    $stmt->execute([$usuarioId]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }
    
    // Obtener estadísticas del usuario (solo si es despachador)
    $estadisticas = null;
    if ($usuario['tipo_usuario'] === 'despachador') {
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
    }
    
    // Obtener actividad reciente del usuario
    $actividadReciente = [];
    
    // Despachos recientes
    $stmt = $conexion->prepare("
        SELECT 
            'despacho' as tipo,
            CONCAT('Despacho #', d.id, ' - Ruta: ', r.nombre) as descripcion,
            d.fecha_salida as fecha,
            d.estado
        FROM despachos d
        JOIN rutas r ON d.ruta_id = r.id
        WHERE d.usuario_id = ?
        ORDER BY d.fecha_salida DESC
        LIMIT 5
    ");
    $stmt->execute([$usuarioId]);
    $actividadReciente = array_merge($actividadReciente, $stmt->fetchAll(PDO::FETCH_ASSOC));
    
    // Movimientos de inventario (si es administrador)
    if ($usuario['tipo_usuario'] === 'administrador') {
        $stmt = $conexion->prepare("
            SELECT 
                'inventario' as tipo,
                CONCAT(mi.tipo_movimiento, ' - ', p.nombre) as descripcion,
                mi.fecha_movimiento as fecha,
                'completado' as estado
            FROM movimientos_inventario mi
            JOIN productos p ON mi.producto_id = p.id
            WHERE mi.usuario_id = ?
            ORDER BY mi.fecha_movimiento DESC
            LIMIT 3
        ");
        $stmt->execute([$usuarioId]);
        $actividadReciente = array_merge($actividadReciente, $stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    
    // Ordenar actividad por fecha
    usort($actividadReciente, function($a, $b) {
        return strtotime($b['fecha']) - strtotime($a['fecha']);
    });
    
    // Formatear fechas de actividad
    foreach ($actividadReciente as &$actividad) {
        $actividad['fecha_formato'] = date('d/m/Y H:i', strtotime($actividad['fecha']));
    }
    
    // URL de la foto si existe
    $urlFoto = null;
    if ($usuario['foto_perfil']) {
        $urlFoto = '/api/uploads/usuarios/' . $usuario['foto_perfil'];
    }
    
    echo json_encode([
        'success' => true,
        'usuario' => $usuario,
        'estadisticas' => $estadisticas,
        'actividad_reciente' => array_slice($actividadReciente, 0, 8),
        'url_foto' => $urlFoto
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>