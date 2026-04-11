<?php
// Configuración del destinatario
$to = 'info@miriamschild.com.ar';
$subject_base = 'Nuevo mensaje del formulario de contacto';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitiza y valida los datos
    $name = strip_tags(trim($_POST["name"] ?? ''));
    $email = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $subject = trim($_POST["subject"] ?? '');
    $message = trim($_POST["message"] ?? '');
    
    // Validación básica
    if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) {
        http_response_code(400);
        echo "Por favor completa todos los campos correctamente.";
        exit;
    }
    
    // Construye el cuerpo del mensaje
    $email_content = "Nombre: $name\n";
    $email_content .= "Email: $email\n";
    if (!empty($subject)) {
        $email_content .= "Asunto: $subject\n";
    }
    $email_content .= "\nMensaje:\n$message\n";
    
    // Encabezados del correo
    $email_headers = "From: $name <$email>";
    
    // Asunto completo (incluye asunto si se envió)
    $full_subject = empty($subject) ? $subject_base : $subject_base . " - " . $subject;
    
    // Envia Correo
    if (mail($to, $full_subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo "OK";
    } else {
        http_response_code(500);
        echo "Error: No se pudo enviar el email.";
    }
} else {
    http_response_code(403);
    echo "Prohibido";
}
?>