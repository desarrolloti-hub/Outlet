/* ========================================
   PRODUCTS CONTROLLER - OUTLET
   Controlador para página de detalle de producto
   ======================================== */

// Configuración de imágenes
const THUMBNAILS = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA8g0Esh47Sv3yioog16MU7CKt8dLC1bT82o7Al5PeVetpq8PdqiOBE-wX6JP8tSUUIURV1TrNRgugKwi8OHPdbe1wRicQJ9LcpTnmOs9zTOzsc6dpLGDuF5ADvNgXx7qXJwpn33Xt83FE9HrCeK-wwQlH27lJOZSna1X7_d7O13JAQ8NZIIFTHUJHwg9bQL1ViRtKTAKPTkc1hqy7iEeJ216dPlGc_C-NrhPphR3LDYtNKqcYuCL0__IymvVZP6ie5VeR_aqekCOMM",
    "https://lh3.googleusercontent.comaida-public/AB6AXuDXKbGmxF_ZnSN8YwkdM_VCOsXreEUpaok5Ma7e_a1-yjoMEjIACknTwVEobJSld-Uh9T0_ei6Z6m8ILyGrMbHB8GWbuQk_MX3ncldI6Qs1ePGrXXwqMwH6PQ3QnZ-mE3TMXU2XKVf7DihMHqprHrEmWN05xih_ZQiDLU0uqHLZ6qzl5iY5yqg-M_OhjR8hhk7PDHVVJrQNlstC86YwT96Ok6HxB3SxoreY0FV-lQqG_nGpUu1aGZresjVFc21eR1t36REuTKYEukCQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAV-B0a2s9LK2WGhCBR53fEwpsR_tZHlVK9Z8TrDLcUx1F5z821jyqDRdU13qKwE-dVOIXIp2MK3MOfkvjsowqoLaYb1cLnFT0rkp62wZ8U_tj-Tne5jfW2gfUepX0i6Fh9e1eddLa6sWl7uvpI_NBxuBqC0wSiZ0ZB83STw-GqFwwYzR7ByKlBXBExlbuRVJehgsraWbuFUz2qeW0OkTRBSA3IP42BXtfCBP_8kycZzZArgH4YvnvHd4NDU4VkcuiaMAq70q_ju3Am",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-2aV8shTdhfM5IkOyi25WpZJrRB8HQQC4-6pmPUWOyB6DirOst44_nDMMoL8wSNBGY9VHsMlo_KQkDWnG6bGnbhCmkrJIyf4zPQm5dlumyAnJ5bgcAoNa2cIhPk6RPl0ACzhjvoSaiF4qQtGlTbVUIUeubmpEqNwlI9mO974O2gAPgThlZT60mM2fCHy3orBH1tvJCXewpWzcnkGl0WIm6rsvc5zkviy15kQUx78_pC5bra0Qh2xI58vhM-oK6BZs3jH0v3gmaL9i"
];

// Estado de la aplicación
let selectedSize = 'S';
let selectedColor = 'NOIR';
let cart = [];
let wishlist = [];

// Clave para localStorage
const STORAGE_KEYS = {
    CART: 'outlet_cart',
    WISHLIST: 'outlet_wishlist'
};

/**
 * Carga los estilos CSS de la página
 */
function loadStyles() {
    // Verificar si ya está cargado
    if (document.querySelector('link[href*="products.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/products.css';
    document.head.appendChild(link);
}

/**
 * Controller principal
 */
export async function productsController() {
    console.log('🛍️ Products Controller - Página de producto');
    
    // Cargar estilos específicos
    loadStyles();
    
    // Cargar datos desde localStorage
    loadStorage();
    
    // Cargar miniaturas
    loadThumbnails();
    
    // Inicializar selección de tallas
    initSizeSelection();
    
    // Inicializar selección de colores
    initColorSelection();
    
    // Inicializar botones de acción
    initActionButtons();
    
    // Inicializar cards de ensemble
    initEnsembleCards();
    
    console.log('✅ Productos page cargada correctamente');
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
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Carga las miniaturas de imágenes
 */
function loadThumbnails() {
    const container = document.getElementById('thumbnailContainer');
    if (!container) return;
    
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