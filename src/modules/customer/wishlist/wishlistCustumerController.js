/* ========================================
   WISHLIST CONTROLLER - CUSTOMER
   Controlador para página de productos favoritos
   CON SWEETALERT2 INTEGRADO
   ======================================== */

// Sample product data
var sampleProducts = [
    {
        id: 1,
        brand: "VALENTINO",
        name: "Structured Wool-Blend Coat",
        price: 3450,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAE78NUeRiMSPhkcmI3ADlJW1vriiriQ_nlq1_wZ3a3ATxS9KdxwTVCNK3Sbwni3mvqm86pynU3vwA-ug9zIHc3rIuwJ9mDEFOSxjQhB5PdTX_t3oX0nG6Wn09FLU_2GVMLcBs0k375ON7DTmUPdHyHvWBrbx5bXmAl37tGQS1Qj5BZpWDIHlaWSWB0uQN0ma_DA-CrxGI5Ee6ZJYnnUjwbVVctHaikXZ9qwqmjS6SBJXPBpBeQGJ409AxCkvjTbc_8CAXADuiMO1R1",
        badge: "Back in Stock",
        badgeType: "primary"
    },
    {
        id: 2,
        brand: "LOEWE",
        name: "Puzzle Edge Large Bag",
        price: 2900,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcbL7JMg8fS1P8XorMQqf2BFYlv_Ni409_q5voqFTnBeuA6IGCNo5FKVNg4NGJmJ_JuiaFL96mIaIFXQRFgV3ZPgE6n_XuMjZYoobip2y9R2__TKpFLlOTpnUntEJGPShcnRiNn2W8-3BVq9DgGSzQBu9u2qiYHGeYOsMk9cnNZyvFlWbGq_CjjviOVwGm7kT219u8rT-TPlsNNZ_eZ4YmRPb28lQbKcUM_xXhDI4JcJNRIgnZS7oucbWACltMAqghZwatk7jigLdH",
        badge: null,
        badgeType: null
    },
    {
        id: 3,
        brand: "ISSEY MIYAKE",
        name: "Pleats Please Maxi Dress",
        price: 890,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEX5W_8pMm-QjTDzsFh7MY8AdZaoMp0iHTjFdlbekizzE2LRcHqGttn3PkCfSsc_LI__Zg4XkHVH8v5oQXJpbDlKJts8D9kllnw1QoSTwVeKbBarRH1oYnYqF0hYC4z90GRmLmvHtp4KAMyn-4s2d39vcQ0PoVZNszr6hTFUXqrwJDXmYHmq8WJXaV0sl7Ba4IuzJ8NmMQMgUFQv2zrdJvdsS_ZMGIh8iGGlobVZGZNHZ6WSp4aBywVSwZ8ox3LxuPENjTkNZpzCI-",
        badge: "Low Stock",
        badgeType: "danger"
    },
    {
        id: 4,
        brand: "SAINT LAURENT",
        name: "Blade Pointed-Toe Pumps",
        price: 1150,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDO95NM-zC55t-K3KCJaDQDw1qlEH1HfzuG9mChrVrcAJsSNjyEJOQxaIoY9nSS5yywPRZAO8gDcCIFkgQvGzNt5SHYNneKWkxjUsSl0jDIiWvGUf0L4ioS2_mNa4hPHnQ_VkEVv18S74nJnQs41rmb12z67Ww-yUbGVWOtudeIeFtSh300ZggIGeoTb2oBGsJ6cY64vM1U4D4x7tVWBHa0zMWcXo3nFoLFKgY_LuA3j3HeMJzRsoK13chAMQA1ZvOgbTw1USfJGK3Y",
        badge: null,
        badgeType: null
    },
    {
        id: 5,
        brand: "JIL SANDER",
        name: "Horizon Mesh Watch",
        price: 2100,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCu6YrYpko9mKLwAD11xWxLqOM3GWhuc2EiN94qaN7Gr2gEmJIvRgrKTWY_iAVBrrC3wqO48DGdcCKcE2nHf4WleZpOmrGeUAT5dVwquPbDDi1vjfAbHr1X1BEr-xbSR6V8LMNmx8i4KW538m6QUKocqqT0AG10RQwroYUvSv_fPUZnric4JZpESLDoID8r4rkfCwdtw5Jmii_cAsTr0cs3oZv8CRglHyk80aDSR-lpU6V86EyhWpg9_G2PbH9U6i3iXBZg5i9K3l_Z",
        badge: null,
        badgeType: null
    },
    {
        id: 6,
        brand: "THE ROW",
        name: "Margaux Silk Blazer",
        price: 4500,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2RiCKT9Rg_urcWZauMwGyJx16Vgg-2j-f2-2uN92lDWtQAzfgKH7SgHMpvFkq9D2rrvjYtWYmuh9W0iczYK54uRKYAsAmaLfHivrzj0sa5Q2DtzOJHJ7a2tIWVaNvzHPS5WtvyDvWzlUZG0jMwkxuhp9cQJpdSQupiWy33WeOqtEQZWY74mShqnmpolk2iHjm2-qSomBYZiIY_ac39umH1TzcdhIcjNfqdShkQYHTtGJOXa9vLRI2wXkup3ivc1fot8e2xVJFT0I8",
        badge: "Only 2 left",
        badgeType: "danger"
    }
];

// Storage key
var STORAGE_KEY = 'outlet_wishlist';

// State
var wishlistItems = [];
var currentSort = 'newest';

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
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}

// ========================================
// Carga wishlist desde localStorage
// ========================================
function loadWishlist() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            wishlistItems = JSON.parse(saved);
        } catch (e) {
            wishlistItems = sampleProducts.slice(0);
            saveWishlist();
        }
    } else {
        wishlistItems = sampleProducts.slice(0);
        saveWishlist();
    }
}

// ========================================
// Guarda wishlist en localStorage
// ========================================
function saveWishlist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
    // Disparar evento para actualizar badges
    document.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { count: wishlistItems.length }
    }));
}

// ========================================
// Renderiza el grid de wishlist
// ========================================
function renderWishlist() {
    var grid = document.getElementById('wishlistGrid');
    var emptyState = document.getElementById('wishlistEmptyState');
    var footer = document.getElementById('wishlistFooter');
    var itemsCountSpan = document.getElementById('wishlistItemsCount');
    
    if (!grid) return;
    
    var hasItems = wishlistItems.length > 0;
    
    grid.style.display = hasItems ? 'grid' : 'none';
    if (emptyState) emptyState.style.display = hasItems ? 'none' : 'block';
    if (footer) footer.style.display = hasItems ? 'block' : 'none';
    if (itemsCountSpan) itemsCountSpan.textContent = wishlistItems.length + ' Item' + (wishlistItems.length !== 1 ? 's' : '') + ' Saved';
    
    if (!hasItems) return;
    
    var sortedItems = wishlistItems.slice(0);
    if (currentSort === 'price-asc') {
        sortedItems.sort(function(a, b) { return a.price - b.price; });
    } else if (currentSort === 'price-desc') {
        sortedItems.sort(function(a, b) { return b.price - a.price; });
    } else {
        sortedItems.sort(function(a, b) { return b.id - a.id; });
    }
    
    var html = '';
    sortedItems.forEach(function(product) {
        var badgeHtml = '';
        if (product.badge) {
            badgeHtml = '<div class="wishlist-card-badge"><span class="wishlist-badge-' + (product.badgeType === 'danger' ? 'danger' : 'primary') + '">' + product.badge + '</span></div>';
        }
        
        html += 
            '<div class="wishlist-product-card" data-id="' + product.id + '">' +
                '<div class="wishlist-card-image">' +
                    '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy">' +
                    badgeHtml +
                    '<div class="wishlist-card-actions">' +
                        '<button class="wishlist-heart-btn active" data-id="' + product.id + '" aria-label="Eliminar de favoritos">' +
                            '<i class="fa-solid fa-heart"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="wishlist-card-content">' +
                    '<p class="wishlist-card-brand">' + product.brand + '</p>' +
                    '<h3 class="wishlist-card-title">' + product.name + '</h3>' +
                    '<div class="wishlist-card-footer">' +
                        '<p class="wishlist-card-price">' + formatMoney(product.price) + '</p>' +
                        '<button class="wishlist-add-cart-btn" data-id="' + product.id + '" aria-label="Agregar al carrito">' +
                            '<i class="fa-solid fa-shopping-cart"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    });
    
    grid.innerHTML = html;
    attachCardEvents();
}

// ========================================
// Adjunta eventos a elementos dinámicos
// ========================================
function attachCardEvents() {
    // CORREGIDO: Usar event delegation para mejor rendimiento y evitar múltiples listeners
    var grid = document.getElementById('wishlistGrid');
    if (!grid) return;
    
    // Remover listeners antiguos (si existen)
    grid.removeEventListener('click', handleGridClick);
    grid.addEventListener('click', handleGridClick);
}

// Manejador centralizado para clicks en el grid
function handleGridClick(e) {
    // Botón de corazón (eliminar de wishlist)
    var heartBtn = e.target.closest('.wishlist-heart-btn');
    if (heartBtn) {
        e.preventDefault();
        e.stopPropagation();
        var productId = parseInt(heartBtn.getAttribute('data-id'));
        if (productId) {
            removeFromWishlist(productId);
        }
        return;
    }
    
    // Botón de agregar al carrito
    var cartBtn = e.target.closest('.wishlist-add-cart-btn');
    if (cartBtn) {
        e.preventDefault();
        e.stopPropagation();
        var productId = parseInt(cartBtn.getAttribute('data-id'));
        if (productId) {
            var product = wishlistItems.find(function(p) { return p.id === productId; });
            if (product) {
                addToCart(product);
            }
        }
        return;
    }
    
    // Click en la tarjeta (navegar a producto)
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
// Elimina producto de wishlist CON SWEETALERT2
// ========================================
async function removeFromWishlist(productId) {
    var product = wishlistItems.find(function(p) { return p.id === productId; });
    if (!product) return;
    
    var result = await mostrarConfirmacion(
        '¿Eliminar de wishlist?',
        '¿Estás seguro de que quieres eliminar "' + product.name + '" de tu lista de deseos?',
        'Sí, eliminar'
    );
    
    if (result.isConfirmed) {
        wishlistItems = wishlistItems.filter(function(p) { return p.id !== productId; });
        saveWishlist();
        renderWishlist();
        await mostrarExito('Eliminado', '"' + product.name + '" ha sido eliminado de tu wishlist.');
    }
}

// ========================================
// Agrega producto al carrito CON SWEETALERT2
// ========================================
async function addToCart(product) {
    var cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
    
    var existingItem = cart.find(function(item) { return item.id === product.id; });
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            quantity: 1,
            dateAdded: new Date().toISOString()
        });
    }
    
    localStorage.setItem('outlet_cart', JSON.stringify(cart));
    updateCartBadge();
    
    await mostrarExito(
        '¡Añadido al carrito!',
        '"' + product.name + '" ha sido añadido correctamente. 🛒'
    );
}

// ========================================
// Mueve todos los productos al carrito CON SWEETALERT2
// ========================================
async function moveAllToCart() {
    if (wishlistItems.length === 0) {
        await mostrarError('Wishlist vacía', 'No hay productos en tu wishlist para mover al carrito.');
        return;
    }
    
    var result = await mostrarConfirmacion(
        '¿Mover todos al carrito?',
        '¿Quieres mover los ' + wishlistItems.length + ' producto(s) de tu wishlist al carrito?',
        'Sí, mover todos'
    );
    
    if (!result.isConfirmed) return;
    
    mostrarLoading('Moviendo productos al carrito...');
    
    try {
        var cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
        
        wishlistItems.forEach(function(product) {
            var existingItem = cart.find(function(item) { return item.id === product.id; });
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                    dateAdded: new Date().toISOString()
                });
            }
        });
        
        localStorage.setItem('outlet_cart', JSON.stringify(cart));
        updateCartBadge();
        
        cerrarLoading();
        await mostrarExito(
            '¡Todos movidos al carrito!',
            wishlistItems.length + ' producto(s) han sido movidos al carrito. 🛍️'
        );
        
        wishlistItems = [];
        saveWishlist();
        renderWishlist();
        
    } catch (error) {
        cerrarLoading();
        await mostrarError('Error al mover', 'Ocurrió un error al mover los productos al carrito.');
        console.error('Error en moveAllToCart:', error);
    }
}

// ========================================
// Actualiza el badge del carrito en el navbar
// ========================================
function updateCartBadge() {
    var cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
    var badge = document.querySelector('.cart-count');
    if (badge) {
        var total = cart.reduce(function(sum, item) { return sum + (item.quantity || 1); }, 0);
        badge.textContent = total;
        badge.style.opacity = total === 0 ? '0' : '1';
    }
}

// ========================================
// Inicializa event listeners
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
    exploreBtns.forEach(function(btn) {
        if (btn) {
            btn.removeEventListener('click', handleExploreClick);
            btn.addEventListener('click', handleExploreClick);
        }
    });
}

// Manejadores separados para mejor mantenimiento
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
// Controller principal
// ========================================
export async function wishlistCustomerController() {
    console.log('💖 Wishlist Controller - Favorites page');
    
    loadStyles();
    loadWishlist();
    renderWishlist();
    initEventListeners();
    updateCartBadge();
    
    console.log('✅ Wishlist page loaded successfully');
}