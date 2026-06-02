/* ========================================
   HOME CONTROLLER - OUTLET (CON IMÁGENES ORIGINALES DE index.html)
   ======================================== */

// URLs de imágenes ORIGINALES (tomadas directamente de index.html)
const IMAGES = {
    // Categorías - imágenes circulares
    categories: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCLtfxBJHzGNyW7S2r8PW8UQEHi3Z95AiwvvvFcgXN_hNFljU5xDClu2lssWY6IbYEC4edbKUKNLGf7qG2g2XSS4FKM6nBHZywoiZuPnRqFcOkZlGNNFXKBx-BOGn6ur_pJ3V2ou-YtZhJS9jasGgca3Zn3XDpIif4NDtVf20VhbnwMPBays54-jz3tg7jaRI521AMak_IjSPuW2oGrwBe4CRuUM9Nd0nNJhP3FAVFYozcs1fUdWID0FIqEoDpFZM8y7uhZGL5WyTPA",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDyrTXSUlcmOYzW27UEkvX2vqNni8uwPo95DIHp7MKUTmqkwuf-xcE1Cfdw98tztp8CBY3lAizz1mDcgp2yOOb0MorWuE5Q4ejnmw3LIwW8ECiWkgCclFwhlZyflfDlz-JXRQkQU4q2WpHwqKPla73kSktxwSVds1R6AjRYI79O8MCVS2xiHFz_ixrDHa7DQnvhzcuswyE0Qs7kgpUq4M66-9xZtuttgvpNz1BVU2Pqpc6nI9IFlPUzdEOJpR79Wsq24K_JtU0j_pnL",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDZqg3PhiQcyPx9qvbvfRC7iQUY952pX3kM5GkXqJXvUdnbSGwDAOUdqna-ep1_T6oRUpFfk8bfIfOD_y0Ux9cQj-zbgL8GWutPS_fBYwWEMNoDF0GJ2tI5X-1hmVWVAVrzredmlqqQ2VJ05aYRgCYFx8uz5JWXwf12Nmzw6w-ZU6LDThAOCZVruPAxD72MY9PVJDC-nX_Pjt8syhhFzqz2CHSKem0ME6wcYcNizQ948Dv5vOWrgqBgnp89rvOw3Yrv-Ll4uTmZeuXJ",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_3Ij40424nqgJFCW2yBcK53AfVxMBGiMbJQYwtb7TXulhSxa7uQsKmiF0wk44t4Wq1fw2V_fgTaDPBt3zp4euiIQEylGLlfZE1ZugUSpH48o1KyxbRUqYknBEQwIKa73Py03gadN-tdKIrgtqDDLlBOCcYLvBpQL6fgyS0c9a6jdQE7mA2JGU_QnCD8KxV6RWFxeWcgKKRQfXexsVEDkNnkqVzkyWRugED0o306tf4TyKNqZg59KDes7wAtJ02Q9xUXk8dcHit2GF",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPFf8lNofT1q78NB41yKwRRLZIH_2qgXBAq41knEh1IRAOTYVtb5pSj9uC_BoSANE_vvL3NjBudbzdDs_rK2a7D47lzs_EM4Y009_X_9fBNVt_kk4fjm7_oZrdpBloAlZ7iTl6-QuSIn4dbbo_N2_IxU6MwtcKkXO8dIUgym2_jP3TUkYQ8fxSu4-JO3fysyRCGjF6667mopg-nCZTmAEl9dZaOCfy5BKxqMbFnJhtKdEsBfxbTsegNRRZHpyHwlJrIQV6YnTpmQ_b",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAMLUpsb4z_kmPPRr7SNFmJzhQca6vRy9f6mYTZXfeN2DveISlKOiLdPMR9YXJs76KL_XkI_IGvLMIbAycg5TV0TqRM9lGKCaIsYioaInmOMgayFC_p68Lgqn5rtzqcfFpBJG4a-9SYRXh8lROsm5UCwfNulB9Q7TlSNr09Cys6e-9ply60QBkaCJ-33WcZuT6AV7HVOYWj-dH0cQyvpdnuuEC54nq40GNV72x2B34D_mfuANqKA4XKWXjM0DgACe5ThWYMCqnC2j51"
    ],
    // Productos Flash Sale (6 productos - mapeo según index.html)
    flashSale: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_3Ij40424nqgJFCW2yBcK53AfVxMBGiMbJQYwtb7TXulhSxa7uQsKmiF0wk44t4Wq1fw2V_fgTaDPBt3zp4euiIQEylGLlfZE1ZugUSpH48o1KyxbRUqYknBEQwIKa73Py03gadN-tdKIrgtqDDLlBOCcYLvBpQL6fgyS0c9a6jdQE7mA2JGU_QnCD8KxV6RWFxeWcgKKRQfXexsVEDkNnkqVzkyWRugED0o306tf4TyKNqZg59KDes7wAtJ02Q9xUXk8dcHit2GF",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC8w2N5RHAIqr2BoKoKKGIX98flTKfAHqHd4nlBTQxRETrAVaX43m33HSYmkiLN5XrAcX6n8hf5NzYOmEQYpPPLrnpSdh68AvIkF95UBZzZ6EeTtAJ4RenriBld-pF_Fm4oFcKHLbQcZIQYwUIxgs4X9fdUAQ69OWBwi5mi9Mu84Y-iSF24yXlevMMkrb0hAN8bGhPoAky9082YK-MhrR-kqxoNspXaFkQWV6AcBmMbZt0WGQlHcmxVs0RUZbEF50rGWXwGIv047h3E",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB5OM7T3pgo4QVEKdiMxPN35bmS_SQ7x-QrXWCjlY9vgYq6o4kdIxq0iLVQxfHOVKm1kOS9QVxCkHpOV7rUeSy1YLKBVeu9_KT0lMgsa0eylXh8F5Spf5Hp30Ch88zqjHJ4wD2MSMEXhsfnEX609FbtfgoXUrQAeEcQoI9uCD1Q4KytYGlIhDLZ7ppJTyOQ_nXGIk-WZrW0h8biwPBoz-lEV8L7fjH0wxlpQqMHupvGp5Da9vm76h8aUIeReReUANRxJwdeDvhmD9rx",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCLtfxBJHzGNyW7S2r8PW8UQEHi3Z95AiwvvvFcgXN_hNFljU5xDClu2lssWY6IbYEC4edbKUKNLGf7qG2g2XSS4FKM6nBHZywoiZuPnRqFcOkZlGNNFXKBx-BOGn6ur_pJ3V2ou-YtZhJS9jasGgca3Zn3XDpIif4NDtVf20VhbnwMPBays54-jz3tg7jaRI521AMak_IjSPuW2oGrwBe4CRuUM9Nd0nNJhP3FAVFYozcs1fUdWID0FIqEoDpFZM8y7uhZGL5WyTPA",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDyrTXSUlcmOYzW27UEkvX2vqNni8uwPo95DIHp7MKUTmqkwuf-xcE1Cfdw98tztp8CBY3lAizz1mDcgp2yOOb0MorWuE5Q4ejnmw3LIwW8ECiWkgCclFwhlZyflfDlz-JXRQkQU4q2WpHwqKPla73kSktxwSVds1R6AjRYI79O8MCVS2xiHFz_ixrDHa7DQnvhzcuswyE0Qs7kgpUq4M66-9xZtuttgvpNz1BVU2Pqpc6nI9IFlPUzdEOJpR79Wsq24K_JtU0j_pnL",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPFf8lNofT1q78NB41yKwRRLZIH_2qgXBAq41knEh1IRAOTYVtb5pSj9uC_BoSANE_vvL3NjBudbzdDs_rK2a7D47lzs_EM4Y009_X_9fBNVt_kk4fjm7_oZrdpBloAlZ7iTl6-QuSIn4dbbo_N2_IxU6MwtcKkXO8dIUgym2_jP3TUkYQ8fxSu4-JO3fysyRCGjF6667mopg-nCZTmAEl9dZaOCfy5BKxqMbFnJhtKdEsBfxbTsegNRRZHpyHwlJrIQV6YnTpmQ_b"
    ],
    // Productos Trending (mapeo según index.html)
    trending: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_3Ij40424nqgJFCW2yBcK53AfVxMBGiMbJQYwtb7TXulhSxa7uQsKmiF0wk44t4Wq1fw2V_fgTaDPBt3zp4euiIQEylGLlfZE1ZugUSpH48o1KyxbRUqYknBEQwIKa73Py03gadN-tdKIrgtqDDLlBOCcYLvBpQL6fgyS0c9a6jdQE7mA2JGU_QnCD8KxV6RWFxeWcgKKRQfXexsVEDkNnkqVzkyWRugED0o306tf4TyKNqZg59KDes7wAtJ02Q9xUXk8dcHit2GF",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDyrTXSUlcmOYzW27UEkvX2vqNni8uwPo95DIHp7MKUTmqkwuf-xcE1Cfdw98tztp8CBY3lAizz1mDcgp2yOOb0MorWuE5Q4ejnmw3LIwW8ECiWkgCclFwhlZyflfDlz-JXRQkQU4q2WpHwqKPla73kSktxwSVds1R6AjRYI79O8MCVS2xiHFz_ixrDHa7DQnvhzcuswyE0Qs7kgpUq4M66-9xZtuttgvpNz1BVU2Pqpc6nI9IFlPUzdEOJpR79Wsq24K_JtU0j_pnL",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB5OM7T3pgo4QVEKdiMxPN35bmS_SQ7x-QrXWCjlY9vgYq6o4kdIxq0iLVQxfHOVKm1kOS9QVxCkHpOV7rUeSy1YLKBVeu9_KT0lMgsa0eylXh8F5Spf5Hp30Ch88zqjHJ4wD2MSMEXhsfnEX609FbtfgoXUrQAeEcQoI9uCD1Q4KytYGlIhDLZ7ppJTyOQ_nXGIk-WZrW0h8biwPBoz-lEV8L7fjH0wxlpQqMHupvGp5Da9vm76h8aUIeReReUANRxJwdeDvhmD9rx",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC8w2N5RHAIqr2BoKoKKGIX98flTKfAHqHd4nlBTQxRETrAVaX43m33HSYmkiLN5XrAcX6n8hf5NzYOmEQYpPPLrnpSdh68AvIkF95UBZzZ6EeTtAJ4RenriBld-pF_Fm4oFcKHLbQcZIQYwUIxgs4X9fdUAQ69OWBwi5mi9Mu84Y-iSF24yXlevMMkrb0hAN8bGhPoAky9082YK-MhrR-kqxoNspXaFkQWV6AcBmMbZt0WGQlHcmxVs0RUZbEF50rGWXwGIv047h3E",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPFf8lNofT1q78NB41yKwRRLZIH_2qgXBAq41knEh1IRAOTYVtb5pSj9uC_BoSANE_vvL3NjBudbzdDs_rK2a7D47lzs_EM4Y009_X_9fBNVt_kk4fjm7_oZrdpBloAlZ7iTl6-QuSIn4dbbo_N2_IxU6MwtcKkXO8dIUgym2_jP3TUkYQ8fxSu4-JO3fysyRCGjF6667mopg-nCZTmAEl9dZaOCfy5BKxqMbFnJhtKdEsBfxbTsegNRRZHpyHwlJrIQV6YnTpmQ_b"
    ],
    // Galería
    gallery: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDZqg3PhiQcyPx9qvbvfRC7iQUY952pX3kM5GkXqJXvUdnbSGwDAOUdqna-ep1_T6oRUpFfk8bfIfOD_y0Ux9cQj-zbgL8GWutPS_fBYwWEMNoDF0GJ2tI5X-1hmVWVAVrzredmlqqQ2VJ05aYRgCYFx8uz5JWXwf12Nmzw6w-ZU6LDThAOCZVruPAxD72MY9PVJDC-nX_Pjt8syhhFzqz2CHSKem0ME6wcYcNizQ948Dv5vOWrgqBgnp89rvOw3Yrv-Ll4uTmZeuXJ",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCLtfxBJHzGNyW7S2r8PW8UQEHi3Z95AiwvvvFcgXN_hNFljU5xDClu2lssWY6IbYEC4edbKUKNLGf7qG2g2XSS4FKM6nBHZywoiZuPnRqFcOkZlGNNFXKBx-BOGn6ur_pJ3V2ou-YtZhJS9jasGgca3Zn3XDpIif4NDtVf20VhbnwMPBays54-jz3tg7jaRI521AMak_IjSPuW2oGrwBe4CRuUM9Nd0nNJhP3FAVFYozcs1fUdWID0FIqEoDpFZM8y7uhZGL5WyTPA",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAMLUpsb4z_kmPPRr7SNFmJzhQca6vRy9f6mYTZXfeN2DveISlKOiLdPMR9YXJs76KL_XkI_IGvLMIbAycg5TV0TqRM9lGKCaIsYioaInmOMgayFC_p68Lgqn5rtzqcfFpBJG4a-9SYRXh8lROsm5UCwfNulB9Q7TlSNr09Cys6e-9ply60QBkaCJ-33WcZuT6AV7HVOYWj-dH0cQyvpdnuuEC54nq40GNV72x2B34D_mfuANqKA4XKWXjM0DgACe5ThWYMCqnC2j51",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDBtNHClCvXICohUTSHXDeCbNbys5DdAaT7Q-uEaHIWRwxLm9yovNIk2a5I35QNryWCMgMx7jW6-OcTq9Xx0tLOSAVolnEbxKWfFWFlKQdyKr_xAuMLnSUkYK7nrKWtka7eHTgkVPsuAe7qa8I44o1OHxQcIIfkGjmwdgeWxV_lshwAJ4AxzMiiTbZlXQeODlvTckTjwJep1vka771QFHUaRX9ea8g-plsgl7sxU6J7ojEjJjV5GBf7pMwBzOwOVmWysLX8FRQef6ev"
    ],
    hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBtNHClCvXICohUTSHXDeCbNbys5DdAaT7Q-uEaHIWRwxLm9yovNIk2a5I35QNryWCMgMx7jW6-OcTq9Xx0tLOSAVolnEbxKWfFWFlKQdyKr_xAuMLnSUkYK7nrKWtka7eHTgkVPsuAe7qa8I44o1OHxQcIIfkGjmwdgeWxV_lshwAJ4AxzMiiTbZlXQeODlvTckTjwJep1vka771QFHUaRX9ea8g-plsgl7sxU6J7ojEjJjV5GBf7pMwBzOwOVmWysLX8FRQef6ev"
};

// Datos de productos (los precios y nombres se mantienen igual)
const productData = {
    flashSale: [
        { id: 1, name: "Zapatilla Estructurada", originalPrice: 450, salePrice: 180, discount: 60, soldPercent: 85, imgIndex: 0 },
        { id: 2, name: "Bota Minimalista de Cuero", originalPrice: 320, salePrice: 176, discount: 45, soldPercent: 40, imgIndex: 1 },
        { id: 3, name: "Blazer Arquitectónico", originalPrice: 890, salePrice: 267, discount: 70, soldPercent: 92, imgIndex: 2 },
        { id: 4, name: "Bufanda Oversized de Cashmere", originalPrice: 785, salePrice: 550, discount: 30, soldPercent: 15, imgIndex: 3 },
        { id: 5, name: "Suéter de Lana Merino", originalPrice: 1200, salePrice: 600, discount: 50, soldPercent: 65, imgIndex: 4 },
        { id: 6, name: "Bolso Tote de Cuero", originalPrice: 825, salePrice: 620, discount: 25, soldPercent: 22, imgIndex: 5 }
    ],
    trending: [
        { id: 7, name: "Zapatilla Estructurada", price: 450, rating: 4.8, reviews: 128, isNew: true, imgIndex: 0 },
        { id: 8, name: "Abrigo Cruzado de Lana", price: 1200, rating: 4.9, reviews: 89, hasFreeShipping: true, imgIndex: 1 },
        { id: 9, name: "Vestido Columna de Seda", price: 890, rating: 4.7, reviews: 56, isNew: false, imgIndex: 2 },
        { id: 10, name: "Montura Geométrica Ónix", price: 320, rating: 4.8, reviews: 234, isBestSeller: true, imgIndex: 3 },
        { id: 11, name: "Bolso de Mano Arquitectónico", price: 1550, rating: 4.9, reviews: 67, isNew: false, imgIndex: 4 }
    ],
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
// FUNCIÓN PRINCIPAL
// ============================================
export async function homeController() {
    console.log('🏠 Home Controller OUTLET - Con imágenes originales');
    
    loadHeroImage();
    loadCategories();
    loadFlashSale();
    loadTrending();
    loadGallery();
    initTimer();
    initCartEvents();
    initScrollReveal();
    initMagneticButtons();
    initNumberGlow();
    initCouponButton();
    initShopButtons();
    initMobileCategoryCarousel();
    
    console.log('✅ Home Controller listo');
}

// ============================================
// FUNCIONES DE CARGA CON IMÁGENES ORIGINALES
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
    
    container.innerHTML = productData.categories.map((cat, idx) => `
        <a class="category-item" href="/category/${cat.url}" data-link>
            <div class="circle-img">
                <img alt="${cat.name}" src="${IMAGES.categories[cat.imgIndex]}"/>
            </div>
            <span>${cat.name}</span>
        </a>
    `).join('');
}

function loadFlashSale() {
    const container = document.getElementById('flash-sale-container');
    if (!container) return;
    
    container.innerHTML = productData.flashSale.map(p => `
        <div class="product-card" data-id="${p.id}">
            <div class="product-img">
                <img src="${IMAGES.flashSale[p.imgIndex]}" alt="${p.name}"/>
                <div class="sale-tag">-${p.discount}%</div>
            </div>
            <div class="price">
                <span class="price-current">$${p.salePrice}</span>
                <span class="price-old">$${p.originalPrice}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <p class="body-sm sold-out-text">${p.soldPercent}% Vendido</p>
        </div>
    `).join('');
    
    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach((bar, index) => {
            if (productData.flashSale[index]) {
                animateProgressBar(bar, productData.flashSale[index].soldPercent);
            }
        });
    }, 200);
}

function loadTrending() {
    const container = document.getElementById('trending-container');
    if (!container) return;
    
    container.innerHTML = productData.trending.map(p => {
        let badge = '';
        if (p.isNew) {
            badge = '<span class="new-badge">NUEVO</span>';
        } else if (p.hasFreeShipping) {
            badge = '<span class="new-badge" style="background: var(--gold);">ENVÍO GRATIS</span>';
        } else if (p.isBestSeller) {
            badge = '<span class="new-badge" style="background: black;">MÁS VENDIDO</span>';
        }
        
        return `
            <div class="trending-item" data-id="${p.id}">
                <div class="trending-img">
                    ${badge}
                    <img src="${IMAGES.trending[p.imgIndex]}" alt="${p.name}"/>
                    <button class="add-cart"><i class="fas fa-cart-plus"></i></button>
                </div>
                <h4 class="body-sm product-name">${p.name}</h4>
                <div class="price">
                    <span class="price-current">$${p.price}</span>
                    ${p.rating ? `<span class="body-sm rating">${p.rating} ★ (${p.reviews})</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function loadGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    
    container.innerHTML = productData.gallery.map((item, idx) => `
        <div class="gallery-item">
            <img alt="Galería ${idx + 1}" src="${IMAGES.gallery[item.imgIndex]}"/>
            <div class="gallery-overlay">
                <span class="label-caps">COMPRA ESTE LOOK</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// ANIMACIONES Y EVENTOS (se mantienen igual)
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
            
            // Disparar evento personalizado para actualizar navbar
            window.dispatchEvent(new CustomEvent('cart:updated'));
        }
    });
    
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        const trendingCard = e.target.closest('.trending-item');
        
        if (productCard && !e.target.closest('.add-cart')) {
            showToast(`🔍 Ver detalles del producto`);
        }
        
        if (trendingCard && !e.target.closest('.add-cart')) {
            showToast(`🔍 Ver detalles del producto`);
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
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.03}s, transform 0.6s ease ${index * 0.03}s`;
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
    `;
    document.head.appendChild(style);
}