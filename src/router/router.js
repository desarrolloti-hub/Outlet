/* ========================================
   ROUTER - Con redirección inicial por rol
   ======================================== */

import { routes } from './routes.js';
import { AuthService, ROLES } from '../services/authService.js';

let isNavigating = false;

// ✅ RUTAS PROTEGIDAS - SOLO /cart Y /wishlist
const PROTECTED_ROUTES = ['/cart', '/wishlist'];

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

// ✅ Redirigir a createAccount
function redirectToCreateAccount() {
    console.log('🔒 Redirigiendo a /createAccount (usuario no autenticado)');
    window.history.replaceState({}, '', '/createAccount');
    handleRoute();
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
 * Maneja la ruta inicial
 */
async function handleInitialRoute() {
    const currentPath = window.location.pathname;
    const role = AuthService.getUserRoleSync();
    
    console.log('📍 Ruta inicial:', currentPath);
    console.log('👤 Rol detectado:', role);
    
    // ✅ SOLO VERIFICAR /cart Y /wishlist
    if (PROTECTED_ROUTES.includes(currentPath) && !isUserAuthenticated()) {
        console.log('🔒 Ruta protegida detectada en inicio, redirigiendo...');
        window.history.replaceState({}, '', '/createAccount');
        await handleRoute();
        return;
    }
    
    // Redirigir si es admin
    if (role === ROLES.ADMIN) {
        const isVisitorRoute = ['/', '/products', '/collection', '/login', '/wishlist', '/cart', '/createAccount', '/services', '/nosotros', '/contacto', '/blogs'].includes(currentPath);
        
        if (isVisitorRoute || currentPath === '') {
            console.log('🔄 Admin detectado, redirigiendo a /homeAdmin');
            window.history.replaceState({}, '', '/homeAdmin');
            await handleRoute();
            return;
        }
    }
    
    // Si es customer o guest, mantener la ruta actual
    await handleRoute();
}

/**
 * Navega a una ruta específica
 */
async function navigateTo(path) {
    if (isNavigating) return;
    isNavigating = true;
    
    // ✅ SOLO VERIFICAR /cart Y /wishlist
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
    
    // ✅ SOLO VERIFICAR /cart Y /wishlist
    if (PROTECTED_ROUTES.includes(path) && !isUserAuthenticated()) {
        console.log('🔒 Ruta protegida detectada, redirigiendo...');
        window.history.replaceState({}, '', '/createAccount');
        // Llamar recursivamente para manejar la nueva ruta
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