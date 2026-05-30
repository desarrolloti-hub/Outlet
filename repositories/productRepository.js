/* ========================================
   PRODUCT REPOSITORY - Outlet Val
   Operaciones CRUD directas con Firebase
   ======================================== */

import { db } from '/config/firebaseConfig.js';
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
    orderBy,
    limit,
    startAfter
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
     */
    async getAll(filters = {}, sortBy = 'createdAt', sortDir = 'desc', limitCount = 50) {
        try {
            let q = collection(db, PRODUCTS_COLLECTION);
            let constraints = [];
            
            // Aplicar filtros
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
            if (filters.enOferta) {
                constraints.push(where('porcentajeDescuento', '>', 0));
            }
            
            // Ordenamiento
            constraints.push(orderBy(sortBy, sortDir));
            constraints.push(limit(limitCount));
            
            q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            
            return productos;
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            throw new Error(`Error al obtener productos: ${error.message}`);
        }
    },
    
    /**
     * Obtener productos destacados
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
            
            return productos;
        } catch (error) {
            console.error('Error obteniendo productos destacados:', error);
            throw new Error(`Error al obtener productos destacados: ${error.message}`);
        }
    },
    
    /**
     * Obtener productos por categoría
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
            
            return productos;
        } catch (error) {
            console.error('Error obteniendo productos por categoría:', error);
            throw new Error(`Error al obtener productos: ${error.message}`);
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
                // Soft delete: solo cambiar estado
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
            // Firestore no soporta búsqueda de texto completo nativamente
            // Esta es una búsqueda simple por coincidencia exacta
            // Para búsqueda avanzada, considera Algolia o ElasticSearch
            
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('estado', '==', 'activo'),
                orderBy('createdAt', 'desc'),
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
            throw new Error(`Error al buscar productos: ${error.message}`);
        }
    }
};