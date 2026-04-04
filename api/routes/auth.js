const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Client = require('../models/Client');
const nodemailer = require('nodemailer');

// Helper config for real mailing
const transporter = nodemailer.createTransport({
  host: 'mail.miriamschild.com.ar', // DNS configurado para Hostinger/Cpanel
  port: 465, // SSL/TLS port
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generador de código aleatorio de 4 dígitos
const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, surname, email, whatsapp, password } = req.body;

    let existingClient = await Client.findOne({ $or: [{ email }, { whatsapp }] });
    if (existingClient) {
      // Si existe y ya fue validado, es error. 
      // Si existe pero NO está validado, podriamos re-usar el registro, pero mejor tirar error de que ya existe.
      return res.status(400).json({ error: 'El email o WhatsApp ya se encuentran registrados.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const code = generateCode();

    const newClient = new Client({
      name,
      surname,
      email,
      whatsapp,
      password: hashedPassword,
      isValidated: false,
      verificationCode: code
    });

    await newClient.save();

    // Nodemailer: Enviamos el código real al usuario
    // Solo enviamos si NO es un registro ficticio de Google
    if (!password.includes('CuentaGoogle')) {
        try {
            await transporter.sendMail({
                from: `"Miriam Schild Fragancias" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Tu código de verificación - Miriam Schild',
                html: `
                  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <img src="https://miriamschild.com.ar/assets/img/logo.png" alt="Miriam Schild" style="max-height: 50px;">
                    <h2 style="color: #2957a4;">¡Hola ${name}!</h2>
                    <p>Gracias por registrarte. Para completar la creación de tu cuenta, ingresa el siguiente código:</p>
                    <h1 style="color: #63a995; font-size: 36px; letter-spacing: 5px;">${code}</h1>
                    <p>Si no fuiste tú, ignora este correo.</p>
                  </div>
                `
            });
        } catch(mailErr) {
            console.error("Error enviando email:", mailErr);
            // Seguimos adelante, dejamos validarlo aunque falle el mail a veces en modo desarrollo
        }
    }

    res.status(201).json({ message: 'Registrado. Revisa tu Email.', email });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor al registrarse.' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { email, codeEmail, codeWapp } = req.body;
    
    const client = await Client.findOne({ email });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado.' });

    // Si es un modo normal, verifica el código que le enviamos.
    // (codeEmail y codeWapp deberian coincidir, a nivel backend usamos el mismo código generado para ambos medios)
    if (!client.password.includes('CuentaGoogle')) {
        if (client.verificationCode !== codeEmail) {
            return res.status(400).json({ error: 'CÓDIGO DE EMAIL INCORRECTO. Por favor revísalo.' });
        }
    }

    // Activamos la cuenta
    client.isValidated = true;
    client.verificationCode = null; // ya no necesitamos el código
    await client.save();

    const { password, ...clientData } = client._doc;
    res.status(200).json({ message: 'Cuenta activada correctamente', user: clientData });
  } catch (e) {
    res.status(500).json({ error: 'Falló la verificación del código.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { user, pass } = req.body;

    const client = await Client.findOne({ $or: [{ email: user }, { whatsapp: user }] });
    if (!client) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(pass, client.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const { password, ...clientData } = client._doc;
    res.status(200).json({ message: 'Bienvenido', user: clientData });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

module.exports = router;
