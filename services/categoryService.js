/* ========================================
   CATEGORY SERVICE - Outlet Val
   Lógica de negocio para categorías
   ======================================== */

import { Category } from '/classes/categoryModel.js';
import { CategoryRepository } from '/repositories/categoryRepository.js';
import { CacheService, STORES } from '/services/cacheService.js';

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
        category.subcategories = []; // Inicializar array vacío
        
        // ========== GUARDAR EN FIRESTORE ==========
        const result = await CategoryRepository.save(category.toPlainObject());
        
        // Limpiar caché de categorías
        await CacheService.clearCache(STORES.CATEGORIES);
        
        return new Category(result);
    },
    
    /**
     * Obtener categoría por ID (con caché)
     */
    async getById(categoryId, forceRefresh = false) {
        if (!forceRefresh) {
            const cached = await CacheService.getCache(STORES.CATEGORIES, categoryId);
            if (cached) {
                return new Category(cached);
            }
        }
        
        const categoryData = await CategoryRepository.getById(categoryId);
        
        if (categoryData) {
            await CacheService.setCache(STORES.CATEGORIES, categoryId, categoryData, 3600000);
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
     */
    async getAll(filters = {}, forceRefresh = false) {
        const cacheKey = `categories_list_${JSON.stringify(filters)}`;
        
        if (!forceRefresh) {
            const cached = await CacheService.getCache(STORES.CATEGORIES, cacheKey);
            if (cached) {
                return cached.map(c => new Category(c));
            }
        }
        
        const categoriesData = await CategoryRepository.getAll(filters);
        const categories = categoriesData.map(c => new Category(c));
        
        await CacheService.setCache(STORES.CATEGORIES, cacheKey, categoriesData, 1800000);
        
        return categories;
    },
    
    /**
     * Obtener solo categorías activas (para tienda)
     */
    async getActiveCategories(forceRefresh = false) {
        const cacheKey = 'active_categories_list';
        
        if (!forceRefresh) {
            const cached = await CacheService.getCache(STORES.CATEGORIES, cacheKey);
            if (cached) {
                return cached.map(c => new Category(c));
            }
        }
        
        const categoriesData = await CategoryRepository.getActiveCategories();
        const categories = categoriesData.map(c => new Category(c));
        
        await CacheService.setCache(STORES.CATEGORIES, cacheKey, categoriesData, 1800000);
        
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
        
        // No permitir ciertas actualizaciones inválidas
        if (updateData.order !== undefined && updateData.order < 0) {
            throw new Error('El orden debe ser un número positivo');
        }
        
        if (updateData.status && !['active', 'inactive'].includes(updateData.status)) {
            throw new Error('El estado debe ser "active" o "inactive"');
        }
        
        const updated = await CategoryRepository.update(categoryId, updateData);
        
        // Limpiar caché
        await CacheService.clearCache(STORES.CATEGORIES);
        
        return new Category(updated);
    },
    
    /**
     * Agregar subcategoría
     */
    async addSubcategory(categoryId, subcategoryName) {
        if (!subcategoryName || subcategoryName.trim().length < 1) {
            throw new Error('El nombre de la subcategoría es requerido');
        }
        
        const category = await this.getById(categoryId, true);
        
        if (!category) {
            throw new Error('Categoría no encontrada');
        }
        
        // Usar el método del modelo para agregar
        const newSubcategory = category.addSubcategory(subcategoryName);
        
        // Guardar cambios
        await CategoryRepository.update(categoryId, { 
            subcategories: category.subcategories 
        });
        
        // Limpiar caché
        await CacheService.clearCache(STORES.CATEGORIES);
        
        return await this.getById(categoryId, true);
    },
    
    /**
     * Actualizar subcategoría
     */
    async updateSubcategory(categoryId, subcategoryId, newName) {
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
        
        // Actualizar usando el método del modelo
        category.updateSubcategory(subIndex, newName);
        
        // Guardar cambios
        await CategoryRepository.update(categoryId, { 
            subcategories: category.subcategories 
        });
        
        // Limpiar caché
        await CacheService.clearCache(STORES.CATEGORIES);
        
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
        await CacheService.clearCache(STORES.CATEGORIES);
        
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
        await CacheService.clearCache(STORES.CATEGORIES);
        
        return result;
    },
    
    /**
     * Reordenar categorías
     */
    async reorderCategories(categoryOrders) {
        // categoryOrders: [{ id, order }]
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
        return category.isActive;
    }
};