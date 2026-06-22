/* ========================================
   READ CUSTOMERS CONTROLLER - OUTLET ADMIN
   Controlador para listar, editar y eliminar clientes
   ======================================== */

import { CustomerService } from '/services/customerService.js';

// ========================================
// Variables de estado
// ========================================
let customers = [];
let deleteTarget = { type: null, id: null, name: null };
let isEditMode = false;

// ========================================
// DOM Elements
// ========================================
let elements = {};

function cacheElements() {
    elements = {
        totalCustomers: document.getElementById('totalCustomers'),
        tableBody: document.getElementById('customersTableBody'),
        
        customerModal: document.getElementById('customerModal'),
        modalTitle: document.getElementById('modalTitle'),
        customerId: document.getElementById('customerId'),
        customerName: document.getElementById('customerName'),
        customerEmail: document.getElementById('customerEmail'),
        customerPhone: document.getElementById('customerPhone'),
        customerAddress: document.getElementById('customerAddress'),
        customerStatus: document.getElementById('customerStatus'),
        customerIcon: document.getElementById('customerIcon'),
        customerCreatedAt: document.getElementById('customerCreatedAt'),
        customerForm: document.getElementById('customerForm'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        
        deleteModal: document.getElementById('deleteModal'),
        deleteItemName: document.getElementById('deleteItemName'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
        closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
        
        toast: document.getElementById('customersToast')
    };
}

// ========================================
// UI Helpers
// ========================================
function mostrarToast(mensaje, tipo = 'info') {
    const toast = elements.toast;
    toast.textContent = mensaje;
    toast.className = 'customerslist-toast';
    
    if (tipo === 'success') {
        toast.style.borderLeftColor = '#22c55e';
    } else if (tipo === 'error') {
        toast.style.borderLeftColor = '#ef4444';
    } else {
        toast.style.borderLeftColor = 'var(--outlet-gold, #ddab3b)';
    }
    
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.animation = 'customerslistSlideOut 0.3s ease-out forwards';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.animation = '';
        }, 300);
    }, 2800);
}

// Añadir animación de salida
const style = document.createElement('style');
style.textContent = `
    @keyframes customerslistSlideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function getStatusClass(status) {
    const classes = {
        'active': 'customerslist-status-active',
        'inactive': 'customerslist-status-inactive',
        'suspended': 'customerslist-status-suspended'
    };
    return classes[status] || 'customerslist-status-inactive';
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Activo',
        'inactive': 'Inactivo',
        'suspended': 'Suspendido'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// ========================================
// Renderizar tabla de clientes
// ========================================
function renderTable() {
    if (!elements.tableBody) return;
    
    if (customers.length === 0) {
        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="customerslist-loading">
                    <div class="customerslist-spinner"></div>
                    <span>Cargando clientes...</span>
                </td>
            </tr>
        `;
        if (elements.totalCustomers) elements.totalCustomers.textContent = '0';
        return;
    }
    
    elements.tableBody.innerHTML = customers.map(customer => `
        <tr data-id="${customer.id}">
            <td>
                <div class="customerslist-avatar">
                    <i class="material-symbols-outlined">${customer.icon || 'person'}</i>
                </div>
            </td>
            <td><code style="font-size: 12px;">${escapeHtml(customer.id)}</code></td>
            <td><strong>${escapeHtml(customer.name)}</strong></td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${customer.phone || '—'}</td>
            <td>
                <span class="customerslist-address" title="${escapeHtml(customer.address || '')}">
                    ${customer.address ? escapeHtml(customer.address) : '—'}
                </span>
            </td>
            <td>
                <span class="customerslist-status-badge ${getStatusClass(customer.status)}">
                    ${getStatusLabel(customer.status)}
                </span>
            </td>
            <td>
                <div class="customerslist-actions-cell">
                    <button class="customerslist-btn-edit" data-id="${customer.id}" title="Editar cliente">
                        <i class="material-symbols-outlined">edit</i>
                        <span>Editar</span>
                    </button>
                    <button class="customerslist-btn-delete" data-id="${customer.id}" data-name="${escapeHtml(customer.name)}" title="Eliminar cliente">
                        <i class="material-symbols-outlined">delete</i>
                        <span>Eliminar</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Actualizar contador
    if (elements.totalCustomers) {
        elements.totalCustomers.textContent = customers.length;
    }
    
    // Event listeners para botones
    document.querySelectorAll('.customerslist-btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            editCustomer(id);
        });
    });
    
    document.querySelectorAll('.customerslist-btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            showDeleteModal('customer', id, name);
        });
    });
}

// ========================================
// CRUD de Clientes
// ========================================
async function loadCustomers() {
    try {
        customers = await CustomerService.getAll({}, false);
        renderTable();
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        mostrarToast('Error al cargar los clientes', 'error');
        customers = [];
        renderTable();
    }
}

function resetCustomerForm() {
    isEditMode = false;
    elements.customerId.value = '';
    elements.customerName.value = '';
    elements.customerEmail.value = '';
    elements.customerPhone.value = '';
    elements.customerAddress.value = '';
    elements.customerStatus.value = 'active';
    elements.customerIcon.value = '';
    elements.customerCreatedAt.value = '';
    elements.modalTitle.textContent = 'Editar Cliente';
}

async function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    isEditMode = true;
    elements.customerId.value = customer.id;
    elements.customerName.value = customer.name;
    elements.customerEmail.value = customer.email;
    elements.customerPhone.value = customer.phone || '';
    elements.customerAddress.value = customer.address || '';
    elements.customerStatus.value = customer.status || 'active';
    elements.customerIcon.value = customer.icon || '';
    elements.customerCreatedAt.value = formatDate(customer.createdAt);
    elements.modalTitle.textContent = 'Editar Cliente';
    
    showModal(elements.customerModal);
}

async function saveCustomer(event) {
    event.preventDefault();
    
    const name = elements.customerName.value.trim();
    if (!name) {
        mostrarToast('El nombre es obligatorio', 'error');
        elements.customerName.focus();
        return;
    }
    
    const email = elements.customerEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarToast('Ingrese un correo electrónico válido', 'error');
        elements.customerEmail.focus();
        return;
    }
    
    const customerId = elements.customerId.value;
    
    const customerData = {
        name: name,
        email: email,
        phone: elements.customerPhone.value.trim(),
        address: elements.customerAddress.value.trim(),
        status: elements.customerStatus.value,
        icon: elements.customerIcon.value.trim()
    };
    
    try {
        const updatedCustomer = await CustomerService.update(customerId, customerData);
        mostrarToast(`✅ Cliente "${updatedCustomer.name}" actualizado exitosamente`, 'success');
        await loadCustomers();
        hideModal(elements.customerModal);
        resetCustomerForm();
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        mostrarToast(`❌ Error: ${error.message}`, 'error');
    }
}

async function deleteCustomer(id) {
    try {
        await CustomerService.delete(id);
        mostrarToast('Cliente eliminado correctamente', 'success');
        await loadCustomers();
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        mostrarToast(`❌ Error: ${error.message}`, 'error');
    }
}

// ========================================
// Modal de confirmación
// ========================================
function showDeleteModal(type, id, name) {
    deleteTarget = { type, id, name };
    elements.deleteItemName.textContent = name;
    showModal(elements.deleteModal);
}

function hideDeleteModal() {
    hideModal(elements.deleteModal);
    deleteTarget = null;
}

async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'customer') {
        await deleteCustomer(deleteTarget.id);
    }
    hideDeleteModal();
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    elements.customerForm?.addEventListener('submit', saveCustomer);
    elements.closeModalBtn?.addEventListener('click', () => hideModal(elements.customerModal));
    
    elements.confirmDeleteBtn?.addEventListener('click', confirmDelete);
    elements.cancelDeleteBtn?.addEventListener('click', hideDeleteModal);
    elements.closeDeleteModalBtn?.addEventListener('click', hideDeleteModal);
    
    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.deleteModal?.style.display === 'flex') hideDeleteModal();
            if (elements.customerModal?.style.display === 'flex') hideModal(elements.customerModal);
        }
    });
    
    // Cerrar modales al hacer clic fuera
    elements.customerModal?.addEventListener('click', (e) => {
        if (e.target === elements.customerModal) hideModal(elements.customerModal);
    });
    elements.deleteModal?.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) hideDeleteModal();
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
export async function readCustomersController() {
    console.log('📋 Read Customers Controller - Listado y gestión de clientes');
    
    cacheElements();
    syncDarkMode();
    initEventListeners();
    
    await loadCustomers();
    
    console.log('✅ Read Customers page loaded');
}

export default readCustomersController;