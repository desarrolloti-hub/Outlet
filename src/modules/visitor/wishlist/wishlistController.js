/* ========================================
   WISHLIST CONTROLLER - OUTLET
   Controlador para página de productos favoritos
   ======================================== */

// Sample product data
const sampleProducts = [
    {
        id: 1,
        brand: "VALENTINO",
        name: "Structured Wool-Blend Coat",
        price: 3450,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAE78NUeRiMSPhkcmI3ADlJW1vriiriQ_nlq1_wZ3a3ATxS9KdxwTVCNK3Sbwni3mvqm86pynU3vwA-ug9zIHc3rIuwJ9mDEFOSxjQhB5PdTX_t3oX0nG6Wn09FLU_2GVMLcBs0k375ON7DTmUPdHyHvWBrbx5bXmAl37tGQS1Qj5BZpWDIHlaWSWB0uQN0ma_DA-CrxGI5Ee6ZJYnnUjwbVVctHaikXZ9qwqmjS6SBJXPBpBeQGJ409AxCkvjTbc_8CAXADuiMO1R1",
        badge: "Back in Stock",
        badgeType: "primary"
    },
    {
        id: 2,
        brand: "LOEWE",
        name: "Puzzle Edge Large Bag",
        price: 2900,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcbL7JMg8fS1P8XorMQqf2BFYlv_Ni409_q5voqFTnBeuA6IGCNo5FKVNg4NGJmJ_JuiaFL96mIaIFXQRFgV3ZPgE6n_XuMjZYoobip2y9R2__TKpFLlOTpnUntEJGPShcnRiNn2W8-3BVq9DgGSzQBu9u2qiYHGeYOsMk9cnNZyvFlWbGq_CjjviOVwGm7kT219u8rT-TPlsNNZ_eZ4YmRPb28lQbKcUM_xXhDI4JcJNRIgnZS7oucbWACltMAqghZwatk7jigLdH",
        badge: null,
        badgeType: null
    },
    {
        id: 3,
        brand: "ISSEY MIYAKE",
        name: "Pleats Please Maxi Dress",
        price: 890,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEX5W_8pMm-QjTDzsFh7MY8AdZaoMp0iHTjFdlbekizzE2LRcHqGttn3PkCfSsc_LI__Zg4XkHVH8v5oQXJpbDlKJts8D9kllnw1QoSTwVeKbBarRH1oYnYqF0hYC4z90GRmLmvHtp4KAMyn-4s2d39vcQ0PoVZNszr6hTFUXqrwJDXmYHmq8WJXaV0sl7Ba4IuzJ8NmMQMgUFQv2zrdJvdsS_ZMGIh8iGGlobVZGZNHZ6WSp4aBywVSwZ8ox3LxuPENjTkNZpzCI-",
        badge: "Low Stock",
        badgeType: "danger"
    },
    {
        id: 4,
        brand: "SAINT LAURENT",
        name: "Blade Pointed-Toe Pumps",
        price: 1150,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDO95NM-zC55t-K3KCJaDQDw1qlEH1HfzuG9mChrVrcAJsSNjyEJOQxaIoY9nSS5yywPRZAO8gDcCIFkgQvGzNt5SHYNneKWkxjUsSl0jDIiWvGUf0L4ioS2_mNa4hPHnQ_VkEVv18S74nJnQs41rmb12z67Ww-yUbGVWOtudeIeFtSh300ZggIGeoTb2oBGsJ6cY64vM1U4D4x7tVWBHa0zMWcXo3nFoLFKgY_LuA3j3HeMJzRsoK13chAMQA1ZvOgbTw1USfJGK3Y",
        badge: null,
        badgeType: null
    },
    {
        id: 5,
        brand: "JIL SANDER",
        name: "Horizon Mesh Watch",
        price: 2100,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCu6YrYpko9mKLwAD11xWxLqOM3GWhuc2EiN94qaN7Gr2gEmJIvRgrKTWY_iAVBrrC3wqO48DGdcCKcE2nHf4WleZpOmrGeUAT5dVwquPbDDi1vjfAbHr1X1BEr-xbSR6V8LMNmx8i4KW538m6QUKocqqT0AG10RQwroYUvSv_fPUZnric4JZpESLDoID8r4rkfCwdtw5Jmii_cAsTr0cs3oZv8CRglHyk80aDSR-lpU6V86EyhWpg9_G2PbH9U6i3iXBZg5i9K3l_Z",
        badge: null,
        badgeType: null
    },
    {
        id: 6,
        brand: "THE ROW",
        name: "Margaux Silk Blazer",
        price: 4500,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2RiCKT9Rg_urcWZauMwGyJx16Vgg-2j-f2-2uN92lDWtQAzfgKH7SgHMpvFkq9D2rrvjYtWYmuh9W0iczYK54uRKYAsAmaLfHivrzj0sa5Q2DtzOJHJ7a2tIWVaNvzHPS5WtvyDvWzlUZG0jMwkxuhp9cQJpdSQupiWy33WeOqtEQZWY74mShqnmpolk2iHjm2-qSomBYZiIY_ac39umH1TzcdhIcjNfqdShkQYHTtGJOXa9vLRI2wXkup3ivc1fot8e2xVJFT0I8",
        badge: "Only 2 left",
        badgeType: "danger"
    }
];

// Storage key
const STORAGE_KEY = 'outlet_wishlist';

// State
let wishlistItems = [];
let currentSort = 'newest';

/**
 * Load styles for wishlist page
 */
function loadStyles() {
    if (document.querySelector('link[href*="wishlist.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/wishlist.css';
    document.head.appendChild(link);
}

/**
 * Format currency
 */
function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Load wishlist from localStorage
 */
function loadWishlist() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        wishlistItems = JSON.parse(saved);
    } else {
        // Default sample products
        wishlistItems = [...sampleProducts];
        saveWishlist();
    }
}

/**
 * Save wishlist to localStorage
 */
function saveWishlist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
}

/**
 * Render wishlist grid
 */
function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    const emptyState = document.getElementById('wishlistEmptyState');
    const footer = document.getElementById('wishlistFooter');
    const itemsCountSpan = document.getElementById('wishlistItemsCount');
    
    if (!grid) return;
    
    const hasItems = wishlistItems.length > 0;
    
    // Show/hide elements
    grid.style.display = hasItems ? 'grid' : 'none';
    if (emptyState) emptyState.style.display = hasItems ? 'none' : 'block';
    if (footer) footer.style.display = hasItems ? 'block' : 'none';
    if (itemsCountSpan) itemsCountSpan.textContent = `${wishlistItems.length} Item${wishlistItems.length !== 1 ? 's' : ''} Saved`;
    
    if (!hasItems) return;
    
    // Apply sorting
    let sortedItems = [...wishlistItems];
    if (currentSort === 'price-asc') {
        sortedItems.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
        sortedItems.sort((a, b) => b.price - a.price);
    } else {
        // newest (keep original order with newest first - by id descending)
        sortedItems.sort((a, b) => b.id - a.id);
    }
    
    // Render grid
    grid.innerHTML = sortedItems.map(product => `
        <div class="wishlist-product-card" data-id="${product.id}">
            <div class="wishlist-card-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.badge ? `
                    <div class="wishlist-card-badge">
                        <span class="wishlist-badge-${product.badgeType === 'danger' ? 'danger' : 'primary'}">${product.badge}</span>
                    </div>
                ` : ''}
                <div class="wishlist-card-actions">
                    <button class="wishlist-heart-btn active" data-id="${product.id}">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="wishlist-card-content">
                <p class="wishlist-card-brand">${product.brand}</p>
                <h3 class="wishlist-card-title">${product.name}</h3>
                <div class="wishlist-card-footer">
                    <p class="wishlist-card-price">${formatMoney(product.price)}</p>
                    <button class="wishlist-add-cart-btn" data-id="${product.id}">
                        <i class="fa-solid fa-bag-shopping"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Reattach events
    attachCardEvents();
}

/**
 * Attach events to dynamic elements
 */
function attachCardEvents() {
    // Remove from wishlist (heart button)
    const heartBtns = document.querySelectorAll('.wishlist-heart-btn');
    heartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(btn.getAttribute('data-id'));
            removeFromWishlist(productId);
        });
    });
    
    // Add to cart
    const cartBtns = document.querySelectorAll('.wishlist-add-cart-btn');
    cartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(btn.getAttribute('data-id'));
            const product = wishlistItems.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });
    
    // Product card click (navigate to product detail)
    const cards = document.querySelectorAll('.wishlist-product-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-heart-btn') || e.target.closest('.wishlist-add-cart-btn')) return;
            const productId = card.getAttribute('data-id');
            if (productId) {
                window.navigateTo(`/product/${productId}`);
            }
        });
    });
}

/**
 * Remove product from wishlist
 */
function removeFromWishlist(productId) {
    wishlistItems = wishlistItems.filter(p => p.id !== productId);
    saveWishlist();
    renderWishlist();
    showNotification('❤️ Removed from wishlist');
}

/**
 * Add product to cart
 */
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            quantity: 1,
            dateAdded: new Date().toISOString()
        });
    }
    
    localStorage.setItem('outlet_cart', JSON.stringify(cart));
    updateCartBadge();
    showNotification(`✨ ${product.name} added to cart`);
}

/**
 * Move all products to cart
 */
function moveAllToCart() {
    if (wishlistItems.length === 0) {
        showNotification('⚠️ Your wishlist is empty');
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
    
    wishlistItems.forEach(product => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                image: product.image,
                quantity: 1,
                dateAdded: new Date().toISOString()
            });
        }
    });
    
    localStorage.setItem('outlet_cart', JSON.stringify(cart));
    updateCartBadge();
    showNotification(`🛍️ ${wishlistItems.length} item(s) moved to cart`);
}

/**
 * Update cart badge in navbar
 */
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
    const badge = document.querySelector('.cart-count');
    if (badge) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = total;
        badge.style.opacity = total === 0 ? '0' : '1';
    }
}

/**
 * Show toast notification
 */
function showNotification(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Sort button
    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            // Cycle through sort options
            if (currentSort === 'newest') {
                currentSort = 'price-asc';
                showNotification('Sorting by: Price (Low to High)');
            } else if (currentSort === 'price-asc') {
                currentSort = 'price-desc';
                showNotification('Sorting by: Price (High to Low)');
            } else {
                currentSort = 'newest';
                showNotification('Sorting by: Newest');
            }
            renderWishlist();
        });
    }
    
    // Move all to cart button
    const moveAllBtn = document.getElementById('moveAllToCartBtn');
    if (moveAllBtn) {
        moveAllBtn.addEventListener('click', moveAllToCart);
    }
    
    // Explore buttons
    const exploreBtns = document.querySelectorAll('#exploreMoreBtn, #exploreMoreFooterBtn');
    exploreBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                window.navigateTo('/collection');
            });
        }
    });
}

/**
 * Main controller
 */
export async function wishlistController() {
    console.log('💖 Wishlist Controller - Favorites page');
    
    // Load styles
    loadStyles();
    
    // Load data
    loadWishlist();
    
    // Render UI
    renderWishlist();
    
    // Initialize events
    initEventListeners();
    
    // Update cart badge on load
    updateCartBadge();
    
    console.log('✅ Wishlist page loaded successfully');
}