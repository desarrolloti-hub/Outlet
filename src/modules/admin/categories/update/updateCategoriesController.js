/* ========================================
   UPDATE CATEGORY CONTROLLER - OUTLET ADMIN
   Controlador para editar categorías existentes
   Actualización completa de datos de categoría
   INCLUYE EDICIÓN DE SUBCATEGORÍAS
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
var subcategories = []; // Array de subcategorías (objetos con name y description)

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
        
        // Subcategorías
        subcategoriesSection: document.getElementById('subcategoriesSection'),
        subcategoriesList: document.getElementById('subcategoriesList'),
        subcategoryCount: document.getElementById('subcategoryCount'),
        addSubcategoryBtn: document.getElementById('addSubcategoryBtn'),
        
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
// FUNCIONES DE SUBCATEGORÍAS
// ========================================

/**
 * Renderiza la lista de subcategorías editables
 */
function renderSubcategories() {
    if (!elements.subcategoriesList) return;
    
    if (!subcategories || subcategories.length === 0) {
        elements.subcategoriesList.innerHTML = `
            <div class="updatecategory-empty-sub">
                <i class="material-symbols-outlined" style="font-size: 32px; color: #ccc; display: block; margin-bottom: 8px;">subdirectory_arrow_right</i>
                No hay subcategorías
                <br>
                <small style="color: #aaa;">Haz clic en "Agregar Subcategoría" para añadir una</small>
            </div>
        `;
        if (elements.subcategoryCount) {
            elements.subcategoryCount.textContent = '(0)';
        }
        return;
    }
    
    var html = '';
    subcategories.forEach(function(sub, index) {
        var name = sub.name || '';
        var description = sub.description || '';
        html += `
            <div class="updatecategory-sub-item" data-index="${index}">
                <span class="sub-index">${index + 1}.</span>
                <div class="sub-inputs">
                    <input type="text" class="sub-name-input" value="${escapeHtml(name)}" placeholder="Nombre de subcategoría" data-index="${index}">
                    <input type="text" class="sub-description-input" value="${escapeHtml(description)}" placeholder="Descripción (opcional)" data-index="${index}">
                </div>
                <div class="sub-actions">
                    <button type="button" class="btn-move-up" data-index="${index}" title="Mover arriba" ${index === 0 ? 'disabled' : ''}>
                        <i class="material-symbols-outlined" style="font-size: 18px;">arrow_upward</i>
                    </button>
                    <button type="button" class="btn-move-down" data-index="${index}" title="Mover abajo" ${index === subcategories.length - 1 ? 'disabled' : ''}>
                        <i class="material-symbols-outlined" style="font-size: 18px;">arrow_downward</i>
                    </button>
                    <button type="button" class="btn-remove-sub" data-index="${index}" title="Eliminar">
                        <i class="material-symbols-outlined" style="font-size: 18px;">delete</i>
                    </button>
                </div>
            </div>
        `;
    });
    
    elements.subcategoriesList.innerHTML = html;
    
    if (elements.subcategoryCount) {
        elements.subcategoryCount.textContent = `(${subcategories.length})`;
    }
    
    // Mostrar sección de subcategorías
    if (elements.subcategoriesSection) {
        elements.subcategoriesSection.style.display = 'block';
    }
    
    // Actualizar vista previa en el panel derecho
    updatePreviewSubcategories();
    
    // Agregar event listeners a los elementos de subcategoría
    attachSubcategoryEvents();
}

/**
 * Agrega event listeners para los controles de subcategorías
 */
function attachSubcategoryEvents() {
    // Inputs de nombre y descripción - actualizar en tiempo real
    document.querySelectorAll('.sub-name-input').forEach(function(input) {
        input.addEventListener('input', function() {
            var index = parseInt(this.dataset.index);
            if (!isNaN(index) && subcategories[index]) {
                subcategories[index].name = this.value;
            }
        });
    });
    
    document.querySelectorAll('.sub-description-input').forEach(function(input) {
        input.addEventListener('input', function() {
            var index = parseInt(this.dataset.index);
            if (!isNaN(index) && subcategories[index]) {
                subcategories[index].description = this.value;
            }
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.btn-remove-sub').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            if (!isNaN(index)) {
                removeSubcategory(index);
            }
        });
    });
    
    // Botones de mover arriba
    document.querySelectorAll('.btn-move-up').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            if (!isNaN(index) && index > 0) {
                moveSubcategoryUp(index);
            }
        });
    });
    
    // Botones de mover abajo
    document.querySelectorAll('.btn-move-down').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            if (!isNaN(index) && index < subcategories.length - 1) {
                moveSubcategoryDown(index);
            }
        });
    });
}

/**
 * Agrega una nueva subcategoría vacía
 */
function addSubcategory() {
    subcategories.push({
        name: '',
        description: '',
        // El ID se generará al guardar
        status: 'active'
    });
    renderSubcategories();
    
    // Enfocar el nuevo input
    var inputs = document.querySelectorAll('.sub-name-input');
    if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
    }
}

/**
 * Elimina una subcategoría
 */
async function removeSubcategory(index) {
    var subName = subcategories[index]?.name || 'Subcategoría';
    
    var result = await mostrarConfirmacion(
        '¿Eliminar subcategoría?',
        `¿Estás seguro de eliminar "${subName || 'esta subcategoría'}"?`,
        'Sí, eliminar'
    );
    
    if (result.isConfirmed) {
        subcategories.splice(index, 1);
        renderSubcategories();
        mostrarToast('Subcategoría eliminada', 'info');
    }
}

/**
 * Mueve una subcategoría hacia arriba
 */
function moveSubcategoryUp(index) {
    if (index <= 0) return;
    var temp = subcategories[index];
    subcategories[index] = subcategories[index - 1];
    subcategories[index - 1] = temp;
    renderSubcategories();
}

/**
 * Mueve una subcategoría hacia abajo
 */
function moveSubcategoryDown(index) {
    if (index >= subcategories.length - 1) return;
    var temp = subcategories[index];
    subcategories[index] = subcategories[index + 1];
    subcategories[index + 1] = temp;
    renderSubcategories();
}

/**
 * Actualiza la vista previa de subcategorías en el panel derecho
 */
function updatePreviewSubcategories() {
    if (!elements.subcategoriesPreview) return;
    
    var validSubs = subcategories.filter(function(sub) {
        return sub.name && sub.name.trim() !== '';
    });
    
    if (validSubs.length === 0) {
        elements.subcategoriesPreview.innerHTML = '<p class="updatecategory-empty">Esta categoría no tiene subcategorías</p>';
        return;
    }
    
    var html = '<div style="margin-bottom: 12px;"><small style="color: #888;">Total: ' + validSubs.length + ' subcategoría(s)</small></div><div>';
    validSubs.forEach(function(sub) {
        var displayName = sub.name || 'Sin nombre';
        html += '<span class="updatecategory-subcategory-tag"><i class="material-symbols-outlined" style="font-size: 14px;">subdirectory_arrow_right</i>' + escapeHtml(displayName) + '</span>';
    });
    html += '</div>';
    
    elements.subcategoriesPreview.innerHTML = html;
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
        if (elements.subcategoriesSection) {
            elements.subcategoriesSection.style.display = 'none';
        }
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
    
    // Cargar subcategorías
    if (category.subcategories && Array.isArray(category.subcategories)) {
        subcategories = category.subcategories.map(function(sub) {
            return {
                name: sub.name || '',
                description: sub.description || '',
                status: sub.status || 'active',
                id: sub.id // Mantener el ID existente para actualización
            };
        });
    } else {
        subcategories = [];
    }
    
    renderSubcategories();
    
    elements.formFields.disabled = false;
    elements.actionButtons.style.display = 'flex';
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
    subcategories = [];
    if (elements.subcategoriesList) {
        elements.subcategoriesList.innerHTML = '';
    }
    if (elements.subcategoryCount) {
        elements.subcategoryCount.textContent = '(0)';
    }
    if (elements.subcategoriesSection) {
        elements.subcategoriesSection.style.display = 'none';
    }
    if (elements.subcategoriesPreview) {
        elements.subcategoriesPreview.innerHTML = '<p class="updatecategory-empty">Seleccione una categoría para ver sus subcategorías</p>';
    }
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
// Actualizar categoría CON SUBCATEGORÍAS
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
    
    // Validar subcategorías - no puede haber subcategorías con nombre vacío
    var invalidSubs = subcategories.filter(function(sub) {
        return sub.name && sub.name.trim() !== '' && sub.name.trim().length < 2;
    });
    
    if (invalidSubs.length > 0) {
        await mostrarError('Subcategorías inválidas', 
            'Las subcategorías deben tener al menos 2 caracteres. Revisa las subcategorías marcadas.');
        return;
    }
    
    // Filtrar subcategorías vacías para guardar
    var validSubcategories = subcategories.filter(function(sub) {
        return sub.name && sub.name.trim() !== '';
    }).map(function(sub) {
        return {
            id: sub.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: sub.name.trim(),
            description: sub.description ? sub.description.trim() : '',
            slug: generarSlug(sub.name),
            status: sub.status || 'active',
            // Mantener createdAt si existe
            createdAt: sub.createdAt || new Date().toISOString()
        };
    });
    
    var categoryData = {
        name: name,
        slug: slug,
        description: elements.categoryDescription.value.trim(),
        order: parseInt(elements.categoryOrder.value) || 0,
        status: elements.categoryStatus.value,
        subcategories: validSubcategories
    };
    
    // Confirmación antes de actualizar
    var confirmResult = await mostrarConfirmacion(
        '¿Actualizar categoría?',
        'Estás a punto de actualizar la categoría "' + name + '" con ' + validSubcategories.length + ' subcategoría(s).',
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
    
    mostrarLoading('Actualizando categoría y subcategorías...');
    
    try {
        var updatedCategory = await CategoryService.update(currentCategoryId, categoryData);
        
        cerrarLoading();
        await mostrarExito(
            '¡Categoría actualizada!',
            '✅ "' + updatedCategory.name + '" actualizada exitosamente con ' + validSubcategories.length + ' subcategoría(s).'
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
// Cancelar / resetear formulario
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
    if (elements.subcategoriesSection) {
        elements.subcategoriesSection.style.display = 'none';
    }
    clearForm();
    currentCategoryId = null;
    mostrarToast('Formulario reseteado', 'info');
}

// ========================================
// Redirigir a la página de lectura
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
    elements.backBtn?.addEventListener('click', goBackToList);
    
    elements.categorySelector?.addEventListener('change', onCategorySelect);
    
    elements.cancelBtn?.addEventListener('click', resetForm);
    
    elements.categoryForm?.addEventListener('submit', updateCategory);
    
    elements.addSubcategoryBtn?.addEventListener('click', addSubcategory);
    
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
    console.log('✏️ Update Category Controller - Editar categorías con subcategorías');
    
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
    if (elements.subcategoriesSection) {
        elements.subcategoriesSection.style.display = 'none';
    }
    
    await loadCategories();
    
    // Si hay un ID en la URL, seleccionar automáticamente esa categoría
    var categoryIdFromUrl = getCategoryIdFromUrl();
    if (categoryIdFromUrl && elements.categorySelector) {
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