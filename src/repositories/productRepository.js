/* ========================================
   PRODUCT REPOSITORY - Outlet Val
   Operaciones CRUD directas con Firebase
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
    limit
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
     * ✅ VERSIÓN SIN ÍNDICES COMPUESTOS
     */
    async getAll(filters = {}, sortBy = 'createdAt', sortDir = 'desc', limitCount = 50) {
        try {
            let constraints = [];
            const collectionRef = collection(db, PRODUCTS_COLLECTION);
            
            // ✅ SOLO filtros simples que NO requieren índices compuestos
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
            
            // ✅ SIN orderBy para evitar índices compuestos
            // Traemos más datos para filtrar/ordenar en memoria
            constraints.push(limit(limitCount * 3));
            
            const q = query(collectionRef, ...constraints);
            const querySnapshot = await getDocs(q);
            
            const productos = [];
            querySnapshot.forEach((doc) => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`📦 Productos obtenidos de Firestore (sin filtrar): ${productos.length}`);
            
            // ✅ FILTRAR en memoria
            let filteredProducts = productos;
            
            // Filtrar por enOferta (porcentajeDescuento > 0)
            if (filters.enOferta) {
                filteredProducts = filteredProducts.filter(p => p.porcentajeDescuento > 0);
                console.log(`📦 Productos con descuento: ${filteredProducts.length}`);
            }
            
            // ✅ ORDENAR en memoria
            filteredProducts.sort((a, b) => {
                let valA = a[sortBy];
                let valB = b[sortBy];
                
                // Manejar valores null/undefined
                if (valA === null || valA === undefined) valA = '';
                if (valB === null || valB === undefined) valB = '';
                
                if (typeof valA === 'string' && typeof valB === 'string') {
                    return sortDir === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
                }
                
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortDir === 'desc' ? valB - valA : valA - valB;
                }
                
                // Fechas (strings ISO)
                if (typeof valA === 'string' && typeof valB === 'string' && 
                    !isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB))) {
                    const dateA = new Date(valA).getTime();
                    const dateB = new Date(valB).getTime();
                    return sortDir === 'desc' ? dateB - dateA : dateA - dateB;
                }
                
                return 0;
            });
            
            // ✅ LIMITAR en memoria
            const result = filteredProducts.slice(0, limitCount);
            console.log(`📦 Productos finales: ${result.length}`);
            
            return result;
            
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            
            // ✅ FALLBACK: Si hay error, intentar obtener todos sin filtros
            try {
                console.log('🔄 Intentando fallback sin filtros...');
                const q = query(collection(db, PRODUCTS_COLLECTION), limit(limitCount * 3));
                const querySnapshot = await getDocs(q);
                const productos = [];
                querySnapshot.forEach((doc) => {
                    productos.push({ id: doc.id, ...doc.data() });
                });
                return productos;
            } catch (fallbackError) {
                throw new Error(`Error al obtener productos: ${error.message}`);
            }
        }
    },
    
    /**
     * Obtener productos destacados
     */
    async getDestacados(limitCount = 10) {
        try {
            // ✅ Consulta SIN índices compuestos
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
            
            // Ordenar en memoria por fecha
            productos.sort((a, b) => {
                const dateA = a.createdAt || '';
                const dateB = b.createdAt || '';
                return dateB.localeCompare(dateA);
            });
            
            return productos.slice(0, limitCount);
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
            // ✅ Consulta SIN índices compuestos
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
            
            // Ordenar en memoria por fecha
            productos.sort((a, b) => {
                const dateA = a.createdAt || '';
                const dateB = b.createdAt || '';
                return dateB.localeCompare(dateA);
            });
            
            return productos.slice(0, limitCount);
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
            // ✅ Consulta SIN índices compuestos
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
            console.error('Error buscando productos:', error);
            throw new Error(`Error al buscar productos: ${error.message}`);
        }
    }
};