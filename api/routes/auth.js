const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const Client  = require('../models/Client');

// ==========================================
// Helper: código aleatorio de 4 dígitos
// ==========================================
const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

// ==========================================
// Helper: envío de email COMPLETAMENTE ASÍNCRONO
// Se ejecuta DESPUÉS de haber respondido al cliente HTTP.
// Si el SMTP no responde, simplemente loguea y sigue sin bloquear.
// ==========================================
function enviarEmailAsync(emailDest, name, code) {
  setImmediate(() => {
    let nodemailer;
    try { nodemailer = require('nodemailer'); } catch (e) { return; }

    const transporter = nodemailer.createTransport({
      host:   'mail.miriamschild.com.ar',
      port:   465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 8000,
      greetingTimeout:   5000,
      socketTimeout:     8000
    });

    transporter.sendMail({
      from:    `"Miriam Schild Fragancias" <${process.env.EMAIL_USER}>`,
      to:      emailDest,
      subject: 'Tu código de verificación - Miriam Schild',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <img src="https://miriamschild.com.ar/assets/img/logo.png" alt="Miriam Schild" style="max-height: 50px;">
          <h2 style="color: #2957a4;">¡Hola ${name}!</h2>
          <p>Gracias por registrarte. Ingresa este código para activar tu cuenta:</p>
          <h1 style="color: #63a995; font-size: 36px; letter-spacing: 5px;">${code}</h1>
          <p>Si no fuiste tú, ignora este correo.</p>
        </div>
      `
    })
    .then(() => console.log(`✅ Email enviado a ${emailDest}`))
    .catch(err => console.warn(`⚠️  Email no enviado a ${emailDest}: ${err.message}`));
  });
}

// ==========================================
// POST /api/auth/register
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, surname, email, whatsapp, password } = req.body;

    if (!name || !surname || !email || !whatsapp || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const existing = await Client.findOne({ $or: [{ email }, { whatsapp }] });
    if (existing) {
      return res.status(400).json({ error: 'El email o WhatsApp ya se encuentran registrados.' });
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const code           = generateCode();

    await new Client({
      name, surname, email, whatsapp,
      password:         hashedPassword,
      isValidated:      false,
      verificationCode: code
    }).save();

    // ✅ Respondemos PRIMERO al cliente — el email va después en background
    res.status(201).json({ message: 'Registrado. Revisa tu Email.', email });

    // Email en background (no bloqueante, no afecta la respuesta ya enviada)
    if (!password.includes('CuentaGoogle')) {
      enviarEmailAsync(email, name, code);
    }

  } catch (error) {
    console.error('Error /register:', error.message);
    res.status(500).json({ error: 'Error del servidor al registrarse.' });
  }
});

// ==========================================
// POST /api/auth/verify
// ==========================================
router.post('/verify', async (req, res) => {
  try {
    const { email, codeEmail } = req.body;

    const client = await Client.findOne({ email });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado.' });

    if (!client.password.includes('CuentaGoogle')) {
      if (client.verificationCode !== codeEmail) {
        return res.status(400).json({ error: 'Código incorrecto. Por favor revísalo en tu email.' });
      }
    }

    client.isValidated      = true;
    client.verificationCode = null;
    await client.save();

    const { password, ...clientData } = client._doc;
    res.status(200).json({ message: 'Cuenta activada', user: clientData });

  } catch (e) {
    console.error('Error /verify:', e.message);
    res.status(500).json({ error: 'Falló la verificación del código.' });
  }
});

// ==========================================
// POST /api/auth/login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { user, pass } = req.body;

    if (!user || !pass) {
      return res.status(400).json({ error: 'Ingresa tu email/WhatsApp y contraseña.' });
    }

    const client = await Client.findOne({ $or: [{ email: user }, { whatsapp: user }] });
    if (!client) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    if (!client.isValidated) {
      return res.status(403).json({ error: 'Tu cuenta aún no fue verificada. Revisá tu email.' });
    }

    const isMatch = await bcrypt.compare(pass, client.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const { password, ...clientData } = client._doc;
    res.status(200).json({ message: 'Bienvenido', user: clientData });

  } catch (error) {
    console.error('Error /login:', error.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

module.exports = router;
