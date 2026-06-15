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
        this.icon = data.icon || '';
        
        // Orden y estado
        this.order = data.order || 0;
        this.status = data.status || 'active';  // active, inactive
        
        // Subcategorías
        this.subcategories = data.subcategories || [];
        
        // Metadata
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || null;
        this.createdBy = data.createdBy || null;
    }
    
    // ========== GETTERS ==========
    
    // ¿Está activa?
    get isActive() {
        return this.status === 'active';
    }
    
    // Cantidad de subcategorías
    get subcategoriesCount() {
        return this.subcategories.length;
    }
    
    // Subcategorías activas (si tuvieran estado)
    get activeSubcategories() {
        return this.subcategories.filter(sub => sub.status !== 'inactive');
    }
    
    // Datos resumidos para listados
    get summary() {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug,
            icon: this.icon,
            order: this.order,
            status: this.status,
            subcategoriesCount: this.subcategoriesCount
        };
    }
    
    // ========== MÉTODOS ==========
    
    // Agregar subcategoría
    addSubcategory(subcategoryName) {
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
            slug: this.generateSlug(subcategoryName),
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        this.subcategories.push(newSubcategory);
        this.updatedAt = new Date().toISOString();
        
        return newSubcategory;
    }
    
    // Actualizar subcategoría
    updateSubcategory(index, newName) {
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
        
        if (this.order < 0) {
            errors.push('El orden debe ser un número positivo');
        }
        
        if (!['active', 'inactive'].includes(this.status)) {
            errors.push('El estado debe ser "active" o "inactive"');
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
            icon: this.icon || '',
            order: this.order,
            status: this.status,
            subcategories: this.subcategories.map(sub => ({ ...sub })),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy
        };
    }
}