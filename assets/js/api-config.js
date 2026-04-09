/**
 * Configuración centralizada de la API
 * Aquí definimos a dónde se conectará el sitio (Frontend -> Backend Local en DonWeb)
 */
const API_CONFIG = {
    // Usamos rutas relativas al directorio raíz donde están los archivos PHP
    baseUrl: '', 
    endpoints: {
        register: '/registro.php',
        login:    '/login.php',
        verify:   '/verificar.php'
    }
};

// Hacerlo disponible para otros scripts
window.API_BASE_URL = API_CONFIG.baseUrl;
window.API_ENDPOINTS = API_CONFIG.endpoints;

console.log('🌐 API Configurada localmente en DonWeb');

