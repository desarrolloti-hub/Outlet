/* ========================================
   EDIT PRODUCT CONTROLLER - OUTLET ADMIN
   Controlador para editar prendas existentes
   CON SWEETALERT2 INTEGRADO
   ======================================== */

// Estado del controlador
var isLoading = false;
var galleryImages = [];
var currentMainImage = null;
var colores = [];
var tallas = [];
var materiales = [];
var originalProductData = null;
var productId = null;

// ========================================
// UI Helpers - CON SWEETALERT2
// ========================================

/**
 * Muestra un toast personalizado (estilo OUTLET)
 */
function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    var toastExistente = document.querySelector('.outlet-toast');
    if (toastExistente) toastExistente.remove();
    
    var toast = document.createElement('div');
    toast.className = 'outlet-toast ' + tipo;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    requestAnimationFrame(function() {
        toast.classList.add('show');
    });
    
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3200);
}

/**
 * Muestra una SweetAlert2 personalizada
 */
function mostrarSweetAlert(options) {
    var defaultOptions = {
        buttonsStyling: false,
        customClass: {
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel',
            popup: 'swal2-popup'
        }
    };
    
    return Swal.fire(Object.assign({}, defaultOptions, options));
}

/**
 * Muestra alerta de éxito
 */
function mostrarExito(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'success',
        title: titulo || '¡Perfecto!',
        text: mensaje || 'La acción se completó con éxito.',
        confirmButtonText: 'Aceptar'
    });
}

/**
 * Muestra alerta de error
 */
function mostrarError(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'error',
        title: titulo || '¡Oops!',
        text: mensaje || 'Ocurrió un error inesperado.',
        confirmButtonText: 'Entendido'
    });
}

/**
 * Muestra alerta de advertencia
 */
function mostrarAdvertencia(titulo, mensaje, confirmText) {
    confirmText = confirmText || 'Continuar';
    return mostrarSweetAlert({
        icon: 'warning',
        title: titulo || '¡Cuidado!',
        text: mensaje || 'Estás a punto de realizar una acción importante.',
        confirmButtonText: confirmText,
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
    });
}

/**
 * Muestra alerta de confirmación
 */
function mostrarConfirmacion(titulo, mensaje, confirmText) {
    confirmText = confirmText || 'Sí, confirmar';
    return mostrarSweetAlert({
        title: titulo || '¿Estás seguro?',
        text: mensaje || 'Esta acción requiere tu confirmación.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar'
    });
}

/**
 * Muestra un loading con SweetAlert2
 */
function mostrarLoading(mensaje) {
    mensaje = mensaje || 'Procesando...';
    return mostrarSweetAlert({
        title: mensaje,
        allowOutsideClick: false,
        didOpen: function() {
            Swal.showLoading();
        }
    });
}

/**
 * Cierra la alerta de loading
 */
function cerrarLoading() {
    Swal.close();
}

// ========================================
// Obtiene el ID del producto de la URL
// ========================================
function getProductIdFromUrl() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// ========================================
// Muestra/oculta loading overlay
// ========================================
function setLoading(show) {
    var overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// ========================================
// Calcula precio final con descuento
// ========================================
function updatePrecioFinal() {
    var precioVenta = parseFloat(document.getElementById('precioVenta')?.value) || 0;
    var descuento = parseFloat(document.getElementById('descuento')?.value) || 0;
    var precioFinal = precioVenta * (1 - descuento / 100);
    var precioFinalEl = document.getElementById('precioFinal');
    if (precioFinalEl) {
        precioFinalEl.innerHTML = '€' + precioFinal.toFixed(2);
        if (descuento > 0) {
            precioFinalEl.style.color = 'var(--outlet-danger)';
        } else {
            precioFinalEl.style.color = 'var(--outlet-gold)';
        }
    }
}

// ========================================
// Renderiza tags (colores, tallas, materiales)
// ========================================
function renderTags(containerId, listId, items, hiddenInputId) {
    var listContainer = document.getElementById(listId);
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    items.forEach(function(item, index) {
        var tag = document.createElement('span');
        tag.className = 'outlet-tag';
        tag.innerHTML = item + ' <span class="outlet-remove-tag" data-index="' + index + '" data-container="' + containerId + '">✕</span>';
        listContainer.appendChild(tag);
    });
    
    var hiddenInput = document.getElementById(hiddenInputId);
    if (hiddenInput) hiddenInput.value = JSON.stringify(items);
    
    document.querySelectorAll('.outlet-remove-tag').forEach(function(btn) {
        btn.removeEventListener('click', handleRemoveTag);
        btn.addEventListener('click', handleRemoveTag);
    });
}

function handleRemoveTag(e) {
    e.stopPropagation();
    var index = parseInt(e.target.dataset.index);
    var container = e.target.dataset.container;
    
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
    var input = document.getElementById('colorInput');
    var value = input?.value.trim().toUpperCase();
    if (value && !colores.includes(value)) {
        colores.push(value);
        renderTags('coloresContainer', 'coloresList', colores, 'colores');
        input.value = '';
        mostrarToast('Color "' + value + '" agregado', 'success');
    }
}

function addTalla() {
    var input = document.getElementById('tallaInput');
    var value = input?.value.trim().toUpperCase();
    if (value && !tallas.includes(value)) {
        tallas.push(value);
        renderTags('tallasContainer', 'tallasList', tallas, 'tallas');
        input.value = '';
        mostrarToast('Talla "' + value + '" agregada', 'success');
    }
}

function addMaterial() {
    var input = document.getElementById('materialInput');
    var value = input?.value.trim();
    if (value && !materiales.includes(value)) {
        materiales.push(value);
        renderTags('materialesContainer', 'materialesList', materiales, 'materiales');
        input.value = '';
        mostrarToast('Material "' + value + '" agregado', 'success');
    }
}

// ========================================
// Renderiza galería de imágenes
// ========================================
function renderGallery() {
    var galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    galleryImages.forEach(function(img, index) {
        var div = document.createElement('div');
        div.className = 'outlet-gallery-item';
        div.innerHTML = 
            '<img src="' + img + '" alt="Galería ' + (index + 1) + '">' +
            '<button type="button" class="outlet-remove-gallery-img" data-index="' + index + '">✕</button>';
        galleryGrid.appendChild(div);
    });
    
    document.getElementById('galeriaImagenes').value = JSON.stringify(galleryImages);
    
    document.querySelectorAll('.outlet-remove-gallery-img').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            var idx = parseInt(this.dataset.index);
            galleryImages.splice(idx, 1);
            renderGallery();
        });
    });
}

// ========================================
// Configura subida de imágenes
// ========================================
function setupImageUpload() {
    var mainArea = document.getElementById('mainImageArea');
    var mainInput = document.getElementById('mainImageInput');
    
    if (mainArea) {
        mainArea.addEventListener('click', function() { mainInput?.click(); });
    }
    
    if (mainInput) {
        mainInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                var file = e.target.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    mostrarError('Imagen demasiado grande', 'La imagen no debe superar los 5MB.');
                    return;
                }
                var reader = new FileReader();
                reader.onload = function(ev) {
                    currentMainImage = ev.target.result;
                    var placeholder = document.getElementById('mainImagePlaceholder');
                    var preview = document.getElementById('mainImagePreview');
                    var previewImg = document.getElementById('mainPreviewImg');
                    if (placeholder) placeholder.style.display = 'none';
                    if (preview) preview.style.display = 'flex';
                    if (previewImg) previewImg.src = ev.target.result;
                    document.getElementById('imagenPrincipal').value = ev.target.result;
                    mostrarToast('Imagen principal cargada', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    var addGalleryBtn = document.getElementById('addGalleryBtn');
    var galleryInput = document.createElement('input');
    galleryInput.type = 'file';
    galleryInput.accept = 'image/*';
    galleryInput.multiple = true;
    
    if (addGalleryBtn) {
        addGalleryBtn.addEventListener('click', function() { galleryInput.click(); });
    }
    
    galleryInput.addEventListener('change', function(e) {
        var files = Array.from(e.target.files);
        files.forEach(function(file) {
            if (galleryImages.length >= 8) {
                mostrarError('Límite alcanzado', 'Máximo 8 imágenes en la galería.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                mostrarError('Imagen demasiado grande', 'Una imagen supera los 5MB.');
                return;
            }
            var reader = new FileReader();
            reader.onload = function(ev) {
                galleryImages.push(ev.target.result);
                renderGallery();
                mostrarToast('Imagen agregada a la galería', 'success');
            };
            reader.readAsDataURL(file);
        });
        galleryInput.value = '';
    });
}

function removeMainImage() {
    currentMainImage = null;
    var placeholder = document.getElementById('mainImagePlaceholder');
    var preview = document.getElementById('mainImagePreview');
    var mainInput = document.getElementById('mainImageInput');
    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (mainInput) mainInput.value = '';
    document.getElementById('imagenPrincipal').value = '';
    mostrarToast('Imagen principal eliminada', 'info');
}

// ========================================
// Carga los datos del producto
// ========================================
async function loadProductData() {
    setLoading(true);
    
    try {
        var productos = JSON.parse(localStorage.getItem('outlet_productos') || '[]');
        var producto = productos.find(function(p) { return p.id === productId || p.sku === productId; });
        
        if (!producto) {
            await mostrarError('Producto no encontrado', 'No se encontró el producto que deseas editar.');
            setTimeout(function() {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/admin/productos');
                } else {
                    window.location.href = '/admin/productos';
                }
            }, 1500);
            return;
        }
        
        originalProductData = Object.assign({}, producto);
        
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
        
        if (producto.imagenPrincipal) {
            currentMainImage = producto.imagenPrincipal;
            var placeholder = document.getElementById('mainImagePlaceholder');
            var preview = document.getElementById('mainImagePreview');
            var previewImg = document.getElementById('mainPreviewImg');
            if (placeholder) placeholder.style.display = 'none';
            if (preview) preview.style.display = 'flex';
            if (previewImg) previewImg.src = producto.imagenPrincipal;
            document.getElementById('imagenPrincipal').value = producto.imagenPrincipal;
        }
        
        if (producto.galeriaImagenes && producto.galeriaImagenes.length > 0) {
            galleryImages = producto.galeriaImagenes.slice(0);
            renderGallery();
        }
        
        colores = producto.colores || [];
        tallas = producto.tallas || [];
        materiales = producto.materiales || [];
        
        renderTags('coloresContainer', 'coloresList', colores, 'colores');
        renderTags('tallasContainer', 'tallasList', tallas, 'tallas');
        renderTags('materialesContainer', 'materialesList', materiales, 'materiales');
        
        updatePrecioFinal();
        
        var deleteBtn = document.getElementById('deleteProductBtn');
        if (deleteBtn) deleteBtn.style.display = 'inline-flex';
        
    } catch (error) {
        console.error('Error al cargar producto:', error);
        await mostrarError('Error al cargar', 'No se pudieron cargar los datos del producto.');
    } finally {
        setLoading(false);
    }
}

// ========================================
// Valida el formulario
// ========================================
function validateForm() {
    var isValid = true;
    
    var requiredFields = ['nombre', 'descripcion', 'marca', 'categoria', 'genero', 'precioCompra', 'precioVenta', 'stock'];
    requiredFields.forEach(function(field) {
        var input = document.getElementById(field);
        if (!input?.value.trim()) {
            input.style.borderColor = 'var(--outlet-danger)';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (!currentMainImage) {
        isValid = false;
    }
    
    return isValid;
}

// ========================================
// Actualiza el producto CON SWEETALERT2
// ========================================
async function actualizarProducto(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!validateForm()) {
        await mostrarError('Campos incompletos', 'Por favor, completa todos los campos requeridos.');
        return;
    }
    
    var productoActualizado = {
        id: originalProductData.id,
        sku: document.getElementById('sku').value || originalProductData.id,
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
        createdAt: originalProductData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    productoActualizado.precioFinal = productoActualizado.precioVenta * (1 - productoActualizado.porcentajeDescuento / 100);
    
    // Confirmación antes de actualizar
    var confirmResult = await mostrarConfirmacion(
        '¿Actualizar producto?',
        'Estás a punto de actualizar "' + productoActualizado.nombre + '" (SKU: ' + productoActualizado.sku + ').',
        'Sí, actualizar'
    );
    
    if (!confirmResult.isConfirmed) {
        mostrarToast('Actualización cancelada', 'info');
        return;
    }
    
    isLoading = true;
    var submitBtn = document.getElementById('submitBtn');
    var originalText = submitBtn?.innerHTML;
    if (submitBtn) {
        submitBtn.innerHTML = '<span>⏳ ACTUALIZANDO...</span>';
        submitBtn.disabled = true;
    }
    
    mostrarLoading('Actualizando producto...');
    
    try {
        var productos = JSON.parse(localStorage.getItem('outlet_productos') || '[]');
        var index = productos.findIndex(function(p) { return p.id === productId || p.sku === productId; });
        
        if (index !== -1) {
            productos[index] = productoActualizado;
            localStorage.setItem('outlet_productos', JSON.stringify(productos));
            
            cerrarLoading();
            await mostrarExito(
                '¡Producto actualizado!',
                '✅ "' + productoActualizado.nombre + '" actualizado correctamente.'
            );
            
            setTimeout(function() {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/admin/productos');
                } else {
                    window.location.href = '/admin/productos';
                }
            }, 1500);
        } else {
            cerrarLoading();
            await mostrarError('Error', 'Producto no encontrado para actualizar.');
        }
    } catch (error) {
        cerrarLoading();
        console.error('Error al actualizar:', error);
        await mostrarError('Error al actualizar', error.message || 'Ocurrió un error inesperado.');
    } finally {
        isLoading = false;
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// ========================================
// Elimina el producto CON SWEETALERT2
// ========================================
async function eliminarProducto() {
    var result = await mostrarConfirmacion(
        '¿Eliminar producto?',
        '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
        'Sí, eliminar'
    );
    
    if (!result.isConfirmed) return;
    
    setLoading(true);
    mostrarLoading('Eliminando producto...');
    
    try {
        var productos = JSON.parse(localStorage.getItem('outlet_productos') || '[]');
        var nuevosProductos = productos.filter(function(p) { return p.id !== productId && p.sku !== productId; });
        
        if (nuevosProductos.length === productos.length) {
            cerrarLoading();
            await mostrarError('Error', 'Producto no encontrado.');
            return;
        }
        
        localStorage.setItem('outlet_productos', JSON.stringify(nuevosProductos));
        
        cerrarLoading();
        await mostrarExito('¡Producto eliminado!', 'El producto ha sido eliminado correctamente.');
        
        setTimeout(function() {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/admin/productos');
            } else {
                window.location.href = '/admin/productos';
            }
        }, 1500);
    } catch (error) {
        cerrarLoading();
        console.error('Error al eliminar:', error);
        await mostrarError('Error al eliminar', error.message || 'Ocurrió un error inesperado.');
    } finally {
        setLoading(false);
    }
}

// ========================================
// Restablece el formulario CON SWEETALERT2
// ========================================
async function resetForm() {
    if (!originalProductData) return;
    
    var result = await mostrarAdvertencia(
        '¿Restablecer cambios?',
        'Se perderán todas las modificaciones no guardadas. ¿Deseas continuar?',
        'Sí, restablecer'
    );
    
    if (result.isConfirmed) {
        loadProductData();
        mostrarToast('🔄 Formulario restablecido', 'info');
    }
}

// ========================================
// Inicializa eventos del formulario
// ========================================
function initFormEvents() {
    var form = document.getElementById('productEditForm');
    var resetBtn = document.getElementById('resetFormBtn');
    var backBtn = document.getElementById('backBtn');
    var deleteBtn = document.getElementById('deleteProductBtn');
    var removeMainBtn = document.getElementById('removeMainImageBtn');
    var addColorBtn = document.getElementById('addColorBtn');
    var addTallaBtn = document.getElementById('addTallaBtn');
    var addMaterialBtn = document.getElementById('addMaterialBtn');
    
    if (form) form.addEventListener('submit', actualizarProducto);
    if (resetBtn) resetBtn.addEventListener('click', resetForm);
    if (backBtn) backBtn.addEventListener('click', function() {
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
    
    var precioVenta = document.getElementById('precioVenta');
    var descuento = document.getElementById('descuento');
    if (precioVenta) precioVenta.addEventListener('input', updatePrecioFinal);
    if (descuento) descuento.addEventListener('input', updatePrecioFinal);
    
    var colorInput = document.getElementById('colorInput');
    var tallaInput = document.getElementById('tallaInput');
    var materialInput = document.getElementById('materialInput');
    
    if (colorInput) colorInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addColor(); } });
    if (tallaInput) tallaInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addTalla(); } });
    if (materialInput) materialInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } });
}

// ========================================
// Controlador principal
// ========================================
export async function editProductController() {
    console.log('✏️ Product Edit Controller - Edición de prendas');
    
    productId = getProductIdFromUrl();
    
    if (!productId) {
        await mostrarError('ID no especificado', 'No se especificó el ID del producto a editar.');
        setTimeout(function() {
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