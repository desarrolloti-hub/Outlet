// ========================================
// READ CUSTOMERS CONTROLLER - OUTLET ADMIN
// Controlador para listar, editar y eliminar clientes
// CON SWEETALERT2 INTEGRADO
// ========================================

import { CustomerService } from '../../../../services/customerService.js';

// ========================================
// Variables de estado
// ========================================
var customers = [];
var deleteTarget = { type: null, id: null, name: null };
var isEditMode = false;

// ========================================
// DOM Elements
// ========================================
var elements = {};

// ========================================
// UI Helpers - CON SWEETALERT2
// ========================================

/**
 * Muestra un toast personalizado (estilo OUTLET)
 */
function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    var toastExistente = document.querySelector('.outlet-toast');
    if (toastExistente) toastExistente.remove();
    
    var toast = document.createElement('div');
    toast.className = 'outlet-toast ' + tipo;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    requestAnimationFrame(function() {
        toast.classList.add('show');
    });
    
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3200);
}

/**
 * Muestra una SweetAlert2 personalizada
 */
function mostrarSweetAlert(options) {
    var defaultOptions = {
        buttonsStyling: false,
        customClass: {
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel',
            popup: 'swal2-popup'
        }
    };
    
    return Swal.fire(Object.assign({}, defaultOptions, options));
}

/**
 * Muestra alerta de éxito
 */
function mostrarExito(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'success',
        title: titulo || '¡Perfecto!',
        text: mensaje || 'La acción se completó con éxito.',
        confirmButtonText: 'Aceptar'
    });
}

/**
 * Muestra alerta de error
 */
function mostrarError(titulo, mensaje) {
    return mostrarSweetAlert({
        icon: 'error',
        title: titulo || '¡Oops!',
        text: mensaje || 'Ocurrió un error inesperado.',
        confirmButtonText: 'Entendido'
    });
}

/**
 * Muestra alerta de advertencia
 */
function mostrarAdvertencia(titulo, mensaje, confirmText) {
    confirmText = confirmText || 'Continuar';
    return mostrarSweetAlert({
        icon: 'warning',
        title: titulo || '¡Cuidado!',
        text: mensaje || 'Estás a punto de realizar una acción importante.',
        confirmButtonText: confirmText,
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
    });
}

/**
 * Muestra alerta de confirmación
 */
function mostrarConfirmacion(titulo, mensaje, confirmText) {
    confirmText = confirmText || 'Sí, confirmar';
    return mostrarSweetAlert({
        title: titulo || '¿Estás seguro?',
        text: mensaje || 'Esta acción requiere tu confirmación.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar'
    });
}

/**
 * Muestra un loading con SweetAlert2
 */
function mostrarLoading(mensaje) {
    mensaje = mensaje || 'Procesando...';
    return mostrarSweetAlert({
        title: mensaje,
        allowOutsideClick: false,
        didOpen: function() {
            Swal.showLoading();
        }
    });
}

/**
 * Cierra la alerta de loading
 */
function cerrarLoading() {
    Swal.close();
}

// ========================================
// Cache de elementos DOM
// ========================================
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
// Utilidades
// ========================================
function getStatusClass(status) {
    var classes = {
        'activo': 'customerslist-status-active',
        'inactivo': 'customerslist-status-inactive',
        'suspendido': 'customerslist-status-suspended'
    };
    return classes[status] || 'customerslist-status-inactive';
}

function getStatusLabel(status) {
    var labels = {
        'activo': 'Activo',
        'inactivo': 'Inactivo',
        'suspendido': 'Suspendido'
    };
    return labels[status] || status || 'Inactivo';
}

function formatDate(dateString) {
    if (!dateString) return 'No disponible';
    var date = new Date(dateString);
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
// Transformar datos del modelo
// ========================================
function transformCustomerForDisplay(customer) {
    return {
        id: customer.id,
        name: customer.nombre || customer.name || 'Sin nombre',
        email: customer.email || '',
        phone: customer.telefono || customer.phone || 
               (customer.direccion?.telefono1 || ''),
        address: customer.direccion ? 
            (customer.direccion.calle || '') + ' ' + (customer.direccion.numeroExterior || '') : 
            customer.address || '',
        status: customer.estado || customer.status || 'inactivo',
        icon: customer.icon || 'person',
        createdAt: customer.fechaRegistro || customer.createdAt || null,
        _raw: customer
    };
}

// ========================================
// Renderizar tabla de clientes
// ========================================
function renderTable() {
    if (!elements.tableBody) return;
    
    if (customers.length === 0) {
        elements.tableBody.innerHTML = 
            '<tr><td colspan="8" class="customerslist-loading"><div class="customerslist-spinner"></div><span>Cargando clientes...</span></td></tr>';
        if (elements.totalCustomers) elements.totalCustomers.textContent = '0';
        return;
    }
    
    var html = '';
    customers.forEach(function(customer) {
        var display = transformCustomerForDisplay(customer);
        html += 
            '<tr data-id="' + display.id + '">' +
                '<td><div class="customerslist-avatar"><i class="material-symbols-outlined">' + display.icon + '</i></div></td>' +
                '<td><code style="font-size: 12px;">' + escapeHtml(display.id.substring(0, 8)) + '</code></td>' +
                '<td><strong>' + escapeHtml(display.name) + '</strong></td>' +
                '<td>' + escapeHtml(display.email) + '</td>' +
                '<td>' + (escapeHtml(display.phone) || '—') + '</td>' +
                '<td><span class="customerslist-address" title="' + escapeHtml(display.address || '') + '">' + (display.address ? escapeHtml(display.address) : '—') + '</span></td>' +
                '<td><span class="customerslist-status-badge ' + getStatusClass(display.status) + '">' + getStatusLabel(display.status) + '</span></td>' +
                '<td><div class="customerslist-actions-cell">' +
                    '<button class="customerslist-btn-edit" data-id="' + display.id + '" title="Editar cliente"><i class="material-symbols-outlined">edit</i><span>Editar</span></button>' +
                    '<button class="customerslist-btn-delete" data-id="' + display.id + '" data-name="' + escapeHtml(display.name) + '" title="Eliminar cliente"><i class="material-symbols-outlined">delete</i><span>Eliminar</span></button>' +
                '</div></td>' +
            '</tr>';
    });
    
    elements.tableBody.innerHTML = html;
    
    if (elements.totalCustomers) {
        elements.totalCustomers.textContent = customers.length;
    }
    
    document.querySelectorAll('.customerslist-btn-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.dataset.id;
            editCustomer(id);
        });
    });
    
    document.querySelectorAll('.customerslist-btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.dataset.id;
            var name = this.dataset.name;
            showDeleteModal('customer', id, name);
        });
    });
}

// ========================================
// CRUD de Clientes
// ========================================
async function loadCustomers() {
    try {
        customers = await CustomerService.getAllCustomers();
        renderTable();
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        await mostrarError('Error al cargar clientes', error.message || 'No se pudieron cargar los clientes.');
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
        var customer = await CustomerService.getCustomerById(id);
        if (!customer) {
            await mostrarError('Cliente no encontrado', 'No se encontró el cliente que deseas editar.');
            return;
        }
        
        isEditMode = true;
        elements.customerId.value = customer.id;
        elements.customerName.value = customer.nombre || '';
        elements.customerEmail.value = customer.email || '';
        elements.customerPhone.value = customer.direccion?.telefono1 || '';
        elements.customerAddress.value = customer.direccion ? 
            (customer.direccion.calle || '') + ' ' + (customer.direccion.numeroExterior || '') + ' ' + (customer.direccion.colonia || '') + ' ' + (customer.direccion.ciudad || '') + ' ' + (customer.direccion.estado || '') : '';
        elements.customerStatus.value = customer.estado || 'activo';
        elements.customerIcon.value = customer.icon || 'person';
        elements.customerCreatedAt.value = formatDate(customer.fechaRegistro);
        elements.modalTitle.textContent = 'Editar Cliente';
        
        showModal(elements.customerModal);
    } catch (error) {
        console.error('Error al cargar cliente para editar:', error);
        await mostrarError('Error', error.message || 'No se pudo cargar el cliente.');
    }
}

async function saveCustomer(event) {
    event.preventDefault();
    
    var name = elements.customerName.value.trim();
    if (!name) {
        await mostrarError('Campo requerido', 'El nombre es obligatorio.');
        elements.customerName.focus();
        return;
    }
    
    var email = elements.customerEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        await mostrarError('Email inválido', 'Ingrese un correo electrónico válido.');
        elements.customerEmail.focus();
        return;
    }
    
    var customerId = elements.customerId.value;
    
    var customerData = {
        nombre: name,
        email: email,
        direccion: {
            telefono1: elements.customerPhone.value.trim(),
            calle: elements.customerAddress.value.trim().split(' ')[0] || '',
        },
        estado: elements.customerStatus.value,
        icon: elements.customerIcon.value.trim() || 'person'
    };
    
    // Confirmación antes de guardar
    var confirmResult = await mostrarConfirmacion(
        '¿Guardar cambios?',
        'Estás a punto de actualizar el cliente "' + name + '".',
        'Sí, guardar'
    );
    
    if (!confirmResult.isConfirmed) {
        mostrarToast('Edición cancelada', 'info');
        return;
    }
    
    mostrarLoading('Actualizando cliente...');
    
    try {
        var updatedCustomer = await CustomerService.updateProfile(customerId, customerData);
        cerrarLoading();
        await mostrarExito('¡Cliente actualizado!', '✅ "' + updatedCustomer.nombre + '" actualizado exitosamente.');
        await loadCustomers();
        hideModal(elements.customerModal);
        resetCustomerForm();
    } catch (error) {
        cerrarLoading();
        console.error('Error al actualizar cliente:', error);
        await mostrarError('Error al actualizar', error.message || 'No se pudo actualizar el cliente.');
    }
}

async function deleteCustomer(id) {
    try {
        await CustomerService.deactivateCustomer(id);
        await mostrarExito('¡Cliente desactivado!', 'El cliente ha sido desactivado correctamente.');
        await loadCustomers();
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        await mostrarError('Error al eliminar', error.message || 'No se pudo eliminar el cliente.');
    }
}

// ========================================
// Modal de confirmación CON SWEETALERT2
// ========================================
async function showDeleteModal(type, id, name) {
    var result = await mostrarConfirmacion(
        '¿Eliminar cliente?',
        '¿Estás seguro de que quieres eliminar a "' + name + '"? Esta acción no se puede deshacer.',
        'Sí, eliminar'
    );
    
    if (result.isConfirmed) {
        deleteTarget = { type: type, id: id, name: name };
        await confirmDelete();
    }
}

async function confirmDelete() {
    if (!deleteTarget || !deleteTarget.id) return;
    if (deleteTarget.type === 'customer') {
        await deleteCustomer(deleteTarget.id);
    }
    deleteTarget = { type: null, id: null, name: null };
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    elements.customerForm?.addEventListener('submit', saveCustomer);
    elements.closeModalBtn?.addEventListener('click', function() { hideModal(elements.customerModal); });
    
    elements.confirmDeleteBtn?.addEventListener('click', confirmDelete);
    elements.cancelDeleteBtn?.addEventListener('click', function() { deleteTarget = { type: null, id: null, name: null }; });
    elements.closeDeleteModalBtn?.addEventListener('click', function() { deleteTarget = { type: null, id: null, name: null }; });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (elements.deleteModal?.style.display === 'flex') {
                deleteTarget = { type: null, id: null, name: null };
                hideModal(elements.deleteModal);
            }
            if (elements.customerModal?.style.display === 'flex') hideModal(elements.customerModal);
        }
    });
    
    elements.customerModal?.addEventListener('click', function(e) {
        if (e.target === elements.customerModal) hideModal(elements.customerModal);
    });
    elements.deleteModal?.addEventListener('click', function(e) {
        if (e.target === elements.deleteModal) {
            deleteTarget = { type: null, id: null, name: null };
            hideModal(elements.deleteModal);
        }
    });
}

// ========================================
// Dark mode sync
// ========================================
function syncDarkMode() {
    if (window.OUTLETNav && typeof window.OUTLETNav.getTheme === 'function') {
        var navDark = window.OUTLETNav.getTheme();
        if (navDark && !document.body.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
        } else if (!navDark && document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
        }
    }
}

document.addEventListener('themeChanged', function(e) {
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