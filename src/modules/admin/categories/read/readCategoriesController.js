/* ========================================
   READ CATEGORIES CONTROLLER - OUTLET ADMIN
   Controlador para listar y gestionar categorías
   CRUD completo con el mismo estilo que productos
   RESPONSIVE: Se adapta a cualquier tamaño
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { CategoryService } from '../../../../services/categoryService.js';

// ========================================
// Variables de estado
// ========================================
var categories = [];
var deleteTarget = { type: null, id: null, name: null };

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
        addBtn: document.getElementById('addCategoryBtn'),
        tableBody: document.getElementById('categoriesTableBody'),
        
        deleteModal: document.getElementById('deleteModal'),
        deleteItemName: document.getElementById('deleteItemName'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
        closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
        
        toast: document.getElementById('categoriesToast')
    };
}

// ========================================
// Utilidades
// ========================================
function escapeHtml(str) {
    var safeStr = String(str || '');
    return safeStr
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function generarSlug(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function generarIdDesdeNombre(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function showModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// ========================================
// Renderizar tabla de categorías
// ========================================
function renderTable() {
    if (!elements.tableBody) return;
    
    if (!categories || categories.length === 0) {
        elements.tableBody.innerHTML = 
            '<tr><td colspan="7" class="categorieslist-loading"><div class="categorieslist-spinner"></div><span>Cargando categorías...</span></td></tr>';
        return;
    }
    
    var html = '';
    categories.forEach(function(cat) {
        var safeId = cat.id || '';
        var safeName = cat.name || '';
        var safeSlug = cat.slug || '';
        var safeOrder = cat.order || 0;
        var safeStatus = cat.status || 'active';
        var subcategoryCount = Array.isArray(cat.subcategories) ? cat.subcategories.length : 0;
        
        // 🖼️ IMAGEN
        var imageHtml = '';
        if (cat.imageBase64 && cat.imageBase64.startsWith('data:image')) {
            imageHtml = '<img src="' + escapeHtml(cat.imageBase64) + '" alt="' + escapeHtml(safeName) + '" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid #eaeaea;">';
        } else {
            imageHtml = '<span style="color:#ccc;font-size:12px;">Sin imagen</span>';
        }
        
        html += 
            '<tr data-id="' + escapeHtml(safeId) + '">' +
                '<td><div style="display:flex;align-items:center;justify-content:center;width:50px;height:50px;">' + imageHtml + '</div></td>' +
                '<td><code style="font-size: 12px;">' + escapeHtml(safeId) + '</code></td>' +
                '<td><strong>' + escapeHtml(safeName) + '</strong></td>' +
                '<td><code style="font-size: 12px;">' + escapeHtml(safeSlug) + '</code></td>' +
                '<td><span style="background:rgba(221,171,59,0.1);color:var(--outlet-gold,#ddab3b);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;">' + subcategoryCount + ' subcategorías</span></td>' +
                '<td>' + safeOrder + '</td>' +
                '<td><span class="categorieslist-status-badge ' + (safeStatus === 'active' ? 'categorieslist-status-active' : 'categorieslist-status-inactive') + '">' + (safeStatus === 'active' ? 'Activo' : 'Inactivo') + '</span></td>' +
                '<td><div class="categorieslist-actions-cell">' +
                    '<button class="categorieslist-btn-edit" data-id="' + escapeHtml(safeId) + '" title="Editar">' +
                        '<i class="material-symbols-outlined">edit</i><span>Editar</span>' +
                    '</button>' +
                    '<button class="categorieslist-btn-delete" data-id="' + escapeHtml(safeId) + '" data-name="' + escapeHtml(safeName) + '" title="Eliminar">' +
                        '<i class="material-symbols-outlined">delete</i><span>Eliminar</span>' +
                    '</button>' +
                '</div></td>' +
            '</tr>';
    });
    
    elements.tableBody.innerHTML = html;
    
    document.querySelectorAll('.categorieslist-btn-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.dataset.id;
            openUpdatePage(id);
        });
    });
    
    document.querySelectorAll('.categorieslist-btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.dataset.id;
            var name = this.dataset.name;
            showDeleteModal(id, name);
        });
    });
}

// ========================================
// CRUD de Categorías
// ========================================
async function loadCategories() {
    try {
        console.log('🔄 Cargando categorías...');
        categories = await CategoryService.getAll({}, true);
        console.log('✅ ' + categories.length + ' categorías cargadas');
        renderTable();
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        await mostrarError('Error al cargar categorías', error.message || 'No se pudieron cargar las categorías.');
        categories = [];
        
        if (elements.tableBody) {
            elements.tableBody.innerHTML = 
                '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">' +
                    '<div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>' +
                    '<strong>Error al cargar categorías</strong><br>' +
                    '<span style="font-size: 13px; color: #888;">' + escapeHtml(error.message) + '</span><br><br>' +
                    '<button onclick="location.reload()" style="padding: 8px 24px; background: var(--outlet-gold, #ddab3b); border: none; border-radius: 8px; cursor: pointer; color: #1a1a1a; font-weight: 600;">Reintentar</button>' +
                '</td></tr>';
        }
    }
}

// ========================================
// NUEVA FUNCIÓN: Redirigir a la página de creación
// ========================================
function openCreatePage() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/createCategories');
    } else {
        window.location.href = 'createCategories.html';
    }
}

// ========================================
// NUEVA FUNCIÓN: Redirigir a la página de actualización con el ID
// ========================================
function openUpdatePage(categoryId) {
    if (!categoryId) {
        mostrarError('Error', 'No se pudo identificar la categoría a editar.');
        return;
    }
    
    // Redirigir a la página de actualización con el ID como parámetro
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/updateCategories?id=' + encodeURIComponent(categoryId));
    } else {
        window.location.href = 'updateCategories.html?id=' + encodeURIComponent(categoryId);
    }
}

// ========================================
// Eliminar categoría
// ========================================
async function deleteCategory(id) {
    try {
        await CategoryService.delete(id);
        await mostrarExito('¡Categoría eliminada!', 'La categoría ha sido eliminada correctamente.');
        await loadCategories();
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        await mostrarError('Error al eliminar', error.message || 'No se pudo eliminar la categoría.');
    }
}

// ========================================
// Modal de confirmación CON SWEETALERT2
// ========================================
async function showDeleteModal(id, name) {
    var displayName = name || 'esta categoría';
    
    var result = await mostrarConfirmacion(
        '¿Eliminar categoría?',
        '¿Estás seguro de que quieres eliminar "' + displayName + '"? Esta acción no se puede deshacer.',
        'Sí, eliminar'
    );
    
    if (result.isConfirmed) {
        deleteTarget = { id: id, name: name };
        await confirmDelete();
    }
}

async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteCategory(deleteTarget.id);
    deleteTarget = null;
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // Redirige a createCategories
    elements.addBtn?.addEventListener('click', openCreatePage);
    
    // Botones del modal de eliminación
    elements.confirmDeleteBtn?.addEventListener('click', confirmDelete);
    elements.cancelDeleteBtn?.addEventListener('click', function() { deleteTarget = null; hideModal(elements.deleteModal); });
    elements.closeDeleteModalBtn?.addEventListener('click', function() { deleteTarget = null; hideModal(elements.deleteModal); });
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (elements.deleteModal?.style.display === 'flex') {
                hideModal(elements.deleteModal);
                deleteTarget = null;
            }
        }
    });
    
    // Cerrar modal clickeando fuera
    elements.deleteModal?.addEventListener('click', function(e) {
        if (e.target === elements.deleteModal) {
            hideModal(elements.deleteModal);
            deleteTarget = null;
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
export async function readCategoriesController() {
    console.log('📋 Read Categories Controller - Listado de categorías');
    
    cacheElements();
    syncDarkMode();
    initEventListeners();
    
    await loadCategories();
    
    console.log('✅ Read Categories page loaded');
}