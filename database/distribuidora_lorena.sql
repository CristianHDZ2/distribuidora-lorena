-- Base de datos: distribuidora_lorena
CREATE DATABASE IF NOT EXISTS distribuidora_lorena CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE distribuidora_lorena;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    dui VARCHAR(10) UNIQUE NOT NULL,
    nombre_usuario VARCHAR(9) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    direccion TEXT,
    tipo_usuario ENUM('administrador', 'despachador') NOT NULL,
    foto VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de motoristas
CREATE TABLE motoristas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    dui VARCHAR(10) UNIQUE NOT NULL,
    numero_licencia VARCHAR(20) UNIQUE NOT NULL,
    tipo_licencia ENUM('Liviana', 'Pesada', 'Particular') NOT NULL,
    telefono VARCHAR(15),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de camiones
CREATE TABLE camiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_placa VARCHAR(10) UNIQUE NOT NULL,
    foto1 VARCHAR(255),
    foto2 VARCHAR(255),
    foto3 VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de rutas
CREATE TABLE rutas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_ruta VARCHAR(20) UNIQUE NOT NULL,
    lugar_recorrido TEXT NOT NULL,
    grupo_productos ENUM('Big Cola', 'Otros Productos') NOT NULL,
    camion_id INT,
    motorista_id INT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (camion_id) REFERENCES camiones(id),
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id)
);

-- Tabla de categorías
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de grupos de productos
CREATE TABLE grupos_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    medida ENUM('ml', 'litros', 'galones') NOT NULL,
    categoria_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    grupo_id INT NOT NULL,
    propietario ENUM('Lorena Campos', 'Francisco Pineda') NOT NULL,
    unidades_por_paquete INT NOT NULL,
    precio_compra DECIMAL(8,2) DEFAULT 0.00,
    precio_venta DECIMAL(8,2) DEFAULT 0.00,
    stock_actual DECIMAL(8,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (grupo_id) REFERENCES grupos_productos(id)
);

-- Tabla de facturas
CREATE TABLE facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id INT NOT NULL,
    fecha_factura DATE NOT NULL,
    total_factura DECIMAL(10,2) DEFAULT 0.00,
    usuario_id INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de movimientos de inventario
CREATE TABLE movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_movimiento ENUM('entrada', 'salida') NOT NULL,
    producto_id INT NOT NULL,
    cantidad DECIMAL(8,2) NOT NULL,
    precio_unitario DECIMAL(8,2) NOT NULL,
    factura_id INT NULL,
    despacho_id INT NULL,
    observaciones TEXT,
    usuario_id INT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de detalles de factura
CREATE TABLE detalle_factura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad DECIMAL(8,2) NOT NULL,
    precio_compra_unitario DECIMAL(8,2) NOT NULL,
    precio_venta_unitario DECIMAL(8,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    devolucion_cantidad DECIMAL(8,2) DEFAULT 0.00,
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla de despachos
CREATE TABLE despachos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruta_id INT NOT NULL,
    fecha_despacho DATE NOT NULL,
    salida_registrada BOOLEAN DEFAULT FALSE,
    recarga_registrada BOOLEAN DEFAULT FALSE,
    retorno_registrado BOOLEAN DEFAULT FALSE,
    confirmado BOOLEAN DEFAULT FALSE,
    total_venta DECIMAL(10,2) DEFAULT 0.00,
    descuento_total DECIMAL(8,2) DEFAULT 0.00,
    tipo_descuento ENUM('porcentaje', 'dinero', 'ninguno') DEFAULT 'ninguno',
    usuario_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP NULL,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de detalle de despacho
CREATE TABLE detalle_despacho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    despacho_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad_salida DECIMAL(8,2) DEFAULT 0.00,
    cantidad_recarga DECIMAL(8,2) DEFAULT 0.00,
    cantidad_retorno DECIMAL(8,2) DEFAULT 0.00,
    cantidad_vendida DECIMAL(8,2) DEFAULT 0.00,
    precio_venta_unitario DECIMAL(8,2) NOT NULL,
    precio_venta_especial DECIMAL(8,2) NULL,
    cantidad_precio_especial DECIMAL(8,2) DEFAULT 0.00,
    descuento_unitario DECIMAL(8,2) DEFAULT 0.00,
    tipo_descuento_unitario ENUM('porcentaje', 'dinero', 'ninguno') DEFAULT 'ninguno',
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (despacho_id) REFERENCES despachos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla de productos por ruta (recordar selección)
CREATE TABLE productos_ruta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruta_id INT NOT NULL,
    producto_id INT NOT NULL,
    seleccionado BOOLEAN DEFAULT TRUE,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    UNIQUE KEY unique_ruta_producto (ruta_id, producto_id)
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('stock_bajo', 'stock_intermedio', 'general') NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    usuario_id INT NULL, -- NULL significa para todos los usuarios
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Insertar categorías por defecto
INSERT INTO categorias (nombre) VALUES 
('Jugos'),
('Sodas'),
('Aguas'),
('Cervezas'),
('Energizantes');

-- Insertar proveedores por defecto
INSERT INTO proveedores (nombre, telefono, direccion) VALUES 
('ECONORED S.A de C.V', '2200-0000', 'San Salvador'),
('DIZASA S.A de C.V', '2200-0001', 'San Salvador');

-- Insertar grupos de productos por defecto
INSERT INTO grupos_productos (nombre) VALUES 
('Big Cola'),
('Otros Productos');

-- Insertar usuarios por defecto
INSERT INTO usuarios (nombre_completo, correo_electronico, dui, nombre_usuario, password, telefono, direccion, tipo_usuario) VALUES 
('Administrador Sistema', 'admin@distribuidora.com', '12345678-9', '123456789', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '7000-0000', 'San Salvador', 'administrador'),
('Despachador Sistema', 'despachador@distribuidora.com', '98765432-1', '987654321', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '7000-0001', 'San Salvador', 'despachador');

-- Crear índices para optimización
CREATE INDEX idx_productos_stock ON productos(stock_actual);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha_movimiento);
CREATE INDEX idx_despachos_fecha ON despachos(fecha_despacho);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);

-- Triggers para actualizar stock automáticamente
DELIMITER $$

CREATE TRIGGER actualizar_stock_entrada
AFTER INSERT ON movimientos_inventario
FOR EACH ROW
BEGIN
    IF NEW.tipo_movimiento = 'entrada' THEN
        UPDATE productos 
        SET stock_actual = stock_actual + NEW.cantidad 
        WHERE id = NEW.producto_id;
    ELSEIF NEW.tipo_movimiento = 'salida' THEN
        UPDATE productos 
        SET stock_actual = stock_actual - NEW.cantidad 
        WHERE id = NEW.producto_id;
    END IF;
END$$

CREATE TRIGGER actualizar_precio_venta
BEFORE INSERT ON detalle_factura
FOR EACH ROW
BEGIN
    DECLARE nuevo_precio_venta DECIMAL(8,2);
    SET nuevo_precio_venta = NEW.precio_compra_unitario * 1.10;
    SET NEW.precio_venta_unitario = nuevo_precio_venta;
    
    UPDATE productos 
    SET precio_compra = NEW.precio_compra_unitario,
        precio_venta = nuevo_precio_venta
    WHERE id = NEW.producto_id;
END$$

DELIMITER ;