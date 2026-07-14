/* ========================================
   HOME CONTROLLER - OUTLET (SIN RECARGAS)
   ✅ CATEGORÍAS DINÁMICAS DESDE FIREBASE
   ======================================== */

import { ProductService } from '../../../services/productService.js';
import { CategoryService } from '../../../services/categoryService.js';
import { CacheService, STORES } from '../../../services/cacheService.js';

// URLs de imágenes de respaldo (para categorías sin imagen)
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
// FUNCIÓN PRINCIPAL - EXPORTADA
// ============================================
export async function homeController() {
    console.log('🏠 Home Controller - CATEGORÍAS DINÁMICAS DESDE FIREBASE');
    
    loadHeroImage();
    await loadCategories(); // ✅ Carga las 6 categorías desde Firebase
    await loadFlashSale();
    await loadTrending();
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
    
    console.log('✅ Home Controller listo');
}

// ============================================
// FUNCIONES ESTÁTICAS
// ============================================

function loadHeroImage() {
    const heroImg = document.querySelector('.hero img');
    if (heroImg) {
        heroImg.src = HERO_IMAGE;
        heroImg.alt = "Hero Fashion";
    }
}

// ============================================
// ✅ CARGAR CATEGORÍAS DINÁMICAS DESDE FIREBASE
// ============================================
async function loadCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    try {
        console.log('🔄 Cargando categorías desde Firebase...');
        
        // Obtener categorías de Firebase (sin caché para forzar actualización)
        const categories = await CategoryService.getAll({}, true);
        
        console.log('✅ Categorías cargadas desde Firebase:', categories.length);
        
        // Verificar que tenemos categorías
        if (!categories || categories.length === 0) {
            console.warn('⚠️ No hay categorías en Firebase');
            container.innerHTML = `
                <div class="category-empty" style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--text-secondary);">
                    <p>No hay categorías disponibles</p>
                </div>
            `;
            return;
        }

        // Tomar SOLO las primeras 6 categorías (o menos si hay menos)
        const displayCategories = categories.slice(0, 6);
        
        console.log(`📋 Mostrando ${displayCategories.length} categorías:`);
        displayCategories.forEach((cat, i) => console.log(`  ${i+1}. ${cat.name} (${cat.id})`));

        // Generar HTML para las categorías
        container.innerHTML = displayCategories.map((cat, idx) => {
            // Usar imagen en Base64 si existe, o fallback
            const imgSrc = cat.imageBase64 || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
            const urlSlug = cat.slug || cat.id;
            
            return `
                <a class="category-item" href="/category/${urlSlug}" data-link>
                    <div class="circle-img">
                        <img alt="${cat.name}" src="${imgSrc}" loading="lazy"/>
                    </div>
                    <span>${cat.name}</span>
                </a>
            `;
        }).join('');

        console.log('✅ Categorías renderizadas en el home');

    } catch (error) {
        console.error('❌ Error cargando categorías desde Firebase:', error);
        
        // Mostrar mensaje de error
        container.innerHTML = `
            <div class="category-error" style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--error);">
                <p>Error al cargar categorías: ${error.message}</p>
            </div>
        `;
    }
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

// ============================================
// FUNCIONES CON PRODUCTOS - SIN RECARGAS
// ============================================

let isFirstLoad = true;

async function loadFlashSale() {
    const container = document.getElementById('flash-sale-container');
    if (!container) {
        console.warn('⚠️ flash-sale-container no encontrado');
        return;
    }

    try {
        if (!container.hasAttribute('data-loaded')) {
            container.innerHTML = `
                <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p class="body-sm" style="color: var(--gray-500);">Cargando productos...</p>
                </div>
            `;
        }

        const flashProducts = await ProductService.getOfertas(6);
        
        console.log('📦 Productos en oferta:', flashProducts.length);
        
        if (!flashProducts || flashProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p class="body-sm" style="color: var(--gray-500);">No hay productos en oferta disponibles</p>
                </div>
            `;
            container.setAttribute('data-loaded', 'true');
            return;
        }

        const shouldAnimate = isFirstLoad;
        
        const newHTML = flashProducts.map((p) => {
            const discount = p.porcentajeDescuento || 0;
            const finalPrice = p.precioFinal || p.precioVenta * (1 - discount / 100);
            const soldPercent = p.soldPercent || Math.floor(Math.random() * 60) + 20;
            const imgSrc = p.imagenPrincipal || '/images/placeholder.jpg';
            const animStyles = shouldAnimate ? 'opacity: 0; transform: translateY(20px);' : '';
            
            return `
                <div class="product-card" data-id="${p.id}" style="${animStyles}">
                    <div class="product-img">
                        <img src="${imgSrc}" alt="${p.nombre || 'Producto'}" loading="lazy"/>
                        <div class="sale-tag">-${discount}%</div>
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
                </div>
            `;
        }).join('');

        container.innerHTML = newHTML;
        container.setAttribute('data-loaded', 'true');

        if (shouldAnimate) {
            const newCards = container.querySelectorAll('.product-card');
            newCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 50);
            });
            isFirstLoad = false;
        }

        setTimeout(() => {
            container.querySelectorAll('.progress-fill').forEach((bar, index) => {
                const product = flashProducts[index];
                const soldPercent = product?.soldPercent || Math.floor(Math.random() * 60) + 20;
                animateProgressBar(bar, soldPercent);
            });
        }, 300);

        console.log(`✅ ${flashProducts.length} productos de oferta cargados`);

    } catch (error) {
        console.error('❌ Error cargando productos en oferta:', error);
        if (!container.hasAttribute('data-loaded')) {
            container.innerHTML = `
                <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p class="body-sm" style="color: var(--red-500);">Error al cargar productos: ${error.message}</p>
                </div>
            `;
        }
    }
}

async function loadTrending() {
    const container = document.getElementById('trending-container');
    if (!container) {
        console.warn('⚠️ trending-container no encontrado');
        return;
    }

    try {
        if (!container.hasAttribute('data-loaded')) {
            container.innerHTML = `
                <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p class="body-sm" style="color: var(--gray-500);">Cargando productos...</p>
                </div>
            `;
        }

        let products = await ProductService.getDestacados(5);
        
        if (products.length < 5) {
            const allProducts = await ProductService.getAll({ 
                estado: 'activo'
            }, 'createdAt', 'desc', 10);
            
            const destacadosIds = new Set(products.map(p => p.id));
            const adicionales = allProducts
                .filter(p => !destacadosIds.has(p.id))
                .slice(0, 5 - products.length);
            
            products = [...products, ...adicionales];
        }
        
        console.log('📦 Productos para trending:', products.length);
        
        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p class="body-sm" style="color: var(--gray-500);">No hay productos disponibles</p>
                </div>
            `;
            container.setAttribute('data-loaded', 'true');
            return;
        }

        const shouldAnimate = isFirstLoad;
        
        const newHTML = products.map(p => {
            let badge = '';
            if (p.destacado) {
                badge = '<span class="new-badge" style="background: var(--gold);">DESTACADO</span>';
            } else if (p.porcentajeDescuento > 0) {
                badge = `<span class="new-badge" style="background: var(--red-500);">-${p.porcentajeDescuento}%</span>`;
            }
            
            const rating = (4 + Math.random() * 0.9).toFixed(1);
            const reviews = Math.floor(Math.random() * 200) + 10;
            const imgSrc = p.imagenPrincipal || '/images/placeholder.jpg';
            const finalPrice = p.precioFinal || p.precioVenta;
            const animStyles = shouldAnimate ? 'opacity: 0; transform: translateY(20px);' : '';

            return `
                <div class="trending-item" data-id="${p.id}" style="${animStyles}">
                    <div class="trending-img">
                        ${badge}
                        <img src="${imgSrc}" alt="${p.nombre || 'Producto'}" loading="lazy"/>
                        <button class="add-cart"><i class="fas fa-cart-plus"></i></button>
                    </div>
                    <h4 class="body-sm product-name">${p.nombre || 'Producto'}</h4>
                    <div class="price">
                        <span class="price-current">$${Math.round(finalPrice)}</span>
                        ${p.precioVenta > finalPrice ? `<span class="price-old">$${Math.round(p.precioVenta)}</span>` : ''}
                        <span class="body-sm rating">${rating} ★ (${reviews})</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = newHTML;
        container.setAttribute('data-loaded', 'true');

        if (shouldAnimate) {
            const newItems = container.querySelectorAll('.trending-item');
            newItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 50);
            });
            isFirstLoad = false;
        }

        console.log(`✅ ${products.length} productos de tendencias cargados`);

    } catch (error) {
        console.error('❌ Error cargando productos destacados:', error);
        if (!container.hasAttribute('data-loaded')) {
            container.innerHTML = `
                <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p class="body-sm" style="color: var(--red-500);">Error al cargar productos: ${error.message}</p>
                </div>
            `;
        }
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
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-cart');
        if (addBtn) {
            e.stopPropagation();
            const productCard = addBtn.closest('.trending-item');
            const productName = productCard?.querySelector('.product-name')?.textContent || 'Producto';
            addToCart(productName);
            showToast(`✨ ${productName} agregado al carrito`);
            window.dispatchEvent(new CustomEvent('cart:updated'));
        }
    });
    
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        const trendingCard = e.target.closest('.trending-item');
        
        if (productCard && !e.target.closest('.add-cart') && !e.target.closest('button')) {
            const productId = productCard.dataset.id;
            showToast(`🔍 Ver detalles del producto ${productId}`);
        }
        
        if (trendingCard && !e.target.closest('.add-cart') && !e.target.closest('button')) {
            const productId = trendingCard.dataset.id;
            showToast(`🔍 Ver detalles del producto ${productId}`);
        }
    });
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
        background: var(--toast-bg, #1f1b13); color: var(--toast-text, white);
        padding: 12px 24px; border-radius: 40px; font-size: 13px;
        z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        border-left: 3px solid var(--gold, #ddab3b);
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
    
    revealElements.forEach((el, index) => {
        if (!el.style.opacity || el.style.opacity === '0') {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.03}s, transform 0.6s ease ${index * 0.03}s`;
        }
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => observer.observe(el));
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
        shopNowBtn.addEventListener('click', () => showToast('🛍️ Explorando colección...'));
    }
    const shopAllBtn = document.getElementById('shopAllBtn');
    if (shopAllBtn) {
        shopAllBtn.addEventListener('click', () => showToast('🛍️ Ver todas las tendencias...'));
    }
}

// ============================================
// SCROLL SUAVE PARA CATEGORÍAS
// ============================================
function initCategoryScroll() {
    const nav = document.querySelector('.category-nav');
    if (!nav) return;
    
    // Scroll suave con rueda
    nav.addEventListener('wheel', (e) => {
        if (e.target.closest('.category-grid')) {
            e.preventDefault();
            nav.scrollLeft += e.deltaY * 0.5;
        }
    }, { passive: false });
    
    const grid = document.querySelector('.category-grid');
    if (!grid) return;
    
    function checkOverflow() {
        const hasOverflow = grid.scrollWidth > grid.clientWidth;
        nav.style.position = 'relative';
        
        // Eliminar indicadores previos
        const existingLeft = nav.querySelector('.scroll-indicator-left');
        const existingRight = nav.querySelector('.scroll-indicator-right');
        if (existingLeft) existingLeft.remove();
        if (existingRight) existingRight.remove();
        
        if (hasOverflow) {
            // Indicador derecho
            const rightInd = document.createElement('div');
            rightInd.className = 'scroll-indicator-right';
            rightInd.innerHTML = '→';
            rightInd.style.cssText = `
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                background: var(--gold);
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                cursor: pointer;
                opacity: 0.7;
                z-index: 5;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                transition: opacity 0.2s;
            `;
            rightInd.addEventListener('click', () => {
                nav.scrollBy({ left: 200, behavior: 'smooth' });
            });
            rightInd.addEventListener('mouseenter', () => rightInd.style.opacity = '1');
            rightInd.addEventListener('mouseleave', () => rightInd.style.opacity = '0.7');
            nav.appendChild(rightInd);
            
            // Indicador izquierdo
            const leftInd = document.createElement('div');
            leftInd.className = 'scroll-indicator-left';
            leftInd.innerHTML = '←';
            leftInd.style.cssText = `
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                background: var(--gold);
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                cursor: pointer;
                opacity: 0.7;
                z-index: 5;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                transition: opacity 0.2s;
            `;
            leftInd.addEventListener('click', () => {
                nav.scrollBy({ left: -200, behavior: 'smooth' });
            });
            leftInd.addEventListener('mouseenter', () => leftInd.style.opacity = '1');
            leftInd.addEventListener('mouseleave', () => leftInd.style.opacity = '0.7');
            nav.appendChild(leftInd);
        }
    }
    
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    setTimeout(checkOverflow, 500);
}

// ============================================
// ACTUALIZACIONES EN VIVO
// ============================================

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
        await loadFlashSale();
        await loadTrending();
        
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
        await loadFlashSale();
        await loadTrending();
        showToast(`🔄 ${event.detail?.productName || 'Productos'} actualizados`);
    });
    
    setInterval(async () => {
        console.log('🔄 Actualización automática en vivo...');
        await CacheService.clearCache(STORES.PRODUCTS);
        await loadFlashSale();
        await loadTrending();
    }, 60000);
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
        .btn-refresh:hover {
            transform: scale(1.1);
            transition: transform 0.3s;
        }
        .product-card, .trending-item {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .category-empty, .category-error {
            grid-column: 1 / -1 !important;
        }
    `;
    document.head.appendChild(style);
}