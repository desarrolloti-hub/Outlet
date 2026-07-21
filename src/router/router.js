/* ========================================
   ROUTER - Con redirección inicial por rol
   ======================================== */

import { routes } from './routes.js';
import { AuthService, ROLES } from '../services/authService.js';

let isNavigating = false;

// ✅ RUTAS PROTEGIDAS - SOLO /cart Y /wishlist
const PROTECTED_ROUTES = ['/cart', '/wishlist'];

// ✅ RUTAS QUE DEBEN REDIRIGIR SEGÚN ROL
const ROLE_REDIRECT = {
    '/': {
        admin: '/homeAdmin',
        customer: '/homeCustomer',
        guest: '/'
    },
    '/products': {
        admin: '/productsList',
        customer: '/productsCustomer',
        guest: '/products'
    },
    '/collection': {
        admin: '/productsList',
        customer: '/collectionCustomer',
        guest: '/collection'
    },
    '/cart': {
        admin: '/cart',
        customer: '/cartCustomer',
        guest: '/cart'
    },
    '/wishlist': {
        admin: '/wishlist',
        customer: '/wishlistCustomer',
        guest: '/wishlist'
    }
};

// ✅ Verificar autenticación
function isUserAuthenticated() {
    const user = localStorage.getItem('outlet_user');
    const session = sessionStorage.getItem('outlet_session');
    const userData = localStorage.getItem('userData');
    const sessionData = sessionStorage.getItem('sessionData');
    const token = localStorage.getItem('auth_token');
    const sessionToken = sessionStorage.getItem('auth_token');

    return !!(user || session || userData || sessionData || token || sessionToken);
}

// ✅ Obtener rol del usuario
function getUserRole() {
    // Primero verificar admin
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
        try {
            const data = JSON.parse(adminData);
            if (data && data.id) return 'admin';
        } catch { }
    }

    // Verificar customer
    const customerData = localStorage.getItem('customerData');
    if (customerData) {
        try {
            const data = JSON.parse(customerData);
            if (data && data.id) return 'customer';
        } catch { }
    }

    // Verificar sesión de admin
    const adminSession = sessionStorage.getItem('adminSession');
    if (adminSession) {
        try {
            const data = JSON.parse(adminSession);
            if (data && data.id) return 'admin';
        } catch { }
    }

    // Verificar sesión de customer
    const customerSession = sessionStorage.getItem('customerSession');
    if (customerSession) {
        try {
            const data = JSON.parse(customerSession);
            if (data && data.id) return 'customer';
        } catch { }
    }

    // Verificar AuthService
    try {
        const role = AuthService.getUserRoleSync();
        if (role === 'admin' || role === 'customer') return role;
    } catch { }

    return 'guest';
}

/**
 * Inicializa el router
 */
export function initRouter() {
    // Escuchar clicks en enlaces con data-link
    document.addEventListener('click', async (e) => {
        const link = e.target.closest('[data-link]');
        if (link && !isNavigating) {
            e.preventDefault();
            e.stopPropagation();
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                await navigateTo(href);
            }
        }
    });

    // Escuchar navegación con popstate
    window.addEventListener('popstate', async () => {
        if (!isNavigating) {
            await handleRoute();
        }
    });

    // Exponer navigateTo globalmente
    window.navigateTo = navigateTo;

    // Manejar ruta inicial con redirección
    handleInitialRoute();
}

/**
 * Obtiene la ruta correcta según el rol
 */
function getRedirectPath(path, role) {
    const redirects = ROLE_REDIRECT[path];
    if (!redirects) return path;

    // Si es admin y tiene ruta específica
    if (role === 'admin' && redirects.admin) {
        return redirects.admin;
    }

    // Si es customer y tiene ruta específica
    if (role === 'customer' && redirects.customer) {
        return redirects.customer;
    }

    // Guest o sin redirección específica
    return redirects.guest || path;
}

/**
 * Maneja la ruta inicial
 */
async function handleInitialRoute() {
    const currentPath = window.location.pathname;
    const role = getUserRole();

    console.log('📍 Ruta inicial:', currentPath);
    console.log('👤 Rol detectado:', role);

    // ✅ Si es admin o customer, redirigir a su versión de la ruta
    if (role === 'admin' || role === 'customer') {
        const redirectPath = getRedirectPath(currentPath, role);
        if (redirectPath && redirectPath !== currentPath) {
            console.log(`🔄 Redirigiendo de ${currentPath} a ${redirectPath} (rol: ${role})`);
            window.history.replaceState({}, '', redirectPath);
            await handleRoute();
            return;
        }
    }

    // ✅ SOLO VERIFICAR /cart Y /wishlist para guest
    if (PROTECTED_ROUTES.includes(currentPath) && !isUserAuthenticated()) {
        console.log('🔒 Ruta protegida detectada en inicio, redirigiendo...');
        window.history.replaceState({}, '', '/createAccount');
        await handleRoute();
        return;
    }

    await handleRoute();
}

/**
 * Navega a una ruta específica
 */
async function navigateTo(path) {
    if (isNavigating) return;
    isNavigating = true;

    // ✅ Si es admin o customer, redirigir a su versión de la ruta
    const role = getUserRole();
    if (role === 'admin' || role === 'customer') {
        const redirectPath = getRedirectPath(path, role);
        if (redirectPath && redirectPath !== path) {
            console.log(`🔄 Navegando de ${path} a ${redirectPath} (rol: ${role})`);
            path = redirectPath;
        }
    }

    // ✅ SOLO VERIFICAR /cart Y /wishlist para guest
    if (PROTECTED_ROUTES.includes(path) && !isUserAuthenticated()) {
        console.log('🔒 Intento de navegación a ruta protegida, redirigiendo...');
        window.history.pushState({}, '', '/createAccount');
        await handleRoute();
        isNavigating = false;
        return;
    }

    window.history.pushState({}, '', path);
    await handleRoute();

    isNavigating = false;
}

/**
 * Maneja la ruta actual
 */
async function handleRoute() {
    const path = window.location.pathname;

    console.log('📍 Navegando a:', path);

    // ✅ Si es admin o customer, redirigir a su versión de la ruta
    const role = getUserRole();
    if (role === 'admin' || role === 'customer') {
        const redirectPath = getRedirectPath(path, role);
        if (redirectPath && redirectPath !== path) {
            console.log(`🔄 Redirigiendo de ${path} a ${redirectPath} (rol: ${role})`);
            window.history.replaceState({}, '', redirectPath);
            await handleRoute();
            return;
        }
    }

    // ✅ SOLO VERIFICAR /cart Y /wishlist para guest
    if (PROTECTED_ROUTES.includes(path) && !isUserAuthenticated()) {
        console.log('🔒 Ruta protegida detectada, redirigiendo...');
        window.history.replaceState({}, '', '/createAccount');
        await handleRoute();
        return;
    }

    // Disparar evento antes de cambiar ruta
    document.dispatchEvent(new CustomEvent('route:changing', {
        detail: { path }
    }));

    // Buscar ruta
    let route = routes[path];

    if (!route) {
        route = routes['/404'] || routes['/'];
    }

    try {
        // Cargar vista
        const response = await fetch(route.view);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        // Insertar en el DOM
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = html;
        }

        // Esperar a que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 0));

        // Ejecutar controller de la vista si existe
        if (route.controller && typeof route.controller === 'function') {
            await route.controller();
        }

        // Scroll to top
        window.scrollTo(0, 0);

        console.log(`✅ Vista cargada: ${path}`);

        // Disparar evento después de cambiar ruta
        document.dispatchEvent(new CustomEvent('route:changed', {
            detail: { path }
        }));

    } catch (error) {
        console.error('❌ Error cargando ruta:', error);
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div style="text-align:center;padding:50px;">
                    <h1>Error cargando página</h1>
                    <p>${error.message}</p>
                    <button onclick="window.navigateTo('/')">Volver al inicio</button>
                </div>
            `;
        }
    }
}