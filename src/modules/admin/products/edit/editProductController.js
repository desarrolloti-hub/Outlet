/* ========================================
   EDIT PRODUCT CONTROLLER - OUTLET ADMIN
   Controlador para editar prendas existentes
   CON FIREBASE Y SWEETALERT2 INTEGRADO
   ======================================== */

import { ProductService } from '../../../../services/productService.js';
import { CategoryService } from '../../../../services/categoryService.js';

// ========================================
// Variables de estado
// ========================================
let isLoading = false;
let galleryImages = [];
let currentMainImage = null;
let colores = [];
let tallas = [];
let materiales = [];
let originalProductData = null;
let productId = null;
let categoriesList = [];
let subcategoriesMap = {};

// ========================================
// DOM Elements
// ========================================
let elements = {};

function cacheElements() {
    elements = {
        // Botones
        backBtn: document.getElementById('backBtn'),
        deleteBtn: document.getElementById('deleteProductBtn'),
        submitBtn: document.getElementById('submitBtn'),
        resetBtn: document.getElementById('resetFormBtn'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        
        // Campos del formulario
        sku: document.getElementById('sku'),
        nombre: document.getElementById('nombre'),
        descripcion: document.getElementById('descripcion'),
        marca: document.getElementById('marca'),
        categoria: document.getElementById('categoria'),
        subcategoria: document.getElementById('subcategoria'),
        genero: document.getElementById('genero'),
        precioCompra: document.getElementById('precioCompra'),
        precioVenta: document.getElementById('precioVenta'),
        descuento: document.getElementById('descuento'),
        precioFinal: document.getElementById('precioFinal'),
        stock: document.getElementById('stock'),
        estado: document.getElementById('estado'),
        destacado: document.getElementById('destacado'),
        temporada: document.getElementById('temporada'),
        tipoAjuste: document.getElementById('tipoAjuste'),
        composicion: document.getElementById('composicion'),
        peso: document.getElementById('peso'),
        
        // Imágenes
        mainImageArea: document.getElementById('mainImageArea'),
        mainImageInput: document.getElementById('mainImageInput'),
        mainImagePlaceholder: document.getElementById('mainImagePlaceholder'),
        mainImagePreview: document.getElementById('mainImagePreview'),
        mainPreviewImg: document.getElementById('mainPreviewImg'),
        removeMainImageBtn: document.getElementById('removeMainImageBtn'),
        imagenPrincipal: document.getElementById('imagenPrincipal'),
        galleryGrid: document.getElementById('galleryGrid'),
        addGalleryBtn: document.getElementById('addGalleryBtn'),
        galeriaImagenes: document.getElementById('galeriaImagenes'),
        
        // Tags
        coloresList: document.getElementById('coloresList'),
        colorInput: document.getElementById('colorInput'),
        addColorBtn: document.getElementById('addColorBtn'),
        coloresHidden: document.getElementById('colores'),
        tallasList: document.getElementById('tallasList'),
        tallaInput: document.getElementById('tallaInput'),
        addTallaBtn: document.getElementById('addTallaBtn'),
        tallasHidden: document.getElementById('tallas'),
        materialesList: document.getElementById('materialesList'),
        materialInput: document.getElementById('materialInput'),
        addMaterialBtn: document.getElementById('addMaterialBtn'),
        materialesHidden: document.getElementById('materiales')
    };
}

// ========================================
// UI Helpers - CON SWEETALERT2
// ========================================

function mostrarToast(mensaje, tipo = 'info') {
    const toastExistente = document.querySelector('.outlet-toast');
    if (toastExistente) toastExistente.remove();
    
    const toast = document.createElement('div');
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

function mostrarExito(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'success',
        title: titulo || '¡Perfecto!',
        text: mensaje || 'La acción se completó con éxito.',
        confirmButtonText: 'Aceptar'
    });
}

function mostrarError(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'error',
        title: titulo || '¡Oops!',
        text: mensaje || 'Ocurrió un error inesperado.',
        confirmButtonText: 'Entendido'
    });
}

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
    if (elements.loadingOverlay) {
        elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// ========================================
// Calcula precio final con descuento
// ========================================
function updatePrecioFinal() {
    var precioVenta = parseFloat(elements.precioVenta?.value) || 0;
    var descuento = parseFloat(elements.descuento?.value) || 0;
    var precioFinal = precioVenta * (1 - descuento / 100);
    if (elements.precioFinal) {
        elements.precioFinal.innerHTML = '€' + precioFinal.toFixed(2);
        if (descuento > 0) {
            elements.precioFinal.style.color = 'var(--outlet-danger)';
        } else {
            elements.precioFinal.style.color = 'var(--outlet-gold)';
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
    var input = elements.colorInput;
    var value = input?.value.trim().toUpperCase();
    if (value && !colores.includes(value)) {
        colores.push(value);
        renderTags('coloresContainer', 'coloresList', colores, 'colores');
        input.value = '';
        mostrarToast('Color "' + value + '" agregado', 'success');
    }
}

function addTalla() {
    var input = elements.tallaInput;
    var value = input?.value.trim().toUpperCase();
    if (value && !tallas.includes(value)) {
        tallas.push(value);
        renderTags('tallasContainer', 'tallasList', tallas, 'tallas');
        input.value = '';
        mostrarToast('Talla "' + value + '" agregada', 'success');
    }
}

function addMaterial() {
    var input = elements.materialInput;
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
    if (!elements.galleryGrid) return;
    
    elements.galleryGrid.innerHTML = '';
    galleryImages.forEach(function(img, index) {
        var div = document.createElement('div');
        div.className = 'outlet-gallery-item';
        div.innerHTML = 
            '<img src="' + img + '" alt="Galería ' + (index + 1) + '">' +
            '<button type="button" class="outlet-remove-gallery-img" data-index="' + index + '">✕</button>';
        elements.galleryGrid.appendChild(div);
    });
    
    if (elements.galeriaImagenes) {
        elements.galeriaImagenes.value = JSON.stringify(galleryImages);
    }
    
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
    if (elements.mainImageArea) {
        elements.mainImageArea.addEventListener('click', function() { elements.mainImageInput?.click(); });
    }
    
    if (elements.mainImageInput) {
        elements.mainImageInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                var file = e.target.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    mostrarError('Imagen demasiado grande', 'La imagen no debe superar los 5MB.');
                    return;
                }
                var reader = new FileReader();
                reader.onload = function(ev) {
                    currentMainImage = ev.target.result;
                    if (elements.mainImagePlaceholder) elements.mainImagePlaceholder.style.display = 'none';
                    if (elements.mainImagePreview) elements.mainImagePreview.style.display = 'flex';
                    if (elements.mainPreviewImg) elements.mainPreviewImg.src = ev.target.result;
                    if (elements.imagenPrincipal) elements.imagenPrincipal.value = ev.target.result;
                    mostrarToast('Imagen principal cargada', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (elements.addGalleryBtn) {
        var galleryInput = document.createElement('input');
        galleryInput.type = 'file';
        galleryInput.accept = 'image/*';
        galleryInput.multiple = true;
        
        elements.addGalleryBtn.addEventListener('click', function() { galleryInput.click(); });
        
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
    
    if (elements.removeMainImageBtn) {
        elements.removeMainImageBtn.addEventListener('click', removeMainImage);
    }
}

function removeMainImage() {
    currentMainImage = null;
    if (elements.mainImagePlaceholder) elements.mainImagePlaceholder.style.display = 'flex';
    if (elements.mainImagePreview) elements.mainImagePreview.style.display = 'none';
    if (elements.mainImageInput) elements.mainImageInput.value = '';
    if (elements.imagenPrincipal) elements.imagenPrincipal.value = '';
    mostrarToast('Imagen principal eliminada', 'info');
}

// ========================================
// Cargar categorías para el select
// ========================================
async function loadCategoriesForSelect() {
    try {
        console.log('🔄 Cargando categorías para edición...');
        
        categoriesList = await CategoryService.getAll({}, true);
        console.log('✅ ' + categoriesList.length + ' categorías cargadas');
        
        subcategoriesMap = {};
        categoriesList.forEach(function(cat) {
            var subNames = (cat.subcategories || []).map(function(sub) { return sub.name; });
            subcategoriesMap[cat.id] = subNames;
        });
        
        populateCategorySelect();
        
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        // Fallback con opciones por defecto
        populateCategorySelectFallback();
    }
}

function populateCategorySelect() {
    if (!elements.categoria) return;
    
    var currentValue = elements.categoria.value;
    
    // Limpiar opciones excepto la primera
    while (elements.categoria.options.length > 0) {
        elements.categoria.remove(0);
    }
    
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccionar categoría';
    elements.categoria.appendChild(defaultOption);
    
    categoriesList.forEach(function(cat) {
        var option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        elements.categoria.appendChild(option);
    });
    
    if (currentValue && categoriesList.some(function(c) { return c.id === currentValue; })) {
        elements.categoria.value = currentValue;
    }
}

function populateCategorySelectFallback() {
    if (!elements.categoria) return;
    
    var fallbackOptions = [
        { value: 'ropa', label: 'Ropa' },
        { value: 'calzado', label: 'Calzado' },
        { value: 'accesorios', label: 'Accesorios' }
    ];
    
    while (elements.categoria.options.length > 0) {
        elements.categoria.remove(0);
    }
    
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccionar categoría';
    elements.categoria.appendChild(defaultOption);
    
    fallbackOptions.forEach(function(opt) {
        var option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        elements.categoria.appendChild(option);
    });
}

function updateSubcategories(categoryId) {
    if (!elements.subcategoria) return;
    
    var subNames = subcategoriesMap[categoryId] || [];
    
    while (elements.subcategoria.options.length > 0) {
        elements.subcategoria.remove(0);
    }
    
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccionar subcategoría';
    elements.subcategoria.appendChild(defaultOption);
    
    subNames.forEach(function(name) {
        var option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        elements.subcategoria.appendChild(option);
    });
}

function handleCategoryChange() {
    var selectedCategory = elements.categoria?.value;
    if (selectedCategory) {
        updateSubcategories(selectedCategory);
    }
}

// ========================================
// Carga los datos del producto desde Firebase
// ========================================
async function loadProductData() {
    setLoading(true);
    
    try {
        console.log('🔄 Cargando producto ID:', productId);
        
        // Cargar el producto usando ProductService
        const producto = await ProductService.getById(productId, true);
        
        if (!producto) {
            await mostrarError('Producto no encontrado', 'No se encontró el producto que deseas editar.');
            setTimeout(function() {
                irAHomeAdmin();
            }, 1500);
            return;
        }
        
        console.log('✅ Producto cargado:', producto.nombre);
        originalProductData = producto;
        
        // Llenar el formulario
        elements.sku.value = producto.sku || '';
        elements.nombre.value = producto.nombre || '';
        elements.descripcion.value = producto.descripcion || '';
        elements.marca.value = producto.marca || '';
        elements.categoria.value = producto.categoria || '';
        
        // Actualizar subcategorías según la categoría seleccionada
        if (producto.categoria) {
            updateSubcategories(producto.categoria);
            setTimeout(function() {
                elements.subcategoria.value = producto.subcategoria || '';
            }, 100);
        }
        
        elements.genero.value = producto.genero || '';
        elements.precioCompra.value = producto.precioCompra || '';
        elements.precioVenta.value = producto.precioVenta || '';
        elements.descuento.value = producto.porcentajeDescuento || 0;
        elements.stock.value = producto.stock || 0;
        elements.estado.value = producto.estado || 'activo';
        elements.destacado.checked = producto.destacado || false;
        elements.temporada.value = producto.temporada || '';
        elements.tipoAjuste.value = producto.tipoAjuste || '';
        elements.composicion.value = producto.composicion || '';
        elements.peso.value = producto.peso || '';
        
        // Cargar imagen principal
        if (producto.imagenPrincipal) {
            currentMainImage = producto.imagenPrincipal;
            if (elements.mainImagePlaceholder) elements.mainImagePlaceholder.style.display = 'none';
            if (elements.mainImagePreview) elements.mainImagePreview.style.display = 'flex';
            if (elements.mainPreviewImg) elements.mainPreviewImg.src = producto.imagenPrincipal;
            if (elements.imagenPrincipal) elements.imagenPrincipal.value = producto.imagenPrincipal;
        }
        
        // Cargar galería
        if (producto.galeriaImagenes && producto.galeriaImagenes.length > 0) {
            galleryImages = producto.galeriaImagenes.slice(0);
            renderGallery();
        }
        
        // Cargar colores, tallas y materiales
        colores = producto.colores || [];
        tallas = producto.tallas || [];
        materiales = producto.materiales || [];
        
        renderTags('coloresContainer', 'coloresList', colores, 'colores');
        renderTags('tallasContainer', 'tallasList', tallas, 'tallas');
        renderTags('materialesContainer', 'materialesList', materiales, 'materiales');
        
        // Actualizar precio final
        updatePrecioFinal();
        
        // Mostrar botón de eliminar
        if (elements.deleteBtn) elements.deleteBtn.style.display = 'inline-flex';
        
        console.log('✅ Producto cargado correctamente');
        
    } catch (error) {
        console.error('❌ Error al cargar producto:', error);
        await mostrarError('Error al cargar', 'No se pudieron cargar los datos del producto: ' + error.message);
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
// Actualiza el producto en Firebase
// ========================================
async function actualizarProducto(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!validateForm()) {
        await mostrarError('Campos incompletos', 'Por favor, completa todos los campos requeridos.');
        return;
    }
    
    var productoActualizado = {
        nombre: elements.nombre.value.trim(),
        descripcion: elements.descripcion.value.trim(),
        marca: elements.marca.value.trim(),
        categoria: elements.categoria.value,
        subcategoria: elements.subcategoria.value || '',
        genero: elements.genero.value,
        precioCompra: parseFloat(elements.precioCompra.value) || 0,
        precioVenta: parseFloat(elements.precioVenta.value) || 0,
        porcentajeDescuento: parseFloat(elements.descuento.value) || 0,
        imagenPrincipal: currentMainImage,
        galeriaImagenes: galleryImages,
        colores: colores,
        tallas: tallas,
        materiales: materiales,
        temporada: elements.temporada.value || '',
        tipoAjuste: elements.tipoAjuste.value || '',
        composicion: elements.composicion.value || '',
        peso: elements.peso.value ? parseInt(elements.peso.value) : null,
        stock: parseInt(elements.stock.value) || 0,
        estado: elements.estado.value || 'activo',
        destacado: elements.destacado.checked || false
    };
    
    // Confirmación antes de actualizar
    var confirmResult = await mostrarConfirmacion(
        '¿Actualizar producto?',
        'Estás a punto de actualizar "' + productoActualizado.nombre + '" (SKU: ' + originalProductData.sku + ').',
        'Sí, actualizar'
    );
    
    if (!confirmResult.isConfirmed) {
        mostrarToast('Actualización cancelada', 'info');
        return;
    }
    
    isLoading = true;
    var submitBtn = elements.submitBtn;
    var originalText = submitBtn?.innerHTML;
    if (submitBtn) {
        submitBtn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> ACTUALIZANDO...';
        submitBtn.disabled = true;
    }
    
    mostrarLoading('Actualizando producto en Firebase...');
    
    try {
        // Actualizar usando ProductService
        const updatedProduct = await ProductService.update(productId, productoActualizado);
        
        cerrarLoading();
        await mostrarExito(
            '¡Producto actualizado!',
            '✅ "' + updatedProduct.nombre + '" actualizado correctamente en Firebase.'
        );
        
        // Redirigir al home admin
        setTimeout(function() {
            irAHomeAdmin();
        }, 1500);
        
    } catch (error) {
        cerrarLoading();
        console.error('❌ Error al actualizar:', error);
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
// Elimina el producto de Firebase
// ========================================
async function eliminarProducto() {
    var result = await mostrarConfirmacion(
        '¿Eliminar producto?',
        '¿Estás seguro de que deseas eliminar "' + originalProductData.nombre + '"? Esta acción no se puede deshacer.',
        'Sí, eliminar'
    );
    
    if (!result.isConfirmed) return;
    
    setLoading(true);
    mostrarLoading('Eliminando producto de Firebase...');
    
    try {
        // Eliminar usando ProductService (soft delete por defecto)
        await ProductService.delete(productId, false);
        
        cerrarLoading();
        await mostrarExito('¡Producto eliminado!', 'El producto ha sido eliminado correctamente de Firebase.');
        
        setTimeout(function() {
            irAHomeAdmin();
        }, 1500);
        
    } catch (error) {
        cerrarLoading();
        console.error('❌ Error al eliminar:', error);
        await mostrarError('Error al eliminar', error.message || 'Ocurrió un error inesperado.');
    } finally {
        setLoading(false);
    }
}

// ========================================
// Restablece el formulario
// ========================================
async function resetForm() {
    if (!originalProductData) return;
    
    var result = await mostrarAdvertencia(
        '¿Restablecer cambios?',
        'Se perderán todas las modificaciones no guardadas. ¿Deseas continuar?',
        'Sí, restablecer'
    );
    
    if (result.isConfirmed) {
        await loadProductData();
        mostrarToast('🔄 Formulario restablecido', 'info');
    }
}

// ========================================
// Redirige al Home Admin
// ========================================
function irAHomeAdmin() {
    console.log('🔄 Redirigiendo a Home Admin...');
    
    try {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin');
        } else {
            window.location.href = '/homeAdmin.html';
        }
    } catch (error) {
        console.error('❌ Error al redirigir:', error);
        window.location.href = 'homeAdmin.html';
    }
}

// ========================================
// Inicializa eventos del formulario
// ========================================
function initFormEvents() {
    if (elements.submitBtn) {
        elements.submitBtn.addEventListener('click', actualizarProducto);
    }
    
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetForm);
    }
    
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Verificar si hay cambios sin guardar
            var tieneCambios = elements.nombre.value !== originalProductData?.nombre ||
                               elements.descripcion.value !== originalProductData?.descripcion ||
                               elements.precioVenta.value != originalProductData?.precioVenta;
            
            if (tieneCambios) {
                mostrarAdvertencia(
                    '¿Salir sin guardar?',
                    'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
                    'Sí, salir'
                ).then(function(result) {
                    if (result.isConfirmed) {
                        irAHomeAdmin();
                    }
                });
            } else {
                irAHomeAdmin();
            }
        });
    }
    
    if (elements.deleteBtn) {
        elements.deleteBtn.addEventListener('click', eliminarProducto);
    }
    
    if (elements.addColorBtn) {
        elements.addColorBtn.addEventListener('click', addColor);
    }
    
    if (elements.addTallaBtn) {
        elements.addTallaBtn.addEventListener('click', addTalla);
    }
    
    if (elements.addMaterialBtn) {
        elements.addMaterialBtn.addEventListener('click', addMaterial);
    }
    
    if (elements.precioVenta) {
        elements.precioVenta.addEventListener('input', updatePrecioFinal);
    }
    
    if (elements.descuento) {
        elements.descuento.addEventListener('input', updatePrecioFinal);
    }
    
    if (elements.colorInput) {
        elements.colorInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addColor(); } });
    }
    
    if (elements.tallaInput) {
        elements.tallaInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addTalla(); } });
    }
    
    if (elements.materialInput) {
        elements.materialInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } });
    }
    
    if (elements.categoria) {
        elements.categoria.addEventListener('change', handleCategoryChange);
    }
}

// ========================================
// Dark mode sync
// ========================================
function syncDarkMode() {
    if (window.OUTLETNav && typeof window.OUTLETNav.getTheme === 'function') {
        var navDark = window.OUTLETNav.getTheme();
        if (navDark && !document.body.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
        } else if (!navDark && document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
        }
    }
}

document.addEventListener('themeChanged', function(e) {
    if (e.detail.isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
});

// ========================================
// Controlador principal
// ========================================
export async function editProductController() {
    console.log('✏️ Product Edit Controller - Edición de prendas con Firebase');
    
    // Cachear elementos DOM
    cacheElements();
    
    // Obtener ID de la URL
    productId = getProductIdFromUrl();
    
    if (!productId) {
        await mostrarError('ID no especificado', 'No se especificó el ID del producto a editar.');
        setTimeout(function() {
            irAHomeAdmin();
        }, 1500);
        return;
    }
    
    console.log('📌 Product ID:', productId);
    
    // Sincronizar dark mode
    syncDarkMode();
    
    // Configurar subida de imágenes
    setupImageUpload();
    
    // Cargar categorías para el select
    await loadCategoriesForSelect();
    
    // Inicializar eventos del formulario
    initFormEvents();
    
    // Cargar los datos del producto desde Firebase
    await loadProductData();
    
    console.log('✅ Product Edit page loaded for ID:', productId);
}