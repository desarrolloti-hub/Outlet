/* ========================================
   USER SERVICE - Outlet Val
   Lógica de negocio para usuarios
   ======================================== */

import { User } from '/classes/userModel.js';
import { UserRepository } from '/repositories/userRepository.js';
import { CacheService, STORES } from '/services/cacheService.js';

// Roles disponibles
export const ROLES = {
    ADMIN: 'admin',    
    VISITOR: 'visitor',
    GUEST: 'guest'
};

export const UserService = {
    /**
     * Registrar nuevo usuario
     */
    async register(userData, password) {
        // Validaciones
        if (!userData.nombre || userData.nombre.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        if (!userData.email || !this._validateEmail(userData.email)) {
            throw new Error('Correo electrónico inválido');
        }
        
        if (!password || password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Crear modelo
        const user = new User({
            nombre: userData.nombre.trim(),
            apellidoPa: userData.apellidoPa?.trim() || '',
            apellidoMa: userData.apellidoMa?.trim() || '',
            email: userData.email.toLowerCase().trim(),
            direccion: userData.direccion || {}
        });
        
        // Registrar en Firebase
        const result = await UserRepository.registerWithEmail(
            user.email,
            password,
            user
        );
        
        // Limpiar caché de usuarios
        await CacheService.clearCache(STORES.USERS);
        
        // Guardar en localStorage sesión
        this._saveSession(result.userData.datosResumidos);
        
        // Disparar evento de cambio de autenticación
        this._dispatchAuthChange(result.userData.datosResumidos);
        
        return result;
    },
    
    /**
     * Iniciar sesión
     */
    async login(email, password, isGoogle = false) {
        if (!isGoogle) {
            if (!email || !this._validateEmail(email)) {
                throw new Error('Correo electrónico inválido');
            }
            
            if (!password) {
                throw new Error('La contraseña es requerida');
            }
            
            const result = await UserRepository.loginWithEmail(email.toLowerCase().trim(), password);
            this._saveSession(result.userData.datosResumidos);
            this._dispatchAuthChange(result.userData.datosResumidos);
            return result;
        } else {
            const result = await UserRepository.loginWithGoogle();
            this._saveSession(result.userData.datosResumidos);
            this._dispatchAuthChange(result.userData.datosResumidos);
            return result;
        }
    },
    
    /**
     * Cerrar sesión
     */
    async logout() {
        await UserRepository.logout();
        this._clearSession();
        this._dispatchAuthChange(null);
        return true;
    },
    
    /**
     * Obtener usuario actual (con caché)
     */
    async getCurrentUser(forceRefresh = false) {
        const authUser = UserRepository.getCurrentAuthUser();
        
        if (!authUser) {
            return null;
        }
        
        // Verificar caché
        if (!forceRefresh) {
            const cached = await CacheService.getCache(STORES.USERS, authUser.uid);
            if (cached) {
                return new User(cached);
            }
        }
        
        // Obtener de Firestore
        const userData = await UserRepository.getById(authUser.uid);
        
        if (userData) {
            // Guardar en caché (1 hora)
            await CacheService.setCache(STORES.USERS, authUser.uid, userData, 3600000);
            return new User(userData);
        }
        
        return null;
    },
    
    /**
     * Actualizar perfil del usuario
     */
    async updateProfile(updateData) {
        const currentUser = await this.getCurrentUser(true);
        
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }
        
        // Validaciones
        if (updateData.nombre && updateData.nombre.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        if (updateData.email && !this._validateEmail(updateData.email)) {
            throw new Error('Correo electrónico inválido');
        }
        
        // Actualizar
        const updated = await UserRepository.update(currentUser.id, updateData);
        
        // Limpiar caché
        await CacheService.clearCache(STORES.USERS);
        
        // Actualizar sesión local
        const updatedSession = new User(updated).datosResumidos;
        this._saveSession(updatedSession);
        this._dispatchAuthChange(updatedSession);
        
        return new User(updated);
    },
    
    /**
     * Actualizar dirección de envío
     */
    async updateDireccion(direccionData) {
        const currentUser = await this.getCurrentUser(true);
        
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }
        
        // Validar datos requeridos para envío
        if (direccionData.telefono1 && !this._validatePhone(direccionData.telefono1)) {
            throw new Error('Teléfono inválido (10 dígitos requeridos)');
        }
        
        if (direccionData.codigoPostal && !this._validatePostalCode(direccionData.codigoPostal)) {
            throw new Error('Código postal inválido (5 dígitos requeridos)');
        }
        
        const updated = await UserRepository.updateDireccion(currentUser.id, direccionData);
        
        // Limpiar caché
        await CacheService.clearCache(STORES.USERS);
        
        // Actualizar sesión local
        const updatedSession = new User(updated).datosResumidos;
        this._saveSession(updatedSession);
        
        return new User(updated);
    },
    
    /**
     * Verificar si está autenticado
     */
    isAuthenticated() {
        const session = this._getSession();
        return !!session && !!UserRepository.getCurrentAuthUser();
    },
    
    /**
     * Obtener sesión guardada
     */
    getSession() {
        return this._getSession();
    },
    
    /**
     * Validar dirección para compra
     */
    validateCheckout(userData) {
        const user = new User(userData);
        return user.validarParaCompra();
    },
    
    // ========== NUEVOS MÉTODOS PARA ROLES ==========
    
    /**
     * Obtener el rol del usuario actual (versión asíncrona desde Firestore)
     */
    async getUserRole() {
        // Verificar si está autenticado
        if (!this.isAuthenticated()) {
            return ROLES.GUEST;
        }
        
        try {
            // Obtener usuario actual desde Firestore (para tener datos actualizados)
            const user = await this.getCurrentUser(true);
            
            if (!user) {
                return ROLES.GUEST;
            }
            
            // Verificar si es admin
            // Puedes ajustar esta condición según tu modelo de datos
            if (user.email === 'admin@outlet.com' || 
                user.rol === 'admin' || 
                user.isAdmin === true ||
                user.tipo === 'administrador') {
                return ROLES.ADMIN;
            }
            
            return ROLES.VISITOR;
        } catch (error) {
            console.error('Error obteniendo rol del usuario:', error);
            return ROLES.GUEST;
        }
    },
    
    /**
     * Obtener rol de forma síncrona (desde localStorage - más rápido)
     */
    getSyncRole() {
        const session = this._getSession();
        if (!session) return ROLES.GUEST;
        
        // Verificar condiciones de admin en la sesión guardada
        if (session.role === 'admin' || 
            session.isAdmin === true || 
            session.email === 'admin@outlet.com' ||
            session.tipo === 'administrador') {
            return ROLES.ADMIN;
        }
        
        return ROLES.VISITOR;
    },
    
    /**
     * Verificar si es administrador (versión síncrona - rápida)
     */
    isAdminSync() {
        return this.getSyncRole() === ROLES.ADMIN;
    },
    
    /**
     * Verificar si es administrador (versión asíncrona - precisa)
     */
    async isAdmin() {
        const role = await this.getUserRole();
        return role === ROLES.ADMIN;
    },
    
    // ========== MÉTODOS PRIVADOS ==========
    
    _validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    _validatePhone(phone) {
        const re = /^\d{10}$/;
        return re.test(phone.replace(/\D/g, ''));
    },
    
    _validatePostalCode(cp) {
        const re = /^\d{5}$/;
        return re.test(cp);
    },
    
    _saveSession(userData) {
        localStorage.setItem('outlet_user', JSON.stringify(userData));
    },
    
    _getSession() {
        const session = localStorage.getItem('outlet_user');
        return session ? JSON.parse(session) : null;
    },
    
    _clearSession() {
        localStorage.removeItem('outlet_user');
        localStorage.removeItem('outlet_cart');
    },
    
    /**
     * Disparar evento de cambio de autenticación
     */
    _dispatchAuthChange(userData) {
        const event = new CustomEvent('auth:stateChanged', { 
            detail: userData 
        });
        window.dispatchEvent(event);
    }
};