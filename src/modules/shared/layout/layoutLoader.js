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
        navbar: '/modules/customer/layout/navbarCustumer.html',  // ⚠️ Verifica el nombre del archivo
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
        // Inicializar controlador de admin
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
        
        // INICIALIZAR CONTROLADOR DE CUSTOMER (SOLO FOOTER)
        if (role === ROLES.CUSTOMER) {
            console.log('🎮 Inicializando controladores de customer...');
            
            // Esperar un poco para que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Inicializar footer controller (SÍ existe)
            try {
                const footerModule = await import('../../customer/layout/footerCustomerController.js');
                if (footerModule && typeof footerModule.initFooterController === 'function') {
                    footerModule.initFooterController();
                    console.log('✅ Footer Customer Controller inicializado');
                } else {
                    console.warn('⚠️ No se encontró initFooterController en el módulo');
                }
            } catch (error) {
                console.error('❌ Error importando footerCustomerController:', error);
            }
            
            // ✅ ELIMINADO: No existe navbarCustomerController.js
            // Si quieres agregarlo después, crea el archivo primero
            
            // ✅ Alternativa: si el navbar de customer es el mismo que el de guest
            // puedes inicializar el controlador de guest
            try {
                const guestNavbarModule = await import('../../visitor/layout/navbarController.js');
                if (guestNavbarModule && typeof guestNavbarModule.initNavbarController === 'function') {
                    guestNavbarModule.initNavbarController();
                    console.log('✅ Navbar Controller (guest) inicializado para customer');
                }
            } catch (error) {
                console.log('ℹ️ No se encontró navbarController de guest');
            }
        }
        
        // Inicializar controladores de guest (visitante)
        if (role === ROLES.GUEST) {
            console.log('🎮 Inicializando controladores de guest...');
            
            await new Promise(resolve => setTimeout(resolve, 150));
            
            try {
                const footerModule = await import('../../visitor/layout/footerController.js');
                if (footerModule && typeof footerModule.initFooterController === 'function') {
                    footerModule.initFooterController();
                    console.log('✅ Footer Guest Controller inicializado');
                }
            } catch (error) {
                console.error('❌ Error importando footerController de guest:', error);
            }
            
            // Inicializar navbar de guest
            try {
                const navbarModule = await import('../../visitor/layout/navbarController.js');
                if (navbarModule && typeof navbarModule.initNavbarController === 'function') {
                    navbarModule.initNavbarController();
                    console.log('✅ Navbar Guest Controller inicializado');
                }
            } catch (error) {
                console.error('❌ Error importando navbarController de guest:', error);
            }
        }
        
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
    if (navbarLoaded || footerLoaded) {
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