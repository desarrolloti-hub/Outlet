/* ========================================
   PRODUCTS CONTROLLER - CUSTOMER (CON INYECCIÓN DE HTML)
   CON SWEETALERT2 INTEGRADO
   ======================================== */

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

// Clave para localStorage
var STORAGE_KEYS = {
    CART: 'outlet_cart',
    WISHLIST: 'outlet_wishlist'
};

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

            '<section class="ensemble-section">' +
                '<h2 class="ensemble-title">COMPLETA EL CONJUNTO</h2>' +
                '<div class="ensemble-grid">' +
                    '<div class="ensemble-card" data-id="ensemble1">' +
                        '<div class="ensemble-image">' +
                            '<img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwj2zYEHhhnr8os8c15ujR4ypzQ4q29EikILtR4YhWyvwFvdGB-SrJMy_IYzgmtuYpGnuLJsthroMkmm4g-EKLXzaMrGg_QvQ2VnJhBa84dMOdzSsgbNMtVTdEFQdXqK2Wo2XB_LwgBvOo2w0ZXPTC29Bkx2cmM3i-ctysgrvTpSPw2n_KtZ9IPaAqDNMEh2OLYnDUwRgmH0sVByHUnCUkcYpo9sR_RBLVZEkf0Hxkyyqs8AyaXx7CHbqdxyz8d3df9J68DyW-s9An" alt="Gotas Doradas Jerarquía">' +
                        '</div>' +
                        '<p class="ensemble-category">JOYERÍA</p>' +
                        '<h3 class="ensemble-name">Gotas Doradas Jerarquía</h3>' +
                        '<p class="ensemble-price">$450</p>' +
                    '</div>' +

                    '<div class="ensemble-card" data-id="ensemble2">' +
                        '<div class="ensemble-image">' +
                            '<img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9PGYuCZnjaGLE-4RbfLWlyt89ygxAB6B9UxuW6Atxth1aR_M_1ef7d48fR8okFw3TZkrAMsdWH-N_bREnx0zVI-0nHe5kSW3-TggVyB0jnTlVgjWUDsz4oKzILchLJW5Ws04j_w3k3pGhf3o_9Z0wMqiP1xxwIo425sHQk6A1X5G5-n0vXrp7mvk_xKVD_Lq3Q9wqNpcXR90KP4kAIG1jFgJysyaYwmVHc4ewnoeG23qxfNR39ZgnTtPc1cDcayTgsuwwyUPZ2wRe" alt="Tacón Obsidiana">' +
                        '</div>' +
                        '<p class="ensemble-category">CALZADO</p>' +
                        '<h3 class="ensemble-name">Tacón Obsidiana</h3>' +
                        '<p class="ensemble-price">$890</p>' +
                    '</div>' +

                    '<div class="ensemble-card" data-id="ensemble3">' +
                        '<div class="ensemble-image">' +
                            '<img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDY0LziiCJ3iFCNoy_6fp2h2AdwyYgmu47lV3chvwbPbEiYAwJpeKAdBhuVn_XYfyqkzuHkaIMOWFjTeQ8teVZka-q0sJKo2kP6zWFUEhySilI8OgATw6_NIcy4AV8TO29bFCdjcIN61DbiWgGsiFc5aBrFJWCimmiWjt0K71PJezQ_d9IFmQNNBfuWE0WchjqYp_hfZNfgzeTLkdxJaKUeg7GHfT5WCOtxcxDcCKKuHOQSq5RGSzpcqfykVzD_d5K3ZhIJq0W6f_V" alt="Bolso de Noche Noir">' +
                        '</div>' +
                        '<p class="ensemble-category">ACCESORIOS</p>' +
                        '<h3 class="ensemble-name">Bolso de Noche Noir</h3>' +
                        '<p class="ensemble-price">$1,100</p>' +
                    '</div>' +

                    '<div class="ensemble-card" data-id="ensemble4">' +
                        '<div class="ensemble-image">' +
                            '<img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-qLH9HoOAfcx6nl0wrsUEfGFqNOoUYGyWRxVeL0N9IZPaRfSliJkPByl7LM2wd1kdtjmWepu7eaHrDuRkNbTNiyOvMK_tbeyeV1zZfuwsALXmf0KOVfWh1y90ctyAazRcsYusTw4G4yf5gw_rwQ-WPws1HrqqlESf0X_7XKK3eHnNDaaehp0y9EZ8DuFuuvpdmjKtZ7kXX6nvkpeqPH3xaQwMLdWpYvEfsdY4EeoBkR3lFpnqhsh6vqZ2YsuCDzzHuIvzs2fEetcS" alt="Bufanda de Seda Gossamer">' +
                        '</div>' +
                        '<p class="ensemble-category">ACCESORIOS</p>' +
                        '<h3 class="ensemble-name">Bufanda de Seda Gossamer</h3>' +
                        '<p class="ensemble-price">$220</p>' +
                    '</div>' +
                '</div>' +
            '</section>' +
        '</main>';

    appContainer.innerHTML = productsHTML;

    var hasContent = document.querySelector('.products-main') !== null;
    console.log('✅ HTML del producto inyectado: ' + hasContent);
    
    return hasContent;
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
    loadThumbnails();
    initSizeSelection();
    initColorSelection();
    initActionButtons();
    initEnsembleCards();
    
    console.log('✅ Productos page CUSTOMER cargada correctamente');
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
        var total = cart.reduce(function(sum, item) { return sum + (item.quantity || 1); }, 0);
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
    
    THUMBNAILS.forEach(function(src, index) {
        var div = document.createElement('div');
        div.className = 'thumbnail';
        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Thumbnail ' + (index + 1);
        img.loading = 'lazy';
        img.onclick = function() {
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
    
    sizeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (this.classList.contains('disabled')) return;
            
            var size = this.getAttribute('data-size');
            selectedSize = size;
            
            if (sizeLabel) sizeLabel.textContent = size;
            
            sizeBtns.forEach(function(b) { b.classList.remove('active'); });
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
    
    colorBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var color = this.getAttribute('data-color');
            selectedColor = color;
            
            if (colorLabel) colorLabel.textContent = color;
            
            colorBtns.forEach(function(b) { b.classList.remove('active'); });
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
    var product = {
        id: Date.now(),
        name: 'The Noir Hierarchy Gown',
        size: selectedSize,
        color: selectedColor,
        price: 1250,
        quantity: 1,
        image: THUMBNAILS[0],
        dateAdded: new Date().toISOString()
    };
    
    cart.push(product);
    saveCart();
    
    await mostrarExito(
        '¡Añadido al carrito!',
        product.name + ' (' + selectedSize + ', ' + selectedColor + ') ha sido añadido correctamente.'
    );
    
    console.log('🛒 Carrito actualizado:', cart);
}

// ========================================
// Agrega producto a wishlist CON SWEETALERT2
// ========================================
async function addToWishlist() {
    var exists = wishlist.some(function(item) { return item.name === 'The Noir Hierarchy Gown'; });
    
    if (!exists) {
        wishlist.push({
            id: Date.now(),
            name: 'The Noir Hierarchy Gown',
            price: 1250,
            color: selectedColor,
            size: selectedSize,
            image: THUMBNAILS[0]
        });
        saveWishlist();
        
        await mostrarExito(
            '¡Añadido a wishlist!',
            'The Noir Hierarchy Gown ha sido añadido a tu lista de deseos. ❤️'
        );
    } else {
        var result = await mostrarAdvertencia(
            'Ya está en tu wishlist',
            'Este producto ya está en tu lista de deseos. ¿Quieres eliminarlo?',
            'Sí, eliminar'
        );
        
        if (result.isConfirmed) {
            wishlist = wishlist.filter(function(item) { return item.name !== 'The Noir Hierarchy Gown'; });
            saveWishlist();
            await mostrarExito('Eliminado', 'El producto ha sido eliminado de tu wishlist.');
        }
    }
    console.log('💖 Wishlist actualizada:', wishlist);
}

// ========================================
// Comparte el producto
// ========================================
async function shareProduct() {
    var url = window.location.href;
    var text = 'The Noir Hierarchy Gown - OUTLET';
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'OUTLET - The Noir Hierarchy Gown',
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
function initEnsembleCards() {
    var ensembleCards = document.querySelectorAll('.ensemble-card');
    
    ensembleCards.forEach(function(card) {
        card.addEventListener('click', async function() {
            var name = this.querySelector('.ensemble-name')?.textContent || 'Producto';
            var priceText = this.querySelector('.ensemble-price')?.textContent || '$0';
            var price = parseInt(priceText.replace('$', '').replace(',', ''));
            
            var result = await mostrarConfirmacion(
                '¿Agregar al carrito?',
                '¿Quieres añadir "' + name + '" a tu carrito por ' + priceText + '?',
                'Sí, agregar'
            );
            
            if (result.isConfirmed) {
                var ensembleProduct = {
                    id: Date.now(),
                    name: name,
                    price: price,
                    quantity: 1,
                    dateAdded: new Date().toISOString()
                };
                cart.push(ensembleProduct);
                saveCart();
                
                await mostrarExito(
                    '¡Añadido al carrito!',
                    name + ' ha sido añadido correctamente. 🛒'
                );
            }
        });
    });
}