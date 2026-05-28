/* ========================================
   PRODUCT LIST CONTROLLER - OUTLET (SPA)
   Controlador para listado y gestión de productos
   ======================================== */

// Storage key (mismo que homeAdmin para consistencia)
const PRODUCTS_STORAGE_KEY = 'outlet_admin_products';

// Array de productos
let productListItems = [];

// Elemento de edición
let editingProductId = null;

/**
 * Cargar estilos CSS
 */
function loadProductListStyles() {
    if (document.querySelector('link[href*="productList.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/productList.css';
    document.head.appendChild(link);
}

/**
 * Mostrar notificación
 */
function showProductListNotification(message, isError = false) {
    const toast = document.getElementById('productlistToast');
    const messageSpan = document.getElementById('productlistToastMessage');
    
    if (!toast || !messageSpan) return;
    
    messageSpan.textContent = message;
    toast.style.display = 'block';
    
    if (isError) {
        toast.style.borderLeftColor = '#ef4444';
    } else {
        toast.style.borderLeftColor = 'var(--outlet-gold, #ddab3b)';
    }
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.opacity = '1';
        }, 300);
    }, 3000);
}

/**
 * Formatear dinero
 */
function formatProductListMoney(amount) {
    return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Cargar productos desde localStorage
 */
function loadProductListItems() {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (saved) {
        productListItems = JSON.parse(saved);
    } else {
        // Datos iniciales por defecto
        productListItems = [
            {
                id: 1,
                name: "Playera Oversize",
                price: 499,
                category: "Hombre",
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100"
            },
            {
                id: 2,
                name: "Tenis Urban",
                price: 1299,
                category: "Calzado",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100"
            },
            {
                id: 3,
                name: "Vestido de Seda",
                price: 1250,
                category: "Mujer",
                image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=100"
            },
            {
                id: 4,
                name: "Bolso de Mano",
                price: 890,
                category: "Accesorios",
                image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100"
            }
        ];
        saveProductListItems();
    }
}

/**
 * Guardar productos en localStorage
 */
function saveProductListItems() {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productListItems));
}

/**
 * Agregar función de eliminar a un botón
 */
function addDeleteFunction(button) {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = button.closest('tr');
        const id = parseInt(row.getAttribute('data-id'));
        if (id) {
            deleteProductItem(id);
        } else {
            row.remove();
            showProductListNotification('🗑️ Producto eliminado');
        }
    });
}

/**
 * Renderizar tabla de productos
 */
function renderProductListTable() {
    const tbody = document.getElementById('productlistTableBody');
    if (!tbody) return;

    if (productListItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    No hay productos registrados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = productListItems.map(product => `
        <tr data-id="${product.id}">
            <td class="image-cell">
                <img src="${product.image}" class="productlist-product-img" alt="${product.name}" onerror="this.src='https://placehold.co/100?text=Error'">
            </td>
            <td class="name-cell">${escapeHtml(product.name)}</td>
            <td class="price-cell">${formatProductListMoney(product.price)}</td>
            <td>${escapeHtml(product.category)}</td>
            <td class="actions-cell">
                <button class="productlist-btn-edit" data-id="${product.id}">
                    <i class="fa-solid fa-pencil"></i>
                    Editar
                </button>
                <button class="productlist-btn-delete" data-id="${product.id}">
                    <i class="fa-solid fa-trash"></i>
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');

    // Eventos de edición
    document.querySelectorAll('.productlist-btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            openEditProductModal(id);
        });
    });

    // Eventos de eliminación con la función addDeleteFunction
    document.querySelectorAll('.productlist-btn-delete').forEach(btn => {
        addDeleteFunction(btn);
    });
}

/**
 * Escapar HTML para evitar XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Abrir modal para agregar producto
 */
function openAddProductModal() {
    editingProductId = null;
    document.getElementById('productlistModalTitle').textContent = 'Agregar Producto';
    document.getElementById('productlistForm').reset();
    document.getElementById('productlistModal').style.display = 'flex';
}

/**
 * Abrir modal para editar producto
 */
function openEditProductModal(id) {
    const product = productListItems.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('productlistModalTitle').textContent = 'Editar Producto';
    document.getElementById('productlistName').value = product.name;
    document.getElementById('productlistPrice').value = product.price;
    document.getElementById('productlistCategory').value = product.category;
    document.getElementById('productlistImage').value = product.image;
    document.getElementById('productlistModal').style.display = 'flex';
}

/**
 * Cerrar modal
 */
function closeProductModal() {
    document.getElementById('productlistModal').style.display = 'none';
    editingProductId = null;
}

/**
 * Guardar producto (crear o editar)
 */
function saveProductItem(e) {
    e.preventDefault();
    
    const name = document.getElementById('productlistName').value.trim();
    const price = parseFloat(document.getElementById('productlistPrice').value);
    const category = document.getElementById('productlistCategory').value.trim();
    const image = document.getElementById('productlistImage').value.trim();
    
    // Validaciones
    if (!name) {
        showProductListNotification('⚠️ El nombre del producto es obligatorio', true);
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        showProductListNotification('⚠️ Ingrese un precio válido', true);
        return;
    }
    
    if (!category) {
        showProductListNotification('⚠️ La categoría es obligatoria', true);
        return;
    }
    
    if (!image) {
        showProductListNotification('⚠️ Ingrese una URL de imagen', true);
        return;
    }
    
    if (editingProductId) {
        // Editar producto existente
        const index = productListItems.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            productListItems[index] = {
                ...productListItems[index],
                name,
                price,
                category,
                image
            };
            showProductListNotification(`✏️ Producto "${name}" actualizado`);
        }
    } else {
        // Crear nuevo producto
        const newId = productListItems.length > 0 
            ? Math.max(...productListItems.map(p => p.id)) + 1 
            : 1;
        
        productListItems.push({
            id: newId,
            name,
            price,
            category,
            image
        });
        showProductListNotification(`✅ Producto "${name}" agregado`);
    }
    
    saveProductListItems();
    renderProductListTable();
    closeProductModal();
    
    // Actualizar contador si existe en homeAdmin
    updateAdminStatsIfNeeded();
}

/**
 * Eliminar producto
 */
function deleteProductItem(id) {
    const product = productListItems.find(p => p.id === id);
    if (!product) return;
    
    if (confirm(`¿Eliminar "${product.name}" permanentemente?`)) {
        productListItems = productListItems.filter(p => p.id !== id);
        saveProductListItems();
        renderProductListTable();
        showProductListNotification(`🗑️ "${product.name}" eliminado`);
        
        // Actualizar contador si existe en homeAdmin
        updateAdminStatsIfNeeded();
    }
}

/**
 * Actualizar estadísticas del admin si existe el elemento
 */
function updateAdminStatsIfNeeded() {
    const productsCount = document.getElementById('productsCount');
    if (productsCount) {
        productsCount.textContent = productListItems.length;
    }
}

/**
 * Inicializar eventos del modal
 */
function initModalEvents() {
    const modal = document.getElementById('productlistModal');
    const openBtn = document.getElementById('openProductModalBtn');
    const closeBtn = document.getElementById('closeProductModalBtn');
    
    // Abrir modal
    if (openBtn) {
        openBtn.addEventListener('click', openAddProductModal);
    }
    
    // Cerrar modal con botón
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    // Cerrar modal si dan click afuera
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
}

/**
 * Inicializar eventos del formulario
 */
function initFormEvents() {
    const form = document.getElementById('productlistForm');
    if (form) {
        // Eliminar event listener anterior si existe
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', saveProductItem);
    }
}

/**
 * Controlador principal
 */
export async function productListController() {
    console.log('📋 Product List Controller - Gestión de productos');
    
    // Cargar estilos
    loadProductListStyles();
    
    // Cargar datos
    loadProductListItems();
    
    // Renderizar tabla
    renderProductListTable();
    
    // Inicializar eventos
    initModalEvents();
    initFormEvents();
    
    console.log('✅ Product list loaded successfully');
}