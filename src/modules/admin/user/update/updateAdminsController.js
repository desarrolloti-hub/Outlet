/* ========================================
   UPDATE ADMINS CONTROLLER - OUTLET ADMIN
   Controlador para editar administradores existentes
   Basado en el estilo de updateCategoriesController
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { AdminService } from '../../../../services/adminService.js';

// ========================================
// Variables de estado
// ========================================
var admins = [];
var currentAdminId = null;
var isSubmitting = false;

// ========================================
// DOM Elements
// ========================================
var elements = {};

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
// Cache de elementos DOM
// ========================================
function cacheElements() {
    elements = {
        backBtn: document.getElementById('backBtn'),
        
        adminForm: document.getElementById('updateAdminForm'),
        adminSelector: document.getElementById('adminSelector'),
        adminId: document.getElementById('adminId'),
        adminIdDisplay: document.getElementById('adminIdDisplay'),
        adminName: document.getElementById('adminName'),
        adminEmail: document.getElementById('adminEmail'),
        adminPassword: document.getElementById('adminPassword'),
        adminConfirmPassword: document.getElementById('adminConfirmPassword'),
        adminPhone: document.getElementById('adminPhone'),
        adminRole: document.getElementById('adminRole'),
        adminStatus: document.getElementById('adminStatus'),
        adminIcon: document.getElementById('adminIcon'),
        adminCreatedAt: document.getElementById('adminCreatedAt'),
        
        formFields: document.getElementById('formFields'),
        actionButtons: document.getElementById('actionButtons'),
        
        saveBtn: document.getElementById('saveBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        
        previewCard: document.getElementById('previewCard'),
        adminPreviewInfo: document.getElementById('adminPreviewInfo'),
        
        toast: document.getElementById('updateToast')
    };
}

// ========================================
// Utilidades
// ========================================
function getRoleLabel(role) {
    var labels = {
        'super_admin': 'Super Administrador',
        'admin': 'Administrador',
        'manager': 'Manager',
        'editor': 'Editor'
    };
    return labels[role] || role;
}

function getRoleClass(role) {
    var classes = {
        'super_admin': 'badge-super_admin',
        'admin': 'badge-admin',
        'manager': 'badge-manager',
        'editor': 'badge-editor'
    };
    return classes[role] || '';
}

function getStatusClass(status) {
    return status === 'active' ? 'badge-active' : 'badge-inactive';
}

function getStatusLabel(status) {
    return status === 'active' ? 'Activo' : 'Inactivo';
}

function formatDate(dateString) {
    if (!dateString) return 'No disponible';
    var date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ========================================
// Cargar administradores
// ========================================
async function loadAdmins() {
    try {
        admins = await AdminService.getAll({}, false);
        populateAdminSelector();
    } catch (error) {
        console.error('Error al cargar administradores:', error);
        await mostrarError('Error al cargar administradores', error.message || 'No se pudieron cargar los administradores.');
        admins = [];
        populateAdminSelector();
    }
}

function populateAdminSelector() {
    if (!elements.adminSelector) return;
    
    if (admins.length === 0) {
        elements.adminSelector.innerHTML = '<option value="">-- No hay administradores disponibles --</option>';
        return;
    }
    
    var html = '<option value="">-- Seleccione un administrador --</option>';
    admins.forEach(function(admin) {
        html += '<option value="' + admin.id + '">' + escapeHtml(admin.name) + ' (' + escapeHtml(admin.email) + ')</option>';
    });
    elements.adminSelector.innerHTML = html;
}

// ========================================
// Cargar datos del administrador seleccionado
// ========================================
function onAdminSelect() {
    var selectedId = elements.adminSelector.value;
    
    if (!selectedId) {
        elements.formFields.disabled = true;
        elements.actionButtons.style.display = 'none';
        elements.previewCard.style.display = 'none';
        clearForm();
        return;
    }
    
    var admin = admins.find(function(a) { return a.id === selectedId; });
    if (!admin) return;
    
    currentAdminId = selectedId;
    
    elements.adminId.value = admin.id;
    elements.adminIdDisplay.value = admin.id;
    elements.adminName.value = admin.name;
    elements.adminEmail.value = admin.email;
    elements.adminPassword.value = '';
    elements.adminConfirmPassword.value = '';
    elements.adminPhone.value = admin.phone || '';
    elements.adminRole.value = admin.role || 'admin';
    elements.adminStatus.value = admin.status || 'active';
    elements.adminIcon.value = admin.icon || '';
    elements.adminCreatedAt.value = formatDate(admin.createdAt);
    
    elements.formFields.disabled = false;
    elements.actionButtons.style.display = 'flex';
    
    renderPreview(admin);
    elements.previewCard.style.display = 'block';
}

function clearForm() {
    elements.adminId.value = '';
    elements.adminIdDisplay.value = '';
    elements.adminName.value = '';
    elements.adminEmail.value = '';
    elements.adminPassword.value = '';
    elements.adminConfirmPassword.value = '';
    elements.adminPhone.value = '';
    elements.adminRole.value = 'admin';
    elements.adminStatus.value = 'active';
    elements.adminIcon.value = '';
    elements.adminCreatedAt.value = '';
}

function renderPreview(admin) {
    if (!elements.adminPreviewInfo) return;
    
    var html = 
        '<div class="updateadmin-preview-info">' +
            '<div class="updateadmin-preview-item">' +
                '<span class="updateadmin-preview-label">ID</span>' +
                '<span class="updateadmin-preview-value"><code>' + escapeHtml(admin.id) + '</code></span>' +
            '</div>' +
            '<div class="updateadmin-preview-item">' +
                '<span class="updateadmin-preview-label">Nombre</span>' +
                '<span class="updateadmin-preview-value">' + escapeHtml(admin.name) + '</span>' +
            '</div>' +
            '<div class="updateadmin-preview-item">' +
                '<span class="updateadmin-preview-label">Email</span>' +
                '<span class="updateadmin-preview-value">' + escapeHtml(admin.email) + '</span>' +
            '</div>' +
            '<div class="updateadmin-preview-item">' +
                '<span class="updateadmin-preview-label">Teléfono</span>' +
                '<span class="updateadmin-preview-value">' + (admin.phone || '—') + '</span>' +
            '</div>' +
            '<div class="updateadmin-preview-item">' +
                '<span class="updateadmin-preview-label">Rol</span>' +
                '<span class="updateadmin-preview-value"><span class="badge ' + getRoleClass(admin.role) + '">' + getRoleLabel(admin.role) + '</span></span>' +
            '</div>' +
            '<div class="updateadmin-preview-item">' +
                '<span class="updateadmin-preview-label">Estado</span>' +
                '<span class="updateadmin-preview-value"><span class="badge ' + getStatusClass(admin.status) + '">' + getStatusLabel(admin.status) + '</span></span>' +
            '</div>' +
            '<div class="updateadmin-preview-item">' +
                '<span class="updateadmin-preview-label">Avatar</span>' +
                '<span class="updateadmin-preview-value"><span class="material-symbols-outlined" style="font-size: 24px;">' + (admin.icon || 'person') + '</span> ' + (admin.icon || 'person') + '</span>' +
            '</div>' +
            '<div class="updateadmin-preview-item">' +
                '<span class="updateadmin-preview-label">Creado</span>' +
                '<span class="updateadmin-preview-value">' + formatDate(admin.createdAt) + '</span>' +
            '</div>' +
        '</div>';
    
    elements.adminPreviewInfo.innerHTML = html;
}

// ========================================
// Actualizar administrador CON SWEETALERT2
// ========================================
async function updateAdmin(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    if (!currentAdminId) {
        await mostrarError('Sin selección', 'Seleccione un administrador para actualizar.');
        return;
    }
    
    var name = elements.adminName.value.trim();
    if (!name) {
        await mostrarError('Campo requerido', 'El nombre es obligatorio.');
        elements.adminName.focus();
        return;
    }
    
    var email = elements.adminEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        await mostrarError('Email inválido', 'Ingrese un correo electrónico válido.');
        elements.adminEmail.focus();
        return;
    }
    
    var password = elements.adminPassword.value;
    var confirmPassword = elements.adminConfirmPassword.value;
    
    if (password) {
        if (password.length < 8) {
            await mostrarError('Contraseña corta', 'La contraseña debe tener al menos 8 caracteres.');
            elements.adminPassword.focus();
            return;
        }
        if (password !== confirmPassword) {
            await mostrarError('Contraseñas no coinciden', 'Las contraseñas no coinciden.');
            elements.adminConfirmPassword.focus();
            return;
        }
    }
    
    var adminData = {
        name: name,
        email: email,
        phone: elements.adminPhone.value.trim(),
        role: elements.adminRole.value,
        status: elements.adminStatus.value,
        icon: elements.adminIcon.value.trim()
    };
    
    if (password) {
        adminData.password = password;
    }
    
    // Confirmación antes de actualizar
    var confirmResult = await mostrarConfirmacion(
        '¿Actualizar administrador?',
        'Estás a punto de actualizar al administrador "' + name + '".',
        'Sí, actualizar'
    );
    
    if (!confirmResult.isConfirmed) {
        mostrarToast('Actualización cancelada', 'info');
        return;
    }
    
    isSubmitting = true;
    var btn = elements.saveBtn;
    var originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="material-symbols-outlined">hourglass_empty</i> Actualizando...';
    btn.disabled = true;
    
    mostrarLoading('Actualizando administrador...');
    
    try {
        var updatedAdmin = await AdminService.update(currentAdminId, adminData);
        
        cerrarLoading();
        await mostrarExito('¡Administrador actualizado!', '✅ "' + updatedAdmin.name + '" actualizado exitosamente.');
        
        await loadAdmins();
        
        elements.adminSelector.value = updatedAdmin.id;
        onAdminSelect();
        
    } catch (error) {
        cerrarLoading();
        console.error('Error al actualizar administrador:', error);
        await mostrarError('Error al actualizar', error.message || 'No se pudo actualizar el administrador.');
    } finally {
        isSubmitting = false;
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ========================================
// Cancelar / resetear formulario CON SWEETALERT2
// ========================================
async function resetForm() {
    if (currentAdminId) {
        var result = await mostrarAdvertencia(
            '¿Cancelar edición?',
            'Se perderán los cambios no guardados. ¿Deseas continuar?',
            'Sí, cancelar'
        );
        
        if (!result.isConfirmed) return;
    }
    
    elements.adminSelector.value = '';
    elements.formFields.disabled = true;
    elements.actionButtons.style.display = 'none';
    elements.previewCard.style.display = 'none';
    clearForm();
    currentAdminId = null;
    mostrarToast('Formulario reseteado', 'info');
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    elements.backBtn?.addEventListener('click', function() {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin/admins');
        } else {
            window.history.back();
        }
    });
    
    elements.adminSelector?.addEventListener('change', onAdminSelect);
    
    elements.cancelBtn?.addEventListener('click', resetForm);
    
    elements.adminForm?.addEventListener('submit', updateAdmin);
}

// ========================================
// Dark mode sync
// ========================================
function syncDarkMode() {
    if (window.OUTLETNav && typeof window.OUTLETNav.getTheme === 'function') {
        var navDark = window.OUTLETNav.getTheme();
        if (navDark && !document.body.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
        } else if (!navDark && document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
        }
    }
}

document.addEventListener('themeChanged', function(e) {
    if (e.detail.isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
});

// ========================================
// Inicialización
// ========================================
export async function updateAdminController() {
    console.log('✏️ Update Admin Controller - Editar administradores');
    
    cacheElements();
    syncDarkMode();
    initEventListeners();
    
    if (elements.formFields) {
        elements.formFields.disabled = true;
    }
    if (elements.actionButtons) {
        elements.actionButtons.style.display = 'none';
    }
    if (elements.previewCard) {
        elements.previewCard.style.display = 'none';
    }
    
    await loadAdmins();
    
    console.log('✅ Update Admin page loaded');
}

export default updateAdminController;