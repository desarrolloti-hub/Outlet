/* ========================================
   UPDATE ADMINS CONTROLLER - OUTLET ADMIN
   Controlador para editar administradores existentes
   Basado en el estilo de updateCategoriesController
   ======================================== */

import { AdminService } from '../../../../services/adminService.js';

// ========================================
// Variables de estado
// ========================================
let admins = [];
let currentAdminId = null;
let isSubmitting = false;

// ========================================
// DOM Elements
// ========================================
let elements = {};

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
// UI Helpers
// ========================================
function mostrarToast(mensaje, tipo = 'info') {
    const toast = elements.toast;
    toast.textContent = mensaje;
    toast.className = 'updateadmin-toast';
    
    if (tipo === 'success') {
        toast.style.borderLeftColor = '#22c55e';
    } else if (tipo === 'error') {
        toast.style.borderLeftColor = '#ef4444';
    } else {
        toast.style.borderLeftColor = 'var(--outlet-gold, #ddab3b)';
    }
    
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.animation = 'updateadminSlideOut 0.3s ease-out forwards';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.animation = '';
        }, 300);
    }, 2800);
}

// Añadir animación de salida
const style = document.createElement('style');
style.textContent = `
    @keyframes updateadminSlideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function getRoleLabel(role) {
    const labels = {
        'super_admin': 'Super Administrador',
        'admin': 'Administrador',
        'manager': 'Manager',
        'editor': 'Editor'
    };
    return labels[role] || role;
}

function getRoleClass(role) {
    const classes = {
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
    const date = new Date(dateString);
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
        mostrarToast('Error al cargar los administradores', 'error');
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
    
    elements.adminSelector.innerHTML = `
        <option value="">-- Seleccione un administrador --</option>
        ${admins.map(admin => `
            <option value="${admin.id}">${escapeHtml(admin.name)} (${escapeHtml(admin.email)})</option>
        `).join('')}
    `;
}

// ========================================
// Cargar datos del administrador seleccionado
// ========================================
function onAdminSelect() {
    const selectedId = elements.adminSelector.value;
    
    if (!selectedId) {
        // Limpiar formulario y deshabilitar
        elements.formFields.disabled = true;
        elements.actionButtons.style.display = 'none';
        elements.previewCard.style.display = 'none';
        clearForm();
        return;
    }
    
    const admin = admins.find(a => a.id === selectedId);
    if (!admin) return;
    
    currentAdminId = selectedId;
    
    // Cargar datos en el formulario
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
    
    // Habilitar formulario y mostrar botones
    elements.formFields.disabled = false;
    elements.actionButtons.style.display = 'flex';
    
    // Mostrar vista previa
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
    
    elements.adminPreviewInfo.innerHTML = `
        <div class="updateadmin-preview-info">
            <div class="updateadmin-preview-item">
                <span class="updateadmin-preview-label">ID</span>
                <span class="updateadmin-preview-value"><code>${escapeHtml(admin.id)}</code></span>
            </div>
            <div class="updateadmin-preview-item">
                <span class="updateadmin-preview-label">Nombre</span>
                <span class="updateadmin-preview-value">${escapeHtml(admin.name)}</span>
            </div>
            <div class="updateadmin-preview-item">
                <span class="updateadmin-preview-label">Email</span>
                <span class="updateadmin-preview-value">${escapeHtml(admin.email)}</span>
            </div>
            <div class="updateadmin-preview-item">
                <span class="updateadmin-preview-label">Teléfono</span>
                <span class="updateadmin-preview-value">${admin.phone || '—'}</span>
            </div>
            <div class="updateadmin-preview-item">
                <span class="updateadmin-preview-label">Rol</span>
                <span class="updateadmin-preview-value">
                    <span class="badge ${getRoleClass(admin.role)}">${getRoleLabel(admin.role)}</span>
                </span>
            </div>
            <div class="updateadmin-preview-item">
                <span class="updateadmin-preview-label">Estado</span>
                <span class="updateadmin-preview-value">
                    <span class="badge ${getStatusClass(admin.status)}">${getStatusLabel(admin.status)}</span>
                </span>
            </div>
            <div class="updateadmin-preview-item">
                <span class="updateadmin-preview-label">Avatar</span>
                <span class="updateadmin-preview-value">
                    <span class="material-symbols-outlined" style="font-size: 24px;">${admin.icon || 'person'}</span>
                    ${admin.icon || 'person'}
                </span>
            </div>
            <div class="updateadmin-preview-item">
                <span class="updateadmin-preview-label">Creado</span>
                <span class="updateadmin-preview-value">${formatDate(admin.createdAt)}</span>
            </div>
        </div>
    `;
}

// ========================================
// Actualizar administrador
// ========================================
async function updateAdmin(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    if (!currentAdminId) {
        mostrarToast('Seleccione un administrador para actualizar', 'error');
        return;
    }
    
    const name = elements.adminName.value.trim();
    if (!name) {
        mostrarToast('El nombre es obligatorio', 'error');
        elements.adminName.focus();
        return;
    }
    
    const email = elements.adminEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarToast('Ingrese un correo electrónico válido', 'error');
        elements.adminEmail.focus();
        return;
    }
    
    const password = elements.adminPassword.value;
    const confirmPassword = elements.adminConfirmPassword.value;
    
    if (password) {
        if (password.length < 8) {
            mostrarToast('La contraseña debe tener al menos 8 caracteres', 'error');
            elements.adminPassword.focus();
            return;
        }
        if (password !== confirmPassword) {
            mostrarToast('Las contraseñas no coinciden', 'error');
            elements.adminConfirmPassword.focus();
            return;
        }
    }
    
    const adminData = {
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
    
    isSubmitting = true;
    const btn = elements.saveBtn;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="material-symbols-outlined">hourglass_empty</i> Actualizando...';
    btn.disabled = true;
    
    try {
        const updatedAdmin = await AdminService.update(currentAdminId, adminData);
        
        mostrarToast(`✅ Administrador "${updatedAdmin.name}" actualizado exitosamente`, 'success');
        
        // Recargar administradores y actualizar selector
        await loadAdmins();
        
        // Mantener seleccionado el administrador actualizado
        elements.adminSelector.value = updatedAdmin.id;
        onAdminSelect();
        
    } catch (error) {
        console.error('Error al actualizar administrador:', error);
        mostrarToast(`❌ Error: ${error.message}`, 'error');
    } finally {
        isSubmitting = false;
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ========================================
// Cancelar / resetear formulario
// ========================================
function resetForm() {
    elements.adminSelector.value = '';
    elements.formFields.disabled = true;
    elements.actionButtons.style.display = 'none';
    elements.previewCard.style.display = 'none';
    clearForm();
    currentAdminId = null;
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // Botón volver
    elements.backBtn?.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin/admins');
        } else {
            window.history.back();
        }
    });
    
    // Selector de administrador
    elements.adminSelector?.addEventListener('change', onAdminSelect);
    
    // Botón cancelar
    elements.cancelBtn?.addEventListener('click', resetForm);
    
    // Submit del formulario
    elements.adminForm?.addEventListener('submit', updateAdmin);
}

// ========================================
// Dark mode sync
// ========================================
function syncDarkMode() {
    if (window.OUTLETNav && typeof window.OUTLETNav.getTheme === 'function') {
        const navDark = window.OUTLETNav.getTheme();
        if (navDark && !document.body.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
        } else if (!navDark && document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
        }
    }
}

document.addEventListener('themeChanged', (e) => {
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
    
    // Inicialmente deshabilitar formulario
    if (elements.formFields) {
        elements.formFields.disabled = true;
    }
    if (elements.actionButtons) {
        elements.actionButtons.style.display = 'none';
    }
    if (elements.previewCard) {
        elements.previewCard.style.display = 'none';
    }
    
    // Cargar administradores
    await loadAdmins();
    
    console.log('✅ Update Admin page loaded');
}

export default updateAdminController;