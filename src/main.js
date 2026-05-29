/* ========================================
   MAIN - Outlet Val
   Punto de entrada principal de la aplicación
   ======================================== */

import { initLayout } from './modules/shared/layout/layoutLoader.js';
import { initRouter } from './router/router.js';

/**
 * Carga scripts externos (Swiper, AOS, etc.)
 * @returns {Promise<void>}
 */
function loadExternalScripts() {
    return new Promise((resolve) => {
        // Verificar si ya están cargados
        if (document.querySelector('script[src*="swiper"]')) {
            resolve();
            return;
        }
        
        // Cargar AOS
        const aosLink = document.createElement('link');
        aosLink.rel = 'stylesheet';
        aosLink.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
        document.head.appendChild(aosLink);
        
        const aosScript = document.createElement('script');
        aosScript.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
        aosScript.onload = () => {
            if (window.AOS) {
                window.AOS.init({
                    duration: 800,
                    once: true,
                    offset: 100
                });
            }
        };
        document.body.appendChild(aosScript);
        
        // Cargar Swiper
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
        
        // Timeout por si fallan
        setTimeout(() => {
            console.warn('⚠️ Timeout cargando scripts externos, continuando...');
            resolve();
        }, 3000);
    });
}

/**
 * Inicializa la aplicación
 */
async function initApp() {
    console.log('🚀 Iniciando aplicación...');
    
    try {
        // 1. Cargar scripts externos
        await loadExternalScripts();
        console.log('✅ Scripts externos cargados');
        
        // 2. Cargar layouts dinámicos (navbar y footer según rol del usuario)
        //    Este método ya carga el HTML correcto Y los controladores correspondientes
        const layoutResult = await initLayout();
        
        if (!layoutResult.success) {
            console.warn('⚠️ Advertencia al cargar layout:', layoutResult.error);
        } else {
            console.log(`✅ Layout cargado - Rol: ${layoutResult.role}`);
        }
        
        // 3. Inicializar router (SPA)
        initRouter();
        console.log('✅ Router inicializado');
        
        console.log('🎉 Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error fatal inicializando aplicación:', error);
        
        // Mostrar error en la UI si es necesario
        const appContainer = document.getElementById('app');
        if (appContainer && !appContainer.innerHTML.trim()) {
            appContainer.innerHTML = `
                <div style="text-align:center;padding:50px;margin:50px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
                    <h2 style="color:#dc2626;">Error al cargar la aplicación</h2>
                    <p style="color:#6b7280;">${error.message || 'Error desconocido'}</p>
                    <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#dc2626;color:white;border:none;border-radius:5px;cursor:pointer;">
                        Recargar página
                    </button>
                </div>
            `;
        }
    }
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}