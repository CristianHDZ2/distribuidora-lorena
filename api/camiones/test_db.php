<?php
// Archivo temporal para probar la conexión
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "🔧 Iniciando prueba de conexión...<br>";

try {
    echo "📁 Intentando incluir database.php...<br>";
    require_once '../config/database.php';
    echo "✅ database.php incluido correctamente<br>";
    
    echo "🔗 Intentando crear instancia Database...<br>";
    $database = new Database();
    echo "✅ Instancia Database creada<br>";
    
    echo "🌐 Intentando conectar a BD...<br>";
    $pdo = $database->getConnection();
    echo "✅ Conexión a BD exitosa<br>";
    
    echo "📊 Probando consulta simple...<br>";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM camiones WHERE deleted_at IS NULL");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Consulta exitosa: " . $result['total'] . " camiones encontrados<br>";
    
    echo "🧹 Cerrando conexión...<br>";
    $database->closeConnection();
    echo "✅ Conexión cerrada<br>";
    
    echo "<h2>🎉 TODO FUNCIONA CORRECTAMENTE</h2>";
    echo "<p>El problema debe estar en otro lado. Revisar listar_camiones.php</p>";
    
} catch (Exception $e) {
    echo "<h2>❌ ERROR ENCONTRADO:</h2>";
    echo "<p style='color: red;'><strong>Mensaje:</strong> " . $e->getMessage() . "</p>";
    echo "<p style='color: red;'><strong>Archivo:</strong> " . $e->getFile() . "</p>";
    echo "<p style='color: red;'><strong>Línea:</strong> " . $e->getLine() . "</p>";
    echo "<p style='color: red;'><strong>Trace:</strong><br>" . nl2br($e->getTraceAsString()) . "</p>";
}
?>