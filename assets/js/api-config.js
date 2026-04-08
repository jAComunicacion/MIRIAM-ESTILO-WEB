/**
 * Configuración centralizada de la API
 * Aquí definimos a dónde se conectará el sitio (Ferozo -> Vercel)
 */
const API_CONFIG = {
    // Si estamos en localhost, usamos el puerto 5000. 
    // Si no, usamos la URL de producción en Vercel.
    baseUrl: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : 'https://miriam-schild-fullstack.vercel.app/api' // <-- REEMPLAZAR con tu URL real de Vercel si es diferente
};

// Hacerlo disponible para otros scripts
window.API_BASE_URL = API_CONFIG.baseUrl;
