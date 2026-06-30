// ========================================
// READ CUSTOMERS CONTROLLER - OUTLET ADMIN
// Controlador para listar, editar y eliminar clientes
// ========================================

import { CustomerService } from '../../../../services/customerService.js';

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
        'activo': 'customerslist-status-active',
        'inactivo': 'customerslist-status-inactive',
        'suspendido': 'customerslist-status-suspended'
    };
    return classes[status] || 'customerslist-status-inactive';
}

function getStatusLabel(status) {
    const labels = {
        'activo': 'Activo',
        'inactivo': 'Inactivo',
        'suspendido': 'Suspendido'
    };
    return labels[status] || status || 'Inactivo';
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
// FUNCIÓN PARA TRANSFORMAR DATOS DEL MODELO
// ========================================
function transformCustomerForDisplay(customer) {
    // El customer puede venir del repository o del service
    return {
        id: customer.id,
        name: customer.nombre || customer.name || 'Sin nombre',
        email: customer.email || '',
        phone: customer.telefono || customer.phone || 
               (customer.direccion?.telefono1 || ''),
        address: customer.direccion ? 
            `${customer.direccion.calle || ''} ${customer.direccion.numeroExterior || ''}`.trim() :
            customer.address || '',
        status: customer.estado || customer.status || 'inactivo',
        icon: customer.icon || 'person',
        createdAt: customer.fechaRegistro || customer.createdAt || null,
        // Guardamos el objeto completo para edición
        _raw: customer
    };
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
    
    elements.tableBody.innerHTML = customers.map(customer => {
        const display = transformCustomerForDisplay(customer);
        return `
        <tr data-id="${display.id}">
            <td>
                <div class="customerslist-avatar">
                    <i class="material-symbols-outlined">${display.icon}</i>
                </div>
            </td>
            <td><code style="font-size: 12px;">${escapeHtml(display.id.substring(0, 8))}</code></td>
            <td><strong>${escapeHtml(display.name)}</strong></td>
            <td>${escapeHtml(display.email)}</td>
            <td>${escapeHtml(display.phone) || '—'}</td>
            <td>
                <span class="customerslist-address" title="${escapeHtml(display.address || '')}">
                    ${display.address ? escapeHtml(display.address) : '—'}
                </span>
            </td>
            <td>
                <span class="customerslist-status-badge ${getStatusClass(display.status)}">
                    ${getStatusLabel(display.status)}
                </span>
            </td>
            <td>
                <div class="customerslist-actions-cell">
                    <button class="customerslist-btn-edit" data-id="${display.id}" title="Editar cliente">
                        <i class="material-symbols-outlined">edit</i>
                        <span>Editar</span>
                    </button>
                    <button class="customerslist-btn-delete" data-id="${display.id}" data-name="${escapeHtml(display.name)}" title="Eliminar cliente">
                        <i class="material-symbols-outlined">delete</i>
                        <span>Eliminar</span>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
    
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
        // ✅ CORRECCIÓN: Usar getAllCustomers() en lugar de getAll()
        customers = await CustomerService.getAllCustomers();
        renderTable();
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        mostrarToast(`Error al cargar los clientes: ${error.message}`, 'error');
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
    elements.customerStatus.value = 'activo';
    elements.customerIcon.value = '';
    elements.customerCreatedAt.value = '';
    elements.modalTitle.textContent = 'Editar Cliente';
}

async function editCustomer(id) {
    try {
        // Obtener el cliente completo desde el repository
        const customer = await CustomerService.getCustomerById(id);
        if (!customer) {
            mostrarToast('Cliente no encontrado', 'error');
            return;
        }
        
        isEditMode = true;
        elements.customerId.value = customer.id;
        elements.customerName.value = customer.nombre || '';
        elements.customerEmail.value = customer.email || '';
        elements.customerPhone.value = customer.direccion?.telefono1 || '';
        elements.customerAddress.value = customer.direccion ? 
            `${customer.direccion.calle || ''} ${customer.direccion.numeroExterior || ''} ${customer.direccion.colonia || ''} ${customer.direccion.ciudad || ''} ${customer.direccion.estado || ''}`.trim() : '';
        elements.customerStatus.value = customer.estado || 'activo';
        elements.customerIcon.value = customer.icon || 'person';
        elements.customerCreatedAt.value = formatDate(customer.fechaRegistro);
        elements.modalTitle.textContent = 'Editar Cliente';
        
        showModal(elements.customerModal);
    } catch (error) {
        console.error('Error al cargar cliente para editar:', error);
        mostrarToast(`Error: ${error.message}`, 'error');
    }
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
    
    // ✅ CORRECCIÓN: Usar la estructura correcta del modelo
    const customerData = {
        nombre: name,
        email: email,
        // La dirección se guarda como objeto anidado
        direccion: {
            telefono1: elements.customerPhone.value.trim(),
            calle: elements.customerAddress.value.trim().split(' ')[0] || '',
            // Podrías agregar más campos de dirección si tu formulario los tiene
        },
        estado: elements.customerStatus.value,
        icon: elements.customerIcon.value.trim() || 'person'
    };
    
    try {
        // ✅ CORRECCIÓN: Usar updateProfile() en lugar de update()
        const updatedCustomer = await CustomerService.updateProfile(customerId, customerData);
        mostrarToast(`✅ Cliente "${updatedCustomer.nombre}" actualizado exitosamente`, 'success');
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
        // ✅ CORRECCIÓN: Usar deactivateCustomer() en lugar de delete()
        await CustomerService.deactivateCustomer(id);
        mostrarToast('Cliente desactivado correctamente', 'success');
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
    deleteTarget = { type: null, id: null, name: null };
}

async function confirmDelete() {
    if (!deleteTarget || !deleteTarget.id) return;
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