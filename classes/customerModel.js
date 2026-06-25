/* ========================================
   CUSTOMER MODEL - Outlet Val
   Modelo de datos para clientes (customers)
   ======================================== */

export class Customer {
    constructor(data = {}) {
        // Datos básicos
        this.id = data.id || null;
        this.nombre = data.nombre || '';
        this.apellidoPa = data.apellidoPa || '';
        this.apellidoMa = data.apellidoMa || '';
        this.email = data.email || '';
        this.fotoPerfil = data.fotoPerfil || ''; // 🆕 URL de la foto de perfil
        
        // Rol fijo: 'customer'
        this.rol = 'customer';
        
        // Autenticación
        this.provider = data.provider || 'email';
        this.emailVerified = data.emailVerified || false;
        
        // Dirección de envío
        this.direccion = data.direccion || {
            destinatario: '',
            telefono1: '',
            telefono2: '',
            calle: '',
            numeroExterior: '',
            numeroInterior: '',
            colonia: '',
            ciudad: '',
            estado: '',
            codigoPostal: '',
            pais: 'México',
            referencias: ''
        };
        
        // Preferencias
        this.preferencias = data.preferencias || {
            newsletter: false,
            notificaciones: true
        };
        
        // Estado
        this.estado = data.estado || 'activo';
        
        // Metadata
        this.fechaRegistro = data.fechaRegistro || new Date().toISOString();
        this.fechaActualizacion = data.fechaActualizacion || new Date().toISOString();
        this.ultimoLogin = data.ultimoLogin || null;
        this.activo = data.activo !== undefined ? data.activo : true;
    }
    
    // Getter: Nombre completo
    get nombreCompleto() {
        const partes = [this.nombre, this.apellidoPa, this.apellidoMa].filter(p => p);
        return partes.join(' ') || 'Cliente';
    }
    
    // Getter: Iniciales para avatar
    get iniciales() {
        const primera = this.nombre ? this.nombre.charAt(0) : '';
        const segunda = this.apellidoPa ? this.apellidoPa.charAt(0) : '';
        return (primera + segunda).toUpperCase() || 'C';
    }
    
    // Getter: Obtener URL de foto o null
    get fotoUrl() {
        return this.fotoPerfil || null;
    }
    
    // Getter: Dirección formateada para mostrar
    get direccionFormateada() {
        const d = this.direccion;
        const partes = [
            d.calle,
            d.numeroExterior,
            d.numeroInterior ? `Int. ${d.numeroInterior}` : '',
            d.colonia,
            `${d.ciudad}, ${d.estado}`,
            d.codigoPostal,
            d.pais
        ].filter(p => p);
        
        return partes.join(', ');
    }
    
    // Getter: Dirección para etiqueta de envío
    get direccionEnvio() {
        const d = this.direccion;
        return {
            destinatario: d.destinatario || this.nombreCompleto,
            telefono: d.telefono1,
            calleNumero: `${d.calle} ${d.numeroExterior}`,
            colonia: d.colonia,
            ciudad: d.ciudad,
            estado: d.estado,
            cp: d.codigoPostal,
            referencias: d.referencias
        };
    }
    
    // Getter: Verificar si tiene dirección completa
    get tieneDireccionCompleta() {
        const d = this.direccion;
        return !!(
            d.calle &&
            d.numeroExterior &&
            d.colonia &&
            d.ciudad &&
            d.estado &&
            d.codigoPostal &&
            d.telefono1
        );
    }
    
    // Getter: Datos resumidos para localStorage
    get datosResumidos() {
        return {
            id: this.id,
            nombre: this.nombre,
            apellidoPa: this.apellidoPa,
            apellidoMa: this.apellidoMa,
            email: this.email,
            fotoPerfil: this.fotoPerfil,
            nombreCompleto: this.nombreCompleto,
            iniciales: this.iniciales,
            rol: this.rol,
            provider: this.provider,
            estado: this.estado
        };
    }
    
    // Método: Verificar si está activo
    isActive() {
        return this.activo && this.estado === 'activo';
    }
    
    // Método: Actualizar dirección
    actualizarDireccion(nuevaDireccion) {
        this.direccion = {
            ...this.direccion,
            ...nuevaDireccion
        };
        this.fechaActualizacion = new Date().toISOString();
        return this;
    }
    
    // Método: Actualizar preferencias
    actualizarPreferencias(nuevasPreferencias) {
        this.preferencias = {
            ...this.preferencias,
            ...nuevasPreferencias
        };
        this.fechaActualizacion = new Date().toISOString();
        return this;
    }
    
    // 🆕 Método: Actualizar foto de perfil
    actualizarFotoPerfil(url) {
        this.fotoPerfil = url;
        this.fechaActualizacion = new Date().toISOString();
        return this;
    }
    
    // Método: Actualizar último login
    updateUltimoLogin() {
        this.ultimoLogin = new Date().toISOString();
        this.fechaActualizacion = new Date().toISOString();
    }
    
    // Método: Validar datos requeridos para compra
    validarParaCompra() {
        const errores = [];
        const d = this.direccion;
        
        if (!d.destinatario && !this.nombreCompleto) {
            errores.push('Nombre del destinatario requerido');
        }
        if (!d.telefono1) {
            errores.push('Teléfono de contacto requerido');
        }
        if (!d.calle) {
            errores.push('Calle requerida');
        }
        if (!d.numeroExterior) {
            errores.push('Número exterior requerido');
        }
        if (!d.colonia) {
            errores.push('Colonia requerida');
        }
        if (!d.ciudad) {
            errores.push('Ciudad requerida');
        }
        if (!d.estado) {
            errores.push('Estado requerido');
        }
        if (!d.codigoPostal) {
            errores.push('Código postal requerido');
        }
        
        return {
            valido: errores.length === 0,
            errores
        };
    }
    
    // Método: Validar datos del customer
    validate() {
        const errors = [];
        
        if (!this.email || !this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push('Email inválido');
        }
        
        if (!this.nombre || this.nombre.trim().length < 2) {
            errors.push('Nombre debe tener al menos 2 caracteres');
        }
        
        if (this.rol !== 'customer') {
            errors.push('Rol inválido para customer');
        }
        
        if (!['activo', 'inactivo', 'suspendido'].includes(this.estado)) {
            errors.push('Estado inválido');
        }
        
        return errors;
    }
    
    // Método estático: Crear Customer desde datos de Firebase Auth
    static fromFirebaseUser(firebaseUser, additionalData = {}) {
        // 🆕 Obtener foto de perfil de Google si existe
        let fotoPerfil = additionalData.fotoPerfil || '';
        if (!fotoPerfil && firebaseUser.photoURL) {
            fotoPerfil = firebaseUser.photoURL;
        }
        
        return new Customer({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            nombre: additionalData.nombre || firebaseUser.displayName?.split(' ')[0] || '',
            apellidoPa: additionalData.apellidoPa || firebaseUser.displayName?.split(' ')[1] || '',
            apellidoMa: additionalData.apellidoMa || '',
            fotoPerfil: fotoPerfil,
            provider: additionalData.provider || 'email',
            emailVerified: firebaseUser.emailVerified || false,
            direccion: additionalData.direccion || {},
            preferencias: additionalData.preferencias || {},
            estado: additionalData.estado || 'activo',
            fechaRegistro: firebaseUser.metadata?.creationTime || new Date().toISOString(),
            ultimoLogin: firebaseUser.metadata?.lastSignInTime || null
        });
    }
}