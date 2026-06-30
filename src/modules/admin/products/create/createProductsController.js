/* ========================================
   CREATE PRODUCT CONTROLLER - OUTLET ADMIN
   Controlador para dar de alta nuevas prendas
   Wizard de 3 pasos | Botones de navegación abajo
   RESPONSIVE: Se adapta a cualquier tamaño
   ======================================== */

import { ProductService } from '../../../../services/productService.js';
import { CategoryService } from '../../../../services/categoryService.js'; // 👈 NUEVA IMPORTACIÓN

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
let isLoading = false;  // Para evitar doble envío

// 👈 NUEVAS VARIABLES PARA CATEGORÍAS
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
// UI Helpers
// ========================================
function mostrarToast(mensaje, tipo = 'info') {
    const toastExistente = document.querySelector('.outlet-toast-notification');
    if (toastExistente) toastExistente.remove();
    
    const toast = document.createElement('div');
    toast.className = 'outlet-toast-notification';
    toast.textContent = mensaje;
    if (tipo === 'success') toast.style.borderLeftColor = 'var(--outlet-success)';
    if (tipo === 'error') toast.style.borderLeftColor = 'var(--outlet-danger)';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function actualizarPrecioFinal() {
    const precioVenta = parseFloat(elements.precioVenta?.value) || 0;
    const descuento = parseFloat(elements.descuento?.value) || 0;
    let precioFinal = precioVenta;
    if (descuento > 0 && descuento <= 90) {
        precioFinal = precioVenta * (1 - descuento / 100);
    }
    if (elements.precioFinal) {
        elements.precioFinal.textContent = `€${precioFinal.toFixed(2)}`;
    }
}

// ========================================
// 👈 NUEVA FUNCIÓN: CARGAR CATEGORÍAS DINÁMICAS
// ========================================
async function loadCategories() {
    try {
        console.log('🔄 Cargando categorías para el formulario...');
        categoriesList = await CategoryService.getAll({}, true);
        console.log(`✅ ${categoriesList.length} categorías cargadas`);
        
        // Construir mapa de subcategorías por categoría
        subcategoriesMap = {};
        categoriesList.forEach(cat => {
            const subNames = (cat.subcategories || []).map(sub => sub.name);
            subcategoriesMap[cat.id] = subNames;
        });
        
        // Poblar el select de categorías
        populateCategorySelect();
        
        // Si hay categorías, seleccionar la primera por defecto
        if (categoriesList.length > 0) {
            const firstCat = categoriesList[0];
            if (elements.categoria) {
                elements.categoria.value = firstCat.id;
                // Actualizar subcategorías para la primera categoría
                updateSubcategories(firstCat.id);
            }
        }
        
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarToast('Error al cargar categorías: ' + error.message, 'error');
        
        // Fallback: opciones estáticas por si falla la carga
        populateCategorySelectFallback();
    }
}

// 👈 NUEVA FUNCIÓN: POBLAR SELECT DE CATEGORÍAS
function populateCategorySelect() {
    if (!elements.categoria) return;
    
    // Guardar el valor seleccionado actual (si existe)
    const currentValue = elements.categoria.value;
    
    // Limpiar opciones existentes (excepto la primera opción vacía)
    while (elements.categoria.options.length > 1) {
        elements.categoria.remove(1);
    }
    
    // Agregar las categorías dinámicas
    categoriesList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        elements.categoria.appendChild(option);
    });
    
    // Restaurar selección si era válida
    if (currentValue && categoriesList.some(c => c.id === currentValue)) {
        elements.categoria.value = currentValue;
    } else if (categoriesList.length > 0) {
        elements.categoria.value = categoriesList[0].id;
    }
}

// 👈 NUEVA FUNCIÓN: FALLBACK ESTÁTICO
function populateCategorySelectFallback() {
    if (!elements.categoria) return;
    
    // Si ya hay opciones, no hacer nada
    if (elements.categoria.options.length > 1) return;
    
    const fallbackOptions = [
        { value: 'ropa', label: 'Ropa' },
        { value: 'calzado', label: 'Calzado' },
        { value: 'accesorios', label: 'Accesorios' }
    ];
    
    fallbackOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        elements.categoria.appendChild(option);
    });
}

// 👈 NUEVA FUNCIÓN: ACTUALIZAR SUBCATEGORÍAS
function updateSubcategories(categoryId) {
    if (!elements.subcategoria) return;
    
    const subNames = subcategoriesMap[categoryId] || [];
    
    // Limpiar opciones existentes (excepto la primera opción vacía)
    while (elements.subcategoria.options.length > 1) {
        elements.subcategoria.remove(1);
    }
    
    // Agregar las subcategorías
    subNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        elements.subcategoria.appendChild(option);
    });
    
    // Si hay subcategorías, seleccionar la primera
    if (subNames.length > 0) {
        elements.subcategoria.value = subNames[0];
    }
}

// 👈 NUEVA FUNCIÓN: MANEJAR CAMBIO DE CATEGORÍA
function handleCategoryChange() {
    const selectedCategory = elements.categoria?.value;
    if (selectedCategory) {
        updateSubcategories(selectedCategory);
    }
}

// ========================================
// Wizard / Carrusel
// ========================================
function updateWizardUI() {
    elements.stepItems.forEach((step, idx) => {
        if (idx + 1 === currentStep) step.classList.add('active');
        else step.classList.remove('active');
    });
    if (elements.stepCurrent) elements.stepCurrent.textContent = currentStep;
    
    // ===== CAMBIOS AQUÍ =====
    if (currentStep === 3) {
        // En paso 3: ocultar botones de navegación y mostrar solo Guardar
        if (elements.navButtons) {
            elements.navButtons.style.display = 'none';
        }
        if (elements.actionButtons) {
            elements.actionButtons.style.display = 'flex';
        }
    } else {
        // En pasos 1 y 2: mostrar navegación, ocultar botón Guardar
        if (elements.navButtons) {
            elements.navButtons.style.display = 'flex';
        }
        if (elements.actionButtons) {
            elements.actionButtons.style.display = 'none';
        }
    }
    
    if (elements.prevBtn) elements.prevBtn.disabled = currentStep === 1;
}

function cambiarPanel(direction) {
    if (isTransitioning) return;
    
    const currentPanel = document.querySelector('.outlet-carousel-panel.active');
    const currentIndex = Array.from(elements.panels).indexOf(currentPanel);
    const newIndex = currentIndex + direction;
    
    if (newIndex < 0 || newIndex >= elements.panels.length) return;
    
    isTransitioning = true;
    const newPanel = elements.panels[newIndex];
    
    currentPanel.style.animation = 'outletFadeOutDown 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
    
    setTimeout(() => {
        currentPanel.classList.remove('active');
        currentPanel.style.animation = '';
        newPanel.classList.add('active');
        newPanel.style.animation = 'outletFadeInUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
        
        currentStep = newIndex + 1;
        updateWizardUI();
        setTimeout(() => { isTransitioning = false; }, 300);
    }, 300);
}

function nextStep() { if (currentStep < 3) {cambiarPanel(1);}}
function prevStep() { if (currentStep > 1) cambiarPanel(-1); }

// ========================================
// Tags (Colores, Tallas, Materiales)
// ========================================
function renderizarColores() {
    if (!elements.coloresList) return;
    elements.coloresList.innerHTML = coloresArray.map((color, index) => `
        <span class="outlet-tag">
            ${color}
            <span class="outlet-remove-tag" data-index="${index}" data-type="color">✕</span>
        </span>
    `).join('');
    
    document.querySelectorAll('.outlet-remove-tag[data-type="color"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            coloresArray.splice(index, 1);
            renderizarColores();
            if (elements.coloresHidden) elements.coloresHidden.value = JSON.stringify(coloresArray);
        });
    });
    if (elements.coloresHidden) elements.coloresHidden.value = JSON.stringify(coloresArray);
}

function addColor() {
    const color = elements.colorInput?.value.trim();
    if (!color) { mostrarToast('Ingrese un color', 'error'); return; }
    if (coloresArray.includes(color)) { mostrarToast('Este color ya está agregado', 'error'); return; }
    coloresArray.push(color);
    renderizarColores();
    if (elements.colorInput) elements.colorInput.value = '';
    mostrarToast('Color agregado', 'success');
}

function renderizarTallas() {
    if (!elements.tallasList) return;
    elements.tallasList.innerHTML = tallasArray.map((talla, index) => `
        <span class="outlet-tag">
            ${talla}
            <span class="outlet-remove-tag" data-index="${index}" data-type="talla">✕</span>
        </span>
    `).join('');
    
    document.querySelectorAll('.outlet-remove-tag[data-type="talla"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            tallasArray.splice(index, 1);
            renderizarTallas();
            if (elements.tallasHidden) elements.tallasHidden.value = JSON.stringify(tallasArray);
        });
    });
    if (elements.tallasHidden) elements.tallasHidden.value = JSON.stringify(tallasArray);
}

function addTalla() {
    const talla = elements.tallaInput?.value.trim().toUpperCase();
    if (!talla) { mostrarToast('Ingrese una talla', 'error'); return; }
    if (tallasArray.includes(talla)) { mostrarToast('Esta talla ya está agregada', 'error'); return; }
    tallasArray.push(talla);
    renderizarTallas();
    if (elements.tallaInput) elements.tallaInput.value = '';
    mostrarToast('Talla agregada', 'success');
}

function renderizarMateriales() {
    if (!elements.materialesList) return;
    elements.materialesList.innerHTML = materialesArray.map((material, index) => `
        <span class="outlet-tag">
            ${material}
            <span class="outlet-remove-tag" data-index="${index}" data-type="material">✕</span>
        </span>
    `).join('');
    
    document.querySelectorAll('.outlet-remove-tag[data-type="material"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            materialesArray.splice(index, 1);
            renderizarMateriales();
            if (elements.materialesHidden) elements.materialesHidden.value = JSON.stringify(materialesArray);
        });
    });
    if (elements.materialesHidden) elements.materialesHidden.value = JSON.stringify(materialesArray);
}

function addMaterial() {
    const material = elements.materialInput?.value.trim();
    if (!material) { mostrarToast('Ingrese un material', 'error'); return; }
    if (materialesArray.includes(material)) { mostrarToast('Este material ya está agregado', 'error'); return; }
    materialesArray.push(material);
    renderizarMateriales();
    if (elements.materialInput) elements.materialInput.value = '';
    mostrarToast('Material agregado', 'success');
}

// ========================================
// Imágenes
// ========================================
function handleMainImageUpload(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { mostrarToast('La imagen no puede superar los 5MB', 'error'); return; }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { mostrarToast('Formato no soportado. Use JPG, PNG o WEBP', 'error'); return; }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        if (elements.mainPreviewImg) elements.mainPreviewImg.src = e.target.result;
        if (elements.mainImagePlaceholder) elements.mainImagePlaceholder.style.display = 'none';
        if (elements.mainImagePreview) elements.mainImagePreview.style.display = 'flex';
        currentMainImage = e.target.result;
        if (elements.imagenPrincipal) elements.imagenPrincipal.value = currentMainImage;
        mostrarToast('Imagen principal cargada', 'success');
    };
    reader.readAsDataURL(file);
}

function removeMainImage() {
    if (elements.mainImagePlaceholder) elements.mainImagePlaceholder.style.display = 'flex';
    if (elements.mainImagePreview) elements.mainImagePreview.style.display = 'none';
    if (elements.mainPreviewImg) elements.mainPreviewImg.src = '';
    currentMainImage = null;
    if (elements.imagenPrincipal) elements.imagenPrincipal.value = '';
    if (elements.mainImageInput) elements.mainImageInput.value = '';
    mostrarToast('Imagen principal eliminada', 'info');
}

function addGalleryImage(file) {
    if (galleryImages.length >= 8) { mostrarToast('Máximo 8 imágenes en la galería', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { mostrarToast('La imagen no puede superar los 5MB', 'error'); return; }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        galleryImages.push(e.target.result);
        renderGallery();
        if (elements.galeriaImagenes) elements.galeriaImagenes.value = JSON.stringify(galleryImages);
        mostrarToast('Imagen agregada a la galería', 'success');
    };
    reader.readAsDataURL(file);
}

function renderGallery() {
    if (!elements.galleryGrid) return;
    
    if (galleryImages.length === 0) {
        elements.galleryGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--outlet-text-variant);">No hay imágenes en la galería</div>';
        return;
    }
    
    elements.galleryGrid.innerHTML = galleryImages.map((img, index) => `
        <div class="outlet-gallery-item">
            <img src="${img}" alt="Gallery ${index + 1}">
            <button type="button" class="outlet-remove-gallery-img" data-index="${index}">✕</button>
        </div>
    `).join('');
    
    document.querySelectorAll('.outlet-remove-gallery-img').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            galleryImages.splice(index, 1);
            renderGallery();
            if (elements.galeriaImagenes) elements.galeriaImagenes.value = JSON.stringify(galleryImages);
            mostrarToast('Imagen eliminada de la galería', 'info');
        });
    });
}

// ========================================
// Formulario - SOLO RECOLECTA DATOS, NO VALIDA
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

function limpiarFormulario() {
    // Limpiar inputs
    if (elements.sku) elements.sku.value = '';
    if (elements.nombre) elements.nombre.value = '';
    if (elements.descripcion) elements.descripcion.value = '';
    if (elements.marca) elements.marca.value = '';
    // 👈 NO LIMPIAMOS categoría y subcategoría para mantenerlas
    if (elements.genero) elements.genero.value = '';
    
    if (elements.precioCompra) elements.precioCompra.value = '';
    if (elements.precioVenta) elements.precioVenta.value = '';
    if (elements.descuento) elements.descuento.value = '0';
    
    if (elements.temporada) elements.temporada.value = '';
    if (elements.tipoAjuste) elements.tipoAjuste.value = '';
    if (elements.composicion) elements.composicion.value = '';
    if (elements.peso) elements.peso.value = '';
    if (elements.stock) elements.stock.value = '0';
    if (elements.estado) elements.estado.value = 'activo';
    if (elements.destacado) elements.destacado.checked = false;
    
    // Limpiar arrays y tags
    coloresArray = [];
    tallasArray = [];
    materialesArray = [];
    renderizarColores();
    renderizarTallas();
    renderizarMateriales();
    
    // Limpiar imágenes
    removeMainImage();
    galleryImages = [];
    renderGallery();
    if (elements.galeriaImagenes) elements.galeriaImagenes.value = '';
    
    actualizarPrecioFinal();
    mostrarToast('Formulario limpiado', 'success');
}

// ========================================
// Guardar producto usando ProductService
// ========================================
async function guardarProducto() {
    // Evitar doble envío
    if (isLoading) return;
    
    // Verificar campos obligatorios SOLO a nivel de UI (para saber en qué paso está el usuario)
    // NOTA: La validación REAL la hará el service
    if (!elements.sku?.value || !elements.nombre?.value || !elements.descripcion?.value || 
        !elements.marca?.value || !elements.categoria?.value || !elements.genero?.value) {
        mostrarToast('Complete los campos del paso 1 antes de guardar', 'error');
        if (currentStep !== 1) cambiarPanel(-(currentStep - 1));
        return;
    }
    
    if (!currentMainImage) {
        mostrarToast('Agregue una imagen principal', 'error');
        if (currentStep !== 1) cambiarPanel(-(currentStep - 1));
        return;
    }
    
    if (!elements.precioCompra?.value || !elements.precioVenta?.value) {
        mostrarToast('Complete los precios del paso 2', 'error');
        if (currentStep !== 2) {
            if (currentStep > 2) cambiarPanel(-(currentStep - 2));
            else cambiarPanel(1);
        }
        return;
    }
    
    isLoading = true;
    const btn = elements.saveBtn;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Guardando...';
    btn.disabled = true;
    
    try {
        // Obtener datos del formulario
        const productData = recolectarDatosProducto();
        
        // 👇 EL SERVICE VALIDA Y EL REPOSITORY GUARDA
        const productoGuardado = await ProductService.create(productData);
        
        mostrarToast(`✅ Producto "${productoGuardado.nombre}" guardado exitosamente`, 'success');
        
        // Limpiar formulario para siguiente producto
        limpiarFormulario();
        
        // Restaurar categorías después de limpiar
        if (categoriesList.length > 0) {
            const firstCat = categoriesList[0];
            if (elements.categoria) {
                elements.categoria.value = firstCat.id;
                updateSubcategories(firstCat.id);
            }
        }
        
    } catch (error) {
        console.error('Error al guardar producto:', error);
        mostrarToast(`❌ ${error.message}`, 'error');
    } finally {
        isLoading = false;
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // Navegación
    elements.prevBtn?.addEventListener('click', prevStep);
    elements.nextBtn?.addEventListener('click', nextStep);
    elements.stepItems?.forEach((step, idx) => {
        step.addEventListener('click', () => {
            const stepNum = parseInt(step.dataset.step);
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
    elements.backBtn?.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin/productos');
        } else {
            window.history.back();
        }
    });
    
    // 👈 NUEVO: Event listener para cambio de categoría
    elements.categoria?.addEventListener('change', handleCategoryChange);
    
    // Imagen principal
    elements.mainImageArea?.addEventListener('click', () => elements.mainImageInput?.click());
    elements.mainImageInput?.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) handleMainImageUpload(e.target.files[0]);
    });
    elements.removeMainImageBtn?.addEventListener('click', removeMainImage);
    
    // Drag & drop para imagen principal
    elements.mainImageArea?.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (elements.mainImageArea) elements.mainImageArea.style.borderColor = 'var(--outlet-gold)';
    });
    elements.mainImageArea?.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (elements.mainImageArea) elements.mainImageArea.style.borderColor = '';
    });
    elements.mainImageArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        if (elements.mainImageArea) elements.mainImageArea.style.borderColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleMainImageUpload(e.dataTransfer.files[0]);
    });
    
    // Galería
    elements.addGalleryBtn?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if (e.target.files && e.target.files[0]) addGalleryImage(e.target.files[0]);
        };
        input.click();
    });
    
    // Tags
    elements.addColorBtn?.addEventListener('click', addColor);
    elements.addTallaBtn?.addEventListener('click', addTalla);
    elements.addMaterialBtn?.addEventListener('click', addMaterial);
    
    elements.colorInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } });
    elements.tallaInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTalla(); } });
    elements.materialInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } });
    
    // Precios
    elements.precioVenta?.addEventListener('input', actualizarPrecioFinal);
    elements.descuento?.addEventListener('input', actualizarPrecioFinal);
}

// ========================================
// Dark mode sync
// ========================================
function syncDarkMode() {
    if (window.OUTLETNav && typeof window.OUTLETNav.getTheme === 'function') {
        const navDark = window.OUTLETNav.getTheme();
        if (navDark && !document.body.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
        } else if (!navDark && document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
        }
    }
}

document.addEventListener('themeChanged', (e) => {
    if (e.detail.isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
});

// ========================================
// Inicialización
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
    
    // 👈 CARGAR CATEGORÍAS DINÁMICAS ANTES DE LOS EVENT LISTENERS
    await loadCategories();
    
    initEventListeners();
    
    console.log('✅ Product Create page loaded');
}