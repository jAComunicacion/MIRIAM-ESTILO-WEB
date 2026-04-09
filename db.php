<?php
// Desactivar reporte de errores automáticos que rompen el JSON
error_reporting(0);

try {
    // Para PHP 8.1+ evitamos que mysqli lance excepciones fatales que causen error 500
    mysqli_report(MYSQLI_REPORT_OFF);

    // Configuración de la base de datos
    $dbhost = 'localhost';
    $dbuser = 'a0021142_miriam';
    $dbpass = 'kadugoZI13';
    $dbname = 'a0021142_miriam';

    // Crear conexión
    $conn = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);

    // Verificar conexión
    if (!$conn) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Error de conexión a la Base de Datos: ' . mysqli_connect_error()]);
        exit;
    }

    // Configurar caracteres UTF-8
    mysqli_set_charset($conn, "utf8");

} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Error Crítico en DB: ' . $e->getMessage()]);
    exit;
}
?>
