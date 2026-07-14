/* ========================================
   CATEGORY SERVICE - Outlet Val
   Lógica de negocio para categorías
   CON SOPORTE PARA IMÁGENES EN BASE64
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
        
        if (!categoryData.id || categoryData.id.trim() === '') {
            throw new Error('El ID de la categoría es requerido');
        }
        
        if (!Category.validateIdFormat(categoryData.id)) {
            throw new Error('El ID solo puede contener letras minúsculas, números, guiones bajos (_) y guiones (-)');
        }
        
        const category = new Category(categoryData);
        if (!categoryData.slug) {
            category.slug = category.generateSlug(categoryData.name);
        }
        
        const existingById = await CategoryRepository.getById(category.id);
        if (existingById) {
            throw new Error(`Ya existe una categoría con el ID "${category.id}"`);
        }
        
        const exists = await CategoryRepository.existsByName(category.name);
        if (exists) {
            throw new Error(`Ya existe una categoría con el nombre "${category.name}"`);
        }
        
        const existingBySlug = await CategoryRepository.getBySlug(category.slug);
        if (existingBySlug) {
            throw new Error(`Ya existe una categoría con el slug "${category.slug}"`);
        }
        
        const validation = category.validate();
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        category.createdBy = adminUserId;
        category.subcategories = categoryData.subcategories || [];
        
        const result = await CategoryRepository.save(category.toPlainObject());
        
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
        
        if (updateData.id && updateData.id !== categoryId) {
            throw new Error('No se puede cambiar el ID de la categoría');
        }
        
        if (updateData.name && updateData.name !== currentCategory.name) {
            if (updateData.name.trim().length < 2) {
                throw new Error('El nombre de la categoría debe tener al menos 2 caracteres');
            }
            
            const exists = await CategoryRepository.existsByName(updateData.name, categoryId);
            if (exists) {
                throw new Error(`Ya existe una categoría con el nombre "${updateData.name}"`);
            }
        }
        
        if (updateData.slug && updateData.slug !== currentCategory.slug) {
            const existingBySlug = await CategoryRepository.getBySlug(updateData.slug);
            if (existingBySlug && existingBySlug.id !== categoryId) {
                throw new Error(`Ya existe una categoría con el slug "${updateData.slug}"`);
            }
        }
        
        const updated = await CategoryRepository.update(categoryId, updateData);
        
        try {
            await CacheService.clearCache(STORES.CATEGORIES);
        } catch (cacheError) {
            console.warn('⚠️ No se pudo limpiar caché:', cacheError.message);
        }
        
        return new Category(updated);
    },
    
    /**
     * 🖼️ SUBIR IMAGEN EN BASE64 (similar a productos)
     */
    async uploadCategoryImage(categoryId, file) {
        try {
            console.log('📸 Iniciando conversión a Base64 para categoría:', categoryId);
            
            if (!file) {
                throw new Error('No se proporcionó ningún archivo');
            }
            
            if (!file.type || !file.type.startsWith('image/')) {
                throw new Error('El archivo debe ser una imagen válida');
            }
            
            // Límite de 5MB para Base64
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new Error('La imagen no puede superar los 5MB');
            }
            
            // Verificar que la categoría existe
            const category = await this.getById(categoryId, true);
            if (!category) {
                throw new Error(`Categoría con ID "${categoryId}" no encontrada`);
            }
            
            // Convertir a Base64
            const base64String = await this.fileToBase64(file);
            
            console.log('✅ Imagen convertida a Base64');
            console.log('📏 Tamaño Base64:', (base64String.length / 1024 / 1024).toFixed(2), 'MB');
            
            // Actualizar la categoría con la imagen Base64
            const updateData = {
                imageBase64: base64String,
                imageType: file.type,
                imageName: file.name,
                imageSize: file.size
            };
            
            const updated = await this.update(categoryId, updateData);
            
            // Limpiar caché
            try {
                await CacheService.clearCache(STORES.CATEGORIES);
            } catch (cacheError) {
                console.warn('⚠️ No se pudo limpiar caché:', cacheError.message);
            }
            
            return {
                url: base64String,
                path: null,
                fileName: file.name,
                size: file.size,
                type: file.type
            };
            
        } catch (error) {
            console.error('❌ Error en uploadCategoryImage:', error);
            throw error;
        }
    },
    
    /**
     * Convertir archivo a Base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    },
    
    /**
     * 🗑️ Eliminar imagen de categoría
     */
    async deleteCategoryImage(categoryId) {
        try {
            const category = await this.getById(categoryId, true);
            
            if (!category) {
                throw new Error('Categoría no encontrada');
            }
            
            if (!category.imageBase64) {
                throw new Error('La categoría no tiene imagen para eliminar');
            }
            
            await this.update(categoryId, {
                imageBase64: '',
                imageType: '',
                imageName: '',
                imageSize: null
            });
            
            try {
                await CacheService.clearCache(STORES.CATEGORIES);
            } catch (cacheError) {
                console.warn('⚠️ No se pudo limpiar caché:', cacheError.message);
            }
            
            return true;
        } catch (error) {
            console.error('Error eliminando imagen de categoría:', error);
            throw new Error(`Error al eliminar imagen: ${error.message}`);
        }
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
        
        const newSubcategory = category.addSubcategory(subcategoryName, description);
        
        await CategoryRepository.update(categoryId, { 
            subcategories: category.subcategories 
        });
        
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
        
        const subIndex = category.subcategories.findIndex(sub => sub.id === subcategoryId);
        
        if (subIndex === -1) {
            throw new Error('Subcategoría no encontrada');
        }
        
        category.updateSubcategory(subIndex, newName, newDescription);
        
        await CategoryRepository.update(categoryId, { 
            subcategories: category.subcategories 
        });
        
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
        
        const subIndex = category.subcategories.findIndex(sub => sub.id === subcategoryId);
        
        if (subIndex === -1) {
            throw new Error('Subcategoría no encontrada');
        }
        
        category.deleteSubcategory(subIndex);
        
        await CategoryRepository.update(categoryId, { 
            subcategories: category.subcategories 
        });
        
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
        return true;
    }
};