/* ========================================
   CUSTOMER NAVBAR CONTROLLER
   Controlador del navbar para clientes registrados
   ======================================== */

import ThemeService from '../../shared/layout/themeService.js';
import { AuthService } from '../../../services/authService.js';

// Estado privado
let state = {
    isMenuOpen: false,
    isScrolled: false,
    isDarkMode: false,
    user: null
};

// Elementos DOM cacheados
let elements = {};

/**
 * Inicializa el controlador del navbar customer
 */
export function initCustomerNavbarController() {
    cacheElements();
    
    if (!elements.navbar) {
        console.warn('⚠️ Customer navbar no encontrado en el DOM');
        return;
    }
    
    bindEvents();
    handleScroll();
    updateCartCount();
    updateWishlistCount();
    initMarquee();
    applyStoredTheme();
    setActiveLink();
    loadUserProfile();
    
    console.log('✅ Customer Navbar Controller inicializado');
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
        searchBtn: document.getElementById('searchBtn'),
        cartBtn: document.getElementById('cartBtn'),
        wishlistBtn: document.getElementById('wishlistBtn'),
        profileBtn: document.getElementById('profileBtn'),
        profileAvatar: document.getElementById('profileAvatar'),
        body: document.body,
        mobileLogoutBtn: document.getElementById('mobileLogoutBtn')
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
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a:not(#mobileLogoutBtn)');
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
    
    // Cerrar sesión desde móvil
    if (elements.mobileLogoutBtn) {
        elements.mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            handleLogout();
        });
    }
    
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
    const logoLink = document.getElementById('logoLink');
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
    
    // Perfil - ir a mi cuenta
    if (elements.profileBtn) {
        elements.profileBtn.addEventListener('click', () => {
            if (window.navigateTo) {
                window.navigateTo('/my-account');
            } else {
                window.location.href = '/my-account';
            }
        });
    }
    
    // Carrito
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', () => {
            if (window.navigateTo) {
                window.navigateTo('/cart');
            } else {
                window.location.href = '/cart';
            }
        });
    }
    
    // Favoritos
    if (elements.wishlistBtn) {
        elements.wishlistBtn.addEventListener('click', () => {
            if (window.navigateTo) {
                window.navigateTo('/wishlist');
            } else {
                window.location.href = '/wishlist';
            }
        });
    }
    
    // Buscador
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', () => {
            // Puedes implementar un modal de búsqueda o redirigir
            if (window.navigateTo) {
                window.navigateTo('/search');
            } else {
                window.location.href = '/search';
            }
        });
    }
    
    // Scroll
    window.addEventListener('scroll', handleScroll);
    
    // Escuchar cambios de ruta
    document.addEventListener('route:changed', () => {
        closeMobileMenu();
        updateCartCount();
        updateWishlistCount();
        setActiveLink();
        loadUserProfile();
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
    
    // Eventos personalizados
    window.addEventListener('cart:updated', updateCartCount);
    window.addEventListener('wishlist:updated', updateWishlistCount);
    
    // Escuchar cambios de autenticación
    document.addEventListener('auth:changed', () => {
        loadUserProfile();
    });
}

/**
 * Carga la foto de perfil del usuario
 */
function loadUserProfile() {
    const user = AuthService.getCurrentUser();
    
    if (user && user.profileImage) {
        elements.profileAvatar.src = user.profileImage;
        elements.profileAvatar.alt = user.name || 'Usuario';
        elements.profileAvatar.style.display = 'block';
        elements.profileAvatar.style.backgroundColor = 'transparent';
        elements.profileAvatar.style.color = 'inherit';
        elements.profileAvatar.style.fontSize = 'inherit';
        elements.profileAvatar.style.fontWeight = 'normal';
        elements.profileAvatar.textContent = '';
    } else if (user && user.name) {
        // Si no tiene foto, mostrar iniciales
        const initials = user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        elements.profileAvatar.src = ''; // Limpiar src
        elements.profileAvatar.style.display = 'flex';
        elements.profileAvatar.style.alignItems = 'center';
        elements.profileAvatar.style.justifyContent = 'center';
        elements.profileAvatar.style.backgroundColor = '#ddab3b';
        elements.profileAvatar.style.color = '#1a1a1a';
        elements.profileAvatar.style.fontWeight = '700';
        elements.profileAvatar.style.fontSize = '16px';
        elements.profileAvatar.textContent = initials;
    } else {
        // Usuario por defecto
        elements.profileAvatar.src = '/assets/imagenes/usuario-default.png';
        elements.profileAvatar.alt = 'Perfil';
        elements.profileAvatar.style.display = 'block';
        elements.profileAvatar.style.backgroundColor = 'transparent';
        elements.profileAvatar.style.color = 'inherit';
        elements.profileAvatar.style.fontSize = 'inherit';
        elements.profileAvatar.style.fontWeight = 'normal';
        elements.profileAvatar.textContent = '';
    }
}

/**
 * Maneja el cierre de sesión
 */
function handleLogout() {
    AuthService.logout();
    
    // Redirigir al home
    if (window.navigateTo) {
        window.navigateTo('/');
    } else {
        window.location.href = '/';
    }
}

/**
 * Actualiza el link activo en desktop
 */
function updateActiveDesktopLink(clickedLink) {
    const allDesktopLinks = document.querySelectorAll('.nav-links a');
    allDesktopLinks.forEach(link => {
        link.classList.remove('active');
    });
    clickedLink.classList.add('active');
}

/**
 * Alterna el menú móvil
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

/**
 * Maneja el scroll del navbar
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
 * Inicializa el marquee del banner
 */
function initMarquee() {
    const banner = document.querySelector('.promo-banner');
    if (!banner) return;
    
    // Si ya tiene marquee, no hacer nada
    if (banner.querySelector('.marquee-wrapper')) return;
    
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
 * Actualiza el contador del carrito
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
 * Actualiza el contador de favoritos
 */
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

/**
 * Alterna el tema (oscuro/claro)
 */
function toggleTheme() {
    if (!ThemeService || typeof ThemeService.toggle !== 'function') {
        console.error('❌ ThemeService no disponible');
        return;
    }
    
    const isDark = ThemeService.toggle();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);
}

/**
 * Actualiza el ícono del botón de tema
 */
function updateThemeButtonIcon(isDark) {
    if (!elements.themeBtn) return;
    
    elements.themeBtn.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = `fas ${isDark ? 'fa-sun' : 'fa-moon'}`;
    icon.style.fontSize = '18px';
    elements.themeBtn.appendChild(icon);
}

/**
 * Aplica el tema almacenado
 */
function applyStoredTheme() {
    if (!ThemeService || typeof ThemeService.isDarkMode !== 'function') {
        console.warn('⚠️ ThemeService no disponible para aplicar tema');
        return;
    }
    
    const isDark = ThemeService.isDarkMode();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);
}

/**
 * Marca el link activo según la ruta actual
 */
function setActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a:not(#mobileLogoutBtn)');
    
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

/**
 * Exporta el estado del navbar
 */
export function getNavbarState() {
    return { ...state };
}