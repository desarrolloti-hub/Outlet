// ========================================
// CREATE CATEGORIES CONTROLLER - OUTLET ADMIN
// Controlador para CREAR categorías con subcategorías
// CON SWEETALERT2 INTEGRADO Y SINCRONIZACIÓN CON FIREBASE
// ========================================

import { CategoryService } from '../../../../services/categoryService.js';

// ========================================
// Variables de estado
// ========================================
var isSubmitting = false;
var subcategories = [];
var categoriesList = [];
var currentSelectedCategoryId = null; // Para rastrear la categoría seleccionada

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
        
        existingCategorySelect: document.getElementById('existingCategorySelect'),
        
        categoryId: document.getElementById('categoryId'),
        categoryName: document.getElementById('categoryName'),
        categoryDescription: document.getElementById('categoryDescription'),
        saveBtn: document.getElementById('saveCategoryBtn'),
        resetBtn: document.getElementById('resetBtn'),
        
        subcategoryName: document.getElementById('subcategoryName'),
        subcategoryDescription: document.getElementById('subcategoryDescription'),
        addSubBtn: document.getElementById('addSubcategoryBtn'),
        subcategoriesList: document.getElementById('subcategoriesList'),
        
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

function validarIdFormato(id) {
    if (!id || id.trim() === '') return false;
    var regex = /^[a-z0-9_\-]+$/;
    return regex.test(id);
}

// ========================================
// Cargar categorías existentes
// ========================================
async function loadExistingCategories() {
    try {
        console.log('🔄 Cargando categorías existentes...');
        
        if (elements.existingCategorySelect) {
            elements.existingCategorySelect.innerHTML = '<option value="">Cargando categorías...</option>';
            elements.existingCategorySelect.disabled = true;
        }
        
        categoriesList = await CategoryService.getAll({}, true);
        
        console.log('✅ ' + categoriesList.length + ' categorías cargadas');
        
        if (elements.existingCategorySelect) {
            elements.existingCategorySelect.disabled = false;
            populateExistingCategories();
        }
        
        if (categoriesList.length === 0) {
            if (elements.existingCategorySelect) {
                elements.existingCategorySelect.innerHTML = '<option value="">No hay categorías disponibles</option>';
            }
        }
        
    } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
        await mostrarError('Error al cargar categorías', error.message || 'No se pudieron cargar las categorías existentes.');
        if (elements.existingCategorySelect) {
            elements.existingCategorySelect.innerHTML = '<option value="">Error al cargar categorías</option>';
            elements.existingCategorySelect.disabled = false;
        }
    }
}

function populateExistingCategories() {
    if (!elements.existingCategorySelect) return;
    
    elements.existingCategorySelect.innerHTML = '';
    
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccionar categoría existente';
    elements.existingCategorySelect.appendChild(defaultOption);
    
    categoriesList.forEach(function(cat) {
        var option = document.createElement('option');
        option.value = cat.id;
        var subCount = cat.subcategories?.length || 0;
        option.textContent = cat.name + ' (' + subCount + ' subcategorías)';
        elements.existingCategorySelect.appendChild(option);
    });
}

// ========================================
// Renderizar lista de subcategorías
// ========================================
function renderSubcategories() {
    if (!elements.subcategoriesList) return;
    
    if (subcategories.length === 0) {
        elements.subcategoriesList.innerHTML = 
            '<div class="outlet-empty-message">No hay subcategorías agregadas</div>';
        return;
    }
    
    var html = '';
    subcategories.forEach(function(sub, index) {
        html += 
            '<div class="outlet-subcategory-item" data-index="' + index + '">' +
                '<div class="outlet-subcategory-info">' +
                    '<div class="outlet-subcategory-name">' +
                        '<span class="material-symbols-outlined">subdirectory_arrow_right</span>' +
                        escapeHtml(sub.name) +
                    '</div>' +
                    (sub.description ? '<div class="outlet-subcategory-desc">' + escapeHtml(sub.description) + '</div>' : '') +
                '</div>' +
                '<div class="outlet-subcategory-actions">' +
                    '<button class="outlet-subcategory-edit" data-index="' + index + '" title="Editar">' +
                        '<span class="material-symbols-outlined">edit</span>' +
                    '</button>' +
                    '<button class="outlet-subcategory-delete" data-index="' + index + '" title="Eliminar">' +
                        '<span class="material-symbols-outlined">delete</span>' +
                    '</button>' +
                '</div>' +
            '</div>';
    });
    
    elements.subcategoriesList.innerHTML = html;
    
    document.querySelectorAll('.outlet-subcategory-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            editSubcategory(index);
        });
    });
    
    document.querySelectorAll('.outlet-subcategory-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            deleteSubcategory(index);
        });
    });
}

// ========================================
// CRUD de Subcategorías CON FIREBASE
// ========================================

// AGREGAR subcategoría
async function addSubcategory() {
    var name = elements.subcategoryName?.value?.trim() || '';
    var description = elements.subcategoryDescription?.value?.trim() || '';
    
    if (!name) {
        mostrarError('Campo requerido', 'El nombre de la subcategoría es obligatorio.');
        if (elements.subcategoryName) elements.subcategoryName.focus();
        return;
    }
    
    // Verificar si hay una categoría seleccionada o creada
    var categoryId = elements.categoryId?.value?.trim() || '';
    var categoryName = elements.categoryName?.value?.trim() || '';
    
    // Si no hay ID de categoría, pero hay nombre, generar uno
    if (!categoryId && categoryName) {
        categoryId = generarIdDesdeNombre(categoryName);
        // Actualizar el campo ID
        if (elements.categoryId) elements.categoryId.value = categoryId;
    }
    
    if (!categoryId) {
        mostrarError('Categoría requerida', 'Debes ingresar un ID y nombre de categoría antes de agregar subcategorías.');
        if (elements.categoryName) elements.categoryName.focus();
        return;
    }
    
    // Verificar duplicado en la lista local
    var exists = subcategories.some(function(sub) { 
        return sub.name.toLowerCase() === name.toLowerCase(); 
    });
    
    if (exists) {
        mostrarError('Subcategoría duplicada', 'La subcategoría "' + name + '" ya existe en la lista.');
        return;
    }
    
    // Crear objeto de subcategoría
    var newSubcategory = { 
        name: name, 
        description: description,
        slug: generarSlug(name)
    };
    
    try {
        // Mostrar loading
        var loadingResult = mostrarLoading('Guardando subcategoría...');
        
        // Si hay una categoría existente seleccionada, guardar en Firebase
        if (currentSelectedCategoryId) {
            // Usar el servicio para agregar subcategoría a categoría existente
            await CategoryService.addSubcategory(currentSelectedCategoryId, name, description);
            
            // Recargar la categoría actualizada
            await loadCategoryData(currentSelectedCategoryId);
            
            // Recargar lista de categorías
            await loadExistingCategories();
            
            mostrarToast('Subcategoría "' + name + '" agregada a la categoría', 'success');
        } else {
            // Si es una categoría nueva, solo agregar a la lista local
            // (se guardará cuando se cree la categoría)
            subcategories.push(newSubcategory);
            renderSubcategories();
            mostrarToast('Subcategoría "' + name + '" agregada (se guardará al crear la categoría)', 'success');
        }
        
        // Limpiar campos
        if (elements.subcategoryName) elements.subcategoryName.value = '';
        if (elements.subcategoryDescription) elements.subcategoryDescription.value = '';
        if (elements.subcategoryName) elements.subcategoryName.focus();
        
        // Cerrar loading
        cerrarLoading();
        
    } catch (error) {
        cerrarLoading();
        console.error('Error al agregar subcategoría:', error);
        await mostrarError('Error al guardar', error.message || 'No se pudo agregar la subcategoría.');
    }
}

// EDITAR subcategoría
async function editSubcategory(index) {
    var sub = subcategories[index];
    if (!sub) return;
    
    var result = await mostrarSweetAlert({
        title: 'Editar subcategoría',
        html: 
            '<div style="text-align: left;">' +
                '<label style="display:block;font-weight:600;margin-bottom:4px;font-size:12px;color:var(--outlet-text-secondary);">Nombre</label>' +
                '<input id="swal-edit-name" class="swal2-input" value="' + escapeHtml(sub.name) + '" style="margin-bottom:12px;">' +
                '<label style="display:block;font-weight:600;margin-bottom:4px;font-size:12px;color:var(--outlet-text-secondary);">Descripción (opcional)</label>' +
                '<input id="swal-edit-desc" class="swal2-input" value="' + escapeHtml(sub.description || '') + '">' +
            '</div>',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        focusConfirm: false,
        preConfirm: function() {
            var newName = document.getElementById('swal-edit-name').value.trim();
            var newDesc = document.getElementById('swal-edit-desc').value.trim();
            
            if (!newName) {
                Swal.showValidationMessage('El nombre es obligatorio');
                return false;
            }
            
            var exists = subcategories.some(function(s, i) { 
                return i !== index && s.name.toLowerCase() === newName.toLowerCase(); 
            });
            
            if (exists) {
                Swal.showValidationMessage('La subcategoría "' + newName + '" ya existe');
                return false;
            }
            
            return { name: newName, description: newDesc };
        }
    });
    
    if (result.isConfirmed && result.value) {
        try {
            var updatedSub = result.value;
            
            // Si hay una categoría existente seleccionada, actualizar en Firebase
            if (currentSelectedCategoryId && sub.id) {
                await CategoryService.updateSubcategory(
                    currentSelectedCategoryId, 
                    sub.id, 
                    updatedSub.name, 
                    updatedSub.description
                );
                
                // Recargar la categoría actualizada
                await loadCategoryData(currentSelectedCategoryId);
                await loadExistingCategories();
                
                mostrarToast('Subcategoría actualizada en Firebase', 'success');
            } else {
                // Solo actualizar local
                subcategories[index] = { 
                    ...sub, 
                    name: updatedSub.name, 
                    description: updatedSub.description,
                    slug: generarSlug(updatedSub.name)
                };
                renderSubcategories();
                mostrarToast('Subcategoría actualizada', 'success');
            }
            
        } catch (error) {
            console.error('Error al actualizar subcategoría:', error);
            await mostrarError('Error al actualizar', error.message || 'No se pudo actualizar la subcategoría.');
        }
    }
}

// ELIMINAR subcategoría
async function deleteSubcategory(index) {
    var sub = subcategories[index];
    if (!sub) return;
    
    var result = await mostrarConfirmacion(
        '¿Eliminar subcategoría?',
        '¿Estás seguro de que quieres eliminar "' + sub.name + '"?',
        'Sí, eliminar'
    );
    
    if (result.isConfirmed) {
        try {
            // Si hay una categoría existente seleccionada y la subcategoría tiene ID, eliminar de Firebase
            if (currentSelectedCategoryId && sub.id) {
                await CategoryService.deleteSubcategory(currentSelectedCategoryId, sub.id);
                
                // Recargar la categoría actualizada
                await loadCategoryData(currentSelectedCategoryId);
                await loadExistingCategories();
                
                mostrarToast('Subcategoría "' + sub.name + '" eliminada de Firebase', 'success');
            } else {
                // Solo eliminar local
                subcategories.splice(index, 1);
                renderSubcategories();
                mostrarToast('Subcategoría "' + sub.name + '" eliminada', 'success');
            }
            
        } catch (error) {
            console.error('Error al eliminar subcategoría:', error);
            await mostrarError('Error al eliminar', error.message || 'No se pudo eliminar la subcategoría.');
        }
    }
}

// ========================================
// Auto-generar ID
// ========================================
function setupAutoGeneration() {
    if (elements.categoryName) {
        elements.categoryName.addEventListener('input', function() {
            var name = this.value;
            if (name && elements.categoryId) {
                var generatedId = generarIdDesdeNombre(name);
                elements.categoryId.value = generatedId;
            }
        });
    }
}

// ========================================
// Cargar datos de categoría existente
// ========================================
async function loadCategoryData(categoryId) {
    try {
        var category = categoriesList.find(function(c) { return c.id === categoryId; });
        if (!category) {
            // Si no está en la lista, intentar obtener directamente
            category = await CategoryService.getById(categoryId, true);
            if (!category) {
                mostrarError('Categoría no encontrada', 'No se pudo cargar la categoría seleccionada.');
                return;
            }
        }
        
        // Guardar el ID de la categoría seleccionada
        currentSelectedCategoryId = categoryId;
        
        // Llenar el formulario con los datos de la categoría
        if (elements.categoryId) elements.categoryId.value = category.id || '';
        if (elements.categoryName) elements.categoryName.value = category.name || '';
        if (elements.categoryDescription) elements.categoryDescription.value = category.description || '';
        
        // Cargar subcategorías (con sus IDs)
        subcategories = (category.subcategories || []).map(function(sub) {
            return {
                id: sub.id || sub._id || null,
                name: sub.name || '',
                description: sub.description || '',
                slug: sub.slug || generarSlug(sub.name)
            };
        });
        renderSubcategories();
        
        mostrarToast('Cargada categoría "' + category.name + '"', 'success');
        
    } catch (error) {
        console.error('Error al cargar categoría:', error);
        await mostrarError('Error al cargar', error.message || 'No se pudo cargar la categoría.');
    }
}

// ========================================
// Guardar categoría CON SWEETALERT2 Y FIREBASE
// ========================================
async function saveCategory() {
    if (isSubmitting) return;
    
    var name = elements.categoryName?.value?.trim() || '';
    if (!name) {
        await mostrarError('Campo requerido', 'El nombre de la categoría es obligatorio.');
        if (elements.categoryName) elements.categoryName.focus();
        return;
    }
    
    var categoryId = elements.categoryId?.value?.trim() || '';
    if (!categoryId) {
        await mostrarError('Campo requerido', 'El ID de la categoría es obligatorio.');
        if (elements.categoryId) elements.categoryId.focus();
        return;
    }
    
    if (!validarIdFormato(categoryId)) {
        await mostrarError('Formato inválido', 'El ID solo puede contener letras minúsculas, números, guiones bajos (_) y guiones (-).');
        if (elements.categoryId) elements.categoryId.focus();
        return;
    }
    
    // Verificar si es una categoría existente o nueva
    var isExisting = currentSelectedCategoryId === categoryId;
    
    if (!isExisting) {
        try {
            var existing = await CategoryService.getById(categoryId);
            if (existing) {
                await mostrarError('ID duplicado', 'Ya existe una categoría con el ID "' + categoryId + '".');
                if (elements.categoryId) elements.categoryId.focus();
                return;
            }
        } catch (error) {
            console.warn('Error verificando ID:', error);
        }
    }
    
    var categoryData = {
        id: categoryId,
        name: name,
        slug: generarSlug(name),
        description: elements.categoryDescription?.value?.trim() || '',
        order: categoriesList.length,
        subcategories: subcategories.map(function(sub) {
            return {
                id: sub.id || null,
                name: sub.name,
                description: sub.description || '',
                slug: sub.slug || generarSlug(sub.name),
                createdAt: sub.createdAt || new Date().toISOString()
            };
        })
    };
    
    // Confirmación antes de guardar
    var confirmResult = await mostrarConfirmacion(
        isExisting ? '¿Actualizar categoría?' : '¿Crear categoría?',
        isExisting 
            ? 'Estás a punto de actualizar la categoría "' + name + '" con ' + subcategories.length + ' subcategoría(s).' 
            : 'Estás a punto de crear la categoría "' + name + '" con ' + subcategories.length + ' subcategoría(s).',
        isExisting ? 'Sí, actualizar' : 'Sí, crear'
    );
    
    if (!confirmResult.isConfirmed) {
        mostrarToast('Operación cancelada', 'info');
        return;
    }
    
    isSubmitting = true;
    var btn = elements.saveBtn;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> ' + (isExisting ? 'Actualizando...' : 'Creando...');
    }
    
    mostrarLoading(isExisting ? 'Actualizando categoría...' : 'Creando categoría...');
    
    try {
        var savedCategory;
        
        if (isExisting && currentSelectedCategoryId) {
            // Actualizar categoría existente
            var updateData = {
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                subcategories: categoryData.subcategories
            };
            savedCategory = await CategoryService.update(currentSelectedCategoryId, updateData);
        } else {
            // Crear nueva categoría
            savedCategory = await CategoryService.create(categoryData);
        }
        
        cerrarLoading();
        await mostrarExito(
            isExisting ? '¡Categoría actualizada!' : '¡Categoría creada!',
            '✅ "' + savedCategory.name + '" ' + (isExisting ? 'actualizada' : 'creada') + ' con ' + savedCategory.subcategories.length + ' subcategoría(s).'
        );
        
        // Resetear formulario y recargar lista
        resetFormLocal();
        await loadExistingCategories();
        
        // Si actualizamos, mantener la categoría seleccionada
        if (isExisting && elements.existingCategorySelect) {
            elements.existingCategorySelect.value = categoryId;
            await loadCategoryData(categoryId);
        }
        
    } catch (error) {
        cerrarLoading();
        console.error('Error al guardar categoría:', error);
        await mostrarError('Error al guardar', error.message || 'Ocurrió un error inesperado.');
    } finally {
        isSubmitting = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">save</span> ' + (isExisting ? 'Actualizar Categoría' : 'Crear Categoría');
        }
    }
}

// ========================================
// Resetear formulario (local, sin confirmación)
// ========================================
function resetFormLocal() {
    if (elements.categoryId) elements.categoryId.value = '';
    if (elements.categoryName) elements.categoryName.value = '';
    if (elements.categoryDescription) elements.categoryDescription.value = '';
    if (elements.subcategoryName) elements.subcategoryName.value = '';
    if (elements.subcategoryDescription) elements.subcategoryDescription.value = '';
    
    subcategories = [];
    currentSelectedCategoryId = null;
    renderSubcategories();
    
    if (elements.existingCategorySelect) {
        elements.existingCategorySelect.value = '';
    }
    
    if (elements.categoryName) elements.categoryName.focus();
}

// ========================================
// Resetear formulario CON SWEETALERT2
// ========================================
async function resetForm() {
    var hasData = elements.categoryName?.value?.trim() || 
                  elements.categoryDescription?.value?.trim() || 
                  subcategories.length > 0;
    
    if (hasData) {
        var result = await mostrarAdvertencia(
            '¿Resetear formulario?',
            'Se perderán todos los datos ingresados. ¿Deseas continuar?',
            'Sí, resetear'
        );
        
        if (!result.isConfirmed) return;
    }
    
    resetFormLocal();
    mostrarToast('Formulario reseteado', 'info');
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    elements.backBtn?.addEventListener('click', function() {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/readCategories');
        } else {
            window.history.back();
        }
    });
    
    elements.saveBtn?.addEventListener('click', saveCategory);
    elements.resetBtn?.addEventListener('click', resetForm);
    
    elements.addSubBtn?.addEventListener('click', addSubcategory);
    elements.subcategoryName?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubcategory();
        }
    });
    elements.subcategoryDescription?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubcategory();
        }
    });
    
    elements.existingCategorySelect?.addEventListener('change', function(e) {
        var selectedId = e.target.value;
        if (selectedId) {
            loadCategoryData(selectedId);
        } else {
            // Limpiar formulario al seleccionar "Seleccionar categoría"
            resetFormLocal();
            currentSelectedCategoryId = null;
        }
    });
    
    // Cuando el nombre cambia, resetear el estado de categoría existente
    elements.categoryId?.addEventListener('input', function() {
        var currentId = this.value.trim();
        var selectValue = elements.existingCategorySelect?.value || '';
        
        // Si el ID manual no coincide con el seleccionado, desvincular
        if (selectValue && currentId !== selectValue) {
            currentSelectedCategoryId = null;
            if (elements.existingCategorySelect) {
                elements.existingCategorySelect.value = '';
            }
        }
    });
    
    setupAutoGeneration();
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
export async function categoriesCreateController() {
    console.log('📝 Create Categories Controller - Crear categorías con subcategorías');
    
    cacheElements();
    syncDarkMode();
    initEventListeners();
    
    // Resetear formulario inicial
    resetFormLocal();
    
    await loadExistingCategories();
    
    // Si hay categorías, seleccionar la primera por defecto (opcional)
    // if (categoriesList.length > 0 && elements.existingCategorySelect) {
    //     elements.existingCategorySelect.value = categoriesList[0].id;
    //     await loadCategoryData(categoriesList[0].id);
    // }
    
    console.log('✅ Create Categories page loaded');
}