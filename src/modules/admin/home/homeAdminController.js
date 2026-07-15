/* ========================================
   ADMIN CONTROLLER - OUTLET (SPA)
   Versión mejorada con Firebase y sincronización
   ======================================== */

import { ProductService } from '../../../services/productService.js';

// ========================================
// ESTADO
// ========================================

let adminProducts = [];
let editingProductId = null;
let isLoading = false;

// ========================================
// CONSTANTES
// ========================================

const ADMIN_STORAGE_KEY = 'outlet_admin_products';

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
        z-index: 99999;
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

    console.log('🔄 Renderizando productos. isLoading:', isLoading, 'adminProducts.length:', adminProducts?.length || 0);

    // Mostrar loading si está cargando
    if (isLoading) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px 20px; color: #b0a88c;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
                    Cargando productos...
                </td>
            </tr>
        `;
        return;
    }

    // Si no hay productos
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
        const id = product.id || product._id || '';
        const name = product.nombre || product.name || 'Sin nombre';
        const price = product.precioVenta || product.price || 0;
        const category = product.categoria || product.category || 'Sin categoría';
        const imageUrl = product.imagenPrincipal || product.image || 'https://placehold.co/100x100?text=Sin+imagen';

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

    // Eventos - Editar
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

    const usersCount = document.getElementById('usersCount');
    if (usersCount) usersCount.textContent = '0';

    const ordersCount = document.getElementById('ordersCount');
    if (ordersCount) ordersCount.textContent = '0';

    const totalSales = adminProducts.reduce((sum, p) => sum + ((p.precioVenta || p.price || 0) * 10), 0);
    const salesCount = document.getElementById('salesCount');
    if (salesCount) salesCount.textContent = formatMoney(totalSales);
}

// ========================================
// NORMALIZAR PRODUCTO
// ========================================

function normalizeProduct(product) {
    return {
        id: product.id || product._id || '',
        nombre: product.nombre || product.name || 'Sin nombre',
        precioVenta: product.precioVenta || product.price || 0,
        categoria: product.categoria || product.category || 'Sin categoría',
        imagenPrincipal: product.imagenPrincipal || product.image || 'https://placehold.co/100x100?text=Sin+imagen',
        ...product
    };
}

// ========================================
// CARGAR PRODUCTOS - PRINCIPAL
// ========================================

async function loadProducts(showLoading = true) {
    console.log('🔄 loadProducts() iniciado...');
    
    if (showLoading) {
        isLoading = true;
        renderProducts();
    }

    try {
        // 1. INTENTAR DESDE FIRESTORE
        console.log('📡 Intentando cargar desde Firebase...');
        console.log('📡 ProductService disponible:', typeof ProductService !== 'undefined');
        console.log('📡 ProductService.getAll:', typeof ProductService?.getAll);
        
        const products = await ProductService.getAll({}, 'createdAt', 'desc', 100);
        console.log('📡 Respuesta de Firebase:', products);
        
        if (products && products.length > 0) {
            console.log('✅ Productos de Firebase:', products.length);
            
            adminProducts = products.map(p => normalizeProduct(p));
            console.log('📦 Productos normalizados:', adminProducts.length);
            
            localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProducts));
            
            isLoading = false;
            renderProducts();
            updateStats();
            showToast(`✅ ${adminProducts.length} productos cargados desde Firebase`);
            return;
        }
        
        // 2. SI FIRESTORE NO TIENE DATOS, INTENTAR LOCALSTORAGE
        console.log('📂 Firebase vacío, intentando localStorage...');
        const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
        console.log('📂 localStorage data:', saved ? 'encontrado' : 'no encontrado');
        
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) {
                adminProducts = parsed.map(p => normalizeProduct(p));
                console.log('📂 Cargados desde localStorage:', adminProducts.length);
                isLoading = false;
                renderProducts();
                updateStats();
                showToast(`📂 ${adminProducts.length} productos cargados (local)`);
                return;
            }
        }
        
        // 3. SI NO HAY NADA, USAR DEMO
        console.log('📦 No hay datos, usando productos de demo');
        useDemoProducts();
        
    } catch (error) {
        console.error('❌ Error en loadProducts:', error);
        console.error('❌ Stack trace:', error.stack);
        
        // Intentar localStorage como fallback
        try {
            const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.length > 0) {
                    adminProducts = parsed.map(p => normalizeProduct(p));
                    isLoading = false;
                    renderProducts();
                    updateStats();
                    showToast('⚠️ Usando datos locales (Firebase no disponible)', true);
                    return;
                }
            }
        } catch (e) {
            console.warn('Error leyendo localStorage:', e);
        }
        
        // Último recurso: demo
        useDemoProducts();
    } finally {
        isLoading = false;
    }
}

// ========================================
// USAR PRODUCTOS DE DEMO
// ========================================

function useDemoProducts() {
    const DEMO_PRODUCTS = [
        {
            id: 'demo-1',
            nombre: 'Playera Oversize',
            precioVenta: 499,
            categoria: 'Hombre',
            imagenPrincipal: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop'
        },
        {
            id: 'demo-2',
            nombre: 'Tenis Urban',
            precioVenta: 1299,
            categoria: 'Calzado',
            imagenPrincipal: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'
        },
        {
            id: 'demo-3',
            nombre: 'Vestido de Seda',
            precioVenta: 1250,
            categoria: 'Mujer',
            imagenPrincipal: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=200&fit=crop'
        },
        {
            id: 'demo-4',
            nombre: 'Bolso de Mano',
            precioVenta: 890,
            categoria: 'Accesorios',
            imagenPrincipal: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop'
        },
        {
            id: 'demo-5',
            nombre: 'Gafas de Sol',
            precioVenta: 350,
            categoria: 'Accesorios',
            imagenPrincipal: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop'
        },
        {
            id: 'demo-6',
            nombre: 'Chaqueta de Cuero',
            precioVenta: 1599,
            categoria: 'Hombre',
            imagenPrincipal: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop'
        }
    ];
    
    console.log('📦 Usando productos de demo');
    adminProducts = DEMO_PRODUCTS;
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProducts));
    isLoading = false;
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

    if (!name) { showToast('El nombre es obligatorio', true); return; }
    if (isNaN(price) || price <= 0) { showToast('Precio inválido', true); return; }
    if (!category) { showToast('La categoría es obligatoria', true); return; }
    if (!image) { showToast('Ingresa una URL de imagen', true); return; }
    if (!image.startsWith('http')) {
        image = 'https://placehold.co/200x200?text=Producto';
    }

    try {
        if (editingProductId) {
            const updateData = {
                nombre: name,
                precioVenta: price,
                categoria: category,
                imagenPrincipal: image
            };

            await ProductService.update(editingProductId, updateData);

            const index = adminProducts.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                adminProducts[index] = normalizeProduct({
                    ...adminProducts[index],
                    nombre: name,
                    precioVenta: price,
                    categoria: category,
                    imagenPrincipal: image
                });
            }

            showToast(`✏️ "${name}" actualizado`);
        } else {
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
            
            adminProducts.push(normalizeProduct(created));
            showToast(`✅ "${name}" agregado`);
        }

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
// NAVEGACIÓN
// ========================================

function goToEditProduct(productId) {
    if (!productId) {
        showToast('ID de producto no válido', true);
        return;
    }
    
    console.log('✏️ Editando producto ID:', productId);
    
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/editProducts?id=' + encodeURIComponent(productId));
    } else {
        window.location.href = '/editProducts.html?id=' + encodeURIComponent(productId);
    }
}

function goToCreateProduct() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/createProducts');
    } else {
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
// ESCUCHAR ACTUALIZACIONES
// ========================================

function setupRealtimeUpdates() {
    window.addEventListener('products:updated', (event) => {
        console.log('🔄 Productos actualizados:', event.detail);
        loadProducts(false);
    });

    window.addEventListener('storage', (event) => {
        if (event.key === ADMIN_STORAGE_KEY) {
            console.log('🔄 Cambio detectado en localStorage, recargando...');
            loadProducts(false);
        }
    });
}

// ========================================
// INICIAR - VERSIÓN CON MÁS LOGS
// ========================================

export async function adminController() {
    console.log('👑 Admin Controller iniciando...');
    console.log('📋 DOM Elements:');
    console.log('  - productsTable:', document.getElementById('productsTable'));
    console.log('  - addProductBtn:', document.getElementById('addProductBtn'));
    console.log('  - productsCount:', document.getElementById('productsCount'));
    
    const tbody = document.getElementById('productsTable');
    if (!tbody) {
        console.error('❌ #productsTable no encontrado. Verifica el HTML.');
        showToast('Error: #productsTable no encontrado', true);
        return;
    }

    // Cargar estilos
    if (!document.querySelector('link[href*="homeAdmin.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/homeAdmin.css';
        document.head.appendChild(link);
        console.log('✅ Estilos homeAdmin.css cargados');
    }

    // Agregar animaciones
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

    // CONFIGURAR EVENTOS DEL BOTÓN AGREGAR
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        console.log('✅ addProductBtn encontrado, configurando evento...');
        const newBtn = addProductBtn.cloneNode(true);
        addProductBtn.parentNode.replaceChild(newBtn, addProductBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Botón "Agregar producto" clickeado');
            goToCreateProduct();
        });
    } else {
        console.warn('⚠️ Botón #addProductBtn no encontrado en el DOM');
    }

    // CONFIGURAR EVENTOS DEL MODAL
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const productModal = document.getElementById('productModal');

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (saveProductBtn) saveProductBtn.addEventListener('click', saveProduct);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
    }

    // ✅ ESCUCHAR ACTUALIZACIONES
    setupRealtimeUpdates();

    // ✅ CARGAR PRODUCTOS - CON MANEJO DE ERRORES
    console.log('🚀 Iniciando carga de productos...');
    try {
        await loadProducts(true);
        console.log('✅ Productos cargados exitosamente');
    } catch (error) {
        console.error('❌ Error en carga inicial:', error);
        showToast('Error al cargar productos: ' + error.message, true);
    }

    // Exponer para debug
    window.adminDebug = {
        products: () => adminProducts,
        refresh: () => loadProducts(true),
        demo: useDemoProducts,
        stats: updateStats,
        goToCreate: goToCreateProduct,
        goToEdit: goToEditProduct,
        forceReload: () => {
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            loadProducts(true);
        },
        clearCache: () => {
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            console.log('🧹 Cache limpiada');
            showToast('🧹 Cache limpiada, recargando...');
            loadProducts(true);
        },
        showState: () => {
            console.log('📊 Estado actual:');
            console.log('  - adminProducts:', adminProducts);
            console.log('  - isLoading:', isLoading);
            console.log('  - editingProductId:', editingProductId);
            console.log('  - localStorage:', localStorage.getItem(ADMIN_STORAGE_KEY));
        }
    };

    console.log('✅ Admin Controller listo');
    console.log('📌 Para debug: window.adminDebug');
    console.log('📌 Para ver estado: window.adminDebug.showState()');
    console.log('📌 Para forzar recarga: window.adminDebug.forceReload()');
    console.log('📌 Para limpiar cache: window.adminDebug.clearCache()');
}