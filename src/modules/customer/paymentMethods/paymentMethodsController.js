/* ========================================
   PAYMENT METHODS CONTROLLER - OUTLET
   Controlador para gestión de métodos de pago
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { CustomerService } from '../../../services/customerService.js';

// ========================================
// DOM Elements
// ========================================
var cards = [];
var currentCustomer = null;

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

    requestAnimationFrame(function () {
        toast.classList.add('show');
    });

    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 300);
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
        didOpen: function () {
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
// Cargar datos del usuario desde Firebase
// ========================================
async function loadCustomerData() {
    try {
        console.log('📥 Cargando datos del customer desde Firebase...');

        var customer = await CustomerService.getCurrentCustomer(true);

        if (!customer) {
            console.warn('⚠️ No hay customer autenticado');
            await mostrarError('Sesión no activa', 'No hay una sesión activa. Por favor, inicia sesión.');
            return false;
        }

        currentCustomer = customer;
        console.log('✅ Customer cargado:', currentCustomer.nombreCompleto);

        if (currentCustomer.tarjetas && Array.isArray(currentCustomer.tarjetas)) {
            cards = currentCustomer.tarjetas;
        } else {
            cards = [];
        }

        renderCards();
        loadPreferences();
        return true;
    } catch (error) {
        console.error('❌ Error cargando datos del customer:', error);
        await mostrarError('Error al cargar perfil', error.message || 'No se pudieron cargar los datos del perfil.');
        return false;
    }
}

// ========================================
// Cargar preferencias de pago
// ========================================
function loadPreferences() {
    var preferencias = currentCustomer?.preferencias || {};

    var transferenciaToggle = document.getElementById('paymentTransferenciaToggle');
    var paypalToggle = document.getElementById('paymentPaypalToggle');
    var contraentregaToggle = document.getElementById('paymentContraentregaToggle');

    if (transferenciaToggle) transferenciaToggle.checked = preferencias.transferencia || false;
    if (paypalToggle) paypalToggle.checked = preferencias.paypal || false;
    if (contraentregaToggle) contraentregaToggle.checked = preferencias.contraentrega || false;
}

// ========================================
// Tarjetas de pago
// ========================================

function renderCards() {
    var paymentCardsList = document.getElementById('paymentCardsList');
    var defaultPaymentDisplay = document.getElementById('defaultPaymentDisplay');
    var badgeCardCount = document.getElementById('badgeCardCount');

    if (!paymentCardsList) return;

    if (!cards || cards.length === 0) {
        paymentCardsList.innerHTML = `
            <div class="outlet-card-item empty">
                <span style="color: var(--outlet-text-secondary);">
                    <span class="material-symbols-outlined" style="font-size: 48px; display: block; margin-bottom: 8px;">credit_card</span>
                    No tienes tarjetas guardadas
                </span>
            </div>
        `;
        if (defaultPaymentDisplay) {
            defaultPaymentDisplay.innerHTML = `
                <div class="outlet-default-placeholder">
                    <span class="material-symbols-outlined">credit_card</span>
                    <p>No hay tarjeta seleccionada</p>
                </div>
            `;
        }
        if (badgeCardCount) badgeCardCount.textContent = '0 tarjetas';
        return;
    }

    var html = '';
    cards.forEach(function (card) {
        var isSelected = card.isDefault ? 'selected' : '';
        var defaultBadge = card.isDefault ? '<span class="outlet-default-badge">Predeterminada</span>' : '';

        html +=
            '<div class="outlet-card-item ' + isSelected + '" data-card-id="' + card.id + '">' +
            '<div class="outlet-card-info">' +
            '<span class="material-symbols-outlined outlet-card-icon">credit_card</span>' +
            '<div class="outlet-card-details">' +
            '<span class="outlet-card-number">' + (card.number || '**** **** **** ****') + '</span>' +
            '<span class="outlet-card-expiry">Expira: ' + (card.expiry || '12/28') + '</span>' +
            (card.name ? '<span style="font-size: 10px; color: var(--outlet-text-secondary);">' + card.name + '</span>' : '') +
            '</div>' +
            defaultBadge +
            '</div>' +
            '<div class="outlet-card-actions">' +
            '<button class="outlet-btn-card-action star" data-id="' + card.id + '" data-action="default" title="Predeterminada">' +
            '<span class="material-symbols-outlined">star</span>' +
            '</button>' +
            '<button class="outlet-btn-card-action delete" data-id="' + card.id + '" data-action="delete" title="Eliminar">' +
            '<span class="material-symbols-outlined">delete</span>' +
            '</button>' +
            '</div>' +
            '</div>';
    });

    paymentCardsList.innerHTML = html;

    if (badgeCardCount) {
        badgeCardCount.textContent = cards.length + ' tarjeta' + (cards.length > 1 ? 's' : '');
    }

    var defaultCard = cards.find(function (c) { return c.isDefault; });
    if (defaultPaymentDisplay) {
        if (defaultCard) {
            defaultPaymentDisplay.innerHTML = `
                <div class="outlet-default-placeholder-row">
                    <span class="material-symbols-outlined">credit_card</span>
                    <div>
                        <strong>${defaultCard.number || '**** **** **** ****'}</strong>
                        <p>Expira: ${defaultCard.expiry || '12/28'}</p>
                    </div>
                    <span class="outlet-default-badge" style="margin-left: 8px;">Predeterminada</span>
                </div>
            `;
        } else {
            defaultPaymentDisplay.innerHTML = `
                <div class="outlet-default-placeholder">
                    <span class="material-symbols-outlined">credit_card</span>
                    <p>No hay tarjeta seleccionada</p>
                </div>
            `;
        }
    }

    // Event listeners
    document.querySelectorAll('.outlet-btn-card-action.star').forEach(function (btn) {
        btn.removeEventListener('click', handleStarClick);
        btn.addEventListener('click', handleStarClick);
    });

    document.querySelectorAll('.outlet-btn-card-action.delete').forEach(function (btn) {
        btn.removeEventListener('click', handleDeleteClick);
        btn.addEventListener('click', handleDeleteClick);
    });
}

async function handleStarClick(e) {
    e.stopPropagation();
    var id = parseInt(e.currentTarget.dataset.id);
    cards = cards.map(function (c) { return { ...c, isDefault: c.id === id }; });
    renderCards();
    await mostrarExito('Tarjeta actualizada', 'Tarjeta predeterminada actualizada correctamente.');
}

async function handleDeleteClick(e) {
    e.stopPropagation();
    var id = parseInt(e.currentTarget.dataset.id);
    var cardToDelete = cards.find(function (c) { return c.id === id; });

    if (cardToDelete?.isDefault && cards.length > 1) {
        await mostrarError('Acción no permitida', 'Selecciona otra tarjeta como predeterminada primero.');
        return;
    }

    var result = await mostrarConfirmacion(
        '¿Eliminar tarjeta?',
        '¿Estás seguro de que quieres eliminar esta tarjeta de pago?',
        'Sí, eliminar'
    );

    if (result.isConfirmed) {
        cards = cards.filter(function (c) { return c.id !== id; });
        if (cards.length > 0 && !cards.some(function (c) { return c.isDefault; })) {
            cards[0].isDefault = true;
        }
        renderCards();
        await mostrarExito('Tarjeta eliminada', 'La tarjeta ha sido eliminada correctamente.');
    }
}

function agregarTarjeta(numero, expiry, nombre) {
    var newId = cards.length > 0 ? Math.max.apply(null, cards.map(function (c) { return c.id; })) + 1 : 1;
    cards.push({
        id: newId,
        number: numero,
        expiry: expiry,
        name: nombre,
        isDefault: cards.length === 0
    });
    renderCards();
}

// ========================================
// Modal de tarjetas
// ========================================

function openModal() {
    var modal = document.getElementById('cardModalOverlay');
    if (modal) modal.classList.add('active');
}

function closeModal() {
    var modal = document.getElementById('cardModalOverlay');
    if (modal) modal.classList.remove('active');
    var cardNumber = document.getElementById('paymentCardNumber');
    var cardExpiry = document.getElementById('paymentCardExpiry');
    var cardCvv = document.getElementById('paymentCardCvv');
    var cardName = document.getElementById('paymentCardName');
    if (cardNumber) cardNumber.value = '';
    if (cardExpiry) cardExpiry.value = '';
    if (cardCvv) cardCvv.value = '';
    if (cardName) cardName.value = '';
}

async function saveCard() {
    var cardNumber = document.getElementById('paymentCardNumber');
    var cardExpiry = document.getElementById('paymentCardExpiry');
    var cardName = document.getElementById('paymentCardName');

    if (!cardNumber?.value.trim() || !cardExpiry?.value.trim() || !cardName?.value.trim()) {
        await mostrarError('Campos incompletos', 'Completa todos los campos de la tarjeta.');
        return;
    }

    agregarTarjeta(cardNumber.value.trim(), cardExpiry.value.trim(), cardName.value.trim());
    closeModal();
    await mostrarExito('Tarjeta agregada', 'La tarjeta ha sido agregada correctamente.');
}

// ========================================
// Guardar cambios en Firebase
// ========================================

async function guardarCambios() {
    try {
        if (!currentCustomer) {
            await mostrarError('Sesión no activa', 'No hay una sesión activa. Por favor, inicia sesión.');
            return;
        }

        var preferencias = {
            transferencia: document.getElementById('paymentTransferenciaToggle')?.checked || false,
            paypal: document.getElementById('paymentPaypalToggle')?.checked || false,
            contraentrega: document.getElementById('paymentContraentregaToggle')?.checked || false
        };

        var updateData = {
            tarjetas: cards,
            preferencias: preferencias
        };

        console.log('📤 Guardando métodos de pago en Firebase...');

        mostrarLoading('Guardando cambios...');

        var updatedCustomer = await CustomerService.updateProfile(
            currentCustomer.id,
            updateData
        );

        cerrarLoading();

        if (updatedCustomer) {
            currentCustomer = updatedCustomer;
            await mostrarExito('¡Cambios guardados!', 'Los métodos de pago han sido actualizados correctamente.');

            // Notificar cambio
            window.dispatchEvent(new CustomEvent('customer:authStateChanged', {
                detail: updatedCustomer
            }));
        }
    } catch (error) {
        cerrarLoading();
        console.error('❌ Error guardando cambios:', error);
        await mostrarError('Error al guardar', error.message || 'Error al guardar los cambios.');
    }
}

// ========================================
// Cancelar - Recargar datos originales
// ========================================

async function cancelarCambios() {
    try {
        var result = await mostrarConfirmacion(
            '¿Descartar cambios?',
            'Los cambios no guardados se perderán. ¿Estás seguro?',
            'Sí, descartar'
        );

        if (result.isConfirmed) {
            await loadCustomerData();
            mostrarToast('Cambios descartados', 'info');
        }
    } catch (error) {
        console.error('Error al cancelar:', error);
    }
}

// ========================================
// Volver al perfil (navegación)
// ========================================

function volverAlPerfil() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/perfil');
    } else {
        window.location.href = '/perfil';
    }
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    var btnAddCard = document.getElementById('btnAddCard');
    btnAddCard?.addEventListener('click', openModal);

    var closeModalBtn = document.getElementById('closeModalBtn');
    var cancelModalBtn = document.getElementById('cancelModalBtn');
    var saveCardBtn = document.getElementById('saveCardBtn');
    var modalOverlay = document.getElementById('cardModalOverlay');

    closeModalBtn?.addEventListener('click', closeModal);
    cancelModalBtn?.addEventListener('click', closeModal);
    saveCardBtn?.addEventListener('click', saveCard);
    modalOverlay?.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });

    var btnAceptar = document.getElementById('btnAceptar');
    var btnCancelar = document.getElementById('btnCancelar');

    btnAceptar?.addEventListener('click', guardarCambios);
    btnCancelar?.addEventListener('click', cancelarCambios);

    // Toggle listeners con toast
    var transferenciaToggle = document.getElementById('paymentTransferenciaToggle');
    var paypalToggle = document.getElementById('paymentPaypalToggle');
    var contraentregaToggle = document.getElementById('paymentContraentregaToggle');

    transferenciaToggle?.addEventListener('change', function (e) {
        mostrarToast('Transferencia bancaria ' + (e.target.checked ? 'activada' : 'desactivada'), 'info');
    });
    paypalToggle?.addEventListener('change', function (e) {
        mostrarToast('PayPal ' + (e.target.checked ? 'activado' : 'desactivado'), 'info');
    });
    contraentregaToggle?.addEventListener('change', function (e) {
        mostrarToast('Pago contra entrega ' + (e.target.checked ? 'activado' : 'desactivado'), 'info');
    });
}

// ========================================
// Sincronización con modo oscuro
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

document.addEventListener('themeChanged', function (e) {
    if (e.detail?.isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});

// ========================================
// Inicialización
// ========================================

export async function paymentMethodsController() {
    console.log('💳 Payment Methods Controller - Gestión de métodos de pago');

    try {
        var loaded = await loadCustomerData();

        if (!loaded) {
            console.warn('⚠️ No se pudieron cargar los datos del usuario');
            await mostrarError('Error al cargar perfil', 'No se pudieron cargar los datos del perfil. Redirigiendo al login...');

            setTimeout(function () {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/');
                } else {
                    window.location.href = '/';
                }
            }, 2000);
            return;
        }

        syncDarkMode();
        initEventListeners();

        window.addEventListener('customer:authStateChanged', async function (event) {
            console.log('🔄 Auth state changed, recargando datos...');
            await loadCustomerData();
        });

        console.log('✅ Payment Methods page loaded');
    } catch (error) {
        console.error('❌ Error inicializando:', error);
        await mostrarError('Error al cargar perfil', error.message || 'Ocurrió un error al cargar los métodos de pago.');
    }
}