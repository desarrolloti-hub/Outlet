/* ========================================
   PRODUCTS CONTROLLER - CUSTOMER (CON INYECCIÓN DE HTML)
   ======================================== */

// Configuración de imágenes
const THUMBNAILS = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA8g0Esh47Sv3yioog16MU7CKt8dLC1bT82o7Al5PeVetpq8PdqiOBE-wX6JP8tSUUIURV1TrNRgugKwi8OHPdbe1wRicQJ9LcpTnmOs9zTOzsc6dpLGDuF5ADvNgXx7qXJwpn33Xt83FE9HrCeK-wwQlH27lJOZSna1X7_d7O13JAQ8NZIIFTHUJHwg9bQL1ViRtKTAKPTkc1hqy7iEeJ216dPlGc_C-NrhPphR3LDYtNKqcYuCL0__IymvVZP6ie5VeR_aqekCOMM",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDXKbGmxF_ZnSN8YwkdM_VCOsXreEUpaok5Ma7e_a1-yjoMEjIACknTwVEobJSld-Uh9T0_ei6Z6m8ILyGrMbHB8GWbuQk_MX3ncldI6Qs1ePGrXXwqMwH6PQ3QnZ-mE3TMXU2XKVf7DihMHqprHrEmWN05xih_ZQiDLU0uqHLZ6qzl5iY5yqg-M_OhjR8hhk7PDHVVJrQNlstC86YwT96Ok6HxB3SxoreY0FV-lQqG_nGpUu1aGZresjVFc21eR1t36REuTKYEukCQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAV-B0a2s9LK2WGhCBR53fEwpsR_tZHlVK9Z8TrDLcUx1F5z821jyqDRdU13qKwE-dVOIXIp2MK3MOfkvjsowqoLaYb1cLnFT0rkp62wZ8U_tj-Tne5jfW2gfUepX0i6Fh9e1eddLa6sWl7uvpI_NBxuBqC0wSiZ0ZB83STw-GqFwwYzR7ByKlBXBExlbuRVJehgsraWbuFUz2qeW0OkTRBSA3IP42BXtfCBP_8kycZzZArgH4YvnvHd4NDU4VkcuiaMAq70q_ju3Am",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-2aV8shTdhfM5IkOyi25WpZJrRB8HQQC4-6pmPUWOyB6DirOst44_nDMMoL8wSNBGY9VHsMlo_KQkDWnG6bGnbhCmkrJIyf4zPQm5dlumyAnJ5bgcAoNa2cIhPk6RPl0ACzhjvoSaiF4qQtGlTbVUIUeubmpEqNwlI9mO974O2gAPgThlZT60mM2fCHy3orBH1tvJCXewpWzcnkGl0WIm6rsvc5zkviy15kQUx78_pC5bra0Qh2xI58vhM-oK6BZs3jH0v3gmaL9i"
];

// Estado de la aplicación
let selectedSize = 'S';
let selectedColor = 'NOIR';
let cart = [];
let wishlist = [];

// Clave para localStorage - USA LA MISMA QUE EL VISITOR
const STORAGE_KEYS = {
    CART: 'outlet_cart',  // ← MISMA para visitor y customer
    WISHLIST: 'outlet_wishlist'
};

/**
 * Carga los estilos CSS de la página
 */
function loadStyles() {
    if (document.querySelector('link[href*="products.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/products.css';
    document.head.appendChild(link);
}

/**
 * Inyecta el HTML del producto en el DOM
 */
function injectProductsHTML() {
    // Verifica si el contenedor ya existe
    if (document.querySelector('.products-main')) {
        console.log('✅ El HTML del producto ya está en el DOM');
        return true;
    }

    console.log('📄 Inyectando HTML del producto para CUSTOMER...');

    // Busca dónde insertar
    const appContainer = document.getElementById('app') || 
                        document.getElementById('main-content') || 
                        document.querySelector('main') || 
                        document.body;

    // HTML del producto
    const productsHTML = `
        <main class="products-main">
            <!-- Migas de pan -->
            <div class="outlet-breadcrumbs">
                <a href="/" data-link>INICIO</a>
                <span class="separator">›</span>
                <a href="/category/women" data-link>MUJER</a>
                <span class="separator">›</span>
                <span>COLECCIÓN</span>
            </div>

            <!-- Grid principal producto -->
            <div class="outlet-product-grid">
                
                <!-- COLUMNA IZQUIERDA: Imagen principal + miniaturas -->
                <div class="product-gallery">
                    <div class="main-image">
                        <img id="mainImage" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuCiwxZIm72yTydw1gOXrSiy8Q6xYOwd453QTXq46PTrh_lkJFVC4OogogoCMuevAUrcMs0QY2TMW1Th5ptrr_DYX_JQwH58A2qtTNEAdBQp1SMuf7vl3lImVl-u2mJ0xiG3xkzRHnessLrsUuI3kUq29_SB-hPhY-__BLy24_EOZk6-h2El0A2pz4WgX-0Jcm5r7Pp3Ssw-YhvS22pwbjbyCb9LwVyXn9qctuM7cTTPQ0hsWqfu-xxRe-kNEnYjcqGG7Z86bI2olR" alt="Vestido La Jerarquía Noir">
                    </div>
                    <div class="thumbnails" id="thumbnailContainer"></div>
                </div>

                <!-- COLUMNA DERECHA: Información del producto -->
                <div class="product-info">
                    <h1 class="product-title">Vestido La Jerarquía Noir</h1>
                    <p class="product-price">$1,250.00</p>
                    
                    <p class="product-description">
                        Una obra maestra de la sastrería arquitectónica, el Vestido La Jerarquía Noir presenta seda italiana drapeada a mano y un corsé estructural que redefine la silueta. Cada pieza está elaborada en nuestro taller de París, garantizando un ajuste inigualable y un acabado de calidad patrimonial.
                    </p>

                    <!-- Color -->
                    <div class="option-group">
                        <div class="option-label">COLOR: <span id="selectedColorLabel">NEGRO</span></div>
                        <div class="color-options" id="colorOptions">
                            <button class="color-btn active" data-color="NOIR" style="background-color: #000000;"></button>
                            <button class="color-btn" data-color="GOLD" style="background-color: #ddab3b;"></button>
                            <button class="color-btn" data-color="BLUE" style="background-color: #194172;"></button>
                        </div>
                    </div>

                    <!-- Tallas -->
                    <div class="option-group">
                        <div class="option-label">SELECCIONAR TALLA: <span id="selectedSizeLabel">S</span></div>
                        <div class="size-options" id="sizeOptions">
                            <button class="size-btn" data-size="XL">XL</button>
                            <button class="size-btn" data-size="L">L</button>
                            <button class="size-btn" data-size="M">M</button>
                            <button class="size-btn active" data-size="S">S</button>
                            <button class="size-btn" data-size="XS">XS</button>
                        </div>
                    </div>

                    <!-- Botón AÑADIR A LA BOLSA -->
                    <button id="addToBagBtn" class="outlet-btn-primary">AÑADIR A LA BOLSA</button>

                    <!-- Acciones secundarias -->
                    <div class="action-links">
                        <button id="wishlistBtn" class="action-link">♡ GUARDAR EN LISTA DE DESEOS</button>
                        <button id="shareBtn" class="action-link">↗ COMPARTIR</button>
                    </div>
                </div>
            </div>

            <!-- COMPLETA EL CONJUNTO -->
            <section class="ensemble-section">
                <h2 class="ensemble-title">COMPLETA EL CONJUNTO</h2>
                
                <div class="ensemble-grid">
                    <!-- Producto 1 - Joyería -->
                    <div class="ensemble-card" data-id="ensemble1">
                        <div class="ensemble-image">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwj2zYEHhhnr8os8c15ujR4ypzQ4q29EikILtR4YhWyvwFvdGB-SrJMy_IYzgmtuYpGnuLJsthroMkmm4g-EKLXzaMrGg_QvQ2VnJhBa84dMOdzSsgbNMtVTdEFQdXqK2Wo2XB_LwgBvOo2w0ZXPTC29Bkx2cmM3i-ctysgrvTpSPw2n_KtZ9IPaAqDNMEh2OLYnDUwRgmH0sVByHUnCUkcYpo9sR_RBLVZEkf0Hxkyyqs8AyaXx7CHbqdxyz8d3df9J68DyW-s9An" alt="Gotas Doradas Jerarquía">
                        </div>
                        <p class="ensemble-category">JOYERÍA</p>
                        <h3 class="ensemble-name">Gotas Doradas Jerarquía</h3>
                        <p class="ensemble-price">$450</p>
                    </div>

                    <!-- Producto 2 - Calzado -->
                    <div class="ensemble-card" data-id="ensemble2">
                        <div class="ensemble-image">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9PGYuCZnjaGLE-4RbfLWlyt89ygxAB6B9UxuW6Atxth1aR_M_1ef7d48fR8okFw3TZkrAMsdWH-N_bREnx0zVI-0nHe5kSW3-TggVyB0jnTlVgjWUDsz4oKzILchLJW5Ws04j_w3k3pGhf3o_9Z0wMqiP1xxwIo425sHQk6A1X5G5-n0vXrp7mvk_xKVD_Lq3Q9wqNpcXR90KP4kAIG1jFgJysyaYwmVHc4ewnoeG23qxfNR39ZgnTtPc1cDcayTgsuwwyUPZ2wRe" alt="Tacón Obsidiana">
                        </div>
                        <p class="ensemble-category">CALZADO</p>
                        <h3 class="ensemble-name">Tacón Obsidiana</h3>
                        <p class="ensemble-price">$890</p>
                    </div>

                    <!-- Producto 3 - Accesorios -->
                    <div class="ensemble-card" data-id="ensemble3">
                        <div class="ensemble-image">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDY0LziiCJ3iFCNoy_6fp2h2AdwyYgmu47lV3chvwbPbEiYAwJpeKAdBhuVn_XYfyqkzuHkaIMOWFjTeQ8teVZka-q0sJKo2kP6zWFUEhySilI8OgATw6_NIcy4AV8TO29bFCdjcIN61DbiWgGsiFc5aBrFJWCimmiWjt0K71PJezQ_d9IFmQNNBfuWE0WchjqYp_hfZNfgzeTLkdxJaKUeg7GHfT5WCOtxcxDcCKKuHOQSq5RGSzpcqfykVzD_d5K3ZhIJq0W6f_V" alt="Bolso de Noche Noir">
                        </div>
                        <p class="ensemble-category">ACCESORIOS</p>
                        <h3 class="ensemble-name">Bolso de Noche Noir</h3>
                        <p class="ensemble-price">$1,100</p>
                    </div>

                    <!-- Producto 4 - Accesorios -->
                    <div class="ensemble-card" data-id="ensemble4">
                        <div class="ensemble-image">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-qLH9HoOAfcx6nl0wrsUEfGFqNOoUYGyWRxVeL0N9IZPaRfSliJkPByl7LM2wd1kdtjmWepu7eaHrDuRkNbTNiyOvMK_tbeyeV1zZfuwsALXmf0KOVfWh1y90ctyAazRcsYusTw4G4yf5gw_rwQ-WPws1HrqqlESf0X_7XKK3eHnNDaaehp0y9EZ8DuFuuvpdmjKtZ7kXX6nvkpeqPH3xaQwMLdWpYvEfsdY4EeoBkR3lFpnqhsh6vqZ2YsuCDzzHuIvzs2fEetcS" alt="Bufanda de Seda Gossamer">
                        </div>
                        <p class="ensemble-category">ACCESORIOS</p>
                        <h3 class="ensemble-name">Bufanda de Seda Gossamer</h3>
                        <p class="ensemble-price">$220</p>
                    </div>
                </div>
            </section>
        </main>
    `;

    appContainer.innerHTML = productsHTML;

    const hasContent = document.querySelector('.products-main') !== null;
    console.log(`✅ HTML del producto inyectado: ${hasContent}`);
    
    return hasContent;
}

/**
 * Controller principal
 */
export async function productsCustumerController() {
    console.log('🛍️ Products Controller CUSTOMER - Página de producto');
    
    // 1. Inyectar HTML primero
    const htmlInjected = injectProductsHTML();
    if (!htmlInjected) {
        console.error('❌ Error al inyectar el HTML del producto');
        return;
    }
    
    // 2. Cargar estilos específicos
    loadStyles();
    
    // 3. Cargar datos desde localStorage
    loadStorage();
    
    // 4. Cargar miniaturas
    loadThumbnails();
    
    // 5. Inicializar selección de tallas
    initSizeSelection();
    
    // 6. Inicializar selección de colores
    initColorSelection();
    
    // 7. Inicializar botones de acción
    initActionButtons();
    
    // 8. Inicializar cards de ensemble
    initEnsembleCards();
    
    console.log('✅ Productos page CUSTOMER cargada correctamente');
}

/**
 * Carga datos desde localStorage
 */
function loadStorage() {
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    const savedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedWishlist) wishlist = JSON.parse(savedWishlist);
}

/**
 * Guarda el carrito en localStorage
 */
function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    updateCartBadge();
}

/**
 * Guarda la wishlist en localStorage
 */
function saveWishlist() {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
}

/**
 * Actualiza el badge del carrito en la navbar
 */
function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (badge) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = total;
        badge.style.opacity = total === 0 ? '0' : '1';
    }
}

/**
 * Muestra notificación toast
 */
function showNotification(message, isError = false) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #1f1b13;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        border-left: 4px solid #ddab3b;
        animation: slideIn 0.3s ease;
    `;
    
    if (isError) {
        notification.style.borderLeftColor = '#ba1a1a';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Carga las miniaturas de imágenes
 */
function loadThumbnails() {
    const container = document.getElementById('thumbnailContainer');
    if (!container) {
        console.error('❌ No se encontró #thumbnailContainer');
        return;
    }
    
    container.innerHTML = '';
    
    THUMBNAILS.forEach((src, index) => {
        const div = document.createElement('div');
        div.className = 'thumbnail';
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Thumbnail ${index + 1}`;
        img.loading = 'lazy';
        img.onclick = () => {
            const mainImage = document.getElementById('mainImage');
            if (mainImage) mainImage.src = src;
        };
        div.appendChild(img);
        container.appendChild(div);
    });
    
    console.log(`✅ ${THUMBNAILS.length} miniaturas cargadas`);
}

/**
 * Inicializa selección de tallas
 */
function initSizeSelection() {
    const sizeBtns = document.querySelectorAll('.size-btn');
    const sizeLabel = document.getElementById('selectedSizeLabel');
    
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('disabled')) return;
            
            const size = btn.getAttribute('data-size');
            selectedSize = size;
            
            if (sizeLabel) sizeLabel.textContent = size;
            
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            showNotification(`Talla ${size} seleccionada`);
        });
    });
}

/**
 * Inicializa selección de colores
 */
function initColorSelection() {
    const colorBtns = document.querySelectorAll('.color-btn');
    const colorLabel = document.getElementById('selectedColorLabel');
    
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            selectedColor = color;
            
            if (colorLabel) colorLabel.textContent = color;
            
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            showNotification(`Color ${color} seleccionado`);
        });
    });
}

/**
 * Inicializa botones de acción
 */
function initActionButtons() {
    const addToBagBtn = document.getElementById('addToBagBtn');
    const wishlistBtn = document.getElementById('wishlistBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (addToBagBtn) addToBagBtn.addEventListener('click', addToCart);
    if (wishlistBtn) wishlistBtn.addEventListener('click', addToWishlist);
    if (shareBtn) shareBtn.addEventListener('click', shareProduct);
}

/**
 * Agrega producto al carrito
 */
function addToCart() {
    const product = {
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
    showNotification(`✨ Añadido: ${product.name} (${selectedSize}, ${selectedColor})`);
    console.log('🛒 Carrito actualizado:', cart);
}

/**
 * Agrega producto a wishlist
 */
function addToWishlist() {
    const exists = wishlist.some(item => item.name === 'The Noir Hierarchy Gown');
    
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
        showNotification('❤️ Añadido a tu wishlist');
    } else {
        showNotification('⚠️ Ya está en tu wishlist', true);
    }
    console.log('💖 Wishlist actualizada:', wishlist);
}

/**
 * Comparte el producto
 */
async function shareProduct() {
    const url = window.location.href;
    const text = 'The Noir Hierarchy Gown - OUTLET';
    
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

/**
 * Copia texto al portapapeles
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showNotification('📋 Enlace copiado al portapapeles');
}

/**
 * Inicializa las cards de ensemble
 */
function initEnsembleCards() {
    const ensembleCards = document.querySelectorAll('.ensemble-card');
    
    ensembleCards.forEach(card => {
        card.addEventListener('click', () => {
            const name = card.querySelector('.ensemble-name')?.textContent || 'Producto';
            const priceText = card.querySelector('.ensemble-price')?.textContent || '$0';
            const price = parseInt(priceText.replace('$', '').replace(',', ''));
            
            const ensembleProduct = {
                id: Date.now(),
                name: name,
                price: price,
                quantity: 1,
                dateAdded: new Date().toISOString()
            };
            cart.push(ensembleProduct);
            saveCart();
            showNotification(`✨ ${name} añadido al carrito`);
        });
    });
}