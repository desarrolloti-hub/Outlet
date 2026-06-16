/* ========================================
   ADMIN NAVBAR CONTROLLER - OUTLET LUXURY EDITION
   Controlador del navbar VERTICAL para administrador
   Versión mejorada - No fuerza colores oscuros
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
    cacheElements();
    
    if (!elements.navbar) {
        console.warn('⚠️ Admin Navbar no encontrado en el DOM');
        return;
    }
    
    bindEvents();
    applyStoredTheme();
    restoreCollapsedState();
    setActiveLink();
    loadUserInfo();
    handleMobileResponsive();
    
    console.log('✅ Admin Navbar Controller (vertical - luxury edition con móvil) inicializado');
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
        elements.mobileToggleBtn.addEventListener('click', toggleMobileNav);
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
        // Cerrar menú móvil al cambiar de ruta
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
    
    if (isMobile) {
        // Modo móvil
        elements.navbar?.classList.remove('collapsed');
        
        if (!state.isMobileOpen) {
            elements.navbar?.classList.add('mobile-hidden');
        }
        
        // Ocultar botón colapsar en móvil
        if (elements.collapseBtn) {
            elements.collapseBtn.style.display = 'none';
        }
        
    } else {
        // Modo escritorio
        elements.navbar?.classList.remove('mobile-hidden', 'mobile-open');
        
        if (elements.navOverlay) {
            elements.navOverlay.classList.remove('active');
        }
        
        // Mostrar botón colapsar
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
        
        // Habilitar scroll del body
        document.body.style.overflow = '';
    }
}

/**
 * Maneja cambios de tamaño de ventana
 */
function handleResize() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    
    if (isMobile && !state.isMobileOpen) {
        // Si es móvil y el navbar no está abierto, asegurar que esté oculto
        elements.navbar?.classList.add('mobile-hidden');
        elements.navbar?.classList.remove('mobile-open');
        
        if (elements.navOverlay) {
            elements.navOverlay.classList.remove('active');
        }
        
        // Actualizar ícono del botón hamburguesa
        updateMobileToggleIcon(false);
        
    } else if (!isMobile && state.isMobileOpen) {
        // Si pasa a escritorio y el menú móvil estaba abierto, cerrarlo
        closeMobileNav();
    }
}

/**
 * Alterna el navbar en móvil (abrir/cerrar)
 */
function toggleMobileNav() {
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
    state.isMobileOpen = true;
    elements.navbar?.classList.remove('mobile-hidden');
    elements.navbar?.classList.add('mobile-open');
    
    if (elements.navOverlay) {
        elements.navOverlay.classList.add('active');
    }
    
    // Deshabilitar scroll del body
    document.body.style.overflow = 'hidden';
    
    // Actualizar ícono del botón hamburguesa
    updateMobileToggleIcon(true);
}

/**
 * Cierra el navbar en móvil
 */
function closeMobileNav() {
    state.isMobileOpen = false;
    elements.navbar?.classList.remove('mobile-open');
    elements.navbar?.classList.add('mobile-hidden');
    
    if (elements.navOverlay) {
        elements.navOverlay.classList.remove('active');
    }
    
    // Habilitar scroll del body
    document.body.style.overflow = '';
    
    // Actualizar ícono del botón hamburguesa
    updateMobileToggleIcon(false);
}

/**
 * Actualiza el ícono del botón hamburguesa
 */
function updateMobileToggleIcon(isOpen) {
    if (!elements.mobileToggleBtn) return;
    const icon = elements.mobileToggleBtn.querySelector('i');
    if (icon) {
        icon.className = `fas ${isOpen ? 'fa-times' : 'fa-bars'}`;
    }
}

/**
 * Alterna colapso del navbar vertical (escritorio)
 */
function toggleCollapse() {
    // Solo permitir en escritorio
    if (window.innerWidth < MOBILE_BREAKPOINT) return;
    
    state.isCollapsed = !state.isCollapsed;
    elements.navbar?.classList.toggle('collapsed', state.isCollapsed);
    
    // Guardar estado en localStorage
    localStorage.setItem('admin_nav_collapsed', state.isCollapsed);
    
    // Actualizar ícono del botón
    updateCollapseIcon(state.isCollapsed);
    
    // Disparar evento para ajustar el main
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
    // No restaurar en móvil
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
            const { AuthService } = await import('/services/authService.js');
            await AuthService.logout();
        } catch (error) {
            console.error('Error en logout:', error);
        }
        
        // Limpieza FORZADA siempre (funcione o no el servicio)
        localStorage.removeItem('outlet_admin');
        localStorage.removeItem('outlet_user');
        sessionStorage.clear();
        
        // Redirigir al visitante
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
    
    // Disparar evento para que otros componentes se actualicen
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

/**
 * Obtiene el estado actual del navbar
 */
export function getAdminNavState() {
    return { ...state };
}

/**
 * Colapsa el navbar (solo escritorio)
 */
export function collapseAdminNav() {
    if (!state.isCollapsed && window.innerWidth >= MOBILE_BREAKPOINT) {
        toggleCollapse();
    }
}

/**
 * Expande el navbar (solo escritorio)
 */
export function expandAdminNav() {
    if (state.isCollapsed && window.innerWidth >= MOBILE_BREAKPOINT) {
        toggleCollapse();
    }
}

/**
 * Cierra el menú móvil desde otros módulos
 */
export function closeMobileNavExported() {
    if (state.isMobileOpen) {
        closeMobileNav();
    }
}

/**
 * Abre el menú móvil desde otros módulos
 */
export function openMobileNavExported() {
    if (!state.isMobileOpen && window.innerWidth < MOBILE_BREAKPOINT) {
        openMobileNav();
    }
}

/**
 * Alterna el menú móvil desde otros módulos
 */
export function toggleMobileNavExported() {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
        toggleMobileNav();
    }
}