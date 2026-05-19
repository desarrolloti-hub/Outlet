/* ========================================
   HOME CONTROLLER - OUTLET
   Animaciones Premium adaptadas
   ======================================== */

export async function homeController() {
    console.log('🏠 Home Controller OUTLET - Animaciones premium');
    
    // Inicializar todas las animaciones elegantes
    initTypingEffect();           // Efecto de escritura en títulos
    initStatsCounter();           // Contadores animados (si los tienes)
    initScrollReveal();           // Elementos que aparecen al hacer scroll
    initParallaxEffect();         // Efecto parallax suave
    initMagneticButtons();        // Botones con efecto magnético
    initFloatingImages();         // Imágenes que flotan suavemente
    initNumberGlow();             // Números con efecto glow
    initTimer();                  // Contador del flash sale
    initCartEvents();             // Eventos del carrito
    initGallery();                // Galería con lazy loading
    
    console.log('✅ Animaciones OUTLET activadas');
}

/**
 * 1. EFECTO DE ESCRITURA (TYPING) para títulos principales
 */
function initTypingEffect() {
    const titles = document.querySelectorAll('.hero-title, .headline-md');
    
    titles.forEach((title, index) => {
        // Solo aplicar a títulos específicos del hero
        if (title.closest('.hero') || title.closest('.flash-header')) {
            const originalText = title.textContent;
            title.textContent = '';
            title.style.opacity = '1';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < originalText.length) {
                    title.textContent += originalText.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                    title.classList.add('typed-cursor');
                }
            }, 80 + (index * 50));
        }
    });
}

/**
 * 2. CONTADORES ANIMADOS (para estadísticas de ventas)
 */
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.progress-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const width = element.style.width;
                const match = width.match(/\d+/);
                
                if (match && !element.classList.contains('animated')) {
                    const target = parseInt(match[0]);
                    animateProgressBar(element, target);
                    element.classList.add('animated');
                }
            }
        });
    }, { threshold: 0.3 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

/**
 * Animación de barras de progreso
 */
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
        
        // Actualizar texto del porcentaje si existe
        const parent = element.closest('.product-card');
        const soldOutText = parent?.querySelector('.sold-out-text');
        if (soldOutText && current > 0) {
            if (current >= 85) {
                soldOutText.textContent = '🔥 Almost Gone!';
            } else {
                soldOutText.textContent = `${current}% Sold Out`;
            }
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * 3. SCROLL REVEAL - Elementos que aparecen con delay escalonado
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.product-card, .trending-item, .gallery-item, .category-item'
    );
    
    revealElements.forEach((el, index) => {
        el.classList.add('scroll-reveal');
        el.style.transitionDelay = `${index * 0.03}s`;
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(el => observer.observe(el));
}

/**
 * 4. EFECTO PARALLAX - Fondo que se mueve más lento
 */
function initParallaxEffect() {
    const flashSection = document.querySelector('.flash-sale');
    const heroSection = document.querySelector('.hero');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        if (flashSection) {
            const rate = scrolled * 0.15;
            flashSection.style.backgroundPositionY = `${rate}px`;
        }
        
        if (heroSection && scrolled < window.innerHeight) {
            const rate = scrolled * 0.3;
            heroSection.style.transform = `translateY(${rate * 0.2}px)`;
        }
    });
}

/**
 * 5. BOTONES CON EFECTO MAGNÉTICO
 */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-coupon, .btn-registrar');
    
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

/**
 * 6. IMÁGENES FLOTANTES
 */
function initFloatingImages() {
    const images = document.querySelectorAll('.hero img, .product-img img');
    
    images.forEach((img, index) => {
        img.style.transition = 'transform 0.3s ease';
    });
}

/**
 * 7. NÚMEROS CON EFECTO GLOW (precios)
 */
function initNumberGlow() {
    const prices = document.querySelectorAll('.price-current');
    
    prices.forEach(price => {
        price.addEventListener('mouseenter', () => {
            price.style.textShadow = '0 0 10px rgba(221, 171, 59, 0.8)';
            price.style.transition = 'all 0.3s ease';
        });
        
        price.addEventListener('mouseleave', () => {
            price.style.textShadow = '';
        });
    });
}

/**
 * 8. CONTADOR DEL FLASH SALE
 */
function initTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) return;
    
    // Configura el tiempo (ejemplo: 2 horas, 45 minutos, 12 segundos)
    let timeLeft = 2 * 3600 + 45 * 60 + 12;
    
    const interval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerDisplay.textContent = "00:00:00";
            timerDisplay.style.animation = 'outletGoldPulse 0.5s ease';
            return;
        }
        
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeLeft--;
    }, 1000);
}

/**
 * 9. EVENTOS DEL CARRITO
 */
function initCartEvents() {
    // Agregar productos al carrito
    const addToCartButtons = document.querySelectorAll('.add-cart');
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productCard = btn.closest('.trending-item');
            const productName = productCard?.querySelector('.product-name')?.textContent || 'Producto';
            addToCart(productName);
            showToast(`✨ ${productName} agregado al carrito`);
        });
    });
    
    // Click en productos para ver detalles
    const productCards = document.querySelectorAll('.product-card, .trending-item');
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            const productName = card.querySelector('.product-name')?.textContent || 
                               card.querySelector('h4')?.textContent ||
                               'Producto';
            console.log('Ver producto:', productName);
            // window.navigateTo(`/product/${productId}`);
        });
    });
}

function addToCart(productName) {
    let cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
    cart.push({ 
        id: Date.now(), 
        name: productName, 
        quantity: 1,
        date: new Date().toISOString()
    });
    localStorage.setItem('outlet_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
    const badge = document.querySelector('.cart-count');
    if (badge) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = total;
        badge.style.opacity = total === 0 ? '0' : '1';
    }
}

function showToast(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 10. GALERÍA CON LAZY LOADING
 */
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                }
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    galleryItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transition = 'opacity 0.5s ease';
        observer.observe(item);
    });
}

/**
 * 11. EFECTO STAGGER - Animación escalonada de secciones
 */
function initStaggerAnimation() {
    const sections = document.querySelectorAll('.hero, .flash-sale, .trending, .gallery');
    
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.animation = `fadeSlideUp 0.6s ease ${index * 0.15}s forwards`;
    });
}

