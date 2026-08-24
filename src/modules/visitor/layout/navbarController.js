/* ========================================
   NAVBAR CONTROLLER - OUTLET LUXURY EDITION
   Controlador del layout persistente navbar
   ======================================== */

import ThemeService from '../../shared/layout/themeService.js';
import { ProductService } from '../../../services/productService.js';
import { CategoryService } from '../../../services/categoryService.js';

let state = {
    isMenuOpen: false,
    isScrolled: false,
    isDarkMode: false,
    hoverTimeout: null
};

let elements = {};
let searchTimeout = null;

// ========================================
// FUNCIONES DE BÚSQUEDA
// ========================================

/**
 * Manejar entrada de búsqueda
 */
function handleSearchInput(e) {
    const termino = e.target.value.trim();
    const clearBtn = document.getElementById('searchClearBtn');
    const resultsDropdown = document.getElementById('searchResultsDropdown');

    if (termino.length > 0) {
        clearBtn.style.display = 'flex';
    } else {
        clearBtn.style.display = 'none';
    }

    if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
    }

    if (termino.length < 2) {
        showSearchPlaceholder('Escribe al menos 2 caracteres para buscar');
        resultsDropdown.classList.remove('open');
        return;
    }

    showSearchLoading();
    resultsDropdown.classList.add('open');

    searchTimeout = setTimeout(async () => {
        try {
            const results = await ProductService.search(termino, 10);
            renderSearchResults(results, termino);
        } catch (error) {
            console.error('Error en búsqueda:', error);
            showSearchError('Error al buscar productos. Intenta nuevamente.');
        }
    }, 300);
}

/**
 * Manejar tecla Enter en búsqueda
 */
function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        const termino = e.target.value.trim();
        if (termino.length >= 2) {
            const basePath = '/';
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(`${basePath}?search=${encodeURIComponent(termino)}`);
            } else {
                window.location.href = `${basePath}?search=${encodeURIComponent(termino)}`;
            }
            closeSearchResults();
        }
    }
}

/**
 * Limpiar búsqueda
 */
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    const resultsDropdown = document.getElementById('searchResultsDropdown');

    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    resultsDropdown.classList.remove('open');
    showSearchPlaceholder('Escribe para buscar productos');
}

/**
 * Mostrar estado de carga
 */
function showSearchLoading() {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (!resultsDropdown) return;

    resultsDropdown.innerHTML = `
        <div class="search-loading">
            <div class="search-spinner"></div>
            <span>Buscando...</span>
        </div>
    `;
}

/**
 * Mostrar placeholder
 */
function showSearchPlaceholder(text) {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (!resultsDropdown) return;

    resultsDropdown.innerHTML = `
        <div class="search-placeholder">
            <span>🔍 ${text}</span>
        </div>
    `;
}

/**
 * Mostrar error
 */
function showSearchError(text) {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (!resultsDropdown) return;

    resultsDropdown.innerHTML = `
        <div class="search-error">
            <i class="fas fa-exclamation-circle"></i>
            <span>${text}</span>
        </div>
    `;
}

/**
 * Cerrar resultados
 */
function closeSearchResults() {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (resultsDropdown) {
        resultsDropdown.classList.remove('open');
    }
}

/**
 * Renderizar resultados de búsqueda
 */
function renderSearchResults(products, termino) {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (!resultsDropdown) return;

    if (!products || products.length === 0) {
        resultsDropdown.innerHTML = `
            <div class="search-no-results">
                <span>No encontramos productos para "<strong>${termino}</strong>"</span>
                <small>Intenta con otras palabras</small>
            </div>
        `;
        resultsDropdown.classList.add('open');
        return;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    let html = `<div class="search-results-header"><span>${products.length} resultado${products.length > 1 ? 's' : ''}</span></div>`;
    html += `<div class="search-results-list">`;

    products.forEach(product => {
        const imagen = product.imagenPrincipal || product.primeraImagen || '';
        const precioFinal = product.precioFinal || product.precioVenta;
        const tieneOferta = product.porcentajeDescuento > 0;
        const productUrl = `/?product=${product.id}`;

        html += `
            <div class="search-result-item" data-product-id="${product.id}" data-url="${productUrl}">
                <div class="search-result-image">
                    ${imagen ? `<img src="${imagen}" alt="${product.nombre}" loading="lazy">` :
                `<div class="search-result-no-image"><i class="fas fa-image"></i></div>`}
                    ${tieneOferta ? `<span class="search-result-badge">-${product.porcentajeDescuento}%</span>` : ''}
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${product.nombre}</div>
                    <div class="search-result-marca">${product.marca || ''}</div>
                    <div class="search-result-prices">
                        ${tieneOferta ?
                `<span class="search-result-price-old">${formatPrice(product.precioVenta)}</span>
                             <span class="search-result-price">${formatPrice(precioFinal)}</span>` :
                `<span class="search-result-price">${formatPrice(precioFinal)}</span>`}
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    resultsDropdown.innerHTML = html;
    resultsDropdown.classList.add('open');

    resultsDropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.dataset.url;
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(url);
            } else {
                window.location.href = url;
            }
            closeSearchResults();
        });
    });
}

/**
 * Manejar click fuera del buscador
 */
function handleSearchOutside(e) {
    const searchContainer = document.getElementById('searchContainer');
    const resultsDropdown = document.getElementById('searchResultsDropdown');

    if (searchContainer && !searchContainer.contains(e.target)) {
        if (resultsDropdown) {
            resultsDropdown.classList.remove('open');
        }
    }
}

// ========================================
// FUNCIONES EXISTENTES DEL NAVBAR
// ========================================

export async function initNavbarController() {
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
    setupSearchEvents();
    await loadCategoriesInNav();

    console.log('✅ Navbar OUTLET Luxury Controller inicializado');
}

async function loadCategoriesInNav() {
    const container = document.getElementById('visitorMegaMenuCategories');
    if (!container) return;

    try {
        const categories = await CategoryService.getAll({}, true);
        const items = (categories || []).filter(cat => cat && cat.name).slice(0, 6);

        if (!items.length) {
            container.innerHTML = '<div class="luxury-empty">No hay categorías disponibles</div>';
            return;
        }

        const fallbackImage = 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=200';

        container.innerHTML = items.map((cat) => {
            const image = cat.imageUrl || cat.imageBase64 || fallbackImage;
            const categoryKey = cat.slug || cat.name;
            const countText = Array.isArray(cat.subcategories) && cat.subcategories.length > 0
                ? `${cat.subcategories.length} subcategorías`
                : 'Colección exclusiva';

            return `
                <a href="/?category=${encodeURIComponent(categoryKey)}" data-link class="luxury-category">
                    <div class="luxury-category-image">
                        <img src="${image}" alt="${cat.name}" loading="lazy">
                        <div class="luxury-overlay"></div>
                    </div>
                    <div class="luxury-category-info">
                        <h4>${cat.name}</h4>
                        <p>${countText}</p>
                    </div>
                </a>
            `;
        }).join('');
    } catch (error) {
        console.error('Error cargando categorías en el navbar visitante:', error);
        container.innerHTML = '<div class="luxury-empty">No se pudieron cargar las categorías</div>';
    }
}

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

function setupSearchEvents() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClearBtn');

    if (searchInput) {
        console.log('✅ Configurando buscador del navbar visitante');
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleSearchKeydown);
        searchInput.addEventListener('focus', () => {
            const termino = searchInput.value.trim();
            if (termino.length >= 2) {
                const resultsDropdown = document.getElementById('searchResultsDropdown');
                if (resultsDropdown) {
                    resultsDropdown.classList.add('open');
                }
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }

    document.addEventListener('click', handleSearchOutside);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSearchResults();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.blur();
            }
        }
    });

    // Mostrar placeholder inicial
    showSearchPlaceholder('Escribe para buscar productos');
}

function bindEvents() {
    if (elements.themeBtn) {
        elements.themeBtn.addEventListener('click', toggleTheme);
    }

    if (elements.hamburgerBtn && elements.mobileMenu) {
        elements.hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }

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

    window.addEventListener('scroll', handleScroll);

    document.addEventListener('route:changed', () => {
        closeMobileMenu();
        closeMegaMenu();
        updateCartCount();
        updateWishlistCount();
        setActiveLink();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'OUTLET_cart' || e.key === 'cart') {
            updateCartCount();
        }
        if (e.key === 'OUTLET_wishlist' || e.key === 'wishlist') {
            updateWishlistCount();
        }
    });

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

    if (window.matchMedia("(max-width: 900px)").matches) {
        elements.categoriesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (window.navigateTo) {
                window.navigateTo('/categories');
            } else {
                window.location.href = '/categories';
            }
        });
    }

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
    } catch (e) { }

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
    } catch (e) { }

    const totalItems = wishlist.length;

    if (totalItems > 0) {
        elements.wishlistCount.textContent = totalItems;
        elements.wishlistCount.style.display = 'flex';
    } else {
        elements.wishlistCount.style.display = 'none';
    }
}

function toggleTheme() {
    if (!ThemeService || typeof ThemeService.toggle !== 'function') {
        console.error('❌ ThemeService no disponible');
        return;
    }

    const isDark = ThemeService.toggle();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);

    console.log('🌓 Tema cambiado a:', isDark ? 'oscuro' : 'claro');
}

function updateThemeButtonIcon(isDark) {
    if (!elements.themeBtn) return;

    elements.themeBtn.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = `fas ${isDark ? 'fa-sun' : 'fa-moon'}`;
    icon.style.fontSize = '18px';
    elements.themeBtn.appendChild(icon);
}

function applyStoredTheme() {
    if (!ThemeService || typeof ThemeService.isDarkMode !== 'function') {
        console.warn('⚠️ ThemeService no disponible para aplicar tema');
        return;
    }

    const isDark = ThemeService.isDarkMode();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);

    console.log('🎨 Tema aplicado:', isDark ? 'oscuro' : 'claro');
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