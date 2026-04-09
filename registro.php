<?php
error_reporting(0); // Evitar que advertencias rompan el JSON
header('Content-Type: application/json');

try {
    require_once 'db.php';

    // Obtener datos del POST (JSON)
    $inputRaw = file_get_contents('php://input');
    $data = json_decode($inputRaw, true);

    if (!$data) {
        throw new Exception('No se recibieron datos JSON válidos.');
    }

    $nombre   = mysqli_real_escape_string($conn, $data['name']);
    $apellido = mysqli_real_escape_string($conn, $data['surname']);
    $email    = mysqli_real_escape_string($conn, $data['email']);
    $whatsapp = mysqli_real_escape_string($conn, $data['whatsapp']);
    $pass     = $data['password'];

    if (empty($nombre) || empty($apellido) || empty($email) || empty($whatsapp) || empty($pass)) {
        throw new Exception('Todos los campos son obligatorios.');
    }

    // 1. Verificar si ya existe
    $check = mysqli_query($conn, "SELECT id FROM clientes WHERE email = '$email' OR whatsapp = '$whatsapp'");
    if (!$check) { throw new Exception('Error comprobando duplicados: ' . mysqli_error($conn)); }
    if (mysqli_num_rows($check) > 0) {
        echo json_encode(['error' => 'El email o WhatsApp ya se encuentran registrados.']);
        exit;
    }

    // 2. Encriptar contraseña y generar código
    $hashedPass = password_hash($pass, PASSWORD_DEFAULT);
    $code       = strval(rand(1000, 9999));

    // 3. Insertar en base de datos
    $sql = "INSERT INTO clientes (nombre, apellido, email, whatsapp, password, codigo_verificacion, id_validado) 
            VALUES ('$nombre', '$apellido', '$email', '$whatsapp', '$hashedPass', '$code', 0)";

    if (mysqli_query($conn, $sql)) {
        
        // 4. Enviar Email
        $to      = $email;
        $subject = "Tu código de verificación - Miriam Schild";
        $remitente = "info@miriamschild.com.ar";

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: "Miriam Schild" <' . $remitente . '>' . "\r\n";
        $headers .= 'Reply-To: ' . $remitente . "\r\n";

        $message = "
            <div style='font-family: Arial, sans-serif; text-align: center; padding: 20px;'>
              <h2 style='color: #2957a4;'>¡Hola $nombre!</h2>
              <p>Tu código para activar tu cuenta es:</p>
              <h1 style='color: #63a995; font-size: 36px;'>$code</h1>
            </div>";

        // Proteger en caso de que la función mail() esté desactivada por DonWeb
        if (function_exists('mail')) {
            $mail_enviado = @mail($to, $subject, $message, $headers, "-f" . $remitente);
            if ($mail_enviado) {
                echo json_encode(['message' => 'Registrado. Revisa tu Email.', 'email' => $email]);
            } else {
                echo json_encode(['error' => 'Registro exitoso, pero ocurrió un problema al enviar el email. Comprueba en tu carpeta de SPAM o notifícanos.']);
            }
        } else {
             echo json_encode(['error' => 'Registro exitoso, pero tu servidor DonWeb tiene bloqueada la función de envío de correos (mail disabled).']);
        }

    } else {
        throw new Exception('Error al insertar en la base de datos: ' . mysqli_error($conn));
    }

} catch (Exception $e) {
    echo json_encode(['error' => 'Error 500 capturado: ' . $e->getMessage()]);
}
?>
