/* ========================================
   PRODUCT REPOSITORY - Outlet Val
   Operaciones CRUD directas con Firebase
   ✅ VERSIÓN CON ÍNDICES OPTIMIZADOS
   ======================================== */

import { db } from '../../config/firebaseConfig.js';
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    limit,
    orderBy
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const PRODUCTS_COLLECTION = 'productos';

export const ProductRepository = {
    /**
     * Guardar producto (crear o actualizar)
     */
    async save(productData) {
        try {
            const productRef = doc(db, PRODUCTS_COLLECTION, productData.id);
            await setDoc(productRef, productData);
            return { id: productData.id, ...productData };
        } catch (error) {
            console.error('Error guardando producto:', error);
            throw new Error(`Error al guardar producto: ${error.message}`);
        }
    },
    
    /**
     * Obtener producto por ID
     */
    async getById(productId) {
        try {
            const productRef = doc(db, PRODUCTS_COLLECTION, productId);
            const docSnap = await getDoc(productRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            throw new Error(`Error al obtener producto: ${error.message}`);
        }
    },
    
    /**
     * Obtener producto por SKU
     */
    async getBySku(sku) {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('sku', '==', sku),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error buscando por SKU:', error);
            throw new Error(`Error al buscar producto: ${error.message}`);
        }
    },
    
    /**
     * Obtener todos los productos (con filtros opcionales)
     * ✅ VERSIÓN OPTIMIZADA CON ÍNDICES
     */
    async getAll(filters = {}, sortBy = 'createdAt', sortDir = 'desc', limitCount = 50) {
        try {
            let constraints = [];
            const collectionRef = collection(db, PRODUCTS_COLLECTION);
            
            // ✅ FILTROS SIMPLES (indexados)
            if (filters.categoria) {
                constraints.push(where('categoria', '==', filters.categoria));
            }
            if (filters.genero) {
                constraints.push(where('genero', '==', filters.genero));
            }
            if (filters.estado) {
                constraints.push(where('estado', '==', filters.estado));
            }
            if (filters.destacado !== undefined) {
                constraints.push(where('destacado', '==', filters.destacado));
            }
            
            // ✅ FILTRO POR DESCUENTO (indexado)
            if (filters.enOferta) {
                constraints.push(where('porcentajeDescuento', '>', 0));
            }
            
            // ✅ ORDENAMIENTO (requiere índices compuestos)
            // Los índices deben crearse en Firebase Console
            const orderDirection = sortDir === 'desc' ? 'desc' : 'asc';
            constraints.push(orderBy(sortBy, orderDirection));
            
            // ✅ LÍMITE
            constraints.push(limit(limitCount));
            
            const q = query(collectionRef, ...constraints);
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`📦 Productos obtenidos con índices: ${productos.length}`);
            return productos;
            
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            
            // ✅ FALLBACK: Si hay error (falta índice), usar versión sin índices
            console.log('🔄 Intentando fallback sin índices compuestos...');
            return await this._getAllFallback(filters, sortBy, sortDir, limitCount);
        }
    },
    
    /**
     * FALLBACK: Versión sin índices compuestos (más lenta pero funciona)
     */
    async _getAllFallback(filters = {}, sortBy = 'createdAt', sortDir = 'desc', limitCount = 50) {
        try {
            let constraints = [];
            const collectionRef = collection(db, PRODUCTS_COLLECTION);
            
            // Solo filtros simples
            if (filters.categoria) {
                constraints.push(where('categoria', '==', filters.categoria));
            }
            if (filters.genero) {
                constraints.push(where('genero', '==', filters.genero));
            }
            if (filters.estado) {
                constraints.push(where('estado', '==', filters.estado));
            }
            if (filters.destacado !== undefined) {
                constraints.push(where('destacado', '==', filters.destacado));
            }
            
            // Traer más datos para filtrar en memoria
            constraints.push(limit(limitCount * 3));
            
            const q = query(collectionRef, ...constraints);
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            
            // Filtrar en memoria
            let filteredProducts = productos;
            if (filters.enOferta) {
                filteredProducts = filteredProducts.filter(p => p.porcentajeDescuento > 0);
            }
            
            // Ordenar en memoria
            filteredProducts.sort((a, b) => {
                let valA = a[sortBy];
                let valB = b[sortBy];
                
                if (valA === null || valA === undefined) valA = '';
                if (valB === null || valB === undefined) valB = '';
                
                if (typeof valA === 'string' && typeof valB === 'string') {
                    return sortDir === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
                }
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortDir === 'desc' ? valB - valA : valA - valB;
                }
                return 0;
            });
            
            const result = filteredProducts.slice(0, limitCount);
            console.log(`📦 Productos fallback: ${result.length}`);
            return result;
            
        } catch (fallbackError) {
            console.error('Error en fallback:', fallbackError);
            throw new Error(`Error al obtener productos: ${fallbackError.message}`);
        }
    },
    
    /**
     * Obtener productos destacados
     * ✅ OPTIMIZADO CON ÍNDICES
     */
    async getDestacados(limitCount = 10) {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('destacado', '==', true),
                where('estado', '==', 'activo'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`📦 Productos destacados: ${productos.length}`);
            return productos;
            
        } catch (error) {
            console.error('Error obteniendo productos destacados:', error);
            // Fallback sin índices
            return await this._getDestacadosFallback(limitCount);
        }
    },
    
    /**
     * FALLBACK: Productos destacados sin índices compuestos
     */
    async _getDestacadosFallback(limitCount = 10) {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('destacado', '==', true),
                where('estado', '==', 'activo')
            );
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            
            productos.sort((a, b) => {
                const dateA = a.createdAt || '';
                const dateB = b.createdAt || '';
                return dateB.localeCompare(dateA);
            });
            
            return productos.slice(0, limitCount);
        } catch (error) {
            console.error('Error en fallback destacados:', error);
            throw new Error(`Error al obtener productos destacados: ${error.message}`);
        }
    },
    
    /**
     * Obtener productos por categoría
     * ✅ OPTIMIZADO CON ÍNDICES
     */
    async getByCategoria(categoria, limitCount = 20) {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('categoria', '==', categoria),
                where('estado', '==', 'activo'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`📦 Productos por categoría ${categoria}: ${productos.length}`);
            return productos;
            
        } catch (error) {
            console.error('Error obteniendo productos por categoría:', error);
            // Fallback sin índices
            return await this._getByCategoriaFallback(categoria, limitCount);
        }
    },
    
    /**
     * FALLBACK: Productos por categoría sin índices compuestos
     */
    async _getByCategoriaFallback(categoria, limitCount = 20) {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('categoria', '==', categoria),
                where('estado', '==', 'activo')
            );
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            
            productos.sort((a, b) => {
                const dateA = a.createdAt || '';
                const dateB = b.createdAt || '';
                return dateB.localeCompare(dateA);
            });
            
            return productos.slice(0, limitCount);
        } catch (error) {
            console.error('Error en fallback categoría:', error);
            throw new Error(`Error al obtener productos: ${error.message}`);
        }
    },
    
    /**
     * Obtener productos en oferta
     * ✅ NUEVO MÉTODO OPTIMIZADO CON ÍNDICES
     */
    async getOfertas(limitCount = 20) {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('estado', '==', 'activo'),
                where('porcentajeDescuento', '>', 0),
                orderBy('porcentajeDescuento', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`📦 Productos en oferta: ${productos.length}`);
            return productos;
            
        } catch (error) {
            console.error('Error obteniendo productos en oferta:', error);
            // Fallback sin índices
            return await this._getOfertasFallback(limitCount);
        }
    },
    
    /**
     * FALLBACK: Productos en oferta sin índices compuestos
     */
    async _getOfertasFallback(limitCount = 20) {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('estado', '==', 'activo')
            );
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                if (data.porcentajeDescuento > 0) {
                    productos.push(data);
                }
            });
            
            productos.sort((a, b) => b.porcentajeDescuento - a.porcentajeDescuento);
            return productos.slice(0, limitCount);
        } catch (error) {
            console.error('Error en fallback ofertas:', error);
            throw new Error(`Error al obtener productos en oferta: ${error.message}`);
        }
    },
    
    /**
     * Actualizar producto
     */
    async update(productId, updateData) {
        try {
            const productRef = doc(db, PRODUCTS_COLLECTION, productId);
            await updateDoc(productRef, {
                ...updateData,
                updatedAt: new Date().toISOString()
            });
            
            const updated = await this.getById(productId);
            return updated;
        } catch (error) {
            console.error('Error actualizando producto:', error);
            throw new Error(`Error al actualizar producto: ${error.message}`);
        }
    },
    
    /**
     * Actualizar stock
     */
    async updateStock(productId, cantidad) {
        try {
            const productRef = doc(db, PRODUCTS_COLLECTION, productId);
            const product = await this.getById(productId);
            
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            
            const nuevoStock = (product.stock || 0) + cantidad;
            
            await updateDoc(productRef, {
                stock: nuevoStock,
                estado: nuevoStock > 0 ? 'activo' : 'agotado',
                updatedAt: new Date().toISOString()
            });
            
            return await this.getById(productId);
        } catch (error) {
            console.error('Error actualizando stock:', error);
            throw new Error(`Error al actualizar stock: ${error.message}`);
        }
    },
    
    /**
     * Eliminar producto (soft delete - cambiar estado)
     */
    async delete(productId, hardDelete = false) {
        try {
            if (hardDelete) {
                const productRef = doc(db, PRODUCTS_COLLECTION, productId);
                await deleteDoc(productRef);
                return true;
            } else {
                return await this.update(productId, { estado: 'inactivo' });
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }
    },
    
    /**
     * Buscar productos por nombre o descripción
     */
    async search(termino, limitCount = 20) {
        try {
            // ✅ Usar índices para búsqueda básica
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('estado', '==', 'activo'),
                orderBy('nombre'),
                limit(limitCount * 2)
            );
            const querySnapshot = await getDocs(q);
            
            const terminoLower = termino.toLowerCase();
            const productos = [];
            
            querySnapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                if (data.nombre?.toLowerCase().includes(terminoLower) ||
                    data.descripcion?.toLowerCase().includes(terminoLower) ||
                    data.marca?.toLowerCase().includes(terminoLower)) {
                    productos.push(data);
                }
            });
            
            return productos.slice(0, limitCount);
        } catch (error) {
            console.error('Error buscando productos:', error);
            // Fallback sin índices
            return await this._searchFallback(termino, limitCount);
        }
    },
    
    /**
     * FALLBACK: Búsqueda sin índices
     */
    async _searchFallback(termino, limitCount = 20) {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('estado', '==', 'activo')
            );
            const querySnapshot = await getDocs(q);
            
            const terminoLower = termino.toLowerCase();
            const productos = [];
            
            querySnapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                if (data.nombre?.toLowerCase().includes(terminoLower) ||
                    data.descripcion?.toLowerCase().includes(terminoLower) ||
                    data.marca?.toLowerCase().includes(terminoLower)) {
                    productos.push(data);
                }
            });
            
            return productos.slice(0, limitCount);
        } catch (error) {
            console.error('Error en fallback búsqueda:', error);
            throw new Error(`Error al buscar productos: ${error.message}`);
        }
    }
};