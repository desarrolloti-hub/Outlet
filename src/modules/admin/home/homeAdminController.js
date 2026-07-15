/* ========================================
   ADMIN CONTROLLER - OUTLET (SPA)
   Versión simplificada con Firebase
   ======================================== */

import { ProductService } from '../../../services/productService.js';

// ========================================
// ESTADO
// ========================================

let adminProducts = [];
let editingProductId = null;

// ========================================
// CONSTANTES
// ========================================

const ADMIN_STORAGE_KEY = 'outlet_admin_products';

// ========================================
// PRODUCTOS DE EJEMPLO (fallback)
// ========================================

const DEMO_PRODUCTS = [
    {
        id: 'demo-1',
        nombre: 'Playera Oversize',
        precioVenta: 499,
        categoria: 'Hombre',
        imagenPrincipal: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop',
        name: 'Playera Oversize',
        price: 499,
        category: 'Hombre',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop'
    },
    {
        id: 'demo-2',
        nombre: 'Tenis Urban',
        precioVenta: 1299,
        categoria: 'Calzado',
        imagenPrincipal: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
        name: 'Tenis Urban',
        price: 1299,
        category: 'Calzado',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'
    },
    {
        id: 'demo-3',
        nombre: 'Vestido de Seda',
        precioVenta: 1250,
        categoria: 'Mujer',
        imagenPrincipal: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=200&fit=crop',
        name: 'Vestido de Seda',
        price: 1250,
        category: 'Mujer',
        image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=200&fit=crop'
    },
    {
        id: 'demo-4',
        nombre: 'Bolso de Mano',
        precioVenta: 890,
        categoria: 'Accesorios',
        imagenPrincipal: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop',
        name: 'Bolso de Mano',
        price: 890,
        category: 'Accesorios',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop'
    },
    {
        id: 'demo-5',
        nombre: 'Gafas de Sol',
        precioVenta: 350,
        categoria: 'Accesorios',
        imagenPrincipal: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop',
        name: 'Gafas de Sol',
        price: 350,
        category: 'Accesorios',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop'
    },
    {
        id: 'demo-6',
        nombre: 'Chaqueta de Cuero',
        precioVenta: 1599,
        categoria: 'Hombre',
        imagenPrincipal: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop',
        name: 'Chaqueta de Cuero',
        price: 1599,
        category: 'Hombre',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop'
    }
];

// ========================================
// HELPERS
// ========================================

function formatMoney(amount) {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(message, isError = false) {
    // Eliminar toast anterior
    const old = document.querySelector('.admin-toast');
    if (old) old.remove();
    
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 9999;
        background: ${isError ? '#1a0a0a' : '#1a1a1a'};
        color: ${isError ? '#fecaca' : '#ddab3b'};
        padding: 12px 24px;
        border-radius: 12px;
        border-left: 4px solid ${isError ? '#ef4444' : '#ddab3b'};
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        font-weight: 500;
        font-size: 13px;
        font-family: 'Inter', sans-serif;
        animation: slideInRight 0.3s ease;
        max-width: 90%;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// RENDERIZAR TABLA
// ========================================

function renderProducts() {
    const tbody = document.getElementById('productsTable');
    if (!tbody) {
        console.error('❌ #productsTable no encontrado');
        return;
    }

    // Si no hay productos, mostrar mensaje
    if (!adminProducts || adminProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px 20px; color: #b0a88c;">
                    <i class="fa-regular fa-box-open" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
                    No hay productos registrados
                    <br>
                    <small style="display: block; margin-top: 8px; font-size: 12px;">Haz clic en "Agregar producto" para empezar</small>
                </td>
            </tr>
        `;
        return;
    }

    console.log(`📊 Renderizando ${adminProducts.length} productos`);

    tbody.innerHTML = adminProducts.map(product => {
        const imageUrl = product.imagenPrincipal || product.image || 'https://placehold.co/100x100?text=Sin+imagen';
        const name = product.nombre || product.name || 'Sin nombre';
        const price = product.precioVenta || product.price || 0;
        const category = product.categoria || product.category || 'Sin categoría';
        const id = product.id || product._id || '';

        return `
            <tr data-id="${id}">
                <td data-label="Imagen">
                    <img src="${imageUrl}" 
                         class="product-image" 
                         alt="${escapeHtml(name)}" 
                         onerror="this.src='https://placehold.co/100x100?text=Error'"
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #eaeaea;">
                </td>
                <td data-label="Producto"><strong>${escapeHtml(name)}</strong></td>
                <td data-label="Precio">${formatMoney(price)}</td>
                <td data-label="Categoría">${escapeHtml(category)}</td>
                <td data-label="Acciones">
                    <button class="admin-action-btn edit" data-id="${id}" data-action="edit" title="Editar" style="background: rgba(221, 171, 59, 0.1); border: none; cursor: pointer; padding: 8px 12px; border-radius: 6px; transition: all 0.2s; color: #666; margin-right: 4px;">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="admin-action-btn delete" data-id="${id}" data-action="delete" title="Eliminar" style="background: rgba(239, 68, 68, 0.1); border: none; cursor: pointer; padding: 8px 12px; border-radius: 6px; transition: all 0.2s; color: #666;">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Eventos - Editar (REDIRIGE A editProducts)
    document.querySelectorAll('.admin-action-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            if (id) goToEditProduct(id);
        });
    });

    // Eventos - Eliminar
    document.querySelectorAll('.admin-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            if (id) deleteProduct(id);
        });
    });
}

// ========================================
// ACTUALIZAR ESTADÍSTICAS
// ========================================

function updateStats() {
    const productsCount = document.getElementById('productsCount');
    if (productsCount) productsCount.textContent = adminProducts.length;

    const totalSales = adminProducts.reduce((sum, p) => sum + ((p.precioVenta || p.price || 0) * 10), 0);
    const salesCount = document.getElementById('salesCount');
    if (salesCount) salesCount.textContent = formatMoney(totalSales);
}

// ========================================
// CARGAR PRODUCTOS - PRINCIPAL
// ========================================

async function loadProducts() {
    console.log('🔄 Cargando productos...');
    
    // Primero intentar desde localStorage
    try {
        const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) {
                adminProducts = parsed;
                console.log('📂 Cargados desde localStorage:', adminProducts.length);
                renderProducts();
                updateStats();
                showToast(`📂 ${adminProducts.length} productos cargados (local)`);
            }
        }
    } catch (e) {
        console.warn('Error leyendo localStorage:', e);
    }

    // Luego intentar desde Firebase
    try {
        console.log('📡 Intentando cargar desde Firebase...');
        const products = await ProductService.getAll({}, 'createdAt', 'desc', 100);
        
        if (products && products.length > 0) {
            console.log('✅ Productos de Firebase:', products.length);
            
            // Mapear productos
            adminProducts = products.map(p => ({
                ...p,
                name: p.nombre || p.name || 'Sin nombre',
                price: p.precioVenta || p.price || 0,
                category: p.categoria || p.category || 'Sin categoría',
                image: p.imagenPrincipal || p.image || 'https://placehold.co/100x100?text=Sin+imagen'
            }));
            
            // Guardar en localStorage como backup
            localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProducts));
            
            renderProducts();
            updateStats();
            showToast(`✅ ${adminProducts.length} productos cargados desde Firebase`);
        } else {
            // Si Firebase no tiene productos, usar demo
            if (!localStorage.getItem(ADMIN_STORAGE_KEY)) {
                useDemoProducts();
            }
        }
    } catch (error) {
        console.error('❌ Error en Firebase:', error);
        
        // Si no hay productos en localStorage, usar demo
        if (!localStorage.getItem(ADMIN_STORAGE_KEY)) {
            useDemoProducts();
        } else {
            showToast('⚠️ Usando datos locales (Firebase no disponible)', true);
        }
    }
}

// ========================================
// USAR PRODUCTOS DE DEMO
// ========================================

function useDemoProducts() {
    console.log('📦 Usando productos de demo');
    adminProducts = DEMO_PRODUCTS;
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProducts));
    renderProducts();
    updateStats();
    showToast('📦 Usando productos de ejemplo');
}

// ========================================
// GUARDAR PRODUCTO
// ========================================

async function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value.trim();
    let image = document.getElementById('productImage').value.trim();

    // Validaciones
    if (!name) { showToast('El nombre es obligatorio', true); return; }
    if (isNaN(price) || price <= 0) { showToast('Precio inválido', true); return; }
    if (!category) { showToast('La categoría es obligatoria', true); return; }
    if (!image) { showToast('Ingresa una URL de imagen', true); return; }
    if (!image.startsWith('http')) {
        image = 'https://placehold.co/200x200?text=Producto';
    }

    try {
        if (editingProductId) {
            // EDITAR
            const updateData = {
                nombre: name,
                precioVenta: price,
                categoria: category,
                imagenPrincipal: image,
                name: name,
                price: price,
                category: category,
                image: image
            };

            await ProductService.update(editingProductId, updateData);

            // Actualizar array local
            const index = adminProducts.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                adminProducts[index] = {
                    ...adminProducts[index],
                    nombre: name,
                    precioVenta: price,
                    categoria: category,
                    imagenPrincipal: image,
                    name: name,
                    price: price,
                    category: category,
                    image: image
                };
            }

            showToast(`✏️ "${name}" actualizado`);
        } else {
            // CREAR
            const newProduct = {
                sku: `PROD-${Date.now()}`,
                nombre: name,
                descripcion: `Producto: ${name}`,
                marca: 'Outlet Store',
                categoria: category,
                genero: 'unisex',
                precioCompra: price * 0.6,
                precioVenta: price,
                porcentajeDescuento: 0,
                imagenPrincipal: image,
                galeriaImagenes: [],
                colores: [],
                tallas: [],
                materiales: [],
                stock: 10,
                estado: 'activo',
                destacado: false
            };

            const created = await ProductService.create(newProduct);
            
            adminProducts.push({
                id: created.id,
                nombre: created.nombre,
                precioVenta: created.precioVenta,
                categoria: created.categoria,
                imagenPrincipal: created.imagenPrincipal,
                name: created.nombre,
                price: created.precioVenta,
                category: created.categoria,
                image: created.imagenPrincipal
            });

            showToast(`✅ "${name}" agregado`);
        }

        // Guardar backup y renderizar
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProducts));
        renderProducts();
        updateStats();
        closeModal();

    } catch (error) {
        console.error('❌ Error:', error);
        showToast('Error: ' + error.message, true);
    }
}

// ========================================
// ELIMINAR PRODUCTO
// ========================================

async function deleteProduct(id) {
    const product = adminProducts.find(p => p.id === id);
    if (!product) return;

    const name = product.nombre || product.name || 'Producto';
    
    if (!confirm(`¿Eliminar "${name}" permanentemente?`)) return;

    try {
        await ProductService.delete(id, false);
        
        adminProducts = adminProducts.filter(p => p.id !== id);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProducts));
        
        renderProducts();
        updateStats();
        showToast(`🗑️ "${name}" eliminado`);
    } catch (error) {
        console.error('❌ Error eliminando:', error);
        showToast('Error al eliminar: ' + error.message, true);
    }
}

// ========================================
// FUNCIÓN: Redirigir a la página de edición de productos
// ========================================
function goToEditProduct(productId) {
    if (!productId) {
        showToast('ID de producto no válido', true);
        return;
    }
    
    console.log('✏️ Editando producto ID:', productId);
    
    // Usar el sistema de navegación SPA si existe
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/editProducts?id=' + encodeURIComponent(productId));
    } else {
        // Navegación tradicional
        window.location.href = '/editProducts.html?id=' + encodeURIComponent(productId);
    }
}

// ========================================
// FUNCIÓN: Redirigir a la página de creación de productos
// ========================================
function goToCreateProduct() {
    // Usar el sistema de navegación SPA si existe
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/createProducts');
    } else {
        // Navegación tradicional
        window.location.href = '/createProducts.html';
    }
}

// ========================================
// MODAL
// ========================================

function openAddModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Agregar Producto';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    editingProductId = null;
}

// ========================================
// CERRAR SESIÓN
// ========================================

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('outlet_admin_auth');
        window.location.href = '/login';
    }
}

// ========================================
// INICIAR
// ========================================

export async function adminController() {
    console.log('👑 Admin Controller iniciando...');
    
    // Verificar DOM
    const tbody = document.getElementById('productsTable');
    if (!tbody) {
        console.error('❌ #productsTable no encontrado. Verifica el HTML.');
        return;
    }

    // Cargar estilos (si no están)
    if (!document.querySelector('link[href*="homeAdmin.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/homeAdmin.css';
        document.head.appendChild(link);
    }

    // Agregar animación para el toast
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .admin-toast {
            animation: slideInRight 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    // Cargar productos
    await loadProducts();

    // ========================================
    // CONFIGURAR EVENTOS
    // ========================================
    
    // ✅ BOTÓN AGREGAR PRODUCTO - Redirige a createProducts
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        // Eliminar event listeners anteriores (si los hay)
        const newBtn = addProductBtn.cloneNode(true);
        addProductBtn.parentNode.replaceChild(newBtn, addProductBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            goToCreateProduct();
        });
    } else {
        console.warn('⚠️ Botón #addProductBtn no encontrado en el DOM');
    }

    // Eventos del modal (ya no se usan para editar, se mantienen por compatibilidad)
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('saveProductBtn')?.addEventListener('click', saveProduct);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    // Cerrar modal al hacer clic fuera
    document.getElementById('productModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    // Escuchar actualizaciones desde otros tabs
    window.addEventListener('products:updated', () => {
        loadProducts();
    });

    // Exponer para debug
    window.adminDebug = {
        products: () => adminProducts,
        refresh: loadProducts,
        demo: useDemoProducts,
        stats: updateStats,
        goToCreate: goToCreateProduct,
        goToEdit: goToEditProduct
    };

    console.log('✅ Admin Controller listo');
    console.log('📌 Para debug: window.adminDebug');
}