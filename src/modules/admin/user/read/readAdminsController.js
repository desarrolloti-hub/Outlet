/* ========================================
   READ ADMINS CONTROLLER - OUTLET ADMIN
   Controlador para listar, editar y eliminar administradores
   RESPONSIVE: Se adapta a cualquier tamaño
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { AdminService } from '../../../../services/adminService.js';

// ========================================
// Variables de estado
// ========================================
var admins = [];
var deleteTarget = { type: null, id: null, name: null };
var isEditMode = false;

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
// Utilidades
// ========================================
function getRoleLabel(role) {
    var labels = {
        'super_admin': 'Super Admin',
        'admin': 'Admin',
        'manager': 'Manager',
        'editor': 'Editor'
    };
    return labels[role] || role;
}

function getRoleClass(role) {
    return 'adminslist-role-' + role;
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

function showModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function getNombreCompleto(admin) {
    var partes = [];
    if (admin.nombre) partes.push(admin.nombre);
    if (admin.apellidoPa) partes.push(admin.apellidoPa);
    if (admin.apellidoMa) partes.push(admin.apellidoMa);
    return partes.length > 0 ? partes.join(' ') : 'Sin nombre';
}

function getIniciales(admin) {
    var iniciales = '';
    if (admin.nombre) iniciales += admin.nombre.charAt(0);
    if (admin.apellidoPa) iniciales += admin.apellidoPa.charAt(0);
    return iniciales.toUpperCase() || 'A';
}

// ========================================
// Renderizar tabla de administradores
// ========================================
function renderTable() {
    if (!elements.tableBody) return;
    
    if (!admins || admins.length === 0) {
        elements.tableBody.innerHTML = 
            '<tr><td colspan="8" class="adminslist-loading"><div class="adminslist-spinner"></div><span>Cargando administradores...</span></td></tr>';
        if (elements.totalAdmins) elements.totalAdmins.textContent = '0';
        return;
    }
    
    var html = '';
    admins.forEach(function(admin) {
        var nombreCompleto = getNombreCompleto(admin);
        var iniciales = getIniciales(admin);
        var email = admin.email || 'Sin email';
        var rol = admin.rol || 'admin';
        var estado = admin.estado || 'activo';
        var telefono = admin.telefono || admin.phone || '—';
        var icono = admin.icon || admin.avatar || 'person';
        var idCorto = admin.id ? admin.id.substring(0, 8) : '—';
        
        html += 
            '<tr data-id="' + admin.id + '">' +
                '<td><div class="adminslist-avatar"><i class="material-symbols-outlined">' + escapeHtml(icono) + '</i></div></td>' +
                '<td><code style="font-size: 12px;">' + escapeHtml(idCorto) + '</code></td>' +
                '<td><strong>' + escapeHtml(nombreCompleto) + '</strong></td>' +
                '<td>' + escapeHtml(email) + '</td>' +
                '<td><span class="adminslist-role-badge ' + getRoleClass(rol) + '">' + getRoleLabel(rol) + '</span></td>' +
                '<td>' + escapeHtml(telefono) + '</td>' +
                '<td><span class="adminslist-status-badge ' + (estado === 'activo' || estado === 'active' ? 'adminslist-status-active' : 'adminslist-status-inactive') + '">' + (estado === 'activo' || estado === 'active' ? 'Activo' : 'Inactivo') + '</span></td>' +
                '<td><div class="adminslist-actions-cell">' +
                    '<button class="adminslist-btn-edit" data-id="' + admin.id + '" title="Editar administrador"><i class="material-symbols-outlined">edit</i><span>Editar</span></button>' +
                    '<button class="adminslist-btn-delete" data-id="' + admin.id + '" data-name="' + escapeHtml(nombreCompleto) + '" title="Eliminar administrador"><i class="material-symbols-outlined">delete</i><span>Eliminar</span></button>' +
                '</div></td>' +
            '</tr>';
    });
    
    elements.tableBody.innerHTML = html;
    
    if (elements.totalAdmins) {
        elements.totalAdmins.textContent = admins.length;
    }
    
    document.querySelectorAll('.adminslist-btn-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.dataset.id;
            editAdmin(id);
        });
    });
    
    document.querySelectorAll('.adminslist-btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.dataset.id;
            var name = this.dataset.name;
            showDeleteModal('admin', id, name);
        });
    });
}

// ========================================
// CRUD de Administradores
// ========================================
async function loadAdmins() {
    try {
        console.log('🔄 Cargando administradores...');
        admins = await AdminService.getAllAdmins();
        console.log('✅ Administradores cargados:', admins.length);
        renderTable();
    } catch (error) {
        console.error('❌ Error al cargar administradores:', error);
        await mostrarError('Error al cargar administradores', error.message || 'No se pudieron cargar los administradores.');
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
    elements.adminStatus.value = 'activo';
    elements.adminIcon.value = '';
    elements.adminCreatedAt.value = '';
    elements.modalTitle.textContent = 'Editar Administrador';
}

async function editAdmin(id) {
    var admin = admins.find(function(a) { return a.id === id; });
    if (!admin) {
        await mostrarError('Administrador no encontrado', 'No se encontró el administrador que deseas editar.');
        return;
    }
    
    console.log('✏️ Editando admin:', admin);
    
    isEditMode = true;
    elements.adminId.value = admin.id;
    elements.adminName.value = admin.nombre || '';
    elements.adminEmail.value = admin.email || '';
    elements.adminPassword.value = '';
    elements.adminConfirmPassword.value = '';
    elements.adminPhone.value = admin.telefono || admin.phone || '';
    elements.adminRole.value = admin.rol || 'admin';
    elements.adminStatus.value = admin.estado || 'activo';
    elements.adminIcon.value = admin.icon || admin.avatar || 'person';
    elements.adminCreatedAt.value = formatDate(admin.fechaCreacion);
    elements.modalTitle.textContent = 'Editar Administrador';
    
    showModal(elements.adminModal);
}

async function saveAdmin(event) {
    event.preventDefault();
    
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
    
    var adminId = elements.adminId.value;
    var password = elements.adminPassword.value;
    var confirmPassword = elements.adminConfirmPassword.value;
    
    if (password) {
        if (password.length < 6) {
            await mostrarError('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.');
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
        nombre: name,
        email: email,
        telefono: elements.adminPhone.value.trim() || '',
        rol: elements.adminRole.value,
        estado: elements.adminStatus.value,
        icon: elements.adminIcon.value.trim() || 'person'
    };
    
    if (password) {
        adminData.password = password;
    }
    
    // Confirmación antes de guardar
    var confirmResult = await mostrarConfirmacion(
        '¿Guardar cambios?',
        'Estás a punto de actualizar el administrador "' + name + '".',
        'Sí, guardar'
    );
    
    if (!confirmResult.isConfirmed) {
        mostrarToast('Edición cancelada', 'info');
        return;
    }
    
    mostrarLoading('Actualizando administrador...');
    
    try {
        var updatedAdmin = await AdminService.updateAdmin(adminId, adminData);
        cerrarLoading();
        await mostrarExito('¡Administrador actualizado!', '✅ "' + updatedAdmin.nombre + '" actualizado exitosamente.');
        await loadAdmins();
        hideModal(elements.adminModal);
        resetAdminForm();
    } catch (error) {
        cerrarLoading();
        console.error('❌ Error al actualizar administrador:', error);
        await mostrarError('Error al actualizar', error.message || 'No se pudo actualizar el administrador.');
    }
}

async function deleteAdmin(id) {
    try {
        await AdminService.deleteAdmin(id);
        await mostrarExito('¡Administrador eliminado!', 'El administrador ha sido eliminado correctamente.');
        await loadAdmins();
    } catch (error) {
        console.error('❌ Error al eliminar administrador:', error);
        await mostrarError('Error al eliminar', error.message || 'No se pudo eliminar el administrador.');
    }
}

// ========================================
// Modal de confirmación CON SWEETALERT2
// ========================================
async function showDeleteModal(type, id, name) {
    var result = await mostrarConfirmacion(
        '¿Eliminar administrador?',
        '¿Estás seguro de que quieres eliminar a "' + name + '"? Esta acción no se puede deshacer.',
        'Sí, eliminar'
    );
    
    if (result.isConfirmed) {
        deleteTarget = { type: type, id: id, name: name };
        await confirmDelete();
    }
}

async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'admin') {
        await deleteAdmin(deleteTarget.id);
    }
    deleteTarget = null;
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    elements.adminForm?.addEventListener('submit', saveAdmin);
    elements.closeModalBtn?.addEventListener('click', function() { hideModal(elements.adminModal); });
    
    elements.confirmDeleteBtn?.addEventListener('click', confirmDelete);
    elements.cancelDeleteBtn?.addEventListener('click', function() { deleteTarget = null; });
    elements.closeDeleteModalBtn?.addEventListener('click', function() { deleteTarget = null; });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (elements.deleteModal?.style.display === 'flex') {
                deleteTarget = null;
                hideModal(elements.deleteModal);
            }
            if (elements.adminModal?.style.display === 'flex') hideModal(elements.adminModal);
        }
    });
    
    elements.adminModal?.addEventListener('click', function(e) {
        if (e.target === elements.adminModal) hideModal(elements.adminModal);
    });
    elements.deleteModal?.addEventListener('click', function(e) {
        if (e.target === elements.deleteModal) {
            deleteTarget = null;
            hideModal(elements.deleteModal);
        }
    });
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
export async function readAdminsController() {
    console.log('📋 Read Admins Controller - Listado y gestión de administradores');
    
    cacheElements();
    syncDarkMode();
    initEventListeners();
    
    var session = AdminService.getCurrentSession();
    console.log('🔐 Sesión actual:', session);
    console.log('🔐 Rol en sesión:', session?.rol);
    console.log('🔐 ID del admin:', session?.id);
    
    if (!session) {
        console.warn('⚠️ No hay sesión activa');
        await mostrarError('Sin sesión activa', 'No hay sesión activa. Inicia sesión nuevamente.');
        return;
    }
    
    if (session.rol !== 'admin' && session.rol !== 'super_admin') {
        console.warn('⚠️ El usuario no tiene rol de administrador:', session.rol);
        await mostrarError('Sin permisos', 'No tienes permisos de administrador. Rol actual: ' + session.rol);
        return;
    }
    
    await loadAdmins();
    
    console.log('✅ Read Admins page loaded');
}

export default readAdminsController;