/* ========================================
   LOGIN CONTROLLER - OUTLET
   Controlador para página de inicio de sesión
   ======================================== */

/**
 * Carga los estilos CSS de la página
 */
function loadStyles() {
    if (document.querySelector('link[href*="login.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/login.css';
    document.head.appendChild(link);
}

/**
 * Muestra notificación toast
 */
function showNotification(message, isError = false) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.textContent = message;
    
    if (isError) {
        notification.style.borderLeftColor = 'var(--outlet-danger)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Valida formato de email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Maneja el login
 */
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.getElementById('remember').checked;
    
    if (!email) {
        showNotification('❌ Ingresa tu correo electrónico', true);
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('❌ Ingresa un correo válido', true);
        return;
    }
    
    if (!password) {
        showNotification('❌ Ingresa tu contraseña', true);
        return;
    }
    
    if (remember) {
        localStorage.setItem('outlet_remember_email', email);
    } else {
        localStorage.removeItem('outlet_remember_email');
    }
    
    // Simular login exitoso
    console.log('✅ Login exitoso:', { email, remember });
    showNotification('✅ ¡Bienvenido de vuelta!');
    
    // Redirigir al home después de login exitoso
    setTimeout(() => {
        window.navigateTo('/');
    }, 1500);
}

/**
 * Maneja "olvidé mi contraseña"
 */
function handleForgotPassword(e) {
    e.preventDefault();
    showNotification('📧 Se ha enviado un enlace de recuperación a tu correo');
}

/**
 * Maneja "crear cuenta"
 */
/**
 * Maneja "crear cuenta" - Redirige a createAccount
 */
function handleSignup(e) {
    e.preventDefault();
    window.navigateTo('/createAccount');
}

// En la función principal, agrega el event listener:
const signupBtn = document.getElementById('signupBtn');
if (signupBtn) {
    signupBtn.removeEventListener('click', handleSignup);
    signupBtn.addEventListener('click', handleSignup);
}

/**
 * Carga email guardado
 */
function loadSavedEmail() {
    const savedEmail = localStorage.getItem('outlet_remember_email');
    if (savedEmail) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = savedEmail;
            const rememberCheckbox = document.getElementById('remember');
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    }
}

/**
 * Inicializa eventos del formulario
 */
function initFormEvents() {
    const loginForm = document.getElementById('loginForm');
    const forgotBtn = document.getElementById('forgotPassword');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (forgotBtn) forgotBtn.addEventListener('click', handleForgotPassword);
    if (signupBtn) signupBtn.addEventListener('click', handleSignup);
}

/**
 * Controller principal
 */
export async function loginController() {
    console.log('🔐 Login Controller - Página de inicio de sesión');
    
    // Cargar estilos específicos
    loadStyles();
    
    // Cargar email guardado
    loadSavedEmail();
    
    // Inicializar eventos del formulario
    initFormEvents();
    
    console.log('✅ Login page cargada correctamente');
}