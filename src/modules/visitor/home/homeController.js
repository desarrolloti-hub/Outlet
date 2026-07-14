/* ========================================
   HOME CONTROLLER - OUTLET (SIN RECARGAS)
   ✅ ANIMACIÓN SOLO UNA VEZ
   ======================================== */

import { ProductService } from '../../../services/productService.js';
import { CacheService, STORES } from '../../../services/cacheService.js';

// URLs de imágenes ORIGINALES
const IMAGES = {
    categories: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCLtfxBJHzGNyW7S2r8PW8UQEHi3Z95AiwvvvFcgXN_hNFljU5xDClu2lssWY6IbYEC4edbKUKNLGf7qG2g2XSS4FKM6nBHZywoiZuPnRqFcOkZlGNNFXKBx-BOGn6ur_pJ3V2ou-YtZhJS9jasGgca3Zn3XDpIif4NDtVf20VhbnwMPBays54-jz3tg7jaRI521AMak_IjSPuW2oGrwBe4CRuUM9Nd0nNJhP3FAVFYozcs1fUdWID0FIqEoDpFZM8y7uhZGL5WyTPA",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDyrTXSUlcmOYzW27UEkvX2vqNni8uwPo95DIHp7MKUTmqkwuf-xcE1Cfdw98tztp8CBY3lAizz1mDcgp2yOOb0MorWuE5Q4ejnmw3LIwW8ECiWkgCclFwhlZyflfDlz-JXRQkQU4q2WpHwqKPla73kSktxwSVds1R6AjRYI79O8MCVS2xiHFz_ixrDHa7DQnvhzcuswyE0Qs7kgpUq4M66-9xZtuttgvpNz1BVU2Pqpc6nI9IFlPUzdEOJpR79Wsq24K_JtU0j_pnL",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDZqg3PhiQcyPx9qvbvfRC7iQUY952pX3kM5GkXqJXvUdnbSGwDAOUdqna-ep1_T6oRUpFfk8bfIfOD_y0Ux9cQj-zbgL8GWutPS_fBYwWEMNoDF0GJ2tI5X-1hmVWVAVrzredmlqqQ2VJ05aYRgCYFx8uz5JWXwf12Nmzw6w-ZU6LDThAOCZVruPAxD72MY9PVJDC-nX_Pjt8syhhFzqz2CHSKem0ME6wcYcNizQ948Dv5vOWrgqBgnp89rvOw3Yrv-Ll4uTmZeuXJ",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_3Ij40424nqgJFCW2yBcK53AfVxMBGiMbJQYwtb7TXulhSxa7uQsKmiF0wk44t4Wq1fw2V_fgTaDPBt3zp4euiIQEylGLlfZE1ZugUSpH48o1KyxbRUqYknBEQwIKa73Py03gadN-tdKIrgtqDDLlBOCcYLvBpQL6fgyS0c9a6jdQE7mA2JGU_QnCD8KxV6RWFxeWcgKKRQfXexsVEDkNnkqVzkyWRugED0o306tf4TyKNqZg59KDes7wAtJ02Q9xUXk8dcHit2GF",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPFf8lNofT1q78NB41yKwRRLZIH_2qgXBAq41knEh1IRAOTYVtb5pSj9uC_BoSANE_vvL3NjBudbzdDs_rK2a7D47lzs_EM4Y009_X_9fBNVt_kk4fjm7_oZrdpBloAlZ7iTl6-QuSIn4dbbo_N2_IxU6MwtcKkXO8dIUgym2_jP3TUkYQ8fxSu4-JO3fysyRCGjF6667mopg-nCZTmAEl9dZaOCfy5BKxqMbFnJhtKdEsBfxbTsegNRRZHpyHwlJrIQV6YnTpmQ_b",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAMLUpsb4z_kmPPRr7SNFmJzhQca6vRy9f6mYTZXfeN2DveISlKOiLdPMR9YXJs76KL_XkI_IGvLMIbAycg5TV0TqRM9lGKCaIsYioaInmOMgayFC_p68Lgqn5rtzqcfFpBJG4a-9SYRXh8lROsm5UCwfNulB9Q7TlSNr09Cys6e-9ply60QBkaCJ-33WcZuT6AV7HVOYWj-dH0cQyvpdnuuEC54nq40GNV72x2B34D_mfuANqKA4XKWXjM0DgACe5ThWYMCqnC2j51"
    ],
    gallery: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDZqg3PhiQcyPx9qvbvfRC7iQUY952pX3kM5GkXqJXvUdnbSGwDAOUdqna-ep1_T6oRUpFfk8bfIfOD_y0Ux9cQj-zbgL8GWutPS_fBYwWEMNoDF0GJ2tI5X-1hmVWVAVrzredmlqqQ2VJ05aYRgCYFx8uz5JWXwf12Nmzw6w-ZU6LDThAOCZVruPAxD72MY9PVJDC-nX_Pjt8syhhFzqz2CHSKem0ME6wcYcNizQ948Dv5vOWrgqBgnp89rvOw3Yrv-Ll4uTmZeuXJ",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCLtfxBJHzGNyW7S2r8PW8UQEHi3Z95AiwvvvFcgXN_hNFljU5xDClu2lssWY6IbYEC4edbKUKNLGf7qG2g2XSS4FKM6nBHZywoiZuPnRqFcOkZlGNNFXKBx-BOGn6ur_pJ3V2ou-YtZhJS9jasGgca3Zn3XDpIif4NDtVf20VhbnwMPBays54-jz3tg7jaRI521AMak_IjSPuW2oGrwBe4CRuUM9Nd0nNJhP3FAVFYozcs1fUdWID0FIqEoDpFZM8y7uhZGL5WyTPA",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAMLUpsb4z_kmPPRr7SNFmJzhQca6vRy9f6mYTZXfeN2DveISlKOiLdPMR9YXJs76KL_XkI_IGvLMIbAycg5TV0TqRM9lGKCaIsYioaInmOMgayFC_p68Lgqn5rtzqcfFpBJG4a-9SYRXh8lROsm5UCwfNulB9Q7TlSNr09Cys6e-9ply60QBkaCJ-33WcZuT6AV7HVOYWj-dH0cQyvpdnuuEC54nq40GNV72x2B34D_mfuANqKA4XKWXjM0DgACe5ThWYMCqnC2j51",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDBtNHClCvXICohUTSHXDeCbNbys5DdAaT7Q-uEaHIWRwxLm9yovNIk2a5I35QNryWCMgMx7jW6-OcTq9Xx0tLOSAVolnEbxKWfFWFlKQdyKr_xAuMLnSUkYK7nrKWtka7eHTgkVPsuAe7qa8I44o1OHxQcIIfkGjmwdgeWxV_lshwAJ4AxzMiiTbZlXQeODlvTckTjwJep1vka771QFHUaRX9ea8g-plsgl7sxU6J7ojEjJjV5GBf7pMwBzOwOVmWysLX8FRQef6ev"
    ],
    hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBtNHClCvXICohUTSHXDeCbNbys5DdAaT7Q-uEaHIWRwxLm9yovNIk2a5I35QNryWCMgMx7jW6-OcTq9Xx0tLOSAVolnEbxKWfFWFlKQdyKr_xAuMLnSUkYK7nrKWtka7eHTgkVPsuAe7qa8I44o1OHxQcIIfkGjmwdgeWxV_lshwAJ4AxzMiiTbZlXQeODlvTckTjwJep1vka771QFHUaRX9ea8g-plsgl7sxU6J7ojEjJjV5GBf7pMwBzOwOVmWysLX8FRQef6ev"
};

const staticData = {
    categories: [
        { name: "MUJER", url: "women", imgIndex: 0 },
        { name: "HOMBRE", url: "men", imgIndex: 1 },
        { name: "NIÑOS", url: "curve", imgIndex: 2 },
        { name: "ZAPATOS", url: "shoes", imgIndex: 3 },
        { name: "BOLSOS", url: "bags", imgIndex: 4 },
        { name: "JOYERIA", url: "jewelry", imgIndex: 5 }
    ],
    gallery: [
        { imgIndex: 0 }, { imgIndex: 1 }, { imgIndex: 2 }, { imgIndex: 3 }
    ]
};

// ============================================
// FUNCIÓN PRINCIPAL - EXPORTADA
// ============================================
export async function homeController() {
    console.log('🏠 Home Controller - SIN RECARGAS');
    
    loadHeroImage();
    loadCategories();
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
    initMobileCategoryCarousel();
    initRefreshButton();
    setupRealtimeUpdates();
    
    console.log('✅ Home Controller listo - Animación solo una vez');
}

// ============================================
// FUNCIONES ESTÁTICAS
// ============================================

function loadHeroImage() {
    const heroImg = document.querySelector('.hero img');
    if (heroImg) {
        heroImg.src = IMAGES.hero;
        heroImg.alt = "Hero Fashion";
    }
}

function loadCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;
    
    container.innerHTML = staticData.categories.map((cat, idx) => `
        <a class="category-item" href="/category/${cat.url}" data-link>
            <div class="circle-img">
                <img alt="${cat.name}" src="${IMAGES.categories[cat.imgIndex]}"/>
            </div>
            <span>${cat.name}</span>
        </a>
    `).join('');
}

function loadGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    
    container.innerHTML = staticData.gallery.map((item, idx) => `
        <div class="gallery-item">
            <img alt="Galería ${idx + 1}" src="${IMAGES.gallery[item.imgIndex]}"/>
            <div class="gallery-overlay">
                <span class="label-caps">COMPRA ESTE LOOK</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// FUNCIONES CON PRODUCTOS - SIN RECARGAS
// ============================================

// ✅ Bandera para controlar si ya se animó la primera carga
let isFirstLoad = true;

async function loadFlashSale() {
    const container = document.getElementById('flash-sale-container');
    if (!container) {
        console.warn('⚠️ flash-sale-container no encontrado');
        return;
    }

    try {
        // ✅ Mostrar estado de carga (solo la primera vez)
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

        // ✅ Generar HTML sin animaciones para actualizaciones
        const shouldAnimate = isFirstLoad;
        
        const newHTML = flashProducts.map((p) => {
            const discount = p.porcentajeDescuento || 0;
            const finalPrice = p.precioFinal || p.precioVenta * (1 - discount / 100);
            const soldPercent = p.soldPercent || Math.floor(Math.random() * 60) + 20;
            const imgSrc = p.imagenPrincipal || '/images/placeholder.jpg';

            // ✅ Si es la primera carga, agregar estilos para animación
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

        // ✅ Reemplazar sin recargar la página
        container.innerHTML = newHTML;
        container.setAttribute('data-loaded', 'true');

        // ✅ ANIMACIÓN SOLO EN LA PRIMERA CARGA
        if (shouldAnimate) {
            const newCards = container.querySelectorAll('.product-card');
            newCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 50);
            });
            
            // ✅ Marcar que ya se hizo la animación
            isFirstLoad = false;
        }

        // ✅ Animar barras de progreso siempre
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
        // ✅ Mostrar estado de carga (solo la primera vez)
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

        // ✅ Generar HTML sin animaciones para actualizaciones
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

            // ✅ Si es la primera carga, agregar estilos para animación
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

        // ✅ ANIMACIÓN SOLO EN LA PRIMERA CARGA
        if (shouldAnimate) {
            const newItems = container.querySelectorAll('.trending-item');
            newItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 50);
            });
            
            // ✅ Marcar que ya se hizo la animación
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

function initMobileCategoryCarousel() {
    function isMobile() { return window.innerWidth < 768; }
    
    function initCarousel() {
        if (!isMobile()) return;
        const categoryGrid = document.querySelector('.category-grid');
        if (!categoryGrid) return;
        
        const originalItems = Array.from(categoryGrid.children);
        if (originalItems.length <= 3) return;
        
        let currentIndex = 0, intervalId = null, isAnimating = false;
        const groups = [];
        
        for (let i = 0; i < originalItems.length; i += 3) {
            groups.push(originalItems.slice(i, i + 3));
        }
        
        if (groups[groups.length - 1].length < 3) {
            const lastGroup = groups[groups.length - 1];
            const needed = 3 - lastGroup.length;
            for (let i = 0; i < needed; i++) {
                lastGroup.push(originalItems[i % originalItems.length]);
            }
        }
        
        function showGroup(index) {
            if (isAnimating) return;
            isAnimating = true;
            const group = groups[index % groups.length];
            categoryGrid.style.transition = 'opacity 0.2s ease';
            categoryGrid.style.opacity = '0';
            setTimeout(() => {
                categoryGrid.innerHTML = '';
                group.forEach(item => categoryGrid.appendChild(item.cloneNode(true)));
                categoryGrid.style.opacity = '1';
                setTimeout(() => { isAnimating = false; }, 50);
            }, 150);
        }
        
        function startCarousel() {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
                if (!isMobile()) { stopCarousel(); resetToOriginal(); return; }
                currentIndex = (currentIndex + 1) % groups.length;
                showGroup(currentIndex);
            }, 4000);
        }
        
        function stopCarousel() { if (intervalId) { clearInterval(intervalId); intervalId = null; } }
        function resetToOriginal() {
            categoryGrid.style.transition = '';
            categoryGrid.style.opacity = '1';
            categoryGrid.innerHTML = '';
            originalItems.forEach(item => categoryGrid.appendChild(item.cloneNode(true)));
            currentIndex = 0;
        }
        
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (isMobile()) { if (!intervalId) { resetToOriginal(); startCarousel(); } }
                else { stopCarousel(); resetToOriginal(); }
            }, 150);
        });
        
        if (isMobile()) { showGroup(0); startCarousel(); }
    }
    
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCarousel);
    else initCarousel();
}

// ============================================
// ✅ ACTUALIZACIONES EN VIVO - SIN RECARGAR
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
        
        // ✅ Actualizar sin recargar y sin animación
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
    // ✅ Escuchar cambios y actualizar sin recargar y sin animación
    window.addEventListener('products:updated', async (event) => {
        console.log('🔄 Actualizando productos en vivo...', event.detail);
        await CacheService.clearCache(STORES.PRODUCTS);
        await loadFlashSale();
        await loadTrending();
        showToast(`🔄 ${event.detail?.productName || 'Productos'} actualizados`);
    });
    
    // ✅ Recarga automática cada 60 segundos (sin recargar la página)
    setInterval(async () => {
        console.log('🔄 Actualización automática en vivo...');
        await CacheService.clearCache(STORES.PRODUCTS);
        await loadFlashSale();
        await loadTrending();
        // No mostrar toast en actualizaciones automáticas para no molestar
    }, 60000);
}

// Agregar estilos base
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
    `;
    document.head.appendChild(style);
}