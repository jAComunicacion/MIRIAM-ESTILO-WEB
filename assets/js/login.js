document.addEventListener('DOMContentLoaded', function() {
  const apiUrl = 'http://localhost:5000/api/auth';

  // Tabs and Forms
  const clientLoginForm = document.getElementById('clientLoginForm');    
  const formIngresarSolo = document.getElementById('formIngresarSolo');   
  const clientVerifyStep = document.getElementById('clientVerifyStep');
  
  // Botones Registro
  const btnProcesarDatos = document.getElementById('btnProcesarDatos');
  
  // Boton Login
  const btnIngresarSubmit = document.getElementById('btnIngresarSubmit');

  // Botones Verificar
  const btnVerificarCodigo = document.getElementById('btnVerificarCodigo');
  const btnVolverLogin = document.getElementById('btnVolverLogin');

  // Botones Google
  const btnsGoogleLogin = document.querySelectorAll('.btnGoogleLogin');
  
  // Datos obligatorios (Registro)
  const inputName = document.getElementById('clientName');
  const inputSurname = document.getElementById('clientSurname');
  const inputEmail = document.getElementById('clientEmail');
  const inputWapp = document.getElementById('clientWapp');
  const inputPass = document.getElementById('clientPass');
  
  // Datos Ingreso
  const loginUserLog = document.getElementById('loginUserLog');
  const loginPassLog = document.getElementById('loginPassLog');

  // Elementos del código (Verificación)
  const inputCodigoEmail = document.getElementById('codigoEmail');
  const inputCodigoWapp = document.getElementById('codigoWapp');
  const groupCodigoEmail = document.getElementById('groupCodigoEmail');
  
  let modoLogin = 'normal'; // 'normal' o 'google'

  // ==========================================
  // LÓGICA DE REGISTRO (CONEXIÓN AL BACKEND REAL)
  // ==========================================
  if(btnProcesarDatos) {
    btnProcesarDatos.addEventListener('click', async function(e) {
      e.preventDefault();
      
      if (!inputName.value.trim() || !inputSurname.value.trim() || !inputEmail.value.trim() || !inputWapp.value.trim() || !inputPass.value.trim()) {
        alert('Por favor, completa todos los campos para registrarte.');
        return;
      }
      
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(inputEmail.value.trim())) {
        alert('Por favor introduce un email válido.');
        return;
      }

      // Preparar datos para enviar a Node.js
      const data = {
        name: inputName.value.trim(),
        surname: inputSurname.value.trim(),
        email: inputEmail.value.trim(),
        whatsapp: inputWapp.value.trim(),
        password: inputPass.value.trim()
      };

      try {
        const btnTextPrev = btnProcesarDatos.textContent;
        btnProcesarDatos.textContent = 'Enviando...';

        // 1. Enviamos los datos al Backend (Mongoose guardará en Base de datos el usuario inactivo)
        const response = await fetch(`${apiUrl}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        btnProcesarDatos.textContent = btnTextPrev;

        if (!response.ok) {
          alert(result.error || 'Ocurrió un error en el registro.');
          return;
        }

        modoLogin = 'normal';
        groupCodigoEmail.style.display = 'block'; 
        document.querySelector('#loginTabContent').style.display = 'none';
        document.getElementById('loginTab').style.display = 'none';
        clientVerifyStep.style.display = 'block';

      } catch (err) {
        alert('Error de conexión con el Servidor Backend.');
        console.error(err);
      }
    });
  }

  // ==========================================
  // LÓGICA DE INGRESO SIMPLE (BACKEND REAL)
  // ==========================================
  if(btnIngresarSubmit) {
    btnIngresarSubmit.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const user = loginUserLog.value.trim();
      const pass = loginPassLog.value.trim();

      if(!user || !pass) {
        alert('Por favor, ingresa tu email/WhatsApp y contraseña.');
        return;
      }

      try {
        const btnTextPrev = btnIngresarSubmit.textContent;
        btnIngresarSubmit.textContent = 'Comprobando...';

        // Hacemos el pedido POST al login
        const response = await fetch(`${apiUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, pass })
        });
        
        const result = await response.json();
        btnIngresarSubmit.textContent = btnTextPrev;

        if (!response.ok) {
           alert(result.error || 'Credenciales inválidas.');
           return;
        }

        // Si fue exitoso, el Backend envía el usuario (sin el password hasheado)
        // Lo guardamos en localStorage para alimentar el Dashboard clientes.html
        localStorage.setItem('clienteDatosWeb', JSON.stringify(result.user));
        
        window.location.href = 'clientes.html';

      } catch (err) {
        alert('Error de red al intentar conectarse.');
        console.error(err);
      }
    });
  }

  // ==========================================
  // LÓGICA GOOGLE (SEMI-SIMULADO CONTRA EL BACKEND)
  // ==========================================
  if(btnsGoogleLogin.length > 0) {
    btnsGoogleLogin.forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        let whatsAppProporcionado = prompt("Google verificó tu Email.\nPara completar el registro, ingresa tu WhatsApp:");
        
        if(whatsAppProporcionado && whatsAppProporcionado.trim().length > 5) {
            alert(`Cargando... te hemos enviado un código a ${whatsAppProporcionado}`);
            
            const emailSimulado = `googleuser_${Math.floor(Math.random() * 10000)}@gmail.com`;
            const fakeData = {
                name: "Usuario",
                surname: "Google",
                email: emailSimulado,
                whatsapp: whatsAppProporcionado.trim(),
                password: "LoginPorCuentaGoogle" // En un entorno real, no se usa password si el login fue OAUTH2.0 de Google.
            };

            try {
              // Registramos al usuario mágico en la BD
              const request = await fetch(`${apiUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fakeData)
              });

              if(!request.ok) {
                 const d = await request.json();
                 alert(d.error || 'Ocurrió un error.');
                 return;
              }

              modoLogin = 'google';
              localStorage.setItem('tempGoogleUser', emailSimulado);
              
              document.querySelector('#loginTabContent').style.display = 'none';
              document.getElementById('loginTab').style.display = 'none';
              groupCodigoEmail.style.display = 'none';
              clientVerifyStep.style.display = 'block';
            } catch (r) {
              alert('Error conectando backend Google');
            }
        }
      });
    });
  }

  // ==========================================
  // VERIFICACIÓN HACIA EL BACKEND (PASO 2)
  // ==========================================
  if(btnVerificarCodigo) {
    btnVerificarCodigo.addEventListener('click', async function() {
      const codeEmail = inputCodigoEmail.value.trim();
      const codeWapp = inputCodigoWapp.value.trim();
      
      if (modoLogin === 'normal') {
          if (!codeEmail || !codeWapp) { return alert('Por favor, ingresa ambos códigos.'); }
          if (codeEmail.length < 3 || codeWapp.length < 3) { return alert('Códigos inválidos.'); }
      } else if (modoLogin === 'google') {
          if (!codeWapp || codeWapp.length < 3) { return alert('Por favor, código de WApp erróneo.'); }
      }

      try {
        let emailTarget = '';
        if (modoLogin === 'normal') {
           emailTarget = inputEmail.value.trim();
        } else {
           emailTarget = localStorage.getItem('tempGoogleUser');
        }

        btnVerificarCodigo.textContent = 'Verificando y Activando...';

        // API llamamos al backend
        const response = await fetch(`${apiUrl}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailTarget, codeEmail, codeWapp })
        });
        
        const result = await response.json();
        
        if(!response.ok) {
           btnVerificarCodigo.textContent = 'Verificar e Ingresar';
           alert(result.error || 'Error al verificar.');
           return;
        }

        // Si fue existoso la activación, el servidor envía `user` validado
        localStorage.setItem('clienteDatosWeb', JSON.stringify(result.user));
        
        if (modoLogin === 'google') localStorage.removeItem('tempGoogleUser');
        
        window.location.href = 'clientes.html';

      } catch (e) {
        alert('Error conectando con la Base de datos - verificación Falló');
      }
    });
  }
  
  if(btnVolverLogin) {
    btnVolverLogin.addEventListener('click', function() {
      localStorage.removeItem('tempGoogleUser');
      clientVerifyStep.style.display = 'none';
      document.getElementById('loginTab').style.display = 'flex';
      document.querySelector('#loginTabContent').style.display = 'block';
    });
  }
});
