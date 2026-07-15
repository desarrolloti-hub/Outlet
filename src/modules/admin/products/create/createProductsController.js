/* ========================================
   CREATE PRODUCT CONTROLLER - OUTLET ADMIN
   Controlador para dar de alta nuevas prendas
   Wizard de 3 pasos | Botones de navegación abajo
   RESPONSIVE: Se adapta a cualquier tamaño
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { ProductService } from '../../../../services/productService.js';
import { CategoryService } from '../../../../services/categoryService.js';

// ========================================
// Variables de estado
// ========================================
let currentStep = 1;
let isTransitioning = false;
let coloresArray = [];
let tallasArray = [];
let materialesArray = [];
let galleryImages = [];
let currentMainImage = null;
let isLoading = false;

// Variables para categorías
let categoriesList = [];
let subcategoriesMap = {};

// ========================================
// DOM Elements
// ========================================
let elements = {};

function cacheElements() {
    elements = {
        // Navegación
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        navButtons: document.querySelector('.outlet-nav-buttons'),
        actionButtons: document.getElementById('actionButtons'),
        stepItems: document.querySelectorAll('.outlet-step'),
        stepCurrent: document.getElementById('stepCurrent'),
        panels: document.querySelectorAll('.outlet-carousel-panel'),
        
        // Botones de acción
        clearBtn: document.getElementById('clearBtn'),
        saveBtn: document.getElementById('saveBtn'),
        backBtn: document.getElementById('backBtn'),
        
        // Imagen principal
        mainImageArea: document.getElementById('mainImageArea'),
        mainImageInput: document.getElementById('mainImageInput'),
        mainImagePlaceholder: document.getElementById('mainImagePlaceholder'),
        mainImagePreview: document.getElementById('mainImagePreview'),
        mainPreviewImg: document.getElementById('mainPreviewImg'),
        removeMainImageBtn: document.getElementById('removeMainImageBtn'),
        imagenPrincipal: document.getElementById('imagenPrincipal'),
        
        // Galería
        galleryGrid: document.getElementById('galleryGrid'),
        addGalleryBtn: document.getElementById('addGalleryBtn'),
        galeriaImagenes: document.getElementById('galeriaImagenes'),
        
        // Info general
        sku: document.getElementById('sku'),
        nombre: document.getElementById('nombre'),
        descripcion: document.getElementById('descripcion'),
        marca: document.getElementById('marca'),
        categoria: document.getElementById('categoria'),
        subcategoria: document.getElementById('subcategoria'),
        genero: document.getElementById('genero'),
        
        // Precios
        precioCompra: document.getElementById('precioCompra'),
        precioVenta: document.getElementById('precioVenta'),
        descuento: document.getElementById('descuento'),
        precioFinal: document.getElementById('precioFinal'),
        
        // Especificaciones
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
        materialesHidden: document.getElementById('materiales'),
        temporada: document.getElementById('temporada'),
        tipoAjuste: document.getElementById('tipoAjuste'),
        composicion: document.getElementById('composicion'),
        peso: document.getElementById('peso'),
        stock: document.getElementById('stock'),
        estado: document.getElementById('estado'),
        destacado: document.getElementById('destacado')
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
// FUNCIÓN: limpiarFormulario CON CONFIRMACIÓN
// ========================================
function limpiarFormulario() {
    var tieneDatos = elements.sku?.value || 
                       elements.nombre?.value || 
                       currentMainImage || 
                       coloresArray.length > 0 || 
                       tallasArray.length > 0 ||
                       galleryImages.length > 0;
    
    if (!tieneDatos) {
        mostrarToast('El formulario ya está vacío', 'info');
        return;
    }
    
    mostrarAdvertencia(
        '¿Limpiar formulario?',
        'Se perderán todos los datos ingresados. ¿Deseas continuar?',
        'Sí, limpiar'
    ).then(function(result) {
        if (result.isConfirmed) {
            ejecutarLimpiarFormulario();
        }
    });
}

function ejecutarLimpiarFormulario() {
    const inputsToClear = [
        'sku', 'nombre', 'descripcion', 'marca', 'genero',
        'precioCompra', 'precioVenta', 'descuento',
        'temporada', 'tipoAjuste', 'composicion', 'peso', 'stock'
    ];
    
    inputsToClear.forEach(function(id) {
        const element = elements[id];
        if (element) {
            element.value = '';
        }
    });
    
    if (elements.categoria && categoriesList.length > 0) {
        elements.categoria.value = categoriesList[0].id;
        updateSubcategories(categoriesList[0].id);
    }
    
    if (elements.estado) elements.estado.value = 'activo';
    if (elements.destacado) elements.destacado.checked = false;
    
    coloresArray = [];
    tallasArray = [];
    materialesArray = [];
    renderizarColores();
    renderizarTallas();
    renderizarMateriales();
    
    if (elements.coloresHidden) elements.coloresHidden.value = '[]';
    if (elements.tallasHidden) elements.tallasHidden.value = '[]';
    if (elements.materialesHidden) elements.materialesHidden.value = '[]';
    
    ejecutarRemoveMainImage();
    galleryImages = [];
    renderGallery();
    if (elements.galeriaImagenes) elements.galeriaImagenes.value = '[]';
    if (elements.imagenPrincipal) elements.imagenPrincipal.value = '';
    
    actualizarPrecioFinal();
    
    if (elements.colorInput) elements.colorInput.value = '';
    if (elements.tallaInput) elements.tallaInput.value = '';
    if (elements.materialInput) elements.materialInput.value = '';
    
    mostrarToast('Formulario limpiado completamente', 'success');
}

// ========================================
// FUNCIÓN: guardarProducto CON SWEETALERT2
// ========================================
async function guardarProducto() {
    if (isLoading) return;
    
    if (!elements.sku?.value || !elements.nombre?.value || !elements.descripcion?.value || 
        !elements.marca?.value || !elements.categoria?.value || !elements.genero?.value) {
        
        await mostrarError(
            'Campos incompletos',
            'Completa todos los campos del Paso 1 antes de guardar.'
        );
        
        if (currentStep !== 1) {
            while (currentStep > 1) cambiarPanel(-1);
        }
        return;
    }
    
    if (!currentMainImage) {
        await mostrarError(
            'Imagen principal requerida',
            'Agrega una imagen principal para el producto.'
        );
        
        if (currentStep !== 1) {
            while (currentStep > 1) cambiarPanel(-1);
        }
        return;
    }
    
    if (!elements.precioCompra?.value || !elements.precioVenta?.value) {
        await mostrarError(
            'Precios requeridos',
            'Completa los precios del Paso 2.'
        );
        
        if (currentStep !== 2) {
            if (currentStep > 2) {
                while (currentStep > 2) cambiarPanel(-1);
            } else {
                cambiarPanel(1);
            }
        }
        return;
    }
    
    var precioCompra = parseFloat(elements.precioCompra.value) || 0;
    var precioVenta = parseFloat(elements.precioVenta.value) || 0;
    
    if (precioVenta <= precioCompra) {
        await mostrarError(
            'Precio inválido',
            'El precio de venta debe ser mayor que el precio de compra.'
        );
        if (currentStep !== 2) {
            if (currentStep > 2) {
                while (currentStep > 2) cambiarPanel(-1);
            } else {
                cambiarPanel(1);
            }
        }
        return;
    }
    
    var descuento = parseFloat(elements.descuento?.value) || 0;
    if (descuento > 90) {
        await mostrarError(
            'Descuento excesivo',
            'El descuento no puede ser mayor al 90%.'
        );
        if (currentStep !== 2) {
            if (currentStep > 2) {
                while (currentStep > 2) cambiarPanel(-1);
            } else {
                cambiarPanel(1);
            }
        }
        return;
    }
    
    var nombreProducto = elements.nombre?.value || 'producto';
    var skuProducto = elements.sku?.value || 'N/A';
    
    var confirmResult = await mostrarConfirmacion(
        '¿Guardar producto?',
        'Estás a punto de guardar "' + nombreProducto + '" con SKU: ' + skuProducto,
        'Sí, guardar'
    );
    
    if (!confirmResult.isConfirmed) {
        mostrarToast('Guardado cancelado', 'info');
        return;
    }
    
    isLoading = true;
    var btn = elements.saveBtn;
    var originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Guardando...';
    btn.disabled = true;
    
    mostrarLoading('Guardando producto...');
    
    try {
        var productData = recolectarDatosProducto();
        var productoGuardado = await ProductService.create(productData);
        
        cerrarLoading();
        
        await mostrarExito(
            '¡Producto guardado!',
            '✅ "' + productoGuardado.nombre + '" se ha guardado exitosamente.'
        );
        
        ejecutarLimpiarFormulario();
        
        if (categoriesList.length > 0) {
            var firstCat = categoriesList[0];
            if (elements.categoria) {
                elements.categoria.value = firstCat.id;
                updateSubcategories(firstCat.id);
            }
        }
        
    } catch (error) {
        cerrarLoading();
        console.error('Error al guardar producto:', error);
        await mostrarError(
            'Error al guardar',
            'No se pudo guardar el producto. ' + (error.message || 'Error desconocido.')
        );
        
    } finally {
        isLoading = false;
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ========================================
// FUNCIÓN: cargar categorías CON SWEETALERT
// ========================================
async function loadCategories() {
    try {
        console.log('🔄 Cargando categorías para el formulario...');
        
        mostrarLoading('Cargando categorías...');
        
        categoriesList = await CategoryService.getAll({}, true);
        console.log('✅ ' + categoriesList.length + ' categorías cargadas');
        
        cerrarLoading();
        
        subcategoriesMap = {};
        categoriesList.forEach(function(cat) {
            var subNames = (cat.subcategories || []).map(function(sub) { return sub.name; });
            subcategoriesMap[cat.id] = subNames;
        });
        
        populateCategorySelect();
        
        if (categoriesList.length > 0) {
            var firstCat = categoriesList[0];
            if (elements.categoria) {
                elements.categoria.value = firstCat.id;
                updateSubcategories(firstCat.id);
            }
        }
        
        mostrarToast('✅ ' + categoriesList.length + ' categorías cargadas', 'success');
        
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        cerrarLoading();
        await mostrarError(
            'Error al cargar categorías',
            'No se pudieron cargar las categorías. ' + (error.message || 'Error desconocido.')
        );
        populateCategorySelectFallback();
    }
}

// ========================================
// FUNCIÓN: removeMainImage CON CONFIRMACIÓN
// ========================================
function removeMainImage() {
    if (!currentMainImage) return;
    
    mostrarConfirmacion(
        '¿Eliminar imagen principal?',
        'Esta acción eliminará la imagen principal del producto.',
        'Sí, eliminar'
    ).then(function(result) {
        if (result.isConfirmed) {
            ejecutarRemoveMainImage();
        }
    });
}

function ejecutarRemoveMainImage() {
    if (elements.mainImagePlaceholder) elements.mainImagePlaceholder.style.display = 'flex';
    if (elements.mainImagePreview) elements.mainImagePreview.style.display = 'none';
    if (elements.mainPreviewImg) elements.mainPreviewImg.src = '';
    currentMainImage = null;
    if (elements.imagenPrincipal) elements.imagenPrincipal.value = '';
    if (elements.mainImageInput) elements.mainImageInput.value = '';
    mostrarToast('Imagen principal eliminada', 'info');
}

// ========================================
// FUNCIÓN: handleMainImageUpload CON VALIDACIÓN
// ========================================
function handleMainImageUpload(file) {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        mostrarError(
            'Imagen demasiado grande',
            'La imagen no puede superar los 5MB. Tamaño actual: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB'
        );
        return;
    }
    
    var validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        mostrarError(
            'Formato no soportado',
            'Usa uno de estos formatos: JPG, PNG o WEBP.'
        );
        return;
    }
    
    var reader = new FileReader();
    reader.onload = function(e) {
        if (elements.mainPreviewImg) elements.mainPreviewImg.src = e.target.result;
        if (elements.mainImagePlaceholder) elements.mainImagePlaceholder.style.display = 'none';
        if (elements.mainImagePreview) elements.mainImagePreview.style.display = 'flex';
        currentMainImage = e.target.result;
        if (elements.imagenPrincipal) elements.imagenPrincipal.value = currentMainImage;
        mostrarExito('Imagen cargada', 'La imagen principal se ha cargado correctamente.');
    };
    reader.onerror = function() {
        mostrarError('Error al leer la imagen', 'No se pudo procesar la imagen. Intenta de nuevo.');
    };
    reader.readAsDataURL(file);
}

// ========================================
// FUNCIÓN: addGalleryImage CON VALIDACIÓN
// ========================================
function addGalleryImage(file) {
    if (galleryImages.length >= 8) {
        mostrarError(
            'Límite alcanzado',
            'Máximo 8 imágenes en la galería.'
        );
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        mostrarError(
            'Imagen demasiado grande',
            'La imagen no puede superar los 5MB.'
        );
        return;
    }
    
    var reader = new FileReader();
    reader.onload = function(e) {
        galleryImages.push(e.target.result);
        renderGallery();
        if (elements.galeriaImagenes) elements.galeriaImagenes.value = JSON.stringify(galleryImages);
        mostrarToast('🖼️ Imagen agregada a la galería', 'success');
    };
    reader.onerror = function() {
        mostrarError('Error al leer la imagen', 'No se pudo procesar la imagen.');
    };
    reader.readAsDataURL(file);
}

// ========================================
// FUNCIÓN: removeGalleryImage CON CONFIRMACIÓN
// ========================================
function removeGalleryImage(index) {
    mostrarConfirmacion(
        '¿Eliminar imagen de galería?',
        'Esta acción eliminará esta imagen de la galería.',
        'Sí, eliminar'
    ).then(function(result) {
        if (result.isConfirmed) {
            galleryImages.splice(index, 1);
            renderGallery();
            if (elements.galeriaImagenes) elements.galeriaImagenes.value = JSON.stringify(galleryImages);
            mostrarToast('Imagen eliminada de la galería', 'info');
        }
    });
}

// ========================================
// FUNCIÓN: renderGallery CON BOTÓN DE ELIMINAR MEJORADO
// ========================================
function renderGallery() {
    if (!elements.galleryGrid) return;
    
    if (galleryImages.length === 0) {
        elements.galleryGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px 20px; color: var(--outlet-text-variant);"><span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 8px; opacity: 0.3;">image</span>No hay imágenes en la galería</div>';
        return;
    }
    
    var html = '';
    galleryImages.forEach(function(img, index) {
        html += '<div class="outlet-gallery-item">';
        html += '<img src="' + img + '" alt="Gallery ' + (index + 1) + '">';
        html += '<button type="button" class="outlet-remove-gallery-img" data-index="' + index + '" title="Eliminar imagen">';
        html += '<span class="material-symbols-outlined" style="font-size: 14px;">close</span>';
        html += '</button>';
        html += '</div>';
    });
    elements.galleryGrid.innerHTML = html;
    
    document.querySelectorAll('.outlet-remove-gallery-img').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var index = parseInt(this.dataset.index);
            removeGalleryImage(index);
        });
    });
}

// ========================================
// FUNCIONES: addColor, addTalla, addMaterial CON MEJORES MENSAJES
// ========================================
function addColor() {
    var color = elements.colorInput?.value.trim();
    if (!color) {
        mostrarError('Campo vacío', 'Ingresa un color para agregarlo.');
        return;
    }
    if (coloresArray.includes(color)) {
        mostrarError('Color duplicado', 'El color "' + color + '" ya está agregado.');
        return;
    }
    coloresArray.push(color);
    renderizarColores();
    if (elements.colorInput) elements.colorInput.value = '';
    mostrarToast('🎨 ' + color + ' agregado', 'success');
}

function addTalla() {
    var talla = elements.tallaInput?.value.trim().toUpperCase();
    if (!talla) {
        mostrarError('Campo vacío', 'Ingresa una talla para agregarla.');
        return;
    }
    if (tallasArray.includes(talla)) {
        mostrarError('Talla duplicada', 'La talla "' + talla + '" ya está agregada.');
        return;
    }
    tallasArray.push(talla);
    renderizarTallas();
    if (elements.tallaInput) elements.tallaInput.value = '';
    mostrarToast('📏 ' + talla + ' agregada', 'success');
}

function addMaterial() {
    var material = elements.materialInput?.value.trim();
    if (!material) {
        mostrarError('Campo vacío', 'Ingresa un material para agregarlo.');
        return;
    }
    if (materialesArray.includes(material)) {
        mostrarError('Material duplicado', 'El material "' + material + '" ya está agregado.');
        return;
    }
    materialesArray.push(material);
    renderizarMateriales();
    if (elements.materialInput) elements.materialInput.value = '';
    mostrarToast('🧵 ' + material + ' agregado', 'success');
}

// ========================================
// FUNCIÓN: actualizarPrecioFinal
// ========================================
function actualizarPrecioFinal() {
    var precioVenta = parseFloat(elements.precioVenta?.value) || 0;
    var descuento = parseFloat(elements.descuento?.value) || 0;
    var precioFinal = precioVenta;
    if (descuento > 0 && descuento <= 90) {
        precioFinal = precioVenta * (1 - descuento / 100);
    }
    if (elements.precioFinal) {
        elements.precioFinal.textContent = '€' + precioFinal.toFixed(2);
    }
}

// ========================================
// FUNCIONES DE RENDERIZADO
// ========================================
function renderizarColores() {
    if (!elements.coloresList) return;
    var html = '';
    coloresArray.forEach(function(color, index) {
        html += '<span class="outlet-tag">';
        html += color;
        html += '<span class="outlet-remove-tag" data-index="' + index + '" data-type="color">✕</span>';
        html += '</span>';
    });
    elements.coloresList.innerHTML = html;
    
    document.querySelectorAll('.outlet-remove-tag[data-type="color"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            coloresArray.splice(index, 1);
            renderizarColores();
            if (elements.coloresHidden) elements.coloresHidden.value = JSON.stringify(coloresArray);
        });
    });
    if (elements.coloresHidden) elements.coloresHidden.value = JSON.stringify(coloresArray);
}

function renderizarTallas() {
    if (!elements.tallasList) return;
    var html = '';
    tallasArray.forEach(function(talla, index) {
        html += '<span class="outlet-tag">';
        html += talla;
        html += '<span class="outlet-remove-tag" data-index="' + index + '" data-type="talla">✕</span>';
        html += '</span>';
    });
    elements.tallasList.innerHTML = html;
    
    document.querySelectorAll('.outlet-remove-tag[data-type="talla"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            tallasArray.splice(index, 1);
            renderizarTallas();
            if (elements.tallasHidden) elements.tallasHidden.value = JSON.stringify(tallasArray);
        });
    });
    if (elements.tallasHidden) elements.tallasHidden.value = JSON.stringify(tallasArray);
}

function renderizarMateriales() {
    if (!elements.materialesList) return;
    var html = '';
    materialesArray.forEach(function(material, index) {
        html += '<span class="outlet-tag">';
        html += material;
        html += '<span class="outlet-remove-tag" data-index="' + index + '" data-type="material">✕</span>';
        html += '</span>';
    });
    elements.materialesList.innerHTML = html;
    
    document.querySelectorAll('.outlet-remove-tag[data-type="material"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            materialesArray.splice(index, 1);
            renderizarMateriales();
            if (elements.materialesHidden) elements.materialesHidden.value = JSON.stringify(materialesArray);
        });
    });
    if (elements.materialesHidden) elements.materialesHidden.value = JSON.stringify(materialesArray);
}

// ========================================
// WIZARD / CARRUSEL
// ========================================
function updateWizardUI() {
    elements.stepItems.forEach(function(step, idx) {
        if (idx + 1 === currentStep) step.classList.add('active');
        else step.classList.remove('active');
    });
    if (elements.stepCurrent) elements.stepCurrent.textContent = currentStep;
    
    if (currentStep === 3) {
        if (elements.navButtons) elements.navButtons.style.display = 'none';
        if (elements.actionButtons) elements.actionButtons.style.display = 'flex';
    } else {
        if (elements.navButtons) elements.navButtons.style.display = 'flex';
        if (elements.actionButtons) elements.actionButtons.style.display = 'none';
    }
    
    if (elements.prevBtn) elements.prevBtn.disabled = currentStep === 1;
}

function cambiarPanel(direction) {
    if (isTransitioning) return;
    
    var currentPanel = document.querySelector('.outlet-carousel-panel.active');
    var currentIndex = Array.from(elements.panels).indexOf(currentPanel);
    var newIndex = currentIndex + direction;
    
    if (newIndex < 0 || newIndex >= elements.panels.length) return;
    
    isTransitioning = true;
    var newPanel = elements.panels[newIndex];
    
    currentPanel.style.animation = 'outletFadeOutDown 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
    
    setTimeout(function() {
        currentPanel.classList.remove('active');
        currentPanel.style.animation = '';
        newPanel.classList.add('active');
        newPanel.style.animation = 'outletFadeInUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
        
        currentStep = newIndex + 1;
        updateWizardUI();
        setTimeout(function() { isTransitioning = false; }, 300);
    }, 300);
}

function nextStep() { if (currentStep < 3) cambiarPanel(1); }
function prevStep() { if (currentStep > 1) cambiarPanel(-1); }

// ========================================
// FUNCIONES DE CATEGORÍAS
// ========================================
function populateCategorySelect() {
    if (!elements.categoria) return;
    
    var currentValue = elements.categoria.value;
    
    while (elements.categoria.options.length > 1) {
        elements.categoria.remove(1);
    }
    
    categoriesList.forEach(function(cat) {
        var option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        elements.categoria.appendChild(option);
    });
    
    if (currentValue && categoriesList.some(function(c) { return c.id === currentValue; })) {
        elements.categoria.value = currentValue;
    } else if (categoriesList.length > 0) {
        elements.categoria.value = categoriesList[0].id;
    }
}

function populateCategorySelectFallback() {
    if (!elements.categoria) return;
    if (elements.categoria.options.length > 1) return;
    
    var fallbackOptions = [
        { value: 'ropa', label: 'Ropa' },
        { value: 'calzado', label: 'Calzado' },
        { value: 'accesorios', label: 'Accesorios' }
    ];
    
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
    
    while (elements.subcategoria.options.length > 1) {
        elements.subcategoria.remove(1);
    }
    
    subNames.forEach(function(name) {
        var option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        elements.subcategoria.appendChild(option);
    });
    
    if (subNames.length > 0) {
        elements.subcategoria.value = subNames[0];
    }
}

function handleCategoryChange() {
    var selectedCategory = elements.categoria?.value;
    if (selectedCategory) {
        updateSubcategories(selectedCategory);
    }
}

// ========================================
// FUNCIÓN: recolectarDatosProducto
// ========================================
function recolectarDatosProducto() {
    return {
        sku: elements.sku?.value || '',
        nombre: elements.nombre?.value || '',
        descripcion: elements.descripcion?.value || '',
        marca: elements.marca?.value || '',
        categoria: elements.categoria?.value || '',
        subcategoria: elements.subcategoria?.value || '',
        genero: elements.genero?.value || '',
        precioCompra: parseFloat(elements.precioCompra?.value) || 0,
        precioVenta: parseFloat(elements.precioVenta?.value) || 0,
        porcentajeDescuento: parseFloat(elements.descuento?.value) || 0,
        imagenPrincipal: currentMainImage,
        galeriaImagenes: galleryImages,
        colores: coloresArray,
        tallas: tallasArray,
        materiales: materialesArray,
        temporada: elements.temporada?.value || '',
        tipoAjuste: elements.tipoAjuste?.value || '',
        composicion: elements.composicion?.value || '',
        peso: elements.peso?.value ? parseInt(elements.peso.value) : null,
        stock: parseInt(elements.stock?.value) || 0,
        estado: elements.estado?.value || 'activo',
        destacado: elements.destacado?.checked || false
    };
}

// ========================================
// FUNCIÓN: irAHomeAdmin - Redirige al home del admin
// ========================================
function irAHomeAdmin() {
    console.log('🔄 Redirigiendo a Home Admin...');
    
    // Intentar diferentes formas de redirección
    try {
        // 1. Si existe el sistema de navegación SPA
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/homeAdmin');
            return;
        }
        
        // 2. Probar con la ruta relativa desde la ubicación actual
        var currentPath = window.location.pathname;
        console.log('📍 Ruta actual:', currentPath);
        
        // Si estamos en /public/createProducts.html o similar
        if (currentPath.includes('/createProducts')) {
            window.location.href = '/homeAdmin.html';
            return;
        }
        
        // 3. Probar con la ruta desde la raíz
        window.location.href = '/homeAdmin.html';
        
    } catch (error) {
        console.error('❌ Error al redirigir:', error);
        // Fallback: usar la ruta más simple
        window.location.href = 'homeAdmin.html';
    }
}

// ========================================
// EVENT LISTENERS
// ========================================
function initEventListeners() {
    // Navegación
    elements.prevBtn?.addEventListener('click', prevStep);
    elements.nextBtn?.addEventListener('click', nextStep);
    elements.stepItems?.forEach(function(step, idx) {
        step.addEventListener('click', function() {
            var stepNum = parseInt(this.dataset.step);
            if (stepNum > currentStep) {
                while (currentStep < stepNum) cambiarPanel(1);
            } else if (stepNum < currentStep) {
                while (currentStep > stepNum) cambiarPanel(-1);
            }
        });
    });
    
    // Botones de acción
    elements.clearBtn?.addEventListener('click', limpiarFormulario);
    elements.saveBtn?.addEventListener('click', guardarProducto);
    
    // ✅ BOTÓN VOLVER - REDIRIGE A HOME ADMIN (con múltiples intentos)
    elements.backBtn?.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Verificar si hay datos sin guardar
        var tieneDatos = elements.sku?.value || 
                         elements.nombre?.value || 
                         currentMainImage || 
                         coloresArray.length > 0 || 
                         tallasArray.length > 0 ||
                         galleryImages.length > 0;
        
        if (tieneDatos) {
            mostrarAdvertencia(
                '¿Salir sin guardar?',
                'Tienes datos sin guardar. ¿Estás seguro de que quieres salir?',
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
    
    // Event listener para cambio de categoría
    elements.categoria?.addEventListener('change', handleCategoryChange);
    
    // Imagen principal
    elements.mainImageArea?.addEventListener('click', function() { elements.mainImageInput?.click(); });
    elements.mainImageInput?.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) handleMainImageUpload(e.target.files[0]);
    });
    elements.removeMainImageBtn?.addEventListener('click', removeMainImage);
    
    // Drag & drop
    elements.mainImageArea?.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (elements.mainImageArea) elements.mainImageArea.style.borderColor = 'var(--outlet-gold)';
    });
    elements.mainImageArea?.addEventListener('dragleave', function(e) {
        e.preventDefault();
        if (elements.mainImageArea) elements.mainImageArea.style.borderColor = '';
    });
    elements.mainImageArea?.addEventListener('drop', function(e) {
        e.preventDefault();
        if (elements.mainImageArea) elements.mainImageArea.style.borderColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleMainImageUpload(e.dataTransfer.files[0]);
    });
    
    // Galería
    elements.addGalleryBtn?.addEventListener('click', function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = function(e) {
            if (e.target.files) {
                Array.from(e.target.files).forEach(function(file) { addGalleryImage(file); });
            }
        };
        input.click();
    });
    
    // Tags
    elements.addColorBtn?.addEventListener('click', addColor);
    elements.addTallaBtn?.addEventListener('click', addTalla);
    elements.addMaterialBtn?.addEventListener('click', addMaterial);
    
    elements.colorInput?.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addColor(); } });
    elements.tallaInput?.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addTalla(); } });
    elements.materialInput?.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } });
    
    // Precios
    elements.precioVenta?.addEventListener('input', actualizarPrecioFinal);
    elements.descuento?.addEventListener('input', actualizarPrecioFinal);
}

// ========================================
// DARK MODE SYNC
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
// INICIALIZACIÓN
// ========================================
export async function productCreateController() {
    console.log('📝 Product Create Controller - Alta de prendas');
    
    cacheElements();
    actualizarPrecioFinal();
    renderizarColores();
    renderizarTallas();
    renderizarMateriales();
    renderGallery();
    syncDarkMode();
    updateWizardUI();
    
    await loadCategories();
    
    initEventListeners();
    
    console.log('✅ Product Create page loaded');
    console.log('📌 Para debug: window.location.pathname =', window.location.pathname);
}