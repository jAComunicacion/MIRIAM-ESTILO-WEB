<?php
// MODO DE DEPURACIÓN APAGADO (Para evitar romper respuestas JSON con Warnings)
error_reporting(0);
ini_set('display_errors', 0);

// Permitir que si DonWeb lanza un error crudo, lo devuelva en formato JSON
header('Content-Type: application/json; charset=utf-8');

try {
    require_once 'db.php';

    // Obtener datos del POST (Cambiado a clásico para evitar bloqueo Firewall)
    $data = $_POST;
    if (empty($data) || empty($data['name'])) {
        $inputRaw = file_get_contents('php://input');
        $data = json_decode($inputRaw, true);
    }

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
        // 4. Enviar Email usando PHPMailer (Autenticado para asegurar entrega en Ferozo)
        require_once 'lib/PHPMailer/Exception.php';
        require_once 'lib/PHPMailer/PHPMailer.php';
        require_once 'lib/PHPMailer/SMTP.php';

        $to      = $email;
        $subject = "Tu código de verificación - Miriam Schild";
        $remitente = "info@miriamschild.com.ar"; // Debe existir

        $message = "
            <div style='font-family: Arial, sans-serif; text-align: center; padding: 20px;'>
              <h2 style='color: #2957a4;'>¡Hola $nombre!</h2>
              <p>Tu código para activar tu cuenta es:</p>
              <h1 style='color: #63a995; font-size: 36px; letter-spacing: 5px;'>$code</h1>
              <p>Puedes regresar a la ventana y escribir este código.</p>
            </div>";

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        try {
            $mail->isSMTP();
            // Truco para servidores DonWeb/Ferozo: Conectar internamente a localhost evita bloqueos de IP
            $mail->Host       = 'localhost';          
            $mail->SMTPAuth   = true;                                   
            $mail->Username   = $remitente;               
            // Autenticación SMTP de la cuenta info@miriamschild.com.ar
            $mail->Password   = 'Lavanda/2026'; 
            
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS; // O 'ssl'           
            $mail->Port       = 465;                                    
            $mail->CharSet    = 'UTF-8';

            // Desactivar la verificación de certificado SSL local (Vital en servidores compartidos DonWeb)
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );

            $mail->setFrom($remitente, 'Miriam Schild Fragancias');
            $mail->addAddress($to);

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $message;

            $mail->send();
            echo json_encode(['message' => 'Registrado con éxito. Revisa tu email.', 'email' => $email]);
        } catch (Exception $e) {
            // Falló el envío SMTP pero el cliente se guardó en BD.
            // Lo enviamos como 'message' en vez de 'error' para que login.js NO bloquee el flujo y pase a la siguiente pantalla.
            echo json_encode([
                'message' => 'AVISO: El email falló, pero tu código es ' . $code . '.',
                'email' => $email
            ]);
        }
    } else {
        throw new Exception('Error al insertar en la base de datos: ' . mysqli_error($conn));
    }

} catch (Throwable $e) {
    echo json_encode(['error' => 'Error capturado: ' . $e->getMessage()]);
}
?>
