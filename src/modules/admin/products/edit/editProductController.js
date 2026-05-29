/* ========================================
   EDIT PRODUCT CONTROLLER - OUTLET ADMIN
   Controlador para editar prendas existentes
   ======================================== */

// Estado del controlador
let isLoading = false;
let galleryImages = [];
let currentMainImage = null;
let colores = [];
let tallas = [];
let materiales = [];
let originalProductData = null;
let productId = null;

/**
 * Obtiene el ID del producto de la URL
 */
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

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
 * Muestra/oculta loading overlay
 */
function setLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
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
 * Carga los datos del producto desde localStorage
 */
async function loadProductData() {
    setLoading(true);
    
    try {
        const productos = JSON.parse(localStorage.getItem('outlet_productos') || '[]');
        const producto = productos.find(p => p.id === productId || p.sku === productId);
        
        if (!producto) {
            showNotification('❌ Producto no encontrado', true);
            setTimeout(() => {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/admin/productos');
                } else {
                    window.location.href = '/admin/productos';
                }
            }, 1500);
            return;
        }
        
        originalProductData = { ...producto };
        
        // Llenar formulario
        document.getElementById('sku').value = producto.sku || producto.id || '';
        document.getElementById('nombre').value = producto.nombre || '';
        document.getElementById('descripcion').value = producto.descripcion || '';
        document.getElementById('marca').value = producto.marca || '';
        document.getElementById('categoria').value = producto.categoria || '';
        document.getElementById('subcategoria').value = producto.subcategoria || '';
        document.getElementById('genero').value = producto.genero || '';
        document.getElementById('precioCompra').value = producto.precioCompra || '';
        document.getElementById('precioVenta').value = producto.precioVenta || '';
        document.getElementById('descuento').value = producto.porcentajeDescuento || 0;
        document.getElementById('stock').value = producto.stock || 0;
        document.getElementById('estado').value = producto.estado || 'activo';
        document.getElementById('destacado').checked = producto.destacado || false;
        document.getElementById('temporada').value = producto.temporada || '';
        document.getElementById('tipoAjuste').value = producto.tipoAjuste || '';
        document.getElementById('composicion').value = producto.composicion || '';
        document.getElementById('peso').value = producto.peso || '';
        
        // Imágenes
        if (producto.imagenPrincipal) {
            currentMainImage = producto.imagenPrincipal;
            const placeholder = document.getElementById('mainImagePlaceholder');
            const preview = document.getElementById('mainImagePreview');
            const previewImg = document.getElementById('mainPreviewImg');
            if (placeholder) placeholder.style.display = 'none';
            if (preview) preview.style.display = 'flex';
            if (previewImg) previewImg.src = producto.imagenPrincipal;
            document.getElementById('imagenPrincipal').value = producto.imagenPrincipal;
        }
        
        if (producto.galeriaImagenes && producto.galeriaImagenes.length > 0) {
            galleryImages = [...producto.galeriaImagenes];
            renderGallery();
        }
        
        // Tags
        colores = producto.colores || [];
        tallas = producto.tallas || [];
        materiales = producto.materiales || [];
        
        renderTags('coloresContainer', 'coloresList', colores, 'colores');
        renderTags('tallasContainer', 'tallasList', tallas, 'tallas');
        renderTags('materialesContainer', 'materialesList', materiales, 'materiales');
        
        updatePrecioFinal();
        
        // Mostrar botón eliminar
        const deleteBtn = document.getElementById('deleteProductBtn');
        if (deleteBtn) deleteBtn.style.display = 'inline-flex';
        
    } catch (error) {
        console.error('Error al cargar producto:', error);
        showNotification('❌ Error al cargar el producto', true);
    } finally {
        setLoading(false);
    }
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
 * Actualiza el producto
 */
async function actualizarProducto(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!validateForm()) {
        showNotification('❌ Por favor completa todos los campos requeridos', true);
        return;
    }
    
    const productoActualizado = {
        ...originalProductData,
        sku: document.getElementById('sku').value,
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
        updatedAt: new Date().toISOString()
    };
    
    productoActualizado.precioFinal = productoActualizado.precioVenta * (1 - productoActualizado.porcentajeDescuento / 100);
    
    isLoading = true;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn?.innerHTML;
    if (submitBtn) {
        submitBtn.innerHTML = '<span>⏳ ACTUALIZANDO...</span>';
        submitBtn.disabled = true;
    }
    
    try {
        let productos = JSON.parse(localStorage.getItem('outlet_productos') || '[]');
        const index = productos.findIndex(p => p.id === productId || p.sku === productId);
        
        if (index !== -1) {
            productos[index] = productoActualizado;
            localStorage.setItem('outlet_productos', JSON.stringify(productos));
            
            showNotification(`✅ Producto "${productoActualizado.nombre}" actualizado correctamente`);
            
            setTimeout(() => {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/admin/productos');
                } else {
                    window.location.href = '/admin/productos';
                }
            }, 1500);
        } else {
            showNotification('❌ Producto no encontrado para actualizar', true);
        }
    } catch (error) {
        console.error('Error al actualizar:', error);
        showNotification(`❌ Error al actualizar: ${error.message}`, true);
    } finally {
        isLoading = false;
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

/**
 * Elimina el producto
 */
async function eliminarProducto() {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
        return;
    }
    
    setLoading(true);
    
    try {
        let productos = JSON.parse(localStorage.getItem('outlet_productos') || '[]');
        const nuevosProductos = productos.filter(p => p.id !== productId && p.sku !== productId);
        
        if (nuevosProductos.length === productos.length) {
            showNotification('❌ Producto no encontrado', true);
            return;
        }
        
        localStorage.setItem('outlet_productos', JSON.stringify(nuevosProductos));
        showNotification('✅ Producto eliminado correctamente');
        
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/admin/productos');
            } else {
                window.location.href = '/admin/productos';
            }
        }, 1500);
    } catch (error) {
        console.error('Error al eliminar:', error);
        showNotification(`❌ Error al eliminar: ${error.message}`, true);
    } finally {
        setLoading(false);
    }
}

/**
 * Restablece el formulario a los valores originales
 */
function resetForm() {
    if (!originalProductData) return;
    
    if (confirm('¿Restablecer todos los cambios? Se perderán las modificaciones no guardadas.')) {
        loadProductData();
        showNotification('🔄 Formulario restablecido');
    }
}

/**
 * Inicializa eventos del formulario
 */
function initFormEvents() {
    const form = document.getElementById('productEditForm');
    const resetBtn = document.getElementById('resetFormBtn');
    const backBtn = document.getElementById('backBtn');
    const deleteBtn = document.getElementById('deleteProductBtn');
    const removeMainBtn = document.getElementById('removeMainImageBtn');
    const addColorBtn = document.getElementById('addColorBtn');
    const addTallaBtn = document.getElementById('addTallaBtn');
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    
    if (form) form.addEventListener('submit', actualizarProducto);
    if (resetBtn) resetBtn.addEventListener('click', resetForm);
    if (backBtn) backBtn.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin/productos');
        } else {
            window.history.back();
        }
    });
    if (deleteBtn) deleteBtn.addEventListener('click', eliminarProducto);
    if (removeMainBtn) removeMainBtn.addEventListener('click', removeMainImage);
    if (addColorBtn) addColorBtn.addEventListener('click', addColor);
    if (addTallaBtn) addTallaBtn.addEventListener('click', addTalla);
    if (addMaterialBtn) addMaterialBtn.addEventListener('click', addMaterial);
    
    // Precio final dinámico
    const precioVenta = document.getElementById('precioVenta');
    const descuento = document.getElementById('descuento');
    if (precioVenta) precioVenta.addEventListener('input', updatePrecioFinal);
    if (descuento) descuento.addEventListener('input', updatePrecioFinal);
    
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
export async function editProductController() {
    console.log('✏️ Product Edit Controller - Edición de prendas');
    
    productId = getProductIdFromUrl();
    
    if (!productId) {
        showNotification('❌ ID de producto no especificado', true);
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/admin/productos');
            } else {
                window.location.href = '/admin/productos';
            }
        }, 1500);
        return;
    }
    
    setupImageUpload();
    initFormEvents();
    await loadProductData();
    
    console.log('✅ Product Edit page loaded for ID:', productId);
}