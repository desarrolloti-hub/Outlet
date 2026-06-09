/* ========================================
   ADMIN MODEL - Outlet Val
   Modelo de datos para administradores
   ======================================== */

export class Admin {
    constructor(data = {}) {
        this.id = data.id || null;
        this.email = data.email || '';
        this.nombre = data.nombre || '';
        this.apellidoPa = data.apellidoPa || '';
        this.apellidoMa = data.apellidoMa || '';
        this.rol = data.rol || 'admin'; // admin, super_admin, editor
        this.estado = data.estado || 'activo'; // activo, inactivo, suspendido
        this.permisos = data.permisos || this._getDefaultPermissions();
        this.ultimoAcceso = data.ultimoAcceso || null;
        this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
        this.fechaActualizacion = data.fechaActualizacion || new Date().toISOString();
        this.intentosFallidos = data.intentosFallidos || 0;
        this.bloqueadoHasta = data.bloqueadoHasta || null;
        this.provider = data.provider || 'email'; // email, google
        this.emailVerified = data.emailVerified || false;
        this.activo = data.activo !== undefined ? data.activo : true;
    }

    /**
     * Obtener permisos por defecto según el rol
     */
    _getDefaultPermissions() {
        const permissions = {
            admin: [
                'dashboard.view',
                'products.view', 'products.create', 'products.edit', 'products.delete',
                'orders.view', 'orders.edit', 'orders.delete',
                'users.view', 'users.edit',
                'reports.view', 'reports.export'
            ],
            editor: [
                'dashboard.view',
                'products.view', 'products.create', 'products.edit',
                'orders.view', 'orders.edit',
                'users.view'
            ],
            super_admin: [] // Todos los permisos (se maneja en hasPermission)
        };
        
        return permissions[this.rol] || permissions.admin;
    }

    /**
     * Verificar si tiene un permiso específico
     */
    hasPermission(permission) {
        if (this.rol === 'super_admin') return true;
        if (!this.permisos) return false;
        return this.permisos.includes(permission);
    }

    /**
     * Verificar si el admin está activo y no bloqueado
     */
    isActive() {
        if (!this.activo || this.estado !== 'activo') return false;
        
        if (this.bloqueadoHasta) {
            const ahora = new Date();
            const bloqueadoHasta = new Date(this.bloqueadoHasta);
            if (ahora < bloqueadoHasta) return false;
        }
        
        return true;
    }

    /**
     * Registrar intento fallido de login
     */
    registrarIntentoFallido() {
        this.intentosFallidos++;
        
        // Bloquear por 15 minutos después de 5 intentos fallidos
        if (this.intentosFallidos >= 5) {
            const bloqueoFecha = new Date();
            bloqueoFecha.setMinutes(bloqueoFecha.getMinutes() + 15);
            this.bloqueadoHasta = bloqueoFecha.toISOString();
        }
        
        this.fechaActualizacion = new Date().toISOString();
    }

    /**
     * Reiniciar intentos fallidos después de login exitoso
     */
    reiniciarIntentosFallidos() {
        this.intentosFallidos = 0;
        this.bloqueadoHasta = null;
        this.fechaActualizacion = new Date().toISOString();
    }

    /**
     * Actualizar último acceso
     */
    updateUltimoAcceso() {
        this.ultimoAcceso = new Date().toISOString();
        this.fechaActualizacion = new Date().toISOString();
    }

    /**
     * Obtener nombre completo
     */
    get nombreCompleto() {
        const partes = [this.nombre, this.apellidoPa, this.apellidoMa];
        return partes.filter(p => p).join(' ').trim();
    }

    /**
     * Obtener iniciales para avatar
     */
    get iniciales() {
        const primera = this.nombre ? this.nombre.charAt(0) : '';
        const segunda = this.apellidoPa ? this.apellidoPa.charAt(0) : '';
        return (primera + segunda).toUpperCase();
    }

    /**
     * Datos resumidos para sesión (sin datos sensibles)
     */
    get datosResumidos() {
        return {
            id: this.id,
            email: this.email,
            nombre: this.nombre,
            apellidoPa: this.apellidoPa,
            apellidoMa: this.apellidoMa,
            nombreCompleto: this.nombreCompleto,
            iniciales: this.iniciales,
            rol: this.rol,
            estado: this.estado,
            permisos: this.permisos
        };
    }

    /**
     * Validar datos del admin
     */
    validate() {
        const errors = [];
        
        if (!this.email || !this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push('Email inválido');
        }
        
        if (!this.nombre || this.nombre.trim().length < 2) {
            errors.push('Nombre debe tener al menos 2 caracteres');
        }
        
        if (!['admin', 'editor', 'super_admin'].includes(this.rol)) {
            errors.push('Rol inválido');
        }
        
        if (!['activo', 'inactivo', 'suspendido'].includes(this.estado)) {
            errors.push('Estado inválido');
        }
        
        return errors;
    }

    /**
     * Crear Admin desde datos de Firebase Auth
     */
    static fromFirebaseUser(firebaseUser, additionalData = {}) {
        return new Admin({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            nombre: additionalData.nombre || firebaseUser.displayName?.split(' ')[0] || '',
            apellidoPa: additionalData.apellidoPa || firebaseUser.displayName?.split(' ')[1] || '',
            apellidoMa: additionalData.apellidoMa || '',
            rol: additionalData.rol || 'admin',
            estado: additionalData.estado || 'activo',
            provider: additionalData.provider || 'email',
            emailVerified: firebaseUser.emailVerified || false,
            fechaCreacion: firebaseUser.metadata?.creationTime || new Date().toISOString(),
            ultimoAcceso: firebaseUser.metadata?.lastSignInTime || null,
            permisos: additionalData.permisos || null
        });
    }
}