require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde el Frontend (HTML)
app.use(express.json()); // Permite recibir JSON en peticiones POST

// Definición de Rutas API
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API Node.js de Miriam Schild funcionando 🚀');
});

// Variables de Entorno
// Puerto asignado por el entorno (DonWeb requiere process.env.PORT)
const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
    console.log('Esperando conexión a Base de Datos MONGODB ATLAS.....');
});

// Conexión a Base de Datos
if (MONGO_URI && MONGO_URI.includes('mongodb.net')) {
    mongoose.connect(MONGO_URI)
      .then(() => console.log('✅ Conectado Exitosamente a MongoDB Atlas'))
      .catch(err => console.error('❌ Error crítico de MongoDB:', err.message));
} else {
    console.log('⚠️ ADVERTENCIA: Aún no configuras tu URI de MongoDB en el archivo .env. Por favor créalo en MongoDB Atlas y pégalo allí para guardar datos reales.');
}
