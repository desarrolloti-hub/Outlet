/* ========================================
   ADMIN FOOTER CONTROLLER - OUTLET
   ======================================== */

export function initAdminFooterController() {
    console.log('✅ Admin Footer Controller inicializado');
    
    // Actualizar año actual
    const yearElement = document.querySelector('.current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}