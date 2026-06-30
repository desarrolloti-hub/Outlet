/* ========================================
   CATEGORY MODEL - Outlet Val
   Estructura de datos de categorías y subcategorías
   ======================================== */

export class Category {
    constructor(data = {}) {
        // Identificación
        this.id = data.id || null;
        
        // Información básica
        this.name = data.name || '';
        this.slug = data.slug || '';
        this.description = data.description || '';
        
        // Subcategorías (con descripción)
        this.subcategories = data.subcategories || [];
        
        // Metadata
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || null;
        this.createdBy = data.createdBy || null;
    }
    
    // ========== GETTERS ==========
    
    get subcategoriesCount() {
        return this.subcategories.length;
    }
    
    get activeSubcategories() {
        return this.subcategories.filter(sub => sub.status !== 'inactive');
    }
    
    get summary() {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug,
            subcategoriesCount: this.subcategoriesCount
        };
    }
    
    // ========== MÉTODOS ==========
    
    // Agregar subcategoría con descripción
    addSubcategory(subcategoryName, description = '') {
        if (!subcategoryName || subcategoryName.trim() === '') {
            throw new Error('El nombre de la subcategoría es requerido');
        }
        
        // Verificar si ya existe
        const exists = this.subcategories.some(
            sub => sub.name.toLowerCase() === subcategoryName.trim().toLowerCase()
        );
        
        if (exists) {
            throw new Error(`La subcategoría "${subcategoryName}" ya existe`);
        }
        
        const newSubcategory = {
            id: `${this.id}_sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: subcategoryName.trim(),
            description: description.trim() || '',
            slug: this.generateSlug(subcategoryName),
            createdAt: new Date().toISOString()
        };
        
        this.subcategories.push(newSubcategory);
        this.updatedAt = new Date().toISOString();
        
        return newSubcategory;
    }
    
    // Actualizar subcategoría (con descripción)
    updateSubcategory(index, newName, newDescription = '') {
        if (!this.subcategories[index]) {
            throw new Error('Subcategoría no encontrada');
        }
        
        if (!newName || newName.trim() === '') {
            throw new Error('El nombre de la subcategoría es requerido');
        }
        
        // Verificar duplicado excluyendo la actual
        const exists = this.subcategories.some((sub, idx) => 
            idx !== index && sub.name.toLowerCase() === newName.trim().toLowerCase()
        );
        
        if (exists) {
            throw new Error(`La subcategoría "${newName}" ya existe`);
        }
        
        this.subcategories[index].name = newName.trim();
        this.subcategories[index].description = newDescription.trim() || '';
        this.subcategories[index].slug = this.generateSlug(newName);
        this.subcategories[index].updatedAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        
        return this.subcategories[index];
    }
    
    // Eliminar subcategoría
    deleteSubcategory(index) {
        if (!this.subcategories[index]) {
            throw new Error('Subcategoría no encontrada');
        }
        
        const deleted = this.subcategories.splice(index, 1)[0];
        this.updatedAt = new Date().toISOString();
        
        return deleted;
    }
    
    // Generar slug
    generateSlug(texto) {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    // Validar formato del ID
    static validateIdFormat(id) {
        if (!id || id.trim() === '') return false;
        const regex = /^[a-z0-9_\-]+$/;
        return regex.test(id);
    }
    
    // Validar categoría completa
    validate() {
        const errors = [];
        
        if (!this.id || this.id.trim() === '') {
            errors.push('El ID de la categoría es requerido');
        } else if (!Category.validateIdFormat(this.id)) {
            errors.push('El ID solo puede contener letras minúsculas, números, guiones bajos (_) y guiones (-)');
        }
        
        if (!this.name || this.name.trim().length < 2) {
            errors.push('El nombre de la categoría debe tener al menos 2 caracteres');
        }
        
        if (!this.slug) {
            this.slug = this.generateSlug(this.name);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // Convertir a objeto plano para Firestore
    toPlainObject() {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug,
            description: this.description || '',
            subcategories: this.subcategories.map(sub => ({ ...sub })),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy
        };
    }
}