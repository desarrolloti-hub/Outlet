/* ========================================
   CART CONTROLLER - OUTLET
   Controlador para página del carrito de compras
   ======================================== */

// Storage keys
const STORAGE_KEYS = {
    CART: 'outlet_cart'
};

// Exchange rate (EUR to MXN)
const EXCHANGE_RATE = 20; // 1 EUR = 20 MXN

// Sample products for "You may also like" (prices in MXN)
const UPSELl_ITEMS = [
    {
        id: 101,
        name: "CALZADO NOIR",
        category: "SNEAKERS",
        price: 13000.00, // 650 EUR * 20
        image: "https://picsum.photos/id/0/400/500"
    },
    {
        id: 102,
        name: "CARTERA ORO NEGRO",
        category: "ACCESORIOS",
        price: 8400.00, // 420 EUR * 20
        image: "https://picsum.photos/id/21/400/500"
    },
    {
        id: 103,
        name: "GAFAS ÉLITE",
        category: "ÓPTICA",
        price: 7600.00, // 380 EUR * 20
        image: "https://picsum.photos/id/22/400/500"
    },
    {
        id: 104,
        name: "RELOJ CROMO",
        category: "JOYERÍA",
        price: 25000.00, // 1250 EUR * 20
        image: "https://picsum.photos/id/23/400/500"
    }
];

// Cart items (will be loaded from localStorage)
let cartItems = [];

/**
 * Load styles for cart page
 */
function loadStyles() {
    if (document.querySelector('link[href*="cart.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/cart.css';
    document.head.appendChild(link);
}

/**
 * Format currency (Mexican Pesos)
 */
function formatMoney(amount) {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Load cart from localStorage
 */
function loadCart() {
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
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
                price: 25000.00, // 1250 EUR * 20
                quantity: 1,
                image: "https://picsum.photos/id/20/400/500"
            },
            {
                id: 2,
                brand: "Atelier Gold",
                name: "BOLSO CLUTCH MINIMALISTA",
                size: "Única",
                color: "Oro Mate",
                price: 17800.00, // 890 EUR * 20
                quantity: 1,
                image: "https://picsum.photos/id/26/400/500"
            }
        ];
        saveCart();
    }
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
    updateCartBadge();
}

/**
 * Update cart badge in navbar
 */
function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (badge) {
        const total = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = total;
        badge.style.opacity = total === 0 ? '0' : '1';
    }
}

/**
 * Show toast notification
 */
function showNotification(message, isError = false) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.textContent = message;
    
    if (isError) {
        notification.style.borderLeftColor = 'var(--outlet-danger)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Render cart items
 */
function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;

    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="outlet-cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <p>Tu carrito está vacío</p>
                <button class="outlet-cart-empty-btn" id="continueShoppingBtn">SEGUIR COMPRANDO</button>
            </div>
        `;
        
        const continueBtn = document.getElementById('continueShoppingBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.navigateTo('/collection');
            });
        }
        
        renderSummary();
        return;
    }

    container.innerHTML = cartItems.map(item => `
        <div class="outlet-cart-item" data-id="${item.id}">
            <div class="outlet-cart-item-inner">
                <div class="outlet-cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="outlet-cart-item-details">
                    <div class="outlet-cart-item-info">
                        <p class="outlet-cart-item-brand">${item.brand}</p>
                        <h3 class="outlet-cart-item-name">${item.name}</h3>
                        <div class="outlet-cart-item-attributes">
                            <span>Talla: ${item.size}</span>
                            <span>Color: ${item.color}</span>
                        </div>
                    </div>
                    <div class="outlet-cart-item-actions">
                        <div class="outlet-cart-quantity">
                            <button class="outlet-cart-qty-btn decr" data-id="${item.id}">−</button>
                            <span class="outlet-cart-qty-value">${item.quantity}</span>
                            <button class="outlet-cart-qty-btn incr" data-id="${item.id}">+</button>
                        </div>
                        <div class="outlet-cart-item-price">
                            <p class="outlet-cart-price">${formatMoney(item.price * item.quantity)}</p>
                            <button class="outlet-cart-remove" data-id="${item.id}">
                                <i class="fas fa-trash-alt"></i> ELIMINAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    attachCartEvents();
    renderSummary();
}

/**
 * Render order summary
 */
function renderSummary() {
    const container = document.getElementById('orderSummaryContainer');
    if (!container) return;

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 2000 ? 0 : 300; // Envío gratis sobre $2,000 MXN
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    container.innerHTML = `
        <div class="outlet-cart-summary-card">
            <h3 class="outlet-cart-summary-title">RESUMEN DEL PEDIDO</h3>
            
            <div class="outlet-cart-summary-row">
                <span>SUBTOTAL</span>
                <span>${formatMoney(subtotal)}</span>
            </div>
            <div class="outlet-cart-summary-row">
                <span>ENVÍO</span>
                <span>${shipping === 0 ? 'GRATIS' : formatMoney(shipping)}</span>
            </div>
            <div class="outlet-cart-summary-row">
                <span>IMPUESTOS (8%)</span>
                <span>${formatMoney(tax)}</span>
            </div>
            
            <div class="outlet-cart-summary-divider"></div>
            
             <div class="outlet-cart-summary-total">
            <span>TOTAL A PAGAR</span>
            <span class="outlet-cart-total-amount">${formatMoney(total)} MXN</span>
            </div>
            
            <div class="outlet-cart-promo">
                <label>¿TIENES UN CÓDIGO PROMOCIONAL?</label>
                <div class="outlet-cart-promo-input-group">
                    <input type="text" id="promoCode" placeholder="INGRESA TU CÓDIGO">
                    <button id="applyPromoBtn">APLICAR</button>
                </div>
            </div>
            
            <button class="outlet-cart-checkout-btn" id="checkoutBtn">
                FINALIZAR COMPRA <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;

    const applyBtn = document.getElementById('applyPromoBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const input = document.getElementById('promoCode');
            const code = input?.value.trim().toUpperCase();
            if (code === 'DESCUENTO10') {
                showNotification('✅ Código aplicado - 10% de descuento');
            } else if (code === 'BIENVENIDO15') {
                showNotification('✅ Código aplicado - 15% de descuento');
            } else if (code) {
                showNotification('❌ Código no válido', true);
            } else {
                showNotification('⚠️ Ingresa un código', true);
            }
        });
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartItems.length === 0) {
                showNotification('⚠️ Tu carrito está vacío', true);
            } else {
                showNotification('🚀 Redirigiendo al pago...');
                // setTimeout(() => window.navigateTo('/checkout'), 1000);
            }
        });
    }
}

/**
 * Render upsell items (You may also like)
 */
function renderUpsell() {
    const grid = document.getElementById('upsellGrid');
    if (!grid) return;

    grid.innerHTML = UPSELl_ITEMS.map(item => `
        <div class="outlet-cart-upsell-card" data-id="${item.id}">
            <div class="outlet-cart-upsell-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="outlet-cart-upsell-info">
                <p class="outlet-cart-upsell-category">${item.category}</p>
                <h4 class="outlet-cart-upsell-name">${item.name}</h4>
                <p class="outlet-cart-upsell-price">${formatMoney(item.price)}</p>
            </div>
        </div>
    `).join('');

    // Attach upsell card events
    document.querySelectorAll('.outlet-cart-upsell-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.getAttribute('data-id'));
            const product = UPSELl_ITEMS.find(p => p.id === id);
            if (product) {
                addToCart(product);
            }
        });
    });
}

/**
 * Add product to cart (from upsell)
 */
function addToCart(product) {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`✨ ${product.name} - Cantidad actualizada`);
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
        showNotification(`✨ ${product.name} añadido al carrito`);
    }
    
    saveCart();
    renderCart();
}

/**
 * Attach events to cart items (quantity, remove)
 */
function attachCartEvents() {
    // Increment quantity
    document.querySelectorAll('.outlet-cart-qty-btn.incr').forEach(btn => {
        btn.removeEventListener('click', handleIncrement);
        btn.addEventListener('click', handleIncrement);
    });
    
    // Decrement quantity
    document.querySelectorAll('.outlet-cart-qty-btn.decr').forEach(btn => {
        btn.removeEventListener('click', handleDecrement);
        btn.addEventListener('click', handleDecrement);
    });
    
    // Remove item
    document.querySelectorAll('.outlet-cart-remove').forEach(btn => {
        btn.removeEventListener('click', handleRemove);
        btn.addEventListener('click', handleRemove);
    });
}

/**
 * Handle increment quantity
 */
function handleIncrement(e) {
    const id = parseInt(e.currentTarget.getAttribute('data-id'));
    const item = cartItems.find(i => i.id === id);
    if (item) {
        item.quantity++;
        saveCart();
        renderCart();
    }
}

/**
 * Handle decrement quantity
 */
function handleDecrement(e) {
    const id = parseInt(e.currentTarget.getAttribute('data-id'));
    const item = cartItems.find(i => i.id === id);
    if (item && item.quantity > 1) {
        item.quantity--;
        saveCart();
        renderCart();
    }
}

/**
 * Handle remove item
 */
function handleRemove(e) {
    const id = parseInt(e.currentTarget.getAttribute('data-id'));
    const item = cartItems.find(i => i.id === id);
    cartItems = cartItems.filter(i => i.id !== id);
    saveCart();
    renderCart();
    showNotification(`🗑 ${item?.name || 'Producto'} eliminado del carrito`);
}

/**
 * Main controller
 */
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
