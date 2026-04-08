require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde el Frontend (HTML)
app.use(express.json()); // Permite recibir JSON en peticiones POST
app.use(express.urlencoded({ extended: true })); // Permite recibir formularios estándar

// Definición de Rutas API
// Las montamos tanto en /api como en la raíz para mayor compatibilidad
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); 

app.use('/api/contact', contactRoutes);
app.use('/contact', contactRoutes);

app.get(['/', '/api'], (req, res) => {
  res.send('API Node.js de Miriam Schild funcionando 🚀');
});

// Variables de Entorno
// Puerto asignado por el entorno (DonWeb requiere process.env.PORT)
const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;

// Iniciar Servidor (Solo en desarrollo local)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
  });
}

// Conexión a Base de Datos
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
      .then(() => console.log('✅ Conectado a MongoDB Atlas'))
      .catch(err => console.error('❌ Error de conexión:', err.message));
}

// Exportar para Vercel
module.exports = app;
