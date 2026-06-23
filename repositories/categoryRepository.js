/* ========================================
   CATEGORY REPOSITORY - Outlet Val
   Operaciones CRUD directas con Firebase para categorías
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
    limit
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ✅ CORREGIDO: Con tilde para coincidir con Firebase
const CATEGORIES_COLLECTION = 'categorías';  // 👈 CAMBIADO de 'categorias' a 'categorías'

export const CategoryRepository = {
    /**
     * Guardar categoría (crear o actualizar)
     */
    async save(categoryData) {
        try {
            const id = categoryData.id;
            if (!id) {
                throw new Error('El ID de la categoría es requerido para guardar');
            }
            
            const categoryRef = doc(db, CATEGORIES_COLLECTION, id);
            
            const dataToSave = {
                ...categoryData,
                id: id,
                updatedAt: new Date().toISOString()
            };
            
            if (!categoryData.createdAt) {
                dataToSave.createdAt = new Date().toISOString();
            }
            
            await setDoc(categoryRef, dataToSave);
            return { id: id, ...dataToSave };
        } catch (error) {
            console.error('Error guardando categoría:', error);
            throw new Error(`Error al guardar categoría: ${error.message}`);
        }
    },
    
    /**
     * Obtener categoría por ID
     */
    async getById(categoryId) {
        try {
            const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
            const docSnap = await getDoc(categoryRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo categoría:', error);
            throw new Error(`Error al obtener categoría: ${error.message}`);
        }
    },
    
    /**
     * Obtener categoría por slug
     */
    async getBySlug(slug) {
        try {
            const q = query(
                collection(db, CATEGORIES_COLLECTION),
                where('slug', '==', slug),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error buscando por slug:', error);
            throw new Error(`Error al buscar categoría: ${error.message}`);
        }
    },
    
    /**
     * Obtener todas las categorías
     */
    async getAll(filters = {}, sortBy = 'order', sortDir = 'asc', limitCount = 100) {
        try {
            let constraints = [];
            
            // Aplicar filtros
            if (filters.status) {
                constraints.push(where('status', '==', filters.status));
            }
            
            if (filters.search) {
                // Nota: Firestore no soporta búsqueda de texto completo
                // Se filtrará en memoria después
            }
            
            // Ordenamiento
            constraints.push(orderBy(sortBy, sortDir));
            constraints.push(limit(limitCount));
            
            const q = query(collection(db, CATEGORIES_COLLECTION), ...constraints);
            const querySnapshot = await getDocs(q);
            
            let categorias = [];
            querySnapshot.forEach((doc) => {
                categorias.push({ id: doc.id, ...doc.data() });
            });
            
            // Filtro de búsqueda en memoria (si es necesario)
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                categorias = categorias.filter(cat => 
                    cat.name.toLowerCase().includes(searchTerm) ||
                    (cat.description && cat.description.toLowerCase().includes(searchTerm))
                );
            }
            
            return categorias;
        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            throw new Error(`Error al obtener categorías: ${error.message}`);
        }
    },
    
    /**
     * Obtener solo categorías activas (para tienda)
     */
    async getActiveCategories() {
        try {
            const q = query(
                collection(db, CATEGORIES_COLLECTION),
                where('status', '==', 'active'),
                orderBy('order', 'asc')
            );
            const querySnapshot = await getDocs(q);
            
            const categorias = [];
            querySnapshot.forEach((doc) => {
                categorias.push({ id: doc.id, ...doc.data() });
            });
            
            return categorias;
        } catch (error) {
            console.error('Error obteniendo categorías activas:', error);
            throw new Error(`Error al obtener categorías activas: ${error.message}`);
        }
    },
    
    /**
     * Actualizar categoría
     */
    async update(categoryId, updateData) {
        try {
            const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
            
            // No permitir actualizar el ID
            delete updateData.id;
            
            await updateDoc(categoryRef, {
                ...updateData,
                updatedAt: new Date().toISOString()
            });
            
            const updated = await this.getById(categoryId);
            return updated;
        } catch (error) {
            console.error('Error actualizando categoría:', error);
            throw new Error(`Error al actualizar categoría: ${error.message}`);
        }
    },
    
    /**
     * Agregar subcategoría
     */
    async addSubcategory(categoryId, subcategoryData) {
        try {
            const category = await this.getById(categoryId);
            
            if (!category) {
                throw new Error('Categoría no encontrada');
            }
            
            const subcategories = category.subcategories || [];
            
            // Generar ID único para la subcategoría
            const newSubcategory = {
                id: `${categoryId}_sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                name: subcategoryData.name,
                slug: subcategoryData.slug,
                status: subcategoryData.status || 'active',
                createdAt: new Date().toISOString()
            };
            
            subcategories.push(newSubcategory);
            
            await this.update(categoryId, { subcategories });
            
            return { ...category, subcategories };
        } catch (error) {
            console.error('Error agregando subcategoría:', error);
            throw new Error(`Error al agregar subcategoría: ${error.message}`);
        }
    },
    
    /**
     * Actualizar subcategoría
     */
    async updateSubcategory(categoryId, subcategoryId, updateData) {
        try {
            const category = await this.getById(categoryId);
            
            if (!category) {
                throw new Error('Categoría no encontrada');
            }
            
            const subcategories = category.subcategories || [];
            const subIndex = subcategories.findIndex(sub => sub.id === subcategoryId);
            
            if (subIndex === -1) {
                throw new Error('Subcategoría no encontrada');
            }
            
            subcategories[subIndex] = {
                ...subcategories[subIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            
            await this.update(categoryId, { subcategories });
            
            return { ...category, subcategories };
        } catch (error) {
            console.error('Error actualizando subcategoría:', error);
            throw new Error(`Error al actualizar subcategoría: ${error.message}`);
        }
    },
    
    /**
     * Eliminar subcategoría
     */
    async deleteSubcategory(categoryId, subcategoryId) {
        try {
            const category = await this.getById(categoryId);
            
            if (!category) {
                throw new Error('Categoría no encontrada');
            }
            
            const subcategories = (category.subcategories || []).filter(
                sub => sub.id !== subcategoryId
            );
            
            await this.update(categoryId, { subcategories });
            
            return { ...category, subcategories };
        } catch (error) {
            console.error('Error eliminando subcategoría:', error);
            throw new Error(`Error al eliminar subcategoría: ${error.message}`);
        }
    },
    
    /**
     * Eliminar categoría (soft delete)
     */
    async delete(categoryId, hardDelete = false) {
        try {
            if (hardDelete) {
                const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
                await deleteDoc(categoryRef);
                return true;
            } else {
                // Soft delete: solo cambiar estado
                return await this.update(categoryId, { status: 'inactive' });
            }
        } catch (error) {
            console.error('Error eliminando categoría:', error);
            throw new Error(`Error al eliminar categoría: ${error.message}`);
        }
    },
    
    /**
     * Eliminar categoría permanentemente (hard delete)
     */
    async deletePermanently(categoryId) {
        return await this.delete(categoryId, true);
    },
    
    /**
     * Verificar si existe una categoría con el mismo nombre
     */
    async existsByName(name, excludeId = null) {
        try {
            const q = query(
                collection(db, CATEGORIES_COLLECTION),
                where('name', '==', name)
            );
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) return false;
            
            if (excludeId) {
                const docs = querySnapshot.docs;
                return docs.some(doc => doc.id !== excludeId);
            }
            
            return true;
        } catch (error) {
            console.error('Error verificando nombre:', error);
            return false;
        }
    }
};