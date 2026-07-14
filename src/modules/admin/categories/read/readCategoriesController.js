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
var currentCategoryForSub = null;

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
        
        categoryModal: document.getElementById('categoryModal'),
        modalTitle: document.getElementById('modalTitle'),
        categoryId: document.getElementById('categoryId'),
        categoryName: document.getElementById('categoryName'),
        categorySlug: document.getElementById('categorySlug'),
        categoryDescription: document.getElementById('categoryDescription'),
        categoryIcon: document.getElementById('categoryIcon'),
        categoryOrder: document.getElementById('categoryOrder'),
        categoryStatus: document.getElementById('categoryStatus'),
        categoryForm: document.getElementById('categoryForm'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        
        subcategoryModal: document.getElementById('subcategoryModal'),
        submodalTitle: document.getElementById('submodalTitle'),
        currentCategoryName: document.getElementById('currentCategoryName'),
        newSubcategoryName: document.getElementById('newSubcategoryName'),
        addSubcategoryBtn: document.getElementById('addSubcategoryBtn'),
        subcategoriesList: document.getElementById('subcategoriesList'),
        closeSubmodalBtn: document.getElementById('closeSubmodalBtn'),
        
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
            '<tr><td colspan="8" class="categorieslist-loading"><div class="categorieslist-spinner"></div><span>Cargando categorías...</span></td></tr>';
        return;
    }
    
    var html = '';
    categories.forEach(function(cat) {
        var safeId = cat.id || '';
        var safeName = cat.name || '';
        var safeSlug = cat.slug || '';
        var safeIcon = cat.icon || 'category';
        var safeOrder = cat.order || 0;
        var safeStatus = cat.status || 'active';
        var safeSubcategories = Array.isArray(cat.subcategories) ? cat.subcategories : [];
        
        html += 
            '<tr data-id="' + escapeHtml(safeId) + '">' +
                '<td><div class="categorieslist-icon"><i class="material-symbols-outlined">' + escapeHtml(safeIcon) + '</i></div></td>' +
                '<td><code style="font-size: 12px;">' + escapeHtml(safeId) + '</code></td>' +
                '<td><strong>' + escapeHtml(safeName) + '</strong></td>' +
                '<td><code style="font-size: 12px;">' + escapeHtml(safeSlug) + '</code></td>' +
                '<td><div class="categorieslist-subcategories">' + renderSubcategoriesPreview(safeSubcategories, safeId) + '</div></td>' +
                '<td>' + safeOrder + '</td>' +
                '<td><span class="categorieslist-status-badge ' + (safeStatus === 'active' ? 'categorieslist-status-active' : 'categorieslist-status-inactive') + '">' + (safeStatus === 'active' ? 'Activo' : 'Inactivo') + '</span></td>' +
                '<td><div class="categorieslist-actions-cell">' +
                    '<button class="categorieslist-btn-subcategories" data-id="' + escapeHtml(safeId) + '" data-name="' + escapeHtml(safeName) + '" title="Gestionar subcategorías">' +
                        '<i class="material-symbols-outlined">subdirectory_arrow_right</i><span>Subcats</span>' +
                    '</button>' +
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
    
    document.querySelectorAll('.categorieslist-btn-subcategories').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.dataset.id;
            var name = this.dataset.name;
            openSubcategoryModal(id, name);
        });
    });
    
    document.querySelectorAll('.categorieslist-btn-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.dataset.id;
            editCategory(id);
        });
    });
    
    document.querySelectorAll('.categorieslist-btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.dataset.id;
            var name = this.dataset.name;
            showDeleteModal('category', id, name);
        });
    });
}

function renderSubcategoriesPreview(subcategories, categoryId) {
    if (!subcategories || !Array.isArray(subcategories) || subcategories.length === 0) {
        return '<span style="color: #888; font-size: 12px;">—</span>';
    }
    
    var maxShow = 3;
    var visible = subcategories.slice(0, maxShow);
    var remaining = subcategories.length - maxShow;
    
    var tags = '';
    visible.forEach(function(sub) {
        var safeName = sub.name || '';
        tags += '<span class="categorieslist-subcategory-tag" data-cat-id="' + escapeHtml(categoryId) + '" data-sub-name="' + escapeHtml(safeName) + '">' + escapeHtml(safeName) + '</span>';
    });
    
    var moreTag = remaining > 0 ? '<span class="categorieslist-subcategory-tag more" data-cat-id="' + escapeHtml(categoryId) + '">+' + remaining + '</span>' : '';
    
    return tags + moreTag;
}

// Event delegation para clics en subcategorías
document.addEventListener('click', function(e) {
    var tag = e.target.closest('.categorieslist-subcategory-tag');
    if (tag && !tag.classList.contains('more')) {
        var catId = tag.dataset.catId;
        var subName = tag.dataset.subName;
        var category = categories.find(function(c) { return c.id === catId; });
        if (category) {
            openSubcategoryModal(catId, category.name);
            setTimeout(function() {
                var input = elements.newSubcategoryName;
                if (input) {
                    input.value = subName || '';
                    input.focus();
                    input.select();
                }
            }, 200);
        }
    } else if (tag && tag.classList.contains('more')) {
        var catId = tag.dataset.catId;
        var category = categories.find(function(c) { return c.id === catId; });
        if (category) {
            openSubcategoryModal(catId, category.name);
        }
    }
});

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
                '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #ef4444;">' +
                    '<div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>' +
                    '<strong>Error al cargar categorías</strong><br>' +
                    '<span style="font-size: 13px; color: #888;">' + escapeHtml(error.message) + '</span><br><br>' +
                    '<button onclick="location.reload()" style="padding: 8px 24px; background: var(--outlet-gold, #ddab3b); border: none; border-radius: 8px; cursor: pointer; color: #1a1a1a; font-weight: 600;">Reintentar</button>' +
                '</td></tr>';
        }
    }
}

function resetCategoryForm() {
    if (elements.categoryId) elements.categoryId.value = '';
    if (elements.categoryName) elements.categoryName.value = '';
    if (elements.categorySlug) elements.categorySlug.value = '';
    if (elements.categoryDescription) elements.categoryDescription.value = '';
    if (elements.categoryIcon) elements.categoryIcon.value = '';
    if (elements.categoryOrder) elements.categoryOrder.value = '0';
    if (elements.categoryStatus) elements.categoryStatus.value = 'active';
    if (elements.modalTitle) elements.modalTitle.textContent = 'Nueva Categoría';
}

// ========================================
// NUEVA FUNCIÓN: Redirigir a la página de creación
// ========================================
function openCreatePage() {
    // Si estás usando un sistema de routing SPA
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/createCategories');
    } else {
        // Navegación tradicional
        window.location.href = 'createCategories.html';
    }
}

// ========================================
// EDITAR CATEGORÍA (mantiene el modal)
// ========================================
async function editCategory(id) {
    var category = categories.find(function(c) { return c.id === id; });
    if (!category) {
        await mostrarError('Categoría no encontrada', 'No se encontró la categoría que deseas editar.');
        return;
    }
    
    if (elements.categoryId) elements.categoryId.value = category.id || '';
    if (elements.categoryName) elements.categoryName.value = category.name || '';
    if (elements.categorySlug) elements.categorySlug.value = category.slug || '';
    if (elements.categoryDescription) elements.categoryDescription.value = category.description || '';
    if (elements.categoryIcon) elements.categoryIcon.value = category.icon || '';
    if (elements.categoryOrder) elements.categoryOrder.value = category.order || 0;
    if (elements.categoryStatus) elements.categoryStatus.value = category.status || 'active';
    if (elements.modalTitle) elements.modalTitle.textContent = 'Editar Categoría';
    
    showModal(elements.categoryModal);
}

async function saveCategory(event) {
    event.preventDefault();
    
    var name = elements.categoryName?.value?.trim() || '';
    if (!name) {
        await mostrarError('Campo requerido', 'El nombre de la categoría es obligatorio.');
        if (elements.categoryName) elements.categoryName.focus();
        return;
    }
    
    var categoryId = elements.categoryId?.value || '';
    var isEditing = !!categoryId;
    
    if (!isEditing) {
        var generatedId = generarIdDesdeNombre(name);
        if (!generatedId) {
            await mostrarError('Error', 'No se pudo generar un ID válido desde el nombre.');
            return;
        }
        
        var existingCategory = categories.find(function(c) { return c.id === generatedId; });
        if (existingCategory) {
            await mostrarError('ID duplicado', 'Ya existe una categoría con el ID "' + generatedId + '". Por favor, usa un nombre diferente.');
            return;
        }
        
        if (elements.categoryId) elements.categoryId.value = generatedId;
    }
    
    var categoryData = {
        name: name,
        slug: elements.categorySlug?.value?.trim() || generarSlug(name),
        description: elements.categoryDescription?.value?.trim() || '',
        icon: elements.categoryIcon?.value?.trim() || '',
        order: parseInt(elements.categoryOrder?.value) || 0,
        status: elements.categoryStatus?.value || 'active'
    };
    
    if (!isEditing) {
        categoryData.id = elements.categoryId?.value || '';
    }
    
    // Confirmación antes de guardar
    var actionText = isEditing ? 'actualizar' : 'crear';
    var confirmResult = await mostrarConfirmacion(
        '¿' + (isEditing ? 'Actualizar' : 'Crear') + ' categoría?',
        'Estás a punto de ' + actionText + ' la categoría "' + name + '".',
        'Sí, ' + actionText
    );
    
    if (!confirmResult.isConfirmed) {
        mostrarToast('Operación cancelada', 'info');
        return;
    }
    
    mostrarLoading((isEditing ? 'Actualizando' : 'Creando') + ' categoría...');
    
    try {
        var savedCategory;
        if (isEditing) {
            savedCategory = await CategoryService.update(categoryId, categoryData);
            cerrarLoading();
            await mostrarExito('¡Categoría actualizada!', '✅ "' + savedCategory.name + '" actualizada correctamente.');
        } else {
            savedCategory = await CategoryService.create(categoryData);
            cerrarLoading();
            await mostrarExito('¡Categoría creada!', '✅ "' + savedCategory.name + '" creada con ID: ' + savedCategory.id);
        }
        
        await loadCategories();
        hideModal(elements.categoryModal);
        resetCategoryForm();
        
    } catch (error) {
        cerrarLoading();
        console.error('Error al guardar categoría:', error);
        await mostrarError('Error al guardar', error.message || 'Ocurrió un error al guardar la categoría.');
    }
}

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
// Gestión de Subcategorías
// ========================================
async function openSubcategoryModal(categoryId, categoryName) {
    var category = categories.find(function(c) { return c.id === categoryId; });
    if (!category) {
        await mostrarError('Categoría no encontrada', 'No se encontró la categoría seleccionada.');
        return;
    }
    
    currentCategoryForSub = category;
    if (elements.currentCategoryName) elements.currentCategoryName.textContent = category.name || '';
    if (elements.submodalTitle) elements.submodalTitle.textContent = 'Subcategorías de ' + category.name;
    
    renderSubcategoriesList(category.subcategories || []);
    showModal(elements.subcategoryModal);
}

function renderSubcategoriesList(subcategories) {
    if (!elements.subcategoriesList) return;
    
    if (!subcategories || !Array.isArray(subcategories) || subcategories.length === 0) {
        elements.subcategoriesList.innerHTML = '<div class="categorieslist-empty">No hay subcategorías</div>';
        return;
    }
    
    var html = '';
    subcategories.forEach(function(sub, index) {
        var safeName = sub.name || '';
        html += 
            '<div class="categorieslist-subcategory-item" data-index="' + index + '">' +
                '<span class="categorieslist-subcategory-name">' + escapeHtml(safeName) + '</span>' +
                '<div class="categorieslist-subcategory-actions">' +
                    '<button class="categorieslist-subcategory-edit" data-index="' + index + '" data-name="' + escapeHtml(safeName) + '" title="Editar">' +
                        '<i class="material-symbols-outlined">edit</i>' +
                    '</button>' +
                    '<button class="categorieslist-subcategory-delete" data-index="' + index + '" data-name="' + escapeHtml(safeName) + '" title="Eliminar">' +
                        '<i class="material-symbols-outlined">delete</i>' +
                    '</button>' +
                '</div>' +
            '</div>';
    });
    
    elements.subcategoriesList.innerHTML = html;
    
    document.querySelectorAll('.categorieslist-subcategory-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            var oldName = this.dataset.name;
            editSubcategory(index, oldName);
        });
    });
    
    document.querySelectorAll('.categorieslist-subcategory-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            var name = this.dataset.name;
            showDeleteModal('subcategory', index, name);
        });
    });
}

async function addSubcategory() {
    var subcategoryName = elements.newSubcategoryName?.value?.trim() || '';
    if (!subcategoryName) {
        await mostrarError('Campo requerido', 'Ingresa un nombre para la subcategoría.');
        if (elements.newSubcategoryName) elements.newSubcategoryName.focus();
        return;
    }
    
    if (!currentCategoryForSub) {
        await mostrarError('Error', 'No hay categoría seleccionada.');
        return;
    }
    
    mostrarLoading('Añadiendo subcategoría...');
    
    try {
        var updatedCategory = await CategoryService.addSubcategory(currentCategoryForSub.id, subcategoryName);
        
        var index = categories.findIndex(function(c) { return c.id === updatedCategory.id; });
        if (index !== -1) {
            categories[index] = updatedCategory;
        }
        currentCategoryForSub = updatedCategory;
        
        renderSubcategoriesList(updatedCategory.subcategories || []);
        renderTable();
        if (elements.newSubcategoryName) elements.newSubcategoryName.value = '';
        
        cerrarLoading();
        await mostrarExito('¡Subcategoría añadida!', '✅ "' + subcategoryName + '" añadida correctamente.');
        
    } catch (error) {
        cerrarLoading();
        console.error('Error al añadir subcategoría:', error);
        await mostrarError('Error al añadir', error.message || 'No se pudo añadir la subcategoría.');
    }
}

async function editSubcategory(index, oldName) {
    var result = await mostrarSweetAlert({
        title: 'Editar subcategoría',
        input: 'text',
        inputValue: oldName,
        inputPlaceholder: 'Nombre de la subcategoría',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        inputValidator: function(value) {
            if (!value || !value.trim()) {
                return 'El nombre es obligatorio';
            }
            return null;
        }
    });
    
    if (!result.isConfirmed) return;
    
    var trimmedName = result.value.trim();
    if (trimmedName === oldName) {
        mostrarToast('Sin cambios', 'info');
        return;
    }
    
    var subcategoryId = currentCategoryForSub?.subcategories?.[index]?.id;
    if (!subcategoryId) {
        await mostrarError('Error', 'Subcategoría no encontrada.');
        return;
    }
    
    mostrarLoading('Actualizando subcategoría...');
    
    try {
        var updatedCategory = await CategoryService.updateSubcategory(
            currentCategoryForSub.id,
            subcategoryId,
            trimmedName
        );
        
        var catIndex = categories.findIndex(function(c) { return c.id === updatedCategory.id; });
        if (catIndex !== -1) {
            categories[catIndex] = updatedCategory;
        }
        currentCategoryForSub = updatedCategory;
        
        renderSubcategoriesList(updatedCategory.subcategories || []);
        renderTable();
        
        cerrarLoading();
        await mostrarExito('¡Subcategoría actualizada!', '✅ "' + trimmedName + '" actualizada correctamente.');
        
    } catch (error) {
        cerrarLoading();
        console.error('Error al actualizar subcategoría:', error);
        await mostrarError('Error al actualizar', error.message || 'No se pudo actualizar la subcategoría.');
    }
}

async function deleteSubcategory(subcategoryId) {
    if (!currentCategoryForSub) {
        await mostrarError('Error', 'No hay categoría seleccionada.');
        return;
    }
    
    var subName = currentCategoryForSub.subcategories?.find(function(sub) { return sub.id === subcategoryId; })?.name || '';
    
    try {
        var updatedCategory = await CategoryService.deleteSubcategory(currentCategoryForSub.id, subcategoryId);
        
        var catIndex = categories.findIndex(function(c) { return c.id === updatedCategory.id; });
        if (catIndex !== -1) {
            categories[catIndex] = updatedCategory;
        }
        currentCategoryForSub = updatedCategory;
        
        renderSubcategoriesList(updatedCategory.subcategories || []);
        renderTable();
        
        await mostrarExito('¡Subcategoría eliminada!', '✅ "' + subName + '" eliminada correctamente.');
        
    } catch (error) {
        console.error('Error al eliminar subcategoría:', error);
        await mostrarError('Error al eliminar', error.message || 'No se pudo eliminar la subcategoría.');
    }
}

// ========================================
// Modal de confirmación CON SWEETALERT2
// ========================================
async function showDeleteModal(type, id, name) {
    var displayName = name || 'este elemento';
    var entityType = type === 'category' ? 'categoría' : 'subcategoría';
    
    var result = await mostrarConfirmacion(
        '¿Eliminar ' + entityType + '?',
        '¿Estás seguro de que quieres eliminar "' + displayName + '"? Esta acción no se puede deshacer.',
        'Sí, eliminar'
    );
    
    if (result.isConfirmed) {
        deleteTarget = { type: type, id: id, name: name };
        await confirmDelete();
    }
}

async function confirmDelete() {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'category') {
        await deleteCategory(deleteTarget.id);
    } else if (deleteTarget.type === 'subcategory') {
        await deleteSubcategory(deleteTarget.id);
    }
    
    deleteTarget = null;
}

// ========================================
// Auto-generar slug
// ========================================
function setupSlugGeneration() {
    if (elements.categoryName) {
        elements.categoryName.addEventListener('input', function() {
            var name = this.value;
            if (name && elements.categorySlug && !elements.categoryId?.value) {
                elements.categorySlug.value = generarSlug(name);
            }
        });
    }
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // CAMBIO: Redirige a createCategories en lugar de abrir modal
    elements.addBtn?.addEventListener('click', openCreatePage);
    
    elements.categoryForm?.addEventListener('submit', saveCategory);
    elements.closeModalBtn?.addEventListener('click', function() { hideModal(elements.categoryModal); });
    
    elements.addSubcategoryBtn?.addEventListener('click', addSubcategory);
    elements.closeSubmodalBtn?.addEventListener('click', function() { hideModal(elements.subcategoryModal); });
    elements.newSubcategoryName?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubcategory();
        }
    });
    
    // Los botones de confirmación del modal ya no son necesarios porque usamos SweetAlert
    // Pero los mantenemos por compatibilidad
    elements.confirmDeleteBtn?.addEventListener('click', confirmDelete);
    elements.cancelDeleteBtn?.addEventListener('click', function() { deleteTarget = null; });
    elements.closeDeleteModalBtn?.addEventListener('click', function() { deleteTarget = null; });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (elements.categoryModal?.style.display === 'flex') hideModal(elements.categoryModal);
            if (elements.subcategoryModal?.style.display === 'flex') hideModal(elements.subcategoryModal);
            deleteTarget = null;
        }
    });
    
    elements.categoryModal?.addEventListener('click', function(e) {
        if (e.target === elements.categoryModal) hideModal(elements.categoryModal);
    });
    elements.subcategoryModal?.addEventListener('click', function(e) {
        if (e.target === elements.subcategoryModal) hideModal(elements.subcategoryModal);
    });
    
    setupSlugGeneration();
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