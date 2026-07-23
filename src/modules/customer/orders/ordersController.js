/* ========================================
   ORDERS CONTROLLER - OUTLET
   Historial de compras del cliente - RESPONSIVE
   ======================================== */

import { ThemeService } from '../../shared/layout/themeService.js';

// ========================================
// ESTADO
// ========================================

const state = {
    orders: [],
    filteredOrders: [],
    currentPage: 1,
    pageSize: 4,
    totalPages: 1,
    filters: {
        status: ['pending', 'processing', 'shipped', 'delivered'],
        dateFrom: '',
        dateTo: ''
    },
    sort: 'newest',
    isMobile: false,
    sidebarOpen: false
};

// ========================================
// DOM REFERENCIAS
// ========================================

const dom = {};

function getDomElements() {
    dom.grid = document.getElementById('ordersGrid');
    dom.resultsCount = document.getElementById('resultsCount');
    dom.paginationNumbers = document.getElementById('paginationNumbers');
    dom.prevPage = document.getElementById('prevPage');
    dom.nextPage = document.getElementById('nextPage');
    dom.sortSelect = document.getElementById('sortSelect');
    dom.clearFilters = document.getElementById('clearFilters');
    dom.statusCheckboxes = document.querySelectorAll('.orders-checkbox');
    dom.dateFrom = document.getElementById('dateFrom');
    dom.dateTo = document.getElementById('dateTo');
    dom.sidebarToggle = document.getElementById('sidebarToggle');
    dom.sidebarContent = document.getElementById('sidebarContent');
    dom.sidebar = document.getElementById('ordersSidebar');
}

// ========================================
// UTILIDADES
// ========================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatPrice(price) {
    return '$' + price.toFixed(2);
}

function getStatusClass(status) {
    const map = {
        'pending': 'order-status-pending',
        'processing': 'order-status-processing',
        'shipped': 'order-status-shipped',
        'delivered': 'order-status-delivered',
        'cancelled': 'order-status-cancelled'
    };
    return map[status] || '';
}

function getStatusLabel(status) {
    const map = {
        'pending': 'Pendiente',
        'processing': 'En proceso',
        'shipped': 'Enviado',
        'delivered': 'Entregado',
        'cancelled': 'Cancelado'
    };
    return map[status] || status;
}

// ========================================
// RESPONSIVE - DETECTAR MÓVIL
// ========================================

function checkIsMobile() {
    state.isMobile = window.innerWidth <= 768;
    return state.isMobile;
}

// ========================================
// TOGGLE SIDEBAR (para móvil)
// ========================================

function toggleSidebar(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (!dom.sidebarContent) {
        console.warn('⚠️ sidebarContent no encontrado');
        return;
    }

    // Solo funciona en móvil
    if (!state.isMobile) {
        // En escritorio siempre visible
        dom.sidebarContent.classList.remove('open');
        return;
    }

    // Alternar clase
    dom.sidebarContent.classList.toggle('open');
    state.sidebarOpen = dom.sidebarContent.classList.contains('open');

    console.log(`📱 Sidebar ${state.sidebarOpen ? '✅ abierto' : '❌ cerrado'}`);
}

function closeSidebar() {
    if (dom.sidebarContent && state.isMobile) {
        dom.sidebarContent.classList.remove('open');
        state.sidebarOpen = false;
        console.log('📱 Sidebar cerrado');
    }
}

function openSidebar() {
    if (dom.sidebarContent && state.isMobile) {
        dom.sidebarContent.classList.add('open');
        state.sidebarOpen = true;
        console.log('📱 Sidebar abierto');
    }
}

function setupSidebarToggle() {
    if (dom.sidebarToggle) {
        dom.sidebarToggle.removeEventListener('click', toggleSidebar);
        dom.sidebarToggle.addEventListener('click', toggleSidebar);
        console.log('🔘 Evento toggle asignado');
    } else {
        console.warn('⚠️ sidebarToggle no encontrado');
    }

    // Cerrar sidebar al hacer clic fuera (en móvil)
    document.addEventListener('click', function (e) {
        if (state.isMobile && dom.sidebar && dom.sidebarContent) {
            const isClickInside = dom.sidebar.contains(e.target);
            if (!isClickInside && dom.sidebarContent.classList.contains('open')) {
                closeSidebar();
            }
        }
    });
}

// ========================================
// RESPONSIVE - AJUSTAR PAGINACIÓN
// ========================================

function getMaxVisiblePages() {
    if (window.innerWidth <= 480) {
        return 3;
    } else if (window.innerWidth <= 768) {
        return 4;
    } else {
        return 5;
    }
}

function getPageSize() {
    if (window.innerWidth <= 480) {
        return 3;
    } else if (window.innerWidth <= 768) {
        return 4;
    } else {
        return 4;
    }
}

// ========================================
// RENDERIZADO
// ========================================

function renderOrders() {
    if (!dom.grid) return;

    state.pageSize = getPageSize();

    const start = (state.currentPage - 1) * state.pageSize;
    const end = Math.min(start + state.pageSize, state.filteredOrders.length);
    const pageOrders = state.filteredOrders.slice(start, end);

    if (state.filteredOrders.length === 0) {
        dom.grid.innerHTML = `
            <div class="orders-empty">
                <div class="orders-empty-icon">📦</div>
                <h3>No hay pedidos</h3>
                <p>No se encontraron pedidos con los filtros seleccionados.</p>
            </div>
        `;
        if (dom.resultsCount) {
            dom.resultsCount.textContent = 'Mostrando 0 de 0 pedidos';
        }
        return;
    }

    dom.grid.innerHTML = pageOrders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-card-header">
                <div class="order-card-id">
                    Pedido #<span>${order.id}</span>
                </div>
                <div class="order-card-date">${formatDate(order.date)}</div>
                <span class="order-card-status ${getStatusClass(order.status)}">${getStatusLabel(order.status)}</span>
            </div>
            <div class="order-card-items">
                ${order.items.slice(0, 3).map(item => `
                    <div class="order-item-preview">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                        <span>${item.name} × ${item.quantity}</span>
                    </div>
                `).join('')}
                ${order.items.length > 3 ? `<div class="order-item-preview">+${order.items.length - 3} más</div>` : ''}
            </div>
            <div class="order-card-footer">
                <div class="order-card-total">Total: <span>${formatPrice(order.total)}</span></div>
                <div class="order-card-actions">
                    <button class="order-card-btn order-card-btn-primary" onclick="window.viewOrderDetails('${order.id}')">
                        Ver detalles
                    </button>
                    ${order.status === 'pending' || order.status === 'processing' ? `
                        <button class="order-card-btn" onclick="window.cancelOrder('${order.id}')">
                            Cancelar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    if (dom.resultsCount) {
        dom.resultsCount.textContent = `Mostrando ${start + 1}-${end} de ${state.filteredOrders.length} pedidos`;
    }
    renderPagination();
}

function renderPagination() {
    if (!dom.paginationNumbers) return;

    state.totalPages = Math.ceil(state.filteredOrders.length / state.pageSize);

    let numbersHtml = '';
    const maxVisible = getMaxVisiblePages();
    let start = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(state.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    if (state.totalPages <= maxVisible) {
        start = 1;
        end = state.totalPages;
    }

    for (let i = start; i <= end; i++) {
        numbersHtml += `<button class="orders-pagination-number ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    dom.paginationNumbers.innerHTML = numbersHtml;

    if (dom.prevPage) dom.prevPage.disabled = state.currentPage <= 1;
    if (dom.nextPage) dom.nextPage.disabled = state.currentPage >= state.totalPages || state.totalPages === 0;

    document.querySelectorAll('.orders-pagination-number').forEach(btn => {
        btn.removeEventListener('click', handlePaginationClick);
        btn.addEventListener('click', handlePaginationClick);
    });
}

function handlePaginationClick(e) {
    const btn = e.currentTarget;
    const page = parseInt(btn.dataset.page);
    if (page !== state.currentPage) {
        state.currentPage = page;
        renderOrders();
        if (dom.grid) {
            dom.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// ========================================
// FUNCIONES DE FILTRADO
// ========================================

function applyFilters() {
    if (!dom.statusCheckboxes) return;

    const selectedStatuses = Array.from(dom.statusCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const dateFrom = dom.dateFrom && dom.dateFrom.value ? new Date(dom.dateFrom.value) : null;
    const dateTo = dom.dateTo && dom.dateTo.value ? new Date(dom.dateTo.value) : null;

    state.filters.status = selectedStatuses;
    state.filters.dateFrom = dom.dateFrom ? dom.dateFrom.value : '';
    state.filters.dateTo = dom.dateTo ? dom.dateTo.value : '';

    state.filteredOrders = state.orders.filter(order => {
        if (!selectedStatuses.includes(order.status)) return false;

        const orderDate = new Date(order.date);
        if (dateFrom && orderDate < dateFrom) return false;
        if (dateTo) {
            const endOfDay = new Date(dateTo);
            endOfDay.setHours(23, 59, 59, 999);
            if (orderDate > endOfDay) return false;
        }

        return true;
    });

    applySort();
}

function applySort() {
    if (!dom.sortSelect) return;

    const sort = dom.sortSelect.value;
    state.sort = sort;

    state.filteredOrders.sort((a, b) => {
        switch (sort) {
            case 'newest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'price-asc':
                return a.total - b.total;
            case 'price-desc':
                return b.total - a.total;
            default:
                return 0;
        }
    });

    state.currentPage = 1;
    renderOrders();
}

// ========================================
// FUNCIÓN PARA LIMPIAR FILTROS
// ========================================

function clearAllFilters() {
    if (dom.statusCheckboxes) {
        dom.statusCheckboxes.forEach(cb => {
            if (cb.value === 'cancelled') {
                cb.checked = false;
            } else {
                cb.checked = true;
            }
        });
    }

    if (dom.dateFrom) dom.dateFrom.value = '';
    if (dom.dateTo) dom.dateTo.value = '';

    if (dom.sortSelect) {
        dom.sortSelect.value = 'newest';
    }

    state.currentPage = 1;

    applyFilters();
    closeSidebar();

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Filtros limpiados',
            text: 'Se han restablecido todos los filtros',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// ========================================
// RESPONSIVE - MANEJAR RESIZE
// ========================================

let resizeTimeout = null;

function handleResize() {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
        const wasMobile = state.isMobile;
        const isMobile = checkIsMobile();

        // Si cambia de móvil a escritorio, cerrar sidebar
        if (wasMobile && !isMobile) {
            closeSidebar();
            if (dom.sidebarContent) {
                dom.sidebarContent.classList.remove('open');
            }
        }

        // Si cambia de escritorio a móvil, asegurar que sidebar esté cerrado
        if (!wasMobile && isMobile) {
            closeSidebar();
        }

        renderOrders();

        console.log(`📱 Responsive: ${isMobile ? 'Móvil' : 'Escritorio'} (${window.innerWidth}px)`);
    }, 250);
}

// ========================================
// EVENTOS DE FILTROS
// ========================================

function setupFilterEvents() {
    if (dom.statusCheckboxes) {
        dom.statusCheckboxes.forEach(cb => {
            cb.removeEventListener('change', applyFilters);
            cb.addEventListener('change', applyFilters);
        });
    }

    if (dom.dateFrom) {
        dom.dateFrom.removeEventListener('change', applyFilters);
        dom.dateFrom.addEventListener('change', applyFilters);
    }

    if (dom.dateTo) {
        dom.dateTo.removeEventListener('change', applyFilters);
        dom.dateTo.addEventListener('change', applyFilters);
    }

    if (dom.sortSelect) {
        dom.sortSelect.removeEventListener('change', applySort);
        dom.sortSelect.addEventListener('change', applySort);
    }

    if (dom.clearFilters) {
        dom.clearFilters.removeEventListener('click', clearAllFilters);
        dom.clearFilters.addEventListener('click', clearAllFilters);
    }
}

// ========================================
// ACCIONES DE PEDIDOS
// ========================================

window.viewOrderDetails = function (orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    let itemsHtml = order.items.map(item => `
        <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--outlet-border-soft,#e2d9cc);">
            <span>${item.name} × ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: `Pedido #${order.id}`,
            html: `
                <div style="text-align:left;">
                    <p><strong>Fecha:</strong> ${formatDate(order.date)}</p>
                    <p><strong>Estado:</strong> ${getStatusLabel(order.status)}</p>
                    <div style="margin:1rem 0;">
                        <p><strong>Productos:</strong></p>
                        ${itemsHtml}
                    </div>
                    <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    }
};

window.cancelOrder = function (orderId) {
    if (typeof Swal === 'undefined') return;

    Swal.fire({
        title: '¿Cancelar pedido?',
        text: `¿Estás seguro de que quieres cancelar el pedido #${orderId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver'
    }).then((result) => {
        if (result.isConfirmed) {
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
                order.status = 'cancelled';
                applyFilters();
                Swal.fire({
                    icon: 'success',
                    title: 'Pedido cancelado',
                    text: `El pedido #${orderId} ha sido cancelado correctamente.`,
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        }
    });
};

// ========================================
// NAVEGACIÓN DE PÁGINAS
// ========================================

function setupPaginationEvents() {
    if (dom.prevPage) {
        dom.prevPage.removeEventListener('click', goToPrevPage);
        dom.prevPage.addEventListener('click', goToPrevPage);
    }

    if (dom.nextPage) {
        dom.nextPage.removeEventListener('click', goToNextPage);
        dom.nextPage.addEventListener('click', goToNextPage);
    }
}

function goToPrevPage() {
    if (state.currentPage > 1) {
        state.currentPage--;
        renderOrders();
        if (dom.grid) {
            dom.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function goToNextPage() {
    if (state.currentPage < state.totalPages) {
        state.currentPage++;
        renderOrders();
        if (dom.grid) {
            dom.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

function init() {
    getDomElements();
    checkIsMobile();

    if (ThemeService && typeof ThemeService.init === 'function') {
        ThemeService.init();
    }

    setupSidebarToggle();
    applyFilters();
    setupFilterEvents();
    setupPaginationEvents();

    window.removeEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);

    console.log('📦 Orders Controller inicializado (responsive)');
    console.log(`📱 Modo: ${state.isMobile ? 'Móvil' : 'Escritorio'}`);
}

// ========================================
// EXPORTAR CONTROLADOR
// ========================================

export const OrdersController = {
    init,
    state,
    renderOrders,
    applyFilters,
    applySort,
    clearAllFilters,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    checkIsMobile,
    viewOrderDetails: window.viewOrderDetails,
    cancelOrder: window.cancelOrder,
    setOrders: (orders) => {
        state.orders = orders || [];
        state.filteredOrders = [...state.orders];
        applyFilters();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}