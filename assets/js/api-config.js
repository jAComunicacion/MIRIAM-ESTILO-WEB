/**
 * Configuración centralizada de la API
 * Aquí definimos a dónde se conectará el sitio (Frontend -> Backend en Vercel)
 */
const API_CONFIG = {
    // Si estamos en localhost o IPs locales, usamos el puerto 5000 (Backend local).
    // Si no, usamos la URL de producción en Vercel.
    baseUrl: (window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1' || 
              window.location.hostname.startsWith('192.168.'))
        ? 'http://localhost:5000/api'
        : 'https://miriam-estilo-web.vercel.app/api'
};

// Hacerlo disponible para otros scripts
window.API_BASE_URL = API_CONFIG.baseUrl;

console.log('🌐 API Configurada en:', window.API_BASE_URL);
