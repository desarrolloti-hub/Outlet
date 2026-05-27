/* ========================================
   CREATE ACCOUNT CONTROLLER - OUTLET VAL
   Registro de usuarios con Firebase
   ======================================== */

import { UserService } from '/services/userService.js';
import { AuthService } from '/services/authService.js';

// Estado del controlador
let isLoading = false;

/**
 * Cargar estilos CSS
 */
function loadStyles() {
    if (document.querySelector('link[href*="createAccount.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/createAccount.css';
    document.head.appendChild(link);
}

/**
 * Mostrar notificación toast
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
 * Validar formato de email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validar nombre completo (al menos nombre y apellido)
 */
function isValidFullName(name) {
    const trimmed = name.trim();
    if (trimmed.length < 4) return false;
    const words = trimmed.split(/\s+/);
    return words.length >= 2 && words.every(w => w.length >= 2);
}

/**
 * Separar nombre completo en nombre, apellido paterno y materno
 */
function splitFullName(fullname) {
    const parts = fullname.trim().split(/\s+/);
    
    let nombre = '';
    let apellidoPa = '';
    let apellidoMa = '';
    
    if (parts.length === 1) {
        nombre = parts[0];
        apellidoPa = '';
        apellidoMa = '';
    } else if (parts.length === 2) {
        nombre = parts[0];
        apellidoPa = parts[1];
        apellidoMa = '';
    } else {
        nombre = parts[0];
        apellidoPa = parts[1];
        apellidoMa = parts.slice(2).join(' ');
    }
    
    return { nombre, apellidoPa, apellidoMa };
}

/**
 * Validar contraseña y devolver requisitos
 */
function validatePassword(password) {
    return {
        length: password.length >= 6,  // Firebase requiere mínimo 6
        hasValue: password.length > 0
    };
}

/**
 * Actualizar UI de requisitos de contraseña
 */
function updatePasswordRequirements(password) {
    const requirements = validatePassword(password);
    
    const reqLength = document.getElementById('reqLength');
    
    if (reqLength) {
        reqLength.innerHTML = requirements.length ? '✓ Min. 6 characters' : '✗ Min. 6 characters';
        reqLength.className = `outlet-account-req ${requirements.length ? 'valid' : 'invalid'}`;
    }
    
    return requirements.length;
}

/**
 * Validar formulario completo
 */
function validateForm() {
    let isValid = true;
    
    // Validar nombre completo
    const fullname = document.getElementById('fullname').value;
    const errorFullname = document.getElementById('errorFullname');
    if (!isValidFullName(fullname)) {
        errorFullname.textContent = 'Ingresa nombre y apellido válidos';
        isValid = false;
    } else {
        errorFullname.textContent = '';
    }
    
    // Validar email
    const email = document.getElementById('email').value;
    const errorEmail = document.getElementById('errorEmail');
    if (!email) {
        errorEmail.textContent = 'El correo es requerido';
        isValid = false;
    } else if (!isValidEmail(email)) {
        errorEmail.textContent = 'Ingresa un correo válido';
        isValid = false;
    } else {
        errorEmail.textContent = '';
    }
    
    // Validar contraseña
    const password = document.getElementById('password').value;
    const errorPassword = document.getElementById('errorPassword');
    const passwordValid = validatePassword(password);
    if (!password) {
        errorPassword.textContent = 'La contraseña es requerida';
        isValid = false;
    } else if (!passwordValid.length) {
        errorPassword.textContent = 'La contraseña debe tener al menos 6 caracteres';
        isValid = false;
    } else {
        errorPassword.textContent = '';
    }
    
    // Validar confirmación
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorConfirm = document.getElementById('errorConfirm');
    if (password !== confirmPassword) {
        errorConfirm.textContent = 'Las contraseñas no coinciden';
        isValid = false;
    } else {
        errorConfirm.textContent = '';
    }
    
    // Validar términos
    const terms = document.getElementById('terms').checked;
    if (!terms) {
        showNotification('❌ Debes aceptar los Términos y Condiciones', true);
        isValid = false;
    }
    
    return isValid;
}

/**
 * Manejar envío del formulario con Firebase
 */
async function handleRegister(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!validateForm()) {
        return;
    }
    
    // Obtener valores del formulario
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const newsletter = document.getElementById('newsletter').checked;
    
    // Separar nombre completo
    const { nombre, apellidoPa, apellidoMa } = splitFullName(fullname);
    
    // Preparar datos del usuario
    const userData = {
        nombre: nombre,
        apellidoPa: apellidoPa,
        apellidoMa: apellidoMa,
        email: email,
        direccion: {
            destinatario: fullname,
            telefono1: phone,
            telefono2: '',
            calle: '',
            numeroExterior: '',
            numeroInterior: '',
            colonia: '',
            ciudad: '',
            estado: '',
            codigoPostal: '',
            pais: 'México',
            referencias: ''
        },
        preferencias: {
            newsletter: newsletter,
            notificaciones: true
        }
    };
    
    // Deshabilitar botón y mostrar loading
    isLoading = true;
    const submitBtn = document.querySelector('#createAccountForm button[type="submit"]');
    const originalText = submitBtn?.textContent;
    
    if (submitBtn) {
        submitBtn.textContent = 'Creando cuenta...';
        submitBtn.disabled = true;
    }
    
    try {
        // Registrar en Firebase
        const result = await UserService.register(userData, password);
        
        showNotification('✅ ¡Cuenta creada exitosamente! Revisa tu correo para verificar tu cuenta.');
        
        // Limpiar formulario
        document.getElementById('createAccountForm').reset();
        
        // Redirigir a página de verificación o login
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/verificar-email');
            } else {
                window.location.href = '/verificar-email';
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error en registro:', error);
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
 * Manejar redirección a login
 */
function handleLoginRedirect(e) {
    e.preventDefault();
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/login');
    } else {
        window.location.href = '/login';
    }
}

/**
 * Manejar clic en términos
 */
function handleTerms(e) {
    e.preventDefault();
    showNotification('📜 Por favor lee nuestros Términos y Condiciones en el sitio web');
}

/**
 * Inicializar validación en tiempo real
 */
function initRealtimeValidation() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordRequirements(e.target.value);
            
            // Validar confirmación en tiempo real
            const confirm = document.getElementById('confirmPassword');
            if (confirm.value) {
                const errorConfirm = document.getElementById('errorConfirm');
                if (e.target.value !== confirm.value) {
                    errorConfirm.textContent = 'Las contraseñas no coinciden';
                } else {
                    errorConfirm.textContent = '';
                }
            }
        });
    }
    
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput) {
        confirmInput.addEventListener('input', (e) => {
            const password = document.getElementById('password').value;
            const errorConfirm = document.getElementById('errorConfirm');
            if (password !== e.target.value) {
                errorConfirm.textContent = 'Las contraseñas no coinciden';
            } else {
                errorConfirm.textContent = '';
            }
        });
    }
}

/**
 * Controlador principal
 */
export async function createAccountController() {
    console.log('📝 Create Account Controller - Registro con Firebase');
    
    // Cargar estilos
    loadStyles();
    
    // Inicializar validación en tiempo real
    initRealtimeValidation();
    
    // Bindear eventos del formulario
    const registerForm = document.getElementById('createAccountForm');
    const loginBtn = document.getElementById('loginBtn');
    const termsLink = document.getElementById('termsLink');
    
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (loginBtn) loginBtn.addEventListener('click', handleLoginRedirect);
    if (termsLink) termsLink.addEventListener('click', handleTerms);
    
    console.log('✅ Create Account page loaded with Firebase');
}