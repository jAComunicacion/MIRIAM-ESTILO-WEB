<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = $_POST;
if (empty($data) || empty($data['user'])) {
    $data = json_decode(file_get_contents('php://input'), true);
}

if (!$data) {
    echo json_encode(['error' => 'Ingresa tus credenciales.']);
    exit;
}

$user = mysqli_real_escape_string($conn, $data['user']); // Puede ser email o whatsapp
$pass = $data['pass'];

// Buscar cliente por email o whatsapp
$sql = "SELECT * FROM clientes WHERE email = '$user' OR whatsapp = '$user'";
$result = mysqli_query($conn, $sql);
$client = mysqli_fetch_assoc($result);

if (!$client) {
    echo json_encode(['error' => 'Credenciales inválidas.']);
    exit;
}

// Verificar si está validado
if ($client['id_validado'] == 0) {
    echo json_encode(['error' => 'Tu cuenta aún no fue verificada. Revisá tu email.']);
    exit;
}

// Verificar contraseña
if (password_verify($pass, $client['password'])) {
    unset($client['password']); // No enviar la clave al frontend
    echo json_encode(['message' => 'Bienvenido', 'user' => $client]);
} else {
    echo json_encode(['error' => 'Credenciales inválidas.']);
}
?>
