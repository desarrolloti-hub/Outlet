import { ProductService } from '../../../services/productService.js';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';

function loadBrandsStyles() {
    if (document.querySelector('link[href*="brandsCustomer.css"]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/customer/brands/brandsCustomer.css';
    document.head.appendChild(link);
}

function formatPrice(value) {
    const price = Number(value) || 0;
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

function getBrandGroups(products) {
    const groups = new Map();

    products.forEach((product) => {
        const rawBrand = product && product.marca ? String(product.marca).trim() : '';
        if (!rawBrand) return;

        const normalizedKey = rawBrand.toLowerCase();
        if (!groups.has(normalizedKey)) {
            groups.set(normalizedKey, {
                label: rawBrand,
                products: []
            });
        }

        groups.get(normalizedKey).products.push(product);
    });

    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function getProductCardMarkup(product, brandLabel) {
    const productId = product.id || product.sku || product.nombre || 'producto';
    const image = product.imagenPrincipal ||
        (Array.isArray(product.galeriaImagenes) && product.galeriaImagenes.length ? product.galeriaImagenes[0] : '') ||
        FALLBACK_IMAGE;
    const price = product.precioFinal ?? product.precioVenta ?? product.precio ?? 0;
    const category = product.categoria ? product.categoria : 'General';

    return `
        <a class="brands-product-card" href="/productsCustomer/${encodeURIComponent(productId)}" data-link>
            <div class="brands-product-image-wrap">
                <img src="${image}" alt="${String(product.nombre || 'Producto').replace(/"/g, '&quot;')}" loading="lazy">
            </div>
            <div class="brands-product-body">
                <p class="brands-product-brand">${brandLabel}</p>
                <h3>${product.nombre || 'Producto sin nombre'}</h3>
                <div class="brands-product-meta">
                    <span>${category}</span>
                    <span>${formatPrice(price)}</span>
                </div>
            </div>
        </a>
    `;
}

export async function brandsCustomerController() {
    loadBrandsStyles();

    const container = document.getElementById('brands-page-container');
    if (!container) return;

    try {
        const allProducts = await ProductService.getAll({}, 'createdAt', 'desc', 1000);
        const brandGroups = getBrandGroups(allProducts);

        if (!brandGroups.length) {
            container.innerHTML = `
                <div class="brands-empty-state">
                    <h2>No hay marcas disponibles</h2>
                    <p>Pronto agregaremos más marcas a la colección.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = brandGroups.map(({ label, products }) => `
            <section class="brands-brand-section">
                <div class="brands-brand-header">
                    <h2>${label}</h2>
                    <span>${products.length} ${products.length === 1 ? 'producto' : 'productos'}</span>
                </div>
                <div class="brands-grid">
                    ${products.map((product) => getProductCardMarkup(product, label)).join('')}
                </div>
            </section>
        `).join('');
    } catch (error) {
        console.error('❌ Error cargando productos por marca:', error);
        container.innerHTML = `
            <div class="brands-empty-state">
                <h2>No se pudieron cargar las marcas</h2>
                <p>Intenta de nuevo más tarde.</p>
            </div>
        `;
    }
}
