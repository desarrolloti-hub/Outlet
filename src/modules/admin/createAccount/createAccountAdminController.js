/* ========================================
   CREATE ADMIN CONTROLLER - OUTLET VAL
   Controlador para crear administradores (sin validación de roles)
   ======================================== */

// ✅ RUTAS CORREGIDAS
import { AdminService } from '/services/adminService.js';

/**
 * Mostrar notificación toast
 */
function showToast(message, isSuccess = true) {
    const existingToast = document.querySelector('.admin-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${isSuccess ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Cargar estilos CSS específicos
 */
function loadStyles() {
    if (document.querySelector('link[href*="createAccountAdmin.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/admin/createAccount/createAccountAdmin.css';
    document.head.appendChild(link);
}

/**
 * Controlador principal (sin validación de roles)
 */
export async function createAccountAdminController() {
    console.log('📝 Create Account Admin Controller iniciado');
    
    loadStyles();
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    async function init() {
        // ========== ELEMENTOS DEL DOM ==========
        const form = document.getElementById('createAdminForm');
        const nombreInput = document.getElementById('nombre');
        const apellidoPaInput = document.getElementById('apellidoPa');
        const apellidoMaInput = document.getElementById('apellidoMa');
        const emailInput = document.getElementById('email');
        const roleSelect = document.getElementById('role');
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirmPassword');
        const termsCheckbox = document.getElementById('adminTerms');
        const submitBtn = document.getElementById('submitBtn');
        
        // Elementos de error
        const errorNombre = document.getElementById('errorNombre');
        const errorEmail = document.getElementById('errorEmail');
        const errorPassword = document.getElementById('errorPassword');
        const errorConfirm = document.getElementById('errorConfirm');
        
        // Requisitos de contraseña
        const reqLength = document.getElementById('reqLength');
        const reqUppercase = document.getElementById('reqUppercase');
        const reqNumber = document.getElementById('reqNumber');
        const reqSpecial = document.getElementById('reqSpecial');
        
        // ========== ESTADO DE VALIDACIÓN ==========
        let isNombreValid = false;
        let isEmailValid = false;
        let isPasswordValid = false;
        let isConfirmValid = false;
        let isTermsAccepted = false;
        
        // ========== FUNCIONES DE VALIDACIÓN ==========
        function validateNombre() {
            const nombre = nombreInput?.value.trim() || '';
            
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
            const email = emailInput?.value.trim() || '';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
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
            const password = passwordInput?.value || '';
            
            const hasMinLength = password.length >= 6;
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            // Actualizar UI
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
            const password = passwordInput?.value || '';
            const confirm = confirmInput?.value || '';
            
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
            const isValid = isNombreValid && isEmailValid && isPasswordValid && isConfirmValid && isTermsAccepted;
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
                showToast('❌ Por favor complete todos los campos correctamente y acepte los términos', false);
                return;
            }
            
            // Cambiar estado del botón
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>🔄 CREANDO...</span>';
            }
            
            try {
                // Datos para el servicio
                const adminData = {
                    nombre: nombreInput?.value.trim() || '',
                    apellidoPa: apellidoPaInput?.value.trim() || '',
                    apellidoMa: apellidoMaInput?.value.trim() || '',
                    email: emailInput?.value.trim().toLowerCase(),
                    rol: roleSelect?.value || 'admin',
                    estado: 'activo'
                };
                
                const password = passwordInput?.value || '';
                
                console.log('📝 Enviando datos al servicio:', adminData);
                
                // LLAMADA AL SERVICE (sin validación de roles)
                // Nota: AdminService.register espera 3 parámetros: adminData, password, currentAdminRole
                // Como no tenemos validación, pasamos 'super_admin' como rol para que permita la creación
                const result = await AdminService.register(adminData, password, 'super_admin');
                
                console.log('✅ Admin creado exitosamente:', result);
                showToast(`✅ Administrador ${adminData.nombre} creado exitosamente`, true);
                
                // Resetear formulario
                if (form) form.reset();
                isNombreValid = false;
                isEmailValid = false;
                isPasswordValid = false;
                isConfirmValid = false;
                isTermsAccepted = false;
                validateForm();
                
                // Limpiar campos de contraseña visualmente
                if (passwordInput) passwordInput.value = '';
                if (confirmInput) confirmInput.value = '';
                
                // Resetear requisitos de contraseña
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
                console.error('❌ Error al crear administrador:', error);
                showToast(`❌ ${error.message}`, false);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>CREAR ADMINISTRADOR</span>';
                }
            }
        });
        
        // Agregar estilos de animación si no existen
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .outlet-admin-req.valid { color: #10b981; }
                .outlet-admin-req.invalid { color: #ef4444; }
            `;
            document.head.appendChild(style);
        }
    }
}