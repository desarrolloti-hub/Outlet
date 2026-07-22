/* ========================================
   MAIN - Inicialización completa
   Orquesta carga de HTML y controladores
   ======================================== */

import { loadLayout, initLayoutWatcher } from './modules/shared/layout/layoutLoader.js';
import { initRouter } from './router/router.js';
import { AuthService, ROLES } from './services/authService.js';
import { ThemeService } from './modules/shared/layout/themeService.js';

function loadExternalScripts() {
    return new Promise((resolve) => {
        if (document.querySelector('script[src*="swiper"]')) {
            resolve();
            return;
        }

        // AOS
        const aosLink = document.createElement('link');
        aosLink.rel = 'stylesheet';
        aosLink.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
        document.head.appendChild(aosLink);

        const aosScript = document.createElement('script');
        aosScript.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
        aosScript.onload = () => window.AOS?.init();
        document.body.appendChild(aosScript);

        // Swiper
        const swiperLink = document.createElement('link');
        swiperLink.rel = 'stylesheet';
        swiperLink.href = 'https://unpkg.com/swiper/swiper-bundle.min.css';
        document.head.appendChild(swiperLink);

        const swiperScript = document.createElement('script');
        swiperScript.src = 'https://unpkg.com/swiper/swiper-bundle.min.js';
        swiperScript.onload = () => {
            window.Swiper = Swiper;
            resolve();
        };
        document.body.appendChild(swiperScript);

        setTimeout(resolve, 3000);
    });
}

/**
 * Inicializa los controladores según el rol
 * Esto se ejecuta DESPUÉS de que el HTML está cargado
 */
async function initLayoutControllers(role) {
    console.log('🎮 Inicializando controladores para rol:', role);

    const controllersMap = {
        [ROLES.ADMIN]: {
            navbar: () => import('./modules/admin/layout/adminNavbarController.js').then(m => m.initAdminNavbarController?.()),
            footer: () => import('./modules/admin/layout/adminFooterController.js').then(m => m.initAdminFooterController?.())
        },
        [ROLES.CUSTOMER]: {
            navbar: () => import('./modules/customer/layout/navbarCustumerController.js').then(m => m.initCustomerNavbarController?.()),
            footer: () => import('./modules/customer/layout/footerCustomerController.js').then(m => m.initFooterCustomerController?.())
        },
        [ROLES.GUEST]: {
            navbar: () => import('./modules/visitor/layout/navbarController.js').then(m => m.initNavbarController?.()),
            footer: () => import('./modules/visitor/layout/footerController.js').then(m => m.initFooterController?.())
        }
    };

    // Si el rol no existe en el mapa, usar GUEST por defecto
    let controllers = controllersMap[role];
    
    if (!controllers) {
        console.warn(`⚠️ Rol "${role}" no tiene controladores definidos, usando GUEST por defecto`);
        controllers = controllersMap[ROLES.GUEST];
    }
    
    if (!controllers) {
        console.error('❌ No hay controladores disponibles');
        return;
    }

    // 🆕 Agregar clase al body para compensar la altura del navbar
    document.body.classList.add('has-navbar-fixed');

    await Promise.all([
        controllers.navbar ? controllers.navbar() : Promise.resolve(),
        controllers.footer ? controllers.footer() : Promise.resolve()
    ]);

    console.log('✅ Controladores inicializados para rol:', role);
}

/**
 * Configura el listener que espera a que el HTML esté cargado
 * para luego inicializar los controladores
 */
function setupLayoutReadyListener() {
    window.addEventListener('layout:loaded', async (event) => {
        const { role } = event.detail;
        console.log('📦 Layout HTML cargado, inicializando controladores...');
        await initLayoutControllers(role);
    });
}

async function initApp() {
    try {
        console.log('🚀 Inicializando aplicación...');

        // 🔥 IMPORTANTE: Inicializar tema ANTES de cargar cualquier otra cosa
        ThemeService.init();
        console.log('🎨 Tema inicializado:', ThemeService.isDarkMode() ? 'dark' : 'light');

        await loadExternalScripts();
        console.log('✅ Scripts externos cargados');

        setupLayoutReadyListener();

        await loadLayout();

        initLayoutWatcher();

        initRouter();

        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
    }
}

initApp();