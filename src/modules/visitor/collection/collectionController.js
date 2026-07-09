/* ========================================
   COLECCIÓN CONTROLLER - OUTLET
   Controlador para página de listado de productos
   CON SWEETALERT2 INTEGRADO
   ======================================== */

// Datos de productos
var products = [
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
var currentProducts = products.slice(0);
var currentPage = 1;
var productsPerPage = 6;
var activeFilters = {
    size: "S",
    color: null,
    designers: [],
    maxPrice: 5000
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
// Formatear dinero
// ========================================
function formatMoney(amount) {
    return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR', 
        minimumFractionDigits: 0 
    }).format(amount);
}

// ========================================
// Controller principal
// ========================================
export async function coleccionController() {
    console.log('🛍️ Colección Controller - Página de listado');
    
    loadStyles();
    initHero();
    renderProducts();
    initSizeFilters();
    initColorFilters();
    initDesignerFilters();
    initPriceFilter();
    initSorting();
    initPaginationButtons();
    initProductEvents();
}

// ========================================
// Inicializar hero dinámico
// ========================================
function initHero() {
    var urlParams = new URLSearchParams(window.location.search);
    var category = urlParams.get('category');
    var heroTitle = document.getElementById('heroTitle');
    
    if (category === 'hombre') {
        if (heroTitle) heroTitle.textContent = "COLECCIÓN HOMBRE";
    } else {
        if (heroTitle) heroTitle.textContent = "COLECCIÓN MUJER";
    }
}

// ========================================
// Aplicar todos los filtros
// ========================================
function applyFilters() {
    var filtered = products.slice(0);
    
    if (activeFilters.size && activeFilters.size !== 'Única') {
        filtered = filtered.filter(function(p) { return p.size.includes(activeFilters.size); });
    }
    
    if (activeFilters.color) {
        filtered = filtered.filter(function(p) { return p.color === activeFilters.color; });
    }
    
    if (activeFilters.designers.length > 0) {
        filtered = filtered.filter(function(p) { return activeFilters.designers.includes(p.designer); });
    }
    
    filtered = filtered.filter(function(p) { return p.price <= activeFilters.maxPrice; });
    
    currentProducts = filtered;
    currentPage = 1;
    renderProducts();
}

// ========================================
// Renderizar productos
// ========================================
function renderProducts() {
    var grid = document.getElementById('productGrid');
    if (!grid) return;

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
    paginatedProducts.forEach(function(product) {
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
    
    document.querySelectorAll('.coleccion-page-number').forEach(function(btn) {
        btn.addEventListener('click', function() {
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
        prevBtn.addEventListener('click', function() {
            var totalPages = Math.ceil(currentProducts.length / productsPerPage);
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
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
    sizeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            sizeBtns.forEach(function(b) { b.classList.remove('active'); });
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
    colorSwatches.forEach(function(swatch) {
        swatch.addEventListener('click', function() {
            var color = this.getAttribute('data-color');
            if (activeFilters.color === color) {
                activeFilters.color = null;
                this.style.transform = 'scale(1)';
            } else {
                activeFilters.color = color;
                colorSwatches.forEach(function(s) { s.style.transform = 'scale(1)'; });
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
    checkboxes.forEach(function(cb) {
        cb.addEventListener('change', function() {
            var value = this.value;
            if (this.checked) {
                activeFilters.designers.push(value);
            } else {
                activeFilters.designers = activeFilters.designers.filter(function(d) { return d !== value; });
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
        priceRange.addEventListener('input', function(e) {
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
        sortSelect.addEventListener('change', function() {
            var value = this.value;
            if (value === 'price-asc') {
                currentProducts.sort(function(a, b) { return a.price - b.price; });
            } else if (value === 'price-desc') {
                currentProducts.sort(function(a, b) { return b.price - a.price; });
            } else {
                var filtered = products.slice(0);
                if (activeFilters.size && activeFilters.size !== 'Única') {
                    filtered = filtered.filter(function(p) { return p.size.includes(activeFilters.size); });
                }
                if (activeFilters.color) {
                    filtered = filtered.filter(function(p) { return p.color === activeFilters.color; });
                }
                if (activeFilters.designers.length > 0) {
                    filtered = filtered.filter(function(p) { return activeFilters.designers.includes(p.designer); });
                }
                filtered = filtered.filter(function(p) { return p.price <= activeFilters.maxPrice; });
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
    productCards.forEach(function(card) {
        card.addEventListener('click', function(e) {
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
    wishlistBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var productId = this.getAttribute('data-id');
            var product = products.find(function(p) { return p.id == productId; });
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
    var exists = wishlist.some(function(item) { return item.id === product.id; });
    
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
            '¡Añadido a wishlist!',
            product.name + ' ha sido añadido a tu lista de deseos. ❤️'
        );
    } else {
        var result = await mostrarAdvertencia(
            'Ya está en tu wishlist',
            product.name + ' ya está en tu lista de deseos. ¿Quieres eliminarlo?',
            'Sí, eliminar'
        );
        
        if (result.isConfirmed) {
            wishlist = wishlist.filter(function(item) { return item.id !== product.id; });
            localStorage.setItem('outlet_wishlist', JSON.stringify(wishlist));
            await mostrarExito('Eliminado', product.name + ' ha sido eliminado de tu wishlist.');
        }
    }
}