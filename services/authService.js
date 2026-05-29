/* ========================================
   AUTH SERVICE - Outlet Val
   Servicio de autenticación (wrapper de UserService)
   Centraliza rutas de layouts y controladores
   ======================================== */

import { UserService, ROLES } from './userService.js';

// Re-exportar ROLES para fácil acceso
export { ROLES };

// ========== CONFIGURACIÓN DE LAYOUTS POR ROL ==========

/**
 * Rutas de los archivos HTML de layout según el rol
 * IMPORTANTE: Los HTML están en la carpeta public/
 */
export const LAYOUT_PATHS = {
    [ROLES.ADMIN]: {
        navbar: '/modules/admin/layout/adminNavbar.html',      // ← Sin /src, directamente desde public
        footer: '/modules/admin/layout/adminFooter.html'
    },
    [ROLES.VISITOR]: {
        navbar: '/modules/visitor/layout/navbar.html',
        footer: '/modules/visitor/layout/footer.html'
    },
    [ROLES.GUEST]: {
        navbar: '/modules/visitor/layout/navbar.html',
        footer: '/modules/visitor/layout/footer.html'
    }
};

/**
 * Controladores de layout según el rol
 * Los JS sí están en src (se compilan)
 */
export const LAYOUT_CONTROLLERS = {
    [ROLES.ADMIN]: {
        navbar: async () => {
            try {
                const module = await import('/src/modules/admin/layout/adminNavbarController.js');
                if (module.initAdminNavbarController) {
                    return module.initAdminNavbarController();
                }
                console.warn('adminNavbarController.js no tiene initAdminNavbarController');
            } catch (error) {
                console.error('Error cargando adminNavbarController:', error);
            }
        },
        footer: async () => {
            try {
                const module = await import('/src/modules/admin/layout/adminFooterController.js');
                if (module.initAdminFooterController) {
                    return module.initAdminFooterController();
                }
            } catch (error) {
                console.error('Error cargando adminFooterController:', error);
            }
        }
    },
    [ROLES.VISITOR]: {
        navbar: async () => {
            try {
                const module = await import('/src/modules/visitor/layout/navbarController.js');
                if (module.initNavbarController) {
                    return module.initNavbarController();
                }
            } catch (error) {
                console.error('Error cargando navbarController:', error);
            }
        },
        footer: async () => {
            try {
                const module = await import('/src/modules/visitor/layout/footerController.js');
                if (module.initFooterController) {
                    return module.initFooterController();
                }
            } catch (error) {
                console.error('Error cargando footerController:', error);
            }
        }
    },
    [ROLES.GUEST]: {
        navbar: async () => {
            try {
                const module = await import('/src/modules/visitor/layout/navbarController.js');
                if (module.initNavbarController) {
                    return module.initNavbarController();
                }
            } catch (error) {
                console.error('Error cargando navbarController:', error);
            }
        },
        footer: async () => {
            try {
                const module = await import('/src/modules/visitor/layout/footerController.js');
                if (module.initFooterController) {
                    return module.initFooterController();
                }
            } catch (error) {
                console.error('Error cargando footerController:', error);
            }
        }
    }
};

// ... el resto del AuthService queda igual ...

// ========== AUTH SERVICE PRINCIPAL ==========

export const AuthService = {
    /**
     * Estado de autenticación (observable)
     * @param {Function} callback - (userData) => void
     */
    onAuthStateChange(callback) {
        // Llamar callback inmediatamente con el estado actual
        const userData = UserService.getSession();
        callback(userData);
        
        // Escuchar cambios futuros
        const handler = (e) => callback(e.detail);
        window.addEventListener('auth:stateChanged', handler);
        
        // Retornar función para unsubscribe (opcional)
        return () => window.removeEventListener('auth:stateChanged', handler);
    },
    
    /**
     * Redirigir si no está autenticado
     * @param {string} redirectUrl - URL a redirigir
     * @returns {boolean} - true si está autenticado
     */
    requireAuth(redirectUrl = '/login') {
        if (!UserService.isAuthenticated()) {
            // Guardar URL intentada para redirigir después del login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            
            if (window.navigateTo) {
                window.navigateTo(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
            return false;
        }
        return true;
    },
    
    /**
     * Redirigir si ya está autenticado (para páginas de login/registro)
     * @param {string} redirectUrl - URL a redirigir
     * @returns {boolean} - true si es invitado
     */
    requireGuest(redirectUrl = '/') {
        if (UserService.isAuthenticated()) {
            if (window.navigateTo) {
                window.navigateTo(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
            return false;
        }
        return true;
    },
    
    /**
     * Redirigir si no es administrador
     * @param {string} redirectUrl - URL a redirigir
     * @returns {boolean} - true si es admin
     */
    requireAdmin(redirectUrl = '/') {
        if (!this.isAdminSync()) {
            if (window.navigateTo) {
                window.navigateTo(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
            return false;
        }
        return true;
    },
    
    /**
     * Verificar email verificado
     */
    async isEmailVerified() {
        const user = await UserService.getCurrentUser(true);
        return user?.emailVerified || false;
    },
    
    /**
     * Obtener rol del usuario (versión síncrona - rápida)
     * Útil para layouts y navegación inmediata
     */
    getUserRoleSync() {
        return UserService.getSyncRole();
    },
    
    /**
     * Obtener rol del usuario (versión asíncrona - precisa)
     * Útil cuando necesitas datos frescos del servidor
     */
    async getUserRole() {
        return await UserService.getUserRole();
    },
    
    /**
     * Verificar si es admin (síncrono - rápido)
     */
    isAdminSync() {
        return UserService.isAdminSync();
    },
    
    /**
     * Verificar si es admin (asíncrono - preciso)
     */
    async isAdmin() {
        return await UserService.isAdmin();
    },
    
    /**
     * Verificar si está autenticado
     */
    isAuthenticated() {
        return UserService.isAuthenticated();
    },
    
    /**
     * Obtener usuario actual (datos de sesión)
     */
    getCurrentUser() {
        return UserService.getSession();
    },
    
    /**
     * Cerrar sesión
     */
    async logout() {
        return await UserService.logout();
    },
    
    /**
     * Iniciar sesión (wrapper)
     */
    async login(email, password, isGoogle = false) {
        return await UserService.login(email, password, isGoogle);
    },
    
    /**
     * Registrar usuario (wrapper)
     */
    async register(userData, password) {
        return await UserService.register(userData, password);
    }
};