-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.0.30 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para distribuidora_lorena
CREATE DATABASE IF NOT EXISTS `distribuidora_lorena` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `distribuidora_lorena`;

-- Volcando estructura para tabla distribuidora_lorena.camiones
CREATE TABLE IF NOT EXISTS `camiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `placa` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marca` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modelo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anio` int NOT NULL,
  `capacidad_carga` decimal(5,2) NOT NULL COMMENT 'Capacidad en toneladas',
  `tipo_combustible` enum('gasolina','diesel','gas_natural','electrico','hibrido') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'diesel',
  `estado` enum('activo','mantenimiento','inactivo','reparacion') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `placa` (`placa`),
  KEY `idx_placa` (`placa`),
  KEY `idx_estado` (`estado`),
  KEY `idx_marca` (`marca`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_deleted_at` (`deleted_at`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `deleted_by` (`deleted_by`),
  CONSTRAINT `camiones_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `camiones_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `camiones_ibfk_3` FOREIGN KEY (`deleted_by`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla principal para gestión de camiones de la distribuidora';

-- Volcando datos para la tabla distribuidora_lorena.camiones: ~5 rows (aproximadamente)
INSERT INTO `camiones` (`id`, `placa`, `marca`, `modelo`, `anio`, `capacidad_carga`, `tipo_combustible`, `estado`, `descripcion`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 'T001-123', 'Ford', 'F-150', 2020, 3.50, 'gasolina', 'activo', 'Camión principal para rutas urbanas', 1, NULL, NULL, '2025-06-17 18:20:32', '2025-06-17 18:20:32', NULL),
	(2, 'T002-456', 'Chevrolet', 'NPR', 2019, 5.00, 'diesel', 'activo', 'Camión para rutas de mayor capacidad', 1, NULL, NULL, '2025-06-17 18:20:32', '2025-06-17 18:20:32', NULL),
	(3, 'T003-789', 'Isuzu', 'NHR', 2021, 2.50, 'diesel', 'mantenimiento', 'En mantenimiento preventivo', 1, NULL, NULL, '2025-06-17 18:20:32', '2025-06-17 18:20:32', NULL),
	(4, 'T004-012', 'Toyota', 'Hilux', 2018, 1.50, 'diesel', 'activo', 'Camión para rutas pequeñas', 1, NULL, NULL, '2025-06-17 18:20:32', '2025-06-17 18:20:32', NULL),
	(5, 'T005-345', 'Mitsubishi', 'Canter', 2022, 4.00, 'diesel', 'inactivo', 'Camión de respaldo', 1, NULL, NULL, '2025-06-17 18:20:32', '2025-06-17 18:20:32', NULL);

-- Volcando estructura para tabla distribuidora_lorena.camion_fotos
CREATE TABLE IF NOT EXISTS `camion_fotos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `camion_id` int NOT NULL,
  `nombre_archivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruta_archivo` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_foto` enum('frontal','lateral','posterior','interior','general') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `tamaño_archivo` int NOT NULL COMMENT 'Tamaño en bytes',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_camion_foto` (`camion_id`,`nombre_archivo`),
  KEY `idx_camion_id` (`camion_id`),
  KEY `idx_tipo_foto` (`tipo_foto`),
  KEY `idx_created_at` (`created_at`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `camion_fotos_ibfk_1` FOREIGN KEY (`camion_id`) REFERENCES `camiones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `camion_fotos_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Almacena hasta 3 fotos por camión para documentación visual';

-- Volcando datos para la tabla distribuidora_lorena.camion_fotos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.camion_mantenimientos
CREATE TABLE IF NOT EXISTS `camion_mantenimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `camion_id` int NOT NULL,
  `tipo_mantenimiento` enum('preventivo','correctivo','revision','reparacion') COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `proximo_mantenimiento` date DEFAULT NULL,
  `realizado_por` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_camion_id` (`camion_id`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  KEY `idx_tipo_mantenimiento` (`tipo_mantenimiento`),
  KEY `idx_proximo_mantenimiento` (`proximo_mantenimiento`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `camion_mantenimientos_ibfk_1` FOREIGN KEY (`camion_id`) REFERENCES `camiones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `camion_mantenimientos_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de mantenimientos realizados a cada camión';

-- Volcando datos para la tabla distribuidora_lorena.camion_mantenimientos: ~3 rows (aproximadamente)
INSERT INTO `camion_mantenimientos` (`id`, `camion_id`, `tipo_mantenimiento`, `descripcion`, `costo`, `fecha_inicio`, `fecha_fin`, `proximo_mantenimiento`, `realizado_por`, `observaciones`, `created_by`, `created_at`) VALUES
	(1, 1, 'preventivo', 'Cambio de aceite y filtros', NULL, '2024-01-15', '2024-01-15', '2024-04-15', 'Taller Central', NULL, 1, '2025-06-17 18:20:32'),
	(2, 2, 'correctivo', 'Reparación de frenos', NULL, '2024-02-10', '2024-02-12', '2024-08-10', 'Taller Especializado', NULL, 1, '2025-06-17 18:20:32'),
	(3, 3, 'revision', 'Inspección general', NULL, '2024-03-01', '2024-03-01', '2024-09-01', 'Mecánico Interno', NULL, 1, '2025-06-17 18:20:32');

-- Volcando estructura para tabla distribuidora_lorena.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.categorias: ~5 rows (aproximadamente)
INSERT INTO `categorias` (`id`, `nombre`, `activa`, `fecha_creacion`) VALUES
	(1, 'Jugos', 1, '2025-06-16 18:31:41'),
	(2, 'Sodas', 1, '2025-06-16 18:31:41'),
	(3, 'Aguas', 1, '2025-06-16 18:31:41'),
	(4, 'Cervezas', 1, '2025-06-16 18:31:41'),
	(5, 'Energizantes', 1, '2025-06-16 18:31:41');

-- Volcando estructura para tabla distribuidora_lorena.despachos
CREATE TABLE IF NOT EXISTS `despachos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ruta_id` int NOT NULL,
  `fecha_despacho` date NOT NULL,
  `salida_registrada` tinyint(1) DEFAULT '0',
  `recarga_registrada` tinyint(1) DEFAULT '0',
  `retorno_registrado` tinyint(1) DEFAULT '0',
  `confirmado` tinyint(1) DEFAULT '0',
  `total_venta` decimal(10,2) DEFAULT '0.00',
  `descuento_total` decimal(8,2) DEFAULT '0.00',
  `tipo_descuento` enum('porcentaje','dinero','ninguno') COLLATE utf8mb4_unicode_ci DEFAULT 'ninguno',
  `usuario_id` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_confirmacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ruta_id` (`ruta_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_despachos_fecha` (`fecha_despacho`),
  CONSTRAINT `despachos_ibfk_1` FOREIGN KEY (`ruta_id`) REFERENCES `rutas` (`id`),
  CONSTRAINT `despachos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.despachos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.detalle_despacho
CREATE TABLE IF NOT EXISTS `detalle_despacho` (
  `id` int NOT NULL AUTO_INCREMENT,
  `despacho_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad_salida` decimal(8,2) DEFAULT '0.00',
  `cantidad_recarga` decimal(8,2) DEFAULT '0.00',
  `cantidad_retorno` decimal(8,2) DEFAULT '0.00',
  `cantidad_vendida` decimal(8,2) DEFAULT '0.00',
  `precio_venta_unitario` decimal(8,2) NOT NULL,
  `precio_venta_especial` decimal(8,2) DEFAULT NULL,
  `cantidad_precio_especial` decimal(8,2) DEFAULT '0.00',
  `descuento_unitario` decimal(8,2) DEFAULT '0.00',
  `tipo_descuento_unitario` enum('porcentaje','dinero','ninguno') COLLATE utf8mb4_unicode_ci DEFAULT 'ninguno',
  `subtotal` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `despacho_id` (`despacho_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_despacho_ibfk_1` FOREIGN KEY (`despacho_id`) REFERENCES `despachos` (`id`),
  CONSTRAINT `detalle_despacho_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.detalle_despacho: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.detalle_factura
CREATE TABLE IF NOT EXISTS `detalle_factura` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factura_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` decimal(8,2) NOT NULL,
  `precio_compra_unitario` decimal(8,2) NOT NULL,
  `precio_venta_unitario` decimal(8,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `devolucion_cantidad` decimal(8,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `factura_id` (`factura_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_factura_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`),
  CONSTRAINT `detalle_factura_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.detalle_factura: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.facturas
CREATE TABLE IF NOT EXISTS `facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_factura` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proveedor_id` int NOT NULL,
  `fecha_factura` date NOT NULL,
  `total_factura` decimal(10,2) DEFAULT '0.00',
  `usuario_id` int NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_factura` (`numero_factura`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.facturas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.grupos_productos
CREATE TABLE IF NOT EXISTS `grupos_productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.grupos_productos: ~2 rows (aproximadamente)
INSERT INTO `grupos_productos` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES
	(1, 'Big Cola', 1, '2025-06-16 18:31:41'),
	(2, 'Otros Productos', 1, '2025-06-16 18:31:41');

-- Volcando estructura para tabla distribuidora_lorena.logs_actividad
CREATE TABLE IF NOT EXISTS `logs_actividad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `accion` enum('CREATE','UPDATE','DELETE','VIEW','LOGIN','LOGOUT','UPLOAD','DOWNLOAD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `modulo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_accion` (`accion`),
  KEY `idx_modulo` (`modulo`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `logs_actividad_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.logs_actividad: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.motoristas
CREATE TABLE IF NOT EXISTS `motoristas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dui` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_licencia` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_licencia` enum('Liviana','Pesada','Particular') COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dui` (`dui`),
  UNIQUE KEY `numero_licencia` (`numero_licencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.motoristas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.movimientos_inventario
CREATE TABLE IF NOT EXISTS `movimientos_inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_movimiento` enum('entrada','salida') COLLATE utf8mb4_unicode_ci NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` decimal(8,2) NOT NULL,
  `precio_unitario` decimal(8,2) NOT NULL,
  `factura_id` int DEFAULT NULL,
  `despacho_id` int DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `usuario_id` int NOT NULL,
  `fecha_movimiento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  KEY `factura_id` (`factura_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_movimientos_fecha` (`fecha_movimiento`),
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`),
  CONSTRAINT `movimientos_inventario_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.movimientos_inventario: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('stock_bajo','stock_intermedio','general') COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notificaciones_usuario` (`usuario_id`,`leida`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.notificaciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medida` enum('ml','litros','galones') COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria_id` int NOT NULL,
  `proveedor_id` int NOT NULL,
  `grupo_id` int NOT NULL,
  `propietario` enum('Lorena Campos','Francisco Pineda') COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidades_por_paquete` int NOT NULL,
  `precio_compra` decimal(8,2) DEFAULT '0.00',
  `precio_venta` decimal(8,2) DEFAULT '0.00',
  `stock_actual` decimal(8,2) DEFAULT '0.00',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `grupo_id` (`grupo_id`),
  KEY `idx_productos_stock` (`stock_actual`),
  KEY `idx_productos_activo` (`activo`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `productos_ibfk_3` FOREIGN KEY (`grupo_id`) REFERENCES `grupos_productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.productos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.productos_ruta
CREATE TABLE IF NOT EXISTS `productos_ruta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ruta_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `seleccionado` tinyint(1) DEFAULT '1',
  `fecha_ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ruta_producto` (`ruta_id`,`producto_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `productos_ruta_ibfk_1` FOREIGN KEY (`ruta_id`) REFERENCES `rutas` (`id`),
  CONSTRAINT `productos_ruta_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.productos_ruta: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.proveedores
CREATE TABLE IF NOT EXISTS `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.proveedores: ~2 rows (aproximadamente)
INSERT INTO `proveedores` (`id`, `nombre`, `telefono`, `direccion`, `activo`, `fecha_creacion`) VALUES
	(1, 'ECONORED S.A de C.V', '2200-0000', 'San Salvador', 1, '2025-06-16 18:31:41'),
	(2, 'DIZASA S.A de C.V', '2200-0001', 'San Salvador', 1, '2025-06-16 18:31:41');

-- Volcando estructura para tabla distribuidora_lorena.rutas
CREATE TABLE IF NOT EXISTS `rutas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_ruta` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lugar_recorrido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `grupo_productos` enum('Big Cola','Otros Productos') COLLATE utf8mb4_unicode_ci NOT NULL,
  `camion_id` int DEFAULT NULL,
  `motorista_id` int DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_ruta` (`numero_ruta`),
  KEY `camion_id` (`camion_id`),
  KEY `motorista_id` (`motorista_id`),
  CONSTRAINT `rutas_ibfk_1` FOREIGN KEY (`camion_id`) REFERENCES `camiones` (`id`),
  CONSTRAINT `rutas_ibfk_2` FOREIGN KEY (`motorista_id`) REFERENCES `motoristas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.rutas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla distribuidora_lorena.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo_electronico` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dui` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_usuario` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `tipo_usuario` enum('administrador','despachador') COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo_electronico` (`correo_electronico`),
  UNIQUE KEY `dui` (`dui`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla distribuidora_lorena.usuarios: ~2 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nombre_completo`, `correo_electronico`, `dui`, `nombre_usuario`, `password`, `telefono`, `direccion`, `tipo_usuario`, `foto`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(1, 'Administrador Sistema', 'admin@distribuidora.com', '12345678-9', '123456789', '$2y$10$0m5uzRP6F45mWu0XWROJEe2LE9xM3ak0cRxdIvz..0gd8Utj1GyBO', '7000-0000', 'San Salvador', 'administrador', NULL, 1, '2025-06-16 18:31:41', '2025-06-17 18:01:32'),
	(2, 'Despachador Sistema', 'despachador@distribuidora.com', '98765432-1', '987654321', '$2y$10$0m5uzRP6F45mWu0XWROJEe2LE9xM3ak0cRxdIvz..0gd8Utj1GyBO', '7000-0001', 'San Salvador', 'despachador', NULL, 1, '2025-06-16 18:31:41', '2025-06-16 22:04:50');

-- Volcando estructura para vista distribuidora_lorena.vista_estadisticas_camiones
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_estadisticas_camiones` (
	`total_camiones` BIGINT(19) NOT NULL,
	`camiones_activos` DECIMAL(23,0) NULL,
	`en_mantenimiento` DECIMAL(23,0) NULL,
	`en_reparacion` DECIMAL(23,0) NULL,
	`inactivos` DECIMAL(23,0) NULL,
	`capacidad_total` DECIMAL(27,2) NULL,
	`marcas_diferentes` BIGINT(19) NOT NULL
) ENGINE=MyISAM;

-- Volcando estructura para disparador distribuidora_lorena.actualizar_precio_venta
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `actualizar_precio_venta` BEFORE INSERT ON `detalle_factura` FOR EACH ROW BEGIN
    DECLARE nuevo_precio_venta DECIMAL(8,2);
    SET nuevo_precio_venta = NEW.precio_compra_unitario * 1.10;
    SET NEW.precio_venta_unitario = nuevo_precio_venta;
    
    UPDATE productos 
    SET precio_compra = NEW.precio_compra_unitario,
        precio_venta = nuevo_precio_venta
    WHERE id = NEW.producto_id;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador distribuidora_lorena.actualizar_stock_entrada
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `actualizar_stock_entrada` AFTER INSERT ON `movimientos_inventario` FOR EACH ROW BEGIN
    IF NEW.tipo_movimiento = 'entrada' THEN
        UPDATE productos 
        SET stock_actual = stock_actual + NEW.cantidad 
        WHERE id = NEW.producto_id;
    ELSEIF NEW.tipo_movimiento = 'salida' THEN
        UPDATE productos 
        SET stock_actual = stock_actual - NEW.cantidad 
        WHERE id = NEW.producto_id;
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para vista distribuidora_lorena.vista_estadisticas_camiones
-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_estadisticas_camiones`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_estadisticas_camiones` AS select count(0) AS `total_camiones`,sum((case when (`camiones`.`estado` = 'activo') then 1 else 0 end)) AS `camiones_activos`,sum((case when (`camiones`.`estado` = 'mantenimiento') then 1 else 0 end)) AS `en_mantenimiento`,sum((case when (`camiones`.`estado` = 'reparacion') then 1 else 0 end)) AS `en_reparacion`,sum((case when (`camiones`.`estado` = 'inactivo') then 1 else 0 end)) AS `inactivos`,sum(`camiones`.`capacidad_carga`) AS `capacidad_total`,count(distinct `camiones`.`marca`) AS `marcas_diferentes` from `camiones` where (`camiones`.`deleted_at` is null);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
