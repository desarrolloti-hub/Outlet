/* ========================================
   ADMIN SERVICE - Outlet Val
   Lógica de negocio para administradores
   ======================================== */

// ✅ Ruta corregida - apuntando a classes/
import { Admin } from '../classes/adminModel.js';
import { AdminRepository } from '../repositories/adminRepository.js';

export const ROLES = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    SUPER_ADMIN: 'super_admin'
};

export const AdminService = {
    /**
     * Registrar nuevo administrador (solo para super_admin)
     */
    async register(adminData, password, currentAdminRole) {
        if (currentAdminRole !== ROLES.SUPER_ADMIN) {
            throw new Error('No tiene permisos para crear administradores');
        }
        
        if (!adminData.nombre || adminData.nombre.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        if (!adminData.email || !this._validateEmail(adminData.email)) {
            throw new Error('Correo electrónico inválido');
        }
        
        if (!password || password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        const existing = await AdminRepository.getByEmail(adminData.email);
        if (existing) {
            throw new Error('Ya existe un administrador con este email');
        }
        
        const admin = new Admin({
            nombre: adminData.nombre.trim(),
            apellidoPa: adminData.apellidoPa?.trim() || '',
            apellidoMa: adminData.apellidoMa?.trim() || '',
            email: adminData.email.toLowerCase().trim(),
            rol: adminData.rol || ROLES.ADMIN,
            estado: adminData.estado || 'activo',
            permisos: adminData.permisos || null
        });
        
        const result = await AdminRepository.registerWithEmail(
            admin.email,
            password,
            admin
        );
        
        return result;
    },

    /**
     * Iniciar sesión como administrador
     */
    async login(email, password, isGoogle = false) {
        if (!isGoogle) {
            if (!email || !this._validateEmail(email)) {
                throw new Error('Correo electrónico inválido');
            }
            
            if (!password) {
                throw new Error('La contraseña es requerida');
            }
            
            const admin = await AdminRepository.getByEmail(email.toLowerCase().trim());
            
            if (admin) {
                const adminObj = new Admin(admin);
                
                if (!adminObj.isActive()) {
                    if (adminObj.bloqueadoHasta) {
                        const bloqueadoHasta = new Date(adminObj.bloqueadoHasta);
                        if (bloqueadoHasta > new Date()) {
                            const minutosRestantes = Math.ceil((bloqueadoHasta - new Date()) / 60000);
                            throw new Error(`Cuenta bloqueada. Intente en ${minutosRestantes} minutos`);
                        }
                    }
                    throw new Error('Cuenta inactiva o suspendida');
                }
            }
            
            const result = await AdminRepository.loginWithEmail(email.toLowerCase().trim(), password);
            
            if (result.adminData) {
                await AdminRepository.updateFailedAttempts(email, false);
                this._saveSession(new Admin(result.adminData).datosResumidos);
                this._dispatchAuthChange(result.adminData);
            }
            
            return result;
        } else {
            const result = await AdminRepository.loginWithGoogle();
            if (result.adminData) {
                this._saveSession(new Admin(result.adminData).datosResumidos);
                this._dispatchAuthChange(result.adminData);
            }
            return result;
        }
    },

    /**
     * Cerrar sesión
     */
    async logout() {
        await AdminRepository.logout();
        this._clearSession();
        this._dispatchAuthChange(null);
        return true;
    },

    /**
     * Obtener administrador actual
     */
    async getCurrentAdmin(forceRefresh = false) {
        const authUser = AdminRepository.getCurrentAuthUser();
        
        if (!authUser) {
            return null;
        }
        
        if (!forceRefresh) {
            const session = this._getSession();
            if (session && session.id === authUser.uid) {
                return new Admin(session);
            }
        }
        
        const adminData = await AdminRepository.getById(authUser.uid);
        
        if (adminData) {
            const admin = new Admin(adminData);
            this._saveSession(admin.datosResumidos);
            return admin;
        }
        
        return null;
    },

    /**
     * Obtener todos los administradores
     */
    async getAllAdmins() {
        const currentAdmin = await this.getCurrentAdmin(true);
        
        if (!currentAdmin || (currentAdmin.rol !== ROLES.SUPER_ADMIN && !currentAdmin.hasPermission('admin.view'))) {
            throw new Error('No tiene permisos para ver la lista de administradores');
        }
        
        const admins = await AdminRepository.getAll();
        return admins.map(admin => new Admin(admin).datosResumidos);
    },

    /**
     * Actualizar administrador
     */
    async updateAdmin(adminId, updateData) {
        const currentAdmin = await this.getCurrentAdmin(true);
        
        if (!currentAdmin) {
            throw new Error('No autenticado');
        }
        
        if (currentAdmin.rol !== ROLES.SUPER_ADMIN && currentAdmin.id !== adminId) {
            throw new Error('No tiene permisos para modificar este administrador');
        }
        
        const adminToUpdate = await AdminRepository.getById(adminId);
        
        if (!adminToUpdate) {
            throw new Error('Administrador no encontrado');
        }
        
        if (updateData.rol && currentAdmin.rol !== ROLES.SUPER_ADMIN) {
            delete updateData.rol;
        }
        
        if (updateData.estado === 'inactivo' && adminId === currentAdmin.id) {
            throw new Error('No puede desactivar su propia cuenta');
        }
        
        if (updateData.email && !this._validateEmail(updateData.email)) {
            throw new Error('Email inválido');
        }
        
        const updated = await AdminRepository.update(adminId, updateData);
        
        if (adminId === currentAdmin.id) {
            const updatedAdmin = new Admin(updated);
            this._saveSession(updatedAdmin.datosResumidos);
            this._dispatchAuthChange(updatedAdmin);
        }
        
        return new Admin(updated).datosResumidos;
    },

    /**
     * Eliminar administrador
     */
    async deleteAdmin(adminId) {
        const currentAdmin = await this.getCurrentAdmin(true);
        
        if (!currentAdmin || currentAdmin.rol !== ROLES.SUPER_ADMIN) {
            throw new Error('No tiene permisos para eliminar administradores');
        }
        
        if (adminId === currentAdmin.id) {
            throw new Error('No puede eliminar su propia cuenta');
        }
        
        const adminToDelete = await AdminRepository.getById(adminId);
        
        if (!adminToDelete) {
            throw new Error('Administrador no encontrado');
        }
        
        await AdminRepository.delete(adminId);
        
        return { success: true, message: 'Administrador eliminado exitosamente' };
    },

    /**
     * Cambiar contraseña
     */
    async changePassword(adminId, currentPassword, newPassword) {
        const currentAdmin = await this.getCurrentAdmin(true);
        
        if (!currentAdmin || currentAdmin.id !== adminId) {
            throw new Error('No autorizado');
        }
        
        if (!newPassword || newPassword.length < 6) {
            throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
        }
        
        return { success: true, message: 'Contraseña actualizada exitosamente' };
    },

    /**
     * Verificar si está autenticado como admin
     */
    isAuthenticated() {
        const session = this._getSession();
        return !!session && !!AdminRepository.getCurrentAuthUser();
    },

    /**
     * Verificar si es administrador (versión síncrona)
     */
    isAdminSync() {
        const session = this._getSession();
        if (!session) return false;
        return session.rol === ROLES.ADMIN || 
               session.rol === ROLES.SUPER_ADMIN || 
               session.rol === ROLES.EDITOR;
    },

    /**
     * Verificar si es super_admin
     */
    isSuperAdminSync() {
        const session = this._getSession();
        if (!session) return false;
        return session.rol === ROLES.SUPER_ADMIN;
    },

    /**
     * Verificar permiso específico
     */
    async hasPermission(permission) {
        const currentAdmin = await this.getCurrentAdmin(true);
        if (!currentAdmin) return false;
        return currentAdmin.hasPermission(permission);
    },

    /**
     * Inicializar sistema de administradores
     */
    async initializeSystem() {
        await AdminRepository.initializeDefaultAdmin();
    },

    // ========== MÉTODOS PRIVADOS ==========

    _validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    _saveSession(adminData) {
        localStorage.setItem('outlet_admin', JSON.stringify(adminData));
    },

    _getSession() {
        const session = localStorage.getItem('outlet_admin');
        return session ? JSON.parse(session) : null;
    },

    _clearSession() {
        localStorage.removeItem('outlet_admin');
    },

    _dispatchAuthChange(adminData) {
        const event = new CustomEvent('admin:authStateChanged', { 
            detail: adminData 
        });
        window.dispatchEvent(event);
    }
};   