/* ========================================
   CREATE ACCOUNT CONTROLLER - OUTLET VAL
   Registro de clientes (customers) con Firebase
   ======================================== */

import { CustomerService } from '/services/customerService.js';

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
        length: password.length >= 6,
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
 * 🆕 Validar y manejar la foto de perfil
 */
function handleProfilePicture(file) {
    if (!file) return null;
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showNotification('❌ Formato de imagen no válido. Usa JPG, PNG, GIF o WEBP', true);
        return null;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('❌ La imagen no debe pesar más de 5MB', true);
        return null;
    }
    
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            // Mostrar preview
            const preview = document.getElementById('profilePreview');
            if (preview) {
                preview.src = imageUrl;
                preview.style.display = 'block';
            }
            // Ocultar placeholder
            const placeholder = document.getElementById('profilePlaceholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            resolve(imageUrl);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Validar formulario completo
 */
function validateForm() {
    let isValid = true;
    
    const fullname = document.getElementById('fullname').value;
    const errorFullname = document.getElementById('errorFullname');
    if (!isValidFullName(fullname)) {
        errorFullname.textContent = 'Ingresa nombre y apellido válidos';
        isValid = false;
    } else {
        errorFullname.textContent = '';
    }
    
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
    
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorConfirm = document.getElementById('errorConfirm');
    if (password !== confirmPassword) {
        errorConfirm.textContent = 'Las contraseñas no coinciden';
        isValid = false;
    } else {
        errorConfirm.textContent = '';
    }
    
    const terms = document.getElementById('terms').checked;
    if (!terms) {
        showNotification('❌ Debes aceptar los Términos y Condiciones', true);
        isValid = false;
    }
    
    return isValid;
}

/**
 * Manejar registro con Google
 */
async function handleGoogleRegister() {
    if (isLoading) return;
    
    isLoading = true;
    
    // Mostrar loading en el botón de Google
    const googleBtn = document.getElementById('googleRegisterBtn');
    const originalText = googleBtn?.innerHTML;
    
    if (googleBtn) {
        googleBtn.innerHTML = '<span>⏳ CARGANDO...</span>';
        googleBtn.disabled = true;
    }
    
    try {
        // Usar el login con Google del CustomerService
        const result = await CustomerService.login(null, null, true);
        
        // 🆕 Si hay foto de Google, mostrarla en el preview
        if (result.user?.photoURL) {
            const preview = document.getElementById('profilePreview');
            if (preview) {
                preview.src = result.user.photoURL;
                preview.style.display = 'block';
            }
            const placeholder = document.getElementById('profilePlaceholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        }
        
        showNotification('✅ ¡Cuenta creada con Google exitosamente!');
        
        // Redirigir a la página principal
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        
    } catch (error) {
        console.error('Error en registro con Google:', error);
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
 * Manejar envío del formulario con Firebase
 */
async function handleRegister(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!validateForm()) {
        return;
    }
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const newsletter = document.getElementById('newsletter').checked;
    
    // 🆕 Obtener foto de perfil (si se subió)
    let fotoPerfil = '';
    const fileInput = document.getElementById('profilePhoto');
    if (fileInput && fileInput.files.length > 0) {
        try {
            const imageUrl = await handleProfilePicture(fileInput.files[0]);
            if (imageUrl) {
                fotoPerfil = imageUrl;
            }
        } catch (error) {
            console.error('Error al procesar la foto:', error);
        }
    }
    
    const { nombre, apellidoPa, apellidoMa } = splitFullName(fullname);
    
    const customerData = {
        nombre: nombre,
        apellidoPa: apellidoPa,
        apellidoMa: apellidoMa,
        email: email,
        fotoPerfil: fotoPerfil, // 🆕
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
    const submitBtn = document.querySelector('#createAccountForm button[type="submit"]');
    const originalText = submitBtn?.textContent;
    
    if (submitBtn) {
        submitBtn.textContent = 'Creando cuenta...';
        submitBtn.disabled = true;
    }
    
    try {
        const result = await CustomerService.register(customerData, password);
        
        showNotification('✅ ¡Cuenta creada exitosamente! Revisa tu correo para verificar tu cuenta.');
        
        document.getElementById('createAccountForm').reset();
        
        // 🆕 Resetear preview
        const preview = document.getElementById('profilePreview');
        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }
        const placeholder = document.getElementById('profilePlaceholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
        }
        
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
 * 🆕 Inicializar el campo de foto de perfil
 */
function initProfilePictureUpload() {
    const fileInput = document.getElementById('profilePhoto');
    const dropZone = document.getElementById('profileDropZone');
    
    if (!fileInput || !dropZone) return;
    
    // Click en la zona de drop para abrir el selector de archivos
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            fileInput.files = e.dataTransfer.files;
            handleProfilePicture(file);
        }
    });
    
    // Cambio de archivo seleccionado
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleProfilePicture(e.target.files[0]);
        }
    });
}

/**
 * Inicializar validación en tiempo real
 */
function initRealtimeValidation() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordRequirements(e.target.value);
            
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
    console.log('📝 Create Account Controller - Registro de clientes con Firebase');
    
    loadStyles();
    initRealtimeValidation();
    initProfilePictureUpload(); // 🆕
    
    const registerForm = document.getElementById('createAccountForm');
    const loginBtn = document.getElementById('loginBtn');
    const termsLink = document.getElementById('termsLink');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (loginBtn) loginBtn.addEventListener('click', handleLoginRedirect);
    if (termsLink) termsLink.addEventListener('click', handleTerms);
    if (googleRegisterBtn) googleRegisterBtn.addEventListener('click', handleGoogleRegister);
    
    console.log('✅ Create Account page loaded with CustomerService');
}