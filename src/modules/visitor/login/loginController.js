/* ========================================
   LOGIN CONTROLLER - OUTLET
   Controlador para página de inicio de sesión
   Soporta login de Administradores y Clientes
   ======================================== */

import { CustomerService } from '../../../services/customerService.js';
import { AdminService } from '../../../services/adminService.js';
import { AuthService } from '../../../services/authService.js';

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
 * Determina el rol del usuario desde el resultado del login
 */
function getUserRoleFromLogin(result) {
    if (result.adminData) return 'admin';
    if (result.customerData) return 'customer';
    return 'unknown';
}

/**
 * Obtiene la URL de redirección según el rol del usuario
 */
function getRedirectUrlByRole(role, defaultUrl = '/') {
    const redirectMap = {
        'admin': '/homeAdmin',
        'super_admin': '/admin/dashboard',
        'editor': '/admin/dashboard',
        'customer': '/',
        'unknown': defaultUrl
    };
    
    return redirectMap[role] || defaultUrl;
}

/**
 * Maneja el login con Google (soporta Admin y Customer)
 */
async function handleGoogleLogin() {
    if (isLoading) return;
    
    isLoading = true;
    
    const googleBtn = document.getElementById('googleLoginBtn');
    const originalText = googleBtn?.innerHTML;
    
    if (googleBtn) {
        googleBtn.innerHTML = '<span>⏳ CARGANDO...</span>';
        googleBtn.disabled = true;
    }
    
    try {
        let result = null;
        let userRole = null;
        let loginSuccess = false;
        
        // Intentar login como administrador con Google
        try {
            console.log('🔐 Intentando login como administrador con Google...');
            result = await AdminService.login(null, null, true);
            userRole = 'admin';
            loginSuccess = true;
            console.log('✅ Login exitoso como ADMINISTRADOR con Google');
            
            const session = AdminService.getCurrentSession();
            console.log('📦 Sesión de admin guardada:', session);
            showNotification('✅ ¡Bienvenido Administrador!');
        } catch (adminError) {
            console.log('⚠️ No es administrador, intentando como cliente...');
            try {
                result = await CustomerService.login(null, null, true);
                userRole = 'customer';
                loginSuccess = true;
                console.log('✅ Login exitoso como CLIENTE con Google');
                
                const session = CustomerService.getCurrentSession();
                console.log('📦 Sesión de cliente guardada:', session);
                showNotification('✅ ¡Bienvenido! Sesión iniciada con Google');
            } catch (customerError) {
                console.error('❌ Error en ambos intentos de login con Google:', customerError);
                throw customerError;
            }
        }
        
        if (!loginSuccess) {
            throw new Error('No se pudo iniciar sesión con Google');
        }
        
        // Obtener URL de redirección
        let redirectUrl = sessionStorage.getItem('redirectAfterLogin') || getRedirectUrlByRole(userRole);
        sessionStorage.removeItem('redirectAfterLogin');
        
        const attemptedUrl = sessionStorage.getItem('attemptedUrl') || '';
        if (attemptedUrl.includes('/admin') && userRole !== 'admin') {
            redirectUrl = '/';
            showNotification('⚠️ No tienes permisos de administrador', true);
        }
        
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error en login con Google:', error);
        let errorMessage = error.message;
        
        if (errorMessage.includes('No tiene permisos de administrador')) {
            errorMessage = 'No tienes permisos de administrador. Intenta con otro correo.';
        } else if (errorMessage.includes('account-exists-with-different-credential')) {
            errorMessage = 'Ya existe una cuenta con este correo usando otro método. Inicia sesión con email y contraseña.';
        }
        
        showNotification(`❌ ${errorMessage}`, true);
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
        let result = null;
        let userRole = null;
        let loginSuccess = false;
        
        // Intentar login como administrador
        try {
            console.log('🔐 Intentando login como administrador...');
            result = await AdminService.login(email, password);
            userRole = result.adminData?.rol || 'admin';
            loginSuccess = true;
            console.log('✅ Login exitoso como ADMINISTRADOR');
            
            const session = AdminService.getCurrentSession();
            console.log('📦 Contenido de outlet_admin:', session);
            console.log('📦 Estructura JSON guardada:', JSON.stringify(session, null, 2));
            
            showNotification('✅ ¡Bienvenido Administrador!');
        } catch (adminError) {
            console.log('⚠️ No es administrador, intentando como cliente...');
            console.log('Error de admin:', adminError.message);
            
            try {
                result = await CustomerService.login(email, password);
                userRole = 'customer';
                loginSuccess = true;
                console.log('✅ Login exitoso como CLIENTE');
                
                const session = CustomerService.getCurrentSession();
                console.log('📦 Contenido de outlet_customer:', session);
                
                showNotification('✅ ¡Bienvenido de vuelta!');
            } catch (customerError) {
                console.error('❌ Error en ambos intentos:', customerError);
                throw customerError;
            }
        }
        
        if (!loginSuccess) {
            throw new Error('Credenciales inválidas');
        }
        
        // Guardar información adicional
        if (userRole === 'admin' && result.adminData) {
            sessionStorage.setItem('isAdmin', 'true');
            sessionStorage.setItem('adminRole', result.adminData.rol);
            sessionStorage.removeItem('isCustomer');
        } else if (userRole === 'customer' && result.customerData) {
            sessionStorage.setItem('isCustomer', 'true');
            sessionStorage.removeItem('isAdmin');
            sessionStorage.removeItem('adminRole');
        }
        
        // Obtener URL de redirección
        let redirectUrl = sessionStorage.getItem('redirectAfterLogin') || getRedirectUrlByRole(userRole);
        sessionStorage.removeItem('redirectAfterLogin');
        
        const attemptedUrl = sessionStorage.getItem('attemptedUrl') || '';
        if (attemptedUrl.includes('/admin') && userRole !== 'admin') {
            redirectUrl = '/';
            showNotification('⚠️ No tienes permisos de administrador', true);
        }
        
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error en login:', error);
        
        let errorMessage = error.message;
        
        if (errorMessage.includes('auth/user-not-found')) {
            errorMessage = 'No existe una cuenta con este correo electrónico';
        } else if (errorMessage.includes('auth/wrong-password')) {
            errorMessage = 'Contraseña incorrecta';
        } else if (errorMessage.includes('Cuenta bloqueada') || errorMessage.includes('bloqueada')) {
            errorMessage = error.message;
        } else if (errorMessage.includes('inactiva') || errorMessage.includes('suspendida')) {
            errorMessage = error.message;
        } else if (errorMessage.includes('No tiene permisos de administrador')) {
            errorMessage = 'Este correo no tiene permisos de administrador';
        } else if (errorMessage.includes('No existe una cuenta con este correo')) {
            errorMessage = 'No existe una cuenta con este correo electrónico';
        }
        
        showNotification(`❌ ${errorMessage}`, true);
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
 * Maneja "crear cuenta"
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
 * Verifica si ya hay una sesión activa
 */
async function checkExistingSession() {
    // Verificar sesión de admin
    const adminSession = localStorage.getItem('outlet_admin');
    
    if (adminSession) {
        try {
            const sessionData = JSON.parse(adminSession);
            console.log('📦 Sesión de admin encontrada:', sessionData);
            
            const currentAdmin = await AdminService.getCurrentAdmin(true);
            if (currentAdmin && currentAdmin.isActive()) {
                console.log('🔄 Sesión de administrador válida, redirigiendo...');
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/homeAdmin';
                sessionStorage.removeItem('redirectAfterLogin');
                
                setTimeout(() => {
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo(redirectUrl);
                    } else {
                        window.location.href = redirectUrl;
                    }
                }, 500);
                return true;
            }
        } catch (error) {
            console.error('Error verificando sesión de admin:', error);
        }
    }
    
    // Verificar sesión de cliente
    const customerSession = localStorage.getItem('outlet_customer');
    if (customerSession && !adminSession) {
        try {
            const sessionData = JSON.parse(customerSession);
            console.log('📦 Sesión de cliente encontrada:', sessionData);
            
            const currentCustomer = await CustomerService.getCurrentCustomer(true);
            if (currentCustomer && currentCustomer.isActive()) {
                console.log('🔄 Sesión de cliente válida, redirigiendo...');
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
                sessionStorage.removeItem('redirectAfterLogin');
                
                setTimeout(() => {
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo(redirectUrl);
                    } else {
                        window.location.href = redirectUrl;
                    }
                }, 500);
                return true;
            }
        } catch (error) {
            console.error('Error verificando sesión de cliente:', error);
        }
    }
    
    return false;
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
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleLogin);
}

/**
 * Controller principal
 */
export async function loginController() {
    console.log('🔐 Login Controller - Página de inicio de sesión (Admin + Customer)');
    
    // Inicializar sistema de administradores
    try {
        await AdminService.initializeSystem();
        console.log('✅ Sistema de administradores inicializado');
    } catch (error) {
        console.error('❌ Error inicializando sistema de admins:', error);
    }
    
    loadStyles();
    
    const hasRedirected = await checkExistingSession();
    if (hasRedirected) return;
    
    loadSavedEmail();
    initFormEvents();
    
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
        sessionStorage.setItem('redirectAfterLogin', redirect);
    }
    
    console.log('✅ Login page cargada correctamente');
}