/* ========================================
   PRODUCT SERVICE - Outlet Val
   Lógica de negocio para productos
   ✅ VERSIÓN OPTIMIZADA CON ÍNDICES
   CON SOPORTE PARA FIREBASE STORAGE
   MONEDA: PESOS MEXICANOS (MXN)
   ======================================== */

import { Product } from '../classes/productModel.js';
import { ProductRepository } from '../repositories/productRepository.js';
import { CacheService, STORES } from '../services/cacheService.js';
import { StorageService } from '../services/storageService.js';

export const ProductService = {
    /**
     * Crear nuevo producto
     * @param {Object} productData - Datos del producto
     * @param {string} adminUserId - ID del admin que crea el producto
     * @param {Object} imagePaths - Rutas de las imágenes en Storage
     * @returns {Promise<Product>}
     */
    async create(productData, adminUserId = null, imagePaths = {}) {
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
            imagenPrincipal: productData.imagenPrincipal, // URL de Firebase Storage
            galeriaImagenes: productData.galeriaImagenes || [], // URLs de Firebase Storage
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
            createdBy: adminUserId,
            // Guardar rutas de Storage
            imagenesStorage: {
                main: imagePaths.main || '',
                gallery: imagePaths.gallery || []
            }
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
            imagenesStorage: product.imagenesStorage,
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
     * @param {string} productId - ID del producto
     * @param {boolean} hardDelete - Eliminar permanentemente
     * @param {boolean} deleteImages - Eliminar imágenes de Storage
     */
    async delete(productId, hardDelete = false, deleteImages = true) {
        // Obtener producto para eliminar imágenes
        const product = await this.getById(productId, true);

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        // Eliminar imágenes de Storage si se solicita
        if (deleteImages && product.tieneImagenesEnStorage) {
            try {
                const pathsToDelete = [];

                // Agregar imagen principal
                if (product.rutaImagenPrincipal) {
                    pathsToDelete.push(product.rutaImagenPrincipal);
                }

                // Agregar imágenes de galería
                if (product.rutasGaleria.length > 0) {
                    pathsToDelete.push(...product.rutasGaleria);
                }

                if (pathsToDelete.length > 0) {
                    await StorageService.deleteMultipleImages(pathsToDelete);
                    console.log(`🗑️ ${pathsToDelete.length} imágenes eliminadas de Storage`);
                }
            } catch (error) {
                console.error('❌ Error al eliminar imágenes de Storage:', error);
                // No lanzamos error, solo registramos
            }
        }

        const result = await ProductRepository.delete(productId, hardDelete);

        await CacheService.clearCache(STORES.PRODUCTS);

        // ✅ NOTIFICAR QUE HUBO CAMBIOS
        window.dispatchEvent(new CustomEvent('products:updated', {
            detail: {
                action: 'delete',
                productId: productId,
                hardDelete: hardDelete,
                imagesDeleted: deleteImages
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
     * Intenta por categoría+género, si no hay resultados relaja los filtros
     * en cascada para siempre devolver productos reales de la base de datos
     * cuando existan, en vez de una lista vacía.
     */
    async getRelatedProducts(productId, limit = 4) {
        const product = await this.getById(productId);

        if (!product) return [];

        const excludeSelf = (list) => list.filter(p => p.id !== productId);

        // Nivel 1: misma categoría y mismo género
        if (product.categoria && product.genero) {
            const exact = excludeSelf(await this.getAll({
                categoria: product.categoria,
                genero: product.genero
            }, 'createdAt', 'desc', limit + 1));
            if (exact.length > 0) return exact.slice(0, limit);
        }

        // Nivel 2: misma categoría (cualquier género)
        if (product.categoria) {
            const sameCategory = excludeSelf(await this.getAll({
                categoria: product.categoria
            }, 'createdAt', 'desc', limit + 1));
            if (sameCategory.length > 0) return sameCategory.slice(0, limit);
        }

        // Nivel 3: mismo género (cualquier categoría)
        if (product.genero) {
            const sameGender = excludeSelf(await this.getAll({
                genero: product.genero
            }, 'createdAt', 'desc', limit + 1));
            if (sameGender.length > 0) return sameGender.slice(0, limit);
        }

        // Nivel 4: fallback general - productos más recientes del catálogo
        const fallback = excludeSelf(await this.getAll({}, 'createdAt', 'desc', limit + 1));
        return fallback.slice(0, limit);
    },

    /**
     * Eliminar imágenes de un producto de Storage
     * @param {string} productId - ID del producto
     * @param {string[]} specificPaths - Rutas específicas a eliminar (opcional)
     */
    async deleteProductImages(productId, specificPaths = null) {
        const product = await this.getById(productId, true);

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        let pathsToDelete = [];

        if (specificPaths && specificPaths.length > 0) {
            // Eliminar rutas específicas
            pathsToDelete = specificPaths;
        } else {
            // Eliminar todas las imágenes
            if (product.rutaImagenPrincipal) {
                pathsToDelete.push(product.rutaImagenPrincipal);
            }
            if (product.rutasGaleria.length > 0) {
                pathsToDelete.push(...product.rutasGaleria);
            }
        }

        if (pathsToDelete.length === 0) {
            return { success: [], failed: [] };
        }

        const result = await StorageService.deleteMultipleImages(pathsToDelete);

        // Actualizar producto si se eliminaron todas las imágenes
        if (!specificPaths || specificPaths.length === 0) {
            await this.update(productId, {
                imagenPrincipal: '',
                galeriaImagenes: [],
                imagenesStorage: { main: '', gallery: [] }
            });
        } else {
            // Actualizar rutas específicas
            const updatedStorage = { ...product.imagenesStorage };

            // Verificar si se eliminó la principal
            if (specificPaths.includes(product.rutaImagenPrincipal)) {
                updatedStorage.main = '';
            }

            // Verificar si se eliminaron imágenes de galería
            const remainingGallery = product.rutasGaleria.filter(
                path => !specificPaths.includes(path)
            );
            updatedStorage.gallery = remainingGallery;

            await this.update(productId, {
                imagenesStorage: updatedStorage
            });
        }

        return result;
    },

    // ========== UTILIDADES DE FORMATO ==========

    /**
     * Formatear precio con símbolo de pesos mexicanos
     */
    formatPrice(amount) {
        if (amount === undefined || amount === null) return '$$0.00';
        return `$${amount.toFixed(2)}`;
    },

    /**
     * Formatear precio final con descuento aplicado
     */
    formatFinalPrice(product) {
        if (!product) return '$$0.00';
        const price = product.precioFinal || product.precioVenta || 0;
        return `$${price.toFixed(2)}`;
    },

    /**
     * Formatear precio original (sin descuento)
     */
    formatOriginalPrice(product) {
        if (!product) return '$$0.00';
        return `$${(product.precioVenta || 0).toFixed(2)}`;
    },

    /**
     * Formatear ahorro
     */
    formatSavings(product) {
        if (!product || !product.enOferta) return null;
        return `$${product.ahorro.toFixed(2)}`;
    },

    /**
     * Obtener precio con formato para mostrar en tabla
     */
    getPriceDisplay(product) {
        if (!product) return { price: '$$0.00', original: null };

        const finalPrice = product.precioFinal || product.precioVenta || 0;
        const originalPrice = product.precioVenta || 0;

        if (product.enOferta) {
            return {
                price: `$${finalPrice.toFixed(2)}`,
                original: `$${originalPrice.toFixed(2)}`,
                savings: `$${(originalPrice - finalPrice).toFixed(2)}`
            };
        }

        return {
            price: `$${finalPrice.toFixed(2)}`,
            original: null,
            savings: null
        };
    }
};