/* ========================================
   THEME SERVICE - Modo oscuro/claro
   ======================================== */

const THEME_KEY = 'outlet_theme';

export const ThemeService = {
    /**
     * Inicializar tema
     */
    init() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.enableDarkMode();
        } else {
            this.enableLightMode();
        }
    },
    
    /**
     * Activar modo oscuro
     */
    enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem(THEME_KEY, 'dark');
        return true;
    },
    
    /**
     * Activar modo claro
     */
    enableLightMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem(THEME_KEY, 'light');
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
    }
};

export default ThemeService;