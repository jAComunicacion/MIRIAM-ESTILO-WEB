const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Helper config for mailing
const transporter = nodemailer.createTransport({
  host: 'mail.miriamschild.com.ar',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).send('Por favor completa todos los campos.');
    }

    await transporter.sendMail({
      from: `"Contacto Web - Miriam Schild" <${process.env.EMAIL_USER}>`,
      to: 'info@miriamschild.com.ar', // El destino original de contact.php
      replyTo: email,
      subject: `Nuevo mensaje: ${subject || 'Sin Asunto'}`,
      text: `Nombre: ${name}\nEmail: ${email}\nAsunto: ${subject}\n\nMensaje:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #2957a4;">Nuevo Mensaje de Contacto</h2>
          <p><strong>De:</strong> ${name} (${email})</p>
          <p><strong>Asunto:</strong> ${subject || 'Sin Asunto'}</p>
          <hr>
          <p><strong>Mensaje:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error enviando contacto:', error);
    res.status(500).send('Hubo un error al enviar el mensaje.');
  }
});

module.exports = router;
