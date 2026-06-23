/* ========================================
   CREATE CATEGORIES CONTROLLER - OUTLET ADMIN
   Controlador para CREAR categorías con subcategorías
   ======================================== */

import { CategoryService } from '/services/categoryService.js';

// ========================================
// Variables de estado
// ========================================
let isSubmitting = false;
let subcategories = [];

// ========================================
// DOM Elements
// ========================================
let elements = {};

function cacheElements() {
    elements = {
        backBtn: document.getElementById('backBtn'),
        
        // Formulario de categoría
        categoryId: document.getElementById('categoryId'),
        categoryName: document.getElementById('categoryName'),
        categoryDescription: document.getElementById('categoryDescription'),
        saveBtn: document.getElementById('saveCategoryBtn'),
        resetBtn: document.getElementById('resetBtn'),
        
        // Subcategorías
        subcategoryName: document.getElementById('subcategoryName'),
        subcategoryDescription: document.getElementById('subcategoryDescription'),
        addSubBtn: document.getElementById('addSubcategoryBtn'),
        subcategoriesList: document.getElementById('subcategoriesList'),
        
        // Toast
        toast: document.getElementById('categoriesToast')
    };
}

// ========================================
// UI Helpers
// ========================================
function mostrarToast(mensaje, tipo = 'info') {
    const toast = elements.toast;
    if (!toast) return;
    
    toast.textContent = mensaje;
    toast.className = 'outlet-toast-notification';
    
    if (tipo === 'success') toast.style.borderLeftColor = '#22c55e';
    else if (tipo === 'error') toast.style.borderLeftColor = '#ef4444';
    else toast.style.borderLeftColor = 'var(--outlet-gold, #ddab3b)';
    
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.opacity = '1';
            toast.style.transform = '';
        }, 300);
    }, 2800);
}

function escapeHtml(str) {
    const safeStr = String(str || '');
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
    const regex = /^[a-z0-9_\-]+$/;
    return regex.test(id);
}

// ========================================
// Renderizar lista de subcategorías
// ========================================
function renderSubcategories() {
    if (!elements.subcategoriesList) return;
    
    if (subcategories.length === 0) {
        elements.subcategoriesList.innerHTML = `
            <div class="outlet-empty-message">
                No hay subcategorías agregadas
            </div>
        `;
        return;
    }
    
    elements.subcategoriesList.innerHTML = subcategories.map((sub, index) => `
        <div class="outlet-subcategory-item" data-index="${index}">
            <div class="outlet-subcategory-info">
                <div class="outlet-subcategory-name">
                    <span class="material-symbols-outlined">subdirectory_arrow_right</span>
                    ${escapeHtml(sub.name)}
                </div>
                ${sub.description ? `<div class="outlet-subcategory-desc">${escapeHtml(sub.description)}</div>` : ''}
            </div>
            <div class="outlet-subcategory-actions">
                <button class="outlet-subcategory-edit" data-index="${index}" title="Editar">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="outlet-subcategory-delete" data-index="${index}" title="Eliminar">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.outlet-subcategory-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            editSubcategory(index);
        });
    });
    
    document.querySelectorAll('.outlet-subcategory-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            deleteSubcategory(index);
        });
    });
}

// ========================================
// CRUD de Subcategorías (local)
// ========================================
function addSubcategory() {
    const name = elements.subcategoryName?.value?.trim() || '';
    const description = elements.subcategoryDescription?.value?.trim() || '';
    
    if (!name) {
        mostrarToast('El nombre de la subcategoría es obligatorio', 'error');
        if (elements.subcategoryName) elements.subcategoryName.focus();
        return;
    }
    
    const exists = subcategories.some(sub => sub.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        mostrarToast(`La subcategoría "${name}" ya existe`, 'error');
        return;
    }
    
    subcategories.push({ name, description });
    renderSubcategories();
    
    if (elements.subcategoryName) elements.subcategoryName.value = '';
    if (elements.subcategoryDescription) elements.subcategoryDescription.value = '';
    if (elements.subcategoryName) elements.subcategoryName.focus();
    
    mostrarToast(`Subcategoría "${name}" agregada`, 'success');
}

function editSubcategory(index) {
    const sub = subcategories[index];
    if (!sub) return;
    
    const newName = prompt('Editar nombre de la subcategoría:', sub.name);
    if (newName === null) return;
    
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    
    const newDescription = prompt('Editar descripción de la subcategoría:', sub.description || '');
    if (newDescription === null) return;
    
    const exists = subcategories.some((s, i) => 
        i !== index && s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
        mostrarToast(`La subcategoría "${trimmedName}" ya existe`, 'error');
        return;
    }
    
    subcategories[index] = {
        name: trimmedName,
        description: newDescription.trim() || ''
    };
    
    renderSubcategories();
    mostrarToast('Subcategoría actualizada', 'success');
}

function deleteSubcategory(index) {
    const sub = subcategories[index];
    if (!sub) return;
    
    if (!confirm(`¿Eliminar la subcategoría "${sub.name}"?`)) return;
    
    subcategories.splice(index, 1);
    renderSubcategories();
    mostrarToast(`Subcategoría "${sub.name}" eliminada`, 'success');
}

// ========================================
// Auto-generar ID
// ========================================
function setupAutoGeneration() {
    if (elements.categoryName) {
        elements.categoryName.addEventListener('input', () => {
            const name = elements.categoryName.value;
            if (name && elements.categoryId) {
                const generatedId = generarIdDesdeNombre(name);
                elements.categoryId.value = generatedId;
            }
        });
    }
}

// ========================================
// Guardar categoría
// ========================================
async function saveCategory() {
    if (isSubmitting) return;
    
    const name = elements.categoryName?.value?.trim() || '';
    if (!name) {
        mostrarToast('El nombre de la categoría es obligatorio', 'error');
        if (elements.categoryName) elements.categoryName.focus();
        return;
    }
    
    let categoryId = elements.categoryId?.value?.trim() || '';
    if (!categoryId) {
        mostrarToast('El ID de la categoría es obligatorio', 'error');
        if (elements.categoryId) elements.categoryId.focus();
        return;
    }
    
    if (!validarIdFormato(categoryId)) {
        mostrarToast('El ID solo puede contener letras minúsculas, números, guiones bajos (_) y guiones (-)', 'error');
        if (elements.categoryId) elements.categoryId.focus();
        return;
    }
    
    try {
        const existing = await CategoryService.getById(categoryId);
        if (existing) {
            mostrarToast(`Ya existe una categoría con el ID "${categoryId}"`, 'error');
            if (elements.categoryId) elements.categoryId.focus();
            return;
        }
    } catch (error) {
        console.warn('Error verificando ID:', error);
    }
    
    const categoryData = {
        id: categoryId,
        name: name,
        slug: generarSlug(name),
        description: elements.categoryDescription?.value?.trim() || '',
        subcategories: subcategories.map(sub => ({
            name: sub.name,
            description: sub.description || '',
            slug: generarSlug(sub.name),
            createdAt: new Date().toISOString()
        }))
    };
    
    isSubmitting = true;
    const btn = elements.saveBtn;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Creando...';
    }
    
    try {
        const savedCategory = await CategoryService.create(categoryData);
        mostrarToast(`✅ Categoría "${savedCategory.name}" creada con ${savedCategory.subcategories.length} subcategorías`, 'success');
        resetForm();
        
    } catch (error) {
        console.error('Error al crear categoría:', error);
        mostrarToast(`❌ Error: ${error.message}`, 'error');
    } finally {
        isSubmitting = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">save</span> Crear Categoría';
        }
    }
}

// ========================================
// Resetear formulario
// ========================================
function resetForm() {
    if (elements.categoryId) elements.categoryId.value = '';
    if (elements.categoryName) elements.categoryName.value = '';
    if (elements.categoryDescription) elements.categoryDescription.value = '';
    if (elements.subcategoryName) elements.subcategoryName.value = '';
    if (elements.subcategoryDescription) elements.subcategoryDescription.value = '';
    
    subcategories = [];
    renderSubcategories();
    
    if (elements.categoryName) elements.categoryName.focus();
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    elements.backBtn?.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/readCategories');
        } else {
            window.history.back();
        }
    });
    
    elements.saveBtn?.addEventListener('click', saveCategory);
    elements.resetBtn?.addEventListener('click', resetForm);
    
    elements.addSubBtn?.addEventListener('click', addSubcategory);
    elements.subcategoryName?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubcategory();
        }
    });
    elements.subcategoryDescription?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubcategory();
        }
    });
    
    setupAutoGeneration();
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
    console.log('📝 Create Categories Controller - Crear categorías con subcategorías');
    
    cacheElements();
    syncDarkMode();
    initEventListeners();
    resetForm();
    
    console.log('✅ Create Categories page loaded');
}