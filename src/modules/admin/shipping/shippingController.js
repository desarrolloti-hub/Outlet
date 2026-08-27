// ========================================
// SHIPPING CONTROLLER - OUTLET ADMIN
// Panel de envíos con filtros, paginación y CRUD
// CON SWEETALERT2 Y SINCRONIZACIÓN CON FIREBASE
// ========================================

import { SalesService } from '../../../services/salesService.js';
import { ShippingService } from '../../../services/shippingService.js';
// ========================================
// Variables de estado
// ========================================
let shipments = [];
let currentPage = 1;
const PAGE_SIZE = 20;
let lastDoc = null;
let hasMore = true;
let isEditing = false;
let currentShipmentId = null;

// Filtros
let currentFilters = {
    status: '',
    carrier: '',
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
    let toastExistente = document.querySelector('.shipping-toast');
    if (toastExistente) toastExistente.remove();

    const toast = document.createElement('div');
    toast.className = `shipping-toast ${tipo}`;
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
        totalShipments: document.getElementById('totalShipments'),
        pendingShipments: document.getElementById('pendingShipments'),
        inTransit: document.getElementById('inTransit'),
        deliveredShipments: document.getElementById('deliveredShipments'),

        // Filtros
        filterStatus: document.getElementById('filterStatus'),
        filterCarrier: document.getElementById('filterCarrier'),
        filterDateFrom: document.getElementById('filterDateFrom'),
        filterDateTo: document.getElementById('filterDateTo'),
        applyFiltersBtn: document.getElementById('applyFiltersBtn'),

        // Tabla
        shippingTableBody: document.getElementById('shippingTableBody'),
        shippingCardsGrid: document.getElementById('shippingCardsGrid'),
        shipmentsCount: document.getElementById('shipmentsCount'),

        // Paginación
        prevPageBtn: document.getElementById('prevPageBtn'),
        nextPageBtn: document.getElementById('nextPageBtn'),
        pageInfo: document.getElementById('pageInfo'),

        // Botones
        refreshBtn: document.getElementById('refreshBtn'),
        createShipmentBtn: document.getElementById('createShipmentBtn'),

        // Modal
        shippingModal: document.getElementById('shippingModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        modalCloseBtn: document.getElementById('modalCloseBtn'),

        // New Shipping Modal
        newShippingModal: document.getElementById('newShippingModal'),
        newShippingCloseBtn: document.getElementById('newShippingCloseBtn'),
        newShippingForm: document.getElementById('newShippingForm')
    };
}

// ========================================
// Renderizado de la tabla
// ========================================

function renderShippingTable() {
    if (!elements.shippingTableBody) return;

    if (shipments.length === 0) {
        elements.shippingTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="shipping-table-empty">
                    <div class="shipping-empty-state">
                        <span class="material-symbols-outlined">inbox</span>
                        <p>No hay envíos que coincidan con los filtros</p>
                        <small>Intenta ajustar los filtros o crear un nuevo envío</small>
                    </div>
                </td>
            </tr>
        `;
        if (elements.shippingCardsGrid) {
            elements.shippingCardsGrid.innerHTML = `
                <div class="shipping-empty-state">
                    <span class="material-symbols-outlined">inbox</span>
                    <p>No hay envíos que coincidan con los filtros</p>
                    <small>Intenta ajustar los filtros o crear un nuevo envío</small>
                </div>
            `;
        }
        if (elements.shipmentsCount) {
            elements.shipmentsCount.textContent = '0 envíos';
        }
        return;
    }

    let html = '';
    let cardsHtml = '';
    shipments.forEach(shipment => {
        const statusClass = `status-${shipment.status || 'pendiente'}`;
        const carrier = shipment.carrier || 'no_asignado';

        const carrierLabels = {
            estafeta: 'Estafeta',
            fedex: 'FedEx',
            dhl: 'DHL',
            ups: 'UPS',
            correos: 'Correos de México',
            redpack: 'RedPack',
            otro: 'Otro',
            no_asignado: 'No asignado'
        };

        html += `
            <tr>
                <td>
                    <strong style="color: var(--outlet-gold);">${shipment.shipmentNumber || 'N/A'}</strong>
                </td>
                <td>
                    <span style="color: var(--outlet-text-secondary);">${shipment.orderNumber || 'N/A'}</span>
                </td>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <span style="font-weight:500;">${shipment.customerName || 'Cliente'}</span>
                        <small style="color: var(--outlet-text-secondary); font-size:0.7rem;">${shipment.customerEmail || ''}</small>
                    </div>
                </td>
                <td>
                    <span class="shipping-carrier-badge">
                        <span class="carrier-icon">${getCarrierIcon(carrier)}</span>
                        ${carrierLabels[carrier] || carrier}
                    </span>
                </td>
                <td>
                    ${shipment.trackingNumber ?
                `<span class="shipping-tracking" title="Haz clic para copiar">${shipment.trackingNumber}</span>` :
                `<span style="color: var(--outlet-text-disabled); font-size:0.75rem;">Sin tracking</span>`
            }
                </td>
                <td>
                    <span class="shipping-status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        ${getStatusLabel(shipment.status)}
                    </span>
                </td>
                <td>
                    <span style="font-size:0.75rem; color: var(--outlet-text-secondary);">
                        ${shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString('es-ES') : '-'}
                    </span>
                </td>
                <td>
                    <div class="shipping-actions-cell">
                        <button class="shipping-action-btn view" data-id="${shipment.id}" title="Ver detalle">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="shipping-action-btn track" data-id="${shipment.id}" title="Actualizar tracking">
                            <span class="material-symbols-outlined">track_changes</span>
                        </button>
                        <button class="shipping-action-btn edit" data-id="${shipment.id}" title="Editar estado">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="shipping-action-btn delete" data-id="${shipment.id}" title="Eliminar envío">
                            <span class="material-symbols-outlined">delete_forever</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;

        cardsHtml += `
            <div class="shipping-card">
                <div class="shipping-card-top">
                    <strong class="shipping-card-number" style="color: var(--outlet-gold);">${shipment.shipmentNumber || 'N/A'}</strong>
                    <span class="shipping-status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        ${getStatusLabel(shipment.status)}
                    </span>
                </div>
                <div class="shipping-card-customer">
                    <span class="shipping-card-customer-name">${shipment.customerName || 'Cliente'}</span>
                    <small class="shipping-card-customer-email">${shipment.customerEmail || ''}</small>
                </div>
                <div class="shipping-card-body">
                    <div class="shipping-card-row">
                        <span class="shipping-card-label">Orden</span>
                        <span>${shipment.orderNumber || 'N/A'}</span>
                    </div>
                    <div class="shipping-card-row">
                        <span class="shipping-card-label">Paquetería</span>
                        <span class="shipping-carrier-badge">
                            <span class="carrier-icon">${getCarrierIcon(carrier)}</span>
                            ${carrierLabels[carrier] || carrier}
                        </span>
                    </div>
                    <div class="shipping-card-row">
                        <span class="shipping-card-label">Tracking</span>
                        ${shipment.trackingNumber ?
                `<span class="shipping-tracking" title="Haz clic para copiar">${shipment.trackingNumber}</span>` :
                `<span style="color: var(--outlet-text-disabled); font-size:0.75rem;">Sin tracking</span>`
            }
                    </div>
                    <div class="shipping-card-row">
                        <span class="shipping-card-label">Fecha</span>
                        <span style="font-size:0.75rem; color: var(--outlet-text-secondary);">
                            ${shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString('es-ES') : '-'}
                        </span>
                    </div>
                </div>
                <div class="shipping-actions-cell shipping-card-actions">
                    <button class="shipping-action-btn view" data-id="${shipment.id}" title="Ver detalle">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button class="shipping-action-btn track" data-id="${shipment.id}" title="Actualizar tracking">
                        <span class="material-symbols-outlined">track_changes</span>
                    </button>
                    <button class="shipping-action-btn edit" data-id="${shipment.id}" title="Editar estado">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="shipping-action-btn delete" data-id="${shipment.id}" title="Eliminar envío">
                        <span class="material-symbols-outlined">delete_forever</span>
                    </button>
                </div>
            </div>
        `;
    });

    elements.shippingTableBody.innerHTML = html;
    if (elements.shippingCardsGrid) elements.shippingCardsGrid.innerHTML = cardsHtml;

    if (elements.shipmentsCount) {
        elements.shipmentsCount.textContent = `${shipments.length} envíos`;
    }

    // Event listeners para acciones
    document.querySelectorAll('.shipping-action-btn.view').forEach(btn => {
        btn.addEventListener('click', () => viewShipment(btn.dataset.id));
    });

    document.querySelectorAll('.shipping-action-btn.track').forEach(btn => {
        btn.addEventListener('click', () => updateTracking(btn.dataset.id));
    });

    document.querySelectorAll('.shipping-action-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => editShipmentStatus(btn.dataset.id));
    });

    document.querySelectorAll('.shipping-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => deleteShipment(btn.dataset.id));
    });
}

// ========================================
// Helpers para etiquetas
// ========================================

function getStatusLabel(status) {
    const labels = {
        pendiente: 'Pendiente',
        preparando: 'Preparando',
        enviado: 'Enviado',
        en_transito: 'En Tránsito',
        entregado: 'Entregado',
        fallido: 'Fallido',
        devuelto: 'Devuelto'
    };
    return labels[status] || status;
}

function getCarrierIcon(carrier) {
    const icons = {
        estafeta: '📦',
        fedex: '📬',
        dhl: '✈️',
        ups: '🚚',
        correos: '📮',
        redpack: '📦',
        otro: '📭',
        no_asignado: '❓'
    };
    return icons[carrier] || '📦';
}

// ========================================
// Actualizar estadísticas
// ========================================

async function updateStats() {
    try {
        const stats = await ShippingService.getQuickStats();

        if (elements.totalShipments) {
            elements.totalShipments.textContent = stats.total || 0;
        }
        if (elements.pendingShipments) {
            elements.pendingShipments.textContent = stats.pendiente || 0;
        }
        if (elements.inTransit) {
            elements.inTransit.textContent = stats.en_transito || 0;
        }
        if (elements.deliveredShipments) {
            elements.deliveredShipments.textContent = stats.entregado || 0;
        }
    } catch (error) {
        console.error('Error actualizando estadísticas de envíos:', error);
    }
}

// ========================================
// Cargar envíos
// ========================================

async function loadShipments(resetPage = true) {
    try {
        if (resetPage) {
            currentPage = 1;
            lastDoc = null;
            hasMore = true;
        }

        const loading = mostrarLoading('Cargando envíos...');

        const filters = {};
        if (currentFilters.status) filters.status = currentFilters.status;
        if (currentFilters.carrier) filters.carrier = currentFilters.carrier;
        if (currentFilters.dateFrom) filters.dateFrom = currentFilters.dateFrom;
        if (currentFilters.dateTo) filters.dateTo = currentFilters.dateTo;

        const result = await ShippingService.getAll(
            filters,
            'createdAt',
            'desc',
            PAGE_SIZE,
            resetPage ? null : lastDoc
        );

        if (resetPage) {
            shipments = result.items;
        } else {
            shipments = [...shipments, ...result.items];
        }

        lastDoc = result.lastDoc;
        hasMore = result.hasMore;

        renderShippingTable();
        updatePagination();
        await updateStats();

        cerrarLoading();

        if (shipments.length === 0 && !resetPage) {
            mostrarToast('No hay más envíos para cargar', 'info');
        }

    } catch (error) {
        cerrarLoading();
        console.error('Error cargando envíos:', error);
        await mostrarError('Error al cargar envíos', error.message || 'No se pudieron cargar los envíos.');
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
// Ver detalle de envío
// ========================================

async function viewShipment(shipmentId) {
    try {
        const shipment = await ShippingService.getById(shipmentId, true);
        if (!shipment) {
            await mostrarError('No encontrado', 'El envío no existe.');
            return;
        }

        const statusClass = `status-${shipment.status || 'pendiente'}`;

        // Timeline de estados
        let timelineHtml = '';
        const statusOrder = ['pendiente', 'preparando', 'enviado', 'en_transito', 'entregado'];
        const statusLabels = {
            pendiente: 'Pendiente de procesar',
            preparando: 'Preparando paquete',
            enviado: 'Enviado a paquetería',
            en_transito: 'En tránsito',
            entregado: 'Entregado al cliente'
        };

        const currentStatusIndex = statusOrder.indexOf(shipment.status);
        const statusHistory = shipment.statusHistory || [];

        statusOrder.forEach((status, index) => {
            const isDone = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const hasHistory = statusHistory.some(h => h.status === status);

            timelineHtml += `
                <div class="shipping-timeline-item">
                    <div class="timeline-dot ${isDone ? 'done' : 'pending'}"></div>
                    <div class="timeline-content">
                        <span class="timeline-status" style="${isCurrent ? 'color: var(--outlet-gold);' : ''}">
                            ${statusLabels[status] || status}
                            ${isCurrent ? ' (Actual)' : ''}
                        </span>
                        ${hasHistory ?
                    `<span class="timeline-date">${new Date(statusHistory.find(h => h.status === status)?.date).toLocaleString('es-ES')}</span>` :
                    `<span class="timeline-date">${isDone ? 'Completado' : 'Pendiente'}</span>`
                }
                    </div>
                </div>
            `;
        });

        elements.modalTitle.textContent = `Envío ${shipment.shipmentNumber}`;

        elements.modalBody.innerHTML = `
            <div class="shipping-detail-section">
                <h4>Información General</h4>
                <div class="shipping-detail-row">
                    <span class="label">N° Envío</span>
                    <span>${shipment.shipmentNumber}</span>
                </div>
                <div class="shipping-detail-row">
                    <span class="label">Orden Asociada</span>
                    <span>${shipment.orderNumber || 'N/A'}</span>
                </div>
                <div class="shipping-detail-row">
                    <span class="label">Cliente</span>
                    <span>${shipment.customerName || 'N/A'}</span>
                </div>
                <div class="shipping-detail-row">
                    <span class="label">Email</span>
                    <span>${shipment.customerEmail || 'N/A'}</span>
                </div>
                <div class="shipping-detail-row">
                    <span class="label">Estado</span>
                    <span class="shipping-status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        ${getStatusLabel(shipment.status)}
                    </span>
                </div>
                <div class="shipping-detail-row">
                    <span class="label">Paquetería</span>
                    <span>${shipment.carrierLabel || shipment.carrier || 'No asignado'}</span>
                </div>
                <div class="shipping-detail-row">
                    <span class="label">N° Tracking</span>
                    <span>${shipment.trackingNumber || 'Sin tracking'}</span>
                </div>
                <div class="shipping-detail-row">
                    <span class="label">Fecha de creación</span>
                    <span>${new Date(shipment.createdAt).toLocaleString('es-ES')}</span>
                </div>
                ${shipment.estimatedDelivery ? `
                <div class="shipping-detail-row">
                    <span class="label">Fecha estimada de entrega</span>
                    <span>${new Date(shipment.estimatedDelivery).toLocaleDateString('es-ES')}</span>
                </div>
                ` : ''}
            </div>

            <div class="shipping-detail-section">
                <h4>Dirección de Envío</h4>
                ${shipment.shippingAddress ? `
                    <div style="font-size:0.85rem; color: var(--outlet-text-secondary); line-height:1.6;">
                        ${shipment.shippingAddress.street || ''}<br>
                        ${shipment.shippingAddress.city || ''}, ${shipment.shippingAddress.state || ''}<br>
                        ${shipment.shippingAddress.postalCode || ''}, ${shipment.shippingAddress.country || 'México'}
                    </div>
                ` : `
                    <p style="color: var(--outlet-text-disabled); font-size:0.85rem;">No hay dirección registrada</p>
                `}
            </div>

            <div class="shipping-detail-section">
                <h4>Historial de Seguimiento</h4>
                <div class="shipping-detail-timeline">
                    ${timelineHtml}
                </div>
            </div>

            ${shipment.notes ? `
            <div class="shipping-detail-section">
                <h4>Notas</h4>
                <p style="font-size:0.85rem; color: var(--outlet-text-secondary);">${shipment.notes}</p>
            </div>
            ` : ''}

            <div style="display:flex; gap:12px; margin-top:16px; flex-wrap:wrap;">
                <button class="shipping-btn-primary" id="modalUpdateStatusBtn" style="font-size:0.8rem; padding:8px 16px;">
                    <span class="material-symbols-outlined" style="font-size:18px;">edit</span>
                    Actualizar Estado
                </button>
                <button class="shipping-btn-outline" id="modalCloseBtn2" style="font-size:0.8rem; padding:8px 16px; border-radius:8px;">
                    Cerrar
                </button>
            </div>
        `;

        document.getElementById('modalUpdateStatusBtn')?.addEventListener('click', () => {
            elements.shippingModal.style.display = 'none';
            editShipmentStatus(shipmentId);
        });

        document.getElementById('modalCloseBtn2')?.addEventListener('click', () => {
            elements.shippingModal.style.display = 'none';
        });

        elements.shippingModal.style.display = 'flex';

    } catch (error) {
        console.error('Error viendo envío:', error);
        await mostrarError('Error', error.message || 'No se pudo cargar el detalle del envío.');
    }
}

// ========================================
// Actualizar tracking
// ========================================

async function updateTracking(shipmentId) {
    try {
        const shipment = await ShippingService.getById(shipmentId, true);
        if (!shipment) {
            await mostrarError('No encontrado', 'El envío no existe.');
            return;
        }

        const result = await mostrarSweetAlert({
            title: `Actualizar Tracking - ${shipment.shipmentNumber}`,
            html: `
                <div style="text-align:left;">
                    <label style="display:block;font-weight:600;margin-bottom:6px;font-size:12px;color:var(--outlet-text-secondary);">
                        Número de Tracking
                    </label>
                    <input id="swal-tracking-number" class="swal2-input" placeholder="Ej: 1Z999AA10123456784" value="${shipment.trackingNumber || ''}">
                    <label style="display:block;font-weight:600;margin-bottom:6px;font-size:12px;color:var(--outlet-text-secondary);margin-top:12px;">
                        Paquetería
                    </label>
                    <select id="swal-carrier" class="swal2-input">
                        <option value="estafeta" ${shipment.carrier === 'estafeta' ? 'selected' : ''}>Estafeta</option>
                        <option value="fedex" ${shipment.carrier === 'fedex' ? 'selected' : ''}>FedEx</option>
                        <option value="dhl" ${shipment.carrier === 'dhl' ? 'selected' : ''}>DHL</option>
                        <option value="ups" ${shipment.carrier === 'ups' ? 'selected' : ''}>UPS</option>
                        <option value="correos" ${shipment.carrier === 'correos' ? 'selected' : ''}>Correos de México</option>
                        <option value="redpack" ${shipment.carrier === 'redpack' ? 'selected' : ''}>RedPack</option>
                        <option value="otro" ${shipment.carrier === 'otro' ? 'selected' : ''}>Otro</option>
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar Tracking',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const trackingNumber = document.getElementById('swal-tracking-number').value.trim();
                const carrier = document.getElementById('swal-carrier').value;
                return { trackingNumber, carrier };
            }
        });

        if (result.isConfirmed && result.value) {
            const { trackingNumber, carrier } = result.value;

            if (!trackingNumber) {
                await mostrarError('Error', 'El número de tracking es requerido.');
                return;
            }

            const loading = mostrarLoading('Actualizando tracking...');

            await ShippingService.updateTracking(shipmentId, trackingNumber, carrier);

            cerrarLoading();

            await mostrarExito(
                '¡Tracking actualizado!',
                `El número de tracking para el envío ${shipment.shipmentNumber} ha sido actualizado.`
            );

            await loadShipments(true);
        }

    } catch (error) {
        cerrarLoading();
        console.error('Error actualizando tracking:', error);
        await mostrarError('Error', error.message || 'No se pudo actualizar el tracking.');
    }
}

// ========================================
// Editar estado de envío
// ========================================

async function editShipmentStatus(shipmentId) {
    try {
        const shipment = await ShippingService.getById(shipmentId, true);
        if (!shipment) {
            await mostrarError('No encontrado', 'El envío no existe.');
            return;
        }

        const statusOptions = ['pendiente', 'preparando', 'enviado', 'en_transito', 'entregado', 'fallido', 'devuelto'];
        const statusLabels = {
            pendiente: 'Pendiente',
            preparando: 'Preparando',
            enviado: 'Enviado',
            en_transito: 'En Tránsito',
            entregado: 'Entregado',
            fallido: 'Fallido',
            devuelto: 'Devuelto'
        };

        const result = await mostrarSweetAlert({
            title: `Actualizar estado - ${shipment.shipmentNumber}`,
            html: `
                <div style="text-align:left;">
                    <label style="display:block;font-weight:600;margin-bottom:6px;font-size:12px;color:var(--outlet-text-secondary);">
                        Nuevo estado
                    </label>
                    <select id="swal-status-select" class="swal2-input" style="margin-bottom:12px;">
                        ${statusOptions.map(status => `
                            <option value="${status}" ${status === shipment.status ? 'selected' : ''}>
                                ${statusLabels[status] || status}
                            </option>
                        `).join('')}
                    </select>
                    <label style="display:block;font-weight:600;margin-bottom:6px;font-size:12px;color:var(--outlet-text-secondary);">
                        Nota (opcional)
                    </label>
                    <input id="swal-status-note" class="swal2-input" placeholder="Ej: Paquete entregado en recepción..." value="">
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

            const loading = mostrarLoading('Actualizando estado...');

            await ShippingService.updateStatus(shipmentId, newStatus, note);

            cerrarLoading();

            await mostrarExito(
                '¡Estado actualizado!',
                `El envío ${shipment.shipmentNumber} ahora está en estado "${statusLabels[newStatus] || newStatus}"`
            );

            await loadShipments(true);
        }

    } catch (error) {
        cerrarLoading();
        console.error('Error actualizando estado:', error);
        await mostrarError('Error', error.message || 'No se pudo actualizar el estado.');
    }
}

// ========================================
// Eliminar envío
// ========================================

async function deleteShipment(shipmentId) {
    try {
        const shipment = await ShippingService.getById(shipmentId, true);
        if (!shipment) {
            await mostrarError('No encontrado', 'El envío no existe.');
            return;
        }

        const confirm = await mostrarConfirmacion(
            '¿Eliminar envío permanentemente?',
            `Estás a punto de ELIMINAR PERMANENTEMENTE el envío ${shipment.shipmentNumber} de la base de datos. Esta acción no se puede deshacer. ¿Estás seguro?`,
            'Sí, eliminar'
        );

        if (!confirm.isConfirmed) return;

        const loading = mostrarLoading('Eliminando envío de la base de datos...');

        await ShippingService.delete(shipmentId);

        cerrarLoading();

        await mostrarExito(
            '¡Envío eliminado!',
            `El envío ${shipment.shipmentNumber} ha sido eliminado permanentemente de la base de datos.`
        );

        await loadShipments(true);

    } catch (error) {
        cerrarLoading();
        console.error('Error eliminando envío:', error);
        await mostrarError('Error', error.message || 'No se pudo eliminar el envío de la base de datos.');
    }
}

// ========================================
// Abrir modal de nuevo envío
// ========================================

async function openNewShippingModal() {
    try {
        // Obtener ventas sin envío
        const sales = await SalesService.getAll({ orderStatus: 'confirmada' }, 'orderDate', 'desc', 100);

        const saleOptions = sales.items.map(s => `
            <option value="${s.id}">${s.orderNumber} - ${s.customerName}</option>
        `).join('');

        elements.newShippingForm.innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div class="shipping-filter-item" style="grid-column: span 2;">
                    <label>Orden Asociada</label>
                    <select id="newShippingSale" style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%;">
                        <option value="">Seleccionar orden</option>
                        ${saleOptions}
                    </select>
                </div>
                <div class="shipping-filter-item">
                    <label>Paquetería</label>
                    <select id="newShippingCarrier" style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%;">
                        <option value="estafeta">Estafeta</option>
                        <option value="fedex">FedEx</option>
                        <option value="dhl">DHL</option>
                        <option value="ups">UPS</option>
                        <option value="correos">Correos de México</option>
                        <option value="redpack">RedPack</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div class="shipping-filter-item">
                    <label>Número de Tracking</label>
                    <input type="text" id="newShippingTracking" placeholder="Número de seguimiento" style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%;">
                </div>
                <div class="shipping-filter-item" style="grid-column: span 2;">
                    <label>Dirección de Envío</label>
                    <textarea id="newShippingAddress" rows="3" placeholder="Calle, número, colonia, ciudad, estado, CP, país" style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%; resize:vertical;"></textarea>
                </div>
                <div class="shipping-filter-item" style="grid-column: span 2;">
                    <label>Notas</label>
                    <input type="text" id="newShippingNotes" placeholder="Instrucciones especiales..." style="padding:10px; border:1px solid var(--outlet-border-color); border-radius:6px; background:var(--outlet-bg-surface); color:var(--outlet-text-primary); width:100%;">
                </div>
            </div>
            <div style="margin-top:16px; display:flex; justify-content:flex-end; gap:12px;">
                <button id="newShippingCancelBtn" class="shipping-btn-outline" style="padding:8px 24px; border-radius:6px;">
                    Cancelar
                </button>
                <button id="newShippingSubmitBtn" class="shipping-btn-primary" style="padding:8px 24px;">
                    <span class="material-symbols-outlined" style="font-size:18px;">save</span>
                    Crear Envío
                </button>
            </div>
        `;

        document.getElementById('newShippingSubmitBtn')?.addEventListener('click', async () => {
            const saleId = document.getElementById('newShippingSale').value;
            const carrier = document.getElementById('newShippingCarrier').value;
            const trackingNumber = document.getElementById('newShippingTracking').value.trim();
            const address = document.getElementById('newShippingAddress').value.trim();
            const notes = document.getElementById('newShippingNotes').value.trim();

            if (!saleId) {
                await mostrarError('Error', 'Debes seleccionar una orden asociada.');
                return;
            }

            const confirm = await mostrarConfirmacion(
                '¿Crear envío?',
                `Estás a punto de crear un envío para la orden seleccionada.`,
                'Sí, crear envío'
            );

            if (!confirm.isConfirmed) return;

            const loading = mostrarLoading('Creando envío...');

            try {
                const shippingData = {
                    saleId: saleId,
                    carrier: carrier,
                    trackingNumber: trackingNumber,
                    shippingAddress: address,
                    notes: notes,
                    status: 'pendiente'
                };

                await ShippingService.create(shippingData);

                cerrarLoading();
                await mostrarExito(
                    '¡Envío creado!',
                    `El envío ha sido creado exitosamente.`
                );

                elements.newShippingModal.style.display = 'none';
                await loadShipments(true);

            } catch (error) {
                cerrarLoading();
                console.error('Error creando envío:', error);
                await mostrarError('Error', error.message || 'No se pudo crear el envío.');
            }
        });

        document.getElementById('newShippingCancelBtn')?.addEventListener('click', () => {
            elements.newShippingModal.style.display = 'none';
        });

        elements.newShippingModal.style.display = 'flex';

    } catch (error) {
        console.error('Error abriendo modal de nuevo envío:', error);
        await mostrarError('Error', error.message || 'No se pudo cargar el formulario.');
    }
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    elements.applyFiltersBtn?.addEventListener('click', () => {
        currentFilters = {
            status: elements.filterStatus?.value || '',
            carrier: elements.filterCarrier?.value || '',
            dateFrom: elements.filterDateFrom?.value || '',
            dateTo: elements.filterDateTo?.value || ''
        };
        loadShipments(true);
    });

    document.querySelectorAll('.shipping-filter-item select, .shipping-filter-item input').forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                elements.applyFiltersBtn?.click();
            }
        });
    });

    elements.prevPageBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadShipments(true);
        }
    });

    elements.nextPageBtn?.addEventListener('click', () => {
        if (hasMore) {
            currentPage++;
            loadShipments(false);
        }
    });

    elements.refreshBtn?.addEventListener('click', () => {
        loadShipments(true);
        mostrarToast('Datos actualizados', 'success');
    });

    elements.createShipmentBtn?.addEventListener('click', openNewShippingModal);

    elements.modalCloseBtn?.addEventListener('click', () => {
        elements.shippingModal.style.display = 'none';
    });

    elements.shippingModal?.addEventListener('click', (e) => {
        if (e.target === elements.shippingModal) {
            elements.shippingModal.style.display = 'none';
        }
    });

    elements.newShippingCloseBtn?.addEventListener('click', () => {
        elements.newShippingModal.style.display = 'none';
    });

    elements.newShippingModal?.addEventListener('click', (e) => {
        if (e.target === elements.newShippingModal) {
            elements.newShippingModal.style.display = 'none';
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

export async function shippingController() {
    console.log('📦 Shipping Controller - Panel de Envíos');

    cacheElements();
    syncDarkMode();
    initEventListeners();

    await loadShipments(true);

    console.log('✅ Shipping Dashboard loaded');
}