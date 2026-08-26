/* ========================================
   PRODUCTS CONTROLLER - CUSTOMER (CON INYECCIÓN DE HTML)
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { ProductService } from '../../../services/productService.js';

// Configuración de imágenes
var THUMBNAILS = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA8g0Esh47Sv3yioog16MU7CKt8dLC1bT82o7Al5PeVetpq8PdqiOBE-wX6JP8tSUUIURV1TrNRgugKwi8OHPdbe1wRicQJ9LcpTnmOs9zTOzsc6dpLGDuF5ADvNgXx7qXJwpn33Xt83FE9HrCeK-wwQlH27lJOZSna1X7_d7O13JAQ8NZIIFTHUJHwg9bQL1ViRtKTAKPTkc1hqy7iEeJ216dPlGc_C-NrhPphR3LDYtNKqcYuCL0__IymvVZP6ie5VeR_aqekCOMM",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDXKbGmxF_ZnSN8YwkdM_VCOsXreEUpaok5Ma7e_a1-yjoMEjIACknTwVEobJSld-Uh9T0_ei6Z6m8ILyGrMbHB8GWbuQk_MX3ncldI6Qs1ePGrXXwqMwH6PQ3QnZ-mE3TMXU2XKVf7DihMHqprHrEmWN05xih_ZQiDLU0uqHLZ6qzl5iY5yqg-M_OhjR8hhk7PDHVVJrQNlstC86YwT96Ok6HxB3SxoreY0FV-lQqG_nGpUu1aGZresjVFc21eR1t36REuTKYEukCQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAV-B0a2s9LK2WGhCBR53fEwpsR_tZHlVK9Z8TrDLcUx1F5z821jyqDRdU13qKwE-dVOIXIp2MK3MOfkvjsowqoLaYb1cLnFT0rkp62wZ8U_tj-Tne5jfW2gfUepX0i6Fh9e1eddLa6sWl7uvpI_NBxuBqC0wSiZ0ZB83STw-GqFwwYzR7ByKlBXBExlbuRVJehgsraWbuFUz2qeW0OkTRBSA3IP42BXtfCBP_8kycZzZArgH4YvnvHd4NDU4VkcuiaMAq70q_ju3Am",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-2aV8shTdhfM5IkOyi25WpZJrRB8HQQC4-6pmPUWOyB6DirOst44_nDMMoL8wSNBGY9VHsMlo_KQkDWnG6bGnbhCmkrJIyf4zPQm5dlumyAnJ5bgcAoNa2cIhPk6RPl0ACzhjvoSaiF4qQtGlTbVUIUeubmpEqNwlI9mO974O2gAPgThlZT60mM2fCHy3orBH1tvJCXewpWzcnkGl0WIm6rsvc5zkviy15kQUx78_pC5bra0Qh2xI58vhM-oK6BZs3jH0v3gmaL9i"
];

// Estado de la aplicación
var selectedSize = 'S';
var selectedColor = 'NOIR';
var cart = [];
var wishlist = [];
var currentProduct = null; // Producto real cargado desde Firebase (loadProductFromId)

// Clave para localStorage
var STORAGE_KEYS = {
    CART: 'outlet_cart',
    WISHLIST: 'outlet_wishlist'
};

// ========================================
// UI Helpers - CON SWEETALERT2
// ========================================

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
        confirmButtonText: 'Aceptar',
        timer: 2200,
        timerProgressBar: true
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

// ========================================
// Controller principal
// ========================================
export async function productsCustumerController() {
    console.log('🛍️ Products Controller CUSTOMER - Página de producto');

    var htmlInjected = injectProductsHTML();
    if (!htmlInjected) {
        console.error('❌ Error al inyectar el HTML del producto');
        return;
    }

    loadStyles();
    loadStorage();
    syncProductIdDisplay();
    await loadProductFromId();
    loadThumbnails();
    initSizeSelection();
    initColorSelection();
    initActionButtons();
    await loadRelatedProducts();

    console.log('✅ Productos page CUSTOMER cargada correctamente');
}

function syncProductIdDisplay() {
    var productIdElement = document.getElementById('productIdDisplay');
    if (!productIdElement) return;

    var productId = getProductIdFromUrl() || localStorage.getItem('lastSelectedProductId') || 'N/A';

    productIdElement.textContent = productId;
    localStorage.setItem('lastSelectedProductId', productId);
}

function getProductIdFromUrl() {
    var pathname = window.location.pathname || '';
    var match = pathname.match(/^\/products(?:Customer)?\/([^/]+)$/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }

    var params = new URLSearchParams(window.location.search || '');
    return params.get('id');
}

async function loadProductFromId() {
    var productId = getProductIdFromUrl();

    if (!productId) {
        return;
    }

    try {
        var product = await ProductService.getById(productId);
        if (!product) {
            console.warn('⚠️ Producto no encontrado por id:', productId);
            return;
        }

        currentProduct = product;

        var titleElement = document.querySelector('.product-title');
        var priceElement = document.querySelector('.product-price');
        var descriptionElement = document.querySelector('.product-description');
        var mainImage = document.getElementById('mainImage');

        if (titleElement) titleElement.textContent = product.nombre || titleElement.textContent;
        if (priceElement) {
            var priceValue = Number(product.precioFinal ?? product.precioVenta ?? 0);
            priceElement.textContent = '$' + priceValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (descriptionElement) descriptionElement.textContent = product.descripcion || descriptionElement.textContent;
        if (mainImage) {
            var imageSrc = product.imagenPrincipal || (product.galeriaImagenes && product.galeriaImagenes[0]) || THUMBNAILS[0];
            mainImage.src = imageSrc;
            mainImage.alt = product.nombre || 'Producto';
        }

        var galleryImages = [];
        if (Array.isArray(product.galeriaImagenes) && product.galeriaImagenes.length) {
            galleryImages = product.galeriaImagenes;
        } else if (product.imagenPrincipal) {
            galleryImages = [product.imagenPrincipal];
        }

        if (galleryImages.length) {
            THUMBNAILS.length = 0;
            THUMBNAILS.push.apply(THUMBNAILS, galleryImages);
            loadThumbnails();
        }
    } catch (error) {
        console.error('❌ Error cargando el producto por ID:', error);
    }
}

// ========================================
// Carga datos desde localStorage
// ========================================
function loadStorage() {
    var savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    var savedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);

    if (savedCart) cart = JSON.parse(savedCart);
    if (savedWishlist) wishlist = JSON.parse(savedWishlist);
}

// ========================================
// Guarda el carrito en localStorage
// ========================================
function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    updateCartBadge();
}

// ========================================
// Guarda la wishlist en localStorage
// ========================================
function saveWishlist() {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
}

// ========================================
// Actualiza el badge del carrito en la navbar
// ========================================
function updateCartBadge() {
    var badge = document.querySelector('.cart-count');
    if (badge) {
        var total = cart.reduce(function (sum, item) { return sum + (item.quantity || 1); }, 0);
        badge.textContent = total;
        badge.style.opacity = total === 0 ? '0' : '1';
    }
}

// ========================================
// Carga las miniaturas de imágenes
// ========================================
function loadThumbnails() {
    var container = document.getElementById('thumbnailContainer');
    if (!container) {
        console.error('❌ No se encontró #thumbnailContainer');
        return;
    }

    container.innerHTML = '';

    THUMBNAILS.forEach(function (src, index) {
        var div = document.createElement('div');
        div.className = 'thumbnail';
        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Thumbnail ' + (index + 1);
        img.loading = 'lazy';
        img.onclick = function () {
            var mainImage = document.getElementById('mainImage');
            if (mainImage) mainImage.src = src;
        };
        div.appendChild(img);
        container.appendChild(div);
    });

    console.log('✅ ' + THUMBNAILS.length + ' miniaturas cargadas');
}

// ========================================
// Inicializa selección de tallas
// ========================================
function initSizeSelection() {
    var sizeBtns = document.querySelectorAll('.size-btn');
    var sizeLabel = document.getElementById('selectedSizeLabel');

    sizeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (this.classList.contains('disabled')) return;

            var size = this.getAttribute('data-size');
            selectedSize = size;

            if (sizeLabel) sizeLabel.textContent = size;

            sizeBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');

            mostrarToast('Talla ' + size + ' seleccionada', 'info');
        });
    });
}

// ========================================
// Inicializa selección de colores
// ========================================
function initColorSelection() {
    var colorBtns = document.querySelectorAll('.color-btn');
    var colorLabel = document.getElementById('selectedColorLabel');

    colorBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var color = this.getAttribute('data-color');
            selectedColor = color;

            if (colorLabel) colorLabel.textContent = color;

            colorBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');

            mostrarToast('Color ' + color + ' seleccionado', 'info');
        });
    });
}

// ========================================
// Inicializa botones de acción
// ========================================
function initActionButtons() {
    var addToBagBtn = document.getElementById('addToBagBtn');
    var wishlistBtn = document.getElementById('wishlistBtn');
    var shareBtn = document.getElementById('shareBtn');

    if (addToBagBtn) addToBagBtn.addEventListener('click', addToCart);
    if (wishlistBtn) wishlistBtn.addEventListener('click', addToWishlist);
    if (shareBtn) shareBtn.addEventListener('click', shareProduct);
}

// ========================================
// Agrega producto al carrito CON SWEETALERT2
// ========================================
async function addToCart() {
    var addToBagBtn = document.getElementById('addToBagBtn');
    var name = (currentProduct && currentProduct.nombre) ||
        document.querySelector('.product-title')?.textContent || 'Producto';
    var price = currentProduct
        ? Number(currentProduct.precioFinal ?? currentProduct.precioVenta ?? 0)
        : 1250;
    var image = (currentProduct && (currentProduct.imagenPrincipal ||
        (Array.isArray(currentProduct.galeriaImagenes) && currentProduct.galeriaImagenes[0]))) ||
        THUMBNAILS[0];
    var productId = (currentProduct && currentProduct.id) || getProductIdFromUrl();

    var product = {
        id: Date.now(),
        productId: productId,
        name: name,
        size: selectedSize,
        color: selectedColor,
        price: price,
        quantity: 1,
        image: image,
        dateAdded: new Date().toISOString()
    };

    // Deshabilitar el botón brevemente para evitar doble clic mientras se confirma
    if (addToBagBtn) addToBagBtn.disabled = true;

    try {
        cart.push(product);
        saveCart();

        mostrarToast(name + ' añadido a la bolsa 🛍️', 'success');

        await mostrarExito(
            '¡Añadido a la bolsa!',
            name + ' (' + selectedSize + ', ' + selectedColor + ') ha sido añadido correctamente.'
        );

        console.log('🛒 Carrito actualizado:', cart);
    } catch (error) {
        console.error('❌ Error al añadir al carrito:', error);
        await mostrarError('No se pudo añadir', 'Ocurrió un problema al añadir el producto a tu bolsa. Intenta de nuevo.');
    } finally {
        if (addToBagBtn) addToBagBtn.disabled = false;
    }
}

// ========================================
// Agrega producto a wishlist CON SWEETALERT2
// ========================================
async function addToWishlist() {
    var name = (currentProduct && currentProduct.nombre) ||
        document.querySelector('.product-title')?.textContent || 'Producto';
    var price = currentProduct
        ? Number(currentProduct.precioFinal ?? currentProduct.precioVenta ?? 0)
        : 1250;
    var image = (currentProduct && (currentProduct.imagenPrincipal ||
        (Array.isArray(currentProduct.galeriaImagenes) && currentProduct.galeriaImagenes[0]))) ||
        THUMBNAILS[0];
    var productId = (currentProduct && currentProduct.id) || getProductIdFromUrl();

    var exists = wishlist.some(function (item) { return item.productId === productId || item.name === name; });

    if (!exists) {
        wishlist.push({
            id: Date.now(),
            productId: productId,
            name: name,
            price: price,
            color: selectedColor,
            size: selectedSize,
            image: image
        });
        saveWishlist();

        mostrarToast(name + ' añadido a tu lista de deseos ❤️', 'success');
        await mostrarExito(
            '¡Añadido a tu lista de deseos!',
            name + ' ha sido añadido a tu lista de deseos. ❤️'
        );
    } else {
        var result = await mostrarAdvertencia(
            'Ya está en tu lista de deseos',
            'Este producto ya está en tu lista de deseos. ¿Quieres eliminarlo?',
            'Sí, eliminar'
        );

        if (result.isConfirmed) {
            wishlist = wishlist.filter(function (item) { return item.productId !== productId && item.name !== name; });
            saveWishlist();
            mostrarToast('Eliminado de tu lista de deseos', 'info');
            await mostrarExito('Eliminado', 'El producto ha sido eliminado de tu lista de deseos.');
        }
    }
    console.log('💖 Wishlist actualizada:', wishlist);
}

// ========================================
// Comparte el producto
// ========================================
async function shareProduct() {
    var url = window.location.href;
    var name = (currentProduct && currentProduct.nombre) ||
        document.querySelector('.product-title')?.textContent || 'Producto';
    var text = name + ' - OUTLET';

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'OUTLET - ' + name,
                text: text,
                url: url
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                copyToClipboard(url);
            }
        }
    } else {
        copyToClipboard(url);
    }
}

// ========================================
// Copia texto al portapapeles CON SWEETALERT2
// ========================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        await mostrarExito(
            '¡Enlace copiado!',
            'El enlace del producto ha sido copiado al portapapeles. 📋'
        );
    } catch (error) {
        await mostrarError(
            'Error al copiar',
            'No se pudo copiar el enlace. Intenta manualmente.'
        );
    }
}

// ========================================
// Inicializa las cards de ensemble CON SWEETALERT2
// ========================================
// ========================================
// "COMPLETA EL CONJUNTO" - Productos relacionados reales
// ========================================

async function loadRelatedProducts() {
    var grid = document.getElementById('ensembleGrid');
    var section = document.getElementById('ensembleSection');
    if (!grid) return;

    var productId = getProductIdFromUrl();
    console.log('🔎 [Ensemble] productId actual:', productId);
    if (!productId) {
        console.warn('⚠️ [Ensemble] No se detectó productId en la URL, se oculta la sección');
        if (section) section.style.display = 'none';
        return;
    }

    try {
        var relatedProducts = await ProductService.getRelatedProducts(productId, 4);
        console.log('🔎 [Ensemble] Productos relacionados obtenidos:', relatedProducts?.length || 0, relatedProducts);

        if (!relatedProducts || relatedProducts.length === 0) {
            console.warn('⚠️ [Ensemble] No hay productos relacionados (ni siquiera con fallback). Revisa que existan otros productos activos en la colección "productos".');
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = '';
        renderEnsembleCards(relatedProducts);
        initEnsembleCardsNavigation();
    } catch (error) {
        console.error('❌ [Ensemble] Error cargando productos relacionados:', error);
        if (section) section.style.display = 'none';
    }
}

function renderEnsembleCards(products) {
    var grid = document.getElementById('ensembleGrid');
    if (!grid) return;

    grid.innerHTML = products.map(function (product) {
        var image = product.imagenPrincipal ||
            (Array.isArray(product.galeriaImagenes) && product.galeriaImagenes[0]) ||
            THUMBNAILS[0];
        var priceValue = Number(product.precioFinal ?? product.precioVenta ?? 0);
        var priceLabel = '$' + priceValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        var categoryLabel = (product.categoria || 'PRODUCTO').toString().toUpperCase();
        var name = product.nombre || 'Producto';

        return (
            '<div class="ensemble-card" data-id="' + product.id + '" tabindex="0" role="button" aria-label="Ver detalle de ' + name + '">' +
            '<div class="ensemble-image">' +
            '<img src="' + image + '" alt="' + name + '">' +
            '</div>' +
            '<p class="ensemble-category">' + categoryLabel + '</p>' +
            '<h3 class="ensemble-name">' + name + '</h3>' +
            '<p class="ensemble-price">' + priceLabel + '</p>' +
            '</div>'
        );
    }).join('');
}

function initEnsembleCardsNavigation() {
    var grid = document.getElementById('ensembleGrid');
    if (!grid || grid.dataset.navBound === '1') return;
    grid.dataset.navBound = '1';

    function goToProduct(card) {
        var productId = card.getAttribute('data-id');
        if (!productId) return;
        window.location.href = '/productsCustomer/' + encodeURIComponent(productId);
    }

    grid.addEventListener('click', function (e) {
        var card = e.target.closest('.ensemble-card');
        if (!card) return;
        goToProduct(card);
    });

    // Soporte de teclado (accesibilidad) ya que las tarjetas son focuseables
    grid.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var card = e.target.closest('.ensemble-card');
        if (!card) return;
        e.preventDefault();
        goToProduct(card);
    });
}

// ========================================
// Carga de estilos CSS
// ========================================
function loadStyles() {
    if (document.querySelector('link[href*="products.css"]')) return;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/products.css';
    document.head.appendChild(link);
}

// ========================================
// Inyecta el HTML del producto en el DOM
// ========================================
function injectProductsHTML() {
    if (document.querySelector('.products-main')) {
        console.log('✅ El HTML del producto ya está en el DOM');
        return true;
    }

    console.log('📄 Inyectando HTML del producto para CUSTOMER...');

    var appContainer = document.getElementById('app') ||
        document.getElementById('main-content') ||
        document.querySelector('main') ||
        document.body;

    var productsHTML =
        '<main class="products-main">' +
        '<div class="outlet-breadcrumbs">' +
        '<a href="/" data-link>INICIO</a>' +
        '<span class="separator">›</span>' +
        '<a href="/category/women" data-link>MUJER</a>' +
        '<span class="separator">›</span>' +
        '<span>COLECCIÓN</span>' +
        '</div>' +

        '<div class="outlet-product-grid">' +
        '<div class="product-gallery">' +
        '<div class="main-image">' +
        '<img id="mainImage" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuCiwxZIm72yTydw1gOXrSiy8Q6xYOwd453QTXq46PTrh_lkJFVC4OogogoCMuevAUrcMs0QY2TMW1Th5ptrr_DYX_JQwH58A2qtTNEAdBQp1SMuf7vl3lImVl-u2mJ0xiG3xkzRHnessLrsUuI3kUq29_SB-hPhY-__BLy24_EOZk6-h2El0A2pz4WgX-0Jcm5r7Pp3Ssw-YhvS22pwbjbyCb9LwVyXn9qctuM7cTTPQ0hsWqfu-xxRe-kNEnYjcqGG7Z86bI2olR" alt="Vestido La Jerarquía Noir">' +
        '</div>' +
        '<div class="thumbnails" id="thumbnailContainer"></div>' +
        '</div>' +

        '<div class="product-info">' +
        '<h1 class="product-title">Vestido La Jerarquía Noir</h1>' +
        '<div class="product-id-box" style="margin-bottom: 1rem; padding: 0.5rem 0.75rem; background: #f6f0e6; border: 1px solid #e8d7b1; border-radius: 999px; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 12px; letter-spacing: 0.08em; color: #1f1b13; font-weight: 600;">' +
        'ID DEL PRODUCTO: <span id="productIdDisplay" style="color: #8e6b1d;">N/A</span>' +
        '</div>' +
        '<p class="product-price">$1,250.00</p>' +
        '<p class="product-description">Una obra maestra de la sastrería arquitectónica, el Vestido La Jerarquía Noir presenta seda italiana drapeada a mano y un corsé estructural que redefine la silueta. Cada pieza está elaborada en nuestro taller de París, garantizando un ajuste inigualable y un acabado de calidad patrimonial.</p>' +

        '<div class="option-group">' +
        '<div class="option-label">COLOR: <span id="selectedColorLabel">NEGRO</span></div>' +
        '<div class="color-options" id="colorOptions">' +
        '<button class="color-btn active" data-color="NOIR" style="background-color: #000000;"></button>' +
        '<button class="color-btn" data-color="GOLD" style="background-color: #ddab3b;"></button>' +
        '<button class="color-btn" data-color="BLUE" style="background-color: #194172;"></button>' +
        '</div>' +
        '</div>' +

        '<div class="option-group">' +
        '<div class="option-label">SELECCIONAR TALLA: <span id="selectedSizeLabel">S</span></div>' +
        '<div class="size-options" id="sizeOptions">' +
        '<button class="size-btn" data-size="XL">XL</button>' +
        '<button class="size-btn" data-size="L">L</button>' +
        '<button class="size-btn" data-size="M">M</button>' +
        '<button class="size-btn active" data-size="S">S</button>' +
        '<button class="size-btn" data-size="XS">XS</button>' +
        '</div>' +
        '</div>' +

        '<button id="addToBagBtn" class="outlet-btn-primary">AÑADIR A LA BOLSA</button>' +

        '<div class="action-links">' +
        '<button id="wishlistBtn" class="action-link">♡ GUARDAR EN LISTA DE DESEOS</button>' +
        '<button id="shareBtn" class="action-link">↗ COMPARTIR</button>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<section class="ensemble-section" id="ensembleSection">' +
        '<h2 class="ensemble-title">COMPLETA EL CONJUNTO</h2>' +
        '<div class="ensemble-grid" id="ensembleGrid"></div>' +
        '</section>' +
        '</main>';

    appContainer.innerHTML = productsHTML;

    var hasContent = document.querySelector('.products-main') !== null;
    console.log('✅ HTML del producto inyectado: ' + hasContent);

    return hasContent;
}