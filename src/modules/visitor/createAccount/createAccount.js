/* ========================================
   CREATE ACCOUNT CONTROLLER - OUTLET VAL
   Registro de clientes (customers) con Firebase
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { CustomerService } from '../../../services/customerService.js';

// Estado del controlador
var isLoading = false;

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
    if (document.querySelector('link[href*="createAccount.css"]')) return;
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/createAccount.css';
    document.head.appendChild(link);
}

// ========================================
// Validación de email
// ========================================
function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ========================================
// Validación de nombre completo
// ========================================
function isValidFullName(name) {
    var trimmed = name.trim();
    if (trimmed.length < 4) return false;
    var words = trimmed.split(/\s+/);
    return words.length >= 2 && words.every(function(w) { return w.length >= 2; });
}

// ========================================
// Separar nombre completo
// ========================================
function splitFullName(fullname) {
    var parts = fullname.trim().split(/\s+/);
    
    var nombre = '';
    var apellidoPa = '';
    var apellidoMa = '';
    
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
    
    return { nombre: nombre, apellidoPa: apellidoPa, apellidoMa: apellidoMa };
}

// ========================================
// Validar contraseña
// ========================================
function validatePassword(password) {
    return {
        length: password.length >= 6,
        hasValue: password.length > 0
    };
}

// ========================================
// Actualizar UI de requisitos de contraseña
// ========================================
function updatePasswordRequirements(password) {
    var requirements = validatePassword(password);
    
    var reqLength = document.getElementById('reqLength');
    
    if (reqLength) {
        reqLength.innerHTML = requirements.length ? '✓ Min. 6 characters' : '✗ Min. 6 characters';
        reqLength.className = 'outlet-account-req ' + (requirements.length ? 'valid' : 'invalid');
    }
    
    return requirements.length;
}

// ========================================
// Validar y manejar la foto de perfil
// ========================================
function handleProfilePicture(file) {
    if (!file) return null;
    
    // Validar tipo de archivo
    var validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        mostrarError('Formato no válido', 'Usa JPG, PNG, GIF o WEBP para tu foto de perfil.');
        return null;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        mostrarError('Imagen demasiado grande', 'La imagen no debe pesar más de 5MB.');
        return null;
    }
    
    var reader = new FileReader();
    return new Promise(function(resolve) {
        reader.onload = function(e) {
            var imageUrl = e.target.result;
            // Mostrar preview
            var preview = document.getElementById('profilePreview');
            if (preview) {
                preview.src = imageUrl;
                preview.style.display = 'block';
            }
            // Ocultar placeholder
            var placeholder = document.getElementById('profilePlaceholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            resolve(imageUrl);
        };
        reader.readAsDataURL(file);
    });
}

// ========================================
// Validar formulario completo
// ========================================
async function validateForm() {
    var isValid = true;
    
    var fullname = document.getElementById('fullname').value;
    var errorFullname = document.getElementById('errorFullname');
    if (!isValidFullName(fullname)) {
        errorFullname.textContent = 'Ingresa nombre y apellido válidos';
        isValid = false;
    } else {
        errorFullname.textContent = '';
    }
    
    var email = document.getElementById('email').value;
    var errorEmail = document.getElementById('errorEmail');
    if (!email) {
        errorEmail.textContent = 'El correo es requerido';
        isValid = false;
    } else if (!isValidEmail(email)) {
        errorEmail.textContent = 'Ingresa un correo válido';
        isValid = false;
    } else {
        errorEmail.textContent = '';
    }
    
    var password = document.getElementById('password').value;
    var errorPassword = document.getElementById('errorPassword');
    var passwordValid = validatePassword(password);
    if (!password) {
        errorPassword.textContent = 'La contraseña es requerida';
        isValid = false;
    } else if (!passwordValid.length) {
        errorPassword.textContent = 'La contraseña debe tener al menos 6 caracteres';
        isValid = false;
    } else {
        errorPassword.textContent = '';
    }
    
    var confirmPassword = document.getElementById('confirmPassword').value;
    var errorConfirm = document.getElementById('errorConfirm');
    if (password !== confirmPassword) {
        errorConfirm.textContent = 'Las contraseñas no coinciden';
        isValid = false;
    } else {
        errorConfirm.textContent = '';
    }
    
    var terms = document.getElementById('terms').checked;
    if (!terms) {
        await mostrarError('Acepta los términos', 'Debes aceptar los Términos y Condiciones para continuar.');
        isValid = false;
    }
    
    return isValid;
}

// ========================================
// Manejar registro con Google
// ========================================
async function handleGoogleRegister() {
    if (isLoading) return;
    
    isLoading = true;
    
    var googleBtn = document.getElementById('googleRegisterBtn');
    var originalText = googleBtn?.innerHTML;
    
    if (googleBtn) {
        googleBtn.innerHTML = '<span>⏳ CARGANDO...</span>';
        googleBtn.disabled = true;
    }
    
    // Mostrar loading
    mostrarLoading('Iniciando sesión con Google...');
    
    try {
        var result = await CustomerService.login(null, null, true);
        
        // Si hay foto de Google, mostrarla en el preview
        if (result.user?.photoURL) {
            var preview = document.getElementById('profilePreview');
            if (preview) {
                preview.src = result.user.photoURL;
                preview.style.display = 'block';
            }
            var placeholder = document.getElementById('profilePlaceholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        }
        
        cerrarLoading();
        await mostrarExito(
            '¡Cuenta creada con Google!',
            'Tu cuenta ha sido creada exitosamente con Google.'
        );
        
        // Redirigir a la página principal
        setTimeout(function() {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/');
            } else {
                window.location.href = '/';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error en registro con Google:', error);
        cerrarLoading();
        
        var errorMessage = error.message;
        if (errorMessage.includes('popup-closed-by-user')) {
            errorMessage = 'Cerraste la ventana de Google. Intenta de nuevo.';
        } else if (errorMessage.includes('account-exists-with-different-credential')) {
            errorMessage = 'Ya existe una cuenta con este correo usando otro método. Inicia sesión con email y contraseña.';
        }
        
        await mostrarError('Error al crear cuenta', errorMessage);
        
    } finally {
        isLoading = false;
        if (googleBtn) {
            googleBtn.innerHTML = originalText;
            googleBtn.disabled = false;
        }
    }
}

// ========================================
// Manejar envío del formulario con Firebase
// ========================================
async function handleRegister(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    var isValid = await validateForm();
    if (!isValid) return;
    
    var fullname = document.getElementById('fullname').value.trim();
    var email = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var password = document.getElementById('password').value;
    var newsletter = document.getElementById('newsletter').checked;
    
    // Obtener foto de perfil (si se subió)
    var fotoPerfil = '';
    var fileInput = document.getElementById('profilePhoto');
    if (fileInput && fileInput.files.length > 0) {
        try {
            var imageUrl = await handleProfilePicture(fileInput.files[0]);
            if (imageUrl) {
                fotoPerfil = imageUrl;
            }
        } catch (error) {
            console.error('Error al procesar la foto:', error);
        }
    }
    
    var nombreCompleto = splitFullName(fullname);
    
    var customerData = {
        nombre: nombreCompleto.nombre,
        apellidoPa: nombreCompleto.apellidoPa,
        apellidoMa: nombreCompleto.apellidoMa,
        email: email,
        fotoPerfil: fotoPerfil,
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
    
    isLoading = true;
    var submitBtn = document.querySelector('#createAccountForm button[type="submit"]');
    var originalText = submitBtn?.textContent;
    
    if (submitBtn) {
        submitBtn.textContent = 'Creando cuenta...';
        submitBtn.disabled = true;
    }
    
    // Mostrar loading
    mostrarLoading('Creando tu cuenta...');
    
    try {
        var result = await CustomerService.register(customerData, password);
        
        cerrarLoading();
        await mostrarExito(
            '¡Cuenta creada exitosamente!',
            'Te hemos enviado un correo para verificar tu cuenta. Revisa tu bandeja de entrada.'
        );
        
        // Resetear formulario
        document.getElementById('createAccountForm').reset();
        
        // Resetear preview
        var preview = document.getElementById('profilePreview');
        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }
        var placeholder = document.getElementById('profilePlaceholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
        }
        
        // Resetear requisitos de contraseña
        updatePasswordRequirements('');
        
        setTimeout(function() {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/verificar-email');
            } else {
                window.location.href = '/verificar-email';
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error en registro:', error);
        cerrarLoading();
        
        var errorMessage = error.message;
        var errorTitle = 'Error al crear cuenta';
        
        if (errorMessage.includes('auth/email-already-in-use')) {
            errorMessage = 'Este correo electrónico ya está registrado. Inicia sesión o usa otro correo.';
        } else if (errorMessage.includes('auth/weak-password')) {
            errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (errorMessage.includes('auth/network-request-failed')) {
            errorMessage = 'Error de red. Verifica tu conexión a internet.';
            errorTitle = 'Error de conexión';
        } else if (errorMessage.includes('Cuenta bloqueada')) {
            errorMessage = error.message;
            errorTitle = 'Cuenta bloqueada';
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
// Manejar redirección a login
// ========================================
function handleLoginRedirect(e) {
    e.preventDefault();
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/login');
    } else {
        window.location.href = '/login';
    }
}

// ========================================
// Manejar clic en términos
// ========================================
function handleTerms(e) {
    e.preventDefault();
    mostrarSweetAlert({
        icon: 'info',
        title: 'Términos y Condiciones',
        html: 'Por favor, lee nuestros Términos y Condiciones en el sitio web.<br><br><span style="font-size:0.9rem; color: var(--outlet-text-secondary);">Al crear una cuenta, aceptas nuestras políticas de privacidad.</span>',
        confirmButtonText: 'Entendido'
    });
}

// ========================================
// Inicializar el campo de foto de perfil
// ========================================
function initProfilePictureUpload() {
    var fileInput = document.getElementById('profilePhoto');
    var dropZone = document.getElementById('profileDropZone');
    
    if (!fileInput || !dropZone) return;
    
    // Click en la zona de drop para abrir el selector de archivos
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            var file = e.dataTransfer.files[0];
            fileInput.files = e.dataTransfer.files;
            handleProfilePicture(file);
        }
    });
    
    // Cambio de archivo seleccionado
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleProfilePicture(e.target.files[0]);
        }
    });
}

// ========================================
// Inicializar validación en tiempo real
// ========================================
function initRealtimeValidation() {
    var passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function(e) {
            updatePasswordRequirements(e.target.value);
            
            var confirm = document.getElementById('confirmPassword');
            if (confirm.value) {
                var errorConfirm = document.getElementById('errorConfirm');
                if (e.target.value !== confirm.value) {
                    errorConfirm.textContent = 'Las contraseñas no coinciden';
                } else {
                    errorConfirm.textContent = '';
                }
            }
        });
    }
    
    var confirmInput = document.getElementById('confirmPassword');
    if (confirmInput) {
        confirmInput.addEventListener('input', function(e) {
            var password = document.getElementById('password').value;
            var errorConfirm = document.getElementById('errorConfirm');
            if (password !== e.target.value) {
                errorConfirm.textContent = 'Las contraseñas no coinciden';
            } else {
                errorConfirm.textContent = '';
            }
        });
    }
}

// ========================================
// Controlador principal
// ========================================
export async function createAccountController() {
    console.log('📝 Create Account Controller - Registro de clientes con Firebase');
    
    loadStyles();
    initRealtimeValidation();
    initProfilePictureUpload();
    
    var registerForm = document.getElementById('createAccountForm');
    var loginBtn = document.getElementById('loginBtn');
    var termsLink = document.getElementById('termsLink');
    var googleRegisterBtn = document.getElementById('googleRegisterBtn');
    
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (loginBtn) loginBtn.addEventListener('click', handleLoginRedirect);
    if (termsLink) termsLink.addEventListener('click', handleTerms);
    if (googleRegisterBtn) googleRegisterBtn.addEventListener('click', handleGoogleRegister);
    
    console.log('✅ Create Account page loaded with CustomerService');
}