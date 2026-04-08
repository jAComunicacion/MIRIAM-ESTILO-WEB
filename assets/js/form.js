const authContainer = document.getElementById('auth-modal-container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

if (authContainer && registerBtn && loginBtn) {
    registerBtn.addEventListener('click', () => {
        authContainer.classList.add("active");
    });

    loginBtn.addEventListener('click', () => {
        authContainer.classList.remove("active");
    });
}