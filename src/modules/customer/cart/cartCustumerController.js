/* ========================================
   CART CONTROLLER - CUSTOMER
   Controlador del carrito con datos desde Firebase
   CON BOTONES DE buttons.css
   ======================================== */

import { ProductService } from '../../../services/productService.js';

// Storage key - UNIFICADA
const STORAGE_KEYS = {
    CART: 'outlet_cart'
};

// Exchange rate (EUR to MXN)
const EXCHANGE_RATE = 20;

// Cart items (will be loaded from localStorage)
let cartItems = [];
let allProducts = [];

// ========================================
// CARGAR TODOS LOS PRODUCTOS DESDE FIREBASE
// ========================================
async function loadAllProducts() {
    try {
        console.log('📦 Cargando productos desde Firebase para cart...');
        allProducts = await ProductService.getAll({}, 'createdAt', 'desc', 100);
        console.log(`✅ ${allProducts.length} productos cargados`);
        return allProducts;
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        allProducts = [];
        return [];
    }
}

/**
 * Obtener producto completo por ID desde Firebase
 */
function getProductById(productId) {
    return allProducts.find(p => p.id === productId);
}

// ========================================
// FUNCIONES PARA UPSALE
// ========================================

/**
 * Obtener productos para "Te podría interesar" desde Firebase
 */
function getUpsellItems() {
    // Tomar productos destacados o con descuento, excluyendo los que ya están en el carrito
    const cartIds = new Set(cartItems.map(item => item.id));

    let candidates = allProducts.filter(p =>
        p.estado === 'activo' &&
        !cartIds.has(p.id) &&
        (p.destacado || p.porcentajeDescuento > 0)
    );

    // Si no hay suficientes, agregar más productos
    if (candidates.length < 4) {
        const additional = allProducts.filter(p =>
            p.estado === 'activo' &&
            !cartIds.has(p.id) &&
            !candidates.includes(p)
        );
        candidates = [...candidates, ...additional];
    }

    // Tomar hasta 4
    return candidates.slice(0, 4).map(p => ({
        id: p.id,
        name: p.nombre,
        category: p.categoria || 'Producto',
        price: p.precioFinal || p.precioVenta || 0,
        image: p.imagenPrincipal || 'https://placehold.co/400/500?text=Sin+Imagen',
        descuento: p.porcentajeDescuento || 0,
        _product: p
    }));
}

// ========================================
// FUNCIONES PRINCIPALES
// ========================================

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
        try {
            cartItems = JSON.parse(savedCart);
            console.log(`📦 ${cartItems.length} items en carrito`);
        } catch (e) {
            cartItems = [];
            saveCart();
        }
    } else {
        cartItems = [];
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
 * Render cart items - CON DATOS ACTUALIZADOS
 * 🔥 BOTONES CON CLASES DE buttons.css
 */
function renderCart() {
    const container = document.getElementById('cartItemsContainerCustomer');
    if (!container) {
        console.error('❌ No se encontró #cartItemsContainerCustomer');
        return;
    }

    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="outlet-cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <p>Tu carrito está vacío</p>
                <button class="outlet-btn outlet-btn-primary" id="continueShoppingBtnCustomer">SEGUIR COMPRANDO</button>
            </div>
        `;

        const continueBtn = document.getElementById('continueShoppingBtnCustomer');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.navigateTo('/collection');
            });
        }

        renderSummary();
        return;
    }

    // Enriquecer items con datos actualizados de Firebase
    const enrichedItems = cartItems.map(item => {
        const product = getProductById(item.id);
        if (product) {
            return {
                ...item,
                name: product.nombre || item.name,
                brand: product.marca || item.brand || 'Outlet',
                price: product.precioFinal || product.precioVenta || item.price || 0,
                image: product.imagenPrincipal || item.image || 'https://placehold.co/300x300?text=Sin+Imagen',
                isAvailable: product.estado !== 'agotado',
                _product: product
            };
        }
        return {
            ...item,
            isAvailable: true
        };
    });

    container.innerHTML = enrichedItems.map(item => `
        <div class="outlet-cart-item" data-id="${item.id}">
            <div class="outlet-cart-item-inner">
                <div class="outlet-cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    ${!item.isAvailable ? '<div class="outlet-cart-out-of-stock">AGOTADO</div>' : ''}
                </div>
                <div class="outlet-cart-item-details">
                    <div class="outlet-cart-item-info">
                        <p class="outlet-cart-item-brand">${item.brand}</p>
                        <h3 class="outlet-cart-item-name">${item.name}</h3>
                        <div class="outlet-cart-item-attributes">
                            <span>Talla: ${item.size || 'Única'}</span>
                            <span>Color: ${item.color || 'Estándar'}</span>
                        </div>
                    </div>
                    <div class="outlet-cart-item-actions">
                        <div class="outlet-cart-quantity">
                            <button class="outlet-cart-qty-btn decr" data-id="${item.id}" ${!item.isAvailable ? 'disabled' : ''}>−</button>
                            <span class="outlet-cart-qty-value">${item.quantity}</span>
                            <button class="outlet-cart-qty-btn incr" data-id="${item.id}" ${!item.isAvailable ? 'disabled' : ''}>+</button>
                        </div>
                        <div class="outlet-cart-item-price">
                            <p class="outlet-cart-price">${formatMoney(item.price * item.quantity)}</p>
                            <button class="outlet-btn outlet-btn-danger outlet-btn-sm" data-id="${item.id}">
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
 * 🔥 BOTONES CON CLASES DE buttons.css
 */
/**
 * Render order summary
 * 🔥 BOTONES CON CLASES DE buttons.css
 */
function renderSummary() {
    const container = document.getElementById('orderSummaryContainerCustomer');
    if (!container) {
        console.error('❌ No se encontró #orderSummaryContainerCustomer');
        return;
    }

    // Filtrar solo items disponibles para el cálculo
    const availableItems = cartItems.filter(item => {
        const product = getProductById(item.id);
        return product ? product.estado !== 'agotado' : true;
    });

    const subtotal = availableItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 2000 ? 0 : 300;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // Verificar si hay items agotados
    const hasOutOfStock = cartItems.some(item => {
        const product = getProductById(item.id);
        return product ? product.estado === 'agotado' : false;
    });

    container.innerHTML = `
        <div class="outlet-cart-summary-card">
            <h3 class="outlet-cart-summary-title">RESUMEN DEL PEDIDO</h3>
            
            ${hasOutOfStock ? `
                <div class="outlet-cart-summary-warning" style="background:#fff3cd;padding:10px;border-radius:4px;margin-bottom:12px;border-left:3px solid #ffc107;">
                    <span style="color:#856404;font-size:13px;">⚠️ Algunos productos están agotados y no se incluyen en el total.</span>
                </div>
            ` : ''}
            
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
                <span class="outlet-cart-total-amount">${formatMoney(total)}</span>
            </div>
            
            <div class="outlet-cart-promo">
                <label>¿TIENES UN CÓDIGO PROMOCIONAL?</label>
                <div class="outlet-cart-promo-input-group">
                    <input type="text" id="promoCodeCustomer" placeholder="INGRESA TU CÓDIGO">
                    <button class="outlet-btn outlet-btn-dark outlet-btn-sm" id="applyPromoBtnCustomer">APLICAR</button>
                </div>
            </div>
            
            <button class="outlet-btn outlet-btn-primary outlet-btn-block outlet-btn-hover-icon" id="checkoutBtnCustomer" ${availableItems.length === 0 ? 'disabled' : ''}>
                FINALIZAR COMPRA <i class="fas fa-arrow-right outlet-btn-icon outlet-btn-icon-right"></i>
            </button>
            ${availableItems.length === 0 ? '<p style="font-size:12px;color:#999;text-align:center;margin-top:8px;">No hay productos disponibles para comprar</p>' : ''}
        </div>
    `;

    const applyBtn = document.getElementById('applyPromoBtnCustomer');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const input = document.getElementById('promoCodeCustomer');
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

    const checkoutBtn = document.getElementById('checkoutBtnCustomer');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (availableItems.length === 0) {
                showNotification('⚠️ No hay productos disponibles para comprar', true);
            } else {
                // ✅ REDIRIGIR A /editUser
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/editUser');
                } else {
                    window.location.href = '/editUser';
                }
            }
        });
    }
}

/**
 * Render upsell items desde Firebase
 */
function renderUpsell() {
    const grid = document.getElementById('upsellGridCustomer');
    if (!grid) {
        console.error('❌ No se encontró #upsellGridCustomer');
        return;
    }

    const upsellItems = getUpsellItems();

    if (upsellItems.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;">No hay productos disponibles</p>';
        return;
    }

    grid.innerHTML = upsellItems.map(item => `
        <div class="outlet-cart-upsell-card" data-id="${item.id}">
            <div class="outlet-cart-upsell-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                ${item.descuento > 0 ? `<span class="outlet-cart-upsell-badge">-${item.descuento}%</span>` : ''}
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
            const id = card.getAttribute('data-id');
            const product = allProducts.find(p => p.id === id);
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
    if (!product) return;

    // Verificar si está agotado
    if (product.estado === 'agotado') {
        showNotification('❌ Producto agotado', true);
        return;
    }

    const existingItem = cartItems.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`✨ ${product.nombre} - Cantidad actualizada`);
    } else {
        cartItems.push({
            id: product.id,
            brand: product.marca || 'Outlet',
            name: product.nombre,
            size: 'Única',
            color: 'Estándar',
            price: product.precioFinal || product.precioVenta || 0,
            quantity: 1,
            image: product.imagenPrincipal || 'https://placehold.co/300x300?text=Sin+Imagen',
            dateAdded: new Date().toISOString()
        });
        showNotification(`✨ ${product.nombre} añadido al carrito`);
    }

    saveCart();
    renderCart();
    renderUpsell(); // Actualizar upsell después de agregar
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
    document.querySelectorAll('.outlet-btn-danger[data-id]').forEach(btn => {
        btn.removeEventListener('click', handleRemove);
        btn.addEventListener('click', handleRemove);
    });
}

/**
 * Handle increment quantity
 */
function handleIncrement(e) {
    const id = e.currentTarget.getAttribute('data-id');
    const item = cartItems.find(i => i.id === id);
    if (item) {
        // Verificar disponibilidad
        const product = getProductById(id);
        if (product && product.estado === 'agotado') {
            showNotification('❌ Producto agotado, no se puede aumentar', true);
            return;
        }
        item.quantity++;
        saveCart();
        renderCart();
    }
}

/**
 * Handle decrement quantity
 */
function handleDecrement(e) {
    const id = e.currentTarget.getAttribute('data-id');
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
    const id = e.currentTarget.getAttribute('data-id');
    const item = cartItems.find(i => i.id === id);
    cartItems = cartItems.filter(i => i.id !== id);
    saveCart();
    renderCart();
    renderUpsell(); // Actualizar upsell después de eliminar
    showNotification(`🗑 ${item?.name || 'Producto'} eliminado del carrito`);
}

// ========================================
// INYECCIÓN DE HTML
// ========================================

/**
 * INYECTA EL HTML DEL CARRITO PARA CUSTOMER
 */
function injectCartHTML() {
    if (document.getElementById('cartItemsContainerCustomer')) {
        console.log('✅ El HTML del carrito ya está en el DOM');
        return true;
    }

    console.log('📄 Inyectando HTML del carrito para CUSTOMER...');

    const appContainer = document.getElementById('app') ||
        document.getElementById('main-content') ||
        document.querySelector('main') ||
        document.body;

    const cartHTML = `
        <main class="outlet-cart-container">
            <div class="container">
                <!-- Page Title -->
                <div class="outlet-cart-header">
                    <h1 class="outlet-cart-title">TU CARRITO</h1>
                    <div class="outlet-cart-title-underline"></div>
                </div>

                <!-- Main Grid: Cart Items + Summary -->
                <div class="outlet-cart-grid">
                    <!-- Cart Items Column -->
                    <div class="outlet-cart-items-col">
                        <div class="outlet-cart-items" id="cartItemsContainerCustomer">
                            <!-- Cart items injected dynamically -->
                        </div>
                    </div>

                    <!-- Summary Column -->
                    <div class="outlet-cart-summary-col">
                        <div class="outlet-cart-summary" id="orderSummaryContainerCustomer">
                            <!-- Summary injected dynamically -->
                        </div>
                    </div>
                </div>

                <!-- You May Also Like Section -->
                <section class="outlet-cart-upsell">
                    <h2 class="outlet-cart-upsell-title">TE PODRÍA INTERESAR</h2>
                    <div class="outlet-cart-upsell-grid" id="upsellGridCustomer">
                        <!-- Upsell items injected dynamically -->
                    </div>
                </section>
            </div>
        </main>
    `;

    appContainer.innerHTML = cartHTML;

    const hasContainers = document.getElementById('cartItemsContainerCustomer') !== null;
    console.log(`✅ Contenedores creados: ${hasContainers}`);

    return hasContainers;
}

// ========================================
// CONTROLLER PRINCIPAL
// ========================================

export async function cartCustomerController() {
    console.log('🛒 Cart Controller CUSTOMER - Página del carrito (con Firebase)');

    const htmlInjected = injectCartHTML();
    if (!htmlInjected) {
        console.error('❌ Error al inyectar el HTML');
        return;
    }

    loadStyles();

    // Cargar productos desde Firebase
    await loadAllProducts();

    // Load cart data
    loadCart();

    // Render cart
    renderCart();

    // Render upsell
    renderUpsell();

    // Update cart badge
    updateCartBadge();

    console.log('✅ Cart page CUSTOMER loaded successfully');
}