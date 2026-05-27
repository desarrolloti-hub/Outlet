/* ========================================
   PRODUCTS CONTROLLER - OUTLET (SPA)
   Controlador para formulario de productos
   ======================================== */

// Storage key
const PRODUCTS_STORAGE_KEY = 'outlet_admin_products';
let editingProductId = null;
let isEditMode = false;

/**
 * Cargar estilos CSS
 */
function loadProductsStyles() {
    if (document.querySelector('link[href*="products.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/products.css';
    document.head.appendChild(link);
}

/**
 * Mostrar notificación
 */
function showProductsNotification(message, isError = false) {
    const toast = document.getElementById('productsToast');
    const messageSpan = document.getElementById('toastMessage');
    
    if (!toast || !messageSpan) return;
    
    messageSpan.textContent = message;
    toast.style.display = 'block';
    
    if (isError) {
        toast.style.borderLeftColor = '#ef4444';
    } else {
        toast.style.borderLeftColor = 'var(--outlet-gold, #ddab3b)';
    }
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.opacity = '1';
        }, 300);
    }, 3000);
}

/**
 * Generar slug a partir del nombre
 */
function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/**
 * Auto-generar slug
 */
function initSlugGenerator() {
    const nameInput = document.getElementById('name');
    const slugInput = document.getElementById('slug');
    
    if (nameInput && slugInput) {
        nameInput.addEventListener('blur', () => {
            if (!slugInput.value || slugInput.value === generateSlug(nameInput.value)) {
                slugInput.value = generateSlug(nameInput.value);
            }
        });
    }
}

/**
 * Obtener productos existentes
 */
function getExistingProducts() {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

/**
 * Guardar producto en localStorage
 */
function saveProductToStorage(product) {
    const products = getExistingProducts();
    
    if (isEditMode && editingProductId) {
        // Actualizar producto existente
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = { ...product, id: editingProductId };
            showProductsNotification(`✏️ Producto "${product.name}" actualizado`);
        }
    } else {
        // Crear nuevo producto
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ ...product, id: newId });
        showProductsNotification(`✅ Producto "${product.name}" agregado`);
    }
    
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

/**
 * Cargar datos del producto para edición
 */
function loadProductForEdit(productId) {
    const products = getExistingProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return false;
    
    document.getElementById('name').value = product.name || '';
    document.getElementById('slug').value = product.slug || '';
    document.getElementById('description').value = product.description || '';
    document.getElementById('brand').value = product.brand || '';
    document.getElementById('category').value = product.category || '';
    document.getElementById('subcategory').value = product.subcategory || '';
    document.getElementById('gender').value = product.gender || 'Mujer';
    document.getElementById('salePrice').value = product.salePrice || '';
    document.getElementById('purchasePrice').value = product.purchasePrice || '';
    document.getElementById('discount').value = product.discount || '';
    document.getElementById('mainImage').value = product.mainImage || '';
    document.getElementById('extraImages').value = product.extraImages ? product.extraImages.join(', ') : '';
    document.getElementById('colors').value = product.colors ? product.colors.join(', ') : '';
    document.getElementById('sizes').value = product.sizes ? product.sizes.join(', ') : '';
    document.getElementById('material').value = product.material || '';
    document.getElementById('fitType').value = product.fitType || '';
    document.getElementById('composition').value = product.composition || '';
    document.getElementById('weight').value = product.weight || '';
    document.getElementById('stock').value = product.stock || '';
    
    return true;
}

/**
 * Recibir parámetros de la URL
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
        isEditMode = true;
        editingProductId = parseInt(editId);
    }
}

/**
 * Manejar envío del formulario
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validar campos requeridos
    const name = document.getElementById('name').value.trim();
    if (!name) {
        showProductsNotification('⚠️ El nombre del producto es obligatorio', true);
        return;
    }
    
    const product = {
        name: name,
        slug: document.getElementById('slug').value.trim() || generateSlug(name),
        description: document.getElementById('description').value,
        brand: document.getElementById('brand').value,
        category: document.getElementById('category').value,
        subcategory: document.getElementById('subcategory').value,
        gender: document.getElementById('gender').value,
        salePrice: parseFloat(document.getElementById('salePrice').value) || 0,
        purchasePrice: parseFloat(document.getElementById('purchasePrice').value) || 0,
        discount: parseFloat(document.getElementById('discount').value) || 0,
        mainImage: document.getElementById('mainImage').value,
        extraImages: document.getElementById('extraImages').value
            .split(',')
            .map(img => img.trim())
            .filter(img => img),
        colors: document.getElementById('colors').value
            .split(',')
            .map(c => c.trim())
            .filter(c => c),
        sizes: document.getElementById('sizes').value
            .split(',')
            .map(s => s.trim())
            .filter(s => s),
        material: document.getElementById('material').value,
        fitType: document.getElementById('fitType').value,
        composition: document.getElementById('composition').value,
        weight: parseFloat(document.getElementById('weight').value) || 0,
        stock: parseInt(document.getElementById('stock').value) || 0,
        createdAt: isEditMode ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    saveProductToStorage(product);
    
    // Limpiar formulario si es modo creación
    if (!isEditMode) {
        document.getElementById('productForm').reset();
    }
    
    // Opcional: redirigir después de guardar
    setTimeout(() => {
        window.navigateTo('/admin');
    }, 1500);
}

/**
 * Configurar título del formulario según modo
 */
function setFormTitle() {
    const titleElement = document.getElementById('formTitle');
    if (titleElement) {
        titleElement.textContent = isEditMode ? 'Editar Producto' : 'Agregar Producto';
    }
}

/**
 * Configurar botón de volver
 */
function initBackButton() {
    const backBtn = document.getElementById('backToAdminBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.navigateTo('/admin');
        });
    }
}

/**
 * Controlador principal
 */
export async function productsController() {
    console.log('📦 Products Controller - Formulario de productos');
    
    // Cargar estilos
    loadProductsStyles();
    
    // Obtener parámetros de URL (para modo edición)
    getUrlParams();
    
    // Configurar título
    setFormTitle();
    
    // Cargar datos si es modo edición
    if (isEditMode && editingProductId) {
        const loaded = loadProductForEdit(editingProductId);
        if (!loaded) {
            showProductsNotification('⚠️ Producto no encontrado', true);
        }
    }
    
    // Inicializar generador de slug
    initSlugGenerator();
    
    // Configurar botón de volver
    initBackButton();
    
    // Configurar evento del formulario
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    console.log('✅ Products form loaded successfully');
}