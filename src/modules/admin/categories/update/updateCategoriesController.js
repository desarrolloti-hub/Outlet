/* ========================================
   UPDATE CATEGORY CONTROLLER - OUTLET ADMIN
   Controlador para editar categorías existentes
   Actualización completa de datos de categoría
   RESPONSIVE: Se adapta a cualquier tamaño
   ======================================== */

// ========================================
// Variables de estado
// ========================================
let categories = [];
let currentCategoryId = null;
let isSubmitting = false;

// ========================================
// DOM Elements
// ========================================
let elements = {};

function cacheElements() {
    elements = {
        // Header
        backBtn: document.getElementById('backBtn'),
        
        // Formulario
        categoryForm: document.getElementById('updateCategoryForm'),
        categorySelector: document.getElementById('categorySelector'),
        categoryId: document.getElementById('categoryId'),
        categoryName: document.getElementById('categoryName'),
        categorySlug: document.getElementById('categorySlug'),
        categoryDescription: document.getElementById('categoryDescription'),
        categoryIcon: document.getElementById('categoryIcon'),
        categoryOrder: document.getElementById('categoryOrder'),
        categoryStatus: document.getElementById('categoryStatus'),
        categoryCreatedAt: document.getElementById('categoryCreatedAt'),
        
        // Fieldset
        formFields: document.getElementById('formFields'),
        actionButtons: document.getElementById('actionButtons'),
        
        // Botones
        saveBtn: document.getElementById('saveBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        
        // Vista previa
        previewCard: document.getElementById('previewCard'),
        subcategoriesPreview: document.getElementById('subcategoriesPreview'),
        
        // Toast
        toast: document.getElementById('updateToast')
    };
}

// ========================================
// UI Helpers
// ========================================
function mostrarToast(mensaje, tipo = 'info') {
    const toast = elements.toast;
    toast.textContent = mensaje;
    toast.className = 'updatecategory-toast';
    
    if (tipo === 'success') {
        toast.style.borderLeftColor = '#22c55e';
    } else if (tipo === 'error') {
        toast.style.borderLeftColor = '#ef4444';
    } else {
        toast.style.borderLeftColor = 'var(--outlet-gold, #ddab3b)';
    }
    
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.animation = 'updatecategorySlideOut 0.3s ease-out forwards';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.animation = '';
        }, 300);
    }, 2800);
}

// Añadir animación de salida
const style = document.createElement('style');
style.textContent = `
    @keyframes updatecategorySlideOut {
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

function formatDate(dateString) {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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
        mostrarToast('Error al cargar las categorías', 'error');
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
    
    elements.categorySelector.innerHTML = `
        <option value="">-- Seleccione una categoría --</option>
        ${categories.map(cat => `
            <option value="${cat.id}">${escapeHtml(cat.name)} (ID: ${cat.id})</option>
        `).join('')}
    `;
}

// ========================================
// Cargar datos de la categoría seleccionada
// ========================================
function onCategorySelect() {
    const selectedId = parseInt(elements.categorySelector.value);
    
    if (!selectedId) {
        // Limpiar formulario y deshabilitar
        elements.formFields.disabled = true;
        elements.actionButtons.style.display = 'none';
        elements.previewCard.style.display = 'none';
        clearForm();
        return;
    }
    
    const category = categories.find(c => c.id === selectedId);
    if (!category) return;
    
    currentCategoryId = selectedId;
    
    // Cargar datos en el formulario
    elements.categoryId.value = category.id;
    elements.categoryName.value = category.name;
    elements.categorySlug.value = category.slug;
    elements.categoryDescription.value = category.description || '';
    elements.categoryIcon.value = category.icon || '';
    elements.categoryOrder.value = category.order || 0;
    elements.categoryStatus.value = category.status || 'active';
    elements.categoryCreatedAt.value = formatDate(category.createdAt);
    
    // Habilitar formulario y mostrar botones
    elements.formFields.disabled = false;
    elements.actionButtons.style.display = 'flex';
    
    // Mostrar preview de subcategorías
    renderSubcategoriesPreview(category.subcategories || []);
    elements.previewCard.style.display = 'block';
}

function clearForm() {
    elements.categoryId.value = '';
    elements.categoryName.value = '';
    elements.categorySlug.value = '';
    elements.categoryDescription.value = '';
    elements.categoryIcon.value = '';
    elements.categoryOrder.value = '0';
    elements.categoryStatus.value = 'active';
    elements.categoryCreatedAt.value = '';
}

function renderSubcategoriesPreview(subcategories) {
    if (!elements.subcategoriesPreview) return;
    
    if (!subcategories || subcategories.length === 0) {
        elements.subcategoriesPreview.innerHTML = '<p class="updatecategory-empty">Esta categoría no tiene subcategorías</p>';
        return;
    }
    
    elements.subcategoriesPreview.innerHTML = `
        <div style="margin-bottom: 12px;">
            <small style="color: #888;">Total: ${subcategories.length} subcategoría(s)</small>
        </div>
        <div>
            ${subcategories.map(sub => `
                <span class="updatecategory-subcategory-tag">
                    <i class="material-symbols-outlined" style="font-size: 14px;">subdirectory_arrow_right</i>
                    ${escapeHtml(sub.name)}
                </span>
            `).join('')}
        </div>
    `;
}

// ========================================
// Auto-generar slug desde el nombre
// ========================================
function setupSlugGeneration() {
    if (elements.categoryName) {
        elements.categoryName.addEventListener('input', () => {
            const name = elements.categoryName.value;
            if (name && elements.formFields && !elements.formFields.disabled) {
                elements.categorySlug.value = generarSlug(name);
            }
        });
    }
}

// ========================================
// Actualizar categoría
// ========================================
async function updateCategory(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    if (!currentCategoryId) {
        mostrarToast('Seleccione una categoría para actualizar', 'error');
        return;
    }
    
    const name = elements.categoryName.value.trim();
    if (!name) {
        mostrarToast('El nombre de la categoría es obligatorio', 'error');
        elements.categoryName.focus();
        return;
    }
    
    const slug = elements.categorySlug.value.trim();
    if (!slug) {
        mostrarToast('El slug es obligatorio', 'error');
        return;
    }
    
    const categoryData = {
        name: name,
        slug: slug,
        description: elements.categoryDescription.value.trim(),
        icon: elements.categoryIcon.value.trim(),
        order: parseInt(elements.categoryOrder.value) || 0,
        status: elements.categoryStatus.value
    };
    
    isSubmitting = true;
    const btn = elements.saveBtn;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="material-symbols-outlined">hourglass_empty</i> Actualizando...';
    btn.disabled = true;
    
    try {
        const updatedCategory = await CategoryService.update(currentCategoryId, categoryData);
        
        mostrarToast(`✅ Categoría "${updatedCategory.name}" actualizada exitosamente`, 'success');
        
        // Recargar categorías y actualizar selector
        await loadCategories();
        
        // Mantener seleccionada la categoría actualizada
        elements.categorySelector.value = updatedCategory.id;
        onCategorySelect();
        
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
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
    elements.categorySelector.value = '';
    elements.formFields.disabled = true;
    elements.actionButtons.style.display = 'none';
    elements.previewCard.style.display = 'none';
    clearForm();
    currentCategoryId = null;
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // Botón volver
    elements.backBtn?.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin/categories');
        } else {
            window.history.back();
        }
    });
    
    // Selector de categoría
    elements.categorySelector?.addEventListener('change', onCategorySelect);
    
    // Botón cancelar
    elements.cancelBtn?.addEventListener('click', resetForm);
    
    // Submit del formulario
    elements.categoryForm?.addEventListener('submit', updateCategory);
    
    // Auto-generar slug
    setupSlugGeneration();
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
export async function updateCategoryController() {
    console.log('✏️ Update Category Controller - Editar categorías');
    
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
    
    // Cargar categorías
    await loadCategories();
    
    console.log('✅ Update Category page loaded');
}