/* ========================================
   NAVBAR CONTROLLER - OUTLET
   Controlador del layout persistente navbar
   ======================================== */

import ThemeService from './themeService.js';

// Estado privado
let state = {
    isMenuOpen: false,
    isScrolled: false,
    isDarkMode: false,
    hoverTimeout: null
};

// Elementos DOM cacheados
let elements = {};

/**
 * Inicializa el controlador del navbar
 */
export function initNavbarController() {
    cacheElements();
    
    if (!elements.navbar) {
        console.warn('⚠️ Navbar no encontrado en el DOM');
        return;
    }
    
    bindEvents();
    handleScroll();
    updateCartCount();
    initMarquee();
    initMegaMenu();
    applyStoredTheme();
    
    console.log('✅ Navbar OUTLET Controller inicializado');
}

/**
 * Cachea elementos del DOM
 */
function cacheElements() {
    elements = {
        navbar: document.querySelector('.OUTLET-nav'),
        themeBtn: document.getElementById('themeToggleBtn'),
        hamburgerBtn: document.getElementById('hamburgerBtn'),
        mobileMenu: document.getElementById('mobileMenu'),
        cartCount: document.getElementById('cartCount'),
        categoriesBtn: document.getElementById('categoriesNavBtn'),
        megaMenu: document.getElementById('megaMenuDropdown'),
        searchBtn: document.getElementById('searchBtn'),
        userBtn: document.getElementById('userBtn'),
        cartBtn: document.getElementById('cartBtn'),
        body: document.body
    };
}

/**
 * Vincula eventos del DOM
 */
function bindEvents() {
    // Modo oscuro
    if (elements.themeBtn) {
        elements.themeBtn.addEventListener('click', toggleTheme);
    }
    
    // Menú móvil
    if (elements.hamburgerBtn && elements.mobileMenu) {
        elements.hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Cerrar menú al hacer clic en enlaces
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Scroll
    window.addEventListener('scroll', handleScroll);
    
    // Escuchar cambios de ruta para cerrar menús
    document.addEventListener('route:changed', () => {
        closeMobileMenu();
        closeMegaMenu();
    });
    
    // Botones de acción
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', () => {
            alert('🔍 Búsqueda - Próximamente');
        });
    }
    
    if (elements.userBtn) {
        elements.userBtn.addEventListener('click', () => {
            alert('👤 Mi cuenta - Próximamente');
        });
    }
    
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', () => {
            alert('🛒 Carrito - Próximamente');
        });
    }
    
    // Escuchar cambios en el carrito (storage)
    window.addEventListener('storage', (e) => {
        if (e.key === 'OUTLET_cart' || e.key === 'cart') {
            updateCartCount();
        }
    });
}

/**
 * Alterna menú móvil
 */
function toggleMobileMenu() {
    if (!elements.mobileMenu || !elements.hamburgerBtn) return;
    
    const isOpen = elements.mobileMenu.classList.contains('open');
    
    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    elements.mobileMenu.classList.add('open');
    elements.hamburgerBtn?.classList.add('open');
    elements.body.classList.add('menu-open');
    createOverlay();
    state.isMenuOpen = true;
}

function closeMobileMenu() {
    elements.mobileMenu?.classList.remove('open');
    elements.hamburgerBtn?.classList.remove('open');
    elements.body.classList.remove('menu-open');
    
    const overlay = document.querySelector('.mobile-overlay');
    if (overlay) {
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 300);
    }
    state.isMenuOpen = false;
}

function createOverlay() {
    let overlay = document.querySelector('.mobile-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMobileMenu);
    }
    overlay.classList.add('open');
}

/**
 * Maneja evento scroll
 */
function handleScroll() {
    if (!elements.navbar) return;
    
    const scrolled = window.scrollY > 50;
    
    if (scrolled !== state.isScrolled) {
        state.isScrolled = scrolled;
        if (scrolled) {
            elements.navbar.classList.add('navbar-scrolled');
        } else {
            elements.navbar.classList.remove('navbar-scrolled');
        }
    }
}

/**
 * Inicializa el carrusel del banner (marquee)
 */
function initMarquee() {
    const banner = document.querySelector('.promo-banner');
    if (!banner) return;
    
    const originalContent = banner.innerHTML;
    banner.innerHTML = `
        <div class="marquee-wrapper">
            <div class="marquee-content">${originalContent}</div>
            <div class="marquee-content">${originalContent}</div>
        </div>
    `;
    
    const content = banner.querySelector('.marquee-content');
    if (content) {
        const contentWidth = content.offsetWidth;
        const duration = contentWidth / 50;
        banner.style.setProperty('--marquee-duration', `${duration}s`);
    }
}

/**
 * Inicializa Mega Menú (hover)
 */
function initMegaMenu() {
    if (!elements.categoriesBtn || !elements.megaMenu) return;
    
    // Abrir con hover
    elements.categoriesBtn.addEventListener('mouseenter', () => {
        clearTimeout(state.hoverTimeout);
        openMegaMenu();
    });
    
    elements.categoriesBtn.addEventListener('mouseleave', () => {
        state.hoverTimeout = setTimeout(() => {
            if (!elements.megaMenu?.matches(':hover')) {
                closeMegaMenu();
            }
        }, 100);
    });
    
    // Mantener abierto si el mouse está en el menú
    elements.megaMenu.addEventListener('mouseenter', () => {
        clearTimeout(state.hoverTimeout);
    });
    
    elements.megaMenu.addEventListener('mouseleave', () => {
        state.hoverTimeout = setTimeout(() => {
            closeMegaMenu();
        }, 100);
    });
    
    // También permitir click
    elements.categoriesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        elements.megaMenu.classList.toggle('open');
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.megaMenu?.classList.contains('open')) {
            closeMegaMenu();
        }
    });
}

function openMegaMenu() {
    elements.megaMenu?.classList.add('open');
}

function closeMegaMenu() {
    elements.megaMenu?.classList.remove('open');
}

/**
 * Actualiza contador del carrito
 */
function updateCartCount() {
    if (!elements.cartCount) return;
    
    let cart = [];
    try {
        const storedCart = localStorage.getItem('OUTLET_cart') || localStorage.getItem('cart');
        if (storedCart) cart = JSON.parse(storedCart);
    } catch (e) {}
    
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    elements.cartCount.textContent = totalItems;
    elements.cartCount.style.opacity = totalItems === 0 ? '0' : '1';
}

/**
 * Alterna modo oscuro/claro
 */
function toggleTheme() {
    const isDark = ThemeService.toggle();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);
}

function updateThemeButtonIcon(isDark) {
    if (!elements.themeBtn) return;
    const icon = elements.themeBtn.querySelector('i');
    if (icon) {
        icon.className = `fas ${isDark ? 'fa-sun' : 'fa-moon'}`;
    }
}

function applyStoredTheme() {
    const isDark = ThemeService.isDarkMode();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);
}

/**
 * Actualiza enlace activo según ruta actual
 */
export function setActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        
        link.classList.remove('active');
        
        if (currentPath === href) {
            link.classList.add('active');
        } else if (href !== '/' && currentPath.startsWith(href)) {
            link.classList.add('active');
        }
    });
}

/**
 * Obtiene estado actual
 */
export function getNavbarState() {
    return { ...state };
}