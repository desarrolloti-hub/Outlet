/* ========================================
   NAVBAR CONTROLLER - OUTLET LUXURY EDITION
   Controlador del layout persistente navbar
   ======================================== */

import ThemeService from '../../shared/layout/themeService.js';

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
    updateWishlistCount();
    initMarquee();
    initMegaMenu();
    applyStoredTheme();
    setActiveLink();
    
    console.log('✅ Navbar OUTLET Luxury Controller inicializado');
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
        mobileCloseBtn: document.getElementById('mobileCloseBtn'),
        cartCount: document.getElementById('cartCount'),
        wishlistCount: document.getElementById('wishlistCount'),
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
    
    // Menú móvil - ABRIR
    if (elements.hamburgerBtn && elements.mobileMenu) {
        elements.hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Botón de cierre (X) dorado
    if (elements.mobileCloseBtn) {
        const newCloseBtn = elements.mobileCloseBtn.cloneNode(true);
        if (elements.mobileCloseBtn.parentNode) {
            elements.mobileCloseBtn.parentNode.replaceChild(newCloseBtn, elements.mobileCloseBtn);
            elements.mobileCloseBtn = newCloseBtn;
        }
        
        elements.mobileCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
        });
    }
    
    // Navegación para móvil
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        const newLink = link.cloneNode(true);
        if (link.parentNode) {
            link.parentNode.replaceChild(newLink, link);
        }
        
        newLink.addEventListener('click', (e) => {
            const href = newLink.getAttribute('href');
            
            if (!href || href === '#') {
                e.preventDefault();
                return;
            }
            
            e.preventDefault();
            closeMobileMenu();
            
            if (window.navigateTo) {
                window.navigateTo(href);
            } else {
                window.location.href = href;
            }
        });
    });
    
    // Navegación para desktop
    const desktopLinks = document.querySelectorAll('.nav-links a');
    desktopLinks.forEach(link => {
        const newLink = link.cloneNode(true);
        if (link.parentNode) {
            link.parentNode.replaceChild(newLink, link);
        }
        
        newLink.addEventListener('click', (e) => {
            const href = newLink.getAttribute('href');
            
            if (!href || href === '#') {
                e.preventDefault();
                return;
            }
            
            updateActiveDesktopLink(newLink);
            
            if (window.navigateTo) {
                e.preventDefault();
                window.navigateTo(href);
            }
        });
    });
    
    // Logo - navegar a home
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        const newLogoLink = logoLink.cloneNode(true);
        if (logoLink.parentNode) {
            logoLink.parentNode.replaceChild(newLogoLink, logoLink);
        }
        
        newLogoLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            
            if (window.navigateTo) {
                window.navigateTo('/');
            } else {
                window.location.href = '/';
            }
        });
    }
    
    // Scroll
    window.addEventListener('scroll', handleScroll);
    
    // Escuchar cambios de ruta
    document.addEventListener('route:changed', () => {
        closeMobileMenu();
        closeMegaMenu();
        updateCartCount();
        updateWishlistCount();
        setActiveLink();
    });
    
    // Escuchar cambios en el carrito (storage)
    window.addEventListener('storage', (e) => {
        if (e.key === 'OUTLET_cart' || e.key === 'cart') {
            updateCartCount();
        }
        if (e.key === 'OUTLET_wishlist' || e.key === 'wishlist') {
            updateWishlistCount();
        }
    });
    
    // Evento personalizado para actualizar contadores
    window.addEventListener('cart:updated', updateCartCount);
    window.addEventListener('wishlist:updated', updateWishlistCount);
}

function updateActiveDesktopLink(clickedLink) {
    const allDesktopLinks = document.querySelectorAll('.nav-links a');
    allDesktopLinks.forEach(link => {
        link.classList.remove('active');
    });
    clickedLink.classList.add('active');
}

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
    if (!elements.mobileMenu) return;

    elements.mobileMenu.classList.remove('open');

    if (elements.hamburgerBtn) {
        elements.hamburgerBtn.classList.remove('open');
    }

    document.body.classList.remove('menu-open');

    const overlay = document.querySelector('.mobile-overlay');

    if (overlay) {
        overlay.classList.remove('open');

        setTimeout(() => {
            overlay.remove();
        }, 300);
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

function initMegaMenu() {
    if (!elements.categoriesBtn || !elements.megaMenu) return;
    
    // El mega menú funciona con CSS hover, solo manejamos click para móvil
    if (window.matchMedia("(max-width: 900px)").matches) {
        elements.categoriesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // En móvil, redirigir a página de categorías
            if (window.navigateTo) {
                window.navigateTo('/categories');
            } else {
                window.location.href = '/categories';
            }
        });
    }
    
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

function updateWishlistCount() {
    if (!elements.wishlistCount) return;
    
    let wishlist = [];
    try {
        const storedWishlist = localStorage.getItem('OUTLET_wishlist') || localStorage.getItem('wishlist');
        if (storedWishlist) wishlist = JSON.parse(storedWishlist);
    } catch (e) {}
    
    const totalItems = wishlist.length;
    
    if (totalItems > 0) {
        elements.wishlistCount.textContent = totalItems;
        elements.wishlistCount.style.display = 'flex';
    } else {
        elements.wishlistCount.style.display = 'none';
    }
}

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

export function setActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        
        link.classList.remove('active');
        
        if (currentPath === '/' && href === '/') {
            link.classList.add('active');
        } else if (href !== '/' && currentPath.includes(href)) {
            link.classList.add('active');
        } else if (href.includes('?') && currentPath === href.split('?')[0]) {
            link.classList.add('active');
        }
    });
}

export function getNavbarState() {
    return { ...state };
}