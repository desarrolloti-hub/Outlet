/* ========================================
   ROUTER - Con redirección inicial por rol
   ======================================== */

import { routes } from './routes.js';
import { AuthService, ROLES } from '../services/authService.js';

let isNavigating = false;

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
    
    // 🔥 Manejar ruta inicial con redirección
    handleInitialRoute();
}

/**
 * Maneja la ruta inicial - SOLO REDIRIGE SI ES ADMIN
 */
async function handleInitialRoute() {
    const currentPath = window.location.pathname;
    const role = AuthService.getUserRoleSync();
    
    console.log('📍 Ruta inicial:', currentPath);
    console.log('👤 Rol detectado:', role);
    
    // 🔥 SOLO redirigir si es admin y no está ya en una ruta de admin
    if (role === ROLES.ADMIN) {
        // Si está en la raíz o en una ruta de visitante, redirigir a homeAdmin
        const isVisitorRoute = ['/', '/products', '/collection', '/login', '/wishlist', '/cart', '/createAccount', '/services', '/nosotros', '/contacto', '/blogs'].includes(currentPath);
        
        if (isVisitorRoute || currentPath === '') {
            console.log('🔄 Admin detectado, redirigiendo a /homeAdmin');
            window.history.replaceState({}, '', '/homeAdmin');
            await handleRoute();
            return;
        }
    }
    
    // Si es customer o guest, mantener la ruta actual
    // Si la ruta no existe, ir a 404 o home
    await handleRoute();
}

/**
 * Navega a una ruta específica
 */
async function navigateTo(path) {
    if (isNavigating) return;
    isNavigating = true;
    
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