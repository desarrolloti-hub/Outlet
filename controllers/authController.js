/* ========================================
   AUTH CONTROLLER - Outlet Val
   Manejo de formularios de autenticación
   ======================================== */

import { UserService } from '/services/userService.js';

// Estado del controller
let isLoading = false;

/**
 * Inicializar controlador de autenticación
 */
export function initAuthController() {
    // Verificar si estamos en página de login/registro
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const googleBtn = document.getElementById('google-login-btn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleLogin);
    }
    
    console.log('✅ Auth Controller inicializado');
}

/**
 * Manejar login con email
 */
async function handleLogin(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const errorDiv = document.getElementById('login-error');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Limpiar error anterior
    if (errorDiv) errorDiv.style.display = 'none';
    
    // Validar campos
    if (!email || !password) {
        showError(errorDiv, 'Todos los campos son requeridos');
        return;
    }
    
    // Mostrar loading
    isLoading = true;
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
        submitBtn.textContent = 'Iniciando sesión...';
        submitBtn.disabled = true;
    }
    
    try {
        const result = await UserService.login(email, password);
        
        // Mostrar éxito
        showToast('✅ ¡Bienvenido de vuelta!');
        
        // Redirigir
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 500);
        
    } catch (error) {
        showError(errorDiv, error.message);
        console.error('Error login:', error);
    } finally {
        isLoading = false;
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

/**
 * Manejar registro de usuario
 */
async function handleRegister(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    // Obtener datos del formulario
    const userData = {
        nombre: document.getElementById('nombre')?.value,
        apellidoPa: document.getElementById('apellido_pa')?.value,
        apellidoMa: document.getElementById('apellido_ma')?.value,
        email: document.getElementById('email')?.value
    };
    
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirm_password')?.value;
    const errorDiv = document.getElementById('register-error');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Limpiar error
    if (errorDiv) errorDiv.style.display = 'none';
    
    // Validar contraseñas
    if (password !== confirmPassword) {
        showError(errorDiv, 'Las contraseñas no coinciden');
        return;
    }
    
    // Mostrar loading
    isLoading = true;
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
        submitBtn.textContent = 'Creando cuenta...';
        submitBtn.disabled = true;
    }
    
    try {
        const result = await UserService.register(userData, password);
        
        showToast('✅ Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.');
        
        // Redirigir a verificación o login
        setTimeout(() => {
            window.location.href = '/verificar-email';
        }, 1500);
        
    } catch (error) {
        showError(errorDiv, error.message);
        console.error('Error registro:', error);
    } finally {
        isLoading = false;
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

/**
 * Manejar login con Google
 */
async function handleGoogleLogin() {
    if (isLoading) return;
    
    isLoading = true;
    
    // Mostrar loading overlay
    showLoadingOverlay();
    
    try {
        const result = await UserService.login(null, null, true);
        
        showToast('✅ Sesión iniciada con Google');
        
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 500);
        
    } catch (error) {
        hideLoadingOverlay();
        showToast('❌ Error: ' + error.message, 'error');
        console.error('Error Google login:', error);
    } finally {
        isLoading = false;
    }
}

/**
 * Manejar cierre de sesión
 */
export async function handleLogout() {
    try {
        await UserService.logout();
        showToast('✅ Sesión cerrada correctamente');
        
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    } catch (error) {
        console.error('Error logout:', error);
        showToast('❌ Error al cerrar sesión', 'error');
    }
}

/**
 * Mostrar error en UI
 */
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    } else {
        showToast('❌ ' + message, 'error');
    }
}

/**
 * Mostrar toast notification
 */
function showToast(message, type = 'success') {
    // Implementar tu sistema de toast
    console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * Mostrar loading overlay
 */
function showLoadingOverlay() {
    // Implementar tu overlay de loading
}

function hideLoadingOverlay() {
    // Ocultar overlay
}