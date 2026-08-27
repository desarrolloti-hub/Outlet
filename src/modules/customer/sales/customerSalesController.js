// ========================================
// CUSTOMER SALES CONTROLLER
// Panel de ventas para clientes - ver historial de compras
// CON SWEETALERT2 Y SINCRONIZACIÓN CON FIREBASE
// ========================================

import { SalesService } from '../../../services/salesService.js';

// ========================================
// Variables de estado
// ========================================
let sales = [];
let currentPage = 1;
const PAGE_SIZE = 20;
let lastDoc = null;
let hasMore = true;
let currentUserId = null;
let currentUser = null;

// Filtros
let currentFilters = {
    orderStatus: '',
    sort: 'recent'
};

// ========================================
// DOM Elements
// ========================================
let elements = {};

// ========================================
// UI Helpers - CON SWEETALERT2
// ========================================

function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    let toastExistente = document.querySelector('.customer-sales-toast');
    if (toastExistente) toastExistente.remove();

    const toast = document.createElement('div');
    toast.className = `customer-sales-toast ${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function mostrarSweetAlert(options) {
    const defaultOptions = {
        buttonsStyling: false,
        customClass: {
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel',
            popup: 'swal2-popup'
        }
    };
    return Swal.fire(Object.assign({}, defaultOptions, options));
}

function mostrarError(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'error',
        title: titulo || '¡Oops!',
        text: mensaje || 'Ocurrió un error inesperado.',
        confirmButtonText: 'Entendido'
    });
}

function mostrarLoading(mensaje) {
    return mostrarSweetAlert({
        title: mensaje || 'Cargando...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function cerrarLoading() {
    Swal.close();
}

// ========================================
// Cache de elementos DOM
// ========================================

function cacheElements() {
    elements = {
        // Stats
        totalOrders: document.getElementById('totalOrders'),
        totalSpent: document.getElementById('totalSpent'),
        pendingOrders: document.getElementById('pendingOrders'),
        deliveredOrders: document.getElementById('deliveredOrders'),

        // Filtros
        filterStatus: document.getElementById('filterStatus'),
        filterSort: document.getElementById('filterSort'),
        applyFiltersBtn: document.getElementById('applyFiltersBtn'),

        // Tabla
        salesTableBody: document.getElementById('salesTableBody'),
        salesCardsGrid: document.getElementById('salesCardsGrid'),
        salesCount: document.getElementById('salesCount'),

        // Paginación
        prevPageBtn: document.getElementById('prevPageBtn'),
        nextPageBtn: document.getElementById('nextPageBtn'),
        pageInfo: document.getElementById('pageInfo'),

        // Botones
        refreshBtn: document.getElementById('refreshBtn'),

        // Modal
        saleModal: document.getElementById('saleModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        modalCloseBtn: document.getElementById('modalCloseBtn')
    };
}

// ========================================
// Obtener usuario desde localStorage
// ========================================

function getCustomerFromLocalStorage() {
    try {
        const customerData = localStorage.getItem('outlet_customer');
        if (!customerData) {
            console.log('⚠️ No se encontró outlet_customer en localStorage');
            return null;
        }

        const customer = JSON.parse(customerData);
        console.log('✅ Usuario encontrado en localStorage:', customer);

        // Verificar que tenga el campo 'id'
        if (!customer.id) {
            console.log('⚠️ El usuario no tiene campo "id"');
            return null;
        }

        return customer;
    } catch (error) {
        console.error('❌ Error al leer outlet_customer del localStorage:', error);
        return null;
    }
}

// ========================================
// Renderizado de la tabla
// ========================================

function renderSalesTable() {
    if (!elements.salesTableBody) return;

    if (!currentUserId) {
        elements.salesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="customer-sales-table-empty">
                    <div class="customer-sales-empty-state">
                        <span class="material-symbols-outlined">login</span>
                        <p>Inicia sesión para ver tus pedidos</p>
                        <small>Tu historial de compras aparecerá aquí</small>
                    </div>
                </td>
            </tr>
        `;
        if (elements.salesCardsGrid) {
            elements.salesCardsGrid.innerHTML = `
                <div class="customer-sales-empty-state">
                    <span class="material-symbols-outlined">login</span>
                    <p>Inicia sesión para ver tus pedidos</p>
                    <small>Tu historial de compras aparecerá aquí</small>
                </div>
            `;
        }
        if (elements.salesCount) {
            elements.salesCount.textContent = '0 pedidos';
        }
        return;
    }

    if (sales.length === 0) {
        elements.salesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="customer-sales-table-empty">
                    <div class="customer-sales-empty-state">
                        <span class="material-symbols-outlined">inbox</span>
                        <p>No tienes pedidos aún</p>
                        <small>¡Empieza a comprar y tus pedidos aparecerán aquí!</small>
                    </div>
                </td>
            </tr>
        `;
        if (elements.salesCardsGrid) {
            elements.salesCardsGrid.innerHTML = `
                <div class="customer-sales-empty-state">
                    <span class="material-symbols-outlined">inbox</span>
                    <p>No tienes pedidos aún</p>
                    <small>¡Empieza a comprar y tus pedidos aparecerán aquí!</small>
                </div>
            `;
        }
        if (elements.salesCount) {
            elements.salesCount.textContent = '0 pedidos';
        }
        return;
    }

    let html = '';
    let cardsHtml = '';
    sales.forEach(sale => {
        const statusClass = `status-${sale.orderStatus || 'confirmada'}`;
        const paymentClass = `payment-${sale.paymentStatus || 'pendiente'}`;

        const customerName = sale.customerName || 'Cliente';
        const customerEmail = sale.customerEmail || '';

        html += `
            <tr data-id="${sale.id}">
                <td>
                    <strong style="color: var(--outlet-gold); font-size:0.85rem;">${sale.orderNumber || 'N/A'}</strong>
                </td>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <span style="font-weight:500;">${customerName}</span>
                        <small style="color: var(--outlet-text-secondary); font-size:0.7rem;">${customerEmail}</small>
                    </div>
                </td>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <span>${sale.totalItems || 0} items</span>
                        <small style="color: var(--outlet-text-secondary); font-size:0.7rem;">${sale.uniqueProducts || sale.items?.length || 0} productos</small>
                    </div>
                </td>
                <td>
                    <strong style="color: var(--outlet-gold); font-size:1rem;">$${(sale.total || 0).toFixed(2)}</strong>
                </td>
                <td>
                    <span class="customer-sales-status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        ${sale.orderStatusLabel || sale.orderStatus || 'Confirmada'}
                    </span>
                </td>
                <td>
                    <span class="customer-sales-payment-badge ${paymentClass}">
                        <span class="payment-dot"></span>
                        ${sale.paymentMethodLabel || sale.paymentStatus || 'Pendiente'}
                    </span>
                </td>
                <td>
                    <span style="font-size:0.75rem; color: var(--outlet-text-secondary);">
                        ${sale.orderDate ? new Date(sale.orderDate).toLocaleDateString('es-ES') : '-'}
                    </span>
                </td>
                <td>
                    <div class="customer-sales-actions-cell">
                        <button class="customer-sales-action-btn view" data-id="${sale.id}" title="Ver detalle">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;

        cardsHtml += `
            <div class="customer-sales-card" data-id="${sale.id}">
                <div class="customer-sales-card-top">
                    <strong class="customer-sales-card-number" style="color: var(--outlet-gold);">${sale.orderNumber || 'N/A'}</strong>
                    <strong style="color: var(--outlet-gold); font-size:1rem;">$${(sale.total || 0).toFixed(2)}</strong>
                </div>
                <div class="customer-sales-card-body">
                    <div class="customer-sales-card-row">
                        <span class="customer-sales-card-label">Productos</span>
                        <span>${sale.totalItems || 0} items · ${sale.uniqueProducts || sale.items?.length || 0} productos</span>
                    </div>
                    <div class="customer-sales-card-row">
                        <span class="customer-sales-card-label">Estado</span>
                        <span class="customer-sales-status-badge ${statusClass}">
                            <span class="status-dot"></span>
                            ${sale.orderStatusLabel || sale.orderStatus || 'Confirmada'}
                        </span>
                    </div>
                    <div class="customer-sales-card-row">
                        <span class="customer-sales-card-label">Pago</span>
                        <span class="customer-sales-payment-badge ${paymentClass}">
                            <span class="payment-dot"></span>
                            ${sale.paymentMethodLabel || sale.paymentStatus || 'Pendiente'}
                        </span>
                    </div>
                    <div class="customer-sales-card-row">
                        <span class="customer-sales-card-label">Fecha</span>
                        <span style="font-size:0.75rem; color: var(--outlet-text-secondary);">
                            ${sale.orderDate ? new Date(sale.orderDate).toLocaleDateString('es-ES') : '-'}
                        </span>
                    </div>
                </div>
                <div class="customer-sales-actions-cell customer-sales-card-actions">
                    <button class="customer-sales-action-btn view" data-id="${sale.id}" title="Ver detalle">
                        <span class="material-symbols-outlined">visibility</span>
                        <span>Ver detalle</span>
                    </button>
                </div>
            </div>
        `;
    });

    elements.salesTableBody.innerHTML = html;
    if (elements.salesCardsGrid) elements.salesCardsGrid.innerHTML = cardsHtml;

    if (elements.salesCount) {
        elements.salesCount.textContent = `${sales.length} pedidos`;
    }

    // Event listeners para acciones - solo ver detalle
    document.querySelectorAll('.customer-sales-action-btn.view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            viewSale(btn.dataset.id);
        });
    });

    // Click en la fila para ver detalle también
    document.querySelectorAll('.customer-sales-table tbody tr').forEach(row => {
        row.addEventListener('click', () => {
            const id = row.dataset.id;
            if (id) viewSale(id);
        });
    });

    // Click en la tarjeta para ver detalle también
    document.querySelectorAll('.customer-sales-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.customer-sales-action-btn')) return;
            const id = card.dataset.id;
            if (id) viewSale(id);
        });
    });
}

// ========================================
// Actualizar estadísticas
// ========================================

async function updateStats() {
    if (!currentUserId) {
        // Resetear stats si no hay usuario
        if (elements.totalOrders) elements.totalOrders.textContent = '0';
        if (elements.totalSpent) elements.totalSpent.textContent = '$0.00';
        if (elements.pendingOrders) elements.pendingOrders.textContent = '0';
        if (elements.deliveredOrders) elements.deliveredOrders.textContent = '0';
        return;
    }

    try {
        console.log('📊 Actualizando estadísticas para customerId:', currentUserId);

        // Usar getAll con filtro customerId
        const result = await SalesService.getAll(
            { customerId: currentUserId },
            'orderDate',
            'desc',
            1000 // Traer todos para calcular estadísticas
        );

        const userSales = result.items || [];
        console.log(`📊 Estadísticas: ${userSales.length} ventas encontradas`);

        const totalOrders = userSales.length;
        const totalSpent = userSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const pendingOrders = userSales.filter(s =>
            s.orderStatus !== 'entregada' && s.orderStatus !== 'cancelada'
        ).length;
        const deliveredOrders = userSales.filter(s =>
            s.orderStatus === 'entregada'
        ).length;

        if (elements.totalOrders) elements.totalOrders.textContent = totalOrders;
        if (elements.totalSpent) elements.totalSpent.textContent = `$${totalSpent.toFixed(2)}`;
        if (elements.pendingOrders) elements.pendingOrders.textContent = pendingOrders;
        if (elements.deliveredOrders) elements.deliveredOrders.textContent = deliveredOrders;

    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
        // No mostrar error al usuario, solo usar valores por defecto
    }
}

// ========================================
// Cargar ventas del cliente
// ========================================

async function loadSales(resetPage = true) {
    if (!currentUserId) {
        // Si no hay usuario, mostrar mensaje de login
        elements.salesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="customer-sales-table-empty">
                    <div class="customer-sales-empty-state">
                        <span class="material-symbols-outlined">login</span>
                        <p>Inicia sesión para ver tus pedidos</p>
                        <small>Tu historial de compras aparecerá aquí</small>
                    </div>
                </td>
            </tr>
        `;
        if (elements.salesCount) {
            elements.salesCount.textContent = '0 pedidos';
        }
        await updateStats();
        updatePagination();
        return;
    }

    try {
        if (resetPage) {
            currentPage = 1;
            lastDoc = null;
            hasMore = true;
        }

        const loading = mostrarLoading('Cargando tus pedidos...');

        // Construir filtros correctamente
        const filters = {
            customerId: currentUserId
        };
        if (currentFilters.orderStatus) {
            filters.orderStatus = currentFilters.orderStatus;
        }

        // Determinar orden
        let sortField = 'orderDate';
        let sortDirection = 'desc';

        switch (currentFilters.sort) {
            case 'oldest':
                sortDirection = 'asc';
                break;
            case 'highest':
                sortField = 'total';
                sortDirection = 'desc';
                break;
            case 'lowest':
                sortField = 'total';
                sortDirection = 'asc';
                break;
            default: // recent
                sortField = 'orderDate';
                sortDirection = 'desc';
                break;
        }

        console.log('🔍 Buscando ventas para customerId:', currentUserId);
        console.log('📋 Filtros:', filters);
        console.log('📋 Orden:', sortField, sortDirection);

        const result = await SalesService.getAll(
            filters,
            sortField,
            sortDirection,
            PAGE_SIZE,
            resetPage ? null : lastDoc
        );

        console.log('📦 Ventas encontradas:', result.items?.length || 0);
        if (result.items && result.items.length > 0) {
            console.log('📦 Primera venta:', result.items[0]);
        }

        if (resetPage) {
            sales = result.items || [];
        } else {
            sales = [...sales, ...(result.items || [])];
        }

        lastDoc = result.lastDoc;
        hasMore = result.hasMore;

        renderSalesTable();
        updatePagination();
        await updateStats();

        cerrarLoading();

        if (sales.length === 0 && !resetPage) {
            mostrarToast('No hay más pedidos para cargar', 'info');
        }

    } catch (error) {
        cerrarLoading();
        console.error('❌ Error cargando pedidos:', error);

        // Si el error es de autenticación, mostrar mensaje amigable
        if (error.message?.includes('auth') || error.message?.includes('permission') || error.message?.includes('permission-denied')) {
            elements.salesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="customer-sales-table-empty">
                        <div class="customer-sales-empty-state">
                            <span class="material-symbols-outlined">lock</span>
                            <p>Inicia sesión para ver tus pedidos</p>
                            <small>Tu historial de compras aparecerá aquí</small>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            // Mostrar error pero no bloquear la UI
            elements.salesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="customer-sales-table-empty">
                        <div class="customer-sales-empty-state">
                            <span class="material-symbols-outlined">error</span>
                            <p>Error al cargar tus pedidos</p>
                            <small>${error.message || 'Intenta de nuevo más tarde'}</small>
                        </div>
                    </td>
                </tr>
            `;
        }
        await updateStats();
        updatePagination();
    }
}

// ========================================
// Actualizar paginación
// ========================================

function updatePagination() {
    if (elements.pageInfo) {
        elements.pageInfo.textContent = `Página ${currentPage}`;
    }
    if (elements.prevPageBtn) {
        elements.prevPageBtn.disabled = currentPage <= 1;
    }
    if (elements.nextPageBtn) {
        elements.nextPageBtn.disabled = !hasMore;
    }
}

// ========================================
// Ver detalle de venta
// ========================================

async function viewSale(saleId) {
    if (!saleId) {
        await mostrarError('Error', 'ID de pedido no válido');
        return;
    }

    try {
        const loading = mostrarLoading('Cargando detalle del pedido...');

        const sale = await SalesService.getById(saleId, true);

        cerrarLoading();

        if (!sale) {
            await mostrarError('No encontrado', 'El pedido no existe.');
            return;
        }

        // Verificar que la venta pertenezca al usuario actual
        if (sale.customerId !== currentUserId) {
            await mostrarError('Acceso denegado', 'Este pedido no te pertenece.');
            return;
        }

        const statusClass = `status-${sale.orderStatus || 'confirmada'}`;
        const paymentClass = `payment-${sale.paymentStatus || 'pendiente'}`;

        let itemsHtml = '';
        if (sale.items && sale.items.length > 0) {
            sale.items.forEach(item => {
                itemsHtml += `
                    <div class="customer-sales-detail-item">
                        <div class="item-info">
                            <span class="item-name">${item.productName || 'Producto'}</span>
                            <span class="item-variant">
                                ${item.talla ? `Talla: ${item.talla}` : ''}
                                ${item.color ? `Color: ${item.color}` : ''}
                                x${item.cantidad || 1}
                            </span>
                        </div>
                        <span class="item-price">$${(item.precioFinal * (item.cantidad || 1)).toFixed(2)}</span>
                    </div>
                `;
            });
        } else {
            itemsHtml = `<p style="color: var(--outlet-text-secondary);">No hay productos en este pedido</p>`;
        }

        let statusHistoryHtml = '';
        if (sale.statusHistory && sale.statusHistory.length > 0) {
            sale.statusHistory.slice().reverse().forEach(entry => {
                const date = new Date(entry.date).toLocaleString('es-ES');
                statusHistoryHtml += `
                    <div class="customer-sales-detail-row">
                        <span class="label">${entry.status}</span>
                        <span>${date}</span>
                    </div>
                `;
            });
        }

        const statusLabels = {
            confirmada: 'Confirmada',
            preparando: 'Preparando',
            enviada: 'Enviada',
            entregada: 'Entregada',
            cancelada: 'Cancelada'
        };

        elements.modalTitle.textContent = `Pedido ${sale.orderNumberFormatted || sale.orderNumber}`;

        elements.modalBody.innerHTML = `
            <div class="customer-sales-detail-section">
                <h4>Información del Pedido</h4>
                <div class="customer-sales-detail-row">
                    <span class="label">Fecha</span>
                    <span>${sale.orderDate ? new Date(sale.orderDate).toLocaleString('es-ES') : '-'}</span>
                </div>
                <div class="customer-sales-detail-row">
                    <span class="label">Estado</span>
                    <span class="customer-sales-status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        ${statusLabels[sale.orderStatus] || sale.orderStatus || 'Confirmada'}
                    </span>
                </div>
                <div class="customer-sales-detail-row">
                    <span class="label">Pago</span>
                    <span class="customer-sales-payment-badge ${paymentClass}">
                        <span class="payment-dot"></span>
                        ${sale.paymentMethodLabel || sale.paymentStatus || 'Pendiente'}
                    </span>
                </div>
                <div class="customer-sales-detail-row">
                    <span class="label">Método de envío</span>
                    <span>${sale.shippingMethodLabel || sale.shippingMethod || 'Estándar'}</span>
                </div>
                ${sale.trackingNumber ? `
                <div class="customer-sales-detail-tracking">
                    <span class="tracking-label">📦 Número de seguimiento:</span>
                    <span class="tracking-number">${sale.trackingNumber}</span>
                </div>
                ` : ''}
            </div>

            <div class="customer-sales-detail-section">
                <h4>Productos (${sale.items?.length || 0})</h4>
                <div class="customer-sales-detail-items">
                    ${itemsHtml}
                </div>
            </div>

            <div class="customer-sales-detail-section">
                <h4>Resumen</h4>
                <div class="customer-sales-detail-row">
                    <span class="label">Subtotal</span>
                    <span>$${(sale.subtotal || 0).toFixed(2)}</span>
                </div>
                <div class="customer-sales-detail-row">
                    <span class="label">Descuento</span>
                    <span>$${(sale.descuentoTotal || 0).toFixed(2)}</span>
                </div>
                <div class="customer-sales-detail-row">
                    <span class="label">IVA (21%)</span>
                    <span>$${(sale.iva || 0).toFixed(2)}</span>
                </div>
                <div class="customer-sales-detail-row">
                    <span class="label">Envío</span>
                    <span>$${(sale.shippingCost || 0).toFixed(2)}</span>
                </div>
                <div class="customer-sales-detail-total">
                    <span class="label">Total</span>
                    <span class="total-value">$${(sale.total || 0).toFixed(2)}</span>
                </div>
            </div>

            ${sale.notes ? `
            <div class="customer-sales-detail-section">
                <h4>Notas</h4>
                <p style="font-size:0.85rem; color: var(--outlet-text-secondary);">${sale.notes}</p>
            </div>
            ` : ''}

            ${statusHistoryHtml ? `
            <div class="customer-sales-detail-section">
                <h4>Historial de Estados</h4>
                ${statusHistoryHtml}
            </div>
            ` : ''}

            <div style="display:flex; gap:12px; margin-top:16px; flex-wrap:wrap;">
                <button class="customer-sales-btn-outline" id="modalCloseBtn2" style="font-size:0.8rem; padding:8px 16px; border-radius:8px; background:var(--outlet-gold); color:var(--outlet-primary); border:none; cursor:pointer; display:flex; align-items:center; gap:8px;">
                    <span class="material-symbols-outlined" style="font-size:18px;">close</span>
                    Cerrar
                </button>
            </div>
        `;

        document.getElementById('modalCloseBtn2')?.addEventListener('click', () => {
            elements.saleModal.style.display = 'none';
        });

        elements.saleModal.style.display = 'flex';

    } catch (error) {
        cerrarLoading();
        console.error('Error viendo pedido:', error);
        await mostrarError('Error', error.message || 'No se pudo cargar el detalle del pedido.');
    }
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    elements.applyFiltersBtn?.addEventListener('click', () => {
        currentFilters = {
            orderStatus: elements.filterStatus?.value || '',
            sort: elements.filterSort?.value || 'recent'
        };
        loadSales(true);
    });

    // Cambio automático al cambiar el filtro de orden
    elements.filterSort?.addEventListener('change', () => {
        currentFilters.sort = elements.filterSort.value || 'recent';
        loadSales(true);
    });

    document.querySelectorAll('.customer-sales-filter-item select, .customer-sales-filter-item input').forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                elements.applyFiltersBtn?.click();
            }
        });
    });

    elements.prevPageBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadSales(true);
        }
    });

    elements.nextPageBtn?.addEventListener('click', () => {
        if (hasMore) {
            currentPage++;
            loadSales(false);
        }
    });

    elements.refreshBtn?.addEventListener('click', () => {
        loadSales(true);
        mostrarToast('Datos actualizados', 'success');
    });

    elements.modalCloseBtn?.addEventListener('click', () => {
        elements.saleModal.style.display = 'none';
    });

    elements.saleModal?.addEventListener('click', (e) => {
        if (e.target === elements.saleModal) {
            elements.saleModal.style.display = 'none';
        }
    });

    // Escuchar cambios en el localStorage (cuando el usuario inicia/cierra sesión)
    window.addEventListener('storage', (e) => {
        if (e.key === 'outlet_customer') {
            console.log('🔄 Cambio detectado en outlet_customer');
            const customer = getCustomerFromLocalStorage();
            if (customer) {
                currentUserId = customer.id;
                currentUser = customer;
                console.log('✅ Usuario actualizado desde localStorage:', currentUserId);
                loadSales(true);
            } else {
                currentUserId = null;
                currentUser = null;
                loadSales(true);
            }
        }
    });
}

// ========================================
// Dark mode sync
// ========================================

function syncDarkMode() {
    if (window.OUTLETNav && typeof window.OUTLETNav.getTheme === 'function') {
        const navDark = window.OUTLETNav.getTheme();
        if (navDark && !document.body.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
        } else if (!navDark && document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
        }
    }
}

document.addEventListener('themeChanged', (e) => {
    if (e.detail.isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
});

// ========================================
// Inicialización
// ========================================

export async function customerSalesController() {
    console.log('🛍️ Customer Sales Controller - Panel de Pedidos');

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }

    cacheElements();
    syncDarkMode();
    initEventListeners();

    // 🔥 OBTENER USUARIO DESDE localStorage
    const customer = getCustomerFromLocalStorage();

    if (customer && customer.id) {
        currentUserId = customer.id;
        currentUser = customer;
        console.log('✅ Usuario autenticado desde localStorage:', currentUserId);
        console.log('👤 Nombre:', customer.nombreCompleto);
        console.log('📧 Email:', customer.email);
    } else {
        console.log('⚠️ No hay usuario autenticado en localStorage');
        // Intentar verificar si hay una sesión activa en Firebase Auth
        try {
            // Intentar importar AuthService solo si es necesario
            const { AuthService } = await import('../../../services/authService.js');
            const firebaseUser = await AuthService.getCurrentUser();
            if (firebaseUser) {
                currentUserId = firebaseUser.uid;
                currentUser = firebaseUser;
                console.log('✅ Usuario autenticado desde Firebase Auth:', currentUserId);
            }
        } catch (e) {
            console.log('No se pudo verificar Firebase Auth:', e.message);
        }
    }

    // Cargar ventas
    await loadSales(true);

    console.log('✅ Customer Sales Dashboard loaded');
}