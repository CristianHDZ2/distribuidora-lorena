<?php
// Archivo: api/fix_users.php
// Script temporal para corregir los usuarios por defecto

require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Generar hash correcto para "Password"
    $password_hash = password_hash('Password', PASSWORD_DEFAULT);
    
    echo "Hash generado para 'Password': " . $password_hash . "\n\n";
    
    // Actualizar usuarios existentes
    $query = "UPDATE usuarios SET password = ? WHERE dui IN ('12345678-9', '98765432-1')";
    $stmt = $db->prepare($query);
    $result = $stmt->execute([$password_hash]);
    
    if ($result) {
        echo "✅ Usuarios actualizados correctamente\n";
        
        // Verificar usuarios
        $verify_query = "SELECT id, nombre_completo, dui, tipo_usuario FROM usuarios WHERE dui IN ('12345678-9', '98765432-1')";
        $verify_stmt = $db->prepare($verify_query);
        $verify_stmt->execute();
        $users = $verify_stmt->fetchAll();
        
        echo "\n📋 Usuarios en la base de datos:\n";
        foreach ($users as $user) {
            echo "- ID: {$user['id']}, Nombre: {$user['nombre_completo']}, DUI: {$user['dui']}, Tipo: {$user['tipo_usuario']}\n";
        }
        
        // Probar verificación de contraseña
        echo "\n🔐 Probando verificación de contraseña:\n";
        $test_password = 'Password';
        if (password_verify($test_password, $password_hash)) {
            echo "✅ Verificación de contraseña: CORRECTA\n";
        } else {
            echo "❌ Verificación de contraseña: FALLIDA\n";
        }
        
    } else {
        echo "❌ Error al actualizar usuarios\n";
    }
    
    $database->closeConnection();
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>