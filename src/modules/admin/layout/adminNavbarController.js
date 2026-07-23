/* ========================================
   ADMIN NAVBAR CONTROLLER - OUTLET LUXURY EDITION
   CON SOPORTE COMPLETO PARA MÓVIL
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import ThemeService from '../../shared/layout/themeService.js';

// Estado privado
const state = {
    isCollapsed: false,
    isDarkMode: false,
    isMobileOpen: false
};

// Elementos DOM cacheados
const elements = {};

// Breakpoint para móvil
const MOBILE_BREAKPOINT = 768;

// Rutas del admin
const ADMIN_ROUTES = {
    DASHBOARD: '/homeAdmin',
    PRODUCTS: '/readProducts',
    CATEGORIES: '/readCategories',
    USERS: '/readUsers',
    ORDERS: '/readOrders',
    SETTINGS: '/adminSettings'
};

// ========================================
// UI Helpers - CON SWEETALERT2
// ========================================

function mostrarToast(mensaje, tipo = 'info') {
    const toastExistente = document.querySelector('.outlet-toast');
    if (toastExistente) toastExistente.remove();

    const toast = document.createElement('div');
    toast.className = `outlet-toast ${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function mostrarSweetAlert(options) {
    return Swal.fire({
        buttonsStyling: false,
        customClass: {
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel',
            popup: 'swal2-popup'
        },
        ...options
    });
}

function mostrarConfirmacion(titulo, mensaje, confirmText = 'Sí, confirmar') {
    return mostrarSweetAlert({
        title: titulo || '¿Estás seguro?',
        text: mensaje || 'Esta acción requiere tu confirmación.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar'
    });
}

function mostrarExito(titulo = '¡Perfecto!', mensaje = 'La acción se completó con éxito.') {
    return mostrarSweetAlert({
        icon: 'success',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    });
}

function mostrarError(titulo = '¡Oops!', mensaje = 'Ocurrió un error inesperado.') {
    return mostrarSweetAlert({
        icon: 'error',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Entendido'
    });
}

// ========================================
// Inicialización
// ========================================

export function initAdminNavbarController() {
    console.log('🚀 Iniciando Admin Navbar Controller...');

    cacheElements();

    if (!elements.navbar) {
        console.warn('⚠️ Admin Navbar no encontrado en el DOM');
        return;
    }

    console.log('✅ Navbar encontrado, vinculando eventos...');
    bindEvents();
    applyStoredTheme();
    restoreCollapsedState();
    setActiveLink();
    loadUserInfo();
    handleMobileResponsive();
    setupNavigationLinks();

    console.log('✅ Admin Navbar Controller inicializado correctamente');
}

// ========================================
// Cache de elementos DOM
// ========================================

function cacheElements() {
    elements.navbar = document.querySelector('.OUTLET-admin-nav');
    elements.collapseBtn = document.getElementById('adminCollapseBtn');
    elements.logoutBtn = document.getElementById('adminLogoutBtn');
    elements.themeBtn = document.getElementById('adminThemeToggleBtn');
    elements.mobileToggleBtn = document.getElementById('adminMobileToggleBtn');
    elements.navOverlay = document.getElementById('adminNavOverlay');
    elements.navLinks = document.querySelectorAll('.admin-nav-links a');
    elements.categoriesLink = document.querySelector('.admin-nav-links a[href*="categories"]');
    elements.userName = document.getElementById('adminUserName');
    elements.userEmail = document.getElementById('adminUserEmail');
    elements.body = document.body;
}

// ========================================
// Configuración de enlaces
// ========================================

function setupNavigationLinks() {
    if (elements.categoriesLink) {
        console.log('🔗 Configurando enlace de categorías');

        const newLink = elements.categoriesLink.cloneNode(true);
        elements.categoriesLink.parentNode.replaceChild(newLink, elements.categoriesLink);
        elements.categoriesLink = newLink;

        elements.categoriesLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('🔄 Navegando a categorías...');

            if (state.isMobileOpen) {
                closeMobileNav();
            }

            navigateToCategories();
        });
    } else {
        console.warn('⚠️ Enlace de categorías no encontrado en el DOM');
    }

    elements.navLinks?.forEach(function (link) {
        if (link === elements.categoriesLink) return;

        link.addEventListener('click', function (e) {
            if (state.isMobileOpen) {
                setTimeout(closeMobileNav, 300);
            }
        });
    });
}

function navigateToCategories() {
    console.log('📋 Navegando a readCategories...');

    if (typeof window.navigateTo === 'function') {
        window.navigateTo(ADMIN_ROUTES.CATEGORIES);
        return;
    }

    const currentPath = window.location.pathname;
    let targetPath = '';

    if (currentPath.includes('/admin/') || currentPath.includes('/admin')) {
        targetPath = './readCategories.html';
    } else if (currentPath.includes('/pages/') && !currentPath.includes('/admin/')) {
        targetPath = '../admin/readCategories.html';
    } else {
        targetPath = '/admin/readCategories.html';
    }

    console.log('📍 Navegando a:', targetPath);
    window.location.href = targetPath;
}

// ========================================
// Eventos
// ========================================

function bindEvents() {
    if (elements.collapseBtn) {
        elements.collapseBtn.addEventListener('click', toggleCollapse);
    }

    if (elements.mobileToggleBtn) {
        console.log('🔗 Vinculando evento al botón hamburguesa');
        const newBtn = elements.mobileToggleBtn.cloneNode(true);
        elements.mobileToggleBtn.parentNode.replaceChild(newBtn, elements.mobileToggleBtn);
        elements.mobileToggleBtn = newBtn;
        elements.mobileToggleBtn.addEventListener('click', toggleMobileNav);
    } else {
        console.warn('⚠️ Botón hamburguesa no encontrado');
    }

    if (elements.navOverlay) {
        elements.navOverlay.addEventListener('click', closeMobileNav);
    }

    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }

    if (elements.themeBtn) {
        elements.themeBtn.addEventListener('click', toggleTheme);
    }

    document.addEventListener('route:changed', function () {
        setActiveLink();
        if (state.isMobileOpen) {
            closeMobileNav();
        }
    });

    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
}

// ========================================
// Responsive
// ========================================

function handleMobileResponsive() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    console.log('📱 Modo móvil:', isMobile);

    if (isMobile) {
        elements.navbar?.classList.remove('collapsed');
        elements.navbar?.classList.add('mobile-hidden');

        if (elements.collapseBtn) {
            elements.collapseBtn.style.display = 'none';
        }

        document.querySelector('main')?.classList.add('mobile-main');

    } else {
        elements.navbar?.classList.remove('mobile-hidden', 'open');

        if (elements.navOverlay) {
            elements.navOverlay.classList.remove('active');
            elements.navOverlay.style.display = 'none';
        }

        if (elements.collapseBtn) {
            elements.collapseBtn.style.display = '';
        }

        const saved = localStorage.getItem('admin_nav_collapsed');
        if (saved === 'true') {
            state.isCollapsed = true;
            elements.navbar?.classList.add('collapsed');
            updateCollapseIcon(true);
        } else {
            state.isCollapsed = false;
            elements.navbar?.classList.remove('collapsed');
            updateCollapseIcon(false);
        }

        document.body.style.overflow = '';
        document.querySelector('main')?.classList.remove('mobile-main');
    }
}

function handleResize() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    if (isMobile && !state.isMobileOpen) {
        elements.navbar?.classList.add('mobile-hidden');
        elements.navbar?.classList.remove('open');

        if (elements.navOverlay) {
            elements.navOverlay.classList.remove('active');
            elements.navOverlay.style.display = 'none';
        }

        updateMobileToggleIcon(false);

    } else if (!isMobile && state.isMobileOpen) {
        closeMobileNav();
    }
}

// ========================================
// Navegación móvil
// ========================================

function toggleMobileNav() {
    console.log('🔄 Toggle móvil clickeado');
    console.log('Estado actual:', state.isMobileOpen);

    if (state.isMobileOpen) {
        closeMobileNav();
    } else {
        openMobileNav();
    }
}

function openMobileNav() {
    console.log('📱 Abriendo menú móvil');
    state.isMobileOpen = true;

    elements.navbar?.classList.remove('mobile-hidden');
    elements.navbar?.classList.add('open');

    if (elements.navOverlay) {
        elements.navOverlay.classList.add('active');
        elements.navOverlay.style.display = 'block';
    }

    document.body.style.overflow = 'hidden';
    updateMobileToggleIcon(true);

    console.log('✅ Navbar abierto, clases:', elements.navbar?.className);
}

function closeMobileNav() {
    console.log('📱 Cerrando menú móvil');
    state.isMobileOpen = false;

    elements.navbar?.classList.remove('open');
    elements.navbar?.classList.add('mobile-hidden');

    if (elements.navOverlay) {
        elements.navOverlay.classList.remove('active');
        elements.navOverlay.style.display = 'none';
    }

    document.body.style.overflow = '';
    updateMobileToggleIcon(false);

    console.log('✅ Navbar cerrado');
}

function updateMobileToggleIcon(isOpen) {
    if (!elements.mobileToggleBtn) {
        console.warn('⚠️ Botón hamburguesa no encontrado para actualizar ícono');
        return;
    }
    const icon = elements.mobileToggleBtn.querySelector('i');
    if (icon) {
        icon.className = 'fas ' + (isOpen ? 'fa-times' : 'fa-bars');
        console.log('✅ Ícono actualizado a:', icon.className);
    }
}

// ========================================
// Colapso (escritorio)
// ========================================

function toggleCollapse() {
    if (window.innerWidth < MOBILE_BREAKPOINT) return;

    state.isCollapsed = !state.isCollapsed;
    elements.navbar?.classList.toggle('collapsed', state.isCollapsed);

    localStorage.setItem('admin_nav_collapsed', state.isCollapsed);
    updateCollapseIcon(state.isCollapsed);

    window.dispatchEvent(new CustomEvent('admin:nav:toggle', {
        detail: { collapsed: state.isCollapsed }
    }));
}

function updateCollapseIcon(isCollapsed) {
    if (!elements.collapseBtn) return;
    const icon = elements.collapseBtn.querySelector('i');
    if (icon) {
        icon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }
}

function restoreCollapsedState() {
    if (window.innerWidth < MOBILE_BREAKPOINT) return;

    const saved = localStorage.getItem('admin_nav_collapsed');
    if (saved === 'true') {
        state.isCollapsed = true;
        elements.navbar?.classList.add('collapsed');
        updateCollapseIcon(true);
    } else {
        state.isCollapsed = false;
        elements.navbar?.classList.remove('collapsed');
        updateCollapseIcon(false);
    }
}

// ========================================
// Enlace activo
// ========================================

function setActiveLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    elements.navLinks?.forEach(function (link) {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        link.classList.remove('active');

        const linkPage = href.substring(href.lastIndexOf('/') + 1);

        if (currentPage === linkPage) {
            link.classList.add('active');
        } else if (currentPath === href) {
            link.classList.add('active');
        } else if (href !== '/' && currentPath.startsWith(href)) {
            link.classList.add('active');
        }
    });
}

// ========================================
// Usuario
// ========================================

function loadUserInfo() {
    try {
        const session = localStorage.getItem('outlet_user');
        if (session) {
            const user = JSON.parse(session);
            if (elements.userName) {
                elements.userName.textContent = user.nombre || user.name || 'Administrador';
            }
            if (elements.userEmail) {
                elements.userEmail.textContent = user.email || '';
            }
        }
    } catch (e) {
        console.error('Error cargando info de usuario:', e);
    }
}

// ========================================
// Logout CON SWEETALERT2
// ========================================

async function handleLogout(e) {
    e.preventDefault();

    const result = await mostrarConfirmacion(
        '¿Cerrar sesión?',
        '¿Estás seguro de que deseas cerrar sesión?',
        'Sí, cerrar sesión'
    );

    if (!result.isConfirmed) return;

    try {
        const AuthModule = await import('../../../services/authService.js');
        const AuthService = AuthModule.AuthService;
        await AuthService.logout();
    } catch (error) {
        console.error('Error en logout:', error);
    }

    localStorage.removeItem('outlet_admin');
    localStorage.removeItem('outlet_user');
    sessionStorage.clear();

    await mostrarExito('Sesión cerrada', 'Has cerrado sesión exitosamente.');

    window.location.href = '/';
}

// ========================================
// Tema
// ========================================

function toggleTheme() {
    const isDark = ThemeService.toggle();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);

    window.dispatchEvent(new CustomEvent('theme:changed', { detail: { isDark: isDark } }));
}

function updateThemeButtonIcon(isDark) {
    if (!elements.themeBtn) return;
    const icon = elements.themeBtn.querySelector('i');
    if (icon) {
        icon.className = 'fas ' + (isDark ? 'fa-sun' : 'fa-moon');
    }
}

function applyStoredTheme() {
    const isDark = ThemeService.isDarkMode();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);
}

// ========================================
// Exportaciones
// ========================================

export function getAdminNavState() {
    return { ...state };
}

export function collapseAdminNav() {
    if (!state.isCollapsed && window.innerWidth >= MOBILE_BREAKPOINT) {
        toggleCollapse();
    }
}

export function expandAdminNav() {
    if (state.isCollapsed && window.innerWidth >= MOBILE_BREAKPOINT) {
        toggleCollapse();
    }
}

export function closeMobileNavExported() {
    if (state.isMobileOpen) {
        closeMobileNav();
    }
}

export function openMobileNavExported() {
    if (!state.isMobileOpen && window.innerWidth < MOBILE_BREAKPOINT) {
        openMobileNav();
    }
}

export function toggleMobileNavExported() {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
        toggleMobileNav();
    }
}

export function navigateToCategoriesExported() {
    navigateToCategories();
}