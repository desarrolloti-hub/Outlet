/* ========================================
   LAYOUT LOADER - Outlet Val
   Versión corregida
   ======================================== */

import { AuthService, LAYOUT_PATHS, LAYOUT_CONTROLLERS, ROLES } from '/services/authService.js';

// Cache de elementos DOM
let elements = {
    navbarContainer: null,
    footerContainer: null
};

let currentRole = null;
let isInitialized = false;

/**
 * Inicializa y carga el layout completo
 */
export async function initLayout() {
    console.log('🎯 Iniciando layoutLoader...');
    
    // Cachear elementos
    elements.navbarContainer = document.getElementById('navbar');
    elements.footerContainer = document.getElementById('footer');
    
    console.log('🔍 Contenedor navbar:', elements.navbarContainer);
    console.log('🔍 Contenedor footer:', elements.footerContainer);
    
    if (!elements.navbarContainer || !elements.footerContainer) {
        console.error('❌ Contenedores no encontrados');
        console.error('   Asegúrate de tener en index.html:');
        console.error('   <div id="navbar"></div>');
        console.error('   <div id="footer"></div>');
        return { success: false, error: 'Contenedores no encontrados' };
    }
    
    // Cargar layout inicial
    await loadLayoutByRole();
    
    // Escuchar cambios de autenticación
    AuthService.onAuthStateChange(async (user) => {
        const newRole = user ? AuthService.getUserRoleSync() : ROLES.GUEST;
        if (newRole !== currentRole) {
            console.log(`🔄 Rol cambiado: ${currentRole} → ${newRole}`);
            await loadLayoutByRole();
        }
    });
    
    isInitialized = true;
    return { success: true, role: currentRole };
}

/**
 * Carga el layout según el rol actual
 */
async function loadLayoutByRole() {
    try {
        const role = AuthService.getUserRoleSync();
        currentRole = role;
        
        console.log(`📦 Cargando layout para rol: ${role}`);
        
        const layoutPaths = LAYOUT_PATHS[role];
        if (!layoutPaths) {
            console.error(`❌ No hay layout definido para rol: ${role}`);
            return;
        }
        
        console.log(`📄 Navbar URL: ${layoutPaths.navbar}`);
        console.log(`📄 Footer URL: ${layoutPaths.footer}`);
        
        // Cargar HTMLs
        const navbarResponse = await fetch(layoutPaths.navbar);
        const footerResponse = await fetch(layoutPaths.footer);
        
        if (!navbarResponse.ok) {
            throw new Error(`HTTP ${navbarResponse.status}: ${layoutPaths.navbar}`);
        }
        
        if (!footerResponse.ok) {
            throw new Error(`HTTP ${footerResponse.status}: ${layoutPaths.footer}`);
        }
        
        const navbarHTML = await navbarResponse.text();
        const footerHTML = await footerResponse.text();
        
        console.log(`✅ HTMLs cargados - Navbar: ${navbarHTML.length} bytes, Footer: ${footerHTML.length} bytes`);
        
        // Insertar en el DOM - VERIFICAR QUE EXISTAN LAS VARIABLES
        if (elements.navbarContainer && navbarHTML) {
            elements.navbarContainer.innerHTML = navbarHTML;
            console.log('✅ Navbar insertado en el DOM');
        } else {
            console.error('❌ No se pudo insertar navbar: navbarHTML o contenedor faltante');
        }
        
        if (elements.footerContainer && footerHTML) {
            elements.footerContainer.innerHTML = footerHTML;
            console.log('✅ Footer insertado en el DOM');
        }
        
        // Inicializar controladores
        await initLayoutControllers(role);
        
        // Agregar clase al body
        document.body.classList.remove('role-admin', 'role-visitor', 'role-guest');
        document.body.classList.add(`role-${role}`);
        
        console.log(`✅ Layout cargado exitosamente para rol: ${role}`);
        
    } catch (error) {
        console.error('❌ Error en loadLayoutByRole:', error);
        // No intentes usar navbarHTML aquí porque no está definido
        await loadFallbackLayout();
    }
}

/**
 * Inicializa los controladores
 */
async function initLayoutControllers(role) {
    const controllers = LAYOUT_CONTROLLERS[role];
    if (!controllers) {
        console.warn(`⚠️ No hay controladores para rol: ${role}`);
        return;
    }
    
    // Pequeño delay para asegurar que el DOM se actualizó
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (controllers.navbar) {
        console.log(`🔧 Inicializando navbar controller...`);
        await controllers.navbar();
    }
    
    if (controllers.footer) {
        console.log(`🔧 Inicializando footer controller...`);
        await controllers.footer();
    }
}

/**
 * Layout de respaldo
 */
async function loadFallbackLayout() {
    console.warn('⚠️ Cargando layout de respaldo');
    
    try {
        // HTML mínimo para que se vea algo
        const fallbackHTML = `
            <nav style="background:#1a1a2e; color:white; padding:15px 20px; font-family:sans-serif;">
                <div style="display:flex; justify-content:space-between; align-items:center; max-width:1200px; margin:0 auto;">
                    <div style="font-weight:bold; font-size:1.2rem;">OUTLET</div>
                    <div>
                        <a href="/" style="color:white; margin:0 10px; text-decoration:none;">Inicio</a>
                        <a href="/login" style="color:white; margin:0 10px; text-decoration:none;">Login</a>
                    </div>
                </div>
            </nav>
        `;
        
        if (elements.navbarContainer) {
            elements.navbarContainer.innerHTML = fallbackHTML;
        }
        
        if (elements.footerContainer) {
            elements.footerContainer.innerHTML = '<footer style="background:#1a1a2e; color:white; padding:20px; text-align:center;">© OUTLET</footer>';
        }
        
        document.body.classList.add('role-guest');
        
    } catch (error) {
        console.error('❌ Error crítico en fallback:', error);
    }
}

/**
 * Recargar layout
 */
export async function reloadLayout() {
    console.log('🔄 Recargando layout...');
    await loadLayoutByRole();
    if (window.location.pathname && window.handleRoute) {
        await window.handleRoute();
    }
}

export function getCurrentLayoutRole() {
    return currentRole;
}