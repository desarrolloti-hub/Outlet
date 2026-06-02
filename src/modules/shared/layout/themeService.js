/* ========================================
   THEME SERVICE - Modo oscuro/claro
   Shared entre todos los layouts (admin, customer, visitor)
   ======================================== */

const THEME_KEY = 'outlet_theme';

export const ThemeService = {
    /**
     * Inicializar tema - se llama UNA VEZ al inicio de la app
     * ANTES de que se cargue cualquier navbar o vista
     */
    init() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.enableDarkMode();
        } else {
            this.enableLightMode();
        }
        
        // Disparar evento para que los controladores se sincronicen
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { isDarkMode: this.isDarkMode() } 
        }));
        
        console.log('🎨 ThemeService inicializado:', this.isDarkMode() ? 'dark' : 'light');
        return this.isDarkMode();
    },
    
    /**
     * Activar modo oscuro
     */
    enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem(THEME_KEY, 'dark');
        
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDarkMode: true } }));
        return true;
    },
    
    /**
     * Activar modo claro
     */
    enableLightMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem(THEME_KEY, 'light');
        
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDarkMode: false } }));
        return false;
    },
    
    /**
     * Alternar entre modos
     * @returns {boolean} true si es dark mode
     */
    toggle() {
        const isDark = document.body.classList.contains('dark-mode');
        if (isDark) {
            return this.enableLightMode();
        } else {
            return this.enableDarkMode();
        }
    },
    
    /**
     * Verificar si está en modo oscuro
     */
    isDarkMode() {
        return document.body.classList.contains('dark-mode');
    },
    
    /**
     * Obtener tema actual
     */
    getTheme() {
        return this.isDarkMode() ? 'dark' : 'light';
    }
};

export default ThemeService;