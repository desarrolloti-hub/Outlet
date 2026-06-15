/* ========================================
   READ CATEGORIES CONTROLLER - OUTLET ADMIN
   Controlador para listar y gestionar categorías
   CRUD completo con el mismo estilo que productos
   RESPONSIVE: Se adapta a cualquier tamaño
   ======================================== */

// ========================================
// Variables de estado
// ========================================
let categories = [];
let deleteTarget = { type: null, id: null, name: null };
let currentCategoryForSub = null;

// ========================================
// DOM Elements
// ========================================
let elements = {};

function cacheElements() {
    elements = {
        // Header
        addBtn: document.getElementById('addCategoryBtn'),
        
        // Tabla
        tableBody: document.getElementById('categoriesTableBody'),
        
        // Modal de categoría
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
        
        // Modal de subcategorías
        subcategoryModal: document.getElementById('subcategoryModal'),
        submodalTitle: document.getElementById('submodalTitle'),
        currentCategoryName: document.getElementById('currentCategoryName'),
        newSubcategoryName: document.getElementById('newSubcategoryName'),
        addSubcategoryBtn: document.getElementById('addSubcategoryBtn'),
        subcategoriesList: document.getElementById('subcategoriesList'),
        closeSubmodalBtn: document.getElementById('closeSubmodalBtn'),
        
        // Modal de eliminación
        deleteModal: document.getElementById('deleteModal'),
        deleteItemName: document.getElementById('deleteItemName'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
        closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
        
        // Toast
        toast: document.getElementById('categoriesToast')
    };
}

// ========================================
// UI Helpers
// ========================================
function mostrarToast(mensaje, tipo = 'info') {
    const toast = elements.toast;
    toast.textContent = mensaje;
    toast.className = 'categorieslist-toast';
    
    if (tipo === 'success') {
        toast.style.borderLeftColor = '#22c55e';
    } else if (tipo === 'error') {
        toast.style.borderLeftColor = '#ef4444';
    } else {
        toast.style.borderLeftColor = 'var(--outlet-gold, #ddab3b)';
    }
    
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.animation = 'categorieslistSlideOut 0.3s ease-out forwards';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.animation = '';
        }, 300);
    }, 2800);
}

// Añadir animación de salida al CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes categorieslistSlideOut {
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

function showModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// ========================================
// Renderizar tabla de categorías
// ========================================
function renderTable() {
    if (!elements.tableBody) return;
    
    if (categories.length === 0) {
        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="categorieslist-loading">
                    <div class="categorieslist-spinner"></div>
                    <span>Cargando categorías...</span>
                </td>
            </tr>
        `;
        return;
    }
    
    elements.tableBody.innerHTML = categories.map(cat => `
        <tr data-id="${cat.id}">
            <td>
                <div class="categorieslist-icon">
                    <i class="material-symbols-outlined">${cat.icon || 'category'}</i>
                </div>
            </td>
            <td><code style="font-size: 12px;">${escapeHtml(cat.id)}</code></td>
            <td><strong>${escapeHtml(cat.name)}</strong></td>
            <td><code style="font-size: 12px;">${cat.slug}</code></td>
            <td>
                <div class="categorieslist-subcategories">
                    ${renderSubcategoriesPreview(cat.subcategories, cat.id)}
                </div>
            </td>
            <td>${cat.order || 0}</td>
            <td>
                <span class="categorieslist-status-badge ${cat.status === 'active' ? 'categorieslist-status-active' : 'categorieslist-status-inactive'}">
                    ${cat.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="categorieslist-actions-cell">
                    <button class="categorieslist-btn-subcategories" data-id="${cat.id}" data-name="${escapeHtml(cat.name)}" title="Gestionar subcategorías">
                        <i class="material-symbols-outlined">subdirectory_arrow_right</i>
                        <span>Subcats</span>
                    </button>
                    <button class="categorieslist-btn-edit" data-id="${cat.id}" title="Editar">
                        <i class="material-symbols-outlined">edit</i>
                        <span>Editar</span>
                    </button>
                    <button class="categorieslist-btn-delete" data-id="${cat.id}" data-name="${escapeHtml(cat.name)}" title="Eliminar">
                        <i class="material-symbols-outlined">delete</i>
                        <span>Eliminar</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Event listeners para botones de la tabla
    document.querySelectorAll('.categorieslist-btn-subcategories').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            openSubcategoryModal(id, name);
        });
    });
    
    document.querySelectorAll('.categorieslist-btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            editCategory(id);
        });
    });
    
    document.querySelectorAll('.categorieslist-btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            showDeleteModal('category', id, name);
        });
    });
}

function renderSubcategoriesPreview(subcategories, categoryId) {
    if (!subcategories || subcategories.length === 0) {
        return '<span style="color: #888; font-size: 12px;">—</span>';
    }
    
    const maxShow = 3;
    const visible = subcategories.slice(0, maxShow);
    const remaining = subcategories.length - maxShow;
    
    const tags = visible.map(sub => `
        <span class="categorieslist-subcategory-tag" data-cat-id="${categoryId}" data-sub-name="${escapeHtml(sub.name)}">
            ${escapeHtml(sub.name)}
        </span>
    `).join('');
    
    const moreTag = remaining > 0 ? `
        <span class="categorieslist-subcategory-tag more" data-cat-id="${categoryId}">
            +${remaining}
        </span>
    ` : '';
    
    return tags + moreTag;
}

// Event delegation para clics en subcategorías
document.addEventListener('click', (e) => {
    const tag = e.target.closest('.categorieslist-subcategory-tag');
    if (tag && !tag.classList.contains('more')) {
        const catId = tag.dataset.catId;
        const subName = tag.dataset.subName;
        const category = categories.find(c => c.id === catId);
        if (category) {
            openSubcategoryModal(catId, category.name);
            // Pequeño delay para asegurar que el modal está abierto
            setTimeout(() => {
                const input = elements.newSubcategoryName;
                if (input) {
                    input.value = subName;
                    input.focus();
                    // Seleccionar el texto para editar fácilmente
                    input.select();
                }
            }, 200);
        }
    } else if (tag && tag.classList.contains('more')) {
        const catId = tag.dataset.catId;
        const category = categories.find(c => c.id === catId);
        if (category) {
            openSubcategoryModal(catId, category.name);
        }
    }
});

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
        categories = await CategoryService.getAll();
        renderTable();
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarToast('Error al cargar las categorías', 'error');
        categories = [];
        renderTable();
    }
}

function resetCategoryForm() {
    elements.categoryId.value = '';
    elements.categoryName.value = '';
    elements.categorySlug.value = '';
    elements.categoryDescription.value = '';
    elements.categoryIcon.value = '';
    elements.categoryOrder.value = '0';
    elements.categoryStatus.value = 'active';
    elements.modalTitle.textContent = 'Nueva Categoría';
}

function openCreateModal() {
    resetCategoryForm();
    showModal(elements.categoryModal);
}

async function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    elements.categoryId.value = category.id;
    elements.categoryName.value = category.name;
    elements.categorySlug.value = category.slug;
    elements.categoryDescription.value = category.description || '';
    elements.categoryIcon.value = category.icon || '';
    elements.categoryOrder.value = category.order || 0;
    elements.categoryStatus.value = category.status || 'active';
    elements.modalTitle.textContent = 'Editar Categoría';
    
    showModal(elements.categoryModal);
}

async function saveCategory(event) {
    event.preventDefault();
    
    const name = elements.categoryName.value.trim();
    if (!name) {
        mostrarToast('El nombre de la categoría es obligatorio', 'error');
        return;
    }
    
    const categoryId = elements.categoryId.value;
    const isEditing = !!categoryId;
    
    // Validar ID para nueva categoría
    if (!isEditing) {
        let generatedId = generarIdDesdeNombre(name);
        if (!generatedId) {
            mostrarToast('No se pudo generar un ID válido desde el nombre', 'error');
            return;
        }
        
        // Verificar si el ID ya existe
        const existingCategory = categories.find(c => c.id === generatedId);
        if (existingCategory) {
            mostrarToast(`Ya existe una categoría con el ID "${generatedId}". Por favor, usa un nombre diferente.`, 'error');
            return;
        }
        
        // Asignar el ID generado
        elements.categoryId.value = generatedId;
    }
    
    const categoryData = {
        name: name,
        slug: elements.categorySlug.value.trim() || generarSlug(name),
        description: elements.categoryDescription.value.trim(),
        icon: elements.categoryIcon.value.trim(),
        order: parseInt(elements.categoryOrder.value) || 0,
        status: elements.categoryStatus.value
    };
    
    // Para nueva categoría, incluir el ID
    if (!isEditing) {
        categoryData.id = elements.categoryId.value;
    }
    
    try {
        let savedCategory;
        if (isEditing) {
            savedCategory = await CategoryService.update(categoryId, categoryData);
            mostrarToast(`Categoría "${savedCategory.name}" actualizada`, 'success');
        } else {
            savedCategory = await CategoryService.create(categoryData);
            mostrarToast(`Categoría "${savedCategory.name}" creada con ID: ${savedCategory.id}`, 'success');
        }
        
        await loadCategories();
        hideModal(elements.categoryModal);
        resetCategoryForm();
        
    } catch (error) {
        console.error('Error al guardar categoría:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

async function deleteCategory(id) {
    try {
        await CategoryService.delete(id);
        mostrarToast('Categoría eliminada correctamente', 'success');
        await loadCategories();
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

// ========================================
// Gestión de Subcategorías
// ========================================
async function openSubcategoryModal(categoryId, categoryName) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    currentCategoryForSub = category;
    elements.currentCategoryName.textContent = category.name;
    elements.submodalTitle.textContent = `Subcategorías de ${category.name}`;
    
    renderSubcategoriesList(category.subcategories || []);
    showModal(elements.subcategoryModal);
}

function renderSubcategoriesList(subcategories) {
    if (!elements.subcategoriesList) return;
    
    if (!subcategories || subcategories.length === 0) {
        elements.subcategoriesList.innerHTML = '<div class="categorieslist-empty">No hay subcategorías</div>';
        return;
    }
    
    elements.subcategoriesList.innerHTML = subcategories.map((sub, index) => `
        <div class="categorieslist-subcategory-item" data-index="${index}">
            <span class="categorieslist-subcategory-name">${escapeHtml(sub.name)}</span>
            <div class="categorieslist-subcategory-actions">
                <button class="categorieslist-subcategory-edit" data-index="${index}" data-name="${escapeHtml(sub.name)}" title="Editar">
                    <i class="material-symbols-outlined">edit</i>
                </button>
                <button class="categorieslist-subcategory-delete" data-index="${index}" data-name="${escapeHtml(sub.name)}" title="Eliminar">
                    <i class="material-symbols-outlined">delete</i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Event listeners para editar/eliminar subcategorías
    document.querySelectorAll('.categorieslist-subcategory-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            const oldName = btn.dataset.name;
            editSubcategory(index, oldName);
        });
    });
    
    document.querySelectorAll('.categorieslist-subcategory-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            const name = btn.dataset.name;
            showDeleteModal('subcategory', index, name);
        });
    });
}

async function addSubcategory() {
    const subcategoryName = elements.newSubcategoryName.value.trim();
    if (!subcategoryName) {
        mostrarToast('Ingrese un nombre para la subcategoría', 'error');
        return;
    }
    
    if (!currentCategoryForSub) {
        mostrarToast('Error: No hay categoría seleccionada', 'error');
        return;
    }
    
    try {
        const updatedCategory = await CategoryService.addSubcategory(currentCategoryForSub.id, subcategoryName);
        
        // Actualizar en el array principal
        const index = categories.findIndex(c => c.id === updatedCategory.id);
        if (index !== -1) {
            categories[index] = updatedCategory;
        }
        currentCategoryForSub = updatedCategory;
        
        renderSubcategoriesList(updatedCategory.subcategories || []);
        renderTable(); // Actualizar la tabla principal también
        elements.newSubcategoryName.value = '';
        mostrarToast(`Subcategoría "${subcategoryName}" añadida`, 'success');
        
    } catch (error) {
        console.error('Error al añadir subcategoría:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

async function editSubcategory(index, oldName) {
    const newName = prompt('Editar subcategoría:', oldName);
    if (!newName || newName.trim() === oldName) return;
    
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    
    // Obtener el ID de la subcategoría
    const subcategoryId = currentCategoryForSub.subcategories[index]?.id;
    if (!subcategoryId) return;
    
    try {
        const updatedCategory = await CategoryService.updateSubcategory(
            currentCategoryForSub.id,
            subcategoryId,
            trimmedName
        );
        
        const catIndex = categories.findIndex(c => c.id === updatedCategory.id);
        if (catIndex !== -1) {
            categories[catIndex] = updatedCategory;
        }
        currentCategoryForSub = updatedCategory;
        
        renderSubcategoriesList(updatedCategory.subcategories || []);
        renderTable();
        mostrarToast('Subcategoría actualizada', 'success');
        
    } catch (error) {
        console.error('Error al actualizar subcategoría:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

async function deleteSubcategory(subcategoryId) {
    if (!currentCategoryForSub) return;
    
    const subName = currentCategoryForSub.subcategories.find(sub => sub.id === subcategoryId)?.name;
    
    try {
        const updatedCategory = await CategoryService.deleteSubcategory(currentCategoryForSub.id, subcategoryId);
        
        const catIndex = categories.findIndex(c => c.id === updatedCategory.id);
        if (catIndex !== -1) {
            categories[catIndex] = updatedCategory;
        }
        currentCategoryForSub = updatedCategory;
        
        renderSubcategoriesList(updatedCategory.subcategories || []);
        renderTable();
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
    showModal(elements.deleteModal);
}

function hideDeleteModal() {
    hideModal(elements.deleteModal);
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
// Auto-generar slug
// ========================================
function setupSlugGeneration() {
    if (elements.categoryName) {
        elements.categoryName.addEventListener('input', () => {
            const name = elements.categoryName.value;
            if (name && !elements.categoryId.value) {
                // Solo auto-generar en creación, no en edición
                elements.categorySlug.value = generarSlug(name);
            }
        });
    }
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // Botón agregar
    elements.addBtn?.addEventListener('click', openCreateModal);
    
    // Modal de categoría
    elements.categoryForm?.addEventListener('submit', saveCategory);
    elements.closeModalBtn?.addEventListener('click', () => hideModal(elements.categoryModal));
    
    // Modal de subcategorías
    elements.addSubcategoryBtn?.addEventListener('click', addSubcategory);
    elements.closeSubmodalBtn?.addEventListener('click', () => hideModal(elements.subcategoryModal));
    elements.newSubcategoryName?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubcategory();
        }
    });
    
    // Modal de eliminación
    elements.confirmDeleteBtn?.addEventListener('click', confirmDelete);
    elements.cancelDeleteBtn?.addEventListener('click', hideDeleteModal);
    elements.closeDeleteModalBtn?.addEventListener('click', hideDeleteModal);
    
    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.deleteModal?.style.display === 'flex') hideDeleteModal();
            if (elements.categoryModal?.style.display === 'flex') hideModal(elements.categoryModal);
            if (elements.subcategoryModal?.style.display === 'flex') hideModal(elements.subcategoryModal);
        }
    });
    
    // Cerrar modales al hacer clic fuera
    elements.categoryModal?.addEventListener('click', (e) => {
        if (e.target === elements.categoryModal) hideModal(elements.categoryModal);
    });
    elements.subcategoryModal?.addEventListener('click', (e) => {
        if (e.target === elements.subcategoryModal) hideModal(elements.subcategoryModal);
    });
    elements.deleteModal?.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) hideDeleteModal();
    });
    
    // Auto-generar slug
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
export async function readCategoriesController() {
    console.log('📋 Read Categories Controller - Listado de categorías');
    
    cacheElements();
    syncDarkMode();
    initEventListeners();
    
    await loadCategories();
    
    console.log('✅ Read Categories page loaded');
}