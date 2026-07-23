/* ========================================
   ADMIN FOOTER CONTROLLER - OUTLET
   Controlador para footer del panel de administración
   TEXTO CENTRADO
   ======================================== */

// ===== ESTADO =====
const state = {
    elements: {},
    isInitialized: false,
    sidebarObserver: null,
    themeObserver: null
};

// ===== CONFIGURACIÓN =====
const CONFIG = {
    SIDEBAR_WIDTH: 250,
    SIDEBAR_WIDTH_TABLET: 200,
    PADDING_BOTTOM: 80,
    MOBILE_BREAKPOINT: 768
};

// ===== INICIALIZACIÓN =====
export function initAdminFooterController() {
    if (state.isInitialized) {
        console.log('⚠️ Admin Footer Controller ya inicializado');
        return;
    }

    console.log('🔧 Inicializando Admin Footer Controller...');

    cacheElements();

    if (!state.elements.footer) {
        console.warn('⚠️ Admin Footer no encontrado en el DOM');
        return;
    }

    updateCurrentYear();
    setupSidebarObserver();
    setupThemeObserver();
    adjustContentPadding();
    setupWindowResize();

    state.isInitialized = true;
    console.log('✅ Admin Footer Controller inicializado');
}

// ===== CACHE DE ELEMENTOS =====
function cacheElements() {
    state.elements = {
        footer: document.querySelector('.outlet-admin-footer'),
        yearSpans: document.querySelectorAll('.current-year'),
        mainContent: document.querySelector('.admin-main-content, .outlet-admin-container')
    };
}

// ===== ACTUALIZAR AÑO =====
function updateCurrentYear() {
    const currentYear = new Date().getFullYear();
    state.elements.yearSpans.forEach(span => span.textContent = currentYear);
}

// ===== SIDEBAR =====
function setupSidebarObserver() {
    if (state.sidebarObserver) {
        state.sidebarObserver.disconnect();
    }

    state.sidebarObserver = new MutationObserver(updateFooterPosition);
    state.sidebarObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });

    updateFooterPosition();
}

function updateFooterPosition() {
    const footer = state.elements.footer;
    if (!footer) return;

    const hasSidebar = document.body.classList.contains('has-sidebar');
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;

    if (hasSidebar && !isMobile) {
        const width = window.innerWidth <= 1024 ? CONFIG.SIDEBAR_WIDTH_TABLET : CONFIG.SIDEBAR_WIDTH;
        footer.style.marginLeft = `${width}px`;
        footer.style.width = `calc(100% - ${width}px)`;
        footer.style.right = '0';
    } else {
        footer.style.marginLeft = '0';
        footer.style.width = '100%';
        footer.style.right = '0';
    }
}

// ===== TEMA OSCURO =====
function setupThemeObserver() {
    if (state.themeObserver) {
        state.themeObserver.disconnect();
    }

    state.themeObserver = new MutationObserver(() => {
        if (state.elements.footer) {
            state.elements.footer.classList.toggle('dark-mode', document.body.classList.contains('dark-mode'));
        }
    });

    state.themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Aplicar estado inicial
    if (state.elements.footer && document.body.classList.contains('dark-mode')) {
        state.elements.footer.classList.add('dark-mode');
    }
}

// ===== CONTENIDO PRINCIPAL =====
function adjustContentPadding() {
    const mainContent = state.elements.mainContent;
    if (!mainContent) return;

    const currentPadding = parseInt(window.getComputedStyle(mainContent).paddingBottom);
    if (currentPadding < CONFIG.PADDING_BOTTOM) {
        mainContent.style.paddingBottom = `${CONFIG.PADDING_BOTTOM}px`;
    }
}

// ===== WINDOW RESIZE =====
function setupWindowResize() {
    const resizeHandler = () => {
        updateFooterPosition();
        adjustContentPadding();
    };

    window.addEventListener('resize', resizeHandler);
    // Guardar referencia para limpieza
    window.__footerResizeHandler = resizeHandler;
}

// ===== MÉTODOS PÚBLICOS =====
export function getAdminFooterState() {
    return {
        isInitialized: state.isInitialized,
        currentYear: new Date().getFullYear(),
        hasFooter: !!state.elements.footer,
        hasMainContent: !!state.elements.mainContent,
        alignment: 'center'
    };
}

export function refreshAdminFooter() {
    updateCurrentYear();
    adjustContentPadding();
    updateFooterPosition();
    console.log('🔄 Admin Footer refrescado');
}

export function toggleAdminFooter(show) {
    if (state.elements.footer) {
        state.elements.footer.style.display = show !== false ? '' : 'none';
    }
}

export function destroyAdminFooterController() {
    if (state.sidebarObserver) {
        state.sidebarObserver.disconnect();
        state.sidebarObserver = null;
    }

    if (state.themeObserver) {
        state.themeObserver.disconnect();
        state.themeObserver = null;
    }

    if (window.__footerResizeHandler) {
        window.removeEventListener('resize', window.__footerResizeHandler);
        delete window.__footerResizeHandler;
    }

    state.isInitialized = false;
    state.elements = {};
    console.log('🗑️ Admin Footer Controller destruido');
}

// ===== AUTO-INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminFooterController);
} else {
    initAdminFooterController();
}