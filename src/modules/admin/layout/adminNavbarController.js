/* ========================================
   ADMIN NAVBAR CONTROLLER - OUTLET LUXURY EDITION
   Controlador del navbar VERTICAL para administrador
   CON SOPORTE COMPLETO PARA MÓVIL
   ======================================== */

import ThemeService from '../../shared/layout/themeService.js';

// Estado privado
let state = {
    isCollapsed: false,
    isDarkMode: false,
    isMobileOpen: false
};

// Elementos DOM cacheados
let elements = {};

// Breakpoint para móvil
const MOBILE_BREAKPOINT = 768;

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
    
    console.log('✅ Admin Navbar Controller inicializado correctamente');
}

/**
 * Cachea elementos del DOM
 */
function cacheElements() {
    elements = {
        navbar: document.querySelector('.OUTLET-admin-nav'),
        collapseBtn: document.getElementById('adminCollapseBtn'),
        logoutBtn: document.getElementById('adminLogoutBtn'),
        themeBtn: document.getElementById('adminThemeToggleBtn'),
        mobileToggleBtn: document.getElementById('adminMobileToggleBtn'),
        navOverlay: document.getElementById('adminNavOverlay'),
        navLinks: document.querySelectorAll('.admin-nav-links a'),
        userName: document.getElementById('adminUserName'),
        userEmail: document.getElementById('adminUserEmail'),
        body: document.body
    };
    
    console.log('📦 Elementos cacheados:', {
        navbar: !!elements.navbar,
        mobileToggle: !!elements.mobileToggleBtn,
        overlay: !!elements.navOverlay
    });
}

/**
 * Vincula eventos del DOM
 */
function bindEvents() {
    // Botón colapsar (escritorio)
    if (elements.collapseBtn) {
        elements.collapseBtn.addEventListener('click', toggleCollapse);
    }
    
    // Botón hamburguesa (móvil)
    if (elements.mobileToggleBtn) {
        console.log('🔗 Vinculando evento al botón hamburguesa');
        // Eliminar eventos anteriores para evitar duplicados
        const newBtn = elements.mobileToggleBtn.cloneNode(true);
        elements.mobileToggleBtn.parentNode.replaceChild(newBtn, elements.mobileToggleBtn);
        elements.mobileToggleBtn = newBtn;
        elements.mobileToggleBtn.addEventListener('click', toggleMobileNav);
    } else {
        console.warn('⚠️ Botón hamburguesa no encontrado');
    }
    
    // Overlay (móvil)
    if (elements.navOverlay) {
        elements.navOverlay.addEventListener('click', closeMobileNav);
    }
    
    // Botón logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Modo oscuro
    if (elements.themeBtn) {
        elements.themeBtn.addEventListener('click', toggleTheme);
    }
    
    // Escuchar cambios de ruta
    document.addEventListener('route:changed', () => {
        setActiveLink();
        if (state.isMobileOpen) {
            closeMobileNav();
        }
    });
    
    // Escuchar cambios de tamaño de ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
    
    // Cerrar menú al hacer clic en un enlace (móvil)
    if (elements.navLinks) {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < MOBILE_BREAKPOINT && state.isMobileOpen) {
                    setTimeout(closeMobileNav, 300);
                }
            });
        });
    }
}

/**
 * Maneja el comportamiento responsive
 */
function handleMobileResponsive() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    console.log('📱 Modo móvil:', isMobile);
    
    if (isMobile) {
        // Modo móvil
        elements.navbar?.classList.remove('collapsed');
        elements.navbar?.classList.add('mobile-hidden');
        
        if (elements.collapseBtn) {
            elements.collapseBtn.style.display = 'none';
        }
        
        // Asegurar que el main no tenga margen
        document.querySelector('main')?.classList.add('mobile-main');
        
    } else {
        // Modo escritorio
        elements.navbar?.classList.remove('mobile-hidden', 'open');
        
        if (elements.navOverlay) {
            elements.navOverlay.classList.remove('active');
            elements.navOverlay.style.display = 'none';
        }
        
        if (elements.collapseBtn) {
            elements.collapseBtn.style.display = '';
        }
        
        // Restaurar estado colapsado
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

/**
 * Maneja cambios de tamaño de ventana
 */
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

/**
 * Alterna el navbar en móvil (abrir/cerrar)
 */
function toggleMobileNav() {
    console.log('🔄 Toggle móvil clickeado');
    console.log('Estado actual:', state.isMobileOpen);
    
    if (state.isMobileOpen) {
        closeMobileNav();
    } else {
        openMobileNav();
    }
}

/**
 * Abre el navbar en móvil
 */
function openMobileNav() {
    console.log('📱 Abriendo menú móvil');
    state.isMobileOpen = true;
    
    // Eliminar clase oculta y agregar clase abierta
    elements.navbar?.classList.remove('mobile-hidden');
    elements.navbar?.classList.add('open');
    
    // Mostrar overlay
    if (elements.navOverlay) {
        elements.navOverlay.classList.add('active');
        elements.navOverlay.style.display = 'block';
    }
    
    // Deshabilitar scroll del body
    document.body.style.overflow = 'hidden';
    
    // Actualizar ícono del botón hamburguesa
    updateMobileToggleIcon(true);
    
    console.log('✅ Navbar abierto, clases:', elements.navbar?.className);
}

/**
 * Cierra el navbar en móvil
 */
function closeMobileNav() {
    console.log('📱 Cerrando menú móvil');
    state.isMobileOpen = false;
    
    // Quitar clase abierta y agregar oculta
    elements.navbar?.classList.remove('open');
    elements.navbar?.classList.add('mobile-hidden');
    
    // Ocultar overlay
    if (elements.navOverlay) {
        elements.navOverlay.classList.remove('active');
        elements.navOverlay.style.display = 'none';
    }
    
    // Habilitar scroll del body
    document.body.style.overflow = '';
    
    // Actualizar ícono del botón hamburguesa
    updateMobileToggleIcon(false);
    
    console.log('✅ Navbar cerrado');
}

/**
 * Actualiza el ícono del botón hamburguesa
 */
function updateMobileToggleIcon(isOpen) {
    if (!elements.mobileToggleBtn) {
        console.warn('⚠️ Botón hamburguesa no encontrado para actualizar ícono');
        return;
    }
    const icon = elements.mobileToggleBtn.querySelector('i');
    if (icon) {
        icon.className = `fas ${isOpen ? 'fa-times' : 'fa-bars'}`;
        console.log('✅ Ícono actualizado a:', icon.className);
    }
}

/**
 * Alterna colapso del navbar vertical (escritorio)
 */
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

/**
 * Actualiza el ícono del botón colapsar
 */
function updateCollapseIcon(isCollapsed) {
    if (!elements.collapseBtn) return;
    const icon = elements.collapseBtn.querySelector('i');
    if (icon) {
        icon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }
}

/**
 * Restaura estado colapsado guardado
 */
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

/**
 * Establece enlace activo según ruta actual
 */
function setActiveLink() {
    const currentPath = window.location.pathname;
    
    elements.navLinks?.forEach(link => {
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
 * Carga información del usuario desde localStorage
 */
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

/**
 * Maneja cierre de sesión
 */
async function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        try {
            const { AuthService } = await import('../../../services/authService.js');
            await AuthService.logout();
        } catch (error) {
            console.error('Error en logout:', error);
        }
        
        localStorage.removeItem('outlet_admin');
        localStorage.removeItem('outlet_user');
        sessionStorage.clear();
        
        window.location.href = '/';
    }
}

/**
 * Alterna modo oscuro
 */
function toggleTheme() {
    const isDark = ThemeService.toggle();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);
    
    window.dispatchEvent(new CustomEvent('theme:changed', { detail: { isDark } }));
}

/**
 * Actualiza el ícono del botón de tema
 */
function updateThemeButtonIcon(isDark) {
    if (!elements.themeBtn) return;
    const icon = elements.themeBtn.querySelector('i');
    if (icon) {
        icon.className = `fas ${isDark ? 'fa-sun' : 'fa-moon'}`;
    }
}

/**
 * Aplica el tema guardado
 */
function applyStoredTheme() {
    const isDark = ThemeService.isDarkMode();
    state.isDarkMode = isDark;
    updateThemeButtonIcon(isDark);
}

// ============================================
// EXPORTACIONES PÚBLICAS
// ============================================

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