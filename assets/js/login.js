// ==========================================
// FUNCIÓN GLOBAL: Modal de alerta personalizado
// Reemplaza window.alert() con un modal bonito
// ==========================================
function showAlert(message, icon) {
  icon = icon || 'ℹ';
  const overlay = document.getElementById('customAlertOverlay');
  const msgEl   = document.getElementById('customAlertMsg');
  const iconEl  = document.getElementById('customAlertIcon');
  if (!overlay || !msgEl) { alert(message); return; }
  iconEl.textContent = icon;
  msgEl.textContent  = message;
  overlay.classList.add('show');
}

document.addEventListener('DOMContentLoaded', function() {

  // Botón ACEPTAR del modal personalizado
  const btnAlertOk = document.getElementById('btnCustomAlertOk');
  if (btnAlertOk) {
    btnAlertOk.addEventListener('click', function() {
      document.getElementById('customAlertOverlay').classList.remove('show');
    });
  }

  // Configuración de API usando la URL centralizada
  console.log('🚀 Login API configurada localmente');

  // Tabs and Forms
  const clientLoginForm  = document.getElementById('clientLoginForm');
  const formIngresarSolo = document.getElementById('formIngresarSolo');
  const clientVerifyStep = document.getElementById('clientVerifyStep');

  // Botones Registro
  const btnProcesarDatos = document.getElementById('btnProcesarDatos');

  // Boton Login
  const btnIngresarSubmit = document.getElementById('btnIngresarSubmit');

  // Botones Verificar
  const btnVerificarCodigo = document.getElementById('btnVerificarCodigo');
  const btnVolverLogin     = document.getElementById('btnVolverLogin');

  // Botones Google
  const btnsGoogleLogin = document.querySelectorAll('.btnGoogleLogin');

  // Datos obligatorios (Registro)
  const inputName    = document.getElementById('clientName');
  const inputSurname = document.getElementById('clientSurname');
  const inputEmail   = document.getElementById('clientEmail');
  const inputWapp    = document.getElementById('clientWapp');
  const inputPass    = document.getElementById('clientPass');

  // Datos Ingreso
  const loginUserLog = document.getElementById('loginUserLog');
  const loginPassLog = document.getElementById('loginPassLog');

  // Elementos del código (Verificación)
  const inputCodigoEmail = document.getElementById('codigoEmail');
  const groupCodigoEmail = document.getElementById('groupCodigoEmail');

  let modoLogin = 'normal'; // 'normal' o 'google'

  // ==========================================
  // LÓGICA DE REGISTRO (CONEXIÓN AL BACKEND REAL)
  // ==========================================
  if (btnProcesarDatos) {
    btnProcesarDatos.addEventListener('click', async function(e) {
      e.preventDefault();

      if (!inputName.value.trim() || !inputSurname.value.trim() || !inputEmail.value.trim() || !inputWapp.value.trim() || !inputPass.value.trim()) {
        showAlert('Por favor, completa todos los campos para registrarte.', '⚠️');
        return;
      }

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(inputEmail.value.trim())) {
        showAlert('Por favor introduce un email válido.', '✉️');
        return;
      }

      const data = {
        name:      inputName.value.trim(),
        surname:   inputSurname.value.trim(),
        email:     inputEmail.value.trim(),
        whatsapp:  inputWapp.value.trim(),
        password:  inputPass.value.trim()
      };

      try {
        const btnTextPrev = btnProcesarDatos.textContent;
        btnProcesarDatos.textContent = 'Enviando...';

        const endpoint = window.API_ENDPOINTS ? window.API_ENDPOINTS.register : '/registro.php';
        const response = await fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(data)
        });

        const result = await response.json();
        btnProcesarDatos.textContent = btnTextPrev;

        if (!response.ok) {
          showAlert(result.error || 'Ocurrió un error en el registro.', '❌');
          return;
        }

        modoLogin = 'normal';
        groupCodigoEmail.style.display = 'block';
        document.querySelector('#loginTabContent').style.display = 'none';
        document.getElementById('loginTab').style.display = 'none';
        clientVerifyStep.style.display = 'block';

      } catch (err) {
        showAlert('Error de conexión con el Servidor Backend.', '🔌');
        console.error(err);
      }
    });
  }

  // ==========================================
  // LÓGICA DE INGRESO SIMPLE (BACKEND REAL)
  // ==========================================
  if (btnIngresarSubmit) {
    btnIngresarSubmit.addEventListener('click', async function(e) {
      e.preventDefault();

      const user = loginUserLog.value.trim();
      const pass = loginPassLog.value.trim();

      if (!user || !pass) {
        showAlert('Por favor, ingresa tu email/WhatsApp y contraseña.', '⚠️');
        return;
      }

      try {
        const btnTextPrev = btnIngresarSubmit.textContent;
        btnIngresarSubmit.textContent = 'Comprobando...';

        const endpoint = window.API_ENDPOINTS ? window.API_ENDPOINTS.login : '/login.php';
        const response = await fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ user, pass })
        });

        const result = await response.json();
        btnIngresarSubmit.textContent = btnTextPrev;

        if (!response.ok) {
          showAlert(result.error || 'Credenciales inválidas.', '🔒');
          return;
        }

        localStorage.setItem('clienteDatosWeb', JSON.stringify(result.user));
        window.location.href = 'clientes.html';

      } catch (err) {
        showAlert('Error de red al intentar conectarse.', '🔌');
        console.error(err);
      }
    });
  }

  // ==========================================
  // LÓGICA GOOGLE (PENDIENTE DE CONFIGURACIÓN REAL OAUTH2)
  // ==========================================
  if (btnsGoogleLogin.length > 0) {
    btnsGoogleLogin.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        showAlert(
          'El ingreso con Google requiere una configuración de ClientID (OAuth2.0) en la consola de Google Cloud. Por favor utiliza el formulario de Registro estándar por el momento.',
          '🔑'
        );
      });
    });
  }

  // ==========================================
  // VERIFICACIÓN HACIA EL BACKEND (PASO 2)
  // ==========================================
  if (btnVerificarCodigo) {
    btnVerificarCodigo.addEventListener('click', async function() {
      const codeEmail = inputCodigoEmail.value.trim();

      if (modoLogin === 'normal') {
        if (!codeEmail) { showAlert('Por favor, ingresa el código.', '⚠️'); return; }
        if (codeEmail.length < 3) { showAlert('Código inválido.', '❌'); return; }
      } else if (modoLogin === 'google') {
        // En google podrías pedir algo extra o nada
      }

      try {
        let emailTarget = '';
        if (modoLogin === 'normal') {
          emailTarget = inputEmail.value.trim();
        } else {
          emailTarget = localStorage.getItem('tempGoogleUser');
        }

        btnVerificarCodigo.textContent = 'Verificando y Activando...';

        const endpoint = window.API_ENDPOINTS ? window.API_ENDPOINTS.verify : '/verificar.php';
        const response = await fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: emailTarget, codeEmail })
        });

        const result = await response.json();

        if (!response.ok) {
          btnVerificarCodigo.textContent = 'Verificar e Ingresar';
          showAlert(result.error || 'Error al verificar.', '❌');
          return;
        }

        localStorage.setItem('clienteDatosWeb', JSON.stringify(result.user));
        if (modoLogin === 'google') localStorage.removeItem('tempGoogleUser');
        window.location.href = 'clientes.html';

      } catch (e) {
        showAlert('Error conectando con la Base de datos - verificación Falló', '🔌');
      }
    });
  }

  if (btnVolverLogin) {
    btnVolverLogin.addEventListener('click', function() {
      localStorage.removeItem('tempGoogleUser');
      clientVerifyStep.style.display = 'none';
      document.getElementById('loginTab').style.display = 'flex';
      document.querySelector('#loginTabContent').style.display = 'block';
    });
  }
});
