/* ========================================
   USER CONTROLLER - Outlet Val
   Gestión de perfil y dirección
   ======================================== */

import { UserService } from '/services/userService.js';
import { AuthService } from '/services/authService.js';

let currentUser = null;

/**
 * Inicializar controlador de perfil
 */
export async function initProfileController() {
    // Verificar autenticación
    if (!AuthService.requireAuth('/login')) return;
    
    await loadUserProfile();
    bindProfileEvents();
    bindDireccionEvents();
    
    console.log('✅ Profile Controller inicializado');
}

/**
 * Cargar perfil del usuario
 */
async function loadUserProfile() {
    const loadingEl = document.getElementById('profile-loading');
    const contentEl = document.getElementById('profile-content');
    
    if (loadingEl) loadingEl.style.display = 'flex';
    
    try {
        currentUser = await UserService.getCurrentUser(true);
        
        if (!currentUser) {
            throw new Error('No se pudo cargar el perfil');
        }
        
        // Rellenar formularios
        fillProfileForm(currentUser);
        fillDireccionForm(currentUser);
        
        // Actualizar UI
        updateProfileUI(currentUser);
        
        if (contentEl) contentEl.style.display = 'block';
        
    } catch (error) {
        console.error('Error cargando perfil:', error);
        showError('Error al cargar perfil: ' + error.message);
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

/**
 * Rellenar formulario de perfil
 */
function fillProfileForm(user) {
    const fields = {
        'profile-nombre': user.nombre,
        'profile-apellido-pa': user.apellidoPa,
        'profile-apellido-ma': user.apellidoMa,
        'profile-email': user.email
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    });
}

/**
 * Rellenar formulario de dirección
 */
function fillDireccionForm(user) {
    const d = user.direccion;
    
    const fields = {
        'dir-destinatario': d.destinatario || user.nombreCompleto,
        'dir-telefono1': d.telefono1,
        'dir-telefono2': d.telefono2,
        'dir-calle': d.calle,
        'dir-numero-exterior': d.numeroExterior,
        'dir-numero-interior': d.numeroInterior,
        'dir-colonia': d.colonia,
        'dir-ciudad': d.ciudad,
        'dir-estado': d.estado,
        'dir-codigo-postal': d.codigoPostal,
        'dir-pais': d.pais || 'México',
        'dir-referencias': d.referencias
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    });
}

/**
 * Actualizar UI con datos del usuario
 */
function updateProfileUI(user) {
    // Actualizar nombre en navbar
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = user.nombreCompleto;
    
    // Actualizar avatar/iniciales
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl) avatarEl.textContent = user.iniciales;
    
    // Mostrar estado de verificación
    const verifiedBadge = document.getElementById('email-verified-badge');
    if (verifiedBadge) {
        verifiedBadge.style.display = user.emailVerified ? 'inline-flex' : 'none';
    }
}

/**
 * Bindear eventos del formulario de perfil
 */
function bindProfileEvents() {
    const form = document.getElementById('profile-form');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    
    if (form) {
        form.addEventListener('submit', handleUpdateProfile);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (currentUser) fillProfileForm(currentUser);
        });
    }
}

/**
 * Bindear eventos del formulario de dirección
 */
function bindDireccionEvents() {
    const form = document.getElementById('direccion-form');
    const cancelBtn = document.getElementById('cancel-direccion-btn');
    
    if (form) {
        form.addEventListener('submit', handleUpdateDireccion);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (currentUser) fillDireccionForm(currentUser);
        });
    }
}

/**
 * Actualizar perfil
 */
async function handleUpdateProfile(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    const errorDiv = document.getElementById('profile-error');
    const successDiv = document.getElementById('profile-success');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    
    // Obtener datos
    const updateData = {
        nombre: document.getElementById('profile-nombre')?.value,
        apellidoPa: document.getElementById('profile-apellido-pa')?.value,
        apellidoMa: document.getElementById('profile-apellido-ma')?.value
    };
    
    // Mostrar loading
    if (submitBtn) {
        submitBtn.textContent = 'Guardando...';
        submitBtn.disabled = true;
    }
    
    try {
        const updated = await UserService.updateProfile(updateData);
        currentUser = updated;
        
        // Mostrar éxito
        if (successDiv) {
            successDiv.textContent = '✅ Perfil actualizado correctamente';
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }
        
        // Actualizar UI
        updateProfileUI(updated);
        
        showToast('Perfil actualizado', 'success');
        
    } catch (error) {
        if (errorDiv) {
            errorDiv.textContent = '❌ ' + error.message;
            errorDiv.style.display = 'block';
        }
        console.error('Error actualizando perfil:', error);
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

/**
 * Actualizar dirección
 */
async function handleUpdateDireccion(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    const errorDiv = document.getElementById('direccion-error');
    const successDiv = document.getElementById('direccion-success');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    
    // Obtener datos de dirección
    const direccionData = {
        destinatario: document.getElementById('dir-destinatario')?.value,
        telefono1: document.getElementById('dir-telefono1')?.value,
        telefono2: document.getElementById('dir-telefono2')?.value,
        calle: document.getElementById('dir-calle')?.value,
        numeroExterior: document.getElementById('dir-numero-exterior')?.value,
        numeroInterior: document.getElementById('dir-numero-interior')?.value,
        colonia: document.getElementById('dir-colonia')?.value,
        ciudad: document.getElementById('dir-ciudad')?.value,
        estado: document.getElementById('dir-estado')?.value,
        codigoPostal: document.getElementById('dir-codigo-postal')?.value,
        pais: document.getElementById('dir-pais')?.value || 'México',
        referencias: document.getElementById('dir-referencias')?.value
    };
    
    // Mostrar loading
    if (submitBtn) {
        submitBtn.textContent = 'Guardando...';
        submitBtn.disabled = true;
    }
    
    try {
        const updated = await UserService.updateDireccion(direccionData);
        currentUser = updated;
        
        if (successDiv) {
            successDiv.textContent = '✅ Dirección guardada correctamente';
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }
        
        showToast('Dirección actualizada', 'success');
        
    } catch (error) {
        if (errorDiv) {
            errorDiv.textContent = '❌ ' + error.message;
            errorDiv.style.display = 'block';
        }
        console.error('Error actualizando dirección:', error);
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

/**
 * Verificar datos para checkout
 */
export async function validateCheckout() {
    const user = await UserService.getCurrentUser(true);
    
    if (!user) {
        window.location.href = '/login';
        return false;
    }
    
    const validation = user.validarParaCompra();
    
    if (!validation.valido) {
        // Mostrar errores
        showToast('❌ Completa tu dirección de envío', 'error');
        window.location.href = '/perfil?tab=direccion';
        return false;
    }
    
    return true;
}