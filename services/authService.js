/* ========================================
   AUTH SERVICE - Solo gestión de autenticación
   NO sabe nada de layouts, NO redirige
   ======================================== */

import { UserService, ROLES as UserROLES } from './userService.js';
import { AdminService, ROLES as AdminROLES } from './adminService.js';

// Exportar roles combinados
export const ROLES = {
    ...UserROLES,
    ...AdminROLES
};

// 📦 Estructura JSON de sesión de usuario (outlet_user)
/*
{
    "id": "uuid-usuario",
    "nombre": "María",
    "apellido": "González",
    "nombreCompleto": "María González",
    "email": "maria@outletval.com",
    "rol": "user",
    "storeId": "store-123",
    "plan": "basic",
    "iniciales": "MG",
    "fechaSesion": "2026-06-10T15:30:00.000Z"
}
*/

export const AuthService = {
    /**
     * Escucha cambios en el estado de autenticación
     */
    onAuthStateChange(callback) {
        // Verificar sesiones existentes
        const adminSession = AdminService.getSession();
        const userSession = UserService.getSession();
        const sessionData = adminSession || userSession;
        callback(sessionData);
        
        // Escuchar cambios de admin
        const adminHandler = (e) => callback(e.detail);
        window.addEventListener('admin:authStateChanged', adminHandler);
        
        // Escuchar cambios de usuario
        const userHandler = (e) => callback(e.detail);
        window.addEventListener('auth:stateChanged', userHandler);
        
        // Retornar función para limpiar listeners
        return () => {
            window.removeEventListener('admin:authStateChanged', adminHandler);
            window.removeEventListener('auth:stateChanged', userHandler);
        };
    },
    
    /**
     * Obtener rol del usuario actual (síncrono)
     */
    getUserRoleSync() {
        const adminSession = AdminService.getSession();
        if (adminSession) return 'admin';
        
        const userSession = UserService.getSession();
        if (userSession) return UserService.getSyncRole();
        
        return 'guest';
    },
    
    /**
     * Verificar si está autenticado
     */
    isAuthenticated() {
        return AdminService.isAuthenticated() || UserService.isAuthenticated();
    },
    
    /**
     * Verificar si es admin (síncrono)
     */
    isAdminSync() {
        const adminSession = AdminService.getSession();
        return !!adminSession;
    },
    
    /**
     * Obtener usuario actual (admin o user)
     * 📦 Retorna el objeto JSON de sesión
     */
    getCurrentUser() {
        const adminSession = AdminService.getSession();
        if (adminSession) {
            return {
                type: 'admin',
                ...adminSession
            };
        }
        
        const userSession = UserService.getSession();
        if (userSession) {
            return {
                type: 'user',
                ...userSession
            };
        }
        
        return null;
    },
    
    /**
     * Obtener sesión actual formateada
     */
    getCurrentSession() {
        return this.getCurrentUser();
    },
    
    /**
     * Cerrar sesión (ambos tipos)
     */
    async logout() {
        // Verificar qué tipo de sesión está activa
        if (AdminService.isAuthenticated()) {
            return await AdminService.logout();
        }
        if (UserService.isAuthenticated()) {
            return await UserService.logout();
        }
        return false;
    },
    
    /**
     * Iniciar sesión (automáticamente determina tipo)
     */
    async login(email, password, isGoogle = false) {
        let result = null;
        let userType = null;
        
        // Primero intentar como admin
        try {
            result = await AdminService.login(email, password, isGoogle);
            if (result && result.adminData) {
                userType = 'admin';
            }
        } catch (adminError) {
            // Si no es admin, intentar como usuario
            console.log('No es admin, intentando como usuario...');
            try {
                result = await UserService.login(email, password, isGoogle);
                if (result && result.userData) {
                    userType = 'user';
                }
            } catch (userError) {
                throw userError;
            }
        }
        
        if (!result || !userType) {
            throw new Error('Credenciales inválidas');
        }
        
        return {
            success: true,
            userType,
            data: result
        };
    },
    
    /**
     * Registrar usuario
     */
    async register(userData, password) {
        return await UserService.register(userData, password);
    },
    
    /**
     * Actualizar último acceso
     */
    updateLastAccess() {
        if (AdminService.isAuthenticated()) {
            AdminService.updateLastAccess();
        }
    },
    
    /**
     * Obtener información completa de la sesión (formato unificado)
     */
    getUnifiedSession() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;
        
        return {
            authenticated: true,
            userId: currentUser.id,
            email: currentUser.email,
            name: currentUser.nombreCompleto || currentUser.nombre,
            role: currentUser.type === 'admin' ? 'admin' : (currentUser.rol || 'user'),
            initials: currentUser.iniciales,
            sessionStart: currentUser.fechaSesion,
            lastAccess: currentUser.ultimoAcceso || currentUser.fechaSesion,
            // Datos específicos según tipo
            ...(currentUser.type === 'admin' && {
                permissions: currentUser.permisos || [],
                estado: currentUser.estado
            }),
            ...(currentUser.type === 'user' && {
                storeId: currentUser.storeId,
                plan: currentUser.plan
            })
        };
    }
};