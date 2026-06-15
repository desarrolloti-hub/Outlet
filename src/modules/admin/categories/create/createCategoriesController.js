/* ========================================
   CREATE CATEGORIES CONTROLLER - OUTLET ADMIN
   Controlador para gestionar categorías dinámicamente
   CRUD completo de categorías y subcategorías
   RESPONSIVE: Se adapta a cualquier tamaño
   ======================================== */

import { CategoryService } from '/services/categoryService.js';

// ========================================
// Variables de estado
// ========================================
let categories = [];           // Array de categorías
let currentCategory = null;    // Categoría seleccionada actualmente
let isEditing = false;         // Modo edición vs creación
let searchTerm = '';           // Término de búsqueda
let deleteTarget = null;       // Elemento a eliminar { type, id, name }
let isLoading = false;         // Para evitar doble envío

// ========================================
// DOM Elements
// ========================================
let elements = {};

function cacheElements() {
    elements = {
        // Header
        backBtn: document.getElementById('backBtn'),
        
        // Lista de categorías
        categoriesList: document.getElementById('categoriesList'),
        searchInput: document.getElementById('searchCategory'),
        
        // Formulario de categorías
        categoryIdInput: document.getElementById('categoryIdInput'),
        categoryIdHidden: document.getElementById('categoryIdHidden'),
        categoryName: document.getElementById('categoryName'),
        categorySlug: document.getElementById('categorySlug'),
        categoryDescription: document.getElementById('categoryDescription'),
        categoryOrder: document.getElementById('categoryOrder'),
        categoryStatus: document.getElementById('categoryStatus'),
        categoryIcon: document.getElementById('categoryIcon'),
        saveBtn: document.getElementById('saveCategoryBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        formTitle: document.getElementById('formTitle'),
        formIcon: document.getElementById('formIcon'),
        
        // Subcategorías
        subcategoriesSection: document.getElementById('subcategoriesSection'),
        subcategoryName: document.getElementById('subcategoryName'),
        addSubcategoryBtn: document.getElementById('addSubcategoryBtn'),
        subcategoriesList: document.getElementById('subcategoriesList'),
        
        // Modal
        deleteModal: document.getElementById('deleteModal'),
        deleteItemName: document.getElementById('deleteItemName'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
        closeModalBtn: document.getElementById('closeModalBtn')
    };
}

// ========================================
// UI Helpers
// ========================================
function mostrarToast(mensaje, tipo = 'info') {
    const toastExistente = document.querySelector('.outlet-toast-notification');
    if (toastExistente) toastExistente.remove();
    
    const toast = document.createElement('div');
    toast.className = 'outlet-toast-notification';
    toast.textContent = mensaje;
    if (tipo === 'success') toast.style.borderLeftColor = 'var(--outlet-success)';
    if (tipo === 'error') toast.style.borderLeftColor = 'var(--outlet-danger)';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function generarSlug(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function generarIdDesdeNombre(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// Validar formato del ID
function validarIdFormato(id) {
    if (!id || id.trim() === '') return false;
    const regex = /^[a-z0-9_\-]+$/;
    return regex.test(id);
}

// Auto-generar slug cuando se escribe el nombre
function setupSlugGeneration() {
    if (elements.categoryName) {
        elements.categoryName.addEventListener('input', () => {
            const name = elements.categoryName.value;
            if (name) {
                // Solo auto-generar slug si no está en modo edición o si el slug está vacío
                if (!isEditing || elements.categorySlug.value === '') {
                    elements.categorySlug.value = generarSlug(name);
                }
                
                // Auto-generar ID solo si no está en modo edición y el campo ID está vacío o es el autogenerado anterior
                if (!isEditing && (elements.categoryIdInput.value === '' || elements.categoryIdInput.value === generarIdDesdeNombre(elements.categoryName.dataset.lastGeneratedName || ''))) {
                    const generatedId = generarIdDesdeNombre(name);
                    elements.categoryIdInput.value = generatedId;
                    elements.categoryIdInput.dataset.lastGeneratedName = name;
                }
            }
        });
    }
    
    // Validar formato del ID en tiempo real
    if (elements.categoryIdInput) {
        elements.categoryIdInput.addEventListener('input', () => {
            const idValue = elements.categoryIdInput.value;
            if (idValue && !validarIdFormato(idValue)) {
                elements.categoryIdInput.style.borderBottomColor = 'var(--outlet-danger)';
                mostrarToast('El ID solo puede contener letras minúsculas, números, guiones bajos (_) y guiones (-)', 'error');
            } else {
                elements.categoryIdInput.style.borderBottomColor = '';
            }
        });
    }
}

// ========================================
// Renderizar lista de categorías
// ========================================
function renderCategories() {
    if (!elements.categoriesList) return;
    
    // Filtrar por búsqueda
    let filteredCategories = categories;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredCategories = categories.filter(cat => 
            cat.name.toLowerCase().includes(term) ||
            (cat.description && cat.description.toLowerCase().includes(term)) ||
            (cat.id && cat.id.toLowerCase().includes(term))
        );
    }
    
    if (filteredCategories.length === 0) {
        elements.categoriesList.innerHTML = `
            <div class="outlet-empty-message">
                ${searchTerm ? 'No se encontraron categorías con ese término' : 'No hay categorías creadas aún'}
            </div>
        `;
        return;
    }
    
    elements.categoriesList.innerHTML = filteredCategories.map(cat => `
        <div class="outlet-category-item ${currentCategory?.id === cat.id ? 'selected' : ''}" data-id="${cat.id}">
            <div class="outlet-category-info">
                <div class="outlet-category-name">
                    ${cat.icon ? `<span class="material-symbols-outlined" style="font-size: 18px;">${cat.icon}</span>` : ''}
                    ${escapeHtml(cat.name)}
                    <span class="outlet-category-badge ${cat.status === 'inactive' ? 'inactive' : ''}">
                        ${cat.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <div class="outlet-category-desc">ID: ${escapeHtml(cat.id)}</div>
                ${cat.description ? `<div class="outlet-category-desc">${escapeHtml(cat.description)}</div>` : ''}
                <div class="outlet-category-desc">Orden: ${cat.order} | Slug: ${cat.slug}</div>
            </div>
            <div class="outlet-category-actions">
                <button class="edit-category" data-id="${cat.id}" title="Editar">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="delete-category" data-id="${cat.id}" data-name="${escapeHtml(cat.name)}" title="Eliminar">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `).join('');
    
    // Event listeners para los items de la lista
    document.querySelectorAll('.outlet-category-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Evitar que el click en botones seleccione la categoría
            if (e.target.closest('.edit-category') || e.target.closest('.delete-category')) return;
            const id = item.dataset.id;
            selectCategory(id);
        });
    });
    
    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            editCategory(id);
        });
    });
    
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            showDeleteModal('category', id, name);
        });
    });
}

// ========================================
// Renderizar subcategorías
// ========================================
function renderSubcategories() {
    if (!elements.subcategoriesList || !currentCategory) return;
    
    const subcategories = currentCategory.subcategories || [];
    
    if (subcategories.length === 0) {
        elements.subcategoriesList.innerHTML = `
            <div class="outlet-empty-message">
                No hay subcategorías para esta categoría
            </div>
        `;
        return;
    }
    
    elements.subcategoriesList.innerHTML = subcategories.map((sub, index) => `
        <div class="outlet-subcategory-item">
            <span class="outlet-subcategory-name">${escapeHtml(sub.name)}</span>
            <div class="outlet-subcategory-actions">
                <button class="edit-subcategory" data-id="${sub.id}" title="Editar">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="delete-subcategory" data-id="${sub.id}" data-name="${escapeHtml(sub.name)}" title="Eliminar">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `).join('');
    
    // Event listeners para subcategorías
    document.querySelectorAll('.edit-subcategory').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            editSubcategory(id);
        });
    });
    
    document.querySelectorAll('.delete-subcategory').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            showDeleteModal('subcategory', id, name);
        });
    });
}

// Función de escape para prevenir XSS
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
// CRUD de Categorías
// ========================================
async function loadCategories() {
    try {
        // Usar CategoryService para obtener las categorías
        categories = await CategoryService.getAll({}, false);
        renderCategories();
        
        // Si hay categorías y ninguna seleccionada, seleccionar la primera
        if (categories.length > 0 && !currentCategory) {
            selectCategory(categories[0].id);
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarToast('Error al cargar las categorías', 'error');
        categories = [];
        renderCategories();
    }
}

function selectCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        currentCategory = category;
        renderCategories();
        
        // Mostrar sección de subcategorías
        if (elements.subcategoriesSection) {
            elements.subcategoriesSection.style.display = 'block';
        }
        
        renderSubcategories();
        
        // Limpiar formulario de subcategoría
        if (elements.subcategoryName) {
            elements.subcategoryName.value = '';
        }
    }
}

function resetForm() {
    isEditing = false;
    elements.categoryIdInput.value = '';
    elements.categoryIdHidden.value = '';
    elements.categoryName.value = '';
    elements.categorySlug.value = '';
    elements.categoryDescription.value = '';
    elements.categoryOrder.value = '0';
    elements.categoryStatus.value = 'active';
    elements.categoryIcon.value = '';
    
    // Habilitar campo ID para nueva creación
    elements.categoryIdInput.disabled = false;
    elements.categoryIdInput.style.backgroundColor = '';
    
    elements.formTitle.textContent = 'Crear Nueva Categoría';
    if (elements.formIcon) {
        elements.formIcon.textContent = 'add_circle';
    }
    
    if (elements.cancelBtn) {
        elements.cancelBtn.style.display = 'none';
    }
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    isEditing = true;
    elements.categoryIdInput.value = category.id;
    elements.categoryIdHidden.value = category.id;
    elements.categoryName.value = category.name;
    elements.categorySlug.value = category.slug;
    elements.categoryDescription.value = category.description || '';
    elements.categoryOrder.value = category.order || 0;
    elements.categoryStatus.value = category.status || 'active';
    elements.categoryIcon.value = category.icon || '';
    
    // Deshabilitar campo ID en modo edición
    elements.categoryIdInput.disabled = true;
    elements.categoryIdInput.style.backgroundColor = 'var(--outlet-bg-disabled, #f5f5f5)';
    
    elements.formTitle.textContent = 'Editar Categoría';
    if (elements.formIcon) {
        elements.formIcon.textContent = 'edit';
    }
    
    if (elements.cancelBtn) {
        elements.cancelBtn.style.display = 'inline-flex';
    }
    
    // Scroll al formulario
    elements.formTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function saveCategory() {
    if (isLoading) return;
    
    const name = elements.categoryName.value.trim();
    if (!name) {
        mostrarToast('El nombre de la categoría es obligatorio', 'error');
        elements.categoryName.focus();
        return;
    }
    
    let categoryId = elements.categoryIdInput.value.trim();
    
    if (!isEditing) {
        // Para nueva categoría, el ID es obligatorio
        if (!categoryId) {
            mostrarToast('El ID de la categoría es obligatorio', 'error');
            elements.categoryIdInput.focus();
            return;
        }
        
        // Validar formato del ID
        if (!validarIdFormato(categoryId)) {
            mostrarToast('El ID solo puede contener letras minúsculas, números, guiones bajos (_) y guiones (-)', 'error');
            elements.categoryIdInput.focus();
            return;
        }
        
        // Verificar que el ID no exista ya
        const existingCategory = categories.find(c => c.id === categoryId);
        if (existingCategory) {
            mostrarToast(`Ya existe una categoría con el ID "${categoryId}"`, 'error');
            elements.categoryIdInput.focus();
            return;
        }
    } else {
        categoryId = elements.categoryIdHidden.value;
    }
    
    const categoryData = {
        id: categoryId,
        name: name,
        slug: elements.categorySlug.value.trim() || generarSlug(name),
        description: elements.categoryDescription.value.trim(),
        order: parseInt(elements.categoryOrder.value) || 0,
        status: elements.categoryStatus.value,
        icon: elements.categoryIcon.value.trim()
    };
    
    isLoading = true;
    const btn = elements.saveBtn;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Guardando...';
    btn.disabled = true;
    
    try {
        let savedCategory;
        
        if (isEditing) {
            const id = elements.categoryIdHidden.value;
            savedCategory = await CategoryService.update(id, categoryData);
            mostrarToast(`Categoría "${savedCategory.name}" actualizada`, 'success');
        } else {
            savedCategory = await CategoryService.create(categoryData);
            mostrarToast(`Categoría "${savedCategory.name}" creada con ID: ${savedCategory.id}`, 'success');
        }
        
        // Recargar categorías
        await loadCategories();
        
        // Seleccionar la categoría guardada/actualizada
        selectCategory(savedCategory.id);
        
        // Resetear formulario
        resetForm();
        
    } catch (error) {
        console.error('Error al guardar categoría:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    } finally {
        isLoading = false;
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

async function deleteCategory(id) {
    try {
        await CategoryService.delete(id, false); // Soft delete
        mostrarToast('Categoría eliminada correctamente', 'success');
        
        // Limpiar selección si era la categoría eliminada
        if (currentCategory && currentCategory.id === id) {
            currentCategory = null;
            if (elements.subcategoriesSection) {
                elements.subcategoriesSection.style.display = 'none';
            }
            resetForm();
        }
        
        await loadCategories();
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

// ========================================
// CRUD de Subcategorías
// ========================================
async function addSubcategory() {
    const subcategoryName = elements.subcategoryName.value.trim();
    if (!subcategoryName) {
        mostrarToast('Ingrese un nombre para la subcategoría', 'error');
        elements.subcategoryName.focus();
        return;
    }
    
    if (!currentCategory) {
        mostrarToast('Seleccione una categoría primero', 'error');
        return;
    }
    
    try {
        const updatedCategory = await CategoryService.addSubcategory(currentCategory.id, subcategoryName);
        
        // Actualizar la categoría actual
        currentCategory = updatedCategory;
        
        // Actualizar en el array principal
        const index = categories.findIndex(c => c.id === currentCategory.id);
        if (index !== -1) {
            categories[index] = currentCategory;
        }
        
        renderSubcategories();
        elements.subcategoryName.value = '';
        mostrarToast(`Subcategoría "${subcategoryName}" añadida`, 'success');
        
    } catch (error) {
        console.error('Error al añadir subcategoría:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

function editSubcategory(subcategoryId) {
    if (!currentCategory || !currentCategory.subcategories) return;
    
    const subcategory = currentCategory.subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) return;
    
    const newName = prompt('Editar subcategoría:', subcategory.name);
    
    if (newName && newName.trim() && newName.trim() !== subcategory.name) {
        updateSubcategory(subcategoryId, newName.trim());
    }
}

async function updateSubcategory(subcategoryId, newName) {
    if (!currentCategory) return;
    
    try {
        const updatedCategory = await CategoryService.updateSubcategory(
            currentCategory.id, 
            subcategoryId, 
            newName
        );
        
        currentCategory = updatedCategory;
        const catIndex = categories.findIndex(c => c.id === currentCategory.id);
        if (catIndex !== -1) {
            categories[catIndex] = currentCategory;
        }
        
        renderSubcategories();
        mostrarToast('Subcategoría actualizada', 'success');
        
    } catch (error) {
        console.error('Error al actualizar subcategoría:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

async function deleteSubcategory(subcategoryId) {
    if (!currentCategory) return;
    
    const subcategory = currentCategory.subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) return;
    
    const subName = subcategory.name;
    
    try {
        const updatedCategory = await CategoryService.deleteSubcategory(currentCategory.id, subcategoryId);
        
        currentCategory = updatedCategory;
        const catIndex = categories.findIndex(c => c.id === currentCategory.id);
        if (catIndex !== -1) {
            categories[catIndex] = currentCategory;
        }
        
        renderSubcategories();
        mostrarToast(`Subcategoría "${subName}" eliminada`, 'success');
        
    } catch (error) {
        console.error('Error al eliminar subcategoría:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

// ========================================
// Modal de confirmación
// ========================================
function showDeleteModal(type, id, name) {
    deleteTarget = { type, id, name };
    elements.deleteItemName.textContent = name;
    elements.deleteModal.style.display = 'flex';
}

function hideDeleteModal() {
    elements.deleteModal.style.display = 'none';
    deleteTarget = null;
}

async function confirmDelete() {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'category') {
        await deleteCategory(deleteTarget.id);
    } else if (deleteTarget.type === 'subcategory') {
        await deleteSubcategory(deleteTarget.id);
    }
    
    hideDeleteModal();
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // Navegación
    elements.backBtn?.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin/productos');
        } else {
            window.history.back();
        }
    });
    
    // Búsqueda
    elements.searchInput?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderCategories();
    });
    
    // Formulario de categorías
    elements.saveBtn?.addEventListener('click', saveCategory);
    elements.cancelBtn?.addEventListener('click', resetForm);
    
    // Subcategorías
    elements.addSubcategoryBtn?.addEventListener('click', addSubcategory);
    elements.subcategoryName?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubcategory();
        }
    });
    
    // Modal
    elements.confirmDeleteBtn?.addEventListener('click', confirmDelete);
    elements.cancelDeleteBtn?.addEventListener('click', hideDeleteModal);
    elements.closeModalBtn?.addEventListener('click', hideDeleteModal);
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.deleteModal.style.display === 'flex') {
            hideDeleteModal();
        }
    });
    
    // Cerrar modal al hacer clic fuera
    elements.deleteModal?.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) {
            hideDeleteModal();
        }
    });
    
    // Auto-generar slug e ID
    setupSlugGeneration();
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
export async function categoriesCreateController() {
    console.log('📝 Categories Management Controller - Gestión de categorías');
    
    cacheElements();
    syncDarkMode();
    initEventListeners();
    
    // Cargar categorías desde el servicio
    await loadCategories();
    
    // Resetear formulario al inicio
    resetForm();
    
    console.log('✅ Categories Management page loaded');
}