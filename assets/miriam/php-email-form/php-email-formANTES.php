<?php
// Configuración del destinatario
$to = 'julio38arg@gmail.com'; // Cambia esto por tu dirección de correo
$subject = 'Nuevo mensaje del formulario de contacto';

// Verifica que se haya enviado el formulario por POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Sanitiza y valida los datos
  $name = strip_tags(trim($_POST["name"]));
  $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
  $message = trim($_POST["message"]);

  // Validación básica
  if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) {
    http_response_code(400);
    echo "Por favor completa todos los campos correctamente.";
    exit;
  }

  // Construye el cuerpo del mensaje
  $email_content = "Nombre: $name\n";
  $email_content .= "Email: $email\n\n";
  $email_content .= "Mensaje:\n$message\n";

  // Encabezados del correo
  $email_headers = "From: $name <$email>";

  // Envía el correo
  if (mail($to, $subject, $email_content, $email_headers)) {
    http_response_code(200);
    echo "¡Gracias! Tu mensaje ha sido enviado.";
  } else {
    http_response_code(500);
    echo "Lo sentimos, hubo un error al enviar tu mensaje.";
  }
} else {
  http_response_code(403);
  echo "Hubo un problema con el envío. Intenta nuevamente.";
  //
  * Requires the "PHP Email Form" library
  * The "PHP Email Form" library is available only in the pro version of the template
  * The library should be uploaded to: vendor/php-email-form/php-email-form.php
  * For more info and help: https://bootstrapmade.com/php-email-form/
  

  // Replace

}
?>

