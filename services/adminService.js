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
        
        // ✅ Forzar rol 'admin' al crear (a menos que sea super_admin explícitamente)
        let rolAsignado = ROLES.ADMIN; // Por defecto 'admin'
        
        // Si el currentAdminRole es super_admin y viene especificado otro rol, respetarlo
        if (adminData.rol === ROLES.SUPER_ADMIN && currentAdminRole === ROLES.SUPER_ADMIN) {
            rolAsignado = ROLES.SUPER_ADMIN;
        } else if (adminData.rol === ROLES.EDITOR && currentAdminRole === ROLES.SUPER_ADMIN) {
            rolAsignado = ROLES.EDITOR;
        } else {
            rolAsignado = ROLES.ADMIN; // ✅ Siempre 'admin' por defecto
        }
        
        console.log('📝 Creando admin con rol:', rolAsignado);
        
        const admin = new Admin({
            nombre: adminData.nombre.trim(),
            apellidoPa: adminData.apellidoPa?.trim() || '',
            apellidoMa: adminData.apellidoMa?.trim() || '',
            email: adminData.email.toLowerCase().trim(),
            rol: rolAsignado,
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
                
                // ✅ Guardar sesión con estructura JSON completa
                const adminObj = new Admin(result.adminData);
                const sessionData = this._buildSessionData(adminObj);
                this._saveSession(sessionData);
                this._dispatchAuthChange(result.adminData);
                
                // ✅ Verificar que se guardó correctamente
                const savedSession = this._getSession();
                console.log('✅ Sesión guardada en localStorage:', savedSession);
                console.log('📦 Rol guardado en sesión:', savedSession?.rol);
            }
            
            return result;
        } else {
            const result = await AdminRepository.loginWithGoogle();
            if (result.adminData) {
                const adminObj = new Admin(result.adminData);
                const sessionData = this._buildSessionData(adminObj);
                this._saveSession(sessionData);
                this._dispatchAuthChange(result.adminData);
            }
            return result;
        }
    },

    /**
     * Construye el objeto JSON para localStorage
     * 📦 Estructura estándar de sesión
     */
    _buildSessionData(admin) {
        console.log('🏗️ Construyendo sesión para admin:', {
            id: admin.id,
            nombre: admin.nombre,
            rol: admin.rol
        });
        
        return {
            id: admin.id,
            nombre: admin.nombre,
            apellidoPa: admin.apellidoPa || '',
            apellidoMa: admin.apellidoMa || '',
            nombreCompleto: admin.nombreCompleto,
            email: admin.email,
            rol: admin.rol, // ✅ Aquí debe venir 'admin'
            estado: admin.estado,
            iniciales: admin.iniciales,
            fechaSesion: new Date().toISOString(),
            permisos: admin.permisos || this._getDefaultPermisosByRol(admin.rol),
            avatar: admin.avatar || null,
            ultimoAcceso: new Date().toISOString(),
            version: '1.0'
        };
    },

    /**
     * Permisos por defecto según rol
     */
    _getDefaultPermisosByRol(rol) {
        const permisosMap = {
            [ROLES.SUPER_ADMIN]: ['*'],
            [ROLES.ADMIN]: [
                'admin.view', 'admin.edit',
                'products.view', 'products.edit', 'products.create',
                'orders.view', 'orders.edit',
                'reports.view'
            ],
            [ROLES.EDITOR]: [
                'products.view', 'products.edit',
                'orders.view',
                'reports.view'
            ]
        };
        return permisosMap[rol] || ['basic.view'];
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
                console.log('📦 Usando sesión cacheada, rol:', session.rol);
                return new Admin(session);
            }
        }
        
        const adminData = await AdminRepository.getById(authUser.uid);
        
        if (adminData) {
            const admin = new Admin(adminData);
            const sessionData = this._buildSessionData(admin);
            this._saveSession(sessionData);
            console.log('📦 Admin actualizado desde DB, rol:', admin.rol);
            return admin;
        }
        
        return null;
    },

    /**
     * Obtener todos los administradores
     * ✅ Método principal para obtener la lista
     */
    async getAllAdmins() {
        const currentAdmin = await this.getCurrentAdmin(true);
        
        console.log('🔍 Verificando permisos para getAllAdmins:');
        console.log('  - Admin actual:', currentAdmin?.nombre);
        console.log('  - Rol:', currentAdmin?.rol);
        
        if (!currentAdmin) {
            throw new Error('No autenticado. Inicie sesión nuevamente.');
        }
        
        // ✅ Verificar si tiene permisos para ver administradores
        if (currentAdmin.rol !== ROLES.SUPER_ADMIN && 
            currentAdmin.rol !== ROLES.ADMIN && 
            !currentAdmin.hasPermission('admin.view')) {
            throw new Error('No tiene permisos para ver la lista de administradores');
        }
        
        const admins = await AdminRepository.getAll();
        console.log(`📋 Total admins obtenidos: ${admins.length}`);
        
        // ✅ Retornar los datos mapeados correctamente
        return admins.map(admin => {
            const adminObj = new Admin(admin);
            return adminObj.datosResumidos;
        });
    },

    /**
     * ✅ ALIAS: getAll() - Método que espera el controller
     * Redirige al método principal getAllAdmins()
     */
    async getAll(options = {}, forceRefresh = false) {
        console.log('🔄 getAll() llamado - redirigiendo a getAllAdmins()');
        return await this.getAllAdmins();
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
        
        // ✅ Mapear campos para compatibilidad
        const mappedData = {
            nombre: updateData.nombre || updateData.name,
            apellidoPa: updateData.apellidoPa || '',
            apellidoMa: updateData.apellidoMa || '',
            email: updateData.email || updateData.correo,
            rol: updateData.rol || updateData.role,
            estado: updateData.estado || updateData.status,
            telefono: updateData.telefono || updateData.phone,
            avatar: updateData.avatar || updateData.icon || 'person'
        };
        
        // Eliminar campos undefined
        Object.keys(mappedData).forEach(key => {
            if (mappedData[key] === undefined) {
                delete mappedData[key];
            }
        });
        
        // No permitir cambiar rol si no es super_admin
        if (updateData.rol && currentAdmin.rol !== ROLES.SUPER_ADMIN) {
            delete mappedData.rol;
        }
        
        // No permitir desactivar propia cuenta
        if ((mappedData.estado === 'inactivo' || mappedData.estado === 'inactive') && 
            adminId === currentAdmin.id) {
            throw new Error('No puede desactivar su propia cuenta');
        }
        
        // Validar email
        if (mappedData.email && !this._validateEmail(mappedData.email)) {
            throw new Error('Email inválido');
        }
        
        const updated = await AdminRepository.update(adminId, mappedData);
        
        if (adminId === currentAdmin.id) {
            const updatedAdmin = new Admin(updated);
            const sessionData = this._buildSessionData(updatedAdmin);
            this._saveSession(sessionData);
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
     * Verificar permiso síncrono (usando session)
     */
    hasPermissionSync(permission) {
        const session = this._getSession();
        if (!session) return false;
        
        if (session.rol === ROLES.SUPER_ADMIN) return true;
        
        if (session.permisos && Array.isArray(session.permisos)) {
            if (session.permisos.includes('*')) return true;
            return session.permisos.includes(permission);
        }
        
        return false;
    },

    /**
     * Obtener sesión actual (JSON de localStorage)
     * 📦 Retorna el objeto JSON guardado
     */
    getCurrentSession() {
        return this._getSession();
    },

    /**
     * ✅ MÉTODO PÚBLICO getSession()
     * Versión pública para acceder a la sesión desde otros servicios
     */
    getSession() {
        return this._getSession();
    },

    /**
     * Actualizar timestamp de último acceso
     */
    updateLastAccess() {
        const session = this._getSession();
        if (session) {
            session.ultimoAcceso = new Date().toISOString();
            this._saveSession(session);
        }
    },

    /**
     * Inicializar sistema de administradores
     */
    async initializeSystem() {
        await AdminRepository.initializeDefaultAdmin();
    },

    /**
     * DIAGNÓSTICO: Verificar estado de localStorage
     */
    diagnosticarLocalStorage() {
        const adminSession = localStorage.getItem('outlet_admin');
        
        console.log('🔍 DIAGNÓSTICO localStorage:');
        console.log('  - outlet_admin:', adminSession ? '✅ EXISTE' : '❌ NO EXISTE');
        
        if (adminSession) {
            try {
                const parsed = JSON.parse(adminSession);
                console.log('  - Contenido outlet_admin:', parsed);
                console.log('  - Rol en sesión:', parsed.rol);
                console.log('  - ¿Es admin?', parsed.rol === 'admin' || parsed.rol === 'super_admin');
            } catch (e) {
                console.error('  - Error parseando outlet_admin:', e);
            }
        }
        
        return {
            hasAdminSession: !!adminSession,
            adminSession: adminSession ? JSON.parse(adminSession) : null
        };
    },

    /**
     * 🔍 DIAGNÓSTICO: Verificar si el admin actual tiene permisos
     * Útil para depurar problemas de visualización
     */
    async diagnosticarPermisos() {
        console.log('🔍 ===== DIAGNÓSTICO DE PERMISOS =====');
        
        const session = this._getSession();
        console.log('  📦 Sesión existe:', !!session);
        console.log('  📦 Rol en sesión:', session?.rol);
        console.log('  📦 ¿Es admin o super_admin?', session?.rol === 'admin' || session?.rol === 'super_admin');
        
        try {
            const currentAdmin = await this.getCurrentAdmin(true);
            console.log('  👤 Admin actual desde DB:', currentAdmin?.nombre);
            console.log('  👤 Rol desde DB:', currentAdmin?.rol);
            
            if (currentAdmin) {
                const hasAdminView = currentAdmin.hasPermission('admin.view');
                console.log('  🔑 Tiene permiso admin.view:', hasAdminView);
                console.log('  🔑 Es super_admin:', currentAdmin.rol === ROLES.SUPER_ADMIN);
                console.log('  🔑 Es admin:', currentAdmin.rol === ROLES.ADMIN);
            }
        } catch (error) {
            console.error('  ❌ Error al obtener admin actual:', error.message);
        }
        
        try {
            const admins = await this.getAllAdmins();
            console.log('  📋 Admins obtenidos:', admins.length);
            if (admins.length > 0) {
                console.log('  📋 Primer admin:', admins[0]);
            }
        } catch (error) {
            console.error('  ❌ Error al obtener admins:', error.message);
        }
        
        console.log('🔍 ===== FIN DIAGNÓSTICO =====');
    },

    // ========== MÉTODOS PRIVADOS ==========

    _validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Guarda la sesión en localStorage
     * 📦 Formato JSON estándar
     */
    _saveSession(adminData) {
        if (!adminData || typeof adminData !== 'object') {
            console.error('❌ Intento de guardar sesión inválida');
            return;
        }
        
        const validSession = {
            id: adminData.id || null,
            nombre: adminData.nombre || '',
            apellidoPa: adminData.apellidoPa || '',
            apellidoMa: adminData.apellidoMa || '',
            nombreCompleto: adminData.nombreCompleto || `${adminData.nombre || ''} ${adminData.apellidoPa || ''}`.trim(),
            email: adminData.email || '',
            rol: adminData.rol || ROLES.ADMIN, // ✅ Por defecto 'admin'
            estado: adminData.estado || 'activo',
            iniciales: adminData.iniciales || (adminData.nombre ? adminData.nombre[0] : 'A'),
            fechaSesion: adminData.fechaSesion || new Date().toISOString(),
            permisos: adminData.permisos || this._getDefaultPermisosByRol(adminData.rol || ROLES.ADMIN),
            ultimoAcceso: new Date().toISOString(),
            version: '1.0'
        };
        
        localStorage.setItem('outlet_admin', JSON.stringify(validSession));
        console.log('✅ Sesión de admin guardada:', { id: validSession.id, rol: validSession.rol });
    },

    _getSession() {
        const session = localStorage.getItem('outlet_admin');
        if (!session) return null;
        
        try {
            const parsed = JSON.parse(session);
            console.log('📖 Sesión recuperada, rol:', parsed.rol);
            return parsed;
        } catch (error) {
            console.error('❌ Error parseando sesión:', error);
            return null;
        }
    },

    _clearSession() {
        localStorage.removeItem('outlet_admin');
        console.log('🗑️ Sesión de admin eliminada');
    },

    _dispatchAuthChange(adminData) {
        const event = new CustomEvent('admin:authStateChanged', { 
            detail: adminData 
        });
        window.dispatchEvent(event);
    }
};