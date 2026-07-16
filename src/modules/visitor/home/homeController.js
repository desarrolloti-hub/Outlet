/* ========================================
   HOME CONTROLLER - OUTLET (VERSIÓN FUNCIONAL CON PROTECCIÓN VISITOR)
   ✅ USA getAll CON FILTROS EN MEMORIA
   ✅ PROTECCIÓN PARA CARRITO Y LISTA DE DESEOS (TODOS LOS LUGARES)
   ✅ REDIRECCIÓN SOLO A /createAccount PARA VISITOR
   ✅ CORREGIDO: LISTA DE DESEOS AHORA REDIRIGE CORRECTAMENTE
   ======================================== */

import { ProductService } from '../../../services/productService.js';
import { CategoryService } from '../../../services/categoryService.js';
import { CacheService, STORES } from '../../../services/cacheService.js';

// URLs de imágenes de respaldo
const FALLBACK_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCLtfxBJHzGNyW7S2r8PW8UQEHi3Z95AiwvvvFcgXN_hNFljU5xDClu2lssWY6IbYEC4edbKUKNLGf7qG2g2XSS4FKM6nBHZywoiZuPnRqFcOkZlGNNFXKBx-BOGn6ur_pJ3V2ou-YtZhJS9jasGgca3Zn3XDpIif4NDtVf20VhbnwMPBays54-jz3tg7jaRI521AMak_IjSPuW2oGrwBe4CRuUM9Nd0nNJhP3FAVFYozcs1fUdWID0FIqEoDpFZM8y7uhZGL5WyTPA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDyrTXSUlcmOYzW27UEkvX2vqNni8uwPo95DIHp7MKUTmqkwuf-xcE1Cfdw98tztp8CBY3lAizz1mDcgp2yOOb0MorWuE5Q4ejnmw3LIwW8ECiWkgCclFwhlZyflfDlz-JXRQkQU4q2WpHwqKPla73kSktxwSVds1R6AjRYI79O8MCVS2xiHFz_ixrDHa7DQnvhzcuswyE0Qs7kgpUq4M66-9xZtuttgvpNz1BVU2Pqpc6nI9IFlPUzdEOJpR79Wsq24K_JtU0j_pnL",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDZqg3PhiQcyPx9qvbvfRC7iQUY952pX3kM5GkXqJXvUdnbSGwDAOUdqna-ep1_T6oRUpFfk8bfIfOD_y0Ux9cQj-zbgL8GWutPS_fBYwWEMNoDF0GJ2tI5X-1hmVWVAVrzredmlqqQ2VJ05aYRgCYFx8uz5JWXwf12Nmzw6w-ZU6LDThAOCZVruPAxD72MY9PVJDC-nX_Pjt8syhhFzqz2CHSKem0ME6wcYcNizQ948Dv5vOWrgqBgnp89rvOw3Yrv-Ll4uTmZeuXJ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD_3Ij40424nqgJFCW2yBcK53AfVxMBGiMbJQYwtb7TXulhSxa7uQsKmiF0wk44t4Wq1fw2V_fgTaDPBt3zp4euiIQEylGLlfZE1ZugUSpH48o1KyxbRUqYknBEQwIKa73Py03gadN-tdKIrgtqDDLlBOCcYLvBpQL6fgyS0c9a6jdQE7mA2JGU_QnCD8KxV6RWFxeWcgKKRQfXexsVEDkNnkqVzkyWRugED0o306tf4TyKNqZg59KDes7wAtJ02Q9xUXk8dcHit2GF",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAPFf8lNofT1q78NB41yKwRRLZIH_2qgXBAq41knEh1IRAOTYVtb5pSj9uC_BoSANE_vvL3NjBudbzdDs_rK2a7D47lzs_EM4Y009_X_9fBNVt_kk4fjm7_oZrdpBloAlZ7iTl6-QuSIn4dbbo_N2_IxU6MwtcKkXO8dIUgym2_jP3TUkYQ8fxSu4-JO3fysyRCGjF6667mopg-nCZTmAEl9dZaOCfy5BKxqMbFnJhtKdEsBfxbTsegNRRZHpyHwlJrIQV6YnTpmQ_b",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAMLUpsb4z_kmPPRr7SNFmJzhQca6vRy9f6mYTZXfeN2DveISlKOiLdPMR9YXJs76KL_XkI_IGvLMIbAycg5TV0TqRM9lGKCaIsYioaInmOMgayFC_p68Lgqn5rtzqcfFpBJG4a-9SYRXh8lROsm5UCwfNulB9Q7TlSNr09Cys6e-9ply60QBkaCJ-33WcZuT6AV7HVOYWj-dH0cQyvpdnuuEC54nq40GNV72x2B34D_mfuANqKA4XKWXjM0DgACe5ThWYMCqnC2j51"
];

const GALLERY_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDZqg3PhiQcyPx9qvbvfRC7iQUY952pX3kM5GkXqJXvUdnbSGwDAOUdqna-ep1_T6oRUpFfk8bfIfOD_y0Ux9cQj-zbgL8GWutPS_fBYwWEMNoDF0GJ2tI5X-1hmVWVAVrzredmlqqQ2VJ05aYRgCYFx8uz5JWXwf12Nmzw6w-ZU6LDThAOCZVruPAxD72MY9PVJDC-nX_Pjt8syhhFzqz2CHSKem0ME6wcYcNizQ948Dv5vOWrgqBgnp89rvOw3Yrv-Ll4uTmZeuXJ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCLtfxBJHzGNyW7S2r8PW8UQEHi3Z95AiwvvvFcgXN_hNFljU5xDClu2lssWY6IbYEC4edbKUKNLGf7qG2g2XSS4FKM6nBHZywoiZuPnRqFcOkZlGNNFXKBx-BOGn6ur_pJ3V2ou-YtZhJS9jasGgca3Zn3XDpIif4NDtVf20VhbnwMPBays54-jz3tg7jaRI521AMak_IjSPuW2oGrwBe4CRuUM9Nd0nNJhP3FAVFYozcs1fUdWID0FIqEoDpFZM8y7uhZGL5WyTPA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAMLUpsb4z_kmPPRr7SNFmJzhQca6vRy9f6mYTZXfeN2DveISlKOiLdPMR9YXJs76KL_XkI_IGvLMIbAycg5TV0TqRM9lGKCaIsYioaInmOMgayFC_p68Lgqn5rtzqcfFpBJG4a-9SYRXh8lROsm5UCwfNulB9Q7TlSNr09Cys6e-9ply60QBkaCJ-33WcZuT6AV7HVOYWj-dH0cQyvpdnuuEC54nq40GNV72x2B34D_mfuANqKA4XKWXjM0DgACe5ThWYMCqnC2j51",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDBtNHClCvXICohUTSHXDeCbNbys5DdAaT7Q-uEaHIWRwxLm9yovNIk2a5I35QNryWCMgMx7jW6-OcTq9Xx0tLOSAVolnEbxKWfFWFlKQdyKr_xAuMLnSUkYK7nrKWtka7eHTgkVPsuAe7qa8I44o1OHxQcIIfkGjmwdgeWxV_lshwAJ4AxzMiiTbZlXQeODlvTckTjwJep1vka771QFHUaRX9ea8g-plsgl7sxU6J7ojEjJjV5GBf7pMwBzOwOVmWysLX8FRQef6ev"
];

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDBtNHClCvXICohUTSHXDeCbNbys5DdAaT7Q-uEaHIWRwxLm9yovNIk2a5I35QNryWCMgMx7jW6-OcTq9Xx0tLOSAVolnEbxKWfFWFlKQdyKr_xAuMLnSUkYK7nrKWtka7eHTgkVPsuAe7qa8I44o1OHxQcIIfkGjmwdgeWxV_lshwAJ4AxzMiiTbZlXQeODlvTckTjwJep1vka771QFHUaRX9ea8g-plsgl7sxU6J7ojEjJjV5GBf7pMwBzOwOVmWysLX8FRQef6ev";

// ============================================
// VARIABLES DE ESTADO
// ============================================
let currentCategoryFilter = null;
let allProductsCache = [];

// ============================================
// FUNCIÓN PRINCIPAL - EXPORTADA
// ============================================
export async function homeController() {
    console.log('🏠 Home Controller - Versión Funcional con Protección Visitor');
    
    await loadAllProducts();
    
    loadHeroImage();
    await loadCategories();
    renderFlashSale();
    renderTrending();
    loadGallery();
    initTimer();
    initCartEvents();
    initScrollReveal();
    initMagneticButtons();
    initNumberGlow();
    initCouponButton();
    initShopButtons();
    initCategoryScroll();
    initRefreshButton();
    setupRealtimeUpdates();
    
    // ✅ Solo mantener protección para clics en header y enlaces
    initNavigationProtection();
    initHeaderProtection();
    initCartLinkProtection();
    
    console.log('✅ Home Controller listo');
}

// ============================================
// ✅ VERIFICACIÓN DE AUTENTICACIÓN
// ============================================
function isUserAuthenticated() {
    // Verifica si hay un usuario logueado en localStorage o session
    const user = localStorage.getItem('outlet_user');
    const session = sessionStorage.getItem('outlet_session');
    const userData = localStorage.getItem('userData');
    const sessionData = sessionStorage.getItem('sessionData');
    const token = localStorage.getItem('auth_token');
    const sessionToken = sessionStorage.getItem('auth_token');
    
    return !!(user || session || userData || sessionData || token || sessionToken);
}

// ============================================
// ✅ REDIRIGIR A CREATE ACCOUNT (SOLO VISITOR)
// ============================================
function redirectToCreateAccount() {
    console.log('🔒 Redirigiendo a /createAccount (usuario no autenticado)');
    
    const route = '/createAccount';
    
    // 1. Intentar con el router global
    if (window.router && typeof window.router.navigate === 'function') {
        window.router.navigate(route);
        showToast('🔒 Inicia sesión para usar esta función');
        return;
    }
    
    // 2. Intentar con el sistema de navegación de la aplicación
    if (window.App && window.App.router && typeof window.App.router.navigate === 'function') {
        window.App.router.navigate(route);
        showToast('🔒 Inicia sesión para usar esta función');
        return;
    }
    
    // 3. Intentar con el Router de la aplicación (si existe)
    if (window.Router && typeof window.Router.navigate === 'function') {
        window.Router.navigate(route);
        showToast('🔒 Inicia sesión para usar esta función');
        return;
    }
    
    // 4. Fallback: usar window.location.href
    window.location.href = route;
    showToast('🔒 Inicia sesión para usar esta función');
}

// ============================================
// ✅ PROTECCIÓN PARA RUTAS DIRECTAS
// ============================================
function initRouteProtection() {
    // Proteger rutas de carrito y wishlist
    const protectedRoutes = ['/cart', '/wishlist', '/cartCustomer', '/wishlistCustomer'];
    const currentPath = window.location.pathname || window.location.hash.replace('#', '');
    
    console.log('📍 Ruta actual:', currentPath);
    
    // Verificar si la ruta actual está protegida
    if (protectedRoutes.some(route => currentPath.includes(route))) {
        if (!isUserAuthenticated()) {
            console.log('🔒 Ruta protegida detectada, redirigiendo...');
            redirectToCreateAccount();
            return;
        }
    }
}

// ============================================
// ✅ PROTECCIÓN ESPECÍFICA PARA LISTA DE DESEOS
// ============================================
function initWishlistProtection() {
    console.log('🛡️ Inicializando protección para lista de deseos');
    
    // Buscar TODOS los enlaces que contengan "wishlist" o "favoritos"
    const wishlistLinks = document.querySelectorAll('a[href*="wishlist"], a[href*="favoritos"], a[href*="Wishlist"], a[href*="Favoritos"]');
    
    console.log(`🔗 Enlaces de wishlist encontrados: ${wishlistLinks.length}`);
    
    wishlistLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. href: ${link.getAttribute('href')}`);
        
        // Remover event listeners anteriores para evitar duplicados
        link.removeEventListener('click', handleWishlistLinkClick);
        link.addEventListener('click', handleWishlistLinkClick);
    });
    
    // También buscar elementos con clase o data attribute
    const wishlistElements = document.querySelectorAll('.wishlist-link, [data-wishlist-link], .favorite-link, [data-favorite-link]');
    
    wishlistElements.forEach((el, index) => {
        console.log(`  Elemento wishlist encontrado: ${el.tagName} ${el.className}`);
        el.removeEventListener('click', handleWishlistLinkClick);
        el.addEventListener('click', handleWishlistLinkClick);
    });
}

// ============================================
// ✅ MANEJADOR PARA CLICKS EN ENLACES DE WISHLIST
// ============================================
function handleWishlistLinkClick(e) {
    console.log('🎯 Click en enlace de wishlist detectado');
    
    if (!isUserAuthenticated()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('🔒 Usuario no autenticado, redirigiendo a createAccount');
        redirectToCreateAccount();
        return false;
    }
    
    console.log('✅ Usuario autenticado, permitiendo navegación');
    return true;
}

// ============================================
// ✅ PROTECCIÓN PARA ENLACES DEL CARRITO
// ============================================
function initCartLinkProtection() {
    console.log('🛡️ Inicializando protección para carrito');
    
    // Buscar TODOS los enlaces que contengan "cart" o "carrito"
    const cartLinks = document.querySelectorAll('a[href*="cart"], a[href*="carrito"], a[href*="Cart"], a[href*="Carrito"]');
    
    console.log(`🔗 Enlaces de carrito encontrados: ${cartLinks.length}`);
    
    cartLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. href: ${link.getAttribute('href')}`);
        
        link.removeEventListener('click', handleCartLinkClick);
        link.addEventListener('click', handleCartLinkClick);
    });
    
    // También buscar elementos con clase o data attribute
    const cartElements = document.querySelectorAll('.cart-link, [data-cart-link], .carrito-link, [data-carrito-link]');
    
    cartElements.forEach((el, index) => {
        console.log(`  Elemento carrito encontrado: ${el.tagName} ${el.className}`);
        el.removeEventListener('click', handleCartLinkClick);
        el.addEventListener('click', handleCartLinkClick);
    });
}

// ============================================
// ✅ MANEJADOR PARA CLICKS EN ENLACES DE CARRITO
// ============================================
function handleCartLinkClick(e) {
    console.log('🎯 Click en enlace de carrito detectado');
    
    if (!isUserAuthenticated()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('🔒 Usuario no autenticado, redirigiendo a createAccount');
        redirectToCreateAccount();
        return false;
    }
    
    console.log('✅ Usuario autenticado, permitiendo navegación');
    return true;
}

// ============================================
// ✅ MANEJAR CLICKS EN CARRITO (Botones de productos)
// ============================================
function handleCartClick(e) {
    const target = e.target.closest('[data-cart-action]');
    if (!target) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!isUserAuthenticated()) {
        redirectToCreateAccount();
        return;
    }
    
    // Si está autenticado, ejecuta la acción normal del carrito
    const productCard = target.closest('.trending-item, .product-card');
    const productName = productCard?.querySelector('.product-name')?.textContent || 'Producto';
    addToCart(productName);
    showToast(`✨ ${productName} agregado al carrito`);
    window.dispatchEvent(new CustomEvent('cart:updated'));
}

// ============================================
// ✅ MANEJAR CLICKS EN LISTA DE DESEOS (Botones de productos)
// ============================================
function handleWishlistClick(e) {
    const target = e.target.closest('[data-wishlist-action]');
    if (!target) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!isUserAuthenticated()) {
        redirectToCreateAccount();
        return;
    }
    
    // Si está autenticado, ejecuta la acción normal de wishlist
    const productCard = target.closest('.trending-item, .product-card');
    const productName = productCard?.querySelector('.product-name')?.textContent || 'Producto';
    toggleWishlist(target, productName);
}

// ============================================
// ✅ FUNCIÓN PARA TOGGLE WISHLIST
// ============================================
function toggleWishlist(button, productName) {
    let wishlist = JSON.parse(localStorage.getItem('outlet_wishlist') || '[]');
    const exists = wishlist.some(item => item.name === productName);
    
    const icon = button.querySelector('i');
    
    if (exists) {
        wishlist = wishlist.filter(item => item.name !== productName);
        if (icon) {
            icon.style.color = '#666';
            icon.style.transition = 'all 0.3s';
        }
        showToast(`💔 ${productName} removido de favoritos`);
    } else {
        wishlist.push({ 
            id: Date.now(), 
            name: productName, 
            date: new Date().toISOString() 
        });
        if (icon) {
            icon.style.color = '#ddab3b';
            icon.style.transition = 'all 0.3s';
        }
        showToast(`❤️ ${productName} agregado a favoritos`);
    }
    
    localStorage.setItem('outlet_wishlist', JSON.stringify(wishlist));
}

// ============================================
// ✅ PROTECCIÓN PARA HEADER (Iconos de carrito y wishlist)
// ============================================
function initHeaderProtection() {
    console.log('🛡️ Inicializando protección para header');
    
    // Buscar y proteger iconos del header
    const headerIcons = document.querySelectorAll('.header-cart, .header-wishlist, .cart-icon, .wishlist-icon, [data-header-cart], [data-header-wishlist]');
    
    headerIcons.forEach(icon => {
        icon.removeEventListener('click', handleHeaderIconClick);
        icon.addEventListener('click', handleHeaderIconClick);
    });
}

// ============================================
// ✅ MANEJADOR PARA CLICKS EN ICONOS DEL HEADER
// ============================================
function handleHeaderIconClick(e) {
    const element = this;
    
    // Verificar si es carrito o wishlist
    const isCart = element.classList.contains('header-cart') || 
                  element.classList.contains('cart-icon') || 
                  element.matches('[data-header-cart]');
    
    const isWishlist = element.classList.contains('header-wishlist') || 
                     element.classList.contains('wishlist-icon') || 
                     element.matches('[data-header-wishlist]');
    
    // También verificar si el icono está dentro de un enlace
    const parentLink = element.closest('a');
    if (parentLink) {
        const href = parentLink.getAttribute('href') || '';
        const isCartLink = href.includes('cart') || href.includes('carrito');
        const isWishlistLink = href.includes('wishlist') || href.includes('favoritos');
        
        if ((isCartLink || isWishlistLink) && !isUserAuthenticated()) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔒 Click en icono del header (no autenticado)');
            redirectToCreateAccount();
            return false;
        }
    }
    
    if ((isCart || isWishlist) && !isUserAuthenticated()) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔒 Click en icono del header (no autenticado)');
        redirectToCreateAccount();
        return false;
    }
}

// ============================================
// ✅ PROTECCIÓN PARA NAVEGACIÓN (Enlaces en el menú)
// ============================================
function initNavigationProtection() {
    console.log('🛡️ Inicializando protección para navegación');
    
    // Proteger enlaces a carrito y wishlist en el menú
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href') || '';
        
        // Verificar si es carrito o wishlist
        const isCart = href.includes('cart') || href.includes('carrito') || href.includes('Cart') || href.includes('Carrito');
        const isWishlist = href.includes('wishlist') || href.includes('favoritos') || href.includes('Wishlist') || href.includes('Favoritos');
        
        if ((isCart || isWishlist) && !isUserAuthenticated()) {
            console.log('🔒 Click en enlace de navegación protegido:', href);
            e.preventDefault();
            e.stopPropagation();
            redirectToCreateAccount();
            return false;
        }
    }, true); // Capturing phase
}

// ============================================
// ✅ CARGAR TODOS LOS PRODUCTOS
// ============================================
async function loadAllProducts() {
    try {
        console.log('📦 Cargando todos los productos desde Firebase...');
        allProductsCache = await ProductService.getAll({}, 'createdAt', 'desc', 100);
        console.log(`✅ ${allProductsCache.length} productos cargados`);
        
        if (allProductsCache.length > 0) {
            console.log('📋 Primeros productos:');
            allProductsCache.slice(0, 5).forEach(p => {
                console.log(`  - ${p.nombre} | Categoría: "${p.categoria}" | Descuento: ${p.porcentajeDescuento || 0}%`);
            });
            
            const categorias = [...new Set(allProductsCache.map(p => p.categoria))];
            console.log(`📋 Categorías disponibles: ${categorias.join(', ')}`);
        }
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        allProductsCache = [];
    }
}

// ============================================
// ✅ RENDERIZAR FLASH SALE
// ============================================
function renderFlashSale() {
    const container = document.getElementById('flash-sale-container');
    if (!container) {
        console.warn('⚠️ flash-sale-container no encontrado');
        return;
    }

    try {
        const flashProducts = allProductsCache
            .filter(p => p.porcentajeDescuento > 0 && p.estado === 'activo')
            .slice(0, 6);
        
        console.log(`📦 Productos en oferta: ${flashProducts.length}`);
        
        if (flashProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color: #666;">No hay productos en oferta disponibles</p>
                </div>
            `;
            container.setAttribute('data-loaded', 'true');
            return;
        }

        const html = flashProducts.map((p) => {
            const discount = p.porcentajeDescuento || 0;
            const finalPrice = p.precioFinal || p.precioVenta * (1 - discount / 100);
            const soldPercent = Math.floor(Math.random() * 60) + 20;
            const imgSrc = p.imagenPrincipal || 'https://placehold.co/300x300?text=Sin+Imagen';
            
            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="product-img">
                        <img src="${imgSrc}" alt="${p.nombre || 'Producto'}" loading="lazy"/>
                        <div class="sale-tag">-${discount}%</div>
                        <button class="wishlist-btn" data-wishlist-action="${p.id}" style="position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.9); border:none; border-radius:50%; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.3s; z-index:2;">
                            <i class="fas fa-heart" style="color:#666;"></i>
                        </button>
                    </div>
                    <h4 class="body-sm product-name">${p.nombre || 'Producto'}</h4>
                    <div class="price">
                        <span class="price-current">$${Math.round(finalPrice)}</span>
                        <span class="price-old">$${Math.round(p.precioVenta || 0)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <p class="body-sm sold-out-text">${soldPercent}% Vendido</p>
                    <button class="add-cart" data-cart-action="${p.id}" style="width:100%; margin-top:8px; padding:8px; background:#1f1b13; color:white; border:none; border-radius:4px; cursor:pointer; transition:all 0.3s;">
                        <i class="fas fa-cart-plus"></i> Agregar al carrito
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        container.setAttribute('data-loaded', 'true');

        setTimeout(() => {
            container.querySelectorAll('.progress-fill').forEach((bar, index) => {
                const soldPercent = Math.floor(Math.random() * 60) + 20;
                animateProgressBar(bar, soldPercent);
            });
        }, 300);

    } catch (error) {
        console.error('❌ Error renderizando ofertas:', error);
        container.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="color: #ef4444;">Error al cargar ofertas: ${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// ✅ RENDERIZAR TRENDING
// ============================================
function renderTrending(categoryFilter = null) {
    const container = document.getElementById('trending-container');
    if (!container) {
        console.warn('⚠️ trending-container no encontrado');
        return;
    }

    try {
        let products = [];
        
        if (categoryFilter) {
            const filterLower = categoryFilter.toLowerCase();
            products = allProductsCache.filter(p => 
                p.categoria && p.categoria.toLowerCase() === filterLower &&
                p.estado === 'activo'
            );
            console.log(`📦 Productos en "${categoryFilter}": ${products.length}`);
        } else {
            products = allProductsCache.filter(p => p.destacado && p.estado === 'activo');
            
            if (products.length < 5) {
                const destacadosIds = new Set(products.map(p => p.id));
                const adicionales = allProductsCache
                    .filter(p => !destacadosIds.has(p.id) && p.estado === 'activo')
                    .slice(0, 5 - products.length);
                products = [...products, ...adicionales];
            }
            console.log(`📦 Productos trending: ${products.length}`);
        }
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-box-open" style="font-size: 40px; color: #999; margin-bottom: 12px; display: block;"></i>
                    <p style="color: #666;">${categoryFilter ? `No hay productos en "${categoryFilter}"` : 'No hay productos disponibles'}</p>
                    ${categoryFilter ? `<button onclick="document.getElementById('shopAllBtn')?.click()" style="margin-top: 12px; padding: 8px 24px; background: #ddab3b; border: none; border-radius: 30px; cursor: pointer; font-weight: 600;">Ver todos</button>` : ''}
                </div>
            `;
            container.setAttribute('data-loaded', 'true');
            return;
        }

        const html = products.map(p => {
            let badge = '';
            if (p.destacado) {
                badge = '<span class="new-badge" style="background: #ddab3b;">DESTACADO</span>';
            } else if (p.porcentajeDescuento > 0) {
                badge = `<span class="new-badge" style="background: #ef4444;">-${p.porcentajeDescuento}%</span>`;
            }
            
            const rating = (4 + Math.random() * 0.9).toFixed(1);
            const reviews = Math.floor(Math.random() * 200) + 10;
            const imgSrc = p.imagenPrincipal || 'https://placehold.co/300x300?text=Sin+Imagen';
            const finalPrice = p.precioFinal || p.precioVenta;

            return `
                <div class="trending-item" data-id="${p.id}">
                    <div class="trending-img">
                        ${badge}
                        <img src="${imgSrc}" alt="${p.nombre || 'Producto'}" loading="lazy"/>
                        <button class="wishlist-btn" data-wishlist-action="${p.id}" style="position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.9); border:none; border-radius:50%; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.3s; z-index:2;">
                            <i class="fas fa-heart" style="color:#666;"></i>
                        </button>
                        <button class="add-cart" data-cart-action="${p.id}" style="position:absolute; bottom:8px; right:8px; background:rgba(31,27,19,0.9); color:white; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.3s; z-index:2;">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                    <h4 class="body-sm product-name">${p.nombre || 'Producto'}</h4>
                    <div class="price">
                        <span class="price-current">$${Math.round(finalPrice)}</span>
                        ${p.precioVenta > finalPrice ? `<span class="price-old">$${Math.round(p.precioVenta)}</span>` : ''}
                        <span class="body-sm rating">${rating} ★ (${reviews})</span>
                    </div>
                    <div style="font-size: 10px; color: #999; margin-top: 4px; text-align: center;">
                        📂 ${p.categoria || 'Sin categoría'}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        container.setAttribute('data-loaded', 'true');
        
        console.log(`✅ ${products.length} productos renderizados${categoryFilter ? ` para "${categoryFilter}"` : ''}`);

    } catch (error) {
        console.error('❌ Error renderizando productos:', error);
        container.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="color: #ef4444;">Error al cargar productos: ${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// ✅ CARGAR CATEGORÍAS
// ============================================
async function loadCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    try {
        console.log('🔄 Cargando categorías desde Firebase...');
        
        const categories = await CategoryService.getAll({}, true);
        
        if (!categories || categories.length === 0) {
            container.innerHTML = `<div class="category-empty" style="grid-column: 1/-1; text-align: center; padding: 20px;">No hay categorías disponibles</div>`;
            return;
        }

        console.log(`📋 ${categories.length} categorías cargadas`);
        categories.forEach(cat => console.log(`  - "${cat.name}"`));

        const displayCategories = categories.slice(0, 6);

        container.innerHTML = displayCategories.map((cat, idx) => {
            const imgSrc = cat.imageBase64 || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
            const categoryName = cat.name;
            
            return `
                <div class="category-item" data-category="${categoryName}" style="cursor: pointer;">
                    <div class="circle-img">
                        <img alt="${cat.name}" src="${imgSrc}" loading="lazy"/>
                    </div>
                    <span>${cat.name}</span>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const categoryName = this.dataset.category;
                console.log(`🔍 Click en categoría: "${categoryName}"`);
                filterByCategory(categoryName);
            });
        });

        console.log('✅ Categorías renderizadas');

    } catch (error) {
        console.error('❌ Error cargando categorías:', error);
        container.innerHTML = `
            <div class="category-error" style="grid-column: 1/-1; text-align: center; padding: 20px; color: red;">
                <p>Error al cargar categorías: ${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// ✅ FILTRAR PRODUCTOS POR CATEGORÍA
// ============================================
function filterByCategory(categoryName) {
    console.log(`🔍 Filtrando por: "${categoryName}"`);
    currentCategoryFilter = categoryName;
    
    const sectionTitle = document.querySelector('.trending .section-header h2');
    const sectionSubtitle = document.querySelector('.trending .section-header p');
    const shopAllBtn = document.getElementById('shopAllBtn');
    
    if (sectionTitle) {
        sectionTitle.textContent = `👗 ${categoryName}`;
    }
    
    if (sectionSubtitle) {
        sectionSubtitle.textContent = `Productos en ${categoryName}`;
    }
    
    if (shopAllBtn) {
        shopAllBtn.style.display = 'inline-flex';
        shopAllBtn.textContent = 'Ver todos';
    }
    
    renderTrending(categoryName);
    
    const trendingSection = document.querySelector('.trending');
    if (trendingSection) {
        setTimeout(() => {
            trendingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}

// ============================================
// ANIMACIONES Y EVENTOS
// ============================================

function animateProgressBar(element, target) {
    let current = 0;
    const duration = 1500;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        current = Math.floor(easeProgress * target);
        element.style.width = current + '%';
        
        const parent = element.closest('.product-card');
        const soldOutText = parent?.querySelector('.sold-out-text');
        if (soldOutText && current > 0) {
            if (current >= 85) {
                soldOutText.innerHTML = '🔥 ¡Casi agotado!';
            } else {
                soldOutText.innerHTML = `${current}% Vendido`;
            }
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

function loadGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    
    container.innerHTML = GALLERY_IMAGES.map((img, idx) => `
        <div class="gallery-item">
            <img alt="Galería ${idx + 1}" src="${img}" loading="lazy"/>
            <div class="gallery-overlay">
                <span class="label-caps">COMPRA ESTE LOOK</span>
            </div>
        </div>
    `).join('');
}

function loadHeroImage() {
    const heroImg = document.querySelector('.hero img');
    if (heroImg) {
        heroImg.src = HERO_IMAGE;
        heroImg.alt = "Hero Fashion";
    }
}

function initTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) return;
    
    let timeLeft = 2 * 3600 + 45 * 60 + 12;
    
    function updateTimerDisplay() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateTimerDisplay();
    
    const interval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerDisplay.textContent = "00:00:00";
            return;
        }
        timeLeft--;
        updateTimerDisplay();
    }, 1000);
}

function initCartEvents() {
    // Delegación de eventos para el carrito
    document.addEventListener('click', handleCartClick);
    
    // Delegación de eventos para la lista de deseos
    document.addEventListener('click', handleWishlistClick);
}

function addToCart(productName) {
    let cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
    cart.push({ id: Date.now(), name: productName, quantity: 1, date: new Date().toISOString() });
    localStorage.setItem('outlet_cart', JSON.stringify(cart));
}

function showToast(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: #1f1b13; color: white;
        padding: 12px 24px; border-radius: 40px; font-size: 13px;
        z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        border-left: 3px solid #ddab3b;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.product-card, .trending-item, .gallery-item, .category-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-coupon');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

function initNumberGlow() {
    const prices = document.querySelectorAll('.price-current');
    prices.forEach(price => {
        price.addEventListener('mouseenter', () => {
            price.style.textShadow = '0 0 10px rgba(221, 171, 59, 0.8)';
        });
        price.addEventListener('mouseleave', () => {
            price.style.textShadow = '';
        });
    });
}

function initCouponButton() {
    const couponBtn = document.getElementById('claimRewardsBtn');
    if (couponBtn) {
        couponBtn.addEventListener('click', () => {
            showToast('🎫 Cupón aplicado: $20 OFF');
            navigator.clipboard.writeText('OUTLET20');
        });
    }
}

function initShopButtons() {
    const shopNowBtn = document.getElementById('shopNowBtn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            document.querySelector('.trending')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    const shopAllBtn = document.getElementById('shopAllBtn');
    if (shopAllBtn) {
        shopAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔄 Mostrando todos los productos');
            
            currentCategoryFilter = null;
            
            const sectionTitle = document.querySelector('.trending .section-header h2');
            const sectionSubtitle = document.querySelector('.trending .section-header p');
            if (sectionTitle) sectionTitle.textContent = 'Trending Now';
            if (sectionSubtitle) sectionSubtitle.textContent = 'Top pieces curated for the season.';
            
            this.style.display = 'none';
            
            renderTrending(null);
            document.querySelector('.trending')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        shopAllBtn.style.display = 'none';
    }
}

function initCategoryScroll() {
    const nav = document.querySelector('.category-nav');
    if (!nav) return;
    
    nav.addEventListener('wheel', (e) => {
        if (e.target.closest('.category-grid')) {
            e.preventDefault();
            nav.scrollLeft += e.deltaY * 0.5;
        }
    }, { passive: false });
}

function initRefreshButton() {
    const refreshBtn = document.getElementById('refreshProductsBtn');
    if (!refreshBtn) return;
    
    refreshBtn.addEventListener('click', async () => {
        const icon = refreshBtn.querySelector('i');
        if (icon) {
            icon.style.transform = 'rotate(360deg)';
            icon.style.transition = 'transform 0.5s';
        }
        
        await CacheService.clearCache(STORES.PRODUCTS);
        await loadAllProducts();
        renderFlashSale();
        renderTrending(currentCategoryFilter);
        
        showToast('✅ Productos actualizados');
        
        setTimeout(() => {
            if (icon) {
                icon.style.transform = 'rotate(0deg)';
            }
        }, 500);
    });
}

function setupRealtimeUpdates() {
    window.addEventListener('products:updated', async (event) => {
        console.log('🔄 Actualizando productos en vivo...', event.detail);
        await CacheService.clearCache(STORES.PRODUCTS);
        await loadAllProducts();
        renderFlashSale();
        renderTrending(currentCategoryFilter);
        showToast(`🔄 Productos actualizados`);
    });
}

// ============================================
// ESTILOS BASE
// ============================================
if (!document.querySelector('#outlet-styles')) {
    const style = document.createElement('style');
    style.id = 'outlet-styles';
    style.textContent = `
        @keyframes slideUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .toast-notification { animation: slideUp 0.3s ease !important; }
        .product-img img, .trending-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .product-img, .trending-img {
            position: relative;
            overflow: hidden;
            aspect-ratio: 1 / 1;
        }
        .category-item {
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .category-item:hover {
            transform: scale(1.05);
        }
        .category-item .circle-img {
            transition: box-shadow 0.3s ease;
        }
        .category-item:hover .circle-img {
            box-shadow: 0 4px 20px rgba(221, 171, 59, 0.3);
        }
        .add-cart:hover {
            background: #ddab3b !important;
            color: #1f1b13 !important;
        }
        .wishlist-btn:hover {
            transform: scale(1.1);
        }
        .wishlist-btn:hover i {
            color: #ddab3b !important;
        }
    `;
    document.head.appendChild(style);
}