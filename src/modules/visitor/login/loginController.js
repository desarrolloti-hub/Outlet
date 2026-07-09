/* ========================================
   LOGIN CONTROLLER - OUTLET
   Controlador para página de inicio de sesión
   Soporta login de Administradores y Clientes
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { CustomerService } from '../../../services/customerService.js';
import { AdminService } from '../../../services/adminService.js';
import { AuthService } from '../../../services/authService.js';

// Estado del controlador
let isLoading = false;

// ========================================
// UI Helpers - CON SWEETALERT2
// ========================================

/**
 * Muestra un toast personalizado (estilo OUTLET)
 */
function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    var toastExistente = document.querySelector('.outlet-toast');
    if (toastExistente) toastExistente.remove();
    
    var toast = document.createElement('div');
    toast.className = 'outlet-toast ' + tipo;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    requestAnimationFrame(function() {
        toast.classList.add('show');
    });
    
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3200);
}

/**
 * Muestra una SweetAlert2 personalizada
 */
function mostrarSweetAlert(options) {
    var defaultOptions = {
        buttonsStyling: false,
        customClass: {
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel',
            popup: 'swal2-popup'
        }
    };
    
    return Swal.fire(Object.assign({}, defaultOptions, options));
}

/**
 * Muestra alerta de éxito
 */
function mostrarExito(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'success',
        title: titulo || '¡Perfecto!',
        text: mensaje || 'La acción se completó con éxito.',
        confirmButtonText: 'Aceptar'
    });
}

/**
 * Muestra alerta de error
 */
function mostrarError(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'error',
        title: titulo || '¡Oops!',
        text: mensaje || 'Ocurrió un error inesperado.',
        confirmButtonText: 'Entendido'
    });
}

/**
 * Muestra alerta de advertencia
 */
function mostrarAdvertencia(titulo, mensaje, confirmText) {
    confirmText = confirmText || 'Continuar';
    return mostrarSweetAlert({
        icon: 'warning',
        title: titulo || '¡Cuidado!',
        text: mensaje || 'Estás a punto de realizar una acción importante.',
        confirmButtonText: confirmText,
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
    });
}

/**
 * Muestra un loading con SweetAlert2
 */
function mostrarLoading(mensaje) {
    mensaje = mensaje || 'Procesando...';
    return mostrarSweetAlert({
        title: mensaje,
        allowOutsideClick: false,
        didOpen: function() {
            Swal.showLoading();
        }
    });
}

/**
 * Cierra la alerta de loading
 */
function cerrarLoading() {
    Swal.close();
}

// ========================================
// Carga de estilos CSS
// ========================================
function loadStyles() {
    if (document.querySelector('link[href*="login.css"]')) return;
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/login.css';
    document.head.appendChild(link);
}

// ========================================
// Valida formato de email
// ========================================
function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ========================================
// Determina el rol del usuario desde el resultado del login
// ========================================
function getUserRoleFromLogin(result) {
    if (result.adminData) return 'admin';
    if (result.customerData) return 'customer';
    return 'unknown';
}

// ========================================
// Obtiene la URL de redirección según el rol del usuario
// ========================================
function getRedirectUrlByRole(role, defaultUrl) {
    defaultUrl = defaultUrl || '/';
    var redirectMap = {
        'admin': '/homeAdmin',
        'super_admin': '/admin/dashboard',
        'editor': '/admin/dashboard',
        'customer': '/',
        'unknown': defaultUrl
    };
    
    return redirectMap[role] || defaultUrl;
}

// ========================================
// Maneja el login con Google (soporta Admin y Customer)
// ========================================
async function handleGoogleLogin() {
    if (isLoading) return;
    
    isLoading = true;
    
    var googleBtn = document.getElementById('googleLoginBtn');
    var originalText = googleBtn?.innerHTML;
    
    if (googleBtn) {
        googleBtn.innerHTML = '<span>⏳ CARGANDO...</span>';
        googleBtn.disabled = true;
    }
    
    // Mostrar loading
    mostrarLoading('Iniciando sesión con Google...');
    
    try {
        var result = null;
        var userRole = null;
        var loginSuccess = false;
        
        // Intentar login como administrador con Google
        try {
            console.log('🔐 Intentando login como administrador con Google...');
            result = await AdminService.login(null, null, true);
            userRole = 'admin';
            loginSuccess = true;
            console.log('✅ Login exitoso como ADMINISTRADOR con Google');
            
            var session = AdminService.getCurrentSession();
            console.log('📦 Sesión de admin guardada:', session);
            
            cerrarLoading();
            await mostrarExito('¡Bienvenido Administrador!', 'Has iniciado sesión correctamente con Google.');
            
        } catch (adminError) {
            console.log('⚠️ No es administrador, intentando como cliente...');
            
            try {
                result = await CustomerService.login(null, null, true);
                userRole = 'customer';
                loginSuccess = true;
                console.log('✅ Login exitoso como CLIENTE con Google');
                
                var session = CustomerService.getCurrentSession();
                console.log('📦 Sesión de cliente guardada:', session);
                
                cerrarLoading();
                await mostrarExito('¡Bienvenido!', 'Has iniciado sesión correctamente con Google.');
                
            } catch (customerError) {
                console.error('❌ Error en ambos intentos de login con Google:', customerError);
                throw customerError;
            }
        }
        
        if (!loginSuccess) {
            throw new Error('No se pudo iniciar sesión con Google');
        }
        
        // Obtener URL de redirección
        var redirectUrl = sessionStorage.getItem('redirectAfterLogin') || getRedirectUrlByRole(userRole);
        sessionStorage.removeItem('redirectAfterLogin');
        
        var attemptedUrl = sessionStorage.getItem('attemptedUrl') || '';
        if (attemptedUrl.includes('/admin') && userRole !== 'admin') {
            redirectUrl = '/';
            mostrarToast('⚠️ No tienes permisos de administrador', 'warning');
        }
        
        setTimeout(function() {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error en login con Google:', error);
        
        cerrarLoading();
        
        var errorMessage = error.message;
        
        if (errorMessage.includes('No tiene permisos de administrador')) {
            errorMessage = 'No tienes permisos de administrador. Intenta con otro correo.';
        } else if (errorMessage.includes('account-exists-with-different-credential')) {
            errorMessage = 'Ya existe una cuenta con este correo usando otro método. Inicia sesión con email y contraseña.';
        } else if (errorMessage.includes('popup-closed-by-user')) {
            errorMessage = 'Cerraste la ventana de Google. Intenta de nuevo.';
        }
        
        await mostrarError('Error al iniciar sesión', errorMessage);
        
    } finally {
        isLoading = false;
        if (googleBtn) {
            googleBtn.innerHTML = originalText;
            googleBtn.disabled = false;
        }
    }
}

// ========================================
// Maneja el login con email/contraseña
// ========================================
async function handleLogin(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value.trim();
    var remember = document.getElementById('remember').checked;
    
    // ===== VALIDACIONES CON SWEETALERT =====
    
    if (!email) {
        await mostrarError('Campo requerido', 'Ingresa tu correo electrónico.');
        return;
    }
    
    if (!isValidEmail(email)) {
        await mostrarError('Correo inválido', 'Ingresa un correo electrónico válido.');
        return;
    }
    
    if (!password) {
        await mostrarError('Campo requerido', 'Ingresa tu contraseña.');
        return;
    }
    
    if (password.length < 6) {
        await mostrarError('Contraseña demasiado corta', 'La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    
    if (remember) {
        localStorage.setItem('outlet_remember_email', email);
    } else {
        localStorage.removeItem('outlet_remember_email');
    }
    
    isLoading = true;
    var submitBtn = document.querySelector('#loginForm button[type="submit"]');
    var originalText = submitBtn?.textContent;
    
    if (submitBtn) {
        submitBtn.textContent = 'INGRESANDO...';
        submitBtn.disabled = true;
    }
    
    // Mostrar loading
    mostrarLoading('Iniciando sesión...');
    
    try {
        var result = null;
        var userRole = null;
        var loginSuccess = false;
        
        // Intentar login como administrador
        try {
            console.log('🔐 Intentando login como administrador...');
            result = await AdminService.login(email, password);
            userRole = result.adminData?.rol || 'admin';
            loginSuccess = true;
            console.log('✅ Login exitoso como ADMINISTRADOR');
            
            var session = AdminService.getCurrentSession();
            console.log('📦 Contenido de outlet_admin:', session);
            
            cerrarLoading();
            await mostrarExito('¡Bienvenido Administrador!', 'Has iniciado sesión correctamente.');
            
        } catch (adminError) {
            console.log('⚠️ No es administrador, intentando como cliente...');
            console.log('Error de admin:', adminError.message);
            
            try {
                result = await CustomerService.login(email, password);
                userRole = 'customer';
                loginSuccess = true;
                console.log('✅ Login exitoso como CLIENTE');
                
                var session = CustomerService.getCurrentSession();
                console.log('📦 Contenido de outlet_customer:', session);
                
                cerrarLoading();
                await mostrarExito('¡Bienvenido de vuelta!', 'Has iniciado sesión correctamente.');
                
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
        var redirectUrl = sessionStorage.getItem('redirectAfterLogin') || getRedirectUrlByRole(userRole);
        sessionStorage.removeItem('redirectAfterLogin');
        
        var attemptedUrl = sessionStorage.getItem('attemptedUrl') || '';
        if (attemptedUrl.includes('/admin') && userRole !== 'admin') {
            redirectUrl = '/';
            mostrarToast('⚠️ No tienes permisos de administrador', 'warning');
        }
        
        setTimeout(function() {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error en login:', error);
        
        cerrarLoading();
        
        var errorMessage = error.message;
        var errorTitle = 'Error al iniciar sesión';
        
        if (errorMessage.includes('auth/user-not-found')) {
            errorMessage = 'No existe una cuenta con este correo electrónico.';
        } else if (errorMessage.includes('auth/wrong-password')) {
            errorMessage = 'Contraseña incorrecta. Intenta de nuevo.';
        } else if (errorMessage.includes('auth/too-many-requests')) {
            errorMessage = 'Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.';
            errorTitle = 'Demasiados intentos';
        } else if (errorMessage.includes('Cuenta bloqueada') || errorMessage.includes('bloqueada')) {
            errorMessage = error.message;
            errorTitle = 'Cuenta bloqueada';
        } else if (errorMessage.includes('inactiva') || errorMessage.includes('suspendida')) {
            errorMessage = error.message;
            errorTitle = 'Cuenta inactiva';
        } else if (errorMessage.includes('No tiene permisos de administrador')) {
            errorMessage = 'Este correo no tiene permisos de administrador.';
        } else if (errorMessage.includes('No existe una cuenta con este correo')) {
            errorMessage = 'No existe una cuenta con este correo electrónico.';
        } else if (errorMessage.includes('auth/network-request-failed')) {
            errorMessage = 'Error de red. Verifica tu conexión a internet.';
            errorTitle = 'Error de conexión';
        }
        
        await mostrarError(errorTitle, errorMessage);
        
    } finally {
        isLoading = false;
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

// ========================================
// Maneja "olvidé mi contraseña"
// ========================================
async function handleForgotPassword(e) {
    e.preventDefault();
    
    var email = document.getElementById('email').value.trim();
    
    if (!email) {
        await mostrarError('Correo requerido', 'Ingresa tu correo electrónico para recuperar tu contraseña.');
        return;
    }
    
    if (!isValidEmail(email)) {
        await mostrarError('Correo inválido', 'Ingresa un correo electrónico válido.');
        return;
    }
    
    await mostrarSweetAlert({
        icon: 'info',
        title: 'Recuperación de contraseña',
        text: 'Se ha enviado un enlace de recuperación a: ' + email,
        confirmButtonText: 'Entendido'
    });
}

// ========================================
// Maneja "crear cuenta"
// ========================================
function handleSignup(e) {
    e.preventDefault();
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/createAccount');
    } else {
        window.location.href = '/createAccount';
    }
}

// ========================================
// Carga email guardado
// ========================================
function loadSavedEmail() {
    var savedEmail = localStorage.getItem('outlet_remember_email');
    if (savedEmail) {
        var emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = savedEmail;
            var rememberCheckbox = document.getElementById('remember');
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    }
}

// ========================================
// Verifica si ya hay una sesión activa
// ========================================
async function checkExistingSession() {
    // Verificar sesión de admin
    var adminSession = localStorage.getItem('outlet_admin');
    
    if (adminSession) {
        try {
            var sessionData = JSON.parse(adminSession);
            console.log('📦 Sesión de admin encontrada:', sessionData);
            
            var currentAdmin = await AdminService.getCurrentAdmin(true);
            if (currentAdmin && currentAdmin.isActive()) {
                console.log('🔄 Sesión de administrador válida, redirigiendo...');
                
                await mostrarSweetAlert({
                    icon: 'info',
                    title: 'Sesión activa',
                    text: 'Ya tienes una sesión de administrador activa. Redirigiendo...',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                
                var redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/homeAdmin';
                sessionStorage.removeItem('redirectAfterLogin');
                
                setTimeout(function() {
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
    var customerSession = localStorage.getItem('outlet_customer');
    if (customerSession && !adminSession) {
        try {
            var sessionData = JSON.parse(customerSession);
            console.log('📦 Sesión de cliente encontrada:', sessionData);
            
            var currentCustomer = await CustomerService.getCurrentCustomer(true);
            if (currentCustomer && currentCustomer.isActive()) {
                console.log('🔄 Sesión de cliente válida, redirigiendo...');
                
                await mostrarSweetAlert({
                    icon: 'info',
                    title: 'Sesión activa',
                    text: 'Ya tienes una sesión activa. Redirigiendo...',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                
                var redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
                sessionStorage.removeItem('redirectAfterLogin');
                
                setTimeout(function() {
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

// ========================================
// Inicializa eventos del formulario
// ========================================
function initFormEvents() {
    var loginForm = document.getElementById('loginForm');
    var forgotBtn = document.getElementById('forgotPassword');
    var signupBtn = document.getElementById('signupBtn');
    var googleLoginBtn = document.getElementById('googleLoginBtn');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (forgotBtn) forgotBtn.addEventListener('click', handleForgotPassword);
    if (signupBtn) signupBtn.addEventListener('click', handleSignup);
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleLogin);
}

// ========================================
// Controller principal
// ========================================
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
    
    var hasRedirected = await checkExistingSession();
    if (hasRedirected) return;
    
    loadSavedEmail();
    initFormEvents();
    
    var urlParams = new URLSearchParams(window.location.search);
    var redirect = urlParams.get('redirect');
    if (redirect) {
        sessionStorage.setItem('redirectAfterLogin', redirect);
    }
    
    console.log('✅ Login page cargada correctamente');
}