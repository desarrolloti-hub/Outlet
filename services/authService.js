/* ========================================
   AUTH SERVICE - Solo gestión de autenticación
   NO sabe nada de layouts, NO redirige
   Soporta Administradores y Clientes
   ======================================== */

import { CustomerService, ROLES as CustomerROLES } from './customerService.js';
import { AdminService, ROLES as AdminROLES } from './adminService.js';

// Exportar roles combinados
export const ROLES = {
    ...CustomerROLES,
    ...AdminROLES,
    GUEST: 'guest'
};

export const AuthService = {
    /**
     * Escucha cambios en el estado de autenticación
     */
    onAuthStateChange(callback) {
        // Verificar sesiones existentes
        const adminSession = AdminService.getSession ? AdminService.getSession() : AdminService.getCurrentSession?.();
        const customerSession = CustomerService.getCurrentSession ? CustomerService.getCurrentSession() : null;
        const sessionData = adminSession || customerSession;
        callback(sessionData);
        
        // Escuchar cambios de admin
        const adminHandler = (e) => callback(e.detail);
        window.addEventListener('admin:authStateChanged', adminHandler);
        
        // Escuchar cambios de cliente
        const customerHandler = (e) => callback(e.detail);
        window.addEventListener('customer:authStateChanged', customerHandler);
        
        // Retornar función para limpiar listeners
        return () => {
            window.removeEventListener('admin:authStateChanged', adminHandler);
            window.removeEventListener('customer:authStateChanged', customerHandler);
        };
    },
    
    /**
     * Obtener rol del usuario actual (síncrono)
     * Retorna: 'admin', 'customer', o 'guest'
     */
    getUserRoleSync() {
        // Usar getCurrentSession() en lugar de getSession()
        const adminSession = AdminService.getCurrentSession ? AdminService.getCurrentSession() : null;
        if (adminSession) return 'admin';
        
        const customerSession = CustomerService.getCurrentSession ? CustomerService.getCurrentSession() : null;
        if (customerSession) return 'customer';
        
        return 'guest';
    },
    
    /**
     * Verificar si está autenticado (admin o customer)
     */
    isAuthenticated() {
        return (AdminService.isAuthenticated && AdminService.isAuthenticated()) || 
               (CustomerService.isAuthenticated && CustomerService.isAuthenticated());
    },
    
    /**
     * Verificar si es admin (síncrono)
     */
    isAdminSync() {
        const adminSession = AdminService.getCurrentSession ? AdminService.getCurrentSession() : null;
        return !!adminSession;
    },
    
    /**
     * Verificar si es cliente (síncrono)
     */
    isCustomerSync() {
        const customerSession = CustomerService.getCurrentSession ? CustomerService.getCurrentSession() : null;
        return !!customerSession;
    },
    
    /**
     * Obtener usuario actual (admin o customer)
     */
    getCurrentUser() {
        const adminSession = AdminService.getCurrentSession ? AdminService.getCurrentSession() : null;
        if (adminSession) {
            return {
                type: 'admin',
                ...adminSession
            };
        }
        
        const customerSession = CustomerService.getCurrentSession ? CustomerService.getCurrentSession() : null;
        if (customerSession) {
            return {
                type: 'customer',
                ...customerSession
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
        if (AdminService.isAuthenticated && AdminService.isAuthenticated()) {
            return await AdminService.logout();
        }
        if (CustomerService.isAuthenticated && CustomerService.isAuthenticated()) {
            return await CustomerService.logout();
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
            // Si no es admin, intentar como cliente
            console.log('No es admin, intentando como cliente...');
            try {
                result = await CustomerService.login(email, password, isGoogle);
                if (result && result.customerData) {
                    userType = 'customer';
                }
            } catch (customerError) {
                throw customerError;
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
     * Registrar cliente
     */
    async register(customerData, password) {
        return await CustomerService.register(customerData, password);
    },
    
    /**
     * Actualizar último acceso
     */
    updateLastAccess() {
        if (AdminService.isAuthenticated && AdminService.isAuthenticated()) {
            if (AdminService.updateLastAccess) AdminService.updateLastAccess();
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
            role: currentUser.type === 'admin' ? 'admin' : (currentUser.rol || 'customer'),
            initials: currentUser.iniciales,
            sessionStart: currentUser.fechaSesion,
            lastAccess: currentUser.ultimoAcceso || currentUser.fechaSesion,
            ...(currentUser.type === 'admin' && {
                permissions: currentUser.permisos || [],
                estado: currentUser.estado
            }),
            ...(currentUser.type === 'customer' && {
                provider: currentUser.provider,
                estado: currentUser.estado
            })
        };
    },
    
    /**
     * Obtener el servicio específico según el tipo de usuario actual
     */
    getCurrentService() {
        if (this.isAdminSync()) {
            return AdminService;
        }
        if (this.isCustomerSync()) {
            return CustomerService;
        }
        return null;
    },
    
    /**
     * Obtener el modelo del usuario actual
     */
    async getCurrentUserModel(forceRefresh = false) {
        if (this.isAdminSync()) {
            return await AdminService.getCurrentAdmin(forceRefresh);
        }
        if (this.isCustomerSync()) {
            return await CustomerService.getCurrentCustomer(forceRefresh);
        }
        return null;
    }
};