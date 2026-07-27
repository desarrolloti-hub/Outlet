// ========================================
// SALES CONTROLLER - OUTLET ADMIN
// Panel de ventas con filtros, paginación y CRUD
// CON SWEETALERT2 Y SINCRONIZACIÓN CON FIREBASE
// ========================================

import { SalesService } from '../../../services/salesService.js';
import { CustomerService } from '../../../services/customerService.js';
import { ProductService } from '../../../services/productService.js';
import { Sale } from '../../../classes/salesModel.js';

// ========================================
// Variables de estado
// ========================================
let sales = [];
let currentPage = 1;
const PAGE_SIZE = 20;
let lastDoc = null;
let hasMore = true;
let isEditing = false;
let currentSaleId = null;

// Filtros
let currentFilters = {
    orderStatus: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: ''
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
    let toastExistente = document.querySelector('.sales-toast');
    if (toastExistente) toastExistente.remove();

    const toast = document.createElement('div');
    toast.className = `sales-toast ${tipo}`;
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

function mostrarExito(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'success',
        title: titulo || '¡Perfecto!',
        text: mensaje || 'La acción se completó con éxito.',
        confirmButtonText: 'Aceptar'
    });
}

function mostrarError(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'error',
        title: titulo || '¡Oops!',
        text: mensaje || 'Ocurrió un error inesperado.',
        confirmButtonText: 'Entendido'
    });
}

function mostrarConfirmacion(titulo, mensaje, confirmText) {
    return mostrarSweetAlert({
        title: titulo || '¿Estás seguro?',
        text: mensaje || 'Esta acción requiere tu confirmación.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText || 'Sí, confirmar',
        cancelButtonText: 'Cancelar'
    });
}

function mostrarLoading(mensaje) {
    return mostrarSweetAlert({
        title: mensaje || 'Procesando...',
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
        totalSales: document.getElementById('totalSales'),
        totalRevenue: document.getElementById('totalRevenue'),
        averageTicket: document.getElementById('averageTicket'),
        pendingSales: document.getElementById('pendingSales'),

        // Filtros
        filterStatus: document.getElementById('filterStatus'),
        filterPayment: document.getElementById('filterPayment'),
        filterDateFrom: document.getElementById('filterDateFrom'),
        filterDateTo: document.getElementById('filterDateTo'),
        applyFiltersBtn: document.getElementById('applyFiltersBtn'),

        // Tabla
        salesTableBody: document.getElementById('salesTableBody'),
        salesCount: document.getElementById('salesCount'),

        // Paginación
        prevPageBtn: document.getElementById('prevPageBtn'),
        nextPageBtn: document.getElementById('nextPageBtn'),
        pageInfo: document.getElementById('pageInfo'),

        // Botones
        refreshBtn: document.getElementById('refreshBtn'),
        newSaleBtn: document.getElementById('newSaleBtn'),

        // Modal
        saleModal: document.getElementById('saleModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        modalCloseBtn: document.getElementById('modalCloseBtn'),

        // New Sale Modal
        newSaleModal: document.getElementById('newSaleModal'),
        newSaleCloseBtn: document.getElementById('newSaleCloseBtn'),
        newSaleForm: document.getElementById('newSaleForm')
    };
}

// ========================================
// Renderizado de la tabla
// ========================================

function renderSalesTable() {
    if (!elements.salesTableBody) return;

    if (sales.length === 0) {
        elements.salesTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="sales-table-empty">
                    <div class="sales-empty-state">
                        <span class="material-symbols-outlined">inbox</span>
                        <p>No hay ventas que coincidan con los filtros</p>
                        <small>Intenta ajustar los filtros o crear una nueva venta</small>
                    </div>
                </td>
            </tr>
        `;
        if (elements.salesCount) {
            elements.salesCount.textContent = '0 ventas';
        }
        return;
    }

    let html = '';
    sales.forEach(sale => {
        const statusClass = `status-${sale.orderStatus || 'confirmada'}`;
        const paymentClass = `payment-${sale.paymentStatus || 'pendiente'}`;

        html += `
            <tr>
                <td>
                    <strong style="color: var(--outlet-gold);">${sale.orderNumber || 'N/A'}</strong>
                </td>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <span style="font-weight:500;">${sale.customerName || 'Cliente'}</span>
                        <small style="color: var(--outlet-text-secondary); font-size:0.7rem;">${sale.customerEmail || ''}</small>
                    </div>
                </td>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <span>${sale.totalItems || 0} items</span>
                        <small style="color: var(--outlet-text-secondary); font-size:0.7rem;">${sale.uniqueProducts || sale.items?.length || 0} productos únicos</small>
                    </div>
                </td>
                <td>
                    <strong style="color: var(--outlet-gold); font-size:1rem;">€${(sale.total || 0).toFixed(2)}</strong>
                </td>
                <td>
                    <span class="sales-status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        ${sale.orderStatusLabel || sale.orderStatus || 'Confirmada'}
                    </span>
                </td>
                <td>
                    <span class="sales-payment-badge ${paymentClass}">
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
                    <div class="sales-actions-cell">
                        <button class="sales-action-btn view" data-id="${sale.id}" title="Ver detalle">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="sales-action-btn edit" data-id="${sale.id}" title="Editar estado">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="sales-action-btn delete" data-id="${sale.id}" title="Cancelar">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    elements.salesTableBody.innerHTML = html;

    if (elements.salesCount) {
        elements.salesCount.textContent = `${sales.length} ventas`;
    }

    // Event listeners para acciones
    document.querySelectorAll('.sales-action-btn.view').forEach(btn => {
        btn.addEventListener('click', () => viewSale(btn.dataset.id));
    });

    document.querySelectorAll('.sales-action-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => editSaleStatus(btn.dataset.id));
    });

    document.querySelectorAll('.sales-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => cancelSale(btn.dataset.id));
    });
}

// ========================================
// Actualizar estadísticas
// ========================================

async function updateStats() {
    try {
        const stats = await SalesService.getQuickStats();

        if (elements.totalSales) {
            elements.totalSales.textContent = stats.ventasMes || 0;
        }
        if (elements.totalRevenue) {
            elements.totalRevenue.textContent = `$${(stats.totalMes || 0).toFixed(2)}`;
        }
        if (elements.averageTicket) {
            elements.averageTicket.textContent = `$${(stats.ticketPromedio || 0).toFixed(2)}`;
        }
        if (elements.pendingSales) {
            const pending = stats.statusCount?.confirmada || 0;
            elements.pendingSales.textContent = pending;
        }
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
    }
}

// ========================================
// Cargar ventas
// ========================================

async function loadSales(resetPage = true) {
    try {
        if (resetPage) {
            currentPage = 1;
            lastDoc = null;
            hasMore = true;
        }

        const loading = mostrarLoading('Cargando ventas...');

        const filters = {};
        if (currentFilters.orderStatus) filters.orderStatus = currentFilters.orderStatus;
        if (currentFilters.paymentStatus) filters.paymentStatus = currentFilters.paymentStatus;
        if (currentFilters.dateFrom) filters.dateFrom = currentFilters.dateFrom;
        if (currentFilters.dateTo) filters.dateTo = currentFilters.dateTo;

        const result = await SalesService.getAll(
            filters,
            'orderDate',
            'desc',
            PAGE_SIZE,
            resetPage ? null : lastDoc
        );

        if (resetPage) {
            sales = result.items;
        } else {
            sales = [...sales, ...result.items];
        }

        lastDoc = result.lastDoc;
        hasMore = result.hasMore;

        renderSalesTable();
        updatePagination();
        await updateStats();

        cerrarLoading();

        if (sales.length === 0 && !resetPage) {
            mostrarToast('No hay más ventas para cargar', 'info');
        }

    } catch (error) {
        cerrarLoading();
        console.error('Error cargando ventas:', error);
        await mostrarError('Error al cargar ventas', error.message || 'No se pudieron cargar las ventas.');
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
    try {
        const sale = await SalesService.getById(saleId, true);
        if (!sale) {
            await mostrarError('No encontrada', 'La venta no existe.');
            return;
        }

        const statusClass = `status-${sale.orderStatus || 'confirmada'}`;
        const paymentClass = `payment-${sale.paymentStatus || 'pendiente'}`;

        let itemsHtml = '';
        sale.items.forEach(item => {
            itemsHtml += `
                <div class="sales-detail-item">
                    <div class="item-info">
                        <span class="item-name">${item.productName || 'Producto'}</span>
                        <span class="item-variant">
                            ${item.talla ? `Talla: ${item.talla}` : ''}
                            ${item.color ? `Color: ${item.color}` : ''}
                            x${item.cantidad || 1}
                        </span>
                    </div>
                    <span class="item-price">€${(item.precioFinal * (item.cantidad || 1)).toFixed(2)}</span>
                </div>
            `;
        });

        let statusHistoryHtml = '';
        if (sale.statusHistory && sale.statusHistory.length > 0) {
            sale.statusHistory.slice().reverse().forEach(entry => {
                const date = new Date(entry.date).toLocaleString('es-ES');
                statusHistoryHtml += `
                    <div class="sales-detail-row">
                        <span class="label">${entry.status}</span>
                        <span>${date}</span>
                    </div>
                `;
            });
        }

        elements.modalTitle.textContent = `Venta ${sale.orderNumberFormatted || sale.orderNumber}`;

        elements.modalBody.innerHTML = `
            <div class="sales-detail-section">
                <h4>Información General</h4>
                <div class="sales-detail-row">
                    <span class="label">Cliente</span>
                    <span>${sale.customerName || 'N/A'}</span>
                </div>
                <div class="sales-detail-row">
                    <span class="label">Email</span>
                    <span>${sale.customerEmail || 'N/A'}</span>
                </div>
                <div class="sales-detail-row">
                    <span class="label">Fecha</span>
                    <span>${new Date(sale.orderDate).toLocaleString('es-ES')}</span>
                </div>
                <div class="sales-detail-row">
                    <span class="label">Estado</span>
                    <span class="sales-status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        ${sale.orderStatusLabel || sale.orderStatus || 'Confirmada'}
                    </span>
                </div>
                <div class="sales-detail-row">
                    <span class="label">Pago</span>
                    <span class="sales-payment-badge ${paymentClass}">
                        <span class="payment-dot"></span>
                        ${sale.paymentMethodLabel || sale.paymentStatus || 'Pendiente'}
                    </span>
                </div>
                <div class="sales-detail-row">
                    <span class="label">Método de envío</span>
                    <span>${sale.shippingMethodLabel || sale.shippingMethod || 'Estándar'}</span>
                </div>
                ${sale.trackingNumber ? `
                <div class="sales-detail-row">
                    <span class="label">Número de seguimiento</span>
                    <span>${sale.trackingNumber}</span>
                </div>
                ` : ''}
            </div>

            <div class="sales-detail-section">
                <h4>Productos (${sale.items.length})</h4>
                <div class="sales-detail-items">
                    ${itemsHtml}
                </div>
            </div>

            <div class="sales-detail-section">
                <h4>Totales</h4>
                <div class="sales-detail-row">
                    <span class="label">Subtotal</span>
                    <span>€${(sale.subtotal || 0).toFixed(2)}</span>
                </div>
                <div class="sales-detail-row">
                    <span class="label">Descuento</span>
                    <span>€${(sale.descuentoTotal || 0).toFixed(2)}</span>
                </div>
                <div class="sales-detail-row">
                    <span class="label">IVA (21%)</span>
                    <span>€${(sale.iva || 0).toFixed(2)}</span>
                </div>
                <div class="sales-detail-row">
                    <span class="label">Envío</span>
                    <span>€${(sale.shippingCost || 0).toFixed(2)}</span>
                </div>
                <div class="sales-detail-row" style="font-weight:700; font-size:1.1rem; border-top:2px solid var(--outlet-border-color); padding-top:8px; margin-top:4px;">
                    <span class="label">Total</span>
                    <span style="color: var(--outlet-gold);">€${(sale.total || 0).toFixed(2)}</span>
                </div>
            </div>

            ${sale.notes ? `
            <div class="sales-detail-section">
                <h4>Notas</h4>
                <p style="font-size:0.85rem; color: var(--outlet-text-secondary);">${sale.notes}</p>
            </div>
            ` : ''}

            ${statusHistoryHtml ? `
            <div class="sales-detail-section">
                <h4>Historial de Estados</h4>
                ${statusHistoryHtml}
            </div>
            ` : ''}

            <div style="display:flex; gap:12px; margin-top:16px; flex-wrap:wrap;">
                <button class="sales-btn-primary" id="modalUpdateStatusBtn" style="font-size:0.8rem; padding:8px 16px;">
                    <span class="material-symbols-outlined" style="font-size:18px;">edit</span>
                    Actualizar Estado
                </button>
                <button class="sales-btn-outline" id="modalCloseBtn2" style="font-size:0.8rem; padding:8px 16px; border-radius:8px;">
                    Cerrar
                </button>
            </div>
        `;

        document.getElementById('modalUpdateStatusBtn')?.addEventListener('click', () => {
            elements.saleModal.style.display = 'none';
            editSaleStatus(saleId);
        });

        document.getElementById('modalCloseBtn2')?.addEventListener('click', () => {
            elements.saleModal.style.display = 'none';
        });

        elements.saleModal.style.display = 'flex';

    } catch (error) {
        console.error('Error viendo venta:', error);
        await mostrarError('Error', error.message || 'No se pudo cargar el detalle de la venta.');
    }
}

// ========================================
// Editar estado de venta
// ========================================

async function editSaleStatus(saleId) {
    try {
        const sale = await SalesService.getById(saleId, true);
        if (!sale) {
            await mostrarError('No encontrada', 'La venta no existe.');
            return;
        }

        const statusOptions = ['confirmada', 'preparando', 'enviada', 'entregada', 'cancelada'];
        const statusLabels = {
            confirmada: 'Confirmada',
            preparando: 'Preparando',
            enviada: 'Enviada',
            entregada: 'Entregada',
            cancelada: 'Cancelada'
        };

        const result = await mostrarSweetAlert({
            title: `Actualizar estado - ${sale.orderNumber}`,
            html: `
                <div style="text-align:left;">
                    <label style="display:block;font-weight:600;margin-bottom:6px;font-size:12px;color:var(--outlet-text-secondary);">
                        Nuevo estado
                    </label>
                    <select id="swal-status-select" class="swal2-input" style="margin-bottom:12px;">
                        ${statusOptions.map(status => `
                            <option value="${status}" ${status === sale.orderStatus ? 'selected' : ''}>
                                ${statusLabels[status] || status}
                            </option>
                        `).join('')}
                    </select>
                    <label style="display:block;font-weight:600;margin-bottom:6px;font-size:12px;color:var(--outlet-text-secondary);">
                        Nota (opcional)
                    </label>
                    <input id="swal-status-note" class="swal2-input" placeholder="Ej: Producto enviado, fecha estimada..." value="">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const newStatus = document.getElementById('swal-status-select').value;
                const note = document.getElementById('swal-status-note').value.trim();
                return { newStatus, note };
            }
        });

        if (result.isConfirmed && result.value) {
            const { newStatus, note } = result.value;

            const updated = await SalesService.updateOrderStatus(saleId, newStatus, note);

            await mostrarExito(
                '¡Estado actualizado!',
                `La venta ${sale.orderNumber} ahora está en estado "${statusLabels[newStatus] || newStatus}"`
            );

            await loadSales(true);
        }

    } catch (error) {
        console.error('Error actualizando estado:', error);
        await mostrarError('Error', error.message || 'No se pudo actualizar el estado.');
    }
}

// ========================================
// Cancelar venta
// ========================================

async function cancelSale(saleId) {
    try {
        const sale = await SalesService.getById(saleId, true);
        if (!sale) {
            await mostrarError('No encontrada', 'La venta no existe.');
            return;
        }

        if (sale.orderStatus === 'cancelada') {
            await mostrarError('Ya cancelada', 'Esta venta ya está cancelada.');
            return;
        }

        if (sale.orderStatus === 'entregada') {
            await mostrarError('No se puede cancelar', 'Una venta entregada no puede ser cancelada.');
            return;
        }

        const confirm = await mostrarConfirmacion(
            '¿Cancelar venta?',
            `Estás a punto de cancelar la venta ${sale.orderNumber}. Se restaurará el stock de los productos. ¿Estás seguro?`,
            'Sí, cancelar'
        );

        if (!confirm.isConfirmed) return;

        const loading = mostrarLoading('Cancelando venta...');

        await SalesService.updateOrderStatus(saleId, 'cancelada', 'Venta cancelada por administrador');

        cerrarLoading();

        await mostrarExito(
            '¡Venta cancelada!',
            `La venta ${sale.orderNumber} ha sido cancelada. El stock ha sido restaurado.`
        );

        await loadSales(true);

    } catch (error) {
        cerrarLoading();
        console.error('Error cancelando venta:', error);
        await mostrarError('Error', error.message || 'No se pudo cancelar la venta.');
    }
}

// ========================================
// Abrir modal de nueva venta
// ========================================

async function openNewSaleModal() {
    try {
        const [products, customers] = await Promise.all([
            ProductService.getAll({ estado: 'activo' }, 'nombre', 'asc', 100),
            CustomerService.getAllCustomers()
        ]);

        const productOptions = products.map(p => {
            const price = p.precioFinal || p.precioVenta || 0;
            return `
                <option value="${p.id}" data-price="${price}" data-sku="${p.sku || ''}">
                    ${p.nombre} - €${price.toFixed(2)}
                </option>
            `;
        }).join('');

        const customerOptions = customers.map(c => `
            <option value="${c.id}">${c.nombreCompleto || c.nombre} (${c.email})</option>
        `).join('');

        elements.newSaleForm.innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div class="sales-filter-item" style="grid-column: span 2;">
                    <label>Cliente</label>
                    <select id="newSaleCustomer" style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%;">
                        <option value="">Seleccionar cliente existente</option>
                        ${customerOptions}
                    </select>
                </div>
                <div class="sales-filter-item" style="grid-column: span 2;">
                    <label>Nombre del cliente (si no está en la lista)</label>
                    <input type="text" id="newSaleCustomerName" placeholder="Nombre del cliente" style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%;">
                </div>
                <div class="sales-filter-item" style="grid-column: span 2;">
                    <label>Email del cliente</label>
                    <input type="email" id="newSaleCustomerEmail" placeholder="cliente@email.com" style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%;">
                </div>
                <div class="sales-filter-item">
                    <label>Producto</label>
                    <select id="newSaleProduct" style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%;">
                        <option value="">Seleccionar producto</option>
                        ${productOptions}
                    </select>
                </div>
                <div class="sales-filter-item">
                    <label>Cantidad</label>
                    <input type="number" id="newSaleQuantity" value="1" min="1" style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%;">
                </div>
                <div style="grid-column: span 2;">
                    <button id="newSaleAddItemBtn" class="sales-btn-primary" style="width:100%; justify-content:center;">
                        <span class="material-symbols-outlined">add</span>
                        Agregar Producto
                    </button>
                </div>
            </div>
            <div style="margin-top:16px; max-height:200px; overflow-y:auto;" id="newSaleItemsList">
                <p style="color:var(--outlet-text-secondary); font-size:0.85rem;">No hay productos agregados</p>
            </div>
            <div style="margin-top:16px; display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--outlet-bg-container-low); border-radius:8px; flex-wrap:wrap; gap:8px;">
                <div>
                    <span style="font-size:0.75rem; color:var(--outlet-text-secondary);">Total:</span>
                    <span id="newSaleTotal" style="font-size:1.2rem; font-weight:700; color:var(--outlet-gold);">€0.00</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button id="newSaleClearBtn" class="sales-btn-outline" style="padding:8px 16px; border-radius:6px; font-size:0.8rem;">
                        <span class="material-symbols-outlined" style="font-size:18px;">cleaning_services</span>
                        Limpiar
                    </button>
                    <button id="newSaleSubmitBtn" class="sales-btn-primary" style="padding:8px 24px;">
                        <span class="material-symbols-outlined" style="font-size:18px;">save</span>
                        Crear Venta
                    </button>
                </div>
            </div>
        `;

        let cartItems = [];

        function renderCartItems() {
            const list = document.getElementById('newSaleItemsList');
            if (!list) return;

            if (cartItems.length === 0) {
                list.innerHTML = `<p style="color:var(--outlet-text-secondary); font-size:0.85rem;">No hay productos agregados</p>`;
                document.getElementById('newSaleTotal').textContent = '€0.00';
                return;
            }

            let html = '<div style="display:flex;flex-direction:column;gap:6px;">';
            let total = 0;
            cartItems.forEach((item, index) => {
                const itemTotal = (item.precioFinal || 0) * (item.cantidad || 1);
                total += itemTotal;
                html += `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--outlet-bg-surface);border-radius:6px;border:1px solid var(--outlet-border-soft);flex-wrap:wrap;gap:4px;">
                        <div>
                            <span style="font-weight:500;">${item.nombre || 'Producto'}</span>
                            <span style="font-size:0.75rem;color:var(--outlet-text-secondary);margin-left:8px;">x${item.cantidad}</span>
                            <span style="font-size:0.75rem;color:var(--outlet-text-secondary);margin-left:8px;">€${(item.precioFinal || 0).toFixed(2)} c/u</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-weight:600;">€${itemTotal.toFixed(2)}</span>
                            <button class="sales-action-btn delete" data-index="${index}" style="color:#dc3545;">
                                <span class="material-symbols-outlined" style="font-size:18px;">remove_circle</span>
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            list.innerHTML = html;
            document.getElementById('newSaleTotal').textContent = `€${total.toFixed(2)}`;

            document.querySelectorAll('#newSaleItemsList .delete').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    cartItems.splice(index, 1);
                    renderCartItems();
                });
            });
        }

        document.getElementById('newSaleAddItemBtn')?.addEventListener('click', () => {
            const productSelect = document.getElementById('newSaleProduct');
            const quantityInput = document.getElementById('newSaleQuantity');

            const productId = productSelect.value;
            const quantity = parseInt(quantityInput.value) || 1;

            if (!productId) {
                mostrarToast('Selecciona un producto', 'warning');
                return;
            }

            const product = products.find(p => p.id === productId);
            if (!product) {
                mostrarToast('Producto no encontrado', 'error');
                return;
            }

            const precioFinal = product.precioFinal || product.precioVenta || 0;

            if (precioFinal <= 0) {
                mostrarToast('El producto no tiene un precio válido', 'error');
                return;
            }

            const existing = cartItems.find(item => item.id === productId);
            if (existing) {
                existing.cantidad += quantity;
            } else {
                cartItems.push({
                    id: productId,
                    productId: productId,
                    nombre: product.nombre || 'Producto',
                    sku: product.sku || '',
                    precioVenta: product.precioVenta || 0,
                    precioFinal: precioFinal,
                    cantidad: quantity,
                    talla: '',
                    color: '',
                    descuento: product.porcentajeDescuento || 0,
                    precioUnitario: precioFinal
                });
            }

            renderCartItems();
            productSelect.value = '';
            quantityInput.value = '1';
            mostrarToast('Producto agregado al carrito', 'success');
        });

        document.getElementById('newSaleSubmitBtn')?.addEventListener('click', async () => {
            if (cartItems.length === 0) {
                await mostrarError('Carrito vacío', 'Agrega al menos un producto para crear la venta.');
                return;
            }

            const customerSelect = document.getElementById('newSaleCustomer');
            const customerNameInput = document.getElementById('newSaleCustomerName');
            const customerEmailInput = document.getElementById('newSaleCustomerEmail');

            const customerId = customerSelect.value || null;
            const customerName = customerNameInput.value.trim() || 'Cliente';
            const customerEmail = customerEmailInput.value.trim() || '';

            const totalVenta = cartItems.reduce((sum, item) => sum + (item.precioFinal * item.cantidad), 0);

            const confirm = await mostrarConfirmacion(
                '¿Crear venta?',
                `Estás a punto de crear una venta para ${customerName} con ${cartItems.length} productos. Total: €${totalVenta.toFixed(2)}`,
                'Sí, crear venta'
            );

            if (!confirm.isConfirmed) return;

            const loading = mostrarLoading('Creando venta...');

            try {
                const itemsParaVenta = cartItems.map(item => ({
                    productId: item.productId || item.id,
                    productName: item.nombre || 'Producto',
                    productSku: item.sku || '',
                    cantidad: item.cantidad || 1,
                    precioUnitario: item.precioUnitario || item.precioFinal || 0,
                    precioFinal: item.precioFinal || 0,
                    descuento: item.descuento || 0,
                    talla: item.talla || '',
                    color: item.color || ''
                }));

                console.log('📊 Items para venta:', JSON.stringify(itemsParaVenta, null, 2));

                const saleData = {
                    customerId: customerId,
                    customerName: customerName,
                    customerEmail: customerEmail,
                    items: itemsParaVenta,
                    shippingMethod: 'estandar',
                    shippingCost: 0,
                    paymentMethod: 'efectivo',
                    paymentStatus: 'pendiente',
                    orderStatus: 'confirmada'
                };

                await SalesService.create(saleData);

                cerrarLoading();
                await mostrarExito(
                    '¡Venta creada!',
                    `La venta para ${customerName} ha sido creada exitosamente.`
                );

                elements.newSaleModal.style.display = 'none';
                await loadSales(true);

            } catch (error) {
                cerrarLoading();
                console.error('Error creando venta:', error);
                await mostrarError('Error', error.message || 'No se pudo crear la venta.');
            }
        });

        document.getElementById('newSaleClearBtn')?.addEventListener('click', () => {
            cartItems = [];
            renderCartItems();
            mostrarToast('Carrito limpiado', 'info');
        });

        elements.newSaleModal.style.display = 'flex';

    } catch (error) {
        console.error('Error abriendo modal de nueva venta:', error);
        await mostrarError('Error', error.message || 'No se pudo cargar el formulario.');
    }
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    elements.applyFiltersBtn?.addEventListener('click', () => {
        currentFilters = {
            orderStatus: elements.filterStatus?.value || '',
            paymentStatus: elements.filterPayment?.value || '',
            dateFrom: elements.filterDateFrom?.value || '',
            dateTo: elements.filterDateTo?.value || ''
        };
        loadSales(true);
    });

    document.querySelectorAll('.sales-filter-item select, .sales-filter-item input').forEach(el => {
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

    elements.newSaleBtn?.addEventListener('click', openNewSaleModal);

    elements.modalCloseBtn?.addEventListener('click', () => {
        elements.saleModal.style.display = 'none';
    });

    elements.saleModal?.addEventListener('click', (e) => {
        if (e.target === elements.saleModal) {
            elements.saleModal.style.display = 'none';
        }
    });

    elements.newSaleCloseBtn?.addEventListener('click', () => {
        elements.newSaleModal.style.display = 'none';
    });

    elements.newSaleModal?.addEventListener('click', (e) => {
        if (e.target === elements.newSaleModal) {
            elements.newSaleModal.style.display = 'none';
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

export async function salesController() {
    console.log('📊 Sales Controller - Panel de Ventas');

    cacheElements();
    syncDarkMode();
    initEventListeners();

    await loadSales(true);

    console.log('✅ Sales Dashboard loaded');
}