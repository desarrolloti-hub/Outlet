/* ========================================
   READ ADMINS CONTROLLER - OUTLET ADMIN
   Controlador para listar, editar y eliminar administradores
   RESPONSIVE: Se adapta a cualquier tamaño
   ======================================== */

import { AdminService } from '/services/adminService.js';

// ========================================
// Variables de estado
// ========================================
let admins = [];
let deleteTarget = { type: null, id: null, name: null };
let isEditMode = false;

// ========================================
// DOM Elements
// ========================================
let elements = {};

function cacheElements() {
    elements = {
        totalAdmins: document.getElementById('totalAdmins'),
        tableBody: document.getElementById('adminsTableBody'),
        
        adminModal: document.getElementById('adminModal'),
        modalTitle: document.getElementById('modalTitle'),
        adminId: document.getElementById('adminId'),
        adminName: document.getElementById('adminName'),
        adminEmail: document.getElementById('adminEmail'),
        adminPassword: document.getElementById('adminPassword'),
        adminConfirmPassword: document.getElementById('adminConfirmPassword'),
        adminPhone: document.getElementById('adminPhone'),
        adminRole: document.getElementById('adminRole'),
        adminStatus: document.getElementById('adminStatus'),
        adminIcon: document.getElementById('adminIcon'),
        adminCreatedAt: document.getElementById('adminCreatedAt'),
        adminForm: document.getElementById('adminForm'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        confirmPasswordGroup: document.getElementById('confirmPasswordGroup'),
        
        deleteModal: document.getElementById('deleteModal'),
        deleteItemName: document.getElementById('deleteItemName'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
        closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
        
        toast: document.getElementById('adminsToast')
    };
}

// ========================================
// UI Helpers
// ========================================
function mostrarToast(mensaje, tipo = 'info') {
    const toast = elements.toast;
    toast.textContent = mensaje;
    toast.className = 'adminslist-toast';
    
    if (tipo === 'success') {
        toast.style.borderLeftColor = '#22c55e';
    } else if (tipo === 'error') {
        toast.style.borderLeftColor = '#ef4444';
    } else {
        toast.style.borderLeftColor = 'var(--outlet-gold, #ddab3b)';
    }
    
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.animation = 'adminslistSlideOut 0.3s ease-out forwards';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.animation = '';
        }, 300);
    }, 2800);
}

// Añadir animación de salida
const style = document.createElement('style');
style.textContent = `
    @keyframes adminslistSlideOut {
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
        'super_admin': 'Super Admin',
        'admin': 'Admin',
        'manager': 'Manager',
        'editor': 'Editor'
    };
    return labels[role] || role;
}

function getRoleClass(role) {
    return `adminslist-role-${role}`;
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

function showModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// ========================================
// Renderizar tabla de administradores
// ========================================
function renderTable() {
    if (!elements.tableBody) return;
    
    if (admins.length === 0) {
        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="adminslist-loading">
                    <div class="adminslist-spinner"></div>
                    <span>Cargando administradores...</span>
                </td>
            </tr>
        `;
        if (elements.totalAdmins) elements.totalAdmins.textContent = '0';
        return;
    }
    
    elements.tableBody.innerHTML = admins.map(admin => `
        <tr data-id="${admin.id}">
            <td>
                <div class="adminslist-avatar">
                    <i class="material-symbols-outlined">${admin.icon || 'person'}</i>
                </div>
            </td>
            <td><code style="font-size: 12px;">${escapeHtml(admin.id)}</code></td>
            <td><strong>${escapeHtml(admin.name)}</strong></td>
            <td>${escapeHtml(admin.email)}</td>
            <td>
                <span class="adminslist-role-badge ${getRoleClass(admin.role)}">
                    ${getRoleLabel(admin.role)}
                </span>
            </td>
            <td>${admin.phone || '—'}</td>
            <td>
                <span class="adminslist-status-badge ${admin.status === 'active' ? 'adminslist-status-active' : 'adminslist-status-inactive'}">
                    ${admin.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="adminslist-actions-cell">
                    <button class="adminslist-btn-edit" data-id="${admin.id}" title="Editar administrador">
                        <i class="material-symbols-outlined">edit</i>
                        <span>Editar</span>
                    </button>
                    <button class="adminslist-btn-delete" data-id="${admin.id}" data-name="${escapeHtml(admin.name)}" title="Eliminar administrador">
                        <i class="material-symbols-outlined">delete</i>
                        <span>Eliminar</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Actualizar contador
    if (elements.totalAdmins) {
        elements.totalAdmins.textContent = admins.length;
    }
    
    // Event listeners para botones
    document.querySelectorAll('.adminslist-btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            editAdmin(id);
        });
    });
    
    document.querySelectorAll('.adminslist-btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            showDeleteModal('admin', id, name);
        });
    });
}

// ========================================
// CRUD de Administradores
// ========================================
async function loadAdmins() {
    try {
        admins = await AdminService.getAll({}, false);
        renderTable();
    } catch (error) {
        console.error('Error al cargar administradores:', error);
        mostrarToast('Error al cargar los administradores', 'error');
        admins = [];
        renderTable();
    }
}

function resetAdminForm() {
    isEditMode = false;
    elements.adminId.value = '';
    elements.adminName.value = '';
    elements.adminEmail.value = '';
    elements.adminPassword.value = '';
    elements.adminConfirmPassword.value = '';
    elements.adminPhone.value = '';
    elements.adminRole.value = 'admin';
    elements.adminStatus.value = 'active';
    elements.adminIcon.value = '';
    elements.adminCreatedAt.value = '';
    elements.modalTitle.textContent = 'Editar Administrador';
}

async function editAdmin(id) {
    const admin = admins.find(a => a.id === id);
    if (!admin) return;
    
    isEditMode = true;
    elements.adminId.value = admin.id;
    elements.adminName.value = admin.name;
    elements.adminEmail.value = admin.email;
    elements.adminPassword.value = '';
    elements.adminConfirmPassword.value = '';
    elements.adminPhone.value = admin.phone || '';
    elements.adminRole.value = admin.role || 'admin';
    elements.adminStatus.value = admin.status || 'active';
    elements.adminIcon.value = admin.icon || '';
    elements.adminCreatedAt.value = formatDate(admin.createdAt);
    elements.modalTitle.textContent = 'Editar Administrador';
    
    showModal(elements.adminModal);
}

async function saveAdmin(event) {
    event.preventDefault();
    
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
    
    const adminId = elements.adminId.value;
    const password = elements.adminPassword.value;
    const confirmPassword = elements.adminConfirmPassword.value;
    
    // Validar contraseña solo si se está cambiando
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
    
    try {
        const updatedAdmin = await AdminService.update(adminId, adminData);
        mostrarToast(`✅ Administrador "${updatedAdmin.name}" actualizado exitosamente`, 'success');
        await loadAdmins();
        hideModal(elements.adminModal);
        resetAdminForm();
    } catch (error) {
        console.error('Error al actualizar administrador:', error);
        mostrarToast(`❌ Error: ${error.message}`, 'error');
    }
}

async function deleteAdmin(id) {
    try {
        await AdminService.delete(id);
        mostrarToast('Administrador eliminado correctamente', 'success');
        await loadAdmins();
    } catch (error) {
        console.error('Error al eliminar administrador:', error);
        mostrarToast(`❌ Error: ${error.message}`, 'error');
    }
}

// ========================================
// Modal de confirmación
// ========================================
function showDeleteModal(type, id, name) {
    deleteTarget = { type, id, name };
    elements.deleteItemName.textContent = name;
    showModal(elements.deleteModal);
}

function hideDeleteModal() {
    hideModal(elements.deleteModal);
    deleteTarget = null;
}

async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'admin') {
        await deleteAdmin(deleteTarget.id);
    }
    hideDeleteModal();
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    elements.adminForm?.addEventListener('submit', saveAdmin);
    elements.closeModalBtn?.addEventListener('click', () => hideModal(elements.adminModal));
    
    elements.confirmDeleteBtn?.addEventListener('click', confirmDelete);
    elements.cancelDeleteBtn?.addEventListener('click', hideDeleteModal);
    elements.closeDeleteModalBtn?.addEventListener('click', hideDeleteModal);
    
    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.deleteModal?.style.display === 'flex') hideDeleteModal();
            if (elements.adminModal?.style.display === 'flex') hideModal(elements.adminModal);
        }
    });
    
    // Cerrar modales al hacer clic fuera
    elements.adminModal?.addEventListener('click', (e) => {
        if (e.target === elements.adminModal) hideModal(elements.adminModal);
    });
    elements.deleteModal?.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) hideDeleteModal();
    });
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
export async function readAdminsController() {
    console.log('📋 Read Admins Controller - Listado y gestión de administradores');
    
    cacheElements();
    syncDarkMode();
    initEventListeners();
    
    await loadAdmins();
    
    console.log('✅ Read Admins page loaded');
}

export default readAdminsController;