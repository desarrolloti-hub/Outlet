/* ========================================
   WISHLIST CONTROLLER - CUSTOMER
   Controlador para página de productos favoritos
   CON DATOS DESDE FIREBASE - ENRIQUECIDO
   🔥 UNIFICADO con outlet_wishlist
   🔥 PERMITE PRODUCTOS AGREGADOS DESDE HOME
   ======================================== */

import { ProductService } from '../../../services/productService.js';

// 🔥 STORAGE KEY UNIFICADA
const STORAGE_KEY = 'outlet_wishlist';

// State
let wishlistItems = [];
let currentSort = 'newest';
let allProducts = [];
let productsMap = {};

// ========================================
// UI Helpers - CON SWEETALERT2
// ========================================

function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    var toastExistente = document.querySelector('.outlet-toast');
    if (toastExistente) toastExistente.remove();

    var toast = document.createElement('div');
    toast.className = 'outlet-toast ' + tipo;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
        toast.classList.add('show');
    });

    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 300);
    }, 3200);
}

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

function mostrarExito(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'success',
        title: titulo || '¡Perfecto!',
        text: mensaje || 'La acción se completó con éxito.',
        confirmButtonText: 'Aceptar'
    });
}

function mostrarError(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'error',
        title: titulo || '¡Oops!',
        text: mensaje || 'Ocurrió un error inesperado.',
        confirmButtonText: 'Entendido'
    });
}

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

function mostrarLoading(mensaje) {
    mensaje = mensaje || 'Procesando...';
    return mostrarSweetAlert({
        title: mensaje,
        allowOutsideClick: false,
        didOpen: function () {
            Swal.showLoading();
        }
    });
}

function cerrarLoading() {
    Swal.close();
}

// ========================================
// Carga de estilos CSS
// ========================================
function loadStyles() {
    if (document.querySelector('link[href*="wishlist.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/wishlist.css';
    document.head.appendChild(link);
}

// ========================================
// Formateo de moneda
// ========================================
function formatMoney(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// ========================================
// CARGAR TODOS LOS PRODUCTOS DESDE FIREBASE
// ========================================
async function loadAllProducts() {
    try {
        console.log('📦 Cargando productos desde Firebase para wishlist...');
        allProducts = await ProductService.getAll({}, 'createdAt', 'desc', 100);

        productsMap = {};
        allProducts.forEach(p => {
            productsMap[String(p.id)] = p;
        });

        console.log(`✅ ${allProducts.length} productos cargados desde Firebase`);
        console.log('📋 IDs de productos disponibles:', Object.keys(productsMap).slice(0, 10).join(', '));

        return allProducts;
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        allProducts = [];
        productsMap = {};
        return [];
    }
}

/**
 * Obtener producto completo por ID desde Firebase (rápido con mapa)
 */
function getProductById(productId) {
    const idStr = String(productId);
    return productsMap[idStr] || null;
}

/**
 * 🔥 Verificar si un producto existe en Firebase
 * Si no existe, lo consideramos válido igual (puede ser un producto agregado desde Home)
 */
function productExistsInFirebase(productId) {
    const idStr = String(productId);
    // Si es un ID numérico, debe existir en Firebase
    if (/^\d+$/.test(idStr)) {
        return !!productsMap[idStr];
    }
    // Si es un ID personalizado (ej: ZAPATILLAS_1784143743217), lo consideramos válido
    // porque fue agregado desde Home
    return true;
}

/**
 * ENRIQUECER item de wishlist con datos actualizados de Firebase
 * 🔥 Si el producto no existe en Firebase, mantenemos los datos guardados
 */
function enrichWishlistItem(item) {
    const product = getProductById(item.id);

    // Si el producto existe en Firebase, usar datos actualizados
    if (product) {
        console.log(`✅ Enriquecido desde Firebase: ${item.id} -> ${product.nombre}`);

        const discount = product.porcentajeDescuento || 0;
        const finalPrice = product.precioFinal || product.precioVenta || 0;

        let badge = null;
        let badgeType = null;

        if (discount > 0) {
            badge = `-${discount}%`;
            badgeType = 'danger';
        } else if (product.estado === 'agotado') {
            badge = 'Agotado';
            badgeType = 'danger';
        } else if (product.destacado) {
            badge = 'Destacado';
            badgeType = 'primary';
        }

        return {
            id: String(product.id),
            brand: product.marca || 'Outlet',
            name: product.nombre || item.name || 'Producto',
            price: finalPrice,
            image: product.imagenPrincipal || item.image || 'https://placehold.co/300x300?text=Sin+Imagen',
            badge: badge,
            badgeType: badgeType,
            categoria: product.categoria || '',
            estado: product.estado || 'activo',
            _product: product,
            dateAdded: item.dateAdded || new Date().toISOString()
        };
    }

    // 🔥 Si no existe en Firebase, mantener los datos guardados (agregado desde Home)
    console.log(`📦 Usando datos guardados para: ${item.id} - ${item.name}`);
    return {
        ...item,
        image: item.image || 'https://placehold.co/300x300?text=Sin+Imagen',
        brand: item.brand || 'Outlet',
        // Asegurar que tenga estado
        estado: item.estado || 'activo'
    };
}

// ========================================
// 🧹 LIMPIAR outlet_wishlist de datos estáticos (SOLO IDs numéricos que no existen)
// ========================================
function limpiarWishlistEstatica() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const items = JSON.parse(saved);
            // 🔥 Solo filtrar IDs numéricos que no existen en Firebase
            // Los IDs personalizados (con letras) siempre se mantienen
            const itemsValidos = items.filter(item => {
                const idStr = String(item.id);
                // Si es ID numérico, debe existir en Firebase
                if (/^\d+$/.test(idStr)) {
                    return !!productsMap[idStr];
                }
                // IDs personalizados siempre válidos
                return true;
            });

            if (itemsValidos.length !== items.length) {
                console.log(`🧹 Eliminados ${items.length - itemsValidos.length} items estáticos de wishlist...`);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsValidos));
                console.log(`✅ Wishlist limpiada: ${itemsValidos.length} items válidos`);
            }
        }
    } catch (e) {
        console.warn('Error limpiando wishlist:', e);
    }
}

// ========================================
// CARGA WISHLIST 
// ========================================
function loadWishlist() {
    // 🔥 LIMPIAR datos estáticos (solo IDs numéricos que no existen)
    limpiarWishlistEstatica();

    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            var rawItems = JSON.parse(saved);
            // 🔥 FILTRAR SOLO IDs numéricos que existen en Firebase
            // Los IDs personalizados (con letras) siempre se mantienen
            wishlistItems = rawItems.filter(item => {
                const idStr = String(item.id);
                if (/^\d+$/.test(idStr)) {
                    return !!productsMap[idStr];
                }
                return true;
            });

            // Si hay items que no existen en Firebase, actualizar localStorage
            if (wishlistItems.length !== rawItems.length) {
                console.log(`🧹 Eliminados ${rawItems.length - wishlistItems.length} items que no existen en Firebase`);
                saveWishlist();
            }

            console.log(`📦 ${wishlistItems.length} items en wishlist`);
            if (wishlistItems.length > 0) {
                console.log('📋 Items:', wishlistItems.map(i => `${i.id} - ${i.name}`).join(', '));
            }
        } catch (e) {
            console.warn('Error parseando wishlist:', e);
            wishlistItems = [];
            saveWishlist();
        }
    } else {
        console.log('📦 No hay wishlist guardada, iniciando vacía');
        wishlistItems = [];
        saveWishlist();
    }
}

function saveWishlist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
    document.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { count: wishlistItems.length }
    }));
    window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { count: wishlistItems.length }
    }));
    updateWishlistBadge();
}

function updateWishlistBadge() {
    const badge = document.querySelector('.wishlist-count, #wishlistCount');
    if (badge) {
        const count = wishlistItems.length;
        if (count > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = count;
        } else {
            badge.style.display = 'none';
        }
    }
}

function updateCartBadge() {
    var cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
    var badge = document.querySelector('.cart-count');
    if (badge) {
        var total = cart.reduce(function (sum, item) { return sum + (item.quantity || 1); }, 0);
        badge.textContent = total;
        badge.style.opacity = total === 0 ? '0' : '1';
    }
}

// ========================================
// RENDERIZA WISHLIST - CON ENRIQUECIMIENTO
// ========================================
function renderWishlist() {
    var grid = document.getElementById('wishlistGrid');
    var emptyState = document.getElementById('wishlistEmptyState');
    var footer = document.getElementById('wishlistFooter');
    var itemsCountSpan = document.getElementById('wishlistItemsCount');

    if (!grid) {
        console.warn('⚠️ wishlistGrid no encontrado');
        return;
    }

    // 🔥 Verificar items válidos
    var validItems = wishlistItems.filter(item => {
        const idStr = String(item.id);
        if (/^\d+$/.test(idStr)) {
            return !!productsMap[idStr];
        }
        return true;
    });

    if (validItems.length !== wishlistItems.length) {
        wishlistItems = validItems;
        saveWishlist();
    }

    var hasItems = wishlistItems.length > 0;

    grid.style.display = hasItems ? 'grid' : 'none';
    if (emptyState) emptyState.style.display = hasItems ? 'none' : 'block';
    if (footer) footer.style.display = hasItems ? 'block' : 'none';
    if (itemsCountSpan) itemsCountSpan.textContent = wishlistItems.length + ' Item' + (wishlistItems.length !== 1 ? 's' : '') + ' Guardado';

    if (!hasItems) {
        console.log('📦 Wishlist vacía');
        return;
    }

    // 🔥 ENRIQUECER cada item con datos de Firebase (o mantener datos guardados)
    var enrichedItems = wishlistItems
        .map(function (item) {
            return enrichWishlistItem(item);
        })
        .filter(function (item) { return item !== null; });

    if (enrichedItems.length === 0) {
        wishlistItems = [];
        saveWishlist();
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        if (footer) footer.style.display = 'none';
        if (itemsCountSpan) itemsCountSpan.textContent = '0 Items Guardados';
        console.log('📦 Wishlist vacía después de enriquecer');
        return;
    }

    // Ordenar
    var sortedItems = enrichedItems.slice(0);
    if (currentSort === 'price-asc') {
        sortedItems.sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
    } else if (currentSort === 'price-desc') {
        sortedItems.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
    } else {
        sortedItems.sort(function (a, b) {
            const idA = typeof a.id === 'string' ? parseInt(a.id) || 0 : a.id || 0;
            const idB = typeof b.id === 'string' ? parseInt(b.id) || 0 : b.id || 0;
            return idB - idA;
        });
    }

    console.log(`📦 Renderizando ${sortedItems.length} items en wishlist`);

    var html = '';
    sortedItems.forEach(function (displayItem) {
        var badgeHtml = '';
        if (displayItem.badge) {
            badgeHtml = '<div class="wishlist-card-badge"><span class="wishlist-badge-' + (displayItem.badgeType === 'danger' ? 'danger' : 'primary') + '">' + displayItem.badge + '</span></div>';
        }

        var isInStock = displayItem.estado !== 'agotado';
        var stockLabel = isInStock ? '' : '<span style="color:#ef4444;font-size:11px;display:block;">Agotado</span>';

        var categoriaHtml = displayItem.categoria ?
            '<span style="font-size:10px;color:#999;display:block;margin-top:2px;">📂 ' + displayItem.categoria + '</span>' : '';

        html +=
            '<div class="wishlist-product-card" data-id="' + displayItem.id + '">' +
            '<div class="wishlist-card-image">' +
            '<img src="' + (displayItem.image || 'https://placehold.co/300x300?text=Sin+Imagen') + '" alt="' + displayItem.name + '" loading="lazy" onerror="this.src=\'https://placehold.co/300x300?text=Error\'">' +
            badgeHtml +
            '<div class="wishlist-card-actions">' +
            '<button class="wishlist-heart-btn active" data-id="' + displayItem.id + '" aria-label="Eliminar de favoritos">' +
            '<i class="fa-solid fa-heart"></i>' +
            '</button>' +
            '</div>' +
            '</div>' +
            '<div class="wishlist-card-content">' +
            '<p class="wishlist-card-brand">' + (displayItem.brand || 'Outlet') + '</p>' +
            '<h3 class="wishlist-card-title">' + (displayItem.name || 'Producto') + '</h3>' +
            categoriaHtml +
            '<div class="wishlist-card-footer">' +
            '<div>' +
            '<p class="wishlist-card-price">' + formatMoney(displayItem.price || 0) + '</p>' +
            stockLabel +
            '</div>' +
            (isInStock ?
                '<button class="wishlist-add-cart-btn" data-id="' + displayItem.id + '" aria-label="Agregar al carrito">' +
                '<i class="fa-solid fa-shopping-cart"></i>' +
                '</button>' :
                '<button class="wishlist-add-cart-btn" disabled style="opacity:0.4;cursor:not-allowed;" aria-label="Producto agotado">' +
                '<i class="fa-solid fa-ban"></i>' +
                '</button>'
            ) +
            '</div>' +
            '</div>' +
            '</div>';
    });

    grid.innerHTML = html;
    attachCardEvents();
    console.log('✅ Wishlist renderizada correctamente');
}

function attachCardEvents() {
    var grid = document.getElementById('wishlistGrid');
    if (!grid) return;
    grid.removeEventListener('click', handleGridClick);
    grid.addEventListener('click', handleGridClick);
}

function handleGridClick(e) {
    var heartBtn = e.target.closest('.wishlist-heart-btn');
    if (heartBtn) {
        e.preventDefault();
        e.stopPropagation();
        var productId = heartBtn.getAttribute('data-id');
        if (productId) {
            removeFromWishlist(productId);
        }
        return;
    }

    var cartBtn = e.target.closest('.wishlist-add-cart-btn');
    if (cartBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (cartBtn.disabled) return;

        var productId = cartBtn.getAttribute('data-id');
        if (productId) {
            var product = getProductById(productId);
            if (product) {
                addToCart(product);
            } else {
                var wishlistItem = wishlistItems.find(function (p) { return String(p.id) === String(productId); });
                if (wishlistItem) {
                    addToCartFromWishlistItem(wishlistItem);
                } else {
                    mostrarError('Error', 'Producto no encontrado');
                }
            }
        }
        return;
    }

    var card = e.target.closest('.wishlist-product-card');
    if (card) {
        var productId = card.getAttribute('data-id');
        if (productId && !e.target.closest('.wishlist-heart-btn') && !e.target.closest('.wishlist-add-cart-btn')) {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/product/' + productId);
            } else {
                window.location.href = '/product/' + productId;
            }
        }
    }
}

// ========================================
// ELIMINAR DE WISHLIST
// ========================================
async function removeFromWishlist(productId) {
    var product = wishlistItems.find(function (p) { return String(p.id) === String(productId); });
    if (!product) {
        console.warn('⚠️ Producto no encontrado en wishlist:', productId);
        return;
    }

    var result = await mostrarConfirmacion(
        '¿Eliminar de wishlist?',
        '¿Estás seguro de que quieres eliminar "' + product.name + '" de tu lista de deseos?',
        'Sí, eliminar'
    );

    if (result.isConfirmed) {
        wishlistItems = wishlistItems.filter(function (p) { return String(p.id) !== String(productId); });
        saveWishlist();
        renderWishlist();
        await mostrarExito('Eliminado', '"' + product.name + '" ha sido eliminado de tu wishlist.');
    }
}

// ========================================
// AGREGAR AL CARRITO
// ========================================
async function addToCart(product) {
    if (!product) {
        await mostrarError('Error', 'Producto no encontrado');
        return;
    }

    if (product.estado === 'agotado') {
        await mostrarError('Agotado', 'Este producto no está disponible actualmente.');
        return;
    }

    var cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');

    var existingItem = cart.find(function (item) { return String(item.id) === String(product.id); });
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: String(product.id),
            name: product.nombre || 'Producto',
            brand: product.marca || 'Outlet',
            price: product.precioFinal || product.precioVenta || 0,
            image: product.imagenPrincipal || 'https://placehold.co/300x300?text=Sin+Imagen',
            quantity: 1,
            dateAdded: new Date().toISOString(),
            size: 'Única',
            color: 'Estándar'
        });
    }

    localStorage.setItem('outlet_cart', JSON.stringify(cart));
    updateCartBadge();

    await mostrarExito(
        '¡Añadido al carrito!',
        '"' + (product.nombre || 'Producto') + '" ha sido añadido correctamente. 🛒'
    );
}

async function addToCartFromWishlistItem(wishlistItem) {
    var cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');

    var existingItem = cart.find(function (item) { return String(item.id) === String(wishlistItem.id); });
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: String(wishlistItem.id),
            name: wishlistItem.name || 'Producto',
            brand: wishlistItem.brand || 'Outlet',
            price: wishlistItem.price || 0,
            image: wishlistItem.image || 'https://placehold.co/300x300?text=Sin+Imagen',
            quantity: 1,
            dateAdded: new Date().toISOString(),
            size: 'Única',
            color: 'Estándar'
        });
    }

    localStorage.setItem('outlet_cart', JSON.stringify(cart));
    updateCartBadge();

    await mostrarExito(
        '¡Añadido al carrito!',
        '"' + (wishlistItem.name || 'Producto') + '" ha sido añadido correctamente. 🛒'
    );
}

// ========================================
// MOVER TODOS AL CARRITO
// ========================================
async function moveAllToCart() {
    if (wishlistItems.length === 0) {
        await mostrarError('Wishlist vacía', 'No hay productos en tu wishlist para mover al carrito.');
        return;
    }

    var enriched = wishlistItems
        .map(function (item) { return enrichWishlistItem(item); })
        .filter(function (item) { return item !== null; });

    var availableItems = enriched.filter(function (item) { return item.estado !== 'agotado'; });
    var unavailableItems = enriched.filter(function (item) { return item.estado === 'agotado'; });

    if (availableItems.length === 0) {
        await mostrarError('Sin stock', 'Ninguno de los productos en tu wishlist está disponible actualmente.');
        return;
    }

    var mensajeConfirmacion = '¿Quieres mover los ' + availableItems.length + ' producto(s) disponibles de tu wishlist al carrito?';
    if (unavailableItems.length > 0) {
        mensajeConfirmacion += ' (' + unavailableItems.length + ' producto(s) no están disponibles)';
    }

    var result = await mostrarConfirmacion(
        '¿Mover al carrito?',
        mensajeConfirmacion,
        'Sí, mover'
    );

    if (!result.isConfirmed) return;

    mostrarLoading('Moviendo productos al carrito...');

    try {
        var cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');

        availableItems.forEach(function (item) {
            var product = item._product || getProductById(item.id);
            if (product) {
                var existingItem = cart.find(function (cartItem) { return String(cartItem.id) === String(product.id); });
                if (existingItem) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                } else {
                    cart.push({
                        id: String(product.id),
                        name: product.nombre || item.name,
                        brand: product.marca || item.brand || 'Outlet',
                        price: product.precioFinal || product.precioVenta || item.price || 0,
                        image: product.imagenPrincipal || item.image || 'https://placehold.co/300x300?text=Sin+Imagen',
                        quantity: 1,
                        dateAdded: new Date().toISOString(),
                        size: 'Única',
                        color: 'Estándar'
                    });
                }
            }
        });

        localStorage.setItem('outlet_cart', JSON.stringify(cart));
        updateCartBadge();

        var movedIds = new Set(availableItems.map(function (item) { return String(item.id); }));
        wishlistItems = wishlistItems.filter(function (item) { return !movedIds.has(String(item.id)); });
        saveWishlist();

        cerrarLoading();

        var mensajeExito = availableItems.length + ' producto(s) han sido movidos al carrito. 🛍️';
        if (unavailableItems.length > 0) {
            mensajeExito += ' (' + unavailableItems.length + ' no estaban disponibles)';
        }
        await mostrarExito('¡Productos movidos!', mensajeExito);

        renderWishlist();

    } catch (error) {
        cerrarLoading();
        await mostrarError('Error al mover', 'Ocurrió un error al mover los productos al carrito.');
        console.error('Error en moveAllToCart:', error);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================
function initEventListeners() {
    var sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        sortBtn.removeEventListener('click', handleSortClick);
        sortBtn.addEventListener('click', handleSortClick);
    }

    var moveAllBtn = document.getElementById('moveAllToCartBtn');
    if (moveAllBtn) {
        moveAllBtn.removeEventListener('click', moveAllToCart);
        moveAllBtn.addEventListener('click', moveAllToCart);
    }

    var exploreBtns = document.querySelectorAll('#exploreMoreBtn, #exploreMoreFooterBtn');
    exploreBtns.forEach(function (btn) {
        if (btn) {
            btn.removeEventListener('click', handleExploreClick);
            btn.addEventListener('click', handleExploreClick);
        }
    });
}

function handleSortClick() {
    if (currentSort === 'newest') {
        currentSort = 'price-asc';
        mostrarToast('Ordenando por: Precio (Menor a Mayor)', 'info');
    } else if (currentSort === 'price-asc') {
        currentSort = 'price-desc';
        mostrarToast('Ordenando por: Precio (Mayor a Menor)', 'info');
    } else {
        currentSort = 'newest';
        mostrarToast('Ordenando por: Más reciente', 'info');
    }
    renderWishlist();
}

function handleExploreClick() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/collection');
    } else {
        window.location.href = '/collection';
    }
}

// ========================================
// CONTROLLER PRINCIPAL
// ========================================
export async function wishlistCustomerController() {
    console.log('💖 Wishlist Controller - CON SOPORTE PARA PRODUCTOS DE HOME');

    loadStyles();

    // 🔥 PRIMERO: Cargar productos de Firebase
    await loadAllProducts();

    // 🔥 SEGUNDO: Cargar wishlist (filtra solo IDs numéricos que no existen)
    loadWishlist();

    // 🔥 TERCERO: Renderizar (todos los productos válidos)
    renderWishlist();
    initEventListeners();
    updateCartBadge();
    updateWishlistBadge();

    // Escuchar cambios en localStorage desde otras pestañas
    window.addEventListener('storage', function (event) {
        if (event.key === STORAGE_KEY) {
            console.log('🔄 Wishlist actualizada desde otra pestaña');
            loadWishlist();
            renderWishlist();
            updateWishlistBadge();
        }
    });

    document.addEventListener('wishlistUpdated', function () {
        console.log('🔄 Wishlist actualizada - recargando...');
        loadWishlist();
        renderWishlist();
        updateWishlistBadge();
    });

    console.log('✅ Wishlist page loaded successfully');
}