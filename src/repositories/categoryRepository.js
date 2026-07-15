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

const CATEGORIES_COLLECTION = 'categorias';

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
            
            // Asegurar que subcategories existe y es un array
            const dataToSave = {
                ...categoryData,
                id: id,
                updatedAt: new Date().toISOString(),
                subcategories: categoryData.subcategories || []
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
                const data = docSnap.data();
                // Asegurar que subcategories es un array
                data.subcategories = data.subcategories || [];
                return { id: docSnap.id, ...data };
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
                const data = doc.data();
                data.subcategories = data.subcategories || [];
                return { id: doc.id, ...data };
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
            const q = query(collection(db, CATEGORIES_COLLECTION), limit(limitCount));
            const querySnapshot = await getDocs(q);

            let categorias = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.subcategories = data.subcategories || [];
                categorias.push({ id: doc.id, ...data });
            });

            // Filtro de búsqueda en memoria
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                categorias = categorias.filter(cat =>
                    cat.name.toLowerCase().includes(searchTerm) ||
                    (cat.description && cat.description.toLowerCase().includes(searchTerm))
                );
            }

            // Ordenamiento en memoria
            categorias.sort((a, b) => {
                const valA = a[sortBy] ?? 0;
                const valB = b[sortBy] ?? 0;
                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });

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
            const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));

            const categorias = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.subcategories = data.subcategories || [];
                categorias.push({ id: doc.id, ...data });
            });

            categorias.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            return categorias;
        } catch (error) {
            console.error('Error obteniendo categorías activas:', error);
            throw new Error(`Error al obtener categorías activas: ${error.message}`);
        }
    },
    
    /**
     * Actualizar categoría - CON SUBCATEGORÍAS
     */
    async update(categoryId, updateData) {
        try {
            const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
            
            // No permitir actualizar el ID
            delete updateData.id;
            
            // Asegurar que subcategories es un array
            if (updateData.subcategories) {
                updateData.subcategories = updateData.subcategories || [];
            }
            
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
    
    // ... resto de métodos (addSubcategory, updateSubcategory, deleteSubcategory, etc.)
};