/* ========================================
   ADMIN CONTROLLER - OUTLET (SPA) - REDISEÑO PREMIUM
   Controlador para panel administrativo
   ======================================== */

// Storage key para productos
const ADMIN_STORAGE_KEY = 'outlet_admin_products';

// Datos iniciales de productos (con imágenes más elegantes)
const defaultProducts = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=100&h=100&fit=crop",
        name: "Vestido de Seda Noir",
        price: 1250,
        stock: 10,
        status: "Activo"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100&h=100&fit=crop",
        name: "Blazer Estructurado",
        price: 890,
        stock: 5,
        status: "Activo"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop",
        name: "Bolso Clutch Gold",
        price: 1800,
        stock: 0,
        status: "Inactivo"
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop",
        name: "Zapatos Tacco Alto",
        price: 650,
        stock: 8,
        status: "Activo"
    }
];

let adminProducts = [];
let editingProductId = null;

/**
 * Cargar estilos CSS (verifica si ya existen)
 */
function loadAdminStyles() {
    if (document.querySelector('link[href*="homeAdmin.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/homeAdmin.css';
    document.head.appendChild(link);
}

/**
 * Cargar productos desde localStorage
 */
function loadAdminProducts() {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) {
        adminProducts = JSON.parse(saved);
    } else {
        adminProducts = [...defaultProducts];
        saveAdminProducts();
    }
}

/**
 * Guardar productos en localStorage
 */
function saveAdminProducts() {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProducts));
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
 * Mostrar notificación elegante
 */
function showAdminNotification(message, isError = false) {
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = message;
    
    if (isError) {
        toast.style.borderLeftColor = '#ef4444';
        toast.style.color = '#fecaca';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

/**
 * Renderizar tabla de productos
 */
function renderProductsTable() {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;

    if (adminProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px 20px; color: #b0a88c;">
                    <i class="fa-regular fa-box-open" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
                    No hay productos registrados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = adminProducts.map(product => `
        <tr data-id="${product.id}">
            <td><img src="${product.image}" class="product-image" alt="${product.name}" onerror="this.src='https://picsum.photos/id/20/100/100'"></td>
            <td><strong>${escapeHtml(product.name)}</strong></td>
            <td>${formatMoney(product.price)}</td>
            <td>${product.stock}</td>
            <td>
                <span class="status ${product.status === 'Activo' ? 'status-active' : 'status-inactive'}">
                    ${product.status}
                </span>
            </td>
            <td>
                <button class="admin-action-btn edit" data-id="${product.id}" data-action="edit" title="Editar">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="admin-action-btn delete" data-id="${product.id}" data-action="delete" title="Eliminar">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Eventos de acciones
    document.querySelectorAll('.admin-action-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            openEditModal(id);
        });
    });

    document.querySelectorAll('.admin-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            deleteProduct(id);
        });
    });
}

// Función auxiliar para escapar HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/**
 * Actualizar estadísticas
 */
function updateStats() {
    const productsCountEl = document.getElementById('productsCount');
    const usersCountEl = document.getElementById('usersCount');
    const ordersCountEl = document.getElementById('ordersCount');
    const salesCountEl = document.getElementById('salesCount');
    
    if (productsCountEl) productsCountEl.textContent = adminProducts.length;
    if (usersCountEl) usersCountEl.textContent = '128';
    if (ordersCountEl) ordersCountEl.textContent = '342';
    
    const totalSales = adminProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    if (salesCountEl) salesCountEl.textContent = formatMoney(totalSales);
}

/**
 * Abrir modal para agregar producto
 */
function openAddModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Agregar Producto';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productStatus').value = 'Activo';
    document.getElementById('productModal').style.display = 'flex';
}

/**
 * Abrir modal para editar producto
 */
function openEditModal(id) {
    const product = adminProducts.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productStatus').value = product.status;
    document.getElementById('productModal').style.display = 'flex';
}

/**
 * Cerrar modal
 */
function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
    editingProductId = null;
}

/**
 * Guardar producto (crear o editar)
 */
function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    let image = document.getElementById('productImage').value.trim();
    const status = document.getElementById('productStatus').value;
    
    if (!name) {
        showAdminNotification('El nombre del producto es obligatorio', true);
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        showAdminNotification('Ingrese un precio válido', true);
        return;
    }
    
    if (isNaN(stock) || stock < 0) {
        showAdminNotification('Ingrese un stock válido', true);
        return;
    }
    
    if (!image) {
        showAdminNotification('Ingrese una URL de imagen', true);
        return;
    }
    
    if (!image.startsWith('http')) {
        image = 'https://picsum.photos/id/20/100/100';
    }
    
    if (editingProductId) {
        const index = adminProducts.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            adminProducts[index] = {
                ...adminProducts[index],
                name,
                price,
                stock,
                image,
                status
            };
            showAdminNotification(`✏️ Producto "${name}" actualizado`);
        }
    } else {
        const newId = adminProducts.length > 0 ? Math.max(...adminProducts.map(p => p.id)) + 1 : 1;
        adminProducts.push({
            id: newId,
            name,
            price,
            stock,
            image,
            status
        });
        showAdminNotification(`✅ Producto "${name}" agregado`);
    }
    
    saveAdminProducts();
    renderProductsTable();
    updateStats();
    closeModal();
}

/**
 * Eliminar producto
 */
function deleteProduct(id) {
    const product = adminProducts.find(p => p.id === id);
    if (!product) return;
    
    if (confirm(`¿Eliminar "${product.name}" permanentemente?`)) {
        adminProducts = adminProducts.filter(p => p.id !== id);
        saveAdminProducts();
        renderProductsTable();
        updateStats();
        showAdminNotification(`🗑️ "${product.name}" eliminado`);
    }
}

/**
 * Cerrar sesión
 */
function logout() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('outlet_admin_auth');
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/login');
        } else {
            window.location.href = '/login';
        }
    }
}

/**
 * Verificar autenticación (opcional)
 */
function checkAdminAuth() {
    return true;
}

/**
 * Inicializar sidebar (si se incluye en el layout)
 */
function initAdminSidebar() {
    const menuLinks = document.querySelectorAll('.admin-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const route = link.getAttribute('data-route');
            if (route && typeof window.navigateTo === 'function') {
                window.navigateTo(route);
            }
        });
    });
}

/**
 * Agregar botón de menú móvil y funcionalidad
 */
function initMobileMenu() {
    if (document.querySelector('.mobile-menu-btn')) return;
    
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-menu-btn';
    mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileBtn.setAttribute('aria-label', 'Abrir menú');
    document.body.appendChild(mobileBtn);
    
    const sidebar = document.querySelector('.admin-sidebar');
    
    mobileBtn.addEventListener('click', () => {
        if (sidebar) {
            sidebar.classList.toggle('open');
            const icon = mobileBtn.querySelector('i');
            icon.className = sidebar.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
        }
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
                sidebar.classList.remove('open');
                const icon = mobileBtn.querySelector('i');
                icon.className = 'fas fa-bars';
            }
        }
    });
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('open');
            if (mobileBtn) {
                const icon = mobileBtn.querySelector('i');
                icon.className = 'fas fa-bars';
            }
        }
    });
}

/**
 * Controlador principal
 */
export async function adminController() {
    console.log('👑 Admin Controller - Panel administrativo premium');
    
    checkAdminAuth();
    loadAdminStyles();
    loadAdminProducts();
    renderProductsTable();
    updateStats();
    
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) addBtn.addEventListener('click', openAddModal);
    
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    
    const saveBtn = document.getElementById('saveProductBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveProduct);
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    initAdminSidebar();
    initMobileMenu();
    
    console.log('✅ Admin panel premium loaded successfully');
}