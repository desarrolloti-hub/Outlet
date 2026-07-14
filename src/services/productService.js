/* ========================================
   PRODUCT SERVICE - Outlet Val
   Lógica de negocio para productos
   ✅ VERSIÓN OPTIMIZADA CON ÍNDICES
   ======================================== */

import { Product } from '../classes/productModel.js';
import { ProductRepository } from '../repositories/productRepository.js';
import { CacheService, STORES } from '../services/cacheService.js';

export const ProductService = {
    /**
     * Crear nuevo producto
     */
    async create(productData, adminUserId = null) {
        // ========== VALIDACIONES ==========
        if (!productData.sku || productData.sku.trim().length < 3) {
            throw new Error('El SKU debe tener al menos 3 caracteres');
        }
        
        if (!productData.nombre || productData.nombre.trim().length < 3) {
            throw new Error('El nombre debe tener al menos 3 caracteres');
        }
        
        if (!productData.descripcion || productData.descripcion.trim().length < 10) {
            throw new Error('La descripción debe tener al menos 10 caracteres');
        }
        
        if (!productData.marca) {
            throw new Error('La marca es requerida');
        }
        
        if (!productData.categoria) {
            throw new Error('La categoría es requerida');
        }
        
        if (productData.precioVenta <= 0) {
            throw new Error('El precio de venta debe ser mayor a 0');
        }
        
        if (productData.porcentajeDescuento < 0 || productData.porcentajeDescuento > 90) {
            throw new Error('El descuento debe estar entre 0 y 90%');
        }
        
        if (!productData.imagenPrincipal) {
            throw new Error('La imagen principal es requerida');
        }
        
        // Verificar que el SKU no exista ya
        const existing = await ProductRepository.getBySku(productData.sku);
        if (existing) {
            throw new Error(`Ya existe un producto con el SKU "${productData.sku}"`);
        }
        
        // ========== CREAR MODELO ==========
        const product = new Product({
            sku: productData.sku.trim().toUpperCase(),
            nombre: productData.nombre.trim(),
            descripcion: productData.descripcion.trim(),
            marca: productData.marca.trim(),
            categoria: productData.categoria,
            subcategoria: productData.subcategoria || '',
            genero: productData.genero,
            precioCompra: parseFloat(productData.precioCompra) || 0,
            precioVenta: parseFloat(productData.precioVenta),
            porcentajeDescuento: parseInt(productData.porcentajeDescuento) || 0,
            imagenPrincipal: productData.imagenPrincipal,
            galeriaImagenes: productData.galeriaImagenes || [],
            colores: productData.colores || [],
            tallas: productData.tallas || [],
            materiales: productData.materiales || [],
            temporada: productData.temporada || '',
            tipoAjuste: productData.tipoAjuste || '',
            composicion: productData.composicion || '',
            peso: productData.peso ? parseInt(productData.peso) : null,
            stock: parseInt(productData.stock) || 0,
            estado: productData.estado || 'activo',
            destacado: productData.destacado || false,
            createdBy: adminUserId
        });
        
        // Generar ID único basado en SKU + timestamp
        product.id = `${product.sku}_${Date.now()}`;
        
        // ========== CONVERTIR A OBJETO PLANO ==========
        const productPlain = {
            id: product.id,
            sku: product.sku,
            nombre: product.nombre,
            descripcion: product.descripcion,
            marca: product.marca,
            categoria: product.categoria,
            subcategoria: product.subcategoria,
            genero: product.genero,
            precioCompra: product.precioCompra,
            precioVenta: product.precioVenta,
            porcentajeDescuento: product.porcentajeDescuento,
            imagenPrincipal: product.imagenPrincipal,
            galeriaImagenes: product.galeriaImagenes,
            colores: product.colores,
            tallas: product.tallas,
            materiales: product.materiales,
            temporada: product.temporada,
            tipoAjuste: product.tipoAjuste,
            composicion: product.composicion,
            peso: product.peso,
            stock: product.stock,
            estado: product.estado,
            destacado: product.destacado,
            createdAt: product.createdAt,
            createdBy: product.createdBy
        };
        
        // ========== GUARDAR EN FIRESTORE ==========
        const result = await ProductRepository.save(productPlain);
        
        // Limpiar caché de productos
        await CacheService.clearCache(STORES.PRODUCTS);
        
        // ✅ NOTIFICAR QUE HUBO CAMBIOS
        window.dispatchEvent(new CustomEvent('products:updated', {
            detail: { 
                action: 'create', 
                productId: product.id,
                productName: product.nombre
            }
        }));
        
        return new Product(result);
    },
    
    /**
     * Obtener producto por ID (con caché)
     */
    async getById(productId, forceRefresh = false) {
        if (!forceRefresh) {
            const cached = await CacheService.getCache(STORES.PRODUCTS, productId);
            if (cached) {
                return new Product(cached);
            }
        }
        
        const productData = await ProductRepository.getById(productId);
        
        if (productData) {
            await CacheService.setCache(STORES.PRODUCTS, productId, productData, 3600000);
            return new Product(productData);
        }
        
        return null;
    },
    
    /**
     * Obtener producto por SKU
     */
    async getBySku(sku) {
        const productData = await ProductRepository.getBySku(sku);
        return productData ? new Product(productData) : null;
    },
    
    /**
     * Obtener todos los productos
     * ✅ OPTIMIZADO CON ÍNDICES
     */
    async getAll(filters = {}, sortBy = 'createdAt', sortDir = 'desc', limitCount = 50) {
        // Generar clave de caché basada en los filtros
        const cacheKey = `products_list_${JSON.stringify(filters)}_${sortBy}_${sortDir}_${limitCount}`;
        
        // Intentar obtener de caché
        const cached = await CacheService.getCache(STORES.PRODUCTS, cacheKey);
        if (cached) {
            return cached.map(p => new Product(p));
        }
        
        const productsData = await ProductRepository.getAll(filters, sortBy, sortDir, limitCount);
        const products = productsData.map(p => new Product(p));
        
        // Guardar en caché (30 minutos)
        await CacheService.setCache(STORES.PRODUCTS, cacheKey, productsData, 1800000);
        
        return products;
    },
    
    /**
     * Obtener productos destacados
     * ✅ OPTIMIZADO CON ÍNDICES
     */
    async getDestacados(limit = 10) {
        const cacheKey = `destacados_${limit}`;
        
        const cached = await CacheService.getCache(STORES.PRODUCTS, cacheKey);
        if (cached) {
            return cached.map(p => new Product(p));
        }
        
        const productsData = await ProductRepository.getDestacados(limit);
        const products = productsData.map(p => new Product(p));
        
        await CacheService.setCache(STORES.PRODUCTS, cacheKey, productsData, 1800000);
        
        return products;
    },
    
    /**
     * Obtener productos en oferta
     * ✅ NUEVO MÉTODO OPTIMIZADO CON ÍNDICES
     */
    async getOfertas(limit = 20) {
        const cacheKey = `ofertas_${limit}`;
        
        const cached = await CacheService.getCache(STORES.PRODUCTS, cacheKey);
        if (cached) {
            return cached.map(p => new Product(p));
        }
        
        const productsData = await ProductRepository.getOfertas(limit);
        const products = productsData.map(p => new Product(p));
        
        await CacheService.setCache(STORES.PRODUCTS, cacheKey, productsData, 1800000);
        
        return products;
    },
    
    /**
     * Obtener productos por categoría
     * ✅ OPTIMIZADO CON ÍNDICES
     */
    async getByCategoria(categoria, limit = 20) {
        const cacheKey = `categoria_${categoria}_${limit}`;
        
        const cached = await CacheService.getCache(STORES.PRODUCTS, cacheKey);
        if (cached) {
            return cached.map(p => new Product(p));
        }
        
        const productsData = await ProductRepository.getByCategoria(categoria, limit);
        const products = productsData.map(p => new Product(p));
        
        await CacheService.setCache(STORES.PRODUCTS, cacheKey, productsData, 1800000);
        
        return products;
    },
    
    /**
     * Actualizar producto
     */
    async update(productId, updateData) {
        const currentProduct = await this.getById(productId, true);
        
        if (!currentProduct) {
            throw new Error('Producto no encontrado');
        }
        
        if (updateData.nombre && updateData.nombre.length < 3) {
            throw new Error('El nombre debe tener al menos 3 caracteres');
        }
        
        if (updateData.precioVenta && updateData.precioVenta <= 0) {
            throw new Error('El precio de venta debe ser mayor a 0');
        }
        
        if (updateData.porcentajeDescuento !== undefined) {
            if (updateData.porcentajeDescuento < 0 || updateData.porcentajeDescuento > 90) {
                throw new Error('El descuento debe estar entre 0 y 90%');
            }
        }
        
        const updated = await ProductRepository.update(productId, updateData);
        
        // Limpiar caché de productos
        await CacheService.clearCache(STORES.PRODUCTS);
        
        // ✅ NOTIFICAR QUE HUBO CAMBIOS
        window.dispatchEvent(new CustomEvent('products:updated', {
            detail: { 
                action: 'update', 
                productId: productId
            }
        }));
        
        return new Product(updated);
    },
    
    /**
     * Actualizar stock
     */
    async updateStock(productId, cantidad) {
        const updated = await ProductRepository.updateStock(productId, cantidad);
        
        await CacheService.clearCache(STORES.PRODUCTS);
        
        // ✅ NOTIFICAR QUE HUBO CAMBIOS
        window.dispatchEvent(new CustomEvent('products:updated', {
            detail: { 
                action: 'updateStock', 
                productId: productId,
                cantidad: cantidad
            }
        }));
        
        return updated ? new Product(updated) : null;
    },
    
    /**
     * Eliminar producto
     */
    async delete(productId, hardDelete = false) {
        const result = await ProductRepository.delete(productId, hardDelete);
        
        await CacheService.clearCache(STORES.PRODUCTS);
        
        // ✅ NOTIFICAR QUE HUBO CAMBIOS
        window.dispatchEvent(new CustomEvent('products:updated', {
            detail: { 
                action: 'delete', 
                productId: productId,
                hardDelete: hardDelete
            }
        }));
        
        return result;
    },
    
    /**
     * Buscar productos
     * ✅ OPTIMIZADO CON ÍNDICES
     */
    async search(termino, limit = 20) {
        if (!termino || termino.trim().length < 2) {
            throw new Error('Ingrese al menos 2 caracteres para buscar');
        }
        
        const productsData = await ProductRepository.search(termino, limit);
        return productsData.map(p => new Product(p));
    },
    
    /**
     * Verificar si hay stock para un producto
     */
    async hasStock(productId, cantidad = 1) {
        const product = await this.getById(productId);
        
        if (!product) return false;
        if (!product.visibleEnTienda) return false;
        
        return product.stock >= cantidad;
    },
    
    /**
     * Validar producto para publicar
     */
    validateForPublish(productData) {
        const product = new Product(productData);
        return product.validarParaPublicar();
    },
    
    /**
     * Obtener productos relacionados
     */
    async getRelatedProducts(productId, limit = 4) {
        const product = await this.getById(productId);
        
        if (!product) return [];
        
        const filters = {
            categoria: product.categoria,
            genero: product.genero
        };
        
        const products = await this.getAll(filters);
        
        return products.filter(p => p.id !== productId).slice(0, limit);
    }
};