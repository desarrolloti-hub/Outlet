/* ========================================
   PRODUCT MODEL - Outlet Val
   Estructura de datos del producto
   ======================================== */

export class Product {
    constructor(data = {}) {
        // Identificación
        this.id = data.id || null;
        this.sku = data.sku || '';                    // Código único
        
        // Información básica
        this.nombre = data.nombre || '';
        this.descripcion = data.descripcion || '';
        this.marca = data.marca || '';
        this.categoria = data.categoria || '';
        this.subcategoria = data.subcategoria || '';
        this.genero = data.genero || '';               // hombre, mujer, unisex, kids
        
        // Precios
        this.precioCompra = data.precioCompra || 0;
        this.precioVenta = data.precioVenta || 0;
        this.porcentajeDescuento = data.porcentajeDescuento || 0;
        
        // Imágenes (base64)
        this.imagenPrincipal = data.imagenPrincipal || '';
        this.galeriaImagenes = data.galeriaImagenes || [];
        
        // Especificaciones
        this.colores = data.colores || [];              // Array de strings
        this.tallas = data.tallas || [];                // Array de strings
        this.materiales = data.materiales || [];        // Array de strings
        this.temporada = data.temporada || '';
        this.tipoAjuste = data.tipoAjuste || '';
        this.composicion = data.composicion || '';
        this.peso = data.peso || null;                  // en gramos
        
        // Inventario y estado
        this.stock = data.stock || 0;
        this.estado = data.estado || 'activo';          // activo, inactivo, agotado, proximamente
        this.destacado = data.destacado || false;
        
        // Metadata
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || null;
        this.createdBy = data.createdBy || null;        // ID del admin que lo creó
    }
    
    // ========== GETTERS ==========
    
    // Precio final con descuento aplicado
    get precioFinal() {
        if (this.porcentajeDescuento > 0 && this.porcentajeDescuento <= 90) {
            return this.precioVenta * (1 - this.porcentajeDescuento / 100);
        }
        return this.precioVenta;
    }
    
    // ¿Está en oferta?
    get enOferta() {
        return this.porcentajeDescuento > 0;
    }
    
    // Ahorro en euros
    get ahorro() {
        if (!this.enOferta) return 0;
        return this.precioVenta - this.precioFinal;
    }
    
    // ¿Hay stock disponible?
    get tieneStock() {
        return this.stock > 0 && this.estado === 'activo';
    }
    
    // Primera imagen de la galería (si no hay principal)
    get primeraImagen() {
        if (this.imagenPrincipal) return this.imagenPrincipal;
        if (this.galeriaImagenes.length > 0) return this.galeriaImagenes[0];
        return '';
    }
    
    // Cantidad de imágenes
    get totalImagenes() {
        let count = 0;
        if (this.imagenPrincipal) count++;
        count += this.galeriaImagenes.length;
        return count;
    }
    
    // Colores como string para mostrar
    get coloresTexto() {
        return this.colores.join(', ');
    }
    
    // Tallas como string para mostrar
    get tallasTexto() {
        return this.tallas.join(', ');
    }
    
    // Materiales como string para mostrar
    get materialesTexto() {
        return this.materiales.join(', ');
    }
    
    // Datos resumidos para listados (sin imágenes pesadas)
    get datosResumidos() {
        return {
            id: this.id,
            sku: this.sku,
            nombre: this.nombre,
            marca: this.marca,
            categoria: this.categoria,
            precioVenta: this.precioVenta,
            porcentajeDescuento: this.porcentajeDescuento,
            precioFinal: this.precioFinal,
            enOferta: this.enOferta,
            imagenPrincipal: this.imagenPrincipal,
            stock: this.stock,
            estado: this.estado,
            destacado: this.destacado
        };
    }
    
    // ========== MÉTODOS ==========
    
    // Reducir stock cuando se vende
    reducirStock(cantidad) {
        if (this.stock >= cantidad) {
            this.stock -= cantidad;
            this.updatedAt = new Date().toISOString();
            
            // Si llega a 0, cambiar estado a agotado
            if (this.stock === 0 && this.estado === 'activo') {
                this.estado = 'agotado';
            }
            return true;
        }
        return false;
    }
    
    // Aumentar stock
    aumentarStock(cantidad) {
        this.stock += cantidad;
        this.updatedAt = new Date().toISOString();
        
        // Si estaba agotado y ahora tiene stock, reactivar
        if (this.estado === 'agotado' && this.stock > 0) {
            this.estado = 'activo';
        }
        return this.stock;
    }
    
    // Validar producto completo
    validarParaPublicar() {
        const errores = [];
        
        if (!this.sku) errores.push('SKU requerido');
        if (!this.nombre) errores.push('Nombre requerido');
        if (!this.descripcion) errores.push('Descripción requerida');
        if (!this.marca) errores.push('Marca requerida');
        if (!this.categoria) errores.push('Categoría requerida');
        if (!this.genero) errores.push('Género requerido');
        if (this.precioVenta <= 0) errores.push('Precio de venta debe ser mayor a 0');
        if (!this.imagenPrincipal) errores.push('Imagen principal requerida');
        
        return {
            valido: errores.length === 0,
            errores
        };
    }
    
    // Validar para mostrar en tienda (público)
    get visibleEnTienda() {
        return this.estado === 'activo' && this.stock > 0;
    }
}