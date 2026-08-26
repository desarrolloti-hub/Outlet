/* ========================================
   COLECCIÓN CONTROLLER - CUSTOMER (CON INYECCIÓN DE HTML)
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { ProductService } from '../../../services/productService.js';

// Datos de productos
var products = [];

// Configuración de la vista
var currentProducts = [];
var currentPage = 1;
var productsPerPage = 6;
var activeFilters = {
    size: "S",
    color: null,
    designers: [],
    maxPrice: 5000
};
var currentCollectionCategory = 'mujer';

function normalizeCollectionValue(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function resolveCollectionCategory(value) {
    const target = normalizeCollectionValue(value);
    const mapping = {
        mujer: { label: 'COLECCIÓN MUJER', aliases: ['mujer', 'women', 'woman', 'female', 'femenino'] },
        hombre: { label: 'COLECCIÓN HOMBRE', aliases: ['hombre', 'men', 'man', 'male', 'masculino'] },
        kids: { label: 'COLECCIÓN NIÑOS', aliases: ['kids', 'niños', 'ninos', 'kid', 'child', 'children', 'infantil'] }
    };

    const entry = Object.entries(mapping).find(([, config]) => config.aliases.includes(target));
    if (entry) {
        return { key: entry[0], label: entry[1].label };
    }

    return { key: 'mujer', label: 'COLECCIÓN MUJER' };
}

function normalizeProductForCollection(product) {
    const normalized = product || {};
    const tallaList = Array.isArray(normalized.tallas) && normalized.tallas.length
        ? normalized.tallas
        : (Array.isArray(normalized.size) ? normalized.size : ['S']);
    const colorList = Array.isArray(normalized.colores) && normalized.colores.length
        ? normalized.colores
        : (normalized.color ? [normalized.color] : ['black']);

    return {
        ...normalized,
        id: normalized.id || normalized.sku || Math.random().toString(36).slice(2),
        brand: normalized.marca || normalized.brand || 'OUTLET',
        name: normalized.nombre || normalized.name || 'Producto',
        price: Number(normalized.precioFinal ?? normalized.precioVenta ?? normalized.price ?? 0),
        image: normalized.imagenPrincipal || normalized.image || (Array.isArray(normalized.galeriaImagenes) ? normalized.galeriaImagenes[0] : ''),
        badge: normalized.destacado ? 'NUEVO' : null,
        size: tallaList,
        color: String(colorList[0] || 'black').toLowerCase(),
        designer: normalized.marca || normalized.designer || 'OUTLET'
    };
}

function matchesCollectionCategory(product, categoryKey) {
    const normalizedProduct = normalizeProductForCollection(product);
    const target = normalizeCollectionValue(categoryKey);
    const values = [
        normalizedProduct.genero,
        normalizedProduct.categoria,
        normalizedProduct.subcategoria,
        normalizedProduct.brand,
        normalizedProduct.name,
        normalizedProduct.designer
    ];

    return values.some((value) => {
        const safe = normalizeCollectionValue(value);
        if (!safe) return false;

        if (target === 'mujer') {
            return ['mujer', 'women', 'woman', 'female', 'femenino'].includes(safe) || /mujer|women|female|femenino/.test(safe);
        }

        if (target === 'hombre') {
            return ['hombre', 'men', 'man', 'male', 'masculino'].includes(safe) || /hombre|men|male|masculino/.test(safe);
        }

        return ['kids', 'niños', 'ninos', 'kid', 'children', 'child', 'infantil'].includes(safe) || /kids|niños|ninos|child|infantil/.test(safe);
    });
}

async function loadCollectionProducts() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const resolvedCategory = resolveCollectionCategory(category);
        currentCollectionCategory = resolvedCategory.key;

        const productList = await ProductService.getAll({ estado: 'activo' }, 'createdAt', 'desc', 500);
        const mappedProducts = (productList || []).map(normalizeProductForCollection);
        products = mappedProducts.filter((product) => matchesCollectionCategory(product, currentCollectionCategory));

        if (!products.length) {
            products = mappedProducts.filter((product) => {
                const genero = String(product.genero || '').toLowerCase();
                const categoria = String(product.categoria || '').toLowerCase();
                return genero.includes(currentCollectionCategory) || categoria.includes(currentCollectionCategory);
            });
        }

        currentProducts = products.slice(0);
        currentPage = 1;
        console.log(`📦 Productos cargados para ${resolvedCategory.label}:`, products.length);
    } catch (error) {
        console.error('❌ Error cargando productos de la colección:', error);
        products = [];
        currentProducts = [];
    }
}

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

    requestAnimationFrame(function () {
        toast.classList.add('show');
    });

    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 300);
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

// ========================================
// Carga de estilos CSS
// ========================================
function loadStyles() {
    if (document.querySelector('link[href*="coleccion.css"]')) return;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/coleccion.css';
    document.head.appendChild(link);
}

// ========================================
// Inyecta el HTML de la colección en el DOM
// ========================================
function injectCollectionHTML() {
    if (document.querySelector('.coleccion-main-container')) {
        console.log('✅ El HTML de la colección ya está en el DOM');
        return true;
    }

    console.log('📄 Inyectando HTML de la colección para CUSTOMER...');

    var appContainer = document.getElementById('app') ||
        document.getElementById('main-content') ||
        document.querySelector('main') ||
        document.body;

    var collectionHTML =
        '<main>' +
        '<section class="coleccion-hero" id="heroSection">' +
        '<img class="coleccion-hero-image" id="heroImage" alt="Colección" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzu-fRuH3Pr70TzycsyqNKTq0wqXUKhvqpLQnKFosRgYpTYaHmMbiZTuR6057YH9mzWy7zyvF1Nayn_vmpuWt228rSPkB3bVGEyC4luNmuFA8zLymzV9_rpVIqWLkjNVhRh4POKNi-dzukNMftMlKjV48nwZdx-9jPYUoHEnMtd8MZWvsGmBNKlC-J5JgvgvS3TqUQb2UxHyyvWUysvPjpJ45zalixovYZXI-e_wzrc3bs-6m3CrEzBx9xQSLKPeQO6fx0aggigfMd">' +
        '<div class="coleccion-hero-overlay">' +
        '<h2 class="coleccion-hero-title" id="heroTitle">COLECCIÓN MUJER</h2>' +
        '<div class="coleccion-hero-underline"></div>' +
        '</div>' +
        '</section>' +

        '<div class="coleccion-main-container">' +
        '<aside class="coleccion-sidebar">' +
        '<h3 class="coleccion-sidebar-title">FILTROS</h3>' +

        '<div class="coleccion-filter-group">' +
        '<p class="coleccion-filter-label">Talla</p>' +
        '<div class="coleccion-size-grid">' +
        '<button class="coleccion-size-btn" data-size="XS">XS</button>' +
        '<button class="coleccion-size-btn active" data-size="S">S</button>' +
        '<button class="coleccion-size-btn" data-size="M">M</button>' +
        '<button class="coleccion-size-btn" data-size="L">L</button>' +
        '<button class="coleccion-size-btn" data-size="XL">XL</button>' +
        '</div>' +
        '</div>' +

        '<div class="coleccion-filter-group">' +
        '<p class="coleccion-filter-label">Color</p>' +
        '<div class="coleccion-color-options">' +
        '<div class="coleccion-color-swatch black" data-color="black"></div>' +
        '<div class="coleccion-color-swatch white" data-color="white"></div>' +
        '<div class="coleccion-color-swatch gold" data-color="gold"></div>' +
        '<div class="coleccion-color-swatch blue" data-color="blue"></div>' +
        '<div class="coleccion-color-swatch brown" data-color="brown"></div>' +
        '</div>' +
        '</div>' +

        '<div class="coleccion-filter-group">' +
        '<p class="coleccion-filter-label">Diseñador</p>' +
        '<div class="coleccion-checkbox-group">' +
        '<label class="coleccion-checkbox-label">' +
        '<input type="checkbox" class="coleccion-checkbox" value="Maison Luxe">' +
        '<span>Maison Luxe</span>' +
        '</label>' +
        '<label class="coleccion-checkbox-label">' +
        '<input type="checkbox" class="coleccion-checkbox" value="Atelier Noir">' +
        '<span>Atelier Noir</span>' +
        '</label>' +
        '<label class="coleccion-checkbox-label">' +
        '<input type="checkbox" class="coleccion-checkbox" value="Ethereal Studio">' +
        '<span>Ethereal Studio</span>' +
        '</label>' +
        '</div>' +
        '</div>' +

        '<div class="coleccion-filter-group">' +
        '<p class="coleccion-filter-label">Rango de Precio</p>' +
        '<input type="range" class="coleccion-price-range" min="0" max="5000" value="2500">' +
        '<div class="coleccion-price-labels">' +
        '<span>0€</span>' +
        '<span>5000€</span>' +
        '</div>' +
        '</div>' +
        '</aside>' +

        '<section class="coleccion-products-section">' +
        '<div class="coleccion-products-header">' +
        '<p class="coleccion-results-count" id="resultsCount">Mostrando 6 de 6 productos</p>' +
        '<div class="coleccion-sort-container">' +
        '<span class="coleccion-sort-label">ORDENAR POR:</span>' +
        '<select class="coleccion-sort-select" id="sortSelect">' +
        '<option value="newest">RECIÉN LLEGADOS</option>' +
        '<option value="price-asc">PRECIO: MENOR A MAYOR</option>' +
        '<option value="price-desc">PRECIO: MAYOR A MENOR</option>' +
        '</select>' +
        '</div>' +
        '</div>' +

        '<div class="coleccion-product-grid" id="productGrid">' +
        '</div>' +

        '<div class="coleccion-pagination">' +
        '<button class="coleccion-pagination-btn" id="prevPage">' +
        '<span class="material-symbols-outlined">chevron_left</span>' +
        '</button>' +
        '<div class="coleccion-pagination-numbers" id="paginationNumbers"></div>' +
        '<button class="coleccion-pagination-btn" id="nextPage">' +
        '<span class="material-symbols-outlined">chevron_right</span>' +
        '</button>' +
        '</div>' +
        '</section>' +
        '</div>' +
        '</main>';

    appContainer.innerHTML = collectionHTML;

    var hasContent = document.querySelector('.coleccion-main-container') !== null;
    console.log('✅ HTML de la colección inyectado: ' + hasContent);

    return hasContent;
}

// ========================================
// Controller principal
// ========================================
export async function collectionCustomerController() {
    console.log('🛍️ Colección Controller CUSTOMER - Página de listado');

    var htmlInjected = injectCollectionHTML();
    if (!htmlInjected) {
        console.error('❌ Error al inyectar el HTML de la colección');
        return;
    }

    loadStyles();
    await loadCollectionProducts();
    initHero();
    renderProducts();
    initSizeFilters();
    initColorFilters();
    initDesignerFilters();
    initPriceFilter();
    initSorting();
    initPaginationButtons();
    initProductEvents();

    console.log('✅ Colección CUSTOMER cargada correctamente');
}

// ========================================
// Inicializa hero dinámico
// ========================================
function initHero() {
    var urlParams = new URLSearchParams(window.location.search);
    var category = urlParams.get('category');
    var heroTitle = document.getElementById('heroTitle');
    var resolvedCategory = resolveCollectionCategory(category);

    if (heroTitle) {
        heroTitle.textContent = resolvedCategory.label;
    }
}

// ========================================
// Formatear dinero
// ========================================
function formatMoney(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// ========================================
// Aplicar todos los filtros
// ========================================
function applyFilters() {
    var filtered = products.slice(0);

    if (activeFilters.size && activeFilters.size !== 'Única') {
        filtered = filtered.filter(function (p) { return p.size.includes(activeFilters.size); });
    }

    if (activeFilters.color) {
        filtered = filtered.filter(function (p) { return p.color === activeFilters.color; });
    }

    if (activeFilters.designers.length > 0) {
        filtered = filtered.filter(function (p) { return activeFilters.designers.includes(p.designer); });
    }

    filtered = filtered.filter(function (p) { return p.price <= activeFilters.maxPrice; });

    currentProducts = filtered;
    currentPage = 1;
    renderProducts();
}

// ========================================
// Renderizar productos
// ========================================
function renderProducts() {
    var grid = document.getElementById('productGrid');
    if (!grid) {
        console.error('❌ No se encontró #productGrid');
        return;
    }

    var totalProducts = currentProducts.length;
    var totalPages = Math.ceil(totalProducts / productsPerPage);
    var start = (currentPage - 1) * productsPerPage;
    var end = start + productsPerPage;
    var paginatedProducts = currentProducts.slice(start, end);

    var resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = 'Mostrando ' + paginatedProducts.length + ' de ' + totalProducts + ' productos';
    }

    var html = '';
    paginatedProducts.forEach(function (product) {
        var badgeHtml = '';
        if (product.badge) {
            badgeHtml = '<span class="coleccion-product-badge ' + (product.badge === 'EXCLUSIVO' ? 'exclusive' : '') + '">' + product.badge + '</span>';
        }

        html +=
            '<div class="coleccion-product-card" data-id="' + product.id + '">' +
            '<div class="coleccion-product-image-container">' +
            '<img class="coleccion-product-image" src="' + product.image + '" alt="' + product.name + '">' +
            badgeHtml +
            '<button class="coleccion-product-wishlist" data-id="' + product.id + '">' +
            '<span class="material-symbols-outlined">favorite</span>' +
            '</button>' +
            '</div>' +
            '<div class="coleccion-product-info">' +
            '<p class="coleccion-product-brand">' + product.brand + '</p>' +
            '<h4 class="coleccion-product-name">' + product.name + '</h4>' +
            '<p class="coleccion-product-price">' + formatMoney(product.price) + '</p>' +
            '</div>' +
            '</div>';
    });

    grid.innerHTML = html;
    renderPagination(totalPages);
    initProductEvents();
}

// ========================================
// Renderizar paginación
// ========================================
function renderPagination(totalPages) {
    var paginationNumbers = document.getElementById('paginationNumbers');
    if (!paginationNumbers) return;

    if (totalPages <= 1) {
        paginationNumbers.innerHTML = '';
        return;
    }

    var html = '';
    for (var i = 1; i <= Math.min(totalPages, 3); i++) {
        html += '<button class="coleccion-page-number ' + (i === currentPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }

    if (totalPages > 3) {
        html += '<span class="coleccion-page-dots">...</span>';
        html += '<button class="coleccion-page-number" data-page="' + totalPages + '">' + totalPages + '</button>';
    }

    paginationNumbers.innerHTML = html;

    document.querySelectorAll('.coleccion-page-number').forEach(function (btn) {
        btn.addEventListener('click', function () {
            currentPage = parseInt(this.getAttribute('data-page'));
            renderProducts();
        });
    });
}

// ========================================
// Inicializar botones de paginación
// ========================================
function initPaginationButtons() {
    var prevBtn = document.getElementById('prevPage');
    var nextBtn = document.getElementById('nextPage');

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            var totalPages = Math.ceil(currentProducts.length / productsPerPage);
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            var totalPages = Math.ceil(currentProducts.length / productsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
            }
        });
    }
}

// ========================================
// Inicializar filtros de talla
// ========================================
function initSizeFilters() {
    var sizeBtns = document.querySelectorAll('.coleccion-size-btn');
    sizeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            sizeBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            activeFilters.size = this.getAttribute('data-size');
            applyFilters();
        });
    });
}

// ========================================
// Inicializar filtros de color
// ========================================
function initColorFilters() {
    var colorSwatches = document.querySelectorAll('.coleccion-color-swatch');
    colorSwatches.forEach(function (swatch) {
        swatch.addEventListener('click', function () {
            var color = this.getAttribute('data-color');
            if (activeFilters.color === color) {
                activeFilters.color = null;
                this.style.transform = 'scale(1)';
            } else {
                activeFilters.color = color;
                colorSwatches.forEach(function (s) { s.style.transform = 'scale(1)'; });
                this.style.transform = 'scale(1.1)';
            }
            applyFilters();
        });
    });
}

// ========================================
// Inicializar filtros de diseñador
// ========================================
function initDesignerFilters() {
    var checkboxes = document.querySelectorAll('.coleccion-checkbox');
    checkboxes.forEach(function (cb) {
        cb.addEventListener('change', function () {
            var value = this.value;
            if (this.checked) {
                activeFilters.designers.push(value);
            } else {
                activeFilters.designers = activeFilters.designers.filter(function (d) { return d !== value; });
            }
            applyFilters();
        });
    });
}

// ========================================
// Inicializar filtro de precio
// ========================================
function initPriceFilter() {
    var priceRange = document.querySelector('.coleccion-price-range');
    if (priceRange) {
        priceRange.addEventListener('input', function (e) {
            activeFilters.maxPrice = parseInt(e.target.value);
            applyFilters();
        });
    }
}

// ========================================
// Inicializar ordenamiento
// ========================================
function initSorting() {
    var sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            var value = this.value;
            if (value === 'price-asc') {
                currentProducts.sort(function (a, b) { return a.price - b.price; });
            } else if (value === 'price-desc') {
                currentProducts.sort(function (a, b) { return b.price - a.price; });
            } else {
                var filtered = products.slice(0);
                if (activeFilters.size && activeFilters.size !== 'Única') {
                    filtered = filtered.filter(function (p) { return p.size.includes(activeFilters.size); });
                }
                if (activeFilters.color) {
                    filtered = filtered.filter(function (p) { return p.color === activeFilters.color; });
                }
                if (activeFilters.designers.length > 0) {
                    filtered = filtered.filter(function (p) { return activeFilters.designers.includes(p.designer); });
                }
                filtered = filtered.filter(function (p) { return p.price <= activeFilters.maxPrice; });
                currentProducts = filtered;
            }
            currentPage = 1;
            renderProducts();
        });
    }
}

// ========================================
// Inicializar eventos de productos
// ========================================
function initProductEvents() {
    var productCards = document.querySelectorAll('.coleccion-product-card');
    productCards.forEach(function (card) {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.coleccion-product-wishlist')) return;

            var productId = this.getAttribute('data-id');
            if (productId) {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/product/' + productId);
                } else {
                    window.location.href = '/product/' + productId;
                }
            }
        });
    });

    var wishlistBtns = document.querySelectorAll('.coleccion-product-wishlist');
    wishlistBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var productId = this.getAttribute('data-id');
            var product = products.find(function (p) { return p.id == productId; });
            if (product) {
                addToWishlist(product);
            }
        });
    });
}

// ========================================
// Agregar a wishlist CON SWEETALERT2
// ========================================
async function addToWishlist(product) {
    var wishlist = JSON.parse(localStorage.getItem('outlet_wishlist') || '[]');
    var exists = wishlist.some(function (item) { return item.id === product.id; });

    if (!exists) {
        wishlist.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image
        });
        localStorage.setItem('outlet_wishlist', JSON.stringify(wishlist));

        await mostrarExito(
            '¡Añadido a tu lista de deseos!',
            product.name + ' ha sido añadido a tu lista de deseos. ❤️'
        );
    } else {
        var result = await mostrarAdvertencia(
            'Ya está en tu lista de deseos',
            product.name + ' ya está en tu lista de deseos. ¿Quieres eliminarlo?',
            'Sí, eliminar'
        );

        if (result.isConfirmed) {
            wishlist = wishlist.filter(function (item) { return item.id !== product.id; });
            localStorage.setItem('outlet_wishlist', JSON.stringify(wishlist));
            await mostrarExito('Eliminado', product.name + ' ha sido eliminado de tu lista de deseos.');
        }
    }
}