/* ========================================
   CREATE PRODUCT CONTROLLER - OUTLET ADMIN
   Controlador para dar de alta nuevas prendas
   ======================================== */

// Estado del controlador
let isLoading = false;
let galleryImages = [];
let currentMainImage = null;
let colores = [];
let tallas = [];
let materiales = [];

/**
 * Muestra notificación toast
 */
function showNotification(message, isError = false) {
    const existingToast = document.querySelector('.outlet-toast-notification');
    if (existingToast) existingToast.remove();
    
    const notification = document.createElement('div');
    notification.className = 'outlet-toast-notification';
    notification.textContent = message;
    
    if (isError) {
        notification.style.borderLeftColor = 'var(--outlet-danger)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Genera SKU automáticamente
 */
function generateSKU(nombre, marca) {
    const prefix = marca ? marca.substring(0, 3).toUpperCase() : 'OUT';
    const nameCode = nombre ? nombre.substring(0, 3).toUpperCase() : 'PRD';
    const random = Math.floor(Math.random() * 1000);
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${nameCode}-${random}-${timestamp}`;
}

/**
 * Calcula precio final con descuento
 */
function updatePrecioFinal() {
    const precioVenta = parseFloat(document.getElementById('precioVenta')?.value) || 0;
    const descuento = parseFloat(document.getElementById('descuento')?.value) || 0;
    const precioFinal = precioVenta * (1 - descuento / 100);
    const precioFinalEl = document.getElementById('precioFinal');
    if (precioFinalEl) {
        precioFinalEl.innerHTML = `€${precioFinal.toFixed(2)}`;
        if (descuento > 0) {
            precioFinalEl.style.color = 'var(--outlet-danger)';
        } else {
            precioFinalEl.style.color = 'var(--outlet-gold)';
        }
    }
}

/**
 * Renderiza tags (colores, tallas, materiales)
 */
function renderTags(containerId, listId, items, hiddenInputId) {
    const listContainer = document.getElementById(listId);
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    items.forEach((item, index) => {
        const tag = document.createElement('span');
        tag.className = 'outlet-tag';
        tag.innerHTML = `${item} <span class="outlet-remove-tag" data-index="${index}" data-container="${containerId}">✕</span>`;
        listContainer.appendChild(tag);
    });
    
    const hiddenInput = document.getElementById(hiddenInputId);
    if (hiddenInput) hiddenInput.value = JSON.stringify(items);
    
    // Event listeners para eliminar tags
    document.querySelectorAll('.outlet-remove-tag').forEach(btn => {
        btn.removeEventListener('click', handleRemoveTag);
        btn.addEventListener('click', handleRemoveTag);
    });
}

function handleRemoveTag(e) {
    e.stopPropagation();
    const index = parseInt(e.target.dataset.index);
    const container = e.target.dataset.container;
    
    if (container === 'coloresContainer') {
        colores.splice(index, 1);
        renderTags('coloresContainer', 'coloresList', colores, 'colores');
    } else if (container === 'tallasContainer') {
        tallas.splice(index, 1);
        renderTags('tallasContainer', 'tallasList', tallas, 'tallas');
    } else if (container === 'materialesContainer') {
        materiales.splice(index, 1);
        renderTags('materialesContainer', 'materialesList', materiales, 'materiales');
    }
}

function addColor() {
    const input = document.getElementById('colorInput');
    const value = input?.value.trim().toUpperCase();
    if (value && !colores.includes(value)) {
        colores.push(value);
        renderTags('coloresContainer', 'coloresList', colores, 'colores');
        input.value = '';
    }
}

function addTalla() {
    const input = document.getElementById('tallaInput');
    const value = input?.value.trim().toUpperCase();
    if (value && !tallas.includes(value)) {
        tallas.push(value);
        renderTags('tallasContainer', 'tallasList', tallas, 'tallas');
        input.value = '';
    }
}

function addMaterial() {
    const input = document.getElementById('materialInput');
    const value = input?.value.trim();
    if (value && !materiales.includes(value)) {
        materiales.push(value);
        renderTags('materialesContainer', 'materialesList', materiales, 'materiales');
        input.value = '';
    }
}

/**
 * Renderiza galería de imágenes
 */
function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    galleryImages.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'outlet-gallery-item';
        div.innerHTML = `
            <img src="${img}" alt="Galería ${index + 1}">
            <button type="button" class="outlet-remove-gallery-img" data-index="${index}">✕</button>
        `;
        galleryGrid.appendChild(div);
    });
    
    document.getElementById('galeriaImagenes').value = JSON.stringify(galleryImages);
    
    document.querySelectorAll('.outlet-remove-gallery-img').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            galleryImages.splice(idx, 1);
            renderGallery();
        });
    });
}

/**
 * Configura subida de imágenes
 */
function setupImageUpload() {
    const mainArea = document.getElementById('mainImageArea');
    const mainInput = document.getElementById('mainImageInput');
    
    if (mainArea) {
        mainArea.addEventListener('click', () => mainInput?.click());
    }
    
    if (mainInput) {
        mainInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('❌ La imagen no debe superar los 5MB', true);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    currentMainImage = ev.target.result;
                    const placeholder = document.getElementById('mainImagePlaceholder');
                    const preview = document.getElementById('mainImagePreview');
                    const previewImg = document.getElementById('mainPreviewImg');
                    if (placeholder) placeholder.style.display = 'none';
                    if (preview) preview.style.display = 'flex';
                    if (previewImg) previewImg.src = ev.target.result;
                    document.getElementById('imagenPrincipal').value = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    const addGalleryBtn = document.getElementById('addGalleryBtn');
    const galleryInput = document.createElement('input');
    galleryInput.type = 'file';
    galleryInput.accept = 'image/*';
    galleryInput.multiple = true;
    
    if (addGalleryBtn) {
        addGalleryBtn.addEventListener('click', () => galleryInput.click());
    }
    
    galleryInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (galleryImages.length >= 8) {
                showNotification('❌ Máximo 8 imágenes en la galería', true);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showNotification('❌ Una imagen supera los 5MB', true);
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                galleryImages.push(ev.target.result);
                renderGallery();
            };
            reader.readAsDataURL(file);
        });
        galleryInput.value = '';
    });
}

function removeMainImage() {
    currentMainImage = null;
    const placeholder = document.getElementById('mainImagePlaceholder');
    const preview = document.getElementById('mainImagePreview');
    const mainInput = document.getElementById('mainImageInput');
    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (mainInput) mainInput.value = '';
    document.getElementById('imagenPrincipal').value = '';
}

/**
 * Valida el formulario
 */
function validateForm() {
    let isValid = true;
    
    const requiredFields = ['nombre', 'descripcion', 'marca', 'categoria', 'genero', 'precioCompra', 'precioVenta', 'stock'];
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input?.value.trim()) {
            input.style.borderColor = 'var(--outlet-danger)';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (!currentMainImage) {
        showNotification('❌ La imagen principal es requerida', true);
        isValid = false;
    }
    
    return isValid;
}

/**
 * Guarda el producto
 */
async function guardarProducto(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!validateForm()) {
        showNotification('❌ Por favor completa todos los campos requeridos', true);
        return;
    }
    
    let sku = document.getElementById('sku').value.trim();
    if (!sku) {
        const nombre = document.getElementById('nombre').value;
        const marca = document.getElementById('marca').value;
        sku = generateSKU(nombre, marca);
        document.getElementById('sku').value = sku;
    }
    
    const producto = {
        id: sku,
        sku: sku,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        marca: document.getElementById('marca').value,
        categoria: document.getElementById('categoria').value,
        subcategoria: document.getElementById('subcategoria').value,
        genero: document.getElementById('genero').value,
        precioCompra: parseFloat(document.getElementById('precioCompra').value),
        precioVenta: parseFloat(document.getElementById('precioVenta').value),
        porcentajeDescuento: parseFloat(document.getElementById('descuento').value) || 0,
        imagenPrincipal: currentMainImage,
        galeriaImagenes: galleryImages,
        colores: colores,
        tallas: tallas,
        materiales: materiales,
        temporada: document.getElementById('temporada').value,
        tipoAjuste: document.getElementById('tipoAjuste').value,
        composicion: document.getElementById('composicion').value,
        peso: document.getElementById('peso').value ? parseInt(document.getElementById('peso').value) : null,
        stock: parseInt(document.getElementById('stock').value),
        estado: document.getElementById('estado').value,
        destacado: document.getElementById('destacado').checked,
        createdAt: new Date().toISOString()
    };
    
    producto.precioFinal = producto.precioVenta * (1 - producto.porcentajeDescuento / 100);
    
    isLoading = true;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn?.innerHTML;
    if (submitBtn) {
        submitBtn.innerHTML = '<span>⏳ GUARDANDO...</span>';
        submitBtn.disabled = true;
    }
    
    try {
        let productos = JSON.parse(localStorage.getItem('outlet_productos') || '[]');
        productos.push(producto);
        localStorage.setItem('outlet_productos', JSON.stringify(productos));
        
        console.log('✅ Producto guardado:', producto);
        showNotification(`✅ Producto "${producto.nombre}" guardado correctamente`);
        
        if (confirm('¿Producto guardado exitosamente! ¿Deseas agregar otro producto?')) {
            limpiarFormulario();
        } else if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin/productos');
        } else {
            window.location.href = '/admin/productos';
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        showNotification(`❌ Error al guardar: ${error.message}`, true);
    } finally {
        isLoading = false;
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

/**
 * Limpia el formulario
 */
function limpiarFormulario() {
    document.getElementById('productCreateForm')?.reset();
    colores = [];
    tallas = [];
    materiales = [];
    galleryImages = [];
    currentMainImage = null;
    
    renderTags('coloresContainer', 'coloresList', colores, 'colores');
    renderTags('tallasContainer', 'tallasList', tallas, 'tallas');
    renderTags('materialesContainer', 'materialesList', materiales, 'materiales');
    renderGallery();
    removeMainImage();
    updatePrecioFinal();
    
    showNotification('🧹 Formulario limpiado');
}

/**
 * Inicializa eventos del formulario
 */
function initFormEvents() {
    const form = document.getElementById('productCreateForm');
    const clearBtn = document.getElementById('clearFormBtn');
    const backBtn = document.getElementById('backBtn');
    const removeMainBtn = document.getElementById('removeMainImageBtn');
    const addColorBtn = document.getElementById('addColorBtn');
    const addTallaBtn = document.getElementById('addTallaBtn');
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    
    if (form) form.addEventListener('submit', guardarProducto);
    if (clearBtn) clearBtn.addEventListener('click', limpiarFormulario);
    if (backBtn) backBtn.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin');
        } else {
            window.history.back();
        }
    });
    if (removeMainBtn) removeMainBtn.addEventListener('click', removeMainImage);
    if (addColorBtn) addColorBtn.addEventListener('click', addColor);
    if (addTallaBtn) addTallaBtn.addEventListener('click', addTalla);
    if (addMaterialBtn) addMaterialBtn.addEventListener('click', addMaterial);
    
    // Precio final dinámico
    const precioVenta = document.getElementById('precioVenta');
    const descuento = document.getElementById('descuento');
    if (precioVenta) precioVenta.addEventListener('input', updatePrecioFinal);
    if (descuento) descuento.addEventListener('input', updatePrecioFinal);
    
    // Sugerir SKU automático
    const nombreInput = document.getElementById('nombre');
    const marcaInput = document.getElementById('marca');
    const skuInput = document.getElementById('sku');
    
    function suggestSKU() {
        if (nombreInput?.value && marcaInput?.value && !skuInput?.value) {
            skuInput.value = generateSKU(nombreInput.value, marcaInput.value);
        }
    }
    
    if (nombreInput) nombreInput.addEventListener('blur', suggestSKU);
    if (marcaInput) marcaInput.addEventListener('blur', suggestSKU);
    
    // Enter en inputs de tags
    const colorInput = document.getElementById('colorInput');
    const tallaInput = document.getElementById('tallaInput');
    const materialInput = document.getElementById('materialInput');
    
    if (colorInput) colorInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } });
    if (tallaInput) tallaInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTalla(); } });
    if (materialInput) materialInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } });
}

/**
 * Controlador principal
 */
export async function productCreateController() {
    console.log('📝 Product Create Controller - Alta de prendas');
    
    setupImageUpload();
    initFormEvents();
    updatePrecioFinal();
    
    console.log('✅ Product Create page loaded');
}