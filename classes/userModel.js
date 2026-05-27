/* ========================================
   USER MODEL - Outlet Val
   Estructura de datos del usuario
   ======================================== */

export class User {
    constructor(data = {}) {
        // Datos básicos
        this.id = data.id || null;
        this.nombre = data.nombre || '';
        this.apellidoPa = data.apellidoPa || '';      // Apellido paterno
        this.apellidoMa = data.apellidoMa || '';      // Apellido materno
        this.email = data.email || '';
        
        // Autenticación
        this.provider = data.provider || 'email';      // 'email' o 'google'
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
        
        // Metadata
        this.fechaRegistro = data.fechaRegistro || new Date().toISOString();
        this.fechaActualizacion = data.fechaActualizacion || null;
        this.ultimoLogin = data.ultimoLogin || null;
        this.activo = data.activo !== undefined ? data.activo : true;
        
        // Preferencias
        this.preferencias = data.preferencias || {
            newsletter: false,
            notificaciones: true
        };
    }
    
    // Getter: Nombre completo
    get nombreCompleto() {
        const partes = [this.nombre, this.apellidoPa, this.apellidoMa].filter(p => p);
        return partes.join(' ') || 'Usuario';
    }
    
    // Getter: Iniciales para avatar
    get iniciales() {
        const primera = this.nombre ? this.nombre.charAt(0) : '';
        const segunda = this.apellidoPa ? this.apellidoPa.charAt(0) : '';
        return (primera + segunda).toUpperCase() || 'U';
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
            nombreCompleto: this.nombreCompleto,
            iniciales: this.iniciales,
            provider: this.provider
        };
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
}