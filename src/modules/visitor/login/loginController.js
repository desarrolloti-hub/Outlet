/* ========================================
   LOGIN CONTROLLER - OUTLET
   Controlador para página de inicio de sesión
   ======================================== */

import { UserService } from '/services/userService.js';

// Estado del controlador
let isLoading = false;

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
 * 🆕 Maneja el login con Google
 */
async function handleGoogleLogin() {
    if (isLoading) return;
    
    isLoading = true;
    
    // Mostrar loading en el botón de Google
    const googleBtn = document.getElementById('googleLoginBtn');
    const originalText = googleBtn?.innerHTML;
    
    if (googleBtn) {
        googleBtn.innerHTML = '<span>⏳ CARGANDO...</span>';
        googleBtn.disabled = true;
    }
    
    try {
        // Usar el login con Google del UserService
        const result = await UserService.login(null, null, true);
        
        showNotification('✅ ¡Bienvenido! Sesión iniciada con Google');
        
        // Redirigir a la página que intentaba ver o al home
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/homeAdmin';
        sessionStorage.removeItem('redirectAfterLogin');
        
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error en login con Google:', error);
        showNotification(`❌ ${error.message}`, true);
    } finally {
        isLoading = false;
        if (googleBtn) {
            googleBtn.innerHTML = originalText;
            googleBtn.disabled = false;
        }
    }
}

/**
 * Maneja el login con email/contraseña
 */
async function handleLogin(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
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
    
    isLoading = true;
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn?.textContent;
    
    if (submitBtn) {
        submitBtn.textContent = 'INGRESANDO...';
        submitBtn.disabled = true;
    }
    
    try {
        // Login con email y contraseña usando UserService
        const result = await UserService.login(email, password);
        
        showNotification('✅ ¡Bienvenido de vuelta!');
        
        // Redirigir a la página que intentaba ver o al home
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error en login:', error);
        showNotification(`❌ ${error.message}`, true);
    } finally {
        isLoading = false;
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

/**
 * Maneja "olvidé mi contraseña"
 */
function handleForgotPassword(e) {
    e.preventDefault();
    showNotification('📧 Se ha enviado un enlace de recuperación a tu correo');
}

/**
 * Maneja "crear cuenta" - Redirige a createAccount
 */
function handleSignup(e) {
    e.preventDefault();
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/createAccount');
    } else {
        window.location.href = '/createAccount';
    }
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
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (forgotBtn) forgotBtn.addEventListener('click', handleForgotPassword);
    if (signupBtn) signupBtn.addEventListener('click', handleSignup);
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleLogin); // 🆕
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