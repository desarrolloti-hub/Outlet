/* ========================================
   HOME CONTROLLER - CUSTOMER 
   (CARGA PRODUCTOS DESDE FIREBASE - SIN PROTECCIÓN)
   ✅ USA getAll CON FILTROS EN MEMORIA
   ✅ SIN PROTECCIÓN PARA CARRITO Y LISTA DE DESEOS
   ✅ CON NOTIFICACIONES FCM
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
// CONSTANTES DE STORAGE - UNIFICADAS
// ============================================
const STORAGE_KEYS = {
    CART: 'outlet_cart',
    WISHLIST: 'outlet_wishlist'
};

const ALL_PRODUCTS_LIMIT = 1000;

// ============================================
// VARIABLES DE ESTADO
// ============================================
let currentCategoryFilter = null;
let allProductsCache = [];

// ============================================
// FUNCIÓN PRINCIPAL - EXPORTADA
// ============================================
export async function homeCustomerController() {
    console.log('🏠 Home Controller CUSTOMER - Con datos desde Firebase (sin protección)');

    await loadAllProducts();

    loadHeroImage();
    await loadCategories();
    applyOutletModeFromUrl();
    applyCategoryFromUrl();
    renderFlashSale();
    renderTrending();
    loadGallery();
    initTimer();
    initCartEvents();
    initProductCardNavigation();
    initScrollReveal();
    initMagneticButtons();
    initNumberGlow();
    initCouponButton();
    initShopButtons();
    initCategoryScroll();
    initRefreshButton();
    setupRealtimeUpdates();

    // 🔥 EXPONER FUNCIONES GLOBALMENTE PARA QUE OTROS CONTROLADORES LAS USEN
    window.addToCart = addToCart;
    window.addToCartWithData = addToCartWithData;
    window.toggleWishlist = toggleWishlist;
    window.toggleWishlistWithData = toggleWishlistWithData;
    window.getProductFromCard = getProductFromCard;
    window.updateCartBadge = updateCartBadge;
    window.updateWishlistBadge = updateWishlistBadge;
    window.allProductsCache = allProductsCache;
    window.showToast = showToast;

    // 🆕 INICIALIZAR NOTIFICACIONES
    initNotifications();

    console.log('✅ Home Controller CUSTOMER listo');
    console.log('🌐 Funciones globales expuestas: addToCart, toggleWishlist, updateCartBadge, updateWishlistBadge, requestNotificationPermission');
}

// ============================================
// ✅ CARGAR TODOS LOS PRODUCTOS
// ============================================
async function loadAllProducts() {
    try {
        console.log('📦 Cargando todos los productos desde Firebase...');
        allProductsCache = await ProductService.getAll({}, 'createdAt', 'desc', ALL_PRODUCTS_LIMIT);
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
    const container = document.getElementById('flash-sale-container-customer');
    if (!container) {
        console.warn('⚠️ flash-sale-container-customer no encontrado');
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
                <div class="product-card" data-id="${p.id}" data-product='${JSON.stringify({
                id: p.id,
                nombre: p.nombre,
                marca: p.marca || '',
                precio: p.precioVenta || 0,
                precioFinal: finalPrice,
                imagen: imgSrc,
                categoria: p.categoria || '',
                descuento: discount
            })}'>
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
function sortProductsForOutlet(products, sortValue) {
    const normalized = [...products];
    const toPrice = (product) => Number(product.precioFinal ?? product.precioVenta ?? 0);

    switch (sortValue) {
        case 'price-asc':
            normalized.sort((a, b) => toPrice(a) - toPrice(b));
            break;
        case 'price-desc':
            normalized.sort((a, b) => toPrice(b) - toPrice(a));
            break;
        case 'newest':
            normalized.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            break;
        case 'discount':
            normalized.sort((a, b) => (b.porcentajeDescuento || 0) - (a.porcentajeDescuento || 0));
            break;
        default:
            normalized.sort((a, b) => Number(b.destacado || false) - Number(a.destacado || false));
            break;
    }

    return normalized;
}

function renderTrending(categoryFilter = null, options = {}) {
    const container = document.getElementById('trending-container-customer');
    if (!container) {
        console.warn('⚠️ trending-container-customer no encontrado');
        return;
    }

    try {
        let products = [];
        const showAllProducts = options.showAllProducts === true;
        const selectedCategory = options.category || 'all';
        const sortValue = options.sort || 'featured';

        if (showAllProducts) {
            products = allProductsCache.filter(p => p.estado === 'activo');
            console.log(`📦 Todos los productos en Outlet: ${products.length}`);
        } else if (categoryFilter) {
            products = allProductsCache.filter(p => {
                return p.estado === 'activo' && matchesCategory(p, categoryFilter);
            });
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

        if (showAllProducts && selectedCategory !== 'all') {
            products = products.filter((p) => {
                const productCategory = normalizeCategoryValue(p.categoria || p.genero || 'general');
                return productCategory === normalizeCategoryValue(selectedCategory);
            });
        }

        products = sortProductsForOutlet(products, sortValue);

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-box-open" style="font-size: 40px; color: #999; margin-bottom: 12px; display: block;"></i>
                    <p style="color: #666;">${categoryFilter ? `No hay productos en "${categoryFilter}"` : 'No hay productos disponibles'}</p>
                    ${categoryFilter ? `<button onclick="document.getElementById('shopAllBtnCustomer')?.click()" style="margin-top: 12px; padding: 8px 24px; background: #ddab3b; border: none; border-radius: 30px; cursor: pointer; font-weight: 600;">Ver todos</button>` : ''}
                </div>
            `;
            container.setAttribute('data-loaded', 'true');
            return;
        }

        const outletCategories = [...new Set(allProductsCache
            .filter(p => p.estado === 'activo')
            .map(p => p.categoria || p.genero || 'General'))]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        const toolbar = showAllProducts ? `
            <div class="outlet-catalog-toolbar" style="grid-column: 1 / -1; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin: 0 0 24px; padding: 16px 18px; border: 1px solid rgba(205,167,82,0.35); background: linear-gradient(135deg, rgba(205,167,82,0.08), rgba(255,255,255,0.02)); border-radius: 18px; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <span style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8a6a1b; font-weight: 700;">OUTLET</span>
                    <span style="font-size: 12px; color: #666;">${products.length} piezas</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #444; text-transform: uppercase; letter-spacing: 0.08em;">
                        <span>Categoría</span>
                        <select data-outlet-category-selector style="padding: 9px 12px; border: 1px solid #d9d2c2; border-radius: 10px; background: #fff; color: #1b1a19; min-width: 170px; font-size: 12px;">
                            <option value="all" ${selectedCategory === 'all' ? 'selected' : ''}>Todas</option>
                            ${outletCategories.map(cat => `<option value="${cat}" ${selectedCategory === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                        </select>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #444; text-transform: uppercase; letter-spacing: 0.08em;">
                        <span>Orden</span>
                        <select data-outlet-sort-selector style="padding: 9px 12px; border: 1px solid #d9d2c2; border-radius: 10px; background: #fff; color: #1b1a19; min-width: 170px; font-size: 12px;">
                            <option value="featured" ${sortValue === 'featured' ? 'selected' : ''}>Destacados</option>
                            <option value="price-asc" ${sortValue === 'price-asc' ? 'selected' : ''}>Precio: menor a mayor</option>
                            <option value="price-desc" ${sortValue === 'price-desc' ? 'selected' : ''}>Precio: mayor a menor</option>
                            <option value="discount" ${sortValue === 'discount' ? 'selected' : ''}>Mayor descuento</option>
                            <option value="newest" ${sortValue === 'newest' ? 'selected' : ''}>Más nuevos</option>
                        </select>
                    </label>
                </div>
            </div>
        ` : '';

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
                <div class="trending-item" data-id="${p.id}" data-product='${JSON.stringify({
                id: p.id,
                nombre: p.nombre,
                marca: p.marca || '',
                precio: p.precioVenta || 0,
                precioFinal: finalPrice,
                imagen: imgSrc,
                categoria: p.categoria || '',
                descuento: p.porcentajeDescuento || 0
            })}'>
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
                         ${p.categoria || 'Sin categoría'}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `${toolbar}${html}`;
        container.setAttribute('data-loaded', 'true');

        const categorySelector = container.querySelector('[data-outlet-category-selector]');
        const sortSelector = container.querySelector('[data-outlet-sort-selector]');

        if (categorySelector) {
            categorySelector.addEventListener('change', (event) => {
                renderTrending(null, {
                    showAllProducts: true,
                    category: event.target.value,
                    sort: sortSelector ? sortSelector.value : 'featured'
                });
            });
        }

        if (sortSelector) {
            sortSelector.addEventListener('change', (event) => {
                renderTrending(null, {
                    showAllProducts: true,
                    category: categorySelector ? categorySelector.value : 'all',
                    sort: event.target.value
                });
            });
        }

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
    const container = document.getElementById('categories-container-customer');
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
            const categoryKey = cat.slug || categoryName;

            return `
                <div class="category-item" data-category="${categoryName}" data-category-slug="${categoryKey}" style="cursor: pointer;">
                    <div class="circle-img">
                        <img alt="${cat.name}" src="${imgSrc}" loading="lazy"/>
                    </div>
                    <span>${cat.name}</span>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const categoryName = this.dataset.categorySlug || this.dataset.category;
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
function normalizeCategoryValue(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function matchesCategory(product, requestedCategory) {
    const target = normalizeCategoryValue(requestedCategory);
    if (!target) return false;

    const candidates = [
        product?.categoria,
        product?.category,
        product?.genero,
        product?.subcategoria,
        product?.name,
        product?.nombre
    ];

    return candidates.some(value => normalizeCategoryValue(value) === target);
}

async function applyOutletModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const outletMode = params.get('allProducts') === 'true' || params.get('outlet') === 'true';
    if (!outletMode) return;

    const sectionHeader = document.querySelector('.trending .section-header');
    const sectionTitle = document.querySelector('.trending .section-header h2');
    const sectionSubtitle = document.querySelector('.trending .section-header p');
    const shopAllBtn = document.getElementById('shopAllBtnCustomer');
    const sectionsToHide = document.querySelectorAll('.notification-banner, .category-nav, .hero, .flash-sale, .gallery');

    sectionsToHide.forEach(section => {
        if (section) {
            section.style.display = 'none';
        }
    });

    const trendingSection = document.querySelector('.trending');
    if (trendingSection) {
        trendingSection.style.display = 'block';
        trendingSection.style.marginTop = '24px';
    }

    if (sectionHeader) {
        sectionHeader.classList.add('outlet-page-header');
        sectionHeader.style.borderBottom = 'none';
        sectionHeader.style.textAlign = 'center';
    }

    if (sectionTitle) {
        sectionTitle.textContent = 'OUTLET';
        sectionTitle.classList.add('outlet-page-title');
        sectionTitle.style.color = '';
    }

    if (sectionSubtitle) {
        sectionSubtitle.textContent = 'Todos los productos disponibles';
        sectionSubtitle.classList.add('outlet-page-subtitle');
        sectionSubtitle.style.color = '';
    }

    if (shopAllBtn) {
        shopAllBtn.style.display = 'none';
    }

    renderTrending(null, { showAllProducts: true });
}

async function applyCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('allProducts') === 'true' || params.get('outlet') === 'true') return;
    const category = params.get('category');
    if (!category) return;
    filterByCategory(decodeURIComponent(category));
}

async function filterByCategory(categoryName) {
    const safeCategoryName = decodeURIComponent(String(categoryName || '')).trim();
    if (!safeCategoryName) return;

    console.log(`🔍 Filtrando por: "${safeCategoryName}"`);
    currentCategoryFilter = safeCategoryName;

    const sectionTitle = document.querySelector('.trending .section-header h2');
    const sectionSubtitle = document.querySelector('.trending .section-header p');
    const shopAllBtn = document.getElementById('shopAllBtnCustomer');

    // Resolve slug -> category name if possible
    let resolvedLabel = safeCategoryName;
    try {
        const catObj = await CategoryService.getBySlug(safeCategoryName);
        if (catObj && catObj.name) {
            resolvedLabel = catObj.name;
            console.log('🔗 Category slug resolved to name:', resolvedLabel);
        } else {
            const allCats = await CategoryService.getAll({}, true);
            const target = normalizeCategoryValue(safeCategoryName);
            const found = allCats.find(c => {
                const sName = normalizeCategoryValue(c.name || '');
                const sSlug = normalizeCategoryValue(c.slug || '');
                return sName === target || sSlug === target || sName.startsWith(target) || sSlug.startsWith(target) || target.startsWith(sName) || target.startsWith(sSlug);
            });
            if (found) {
                resolvedLabel = found.name;
                console.log('🔍 Category fuzzy-matched to:', resolvedLabel);
            }
        }
    } catch (e) {
        console.warn('⚠️ Error resolving category slug:', e.message);
    }

    if (sectionTitle) {
        sectionTitle.textContent = `👗 ${resolvedLabel}`;
    }

    if (sectionSubtitle) {
        sectionSubtitle.textContent = `Productos en ${resolvedLabel}`;
    }

    if (shopAllBtn) {
        shopAllBtn.style.display = 'inline-flex';
        shopAllBtn.textContent = 'Ver todos';
    }

    renderTrending(resolvedLabel);

    const trendingSection = document.querySelector('.trending');
    if (trendingSection) {
        setTimeout(() => {
            trendingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}

// ============================================
// ✅ FUNCIONES DE CARRITO Y WISHLIST - UNIFICADAS
// ============================================

/**
 * Obtener producto completo desde la card (con todos los datos)
 */
function getProductFromCard(card) {
    const productDataAttr = card.dataset.product;
    if (productDataAttr) {
        try {
            return JSON.parse(productDataAttr);
        } catch (e) {
            console.warn('Error parseando data-product:', e);
        }
    }

    // Fallback: extraer datos básicos
    const nameEl = card.querySelector('.product-name');
    const priceEl = card.querySelector('.price-current');
    const imgEl = card.querySelector('img');

    return {
        id: card.dataset.id || Date.now(),
        nombre: nameEl?.textContent || 'Producto',
        precio: parseInt(priceEl?.textContent?.replace(/[^0-9]/g, '') || 0),
        imagen: imgEl?.src || 'https://placehold.co/300x300?text=Sin+Imagen',
        marca: '',
        categoria: '',
        descuento: 0
    };
}

/**
 * Agregar al carrito - UNIFICADO con outlet_cart
 */
function addToCart(productId) {
    console.log('🛒 addToCart llamado con productId:', productId);

    // Buscar el producto en el cache
    const product = allProductsCache.find(p => String(p.id) === String(productId));

    if (!product) {
        console.warn('⚠️ Producto no encontrado en cache:', productId);
        // Intentar obtener de la card
        const card = document.querySelector(`.product-card[data-id="${productId}"], .trending-item[data-id="${productId}"]`);
        if (card) {
            const fallbackProduct = getProductFromCard(card);
            addToCartWithData(fallbackProduct);
            return;
        }
        showToast('⚠️ Producto no encontrado', 'error');
        return;
    }

    // Crear objeto con estructura completa
    const cartProduct = {
        id: product.id,
        brand: product.marca || 'Outlet',
        name: product.nombre,
        size: 'Única',
        color: 'Estándar',
        price: product.precioFinal || product.precioVenta || 0,
        quantity: 1,
        image: product.imagenPrincipal || 'https://placehold.co/300x300?text=Sin+Imagen',
        dateAdded: new Date().toISOString()
    };

    addToCartWithData(cartProduct);
}

/**
 * Agregar al carrito con datos estructurados
 */
function addToCartWithData(productData) {
    console.log('🛒 addToCartWithData:', productData);

    // Usar la clave UNIFICADA
    let cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');

    const existingItem = cart.find(item => String(item.id) === String(productData.id));

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
        showToast(`🛒 ${productData.name} - Cantidad actualizada a ${existingItem.quantity}`);
    } else {
        const cartItem = {
            id: productData.id,
            brand: productData.marca || 'Outlet',
            name: productData.nombre || productData.name,
            size: 'Única',
            color: 'Estándar',
            price: productData.precioFinal || productData.precio || productData.price || 0,
            quantity: 1,
            image: productData.imagenPrincipal || productData.imagen || 'https://placehold.co/300x300?text=Sin+Imagen',
            dateAdded: new Date().toISOString()
        };
        cart.push(cartItem);
        showToast(`✨ ${cartItem.name} agregado al carrito`);
    }

    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));

    // Disparar eventos para actualizar badges
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    document.dispatchEvent(new CustomEvent('cartUpdated'));

    // Actualizar badge en navbar
    updateCartBadge();
}

/**
 * Toggle wishlist - UNIFICADO con outlet_wishlist
 */
function toggleWishlist(button, productId) {
    console.log('❤️ toggleWishlist llamado con productId:', productId);

    // Buscar el producto en el cache
    const product = allProductsCache.find(p => String(p.id) === String(productId));

    if (!product) {
        console.warn('⚠️ Producto no encontrado:', productId);
        // Intentar obtener de la card
        const card = document.querySelector(`.product-card[data-id="${productId}"], .trending-item[data-id="${productId}"]`);
        if (card) {
            const fallbackProduct = getProductFromCard(card);
            toggleWishlistWithData(button, fallbackProduct);
            return;
        }
        showToast('⚠️ Producto no encontrado', 'error');
        return;
    }

    // Crear objeto con estructura completa
    const wishlistProduct = {
        id: product.id,
        brand: product.marca || 'Outlet',
        name: product.nombre,
        price: product.precioFinal || product.precioVenta || 0,
        image: product.imagenPrincipal || 'https://placehold.co/300x300?text=Sin+Imagen',
        badge: product.porcentajeDescuento > 0 ? `-${product.porcentajeDescuento}%` : null,
        badgeType: product.porcentajeDescuento > 0 ? 'danger' : null
    };

    toggleWishlistWithData(button, wishlistProduct);
}

/**
 * Toggle wishlist con datos estructurados
 */
function toggleWishlistWithData(button, productData) {
    console.log('❤️ toggleWishlistWithData:', productData);

    // Usar la clave UNIFICADA
    let wishlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');

    const exists = wishlist.some(item => String(item.id) === String(productData.id));
    const icon = button?.querySelector('i');

    if (exists) {
        wishlist = wishlist.filter(item => String(item.id) !== String(productData.id));
        if (icon) {
            icon.style.color = '#666';
            icon.style.transition = 'all 0.3s';
            icon.style.transform = 'scale(0.8)';
            setTimeout(() => { icon.style.transform = 'scale(1)'; }, 300);
        }
        showToast(`💔 ${productData.nombre || productData.name} removido de favoritos`);
    } else {
        const wishlistItem = {
            id: productData.id,
            brand: productData.marca || 'Outlet',
            name: productData.nombre || productData.name,
            price: productData.precioFinal || productData.precio || productData.price || 0,
            image: productData.imagenPrincipal || productData.imagen || 'https://placehold.co/300x300?text=Sin+Imagen',
            badge: productData.descuento > 0 ? `-${productData.descuento}%` : null,
            badgeType: productData.descuento > 0 ? 'danger' : null,
            dateAdded: new Date().toISOString()
        };
        wishlist.push(wishlistItem);
        if (icon) {
            icon.style.color = '#ddab3b';
            icon.style.transition = 'all 0.3s';
            icon.style.transform = 'scale(1.3)';
            setTimeout(() => { icon.style.transform = 'scale(1)'; }, 300);
        }
        showToast(`❤️ ${wishlistItem.name} agregado a favoritos`);
    }

    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));

    // Disparar eventos para actualizar badges
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    document.dispatchEvent(new CustomEvent('wishlistUpdated'));

    // Actualizar badge en navbar
    updateWishlistBadge();
}

/**
 * Actualizar badge del carrito
 */
function updateCartBadge() {
    try {
        const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

        const badge = document.querySelector('.cart-count, #cartCount');
        if (badge) {
            if (total > 0) {
                badge.style.display = 'inline-block';
                badge.textContent = total;
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error actualizando badge del carrito:', error);
    }
}

/**
 * Actualizar badge del wishlist
 */
function updateWishlistBadge() {
    try {
        const wishlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
        const count = wishlist.length;

        const badge = document.querySelector('.wishlist-count, #wishlistCount');
        if (badge) {
            if (count > 0) {
                badge.style.display = 'inline-block';
                badge.textContent = count;
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error actualizando badge del wishlist:', error);
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
    const container = document.getElementById('gallery-container-customer');
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
    const timerDisplay = document.getElementById('timerDisplayCustomer');
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
    // Evento para agregar al carrito
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-cart');
        if (addBtn) {
            e.stopPropagation();
            e.preventDefault();

            const productId = addBtn.dataset.cartAction;
            if (productId) {
                addToCart(productId);
            } else {
                const productCard = addBtn.closest('.trending-item') || addBtn.closest('.product-card');
                if (productCard && productCard.dataset.id) {
                    addToCart(productCard.dataset.id);
                }
            }
        }
    });

    // Evento para wishlist
    document.addEventListener('click', (e) => {
        const wishlistBtn = e.target.closest('.wishlist-btn');
        if (wishlistBtn) {
            e.preventDefault();
            e.stopPropagation();

            const productId = wishlistBtn.dataset.wishlistAction;
            if (productId) {
                toggleWishlist(wishlistBtn, productId);
            } else {
                const productCard = wishlistBtn.closest('.trending-item') || wishlistBtn.closest('.product-card');
                if (productCard && productCard.dataset.id) {
                    toggleWishlist(wishlistBtn, productCard.dataset.id);
                }
            }
        }
    });
}

function initProductCardNavigation() {
    document.addEventListener('click', (event) => {
        if (event.target.closest('.add-cart, .wishlist-btn')) return;

        const card = event.target.closest('.trending-item, .product-card');
        if (!card) return;

        const productId = card.dataset.id;
        if (!productId) return;

        event.preventDefault();
        event.stopPropagation();

        const url = new URL(`/productsCustomer/${encodeURIComponent(productId)}`, window.location.origin);
        window.location.href = url.pathname;
    });
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
        max-width: 90%;
        text-align: center;
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
    const couponBtn = document.getElementById('claimRewardsBtnCustomer');
    if (couponBtn) {
        couponBtn.addEventListener('click', () => {
            showToast('🎫 Cupón aplicado: $20 OFF');
            navigator.clipboard.writeText('OUTLET20');
        });
    }
}

function initShopButtons() {
    const shopNowBtn = document.getElementById('shopNowBtnCustomer');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            document.querySelector('.trending')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const shopAllBtn = document.getElementById('shopAllBtnCustomer');
    if (shopAllBtn) {
        shopAllBtn.addEventListener('click', function (e) {
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
// 🔔 FUNCIONES PARA NOTIFICACIONES (NUEVO)
// ============================================

/**
 * Verificar el estado de las notificaciones
 */
function getNotificationStatus() {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

/**
 * Mostrar u ocultar el banner según el estado de las notificaciones
 */
function handleNotificationBanner() {
    const banner = document.getElementById('notificationBanner');
    if (!banner) return;

    const status = getNotificationStatus();

    // Si ya tiene permisos o no soporta, ocultar banner
    if (status === 'granted' || status === 'unsupported') {
        banner.style.display = 'none';
        return;
    }

    // Si está denegado, ocultar (el usuario ya dijo que no)
    if (status === 'denied') {
        banner.style.display = 'none';
        return;
    }

    // Si es 'default' (no preguntado), mostrar banner
    if (status === 'default') {
        // Verificar si ya fue descartado antes
        const dismissed = localStorage.getItem('notifications_dismissed');
        if (dismissed === 'true') {
            banner.style.display = 'none';
            return;
        }
        banner.style.display = 'block';
        return;
    }

    banner.style.display = 'none';
}

/**
 * Solicitar permiso para notificaciones
 */
async function requestNotificationPermission() {
    try {
        if (!('Notification' in window)) {
            showToast('⚠️ Este navegador no soporta notificaciones');
            return false;
        }

        // Si ya está concedido, no hacer nada
        if (Notification.permission === 'granted') {
            showToast('✅ Ya tienes notificaciones activadas');
            return true;
        }

        // Si está denegado, no se puede hacer nada
        if (Notification.permission === 'denied') {
            showToast('❌ Las notificaciones están bloqueadas. Cambia esto en la configuración del navegador.');
            return false;
        }

        // Solicitar permiso
        showToast('⏳ Solicitando permiso de notificaciones...');
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            showToast('✅ ¡Notificaciones activadas! Recibirás ofertas exclusivas.');
            
            // Ocultar banner
            const banner = document.getElementById('notificationBanner');
            if (banner) banner.style.display = 'none';

            // Guardar que se aceptó
            localStorage.setItem('notifications_dismissed', 'false');

            // Intentar obtener el FCM token
            await getAndSaveFCMToken();

            return true;
        } else {
            showToast('⚠️ No se activaron las notificaciones. Puedes activarlas después.');
            return false;
        }
    } catch (error) {
        console.error('❌ Error solicitando permiso de notificaciones:', error);
        showToast('❌ Error al solicitar permisos');
        return false;
    }
}

/**
 * Obtener y guardar el FCM token
 */
async function getAndSaveFCMToken() {
    try {
        // Verificar que el SW esté registrado
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Workers no soportados');
            return null;
        }

        const registration = await navigator.serviceWorker.ready;
        if (!registration) {
            console.warn('⚠️ Service Worker no registrado');
            return null;
        }

        // Verificar que Firebase esté disponible
        if (typeof firebase === 'undefined' || !firebase.messaging) {
            console.warn('⚠️ Firebase no está disponible');
            return null;
        }

        const messaging = firebase.messaging();
        
        // Intentar obtener el token
        try {
            const token = await messaging.getToken({
                vapidKey: 'BI6q0uN0xXzY9wL8vM7nB6vC5xZ4aA3sS2dD1fF0gG9hH8jJ7kK6lL5mM4nN3oO2pP1qQ0rR'
            });
            
            if (token) {
                console.log('📱 FCM Token obtenido:', token);
                localStorage.setItem('fcm_token', token);
                return token;
            }
        } catch (tokenError) {
            console.warn('⚠️ Error obteniendo token:', tokenError);
        }

        return null;
    } catch (error) {
        console.error('❌ Error obteniendo FCM token:', error);
        return null;
    }
}

/**
 * Inicializar eventos de notificaciones
 */
function initNotificationEvents() {
    // Botón para activar notificaciones
    const enableBtn = document.getElementById('enableNotificationsBtn');
    if (enableBtn) {
        enableBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await requestNotificationPermission();
        });
    }

    // Botón para descartar banner
    const dismissBtn = document.getElementById('dismissNotificationsBtn');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const banner = document.getElementById('notificationBanner');
            if (banner) {
                banner.style.display = 'none';
                localStorage.setItem('notifications_dismissed', 'true');
                showToast('📌 Puedes activar las notificaciones después en la configuración');
            }
        });
    }
}

/**
 * Inicializar sistema de notificaciones
 */
function initNotifications() {
    console.log('🔔 Inicializando sistema de notificaciones...');
    
    // Esperar a que el DOM esté listo
    setTimeout(() => {
        handleNotificationBanner();
        initNotificationEvents();
        
        // Si ya tiene permisos, obtener token
        if (getNotificationStatus() === 'granted') {
            setTimeout(() => {
                getAndSaveFCMToken();
            }, 1000);
        }
    }, 500);
}

// ============================================
// INICIALIZAR BADGES AL CARGAR
// ============================================
function initBadges() {
    setTimeout(() => {
        updateCartBadge();
        updateWishlistBadge();
    }, 300);
}

// ============================================
// ESTILOS BASE
// ============================================
if (!document.querySelector('#outlet-styles-customer')) {
    const style = document.createElement('style');
    style.id = 'outlet-styles-customer';
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

// Inicializar badges
initBadges();

// ============================================
// EXPONER FUNCIONES DE NOTIFICACIONES GLOBALMENTE
// ============================================
window.requestNotificationPermission = requestNotificationPermission;
window.getAndSaveFCMToken = getAndSaveFCMToken;