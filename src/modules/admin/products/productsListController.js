/* ========================================
   PRODUCT LIST CONTROLLER - OUTLET (SPA)
   Controlador para listado y gestión de productos - VERSIÓN CARDS
   CON SWEETALERT2 INTEGRADO
   ======================================== */

// Storage key
var PRODUCTS_STORAGE_KEY = 'outlet_admin_products';

// Array de productos
var productListItems = [];

// Elemento de edición
var editingProductId = null;

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

// ========================================
// Cargar estilos CSS
// ========================================
function loadProductListStyles() {
    if (document.querySelector('link[href*="productList.css"]')) return;
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/productList.css';
    document.head.appendChild(link);
}

// ========================================
// Formatear dinero
// ========================================
function formatProductListMoney(amount) {
    return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(amount);
}

// ========================================
// Cargar productos desde localStorage
// ========================================
function loadProductListItems() {
    var saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (saved) {
        productListItems = JSON.parse(saved);
    } else {
        productListItems = [
            {
                id: 1,
                name: "Playera Oversize",
                price: 499,
                category: "Hombre",
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop"
            },
            {
                id: 2,
                name: "Tenis Urban",
                price: 1299,
                category: "Calzado",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop"
            },
            {
                id: 3,
                name: "Vestido de Seda",
                price: 1250,
                category: "Mujer",
                image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=200&fit=crop"
            },
            {
                id: 4,
                name: "Bolso de Mano",
                price: 890,
                category: "Accesorios",
                image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop"
            },
            {
                id: 5,
                name: "Gafas de Sol",
                price: 350,
                category: "Accesorios",
                image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop"
            },
            {
                id: 6,
                name: "Chaqueta de Cuero",
                price: 1599,
                category: "Hombre",
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop"
            }
        ];
        saveProductListItems();
    }
}

// ========================================
// Guardar productos en localStorage
// ========================================
function saveProductListItems() {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productListItems));
}

// ========================================
// Escapar HTML
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Renderizar tarjetas
// ========================================
function renderProductListCards() {
    var grid = document.getElementById('productlistCardsGrid');
    if (!grid) return;

    if (productListItems.length === 0) {
        grid.innerHTML = 
            '<div class="productlist-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--outlet-text-secondary, #6b6b6b);">' +
                '<i class="fa-regular fa-box-open" style="font-size: 48px; color: var(--outlet-gold, #ddab3b); opacity: 0.4; margin-bottom: 16px; display: block;"></i>' +
                '<p>No hay productos registrados</p>' +
            '</div>';
        return;
    }

    var html = '';
    productListItems.forEach(function(product) {
        html += 
            '<div class="productlist-card" data-id="' + product.id + '">' +
                '<div class="productlist-card-image">' +
                    '<img src="' + product.image + '" alt="' + escapeHtml(product.name) + '" onerror="this.src=\'https://placehold.co/200x200?text=Error\'">' +
                    '<span class="productlist-card-badge">' + escapeHtml(product.category) + '</span>' +
                '</div>' +
                '<div class="productlist-card-body">' +
                    '<h4 class="productlist-card-name">' + escapeHtml(product.name) + '</h4>' +
                    '<p class="productlist-card-category">' + escapeHtml(product.category) + '</p>' +
                    '<p class="productlist-card-price">' + formatProductListMoney(product.price) + '</p>' +
                    '<div class="productlist-card-actions">' +
                        '<button class="productlist-btn-edit" data-id="' + product.id + '">' +
                            '<i class="fa-solid fa-pencil"></i><span>Editar</span>' +
                        '</button>' +
                        '<button class="productlist-btn-delete" data-id="' + product.id + '">' +
                            '<i class="fa-solid fa-trash"></i><span>Eliminar</span>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    });
    
    grid.innerHTML = html;

    document.querySelectorAll('.productlist-card .productlist-btn-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(this.getAttribute('data-id'));
            openEditProductModal(id);
        });
    });

    document.querySelectorAll('.productlist-card .productlist-btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var id = parseInt(this.getAttribute('data-id'));
            if (id) {
                deleteProductItem(id);
            }
        });
    });
}

// ========================================
// Renderizar tabla
// ========================================
function renderProductListTable() {
    var tbody = document.getElementById('productlistTableBody');
    if (!tbody) return;

    if (productListItems.length === 0) {
        tbody.innerHTML = 
            '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--outlet-text-secondary, #6b6b6b);">' +
                '<i class="fa-regular fa-box-open" style="font-size: 28px; color: var(--outlet-gold, #ddab3b); opacity: 0.4; margin-bottom: 8px; display: block;"></i>' +
                'No hay productos registrados' +
            '</td></tr>';
        return;
    }

    var html = '';
    productListItems.forEach(function(product) {
        html += 
            '<tr data-id="' + product.id + '">' +
                '<td class="image-cell"><img src="' + product.image + '" class="productlist-product-img" alt="' + product.name + '" onerror="this.src=\'https://placehold.co/100?text=Error\'"></td>' +
                '<td class="name-cell">' + escapeHtml(product.name) + '</td>' +
                '<td class="price-cell">' + formatProductListMoney(product.price) + '</td>' +
                '<td>' + escapeHtml(product.category) + '</td>' +
                '<td class="actions-cell">' +
                    '<button class="productlist-btn-edit" data-id="' + product.id + '"><i class="fa-solid fa-pencil"></i>Editar</button>' +
                    '<button class="productlist-btn-delete" data-id="' + product.id + '"><i class="fa-solid fa-trash"></i>Eliminar</button>' +
                '</td>' +
            '</tr>';
    });
    
    tbody.innerHTML = html;

    document.querySelectorAll('.productlist-table .productlist-btn-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(this.getAttribute('data-id'));
            openEditProductModal(id);
        });
    });

    document.querySelectorAll('.productlist-table .productlist-btn-delete').forEach(function(btn) {
        addDeleteFunction(btn);
    });
}

function addDeleteFunction(button) {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        var row = this.closest('tr');
        var id = parseInt(row.getAttribute('data-id'));
        if (id) {
            deleteProductItem(id);
        } else {
            row.remove();
            mostrarToast('🗑️ Producto eliminado', 'info');
        }
    });
}

// ========================================
// Renderizar ambos
// ========================================
function renderProductList() {
    renderProductListCards();
    renderProductListTable();
}

// ========================================
// Abrir modal para agregar producto
// ========================================
function openAddProductModal() {
    editingProductId = null;
    document.getElementById('productlistModalTitle').textContent = 'Agregar Producto';
    document.getElementById('productlistForm').reset();
    document.getElementById('productlistModal').style.display = 'flex';
}

// ========================================
// Abrir modal para editar producto
// ========================================
function openEditProductModal(id) {
    var product = productListItems.find(function(p) { return p.id === id; });
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('productlistModalTitle').textContent = 'Editar Producto';
    document.getElementById('productlistName').value = product.name;
    document.getElementById('productlistPrice').value = product.price;
    document.getElementById('productlistCategory').value = product.category;
    document.getElementById('productlistImage').value = product.image;
    document.getElementById('productlistModal').style.display = 'flex';
}

// ========================================
// Cerrar modal
// ========================================
function closeProductModal() {
    document.getElementById('productlistModal').style.display = 'none';
    editingProductId = null;
}

// ========================================
// Guardar producto CON SWEETALERT2
// ========================================
async function saveProductItem(e) {
    e.preventDefault();
    
    var name = document.getElementById('productlistName').value.trim();
    var price = parseFloat(document.getElementById('productlistPrice').value);
    var category = document.getElementById('productlistCategory').value.trim();
    var image = document.getElementById('productlistImage').value.trim();
    
    if (!name) {
        await mostrarError('Campo requerido', 'El nombre del producto es obligatorio.');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        await mostrarError('Precio inválido', 'Ingrese un precio válido mayor a 0.');
        return;
    }
    
    if (!category) {
        await mostrarError('Campo requerido', 'La categoría es obligatoria.');
        return;
    }
    
    if (!image) {
        await mostrarError('Campo requerido', 'Ingrese una URL de imagen.');
        return;
    }
    
    if (!image.startsWith('http')) {
        image = 'https://placehold.co/200x200?text=Producto';
    }
    
    var accion = editingProductId ? 'actualizar' : 'crear';
    var mensajeConfirmacion = editingProductId ? 
        '¿Actualizar el producto "' + name + '"?': 
        '¿Crear el nuevo producto "' + name + '"?';
    
    var confirmResult = await mostrarConfirmacion(
        (editingProductId ? 'Actualizar' : 'Crear') + ' producto',
        mensajeConfirmacion,
        'Sí, ' + accion
    );
    
    if (!confirmResult.isConfirmed) {
        mostrarToast('Operación cancelada', 'info');
        return;
    }
    
    if (editingProductId) {
        var index = productListItems.findIndex(function(p) { return p.id === editingProductId; });
        if (index !== -1) {
            productListItems[index] = {
                id: productListItems[index].id,
                name: name,
                price: price,
                category: category,
                image: image
            };
            await mostrarExito('¡Producto actualizado!', '✅ "' + name + '" actualizado correctamente.');
        }
    } else {
        var newId = productListItems.length > 0 ? Math.max.apply(null, productListItems.map(function(p) { return p.id; })) + 1 : 1;
        
        productListItems.push({
            id: newId,
            name: name,
            price: price,
            category: category,
            image: image
        });
        await mostrarExito('¡Producto agregado!', '✅ "' + name + '" agregado correctamente.');
    }
    
    saveProductListItems();
    renderProductList();
    closeProductModal();
    updateAdminStatsIfNeeded();
}

// ========================================
// Eliminar producto CON SWEETALERT2
// ========================================
async function deleteProductItem(id) {
    var product = productListItems.find(function(p) { return p.id === id; });
    if (!product) return;
    
    var result = await mostrarConfirmacion(
        '¿Eliminar producto?',
        '¿Estás seguro de que quieres eliminar "' + product.name + '" permanentemente? Esta acción no se puede deshacer.',
        'Sí, eliminar'
    );
    
    if (result.isConfirmed) {
        productListItems = productListItems.filter(function(p) { return p.id !== id; });
        saveProductListItems();
        renderProductList();
        await mostrarExito('¡Producto eliminado!', '🗑️ "' + product.name + '" eliminado correctamente.');
        updateAdminStatsIfNeeded();
    }
}

// ========================================
// Actualizar estadísticas del admin
// ========================================
function updateAdminStatsIfNeeded() {
    var productsCount = document.getElementById('productsCount');
    if (productsCount) {
        productsCount.textContent = productListItems.length;
    }
}

// ========================================
// Inicializar eventos del modal
// ========================================
function initModalEvents() {
    var modal = document.getElementById('productlistModal');
    var openBtn = document.getElementById('openProductModalBtn');
    var closeBtn = document.getElementById('closeProductModalBtn');
    
    if (openBtn) {
        openBtn.addEventListener('click', openAddProductModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
}

// ========================================
// Inicializar eventos del formulario
// ========================================
function initFormEvents() {
    var form = document.getElementById('productlistForm');
    if (form) {
        var newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.addEventListener('submit', saveProductItem);
    }
}

// ========================================
// Controlador principal
// ========================================
export async function productListController() {
    console.log('📋 Product List Controller - Gestión de productos (Versión Cards)');
    
    loadProductListStyles();
    loadProductListItems();
    renderProductList();
    initModalEvents();
    initFormEvents();
    
    console.log('✅ Product list loaded successfully');
}