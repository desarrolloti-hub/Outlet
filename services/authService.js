/* ========================================
   AUTH SERVICE - Outlet Val
   Servicio específico para autenticación
   ======================================== */

import { UserService } from './userService.js';

export const AuthService = {
    /**
     * Estado de autenticación (observable)
     */
    onAuthStateChange(callback) {
        // Este método se integraría con Firebase Auth
        // Por ahora, llamamos al callback con el estado actual
        const isAuth = UserService.isAuthenticated();
        callback(isAuth ? UserService.getSession() : null);
    },
    
    /**
     * Redirigir si no está autenticado
     */
    requireAuth(redirectUrl = '/login') {
        if (!UserService.isAuthenticated()) {
            // Guardar URL intentada
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    /**
     * Redirigir si ya está autenticado
     */
    requireGuest(redirectUrl = '/') {
        if (UserService.isAuthenticated()) {
            window.location.href = redirectUrl;
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
    }
};