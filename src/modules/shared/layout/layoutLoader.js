/* ========================================
   LOAD LAYOUT - Con inicialización de controladores
   ======================================== */

import { AuthService, ROLES } from '../../../services/authService.js';

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
        navbar: '/modules/customer/layout/navbarCustumer.html',
        footer: '/modules/customer/layout/footerCustomer.html'
    }
};

// ========================================
// ELIMINAR PROMO BANNER - SOLUCIÓN DEFINITIVA
// ========================================

function eliminarPromoBanner() {
    console.log('🗑️ Buscando y eliminando promo banners...');

    // Selectores comunes de banners
    const selectores = [
        '.promo-banner',
        '.promo-bar',
        '.banner-promo',
        '[class*="promo"]',
        '[id*="promo"]',
        '[class*="banner"]',
        '[id*="banner"]',
        '.top-banner',
        '.notification-bar',
        '.alert-banner'
    ];

    let eliminados = 0;

    selectores.forEach(selector => {
        try {
            const elementos = document.querySelectorAll(selector);
            elementos.forEach(el => {
                // Verificar si es un banner (por su contenido o clase)
                const texto = el.textContent?.toLowerCase() || '';
                const esBanner =
                    texto.includes('oferta') ||
                    texto.includes('descuento') ||
                    texto.includes('promo') ||
                    texto.includes('promoción') ||
                    texto.includes('%') ||
                    texto.includes('rebaja') ||
                    el.className?.toLowerCase().includes('promo') ||
                    el.id?.toLowerCase().includes('promo') ||
                    el.className?.toLowerCase().includes('banner') ||
                    el.id?.toLowerCase().includes('banner');

                if (esBanner) {
                    // Ocultar completamente
                    el.style.display = 'none';
                    el.style.height = '0';
                    el.style.minHeight = '0';
                    el.style.maxHeight = '0';
                    el.style.overflow = 'hidden';
                    el.style.margin = '0';
                    el.style.padding = '0';
                    el.style.border = 'none';
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                    el.style.visibility = 'hidden';

                    // Si tiene contenedor padre con padding/margin, también lo ocultamos
                    if (el.parentElement) {
                        const parent = el.parentElement;
                        if (parent.children.length === 1) {
                            // Si el padre solo tiene este elemento, lo ocultamos también
                            parent.style.margin = '0';
                            parent.style.padding = '0';
                            parent.style.height = '0';
                            parent.style.minHeight = '0';
                            parent.style.maxHeight = '0';
                            parent.style.overflow = 'hidden';
                            parent.style.display = 'none';
                        }
                    }

                    eliminados++;
                    console.log(`🗑️ Banner eliminado: ${selector}`, el);
                }
            });
        } catch (e) {
            // Ignorar errores
        }
    });

    if (eliminados > 0) {
        console.log(`✅ ${eliminados} banners eliminados correctamente`);
    } else {
        console.log('ℹ️ No se encontraron banners para eliminar');
    }

    return eliminados;
}

// ========================================
// OBSERVADOR PARA ELIMINAR BANNERS DINÁMICOS
// ========================================

let bannerObserver = null;

function iniciarObservadorBanners() {
    // Detener observador anterior si existe
    if (bannerObserver) {
        bannerObserver.disconnect();
        bannerObserver = null;
    }

    bannerObserver = new MutationObserver((mutations) => {
        let hayCambios = false;

        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Verificar si algún nodo agregado es un banner
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Elemento HTML
                        const texto = node.textContent?.toLowerCase() || '';
                        const esBanner =
                            texto.includes('oferta') ||
                            texto.includes('descuento') ||
                            texto.includes('promo') ||
                            texto.includes('promoción') ||
                            node.className?.toLowerCase().includes('promo') ||
                            node.id?.toLowerCase().includes('promo') ||
                            node.className?.toLowerCase().includes('banner') ||
                            node.id?.toLowerCase().includes('banner');

                        if (esBanner) {
                            hayCambios = true;
                        }
                    }
                });
            }
        });

        if (hayCambios) {
            setTimeout(eliminarPromoBanner, 50);
        }
    });

    // Observar todo el documento
    bannerObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('👀 Observador de banners iniciado');
}

// ========================================

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

        // ===== INICIALIZAR CONTROLADOR DE CUSTOMER =====
        if (role === ROLES.CUSTOMER) {
            console.log('🎮 Inicializando controladores de customer...');

            // ✅ ELIMINAR BANNERS ANTES DE INICIALIZAR
            eliminarPromoBanner();

            await new Promise(resolve => setTimeout(resolve, 150));

            // ✅ Inicializar footer controller
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

            // ✅ INICIALIZAR NAVBAR CUSTOMER
            try {
                const navbarModule = await import('../../customer/layout/navbarCustumerController.js');
                if (navbarModule && typeof navbarModule.initCustomerNavbarController === 'function') {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    navbarModule.initCustomerNavbarController();
                    console.log('✅ Navbar Customer Controller inicializado');
                } else {
                    console.warn('⚠️ No se encontró initCustomerNavbarController en el módulo');
                }
            } catch (error) {
                console.error('❌ Error importando navbarCustumerController:', error);
            }

            // ✅ ELIMINAR BANNERS DESPUÉS DE INICIALIZAR
            setTimeout(eliminarPromoBanner, 300);
            setTimeout(eliminarPromoBanner, 800);
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

    // ✅ INICIAR OBSERVADOR DE BANNERS (solo para customer)
    if (role === ROLES.CUSTOMER) {
        iniciarObservadorBanners();
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