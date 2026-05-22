/* ========================================
   COLECCIÓN CONTROLLER - OUTLET
   Controlador para página de listado de productos
   ======================================== */

// Datos de productos
const products = [
    {
        id: 1,
        brand: "MAISON LUXE",
        name: "Vestido de Seda Minimal",
        price: 1250,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVNmzqtVZ3G9MrYLm3haFXarVCA7PQ69Dm3ri30ApxZ6BjtHFp_3l7hmo4eflMnS9N6Q7Fx-4dedsbB22G6eOLhPFDm5vfspizyoBFrDOuZImojpmodGmtRbtNX61lX8VDm9x10rwlFdC9FhL2HO0bldkhrqhI_2dxCgmR32txANofe0281nvPDFFsvUOq6xsbH3uobRXHKZxCblnt-f4X0ZxuUWwEZ4JYwmis-BFuULG6fUZRRbXHo17at--wgNh5mpPyD9zmcgf4",
        badge: "NUEVO",
        size: ["XS", "S", "M", "L", "XL"],
        color: "black",
        designer: "Maison Luxe"
    },
    {
        id: 2,
        brand: "ATELIER NOIR",
        name: "Blazer Estructurado Wool",
        price: 890,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoFBqbzemgg4D6R-YEd_GzOIVm4-Qr7J5CupE4YBzVTvuXUrumcaRp1cXHwqaktNzehF0KWhe3FE1MT7XICsBvj9-LWYhj0YjPWhfLKGxufQYYVPUPBAHhYw3Qg0RSDINmqaSLMCQKy4K1-QVEDLL4gdp1cF_2a5okyT_KggA76sgwQ_KZFznhXlR__ZktcRYqEXU7ynaM7GsIMI1kiHWIACwyeK2k6b-hgttTYxtdbjsMR8g0JXQ2a36Bl1ihuHJcBLwXUgEotQ2K",
        badge: "EXCLUSIVO",
        size: ["M", "L", "XL"],
        color: "brown",
        designer: "Atelier Noir"
    },
    {
        id: 3,
        brand: "ETHEREAL STUDIO",
        name: "Gala Chiffon Ivory",
        price: 2400,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCN4iloVvjKYcH7THjTYp6wooS2BJ1LYolUgx1MLqJ-jxmVBFBXrncys0eA29qrdnkHIjwfZlP0FAp-WN0SmMChaLJ-qi3vJvmeLNMoS22B36t0lbSBmtrwBUfSthquhNzGoPWrzJ-vc5aG8D4nT7AzRwbDFN_7q5K230YDIbz1Ke4hObhW-GaTWaJXb_mjhhQxn_K9mfLHlTjw5j9cHmnllQ7OhAnPLZJseW7twPBbaVlHihiKJpcdP2NnjMrCI5G1QbTNJJVIpw33",
        badge: null,
        size: ["XS", "S", "M"],
        color: "white",
        designer: "Ethereal Studio"
    },
    {
        id: 4,
        brand: "MAISON LUXE",
        name: "Knit Cashmere Sculpt",
        price: 650,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtE-gUmTjbbXAdHhl0NLtuajHMWhTNhdHWmmJnQe4g3FGHXQlecQy9w7tLO8xp7mALgU2KguqcfuQoVVmdr4CAb0UbTvjodHn4pHFqB4lPOflbE5hP-r5HPFzCVIiKEvFSdheUtS0HNVLbvCEVzPOeIOC5JOH4LSFPFz0PKpK59VAgH817rY8e5kwq_OF4lIIVjlLHtg4CHuPJiTX2lLA9VxviQcBvvyqfKMgI89XIYd9dYNgs75QBBpIDkPfL5pPX2VQz30Sr8LfT",
        badge: null,
        size: ["S", "M", "L"],
        color: "brown",
        designer: "Maison Luxe"
    },
    {
        id: 5,
        brand: "ATELIER NOIR",
        name: "Bolso Piel 'Arch' Gold",
        price: 1800,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD02slcN7JVsasTTHdQNuA4A0SO737WLXCQWNdAjV0wlzb73BD8hhBKax7tFfzZd-hEnHUFj608KoQFE3Zw_zl_1YkXMuMa8QU4MJW8bx4UWky-1rWGYwONKgY7x8rv6bEIus1aTl0FhpyqwnHP-eT1p0ptPx-P2j3O06ngEQ1sLVcR5fZBVfyF-cQOdDFG1tsb1KL1Gz_RtiVPZmx2fhBuX6cnMB-tbhPvfkawD-KK36uwh_nKGZkEjC9Wx3sK1eJTZE9nK_SxscHt",
        badge: "NUEVO",
        size: ["Única"],
        color: "black",
        designer: "Atelier Noir"
    },
    {
        id: 6,
        brand: "ETHEREAL STUDIO",
        name: "Mono Silk Tailored",
        price: 1450,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcdfXGBcBeo26fl32hyEgXK-vLIKwWmntkJi4qIvToByEUnCg4UYT6SW1IIs8OUlf_vjN9tTZlHE4hoFUsal6jxhnEU5y7rCCJu1o7mFFmSN8Opszk2X-7V5OqiS499LHKGhx4Pg7_aQKxocE29cfcngG6JrW8LLCgXguBoms7jJBd25GBB6k31oLbbt8AJ3NaN5rZPqW_Op0HmhLkHUdeACQE1bnjQYr2pqa6u7QP0JSdbTPw79ogt0zXWO37b5ly2yFQtoNg1PcN",
        badge: null,
        size: ["XS", "S", "M", "L"],
        color: "black",
        designer: "Ethereal Studio"
    }
];

// Configuración de la vista
let currentProducts = [...products];
let currentPage = 1;
const productsPerPage = 6;
let activeFilters = {
    size: "S",
    color: null,
    designers: [],
    maxPrice: 5000
};

/**
 * Carga los estilos CSS de la página
 */
function loadStyles() {
    if (document.querySelector('link[href*="coleccion.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/coleccion.css';
    document.head.appendChild(link);
}

/**
 * Controller principal
 */
export async function coleccionController() {
    console.log('🛍️ Colección Controller - Página de listado');
    
    // Cargar estilos específicos
    loadStyles();
    
    // Inicializar hero dinámico
    initHero();
    
    // Renderizar productos
    renderProducts();
    
    // Inicializar filtros
    initSizeFilters();
    initColorFilters();
    initDesignerFilters();
    initPriceFilter();
    initSorting();
    initPaginationButtons();
    
    // Inicializar eventos de productos
    initProductEvents();
}

/**
 * Inicializa hero dinámico (para cambiar entre Mujer/Hombre)
 */
function initHero() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const heroTitle = document.getElementById('heroTitle');
    const heroImage = document.getElementById('heroImage');
    
    if (category === 'hombre') {
        if (heroTitle) heroTitle.textContent = "COLECCIÓN HOMBRE";
        // Opcional: cambiar imagen también
        // if (heroImage) heroImage.src = "url-de-imagen-hombre";
    } else {
        if (heroTitle) heroTitle.textContent = "COLECCIÓN MUJER";
    }
}

/**
 * Formatear dinero
 */
function formatMoney(amount) {
    return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR', 
        minimumFractionDigits: 0 
    }).format(amount);
}

/**
 * Aplicar todos los filtros
 */
function applyFilters() {
    let filtered = [...products];
    
    // Filtro de talla
    if (activeFilters.size && activeFilters.size !== 'Única') {
        filtered = filtered.filter(p => p.size.includes(activeFilters.size));
    }
    
    // Filtro de color
    if (activeFilters.color) {
        filtered = filtered.filter(p => p.color === activeFilters.color);
    }
    
    // Filtro de diseñadores
    if (activeFilters.designers.length > 0) {
        filtered = filtered.filter(p => activeFilters.designers.includes(p.designer));
    }
    
    // Filtro de precio
    filtered = filtered.filter(p => p.price <= activeFilters.maxPrice);
    
    currentProducts = filtered;
    currentPage = 1;
    renderProducts();
}

/**
 * Renderizar productos
 */
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    // Paginación
    const totalProducts = currentProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = currentProducts.slice(start, end);
    
    // Actualizar contador
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Mostrando ${paginatedProducts.length} de ${totalProducts} productos`;
    }
    
    // Renderizar grid
    grid.innerHTML = paginatedProducts.map(product => `
        <div class="coleccion-product-card" data-id="${product.id}">
            <div class="coleccion-product-image-container">
                <img class="coleccion-product-image" src="${product.image}" alt="${product.name}">
                ${product.badge ? `<span class="coleccion-product-badge ${product.badge === 'EXCLUSIVO' ? 'exclusive' : ''}">${product.badge}</span>` : ''}
                <button class="coleccion-product-wishlist" data-id="${product.id}">
                    <span class="material-symbols-outlined">favorite</span>
                </button>
            </div>
            <div class="coleccion-product-info">
                <p class="coleccion-product-brand">${product.brand}</p>
                <h4 class="coleccion-product-name">${product.name}</h4>
                <p class="coleccion-product-price">${formatMoney(product.price)}</p>
            </div>
        </div>
    `).join('');
    
    // Renderizar paginación
    renderPagination(totalPages);
    
    // Reinicializar eventos de productos
    initProductEvents();
}

/**
 * Renderizar paginación
 */
function renderPagination(totalPages) {
    const paginationNumbers = document.getElementById('paginationNumbers');
    if (!paginationNumbers) return;
    
    if (totalPages <= 1) {
        paginationNumbers.innerHTML = '';
        return;
    }
    
    let html = '';
    for (let i = 1; i <= Math.min(totalPages, 3); i++) {
        html += `<button class="coleccion-page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    if (totalPages > 3) {
        html += `<span class="coleccion-page-dots">...</span>`;
        html += `<button class="coleccion-page-number" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    paginationNumbers.innerHTML = html;
    
    // Eventos de paginación
    document.querySelectorAll('.coleccion-page-number').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.getAttribute('data-page'));
            renderProducts();
        });
    });
}

/**
 * Inicializar botones de paginación (anterior/siguiente)
 */
function initPaginationButtons() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(currentProducts.length / productsPerPage);
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(currentProducts.length / productsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
            }
        });
    }
}

/**
 * Inicializar filtros de talla
 */
function initSizeFilters() {
    const sizeBtns = document.querySelectorAll('.coleccion-size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.size = btn.getAttribute('data-size');
            applyFilters();
        });
    });
}

/**
 * Inicializar filtros de color
 */
function initColorFilters() {
    const colorSwatches = document.querySelectorAll('.coleccion-color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.getAttribute('data-color');
            if (activeFilters.color === color) {
                activeFilters.color = null;
                swatch.style.transform = 'scale(1)';
            } else {
                activeFilters.color = color;
                colorSwatches.forEach(s => s.style.transform = 'scale(1)');
                swatch.style.transform = 'scale(1.1)';
            }
            applyFilters();
        });
    });
}

/**
 * Inicializar filtros de diseñador
 */
function initDesignerFilters() {
    const checkboxes = document.querySelectorAll('.coleccion-checkbox');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const value = cb.value;
            if (cb.checked) {
                activeFilters.designers.push(value);
            } else {
                activeFilters.designers = activeFilters.designers.filter(d => d !== value);
            }
            applyFilters();
        });
    });
}

/**
 * Inicializar filtro de precio
 */
function initPriceFilter() {
    const priceRange = document.querySelector('.coleccion-price-range');
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            activeFilters.maxPrice = parseInt(e.target.value);
            applyFilters();
        });
    }
}

/**
 * Inicializar ordenamiento
 */
function initSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const value = sortSelect.value;
            if (value === 'price-asc') {
                currentProducts.sort((a, b) => a.price - b.price);
            } else if (value === 'price-desc') {
                currentProducts.sort((a, b) => b.price - a.price);
            } else {
                // Novedad: revertir a orden original con filtros aplicados
                let filtered = [...products];
                if (activeFilters.size && activeFilters.size !== 'Única') {
                    filtered = filtered.filter(p => p.size.includes(activeFilters.size));
                }
                if (activeFilters.color) {
                    filtered = filtered.filter(p => p.color === activeFilters.color);
                }
                if (activeFilters.designers.length > 0) {
                    filtered = filtered.filter(p => activeFilters.designers.includes(p.designer));
                }
                filtered = filtered.filter(p => p.price <= activeFilters.maxPrice);
                currentProducts = filtered;
            }
            currentPage = 1;
            renderProducts();
        });
    }
}

/**
 * Inicializar eventos de productos (click, wishlist)
 */
function initProductEvents() {
    // Click en producto para ver detalle
    const productCards = document.querySelectorAll('.coleccion-product-card');
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Evitar que el click en wishlist dispare la navegación
            if (e.target.closest('.coleccion-product-wishlist')) return;
            
            const productId = card.getAttribute('data-id');
            if (productId) {
                // Navegar a detalle del producto
                window.navigateTo(`/product/${productId}`);
            }
        });
    });
    
    // Wishlist
    const wishlistBtns = document.querySelectorAll('.coleccion-product-wishlist');
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.getAttribute('data-id');
            const product = products.find(p => p.id == productId);
            if (product) {
                addToWishlist(product);
            }
        });
    });
}

/**
 * Agregar a wishlist
 */
function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('outlet_wishlist') || '[]');
    const exists = wishlist.some(item => item.id === product.id);
    
    if (!exists) {
        wishlist.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image
        });
        localStorage.setItem('outlet_wishlist', JSON.stringify(wishlist));
        showNotification(`❤️ ${product.name} añadido a wishlist`);
    } else {
        showNotification(`⚠️ ${product.name} ya está en tu wishlist`);
    }
}

/**
 * Mostrar notificación
 */
function showNotification(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}