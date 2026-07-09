/* ========================================
   CART CONTROLLER - OUTLET
   Controlador para página del carrito de compras
   CON SWEETALERT2 INTEGRADO
   LOS BOTONES USAN buttons.css
   ======================================== */

// Storage keys
var STORAGE_KEYS = {
    CART: 'outlet_cart'
};

// Exchange rate (EUR to MXN)
var EXCHANGE_RATE = 20;

// Sample products for "You may also like" (prices in MXN)
var UPSELl_ITEMS = [
    {
        id: 101,
        name: "CALZADO NOIR",
        category: "SNEAKERS",
        price: 13000.00,
        image: "https://picsum.photos/id/0/400/500"
    },
    {
        id: 102,
        name: "CARTERA ORO NEGRO",
        category: "ACCESORIOS",
        price: 8400.00,
        image: "https://picsum.photos/id/21/400/500"
    },
    {
        id: 103,
        name: "GAFAS ÉLITE",
        category: "ÓPTICA",
        price: 7600.00,
        image: "https://picsum.photos/id/22/400/500"
    },
    {
        id: 104,
        name: "RELOJ CROMO",
        category: "JOYERÍA",
        price: 25000.00,
        image: "https://picsum.photos/id/23/400/500"
    }
];

// Cart items (will be loaded from localStorage)
var cartItems = [];

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
    if (document.querySelector('link[href*="cart.css"]')) return;
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/cart.css';
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
// Carga del carrito desde localStorage
// ========================================
function loadCart() {
    var savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
    } else {
        // Default sample cart items (prices in MXN)
        cartItems = [
            {
                id: 1,
                brand: "Maison Luxe",
                name: "VESTIDO DE SEDA NOCTURNE",
                size: "38 (M)",
                color: "Noir Anthracite",
                price: 25000.00,
                quantity: 1,
                image: "https://picsum.photos/id/20/400/500"
            },
            {
                id: 2,
                brand: "Atelier Gold",
                name: "BOLSO CLUTCH MINIMALISTA",
                size: "Única",
                color: "Oro Mate",
                price: 17800.00,
                quantity: 1,
                image: "https://picsum.photos/id/26/400/500"
            }
        ];
        saveCart();
    }
}

// ========================================
// Guarda el carrito en localStorage
// ========================================
function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
    updateCartBadge();
}

// ========================================
// Actualiza el badge del carrito en el navbar
// ========================================
function updateCartBadge() {
    var badge = document.querySelector('.cart-count');
    if (badge) {
        var total = cartItems.reduce(function(sum, item) { return sum + (item.quantity || 1); }, 0);
        badge.textContent = total;
        badge.style.opacity = total === 0 ? '0' : '1';
    }
}

// ========================================
// Renderiza los items del carrito
// ========================================
function renderCart() {
    var container = document.getElementById('cartItemsContainer');
    if (!container) return;

    if (cartItems.length === 0) {
        container.innerHTML = 
            '<div class="outlet-cart-empty">' +
                '<i class="fas fa-shopping-bag"></i>' +
                '<p>Tu carrito está vacío</p>' +
                // ✅ Usando outlet-btn-primary de buttons.css
                '<button class="outlet-btn outlet-btn-primary" id="continueShoppingBtn">SEGUIR COMPRANDO</button>' +
            '</div>';
        
        var continueBtn = document.getElementById('continueShoppingBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', function() {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/collection');
                } else {
                    window.location.href = '/collection';
                }
            });
        }
        
        renderSummary();
        return;
    }

    var html = '';
    cartItems.forEach(function(item) {
        html += 
            '<div class="outlet-cart-item" data-id="' + item.id + '">' +
                '<div class="outlet-cart-item-inner">' +
                    '<div class="outlet-cart-item-image">' +
                        '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy">' +
                    '</div>' +
                    '<div class="outlet-cart-item-details">' +
                        '<div class="outlet-cart-item-info">' +
                            '<p class="outlet-cart-item-brand">' + item.brand + '</p>' +
                            '<h3 class="outlet-cart-item-name">' + item.name + '</h3>' +
                            '<div class="outlet-cart-item-attributes">' +
                                '<span>Talla: ' + item.size + '</span>' +
                                '<span>Color: ' + item.color + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="outlet-cart-item-actions">' +
                            '<div class="outlet-cart-quantity">' +
                                '<button class="outlet-cart-qty-btn decr" data-id="' + item.id + '">−</button>' +
                                '<span class="outlet-cart-qty-value">' + item.quantity + '</span>' +
                                '<button class="outlet-cart-qty-btn incr" data-id="' + item.id + '">+</button>' +
                            '</div>' +
                            '<div class="outlet-cart-item-price">' +
                                '<p class="outlet-cart-price">' + formatMoney(item.price * item.quantity) + '</p>' +
                                // ✅ Usando outlet-btn-danger de buttons.css
                                '<button class="outlet-btn outlet-btn-danger outlet-btn-sm" data-id="' + item.id + '">' +
                                    '<i class="fas fa-trash-alt"></i> ELIMINAR' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    });
    
    container.innerHTML = html;

    attachCartEvents();
    renderSummary();
}

// ========================================
// Renderiza el resumen del pedido
// ========================================
function renderSummary() {
    var container = document.getElementById('orderSummaryContainer');
    if (!container) return;

    var subtotal = cartItems.reduce(function(acc, item) { return acc + (item.price * item.quantity); }, 0);
    var shipping = subtotal > 2000 ? 0 : 300;
    var tax = subtotal * 0.08;
    var total = subtotal + shipping + tax;

    container.innerHTML = 
        '<div class="outlet-cart-summary-card">' +
            '<h3 class="outlet-cart-summary-title">RESUMEN DEL PEDIDO</h3>' +
            
            '<div class="outlet-cart-summary-row">' +
                '<span>SUBTOTAL</span>' +
                '<span>' + formatMoney(subtotal) + '</span>' +
            '</div>' +
            '<div class="outlet-cart-summary-row">' +
                '<span>ENVÍO</span>' +
                '<span>' + (shipping === 0 ? 'GRATIS' : formatMoney(shipping)) + '</span>' +
            '</div>' +
            '<div class="outlet-cart-summary-row">' +
                '<span>IMPUESTOS (8%)</span>' +
                '<span>' + formatMoney(tax) + '</span>' +
            '</div>' +
            
            '<div class="outlet-cart-summary-divider"></div>' +
            
            '<div class="outlet-cart-summary-total">' +
                '<span>TOTAL A PAGAR</span>' +
                '<span class="outlet-cart-total-amount">' + formatMoney(total) + ' MXN</span>' +
            '</div>' +
            
            '<div class="outlet-cart-promo">' +
                '<label>¿TIENES UN CÓDIGO PROMOCIONAL?</label>' +
                '<div class="outlet-cart-promo-input-group">' +
                    '<input type="text" id="promoCode" placeholder="INGRESA TU CÓDIGO">' +
                    // ✅ Usando outlet-btn-dark de buttons.css
                    '<button class="outlet-btn outlet-btn-dark outlet-btn-sm" id="applyPromoBtn">APLICAR</button>' +
                '</div>' +
            '</div>' +
            
            // ✅ Usando outlet-btn-primary de buttons.css con hover-icon y block
            '<button class="outlet-btn outlet-btn-primary outlet-btn-block outlet-btn-hover-icon" id="checkoutBtn">' +
                'FINALIZAR COMPRA <i class="fas fa-arrow-right outlet-btn-icon outlet-btn-icon-right"></i>' +
            '</button>' +
        '</div>';

    var applyBtn = document.getElementById('applyPromoBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', handleApplyPromo);
    }

    var checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

// ========================================
// Renderiza "You may also like"
// ========================================
function renderUpsell() {
    var grid = document.getElementById('upsellGrid');
    if (!grid) return;

    var html = '';
    UPSELl_ITEMS.forEach(function(item) {
        html += 
            '<div class="outlet-cart-upsell-card" data-id="' + item.id + '">' +
                '<div class="outlet-cart-upsell-image">' +
                    '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy">' +
                '</div>' +
                '<div class="outlet-cart-upsell-info">' +
                    '<p class="outlet-cart-upsell-category">' + item.category + '</p>' +
                    '<h4 class="outlet-cart-upsell-name">' + item.name + '</h4>' +
                    '<p class="outlet-cart-upsell-price">' + formatMoney(item.price) + '</p>' +
                '</div>' +
            '</div>';
    });
    
    grid.innerHTML = html;

    // Attach upsell card events
    document.querySelectorAll('.outlet-cart-upsell-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var id = parseInt(this.getAttribute('data-id'));
            var product = UPSELl_ITEMS.find(function(p) { return p.id === id; });
            if (product) {
                addToCart(product);
            }
        });
    });
}

// ========================================
// Añadir producto al carrito (desde upsell)
// ========================================
async function addToCart(product) {
    var existingItem = cartItems.find(function(item) { return item.id === product.id; });
    
    if (existingItem) {
        existingItem.quantity += 1;
        mostrarToast('✨ ' + product.name + ' - Cantidad actualizada', 'success');
    } else {
        cartItems.push({
            id: product.id,
            brand: product.category,
            name: product.name,
            size: "Única",
            color: "Estándar",
            price: product.price,
            quantity: 1,
            image: product.image
        });
        
        await mostrarExito(
            '¡Añadido al carrito!',
            product.name + ' ha sido añadido correctamente.'
        );
    }
    
    saveCart();
    renderCart();
}

// ========================================
// Maneja la aplicación de código promocional
// ========================================
async function handleApplyPromo() {
    var input = document.getElementById('promoCode');
    var code = input?.value.trim().toUpperCase();
    
    if (!code) {
        await mostrarError('Código vacío', 'Ingresa un código promocional.');
        return;
    }
    
    if (code === 'DESCUENTO10') {
        await mostrarExito('Código aplicado', '¡10% de descuento aplicado a tu pedido! 🎉');
        mostrarToast('✅ 10% de descuento aplicado', 'success');
    } else if (code === 'BIENVENIDO15') {
        await mostrarExito('Código aplicado', '¡15% de descuento aplicado a tu pedido! 🎉');
        mostrarToast('✅ 15% de descuento aplicado', 'success');
    } else {
        await mostrarError('Código no válido', 'El código "' + code + '" no es válido. Intenta con otro.');
    }
}

// ========================================
// Maneja el checkout
// ========================================
async function handleCheckout() {
    if (cartItems.length === 0) {
        await mostrarError('Carrito vacío', 'No hay productos en tu carrito para finalizar la compra.');
        return;
    }
    
    var totalItems = cartItems.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    var subtotal = cartItems.reduce(function(acc, item) { return acc + (item.price * item.quantity); }, 0);
    
    var confirmResult = await mostrarConfirmacion(
        '¿Finalizar compra?',
        'Estás a punto de comprar ' + totalItems + ' producto(s) por un total de ' + formatMoney(subtotal) + '.',
        'Sí, finalizar'
    );
    
    if (confirmResult.isConfirmed) {
        mostrarLoading('Procesando tu pedido...');
        
        setTimeout(function() {
            cerrarLoading();
            mostrarExito(
                '¡Pedido confirmado!',
                'Tu pedido ha sido procesado correctamente. Recibirás un correo de confirmación.'
            );
        }, 2000);
    }
}

// ========================================
// Maneja incrementar cantidad
// ========================================
function handleIncrement(e) {
    var id = parseInt(e.currentTarget.getAttribute('data-id'));
    var item = cartItems.find(function(i) { return i.id === id; });
    if (item) {
        item.quantity++;
        saveCart();
        renderCart();
    }
}

// ========================================
// Maneja decrementar cantidad
// ========================================
function handleDecrement(e) {
    var id = parseInt(e.currentTarget.getAttribute('data-id'));
    var item = cartItems.find(function(i) { return i.id === id; });
    if (item && item.quantity > 1) {
        item.quantity--;
        saveCart();
        renderCart();
    }
}

// ========================================
// Maneja eliminar item del carrito
// ========================================
async function handleRemove(e) {
    var id = parseInt(e.currentTarget.getAttribute('data-id'));
    var item = cartItems.find(function(i) { return i.id === id; });
    var nombreProducto = item?.name || 'Producto';
    
    var confirmResult = await mostrarConfirmacion(
        '¿Eliminar producto?',
        '¿Estás seguro de que quieres eliminar "' + nombreProducto + '" del carrito?',
        'Sí, eliminar'
    );
    
    if (confirmResult.isConfirmed) {
        cartItems = cartItems.filter(function(i) { return i.id !== id; });
        saveCart();
        renderCart();
        mostrarToast('🗑️ ' + nombreProducto + ' eliminado del carrito', 'info');
    }
}

// ========================================
// Adjunta eventos a los items del carrito
// ========================================
function attachCartEvents() {
    // Increment quantity
    document.querySelectorAll('.outlet-cart-qty-btn.incr').forEach(function(btn) {
        btn.removeEventListener('click', handleIncrement);
        btn.addEventListener('click', handleIncrement);
    });
    
    // Decrement quantity
    document.querySelectorAll('.outlet-cart-qty-btn.decr').forEach(function(btn) {
        btn.removeEventListener('click', handleDecrement);
        btn.addEventListener('click', handleDecrement);
    });
    
    // Remove item - ahora con clase outlet-btn-danger
    document.querySelectorAll('.outlet-btn-danger[data-id]').forEach(function(btn) {
        btn.removeEventListener('click', handleRemove);
        btn.addEventListener('click', handleRemove);
    });
}

// ========================================
// Controller principal
// ========================================
export async function cartController() {
    console.log('🛒 Cart Controller - Página del carrito');
    
    // Load styles
    loadStyles();
    
    // Load cart data
    loadCart();
    
    // Render cart
    renderCart();
    
    // Render upsell
    renderUpsell();
    
    // Update cart badge
    updateCartBadge();
    
    console.log('✅ Cart page loaded successfully');
}