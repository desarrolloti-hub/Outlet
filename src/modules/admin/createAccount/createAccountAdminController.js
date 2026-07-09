/* ========================================
   CREATE ADMIN CONTROLLER - OUTLET VAL
   Controlador para crear administradores (sin validación de roles)
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { AdminService } from '../../../services/adminService.js';

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
 * Muestra alerta de confirmación
 */
function mostrarConfirmacion(titulo, mensaje, confirmText) {
    confirmText = confirmText || 'Sí, confirmar';
    return mostrarSweetAlert({
        title: titulo || '¿Estás seguro?',
        text: mensaje || 'Esta acción requiere tu confirmación.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
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
// Cargar estilos CSS específicos
// ========================================
function loadStyles() {
    if (document.querySelector('link[href*="createAccountAdmin.css"]')) return;
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/admin/createAccount/createAccountAdmin.css';
    document.head.appendChild(link);
}

// ========================================
// Controlador principal
// ========================================
export async function createAccountAdminController() {
    console.log('📝 Create Account Admin Controller iniciado');
    
    loadStyles();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    async function init() {
        // ========== ELEMENTOS DEL DOM ==========
        var form = document.getElementById('createAdminForm');
        var nombreInput = document.getElementById('nombre');
        var apellidoPaInput = document.getElementById('apellidoPa');
        var apellidoMaInput = document.getElementById('apellidoMa');
        var emailInput = document.getElementById('email');
        var roleSelect = document.getElementById('role');
        var passwordInput = document.getElementById('password');
        var confirmInput = document.getElementById('confirmPassword');
        var termsCheckbox = document.getElementById('adminTerms');
        var submitBtn = document.getElementById('submitBtn');
        
        var errorNombre = document.getElementById('errorNombre');
        var errorEmail = document.getElementById('errorEmail');
        var errorPassword = document.getElementById('errorPassword');
        var errorConfirm = document.getElementById('errorConfirm');
        
        var reqLength = document.getElementById('reqLength');
        var reqUppercase = document.getElementById('reqUppercase');
        var reqNumber = document.getElementById('reqNumber');
        var reqSpecial = document.getElementById('reqSpecial');
        
        // ========== ESTADO DE VALIDACIÓN ==========
        var isNombreValid = false;
        var isEmailValid = false;
        var isPasswordValid = false;
        var isConfirmValid = false;
        var isTermsAccepted = false;
        
        // ========== FUNCIONES DE VALIDACIÓN ==========
        function validateNombre() {
            var nombre = nombreInput?.value.trim() || '';
            
            if (nombre.length < 2) {
                if (errorNombre) errorNombre.textContent = 'El nombre debe tener al menos 2 caracteres';
                isNombreValid = false;
            } else {
                if (errorNombre) errorNombre.textContent = '';
                isNombreValid = true;
            }
            validateForm();
        }
        
        function validateEmail() {
            var email = emailInput?.value.trim() || '';
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email)) {
                if (errorEmail) errorEmail.textContent = 'Ingrese un correo electrónico válido';
                isEmailValid = false;
            } else {
                if (errorEmail) errorEmail.textContent = '';
                isEmailValid = true;
            }
            validateForm();
        }
        
        function validatePassword() {
            var password = passwordInput?.value || '';
            
            var hasMinLength = password.length >= 6;
            var hasUppercase = /[A-Z]/.test(password);
            var hasNumber = /[0-9]/.test(password);
            var hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            if (reqLength) {
                reqLength.textContent = hasMinLength ? '✓ Mín. 6 caracteres' : '✗ Mín. 6 caracteres';
                reqLength.classList.toggle('valid', hasMinLength);
                reqLength.classList.toggle('invalid', !hasMinLength);
            }
            if (reqUppercase) {
                reqUppercase.textContent = hasUppercase ? '✓ Una mayúscula' : '✗ Una mayúscula';
                reqUppercase.classList.toggle('valid', hasUppercase);
                reqUppercase.classList.toggle('invalid', !hasUppercase);
            }
            if (reqNumber) {
                reqNumber.textContent = hasNumber ? '✓ Un número' : '✗ Un número';
                reqNumber.classList.toggle('valid', hasNumber);
                reqNumber.classList.toggle('invalid', !hasNumber);
            }
            if (reqSpecial) {
                reqSpecial.textContent = hasSpecial ? '✓ Un carácter especial' : '✗ Un carácter especial';
                reqSpecial.classList.toggle('valid', hasSpecial);
                reqSpecial.classList.toggle('invalid', !hasSpecial);
            }
            
            if (password && (hasMinLength && hasUppercase && hasNumber && hasSpecial)) {
                if (errorPassword) errorPassword.textContent = '';
                isPasswordValid = true;
            } else {
                if (errorPassword && password) errorPassword.textContent = 'La contraseña no cumple con los requisitos';
                isPasswordValid = false;
            }
            
            if (confirmInput?.value) validateConfirm();
            validateForm();
        }
        
        function validateConfirm() {
            var password = passwordInput?.value || '';
            var confirm = confirmInput?.value || '';
            
            if (password !== confirm) {
                if (errorConfirm) errorConfirm.textContent = 'Las contraseñas no coinciden';
                isConfirmValid = false;
            } else if (confirm === '') {
                if (errorConfirm) errorConfirm.textContent = 'Confirme su contraseña';
                isConfirmValid = false;
            } else {
                if (errorConfirm) errorConfirm.textContent = '';
                isConfirmValid = true;
            }
            validateForm();
        }
        
        function validateTerms() {
            isTermsAccepted = termsCheckbox?.checked || false;
            validateForm();
        }
        
        function validateForm() {
            var isValid = isNombreValid && isEmailValid && isPasswordValid && isConfirmValid && isTermsAccepted;
            if (submitBtn) submitBtn.disabled = !isValid;
            return isValid;
        }
        
        // ========== EVENT LISTENERS ==========
        nombreInput?.addEventListener('input', validateNombre);
        emailInput?.addEventListener('input', validateEmail);
        passwordInput?.addEventListener('input', validatePassword);
        confirmInput?.addEventListener('input', validateConfirm);
        termsCheckbox?.addEventListener('change', validateTerms);
        
        // ========== FUNCIÓN PRINCIPAL: CREAR ADMIN ==========
        form?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                await mostrarError('Formulario incompleto', 'Por favor, complete todos los campos correctamente y acepte los términos.');
                return;
            }
            
            // Confirmación antes de crear
            var nombreCompleto = (nombreInput?.value.trim() || '') + ' ' + (apellidoPaInput?.value.trim() || '') + ' ' + (apellidoMaInput?.value.trim() || '');
            var rolSeleccionado = roleSelect?.value || 'admin';
            
            var confirmResult = await mostrarConfirmacion(
                '¿Crear administrador?',
                'Estás a punto de crear un nuevo administrador con el rol "' + rolSeleccionado + '".\n\nNombre: ' + nombreCompleto.trim(),
                'Sí, crear'
            );
            
            if (!confirmResult.isConfirmed) {
                mostrarToast('Creación cancelada', 'info');
                return;
            }
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>🔄 CREANDO...</span>';
            }
            
            mostrarLoading('Creando administrador...');
            
            try {
                var adminData = {
                    nombre: nombreInput?.value.trim() || '',
                    apellidoPa: apellidoPaInput?.value.trim() || '',
                    apellidoMa: apellidoMaInput?.value.trim() || '',
                    email: emailInput?.value.trim().toLowerCase(),
                    rol: roleSelect?.value || 'admin',
                    estado: 'activo'
                };
                
                var password = passwordInput?.value || '';
                
                console.log('📝 Enviando datos al servicio:', adminData);
                
                var result = await AdminService.register(adminData, password, 'super_admin');
                
                cerrarLoading();
                console.log('✅ Admin creado exitosamente:', result);
                
                await mostrarExito(
                    '¡Administrador creado!',
                    '✅ ' + adminData.nombre + ' ha sido creado exitosamente con el rol "' + adminData.rol + '".'
                );
                
                if (form) form.reset();
                isNombreValid = false;
                isEmailValid = false;
                isPasswordValid = false;
                isConfirmValid = false;
                isTermsAccepted = false;
                validateForm();
                
                if (passwordInput) passwordInput.value = '';
                if (confirmInput) confirmInput.value = '';
                
                if (reqLength) {
                    reqLength.textContent = '✗ Mín. 6 caracteres';
                    reqLength.classList.remove('valid');
                    reqLength.classList.add('invalid');
                }
                if (reqUppercase) {
                    reqUppercase.textContent = '✗ Una mayúscula';
                    reqUppercase.classList.remove('valid');
                    reqUppercase.classList.add('invalid');
                }
                if (reqNumber) {
                    reqNumber.textContent = '✗ Un número';
                    reqNumber.classList.remove('valid');
                    reqNumber.classList.add('invalid');
                }
                if (reqSpecial) {
                    reqSpecial.textContent = '✗ Un carácter especial';
                    reqSpecial.classList.remove('valid');
                    reqSpecial.classList.add('invalid');
                }
                
            } catch (error) {
                cerrarLoading();
                console.error('❌ Error al crear administrador:', error);
                await mostrarError('Error al crear administrador', error.message || 'Ocurrió un error inesperado.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>CREAR ADMINISTRADOR</span>';
                }
            }
        });
        
        // Agregar estilos de animación si no existen
        if (!document.querySelector('#toast-styles')) {
            var style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = 
                '@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } ' +
                '@keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } } ' +
                '.outlet-admin-req.valid { color: #10b981; } ' +
                '.outlet-admin-req.invalid { color: #ef4444; }';
            document.head.appendChild(style);
        }
    }
}