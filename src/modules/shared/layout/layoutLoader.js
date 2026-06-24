/* ========================================
   LOAD LAYOUT - Con inicialización de controladores
   ======================================== */

import { AuthService, ROLES } from '../../../../services/authService.js';

const LAYOUT_PATHS = {
    [ROLES.ADMIN]: {
        navbar: '/modules/admin/layout/adminNavbar.html',
        footer: '/modules/admin/layout/adminFooter.html'
    },
    [ROLES.GUEST]: {
        navbar: '/modules/visitor/layout/navbar.html',
        footer: '/modules/visitor/layout/footer.html'
    },
    [ROLES.CUSTOMER]: {
        navbar: '/modules/customer/layout/navbarCustumer.html',  // ✅ Verifica que el nombre del archivo coincida
        footer: '/modules/customer/layout/footerCustomer.html'
    }
};

function getLayoutPaths() {
    const role = AuthService.getUserRoleSync();
    console.log('🎭 Rol detectado para layout:', role);
    return LAYOUT_PATHS[role] || LAYOUT_PATHS[ROLES.GUEST];
}

async function loadComponent(url, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`⚠️ Contenedor #${containerId} no encontrado`);
        return false;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        container.innerHTML = await response.text();
        console.log(`✅ Layout cargado: ${url}`);
        return true;
    } catch (error) {
        console.error(`❌ Error cargando ${url}:`, error);
        return false;
    }
}

/**
 * Inicializa los controladores después de cargar el HTML
 */
async function initializeControllers(role) {
    try {
        // Solo admin tiene controlador específico en el loader
        if (role === ROLES.ADMIN) {
            console.log('🎮 Inicializando controlador del navbar admin...');
            
            const module = await import('../../admin/layout/adminNavbarController.js');
            
            if (module && typeof module.initAdminNavbarController === 'function') {
                await new Promise(resolve => setTimeout(resolve, 150));
                module.initAdminNavbarController();
                console.log('✅ Controlador admin inicializado correctamente');
            } else {
                console.warn('⚠️ No se encontró initAdminNavbarController en el módulo');
            }
        }
        
        // Si necesitas inicializar algo específico para customer aquí
        // puedes agregarlo, pero normalmente se maneja desde main.js
        
    } catch (error) {
        console.error('❌ Error inicializando controladores:', error);
    }
}

export async function loadLayout() {
    console.log('📦 Cargando layouts HTML...');

    const paths = getLayoutPaths();
    const role = AuthService.getUserRoleSync();

    // Cargar componentes HTML
    const [navbarLoaded, footerLoaded] = await Promise.all([
        loadComponent(paths.navbar, 'navbar'),
        loadComponent(paths.footer, 'footer')
    ]);

    // 🚀 INICIALIZAR CONTROLADORES DESPUÉS DE CARGAR EL HTML
    if (navbarLoaded) {
        await initializeControllers(role);
    }

    // Disparar evento layout cargado
    const event = new CustomEvent('layout:loaded', {
        detail: {
            navbarLoaded,
            footerLoaded,
            role: role,
            controllersInitialized: true
        }
    });
    window.dispatchEvent(event);

    console.log('✅ Layouts HTML cargados y controladores inicializados para rol:', role);

    return { navbarLoaded, footerLoaded };
}

export async function reloadLayout() {
    console.log('🔄 Recargando layouts...');

    const navbarContainer = document.getElementById('navbar');
    const footerContainer = document.getElementById('footer');
    if (navbarContainer) navbarContainer.innerHTML = '';
    if (footerContainer) footerContainer.innerHTML = '';

    return await loadLayout();
}

export function initLayoutWatcher() {
    AuthService.onAuthStateChange(() => {
        console.log('🔄 Cambio de autenticación, recargando layouts...');
        setTimeout(() => reloadLayout(), 100);
    });
}