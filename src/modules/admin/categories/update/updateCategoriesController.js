/* ========================================
   UPDATE CATEGORY CONTROLLER - OUTLET ADMIN
   Controlador para editar categorías existentes
   Actualización completa de datos de categoría
   RESPONSIVE: Se adapta a cualquier tamaño
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { CategoryService } from '../../../../services/categoryService.js';

// ========================================
// Variables de estado
// ========================================
var categories = [];
var currentCategoryId = null;
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
        
        categoryForm: document.getElementById('updateCategoryForm'),
        categorySelector: document.getElementById('categorySelector'),
        categoryId: document.getElementById('categoryId'),
        categoryName: document.getElementById('categoryName'),
        categorySlug: document.getElementById('categorySlug'),
        categoryDescription: document.getElementById('categoryDescription'),
        categoryOrder: document.getElementById('categoryOrder'),
        categoryStatus: document.getElementById('categoryStatus'),
        categoryCreatedAt: document.getElementById('categoryCreatedAt'),
        
        formFields: document.getElementById('formFields'),
        actionButtons: document.getElementById('actionButtons'),
        
        saveBtn: document.getElementById('saveBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        
        previewCard: document.getElementById('previewCard'),
        subcategoriesPreview: document.getElementById('subcategoriesPreview'),
        
        // 🖼️ Elementos de imagen
        updateImageDisplay: document.getElementById('updateImageDisplay'),
        updateImagePlaceholder: document.getElementById('updateImagePlaceholder'),
        
        toast: document.getElementById('updateToast')
    };
}

// ========================================
// Utilidades
// ========================================
function escapeHtml(str) {
    if (!str) return '';
    return str
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

function formatDate(dateString) {
    if (!dateString) return 'No disponible';
    var date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ========================================
// 🖼️ Funciones de imagen
// ========================================
function clearImagePreview() {
    if (elements.updateImageDisplay) {
        elements.updateImageDisplay.src = '';
        elements.updateImageDisplay.style.display = 'none';
    }
    if (elements.updateImagePlaceholder) {
        elements.updateImagePlaceholder.style.display = 'flex';
    }
}

function showImagePreview(imageBase64) {
    if (imageBase64 && imageBase64.startsWith('data:image')) {
        if (elements.updateImageDisplay) {
            elements.updateImageDisplay.src = imageBase64;
            elements.updateImageDisplay.style.display = 'block';
        }
        if (elements.updateImagePlaceholder) {
            elements.updateImagePlaceholder.style.display = 'none';
        }
    } else {
        clearImagePreview();
    }
}

// ========================================
// Cargar categorías
// ========================================
async function loadCategories() {
    try {
        categories = await CategoryService.getAll();
        populateCategorySelector();
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        await mostrarError('Error al cargar categorías', error.message || 'No se pudieron cargar las categorías.');
        categories = [];
        populateCategorySelector();
    }
}

function populateCategorySelector() {
    if (!elements.categorySelector) return;
    
    if (categories.length === 0) {
        elements.categorySelector.innerHTML = '<option value="">-- No hay categorías disponibles --</option>';
        return;
    }
    
    var html = '<option value="">-- Seleccione una categoría --</option>';
    categories.forEach(function(cat) {
        html += '<option value="' + escapeHtml(cat.id) + '">' + escapeHtml(cat.name) + ' (ID: ' + escapeHtml(cat.id) + ')</option>';
    });
    elements.categorySelector.innerHTML = html;
}

// ========================================
// Obtener ID de la URL
// ========================================
function getCategoryIdFromUrl() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// ========================================
// Cargar datos de la categoría seleccionada
// ========================================
function onCategorySelect() {
    var selectedId = elements.categorySelector.value;
    
    if (!selectedId) {
        elements.formFields.disabled = true;
        elements.actionButtons.style.display = 'none';
        elements.previewCard.style.display = 'none';
        clearForm();
        return;
    }
    
    var category = categories.find(function(c) { return c.id === selectedId; });
    if (!category) return;
    
    currentCategoryId = selectedId;
    
    elements.categoryId.value = category.id;
    elements.categoryName.value = category.name;
    elements.categorySlug.value = category.slug;
    elements.categoryDescription.value = category.description || '';
    elements.categoryOrder.value = category.order || 0;
    elements.categoryStatus.value = category.status || 'active';
    elements.categoryCreatedAt.value = formatDate(category.createdAt);
    
    // 🖼️ Mostrar imagen
    if (category.imageBase64 && category.imageBase64.startsWith('data:image')) {
        showImagePreview(category.imageBase64);
    } else {
        clearImagePreview();
    }
    
    elements.formFields.disabled = false;
    elements.actionButtons.style.display = 'flex';
    
    renderSubcategoriesPreview(category.subcategories || []);
    elements.previewCard.style.display = 'block';
}

function clearForm() {
    elements.categoryId.value = '';
    elements.categoryName.value = '';
    elements.categorySlug.value = '';
    elements.categoryDescription.value = '';
    elements.categoryOrder.value = '0';
    elements.categoryStatus.value = 'active';
    elements.categoryCreatedAt.value = '';
    clearImagePreview();
}

function renderSubcategoriesPreview(subcategories) {
    if (!elements.subcategoriesPreview) return;
    
    if (!subcategories || subcategories.length === 0) {
        elements.subcategoriesPreview.innerHTML = '<p class="updatecategory-empty">Esta categoría no tiene subcategorías</p>';
        return;
    }
    
    var html = '<div style="margin-bottom: 12px;"><small style="color: #888;">Total: ' + subcategories.length + ' subcategoría(s)</small></div><div>';
    subcategories.forEach(function(sub) {
        html += '<span class="updatecategory-subcategory-tag"><i class="material-symbols-outlined" style="font-size: 14px;">subdirectory_arrow_right</i>' + escapeHtml(sub.name) + '</span>';
    });
    html += '</div>';
    
    elements.subcategoriesPreview.innerHTML = html;
}

// ========================================
// Auto-generar slug desde el nombre
// ========================================
function setupSlugGeneration() {
    if (elements.categoryName) {
        elements.categoryName.addEventListener('input', function() {
            var name = this.value;
            if (name && elements.formFields && !elements.formFields.disabled) {
                elements.categorySlug.value = generarSlug(name);
            }
        });
    }
}

// ========================================
// Actualizar categoría CON SWEETALERT2
// ========================================
async function updateCategory(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    if (!currentCategoryId) {
        await mostrarError('Sin categoría seleccionada', 'Seleccione una categoría para actualizar.');
        return;
    }
    
    var name = elements.categoryName.value.trim();
    if (!name) {
        await mostrarError('Campo requerido', 'El nombre de la categoría es obligatorio.');
        elements.categoryName.focus();
        return;
    }
    
    var slug = elements.categorySlug.value.trim();
    if (!slug) {
        await mostrarError('Campo requerido', 'El slug es obligatorio.');
        return;
    }
    
    var categoryData = {
        name: name,
        slug: slug,
        description: elements.categoryDescription.value.trim(),
        order: parseInt(elements.categoryOrder.value) || 0,
        status: elements.categoryStatus.value
    };
    
    // Confirmación antes de actualizar
    var confirmResult = await mostrarConfirmacion(
        '¿Actualizar categoría?',
        'Estás a punto de actualizar la categoría "' + name + '".',
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
    
    mostrarLoading('Actualizando categoría...');
    
    try {
        var updatedCategory = await CategoryService.update(currentCategoryId, categoryData);
        
        cerrarLoading();
        await mostrarExito(
            '¡Categoría actualizada!',
            '✅ "' + updatedCategory.name + '" actualizada exitosamente.'
        );
        
        await loadCategories();
        
        elements.categorySelector.value = updatedCategory.id;
        onCategorySelect();
        
    } catch (error) {
        cerrarLoading();
        console.error('Error al actualizar categoría:', error);
        await mostrarError('Error al actualizar', error.message || 'No se pudo actualizar la categoría.');
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
    if (currentCategoryId) {
        var result = await mostrarAdvertencia(
            '¿Cancelar edición?',
            'Se perderán los cambios no guardados. ¿Deseas continuar?',
            'Sí, cancelar'
        );
        
        if (!result.isConfirmed) return;
    }
    
    elements.categorySelector.value = '';
    elements.formFields.disabled = true;
    elements.actionButtons.style.display = 'none';
    elements.previewCard.style.display = 'none';
    clearForm();
    currentCategoryId = null;
    mostrarToast('Formulario reseteado', 'info');
}

// ========================================
// NUEVA FUNCIÓN: Redirigir a la página de lectura
// ========================================
function goBackToList() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/readCategories');
    } else {
        window.location.href = 'readCategories.html';
    }
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // CAMBIO: Redirige a readCategories en lugar de history.back()
    elements.backBtn?.addEventListener('click', goBackToList);
    
    elements.categorySelector?.addEventListener('change', onCategorySelect);
    
    elements.cancelBtn?.addEventListener('click', resetForm);
    
    elements.categoryForm?.addEventListener('submit', updateCategory);
    
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
export async function updateCategoryController() {
    console.log('✏️ Update Category Controller - Editar categorías');
    
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
    
    await loadCategories();
    
    // Si hay un ID en la URL, seleccionar automáticamente esa categoría
    var categoryIdFromUrl = getCategoryIdFromUrl();
    if (categoryIdFromUrl && elements.categorySelector) {
        // Verificar que la categoría existe
        var categoryExists = categories.some(function(c) { return c.id === categoryIdFromUrl; });
        if (categoryExists) {
            elements.categorySelector.value = categoryIdFromUrl;
            onCategorySelect();
            console.log('✅ Categoría cargada automáticamente desde URL: ' + categoryIdFromUrl);
        } else {
            console.warn('⚠️ Categoría no encontrada: ' + categoryIdFromUrl);
            mostrarToast('La categoría solicitada no existe', 'error');
        }
    }
    
    console.log('✅ Update Category page loaded');
}