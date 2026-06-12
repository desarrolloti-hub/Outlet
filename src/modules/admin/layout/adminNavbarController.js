/* ========================================
   ADMIN NAVBAR CONTROLLER - OUTLET LUXURY EDITION
   Controlador del navbar VERTICAL para administrador
   Versión mejorada - No fuerza colores oscuros
   ======================================== */

import ThemeService from '../../shared/layout/themeService.js';

// Estado privado
let state = {
    isCollapsed: false,
    isDarkMode: false
};

// Elementos DOM cacheados
let elements = {};

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
    
    console.log('✅ Admin Navbar Controller (vertical - luxury edition) inicializado');
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
    // Botón colapsar
    if (elements.collapseBtn) {
        elements.collapseBtn.addEventListener('click', toggleCollapse);
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
    });
}

/**
 * Alterna colapso del navbar vertical
 */
function toggleCollapse() {
    state.isCollapsed = !state.isCollapsed;
    elements.navbar?.classList.toggle('collapsed', state.isCollapsed);
    
    // Guardar estado en localStorage
    localStorage.setItem('admin_nav_collapsed', state.isCollapsed);
    
    // Actualizar ícono del botón
    if (elements.collapseBtn) {
        const icon = elements.collapseBtn.querySelector('i');
        if (icon) {
            icon.className = state.isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
        }
    }
    
    // Disparar evento para ajustar el main
    window.dispatchEvent(new CustomEvent('admin:nav:toggle', { detail: { collapsed: state.isCollapsed } }));
}

/**
 * Restaura estado colapsado guardado
 */
function restoreCollapsedState() {
    const saved = localStorage.getItem('admin_nav_collapsed');
    if (saved === 'true') {
        state.isCollapsed = true;
        elements.navbar?.classList.add('collapsed');
        if (elements.collapseBtn) {
            const icon = elements.collapseBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-chevron-right';
        }
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
            localStorage.removeItem('outlet_user');
            localStorage.removeItem('outlet_admin_auth');
            window.location.href = '/';
        }
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

// Exponer funciones útiles para otros módulos
export function getAdminNavState() {
    return { ...state };
}

export function collapseAdminNav() {
    if (!state.isCollapsed) {
        toggleCollapse();
    }
}

export function expandAdminNav() {
    if (state.isCollapsed) {
        toggleCollapse();
    }
}