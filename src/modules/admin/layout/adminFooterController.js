/* ========================================
   ADMIN FOOTER CONTROLLER - OUTLET
   Controlador para footer del panel de administración
   ======================================== */

// Estado
let elements = {};
let isInitialized = false;

/**
 * Inicializa el controlador del footer de administración
 */
export function initAdminFooterController() {
    if (isInitialized) {
        console.log('⚠️ Admin Footer Controller ya inicializado');
        return;
    }
    
    console.log('🔧 Inicializando Admin Footer Controller...');
    
    cacheElements();
    
    if (!elements.footer) {
        console.warn('⚠️ Admin Footer no encontrado en el DOM');
        return;
    }
    
    updateCurrentYear();
    
    isInitialized = true;
    console.log('✅ Admin Footer Controller inicializado');
}

/**
 * Cachea elementos del DOM
 */
function cacheElements() {
    elements = {
        footer: document.querySelector('.outlet-admin-footer'),
        yearSpans: document.querySelectorAll('.current-year')
    };
}

/**
 * Actualiza el año actual en todos los spans con clase .current-year
 */
function updateCurrentYear() {
    const currentYear = new Date().getFullYear();
    
    elements.yearSpans?.forEach(span => {
        span.textContent = currentYear;
    });
}

/**
 * Obtiene el estado actual del footer
 */
export function getAdminFooterState() {
    return {
        isInitialized,
        currentYear: new Date().getFullYear()
    };
}

/**
 * Refresca el footer (útil después de cambios de tema o idioma)
 */
export function refreshAdminFooter() {
    updateCurrentYear();
    console.log('🔄 Admin Footer refrescado');
}