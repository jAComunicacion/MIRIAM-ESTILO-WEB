const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  whatsapp: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isValidated: { type: Boolean, default: false }, // Para saber si completaron el paso de códigos
  verificationCode: { type: String } // Código de 4 dígitos generado al azar
});

module.exports = mongoose.model('Client', clientSchema);
