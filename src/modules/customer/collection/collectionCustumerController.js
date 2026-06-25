/* ========================================
   COLECCIÓN CONTROLLER - CUSTOMER (CON INYECCIÓN DE HTML)
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
 * Inyecta el HTML de la colección en el DOM
 */
function injectCollectionHTML() {
    // Verifica si el contenido ya existe
    if (document.querySelector('.coleccion-main-container')) {
        console.log('✅ El HTML de la colección ya está en el DOM');
        return true;
    }

    console.log('📄 Inyectando HTML de la colección para CUSTOMER...');

    // Busca dónde insertar
    const appContainer = document.getElementById('app') || 
                        document.getElementById('main-content') || 
                        document.querySelector('main') || 
                        document.body;

    // HTML completo de la colección
    const collectionHTML = `
        <main>
            <!-- Hero Section -->
            <section class="coleccion-hero" id="heroSection">
                <img class="coleccion-hero-image" id="heroImage" alt="Colección" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzu-fRuH3Pr70TzycsyqNKTq0wqXUKhvqpLQnKFosRgYpTYaHmMbiZTuR6057YH9mzWy7zyvF1Nayn_vmpuWt228rSPkB3bVGEyC4luNmuFA8zLymzV9_rpVIqWLkjNVhRh4POKNi-dzukNMftMlKjV48nwZdx-9jPYUoHEnMtd8MZWvsGmBNKlC-J5JgvgvS3TqUQb2UxHyyvWUysvPjpJ45zalixovYZXI-e_wzrc3bs-6m3CrEzBx9xQSLKPeQO6fx0aggigfMd">
                <div class="coleccion-hero-overlay">
                    <h2 class="coleccion-hero-title" id="heroTitle">COLECCIÓN MUJER</h2>
                    <div class="coleccion-hero-underline"></div>
                </div>
            </section>

            <!-- Main Content Area -->
            <div class="coleccion-main-container">
                <!-- Filter Sidebar -->
                <aside class="coleccion-sidebar">
                    <h3 class="coleccion-sidebar-title">FILTROS</h3>

                    <!-- Talla -->
                    <div class="coleccion-filter-group">
                        <p class="coleccion-filter-label">Talla</p>
                        <div class="coleccion-size-grid">
                            <button class="coleccion-size-btn" data-size="XS">XS</button>
                            <button class="coleccion-size-btn active" data-size="S">S</button>
                            <button class="coleccion-size-btn" data-size="M">M</button>
                            <button class="coleccion-size-btn" data-size="L">L</button>
                            <button class="coleccion-size-btn" data-size="XL">XL</button>
                        </div>
                    </div>

                    <!-- Color -->
                    <div class="coleccion-filter-group">
                        <p class="coleccion-filter-label">Color</p>
                        <div class="coleccion-color-options">
                            <div class="coleccion-color-swatch black" data-color="black"></div>
                            <div class="coleccion-color-swatch white" data-color="white"></div>
                            <div class="coleccion-color-swatch gold" data-color="gold"></div>
                            <div class="coleccion-color-swatch blue" data-color="blue"></div>
                            <div class="coleccion-color-swatch brown" data-color="brown"></div>
                        </div>
                    </div>

                    <!-- Diseñador -->
                    <div class="coleccion-filter-group">
                        <p class="coleccion-filter-label">Diseñador</p>
                        <div class="coleccion-checkbox-group">
                            <label class="coleccion-checkbox-label">
                                <input type="checkbox" class="coleccion-checkbox" value="Maison Luxe">
                                <span>Maison Luxe</span>
                            </label>
                            <label class="coleccion-checkbox-label">
                                <input type="checkbox" class="coleccion-checkbox" value="Atelier Noir">
                                <span>Atelier Noir</span>
                            </label>
                            <label class="coleccion-checkbox-label">
                                <input type="checkbox" class="coleccion-checkbox" value="Ethereal Studio">
                                <span>Ethereal Studio</span>
                            </label>
                        </div>
                    </div>

                    <!-- Precio -->
                    <div class="coleccion-filter-group">
                        <p class="coleccion-filter-label">Rango de Precio</p>
                        <input type="range" class="coleccion-price-range" min="0" max="5000" value="2500">
                        <div class="coleccion-price-labels">
                            <span>0€</span>
                            <span>5000€</span>
                        </div>
                    </div>
                </aside>

                <!-- Product Grid -->
                <section class="coleccion-products-section">
                    <div class="coleccion-products-header">
                        <p class="coleccion-results-count" id="resultsCount">Mostrando 6 de 6 productos</p>
                        <div class="coleccion-sort-container">
                            <span class="coleccion-sort-label">ORDENAR POR:</span>
                            <select class="coleccion-sort-select" id="sortSelect">
                                <option value="newest">RECIÉN LLEGADOS</option>
                                <option value="price-asc">PRECIO: MENOR A MAYOR</option>
                                <option value="price-desc">PRECIO: MAYOR A MENOR</option>
                            </select>
                        </div>
                    </div>

                    <div class="coleccion-product-grid" id="productGrid">
                        <!-- Los productos se inyectan desde JS -->
                    </div>

                    <!-- Pagination -->
                    <div class="coleccion-pagination">
                        <button class="coleccion-pagination-btn" id="prevPage">
                            <span class="material-symbols-outlined">chevron_left</span>
                        </button>
                        <div class="coleccion-pagination-numbers" id="paginationNumbers"></div>
                        <button class="coleccion-pagination-btn" id="nextPage">
                            <span class="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </section>
            </div>
        </main>
    `;

    appContainer.innerHTML = collectionHTML;

    const hasContent = document.querySelector('.coleccion-main-container') !== null;
    console.log(`✅ HTML de la colección inyectado: ${hasContent}`);
    
    return hasContent;
}

/**
 * Controller principal
 */
export async function collectionCustomerController() {
    console.log('🛍️ Colección Controller CUSTOMER - Página de listado');
    
    // 1. Inyectar HTML primero
    const htmlInjected = injectCollectionHTML();
    if (!htmlInjected) {
        console.error('❌ Error al inyectar el HTML de la colección');
        return;
    }
    
    // 2. Cargar estilos específicos
    loadStyles();
    
    // 3. Inicializar hero dinámico
    initHero();
    
    // 4. Renderizar productos
    renderProducts();
    
    // 5. Inicializar filtros
    initSizeFilters();
    initColorFilters();
    initDesignerFilters();
    initPriceFilter();
    initSorting();
    initPaginationButtons();
    
    // 6. Inicializar eventos de productos
    initProductEvents();
    
    console.log('✅ Colección CUSTOMER cargada correctamente');
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
    if (!grid) {
        console.error('❌ No se encontró #productGrid');
        return;
    }

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
                if (window.navigateTo) {
                    window.navigateTo(`/product/${productId}`);
                } else {
                    window.location.href = `/product/${productId}`;
                }
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
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}