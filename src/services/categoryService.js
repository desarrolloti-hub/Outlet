/* ========================================
   CATEGORY SERVICE - Outlet Val
   Lógica de negocio para categorías
   ======================================== */

import { Category } from '../classes/categoryModel.js';
import { CategoryRepository } from '../repositories/categoryRepository.js';
import { CacheService, STORES } from './cacheService.js';

export const CategoryService = {
    /**
     * Crear nueva categoría
     */
    async create(categoryData, adminUserId = null) {
        // ========== VALIDACIONES ==========
        if (!categoryData.name || categoryData.name.trim().length < 2) {
            throw new Error('El nombre de la categoría debe tener al menos 2 caracteres');
        }
        
        // Validar ID
        if (!categoryData.id || categoryData.id.trim() === '') {
            throw new Error('El ID de la categoría es requerido');
        }
        
        if (!Category.validateIdFormat(categoryData.id)) {
            throw new Error('El ID solo puede contener letras minúsculas, números, guiones bajos (_) y guiones (-)');
        }
        
        // Generar slug si no viene
        const category = new Category(categoryData);
        if (!categoryData.slug) {
            category.slug = category.generateSlug(categoryData.name);
        }
        
        // Verificar que el ID no exista ya
        const existingById = await CategoryRepository.getById(category.id);
        if (existingById) {
            throw new Error(`Ya existe una categoría con el ID "${category.id}"`);
        }
        
        // Verificar que el nombre no exista ya
        const exists = await CategoryRepository.existsByName(category.name);
        if (exists) {
            throw new Error(`Ya existe una categoría con el nombre "${category.name}"`);
        }
        
        // Verificar que el slug no exista
        const existingBySlug = await CategoryRepository.getBySlug(category.slug);
        if (existingBySlug) {
            throw new Error(`Ya existe una categoría con el slug "${category.slug}"`);
        }
        
        // Validar categoría
        const validation = category.validate();
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }
        
        // ========== CREAR MODELO ==========
        category.createdBy = adminUserId;
        category.subcategories = categoryData.subcategories || [];
        
        // ========== GUARDAR EN FIRESTORE ==========
        const result = await CategoryRepository.save(category.toPlainObject());
        
        // Limpiar caché de categorías
        try {
            await CacheService.clearCache(STORES.CATEGORIES);
        } catch (cacheError) {
            console.warn('⚠️ No se pudo limpiar caché:', cacheError.message);
        }
        
        return new Category(result);
    },
    
    /**
     * Obtener categoría por ID (con caché)
     */
    async getById(categoryId, forceRefresh = false) {
        if (!forceRefresh) {
            try {
                const cached = await CacheService.getCache(STORES.CATEGORIES, categoryId);
                if (cached) {
                    return new Category(cached);
                }
            } catch (cacheError) {
                console.warn('⚠️ Error leyendo caché, continuando con Firestore:', cacheError.message);
            }
        }
        
        const categoryData = await CategoryRepository.getById(categoryId);
        
        if (categoryData) {
            try {
                await CacheService.setCache(STORES.CATEGORIES, categoryId, categoryData, 3600000);
            } catch (cacheError) {
                console.warn('⚠️ No se pudo guardar en caché:', cacheError.message);
            }
            return new Category(categoryData);
        }
        
        return null;
    },
    
    /**
     * Obtener categoría por slug
     */
    async getBySlug(slug) {
        const categoryData = await CategoryRepository.getBySlug(slug);
        return categoryData ? new Category(categoryData) : null;
    },
    
    /**
     * Obtener todas las categorías
     * ✅ MODIFICADO: Ya no filtra por status
     */
    async getAll(filters = {}, forceRefresh = false) {
        const cacheKey = `categories_list_${JSON.stringify(filters)}`;
        
        if (!forceRefresh) {
            try {
                const cached = await CacheService.getCache(STORES.CATEGORIES, cacheKey);
                if (cached) {
                    console.log('📦 Usando caché de categorías');
                    return cached.map(c => new Category(c));
                }
            } catch (cacheError) {
                console.warn('⚠️ Error leyendo caché, continuando con Firestore:', cacheError.message);
            }
        }
        
        console.log('🔥 Obteniendo categorías desde Firestore...');
        const categoriesData = await CategoryRepository.getAll(filters);
        const categories = categoriesData.map(c => new Category(c));
        
        try {
            await CacheService.setCache(STORES.CATEGORIES, cacheKey, categoriesData, 1800000);
            console.log('💾 Categorías guardadas en caché');
        } catch (cacheError) {
            console.warn('⚠️ No se pudo guardar en caché:', cacheError.message);
        }
        
        return categories;
    },
    
    /**
     * Obtener solo categorías activas (para tienda)
     * ✅ MODIFICADO: Como no tenemos status, devolvemos todas
     */
    async getActiveCategories(forceRefresh = false) {
        const cacheKey = 'active_categories_list';
        
        if (!forceRefresh) {
            try {
                const cached = await CacheService.getCache(STORES.CATEGORIES, cacheKey);
                if (cached) {
                    return cached.map(c => new Category(c));
                }
            } catch (cacheError) {
                console.warn('⚠️ Error leyendo caché de categorías activas:', cacheError.message);
            }
        }
        
        // Como no tenemos status, devolvemos todas
        const categoriesData = await CategoryRepository.getActiveCategories();
        const categories = categoriesData.map(c => new Category(c));
        
        try {
            await CacheService.setCache(STORES.CATEGORIES, cacheKey, categoriesData, 1800000);
        } catch (cacheError) {
            console.warn('⚠️ No se pudo guardar caché de categorías activas:', cacheError.message);
        }
        
        return categories;
    },
    
    /**
     * Actualizar categoría
     */
    async update(categoryId, updateData) {
        const currentCategory = await this.getById(categoryId, true);
        
        if (!currentCategory) {
            throw new Error('Categoría no encontrada');
        }
        
        // No permitir cambiar el ID
        if (updateData.id && updateData.id !== categoryId) {
            throw new Error('No se puede cambiar el ID de la categoría');
        }
        
        // Validar nombre si se está actualizando
        if (updateData.name && updateData.name !== currentCategory.name) {
            if (updateData.name.trim().length < 2) {
                throw new Error('El nombre de la categoría debe tener al menos 2 caracteres');
            }
            
            const exists = await CategoryRepository.existsByName(updateData.name, categoryId);
            if (exists) {
                throw new Error(`Ya existe una categoría con el nombre "${updateData.name}"`);
            }
        }
        
        // Validar slug si se está actualizando
        if (updateData.slug && updateData.slug !== currentCategory.slug) {
            const existingBySlug = await CategoryRepository.getBySlug(updateData.slug);
            if (existingBySlug && existingBySlug.id !== categoryId) {
                throw new Error(`Ya existe una categoría con el slug "${updateData.slug}"`);
            }
        }
        
        const updated = await CategoryRepository.update(categoryId, updateData);
        
        // Limpiar caché
        try {
            await CacheService.clearCache(STORES.CATEGORIES);
        } catch (cacheError) {
            console.warn('⚠️ No se pudo limpiar caché:', cacheError.message);
        }
        
        return new Category(updated);
    },
    
    /**
     * Agregar subcategoría con descripción
     */
    async addSubcategory(categoryId, subcategoryName, description = '') {
        if (!subcategoryName || subcategoryName.trim().length < 1) {
            throw new Error('El nombre de la subcategoría es requerido');
        }
        
        const category = await this.getById(categoryId, true);
        
        if (!category) {
            throw new Error('Categoría no encontrada');
        }
        
        // Usar el método del modelo para agregar con descripción
        const newSubcategory = category.addSubcategory(subcategoryName, description);
        
        // Guardar cambios
        await CategoryRepository.update(categoryId, { 
            subcategories: category.subcategories 
        });
        
        // Limpiar caché
        try {
            await CacheService.clearCache(STORES.CATEGORIES);
        } catch (cacheError) {
            console.warn('⚠️ No se pudo limpiar caché:', cacheError.message);
        }
        
        return await this.getById(categoryId, true);
    },
    
    /**
     * Actualizar subcategoría con descripción
     */
    async updateSubcategory(categoryId, subcategoryId, newName, newDescription = '') {
        if (!newName || newName.trim().length < 1) {
            throw new Error('El nombre de la subcategoría es requerido');
        }
        
        const category = await this.getById(categoryId, true);
        
        if (!category) {
            throw new Error('Categoría no encontrada');
        }
        
        // Encontrar la subcategoría por ID
        const subIndex = category.subcategories.findIndex(sub => sub.id === subcategoryId);
        
        if (subIndex === -1) {
            throw new Error('Subcategoría no encontrada');
        }
        
        // Actualizar usando el método del modelo con descripción
        category.updateSubcategory(subIndex, newName, newDescription);
        
        // Guardar cambios
        await CategoryRepository.update(categoryId, { 
            subcategories: category.subcategories 
        });
        
        // Limpiar caché
        try {
            await CacheService.clearCache(STORES.CATEGORIES);
        } catch (cacheError) {
            console.warn('⚠️ No se pudo limpiar caché:', cacheError.message);
        }
        
        return await this.getById(categoryId, true);
    },
    
    /**
     * Eliminar subcategoría
     */
    async deleteSubcategory(categoryId, subcategoryId) {
        const category = await this.getById(categoryId, true);
        
        if (!category) {
            throw new Error('Categoría no encontrada');
        }
        
        // Encontrar la subcategoría por ID
        const subIndex = category.subcategories.findIndex(sub => sub.id === subcategoryId);
        
        if (subIndex === -1) {
            throw new Error('Subcategoría no encontrada');
        }
        
        // Eliminar usando el método del modelo
        category.deleteSubcategory(subIndex);
        
        // Guardar cambios
        await CategoryRepository.update(categoryId, { 
            subcategories: category.subcategories 
        });
        
        // Limpiar caché
        try {
            await CacheService.clearCache(STORES.CATEGORIES);
        } catch (cacheError) {
            console.warn('⚠️ No se pudo limpiar caché:', cacheError.message);
        }
        
        return await this.getById(categoryId, true);
    },
    
    /**
     * Eliminar categoría
     */
    async delete(categoryId, hardDelete = false) {
        const category = await this.getById(categoryId);
        
        if (!category) {
            throw new Error('Categoría no encontrada');
        }
        
        const result = await CategoryRepository.delete(categoryId, hardDelete);
        
        // Limpiar caché
        try {
            await CacheService.clearCache(STORES.CATEGORIES);
        } catch (cacheError) {
            console.warn('⚠️ No se pudo limpiar caché:', cacheError.message);
        }
        
        return result;
    },
    
    /**
     * Reordenar categorías
     */
    async reorderCategories(categoryOrders) {
        const updates = [];
        
        for (const item of categoryOrders) {
            updates.push(this.update(item.id, { order: item.order }));
        }
        
        await Promise.all(updates);
        
        return await this.getAll({}, true);
    },
    
    /**
     * Buscar categorías
     */
    async search(termino) {
        if (!termino || termino.trim().length < 2) {
            throw new Error('Ingrese al menos 2 caracteres para buscar');
        }
        
        const categories = await this.getAll({ search: termino });
        return categories;
    },
    
    /**
     * Validar categoría para uso en tienda
     */
    validateForStore(category) {
        return true; // Todas las categorías son válidas
    }
};