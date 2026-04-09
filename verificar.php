<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['error' => 'No se recibieron datos.']);
    exit;
}

$email = mysqli_real_escape_string($conn, $data['email']);
$code  = mysqli_real_escape_string($conn, $data['codeEmail']);

// Buscar al cliente
$query = mysqli_query($conn, "SELECT id, codigo_verificacion FROM clientes WHERE email = '$email'");
$client = mysqli_fetch_assoc($query);

if (!$client) {
    echo json_encode(['error' => 'Cliente no encontrado.']);
    exit;
}

// Validar código
if ($client['codigo_verificacion'] === $code) {
    // Activar cuenta
    mysqli_query($conn, "UPDATE clientes SET id_validado = 1, codigo_verificacion = NULL WHERE email = '$email'");
    
    // Devolver datos del usuario (sin password)
    $res = mysqli_query($conn, "SELECT id, nombre, apellido, email, whatsapp FROM clientes WHERE email = '$email'");
    $userData = mysqli_fetch_assoc($res);
    
    echo json_encode(['message' => 'Cuenta activada', 'user' => $userData]);
} else {
    echo json_encode(['error' => 'Código incorrecto. Por favor revísalo en tu email.']);
}
?>
