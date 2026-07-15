/* ========================================
   ADMIN NAVBAR CONTROLLER - OUTLET LUXURY EDITION
   Controlador del navbar VERTICAL para administrador
   CON SOPORTE COMPLETO PARA MÓVIL
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import ThemeService from '../../shared/layout/themeService.js';

// Estado privado
var state = {
    isCollapsed: false,
    isDarkMode: false,
    isMobileOpen: false
};

// Elementos DOM cacheados
var elements = {};

// Breakpoint para móvil
var MOBILE_BREAKPOINT = 768;

// Rutas del admin
var ADMIN_ROUTES = {
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

/**
 * Muestra un toast personalizado (estilo OUTLET)
 */
function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    var toastExistente = document.querySelector('.outlet-toast');
    if (toastExistente) toastExistente.remove();
    
    var toast = document.createElement('div');
    toast.className = 'outlet-toast ' + tipo;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    requestAnimationFrame(function() {
        toast.classList.add('show');
    });
    
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3200);
}

/**
 * Muestra una SweetAlert2 personalizada
 */
function mostrarSweetAlert(options) {
    var defaultOptions = {
        buttonsStyling: false,
        customClass: {
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel',
            popup: 'swal2-popup'
        }
    };
    
    return Swal.fire(Object.assign({}, defaultOptions, options));
}

/**
 * Muestra alerta de confirmación
 */
function mostrarConfirmacion(titulo, mensaje, confirmText) {
    confirmText = confirmText || 'Sí, confirmar';
    return mostrarSweetAlert({
        title: titulo || '¿Estás seguro?',
        text: mensaje || 'Esta acción requiere tu confirmación.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar'
    });
}

/**
 * Muestra alerta de éxito
 */
function mostrarExito(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'success',
        title: titulo || '¡Perfecto!',
        text: mensaje || 'La acción se completó con éxito.',
        confirmButtonText: 'Aceptar'
    });
}

/**
 * Muestra alerta de error
 */
function mostrarError(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'error',
        title: titulo || '¡Oops!',
        text: mensaje || 'Ocurrió un error inesperado.',
        confirmButtonText: 'Entendido'
    });
}

// ========================================
// Inicialización
// ========================================

/**
 * Inicializa el controlador del navbar de administrador
 */
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
    elements = {
        navbar: document.querySelector('.OUTLET-admin-nav'),
        collapseBtn: document.getElementById('adminCollapseBtn'),
        logoutBtn: document.getElementById('adminLogoutBtn'),
        themeBtn: document.getElementById('adminThemeToggleBtn'),
        mobileToggleBtn: document.getElementById('adminMobileToggleBtn'),
        navOverlay: document.getElementById('adminNavOverlay'),
        navLinks: document.querySelectorAll('.admin-nav-links a'),
        categoriesLink: document.querySelector('.admin-nav-links a[href*="categories"]'),
        userName: document.getElementById('adminUserName'),
        userEmail: document.getElementById('adminUserEmail'),
        body: document.body
    };
    
    console.log('📦 Elementos cacheados:', {
        navbar: !!elements.navbar,
        mobileToggle: !!elements.mobileToggleBtn,
        overlay: !!elements.navOverlay,
        categoriesLink: !!elements.categoriesLink
    });
}

// ========================================
// Configuración de enlaces
// ========================================

function setupNavigationLinks() {
    if (elements.categoriesLink) {
        console.log('🔗 Configurando enlace de categorías');
        
        var newLink = elements.categoriesLink.cloneNode(true);
        elements.categoriesLink.parentNode.replaceChild(newLink, elements.categoriesLink);
        elements.categoriesLink = newLink;
        
        elements.categoriesLink.addEventListener('click', function(e) {
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
    
    elements.navLinks?.forEach(function(link) {
        if (link === elements.categoriesLink) return;
        
        link.addEventListener('click', function(e) {
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
    
    var currentPath = window.location.pathname;
    var targetPath = '';
    
    if (currentPath.includes('/admin/') || currentPath.includes('/admin')) {
        targetPath = './readCategories.html';
    } else {
        targetPath = '/admin/readCategories.html';
    }
    
    if (currentPath.includes('/pages/') && !currentPath.includes('/admin/')) {
        targetPath = '../admin/readCategories.html';
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
        var newBtn = elements.mobileToggleBtn.cloneNode(true);
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
    
    document.addEventListener('route:changed', function() {
        setActiveLink();
        if (state.isMobileOpen) {
            closeMobileNav();
        }
    });
    
    var resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
}

// ========================================
// Responsive
// ========================================

function handleMobileResponsive() {
    var isMobile = window.innerWidth < MOBILE_BREAKPOINT;
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
        
        var saved = localStorage.getItem('admin_nav_collapsed');
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
    var isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    
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
    var icon = elements.mobileToggleBtn.querySelector('i');
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
    var icon = elements.collapseBtn.querySelector('i');
    if (icon) {
        icon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }
}

function restoreCollapsedState() {
    if (window.innerWidth < MOBILE_BREAKPOINT) return;
    
    var saved = localStorage.getItem('admin_nav_collapsed');
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
    var currentPath = window.location.pathname;
    var currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    elements.navLinks?.forEach(function(link) {
        var href = link.getAttribute('href');
        if (!href || href === '#') return;
        
        link.classList.remove('active');
        
        var linkPage = href.substring(href.lastIndexOf('/') + 1);
        
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
        var session = localStorage.getItem('outlet_user');
        if (session) {
            var user = JSON.parse(session);
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
    
    var result = await mostrarConfirmacion(
        '¿Cerrar sesión?',
        '¿Estás seguro de que deseas cerrar sesión?',
        'Sí, cerrar sesión'
    );
    
    if (!result.isConfirmed) return;
    
    try {
        var AuthModule = await import('../../../services/authService.js');
        var AuthService = AuthModule.AuthService;
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
    var isDark = ThemeService.toggle();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);
    
    window.dispatchEvent(new CustomEvent('theme:changed', { detail: { isDark: isDark } }));
}

function updateThemeButtonIcon(isDark) {
    if (!elements.themeBtn) return;
    var icon = elements.themeBtn.querySelector('i');
    if (icon) {
        icon.className = 'fas ' + (isDark ? 'fa-sun' : 'fa-moon');
    }
}

function applyStoredTheme() {
    var isDark = ThemeService.isDarkMode();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);
}

// ========================================
// Exportaciones
// ========================================

export function getAdminNavState() {
    return Object.assign({}, state);
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