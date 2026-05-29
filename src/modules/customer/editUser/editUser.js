/* ========================================
   USER PROFILE EDIT CONTROLLER - OUTLET
   Controlador para edición de perfil de usuario
   Wizard de 3 pasos | Diseño premium con variables globales
   ======================================== */

// ========================================
// DOM Elements
// ========================================
let currentStep = 1;
let cards = [];
let isTransitioning = false;

// Datos de ejemplo para tarjetas
const defaultCards = [
    { id: 1, number: '**** **** **** 4242', expiry: '12/28', name: 'Ana García López', isDefault: true },
    { id: 2, number: '**** **** **** 5656', expiry: '09/26', name: 'Ana García López', isDefault: false }
];

/**
 * Muestra notificación toast
 */
function showNotification(message, type = 'info') {
    const existingToast = document.querySelector('.outlet-toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'outlet-toast-notification';
    toast.textContent = message;
    
    if (type === 'success') toast.style.borderLeftColor = 'var(--outlet-success)';
    if (type === 'error') toast.style.borderLeftColor = 'var(--outlet-danger)';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

/**
 * Actualiza las iniciales del avatar
 */
function actualizarIniciales() {
    const nombreInput = document.getElementById('nombre');
    const apellidoPaInput = document.getElementById('apellidoPa');
    const avatarIniciales = document.getElementById('avatarIniciales');
    
    if (!avatarIniciales) return;
    
    const nombre = nombreInput?.value.trim() || '';
    const apellido = apellidoPaInput?.value.trim() || '';
    let iniciales = '';
    if (nombre) iniciales += nombre.charAt(0);
    if (apellido) iniciales += apellido.charAt(0);
    if (iniciales === '') iniciales = 'U';
    
    avatarIniciales.textContent = iniciales.toUpperCase();
    
    const avatarCircle = document.getElementById('avatarCircle');
    if (avatarCircle) {
        avatarCircle.style.transform = 'scale(1.02)';
        setTimeout(() => { if (avatarCircle) avatarCircle.style.transform = 'scale(1)'; }, 300);
    }
}

/**
 * Actualiza el estado de la dirección (completa/incompleta)
 */
function actualizarEstadoDireccion() {
    const calle = document.getElementById('calle');
    const numeroExterior = document.getElementById('numeroExterior');
    const colonia = document.getElementById('colonia');
    const ciudad = document.getElementById('ciudad');
    const estado = document.getElementById('estado');
    const codigoPostal = document.getElementById('codigoPostal');
    const dirTelefono1 = document.getElementById('dirTelefono1');
    const badgeEnvio = document.getElementById('badgeEnvio');
    
    if (!badgeEnvio) return;
    
    const tieneDireccionCompleta = (
        calle?.value && 
        numeroExterior?.value && 
        colonia?.value && 
        ciudad?.value && 
        estado?.value && 
        codigoPostal?.value && 
        dirTelefono1?.value
    );
    
    if (tieneDireccionCompleta) {
        badgeEnvio.textContent = 'Completa';
        badgeEnvio.classList.add('completa');
    } else {
        badgeEnvio.textContent = 'Incompleta';
        badgeEnvio.classList.remove('completa');
    }
}

/**
 * Renderiza las tarjetas de pago
 */
function renderCards() {
    const paymentCardsList = document.getElementById('paymentCardsList');
    const defaultPaymentDisplay = document.getElementById('defaultPaymentDisplay');
    
    if (!paymentCardsList) return;
    
    if (cards.length === 0) {
        paymentCardsList.innerHTML = `<div class="outlet-card-item" style="justify-content: center; text-align: center;">
            <span style="color: var(--outlet-text-secondary);">No tienes tarjetas guardadas</span>
        </div>`;
        if (defaultPaymentDisplay) {
            defaultPaymentDisplay.innerHTML = `<div class="outlet-default-placeholder">
                <span class="material-symbols-outlined">credit_card</span>
                <p>No hay tarjeta seleccionada</p>
            </div>`;
        }
        return;
    }
    
    paymentCardsList.innerHTML = cards.map(card => `
        <div class="outlet-card-item ${card.isDefault ? 'selected' : ''}" data-card-id="${card.id}">
            <div class="outlet-card-info">
                <span class="material-symbols-outlined outlet-card-icon">credit_card</span>
                <div class="outlet-card-details">
                    <span class="outlet-card-number">${card.number}</span>
                    <span class="outlet-card-expiry">Expira: ${card.expiry}</span>
                    <span style="font-size: 10px; color: var(--outlet-text-secondary);">${card.name}</span>
                </div>
                ${card.isDefault ? '<span class="outlet-default-badge">Predeterminada</span>' : ''}
            </div>
            <div class="outlet-card-actions">
                <button class="outlet-btn-card-action star" data-id="${card.id}" data-action="default" title="Predeterminada">
                    <span class="material-symbols-outlined">star</span>
                </button>
                <button class="outlet-btn-card-action delete" data-id="${card.id}" data-action="delete" title="Eliminar">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `).join('');
    
    const defaultCard = cards.find(c => c.isDefault);
    if (defaultPaymentDisplay) {
        if (defaultCard) {
            defaultPaymentDisplay.innerHTML = `<div class="outlet-default-placeholder" style="flex-direction: row; justify-content: center; gap: 12px;">
                <span class="material-symbols-outlined" style="color: var(--outlet-gold);">credit_card</span>
                <div>
                    <strong>${defaultCard.number}</strong>
                    <p style="font-size: 11px; margin-top: 4px;">Expira: ${defaultCard.expiry}</p>
                </div>
            </div>`;
        } else {
            defaultPaymentDisplay.innerHTML = `<div class="outlet-default-placeholder">
                <span class="material-symbols-outlined">credit_card</span>
                <p>No hay tarjeta seleccionada</p>
            </div>`;
        }
    }
    
    // Event listeners para botones de estrella (predeterminada)
    document.querySelectorAll('.outlet-btn-card-action.star').forEach(btn => {
        btn.removeEventListener('click', handleStarClick);
        btn.addEventListener('click', handleStarClick);
    });
    
    // Event listeners para botones de eliminar
    document.querySelectorAll('.outlet-btn-card-action.delete').forEach(btn => {
        btn.removeEventListener('click', handleDeleteClick);
        btn.addEventListener('click', handleDeleteClick);
    });
}

function handleStarClick(e) {
    e.stopPropagation();
    const id = parseInt(e.currentTarget.dataset.id);
    cards = cards.map(c => ({ ...c, isDefault: c.id === id }));
    renderCards();
    showNotification('Tarjeta predeterminada actualizada', 'success');
}

function handleDeleteClick(e) {
    e.stopPropagation();
    const id = parseInt(e.currentTarget.dataset.id);
    const cardToDelete = cards.find(c => c.id === id);
    if (cardToDelete?.isDefault && cards.length > 1) {
        showNotification('Selecciona otra tarjeta como predeterminada primero', 'error');
        return;
    }
    cards = cards.filter(c => c.id !== id);
    if (cards.length > 0 && !cards.some(c => c.isDefault)) {
        cards[0].isDefault = true;
    }
    renderCards();
    showNotification('Tarjeta eliminada', 'info');
}

/**
 * Agrega una nueva tarjeta
 */
function agregarTarjeta(numero, expiry, nombre) {
    const newId = cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1;
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
// Wizard / Carrusel
// ========================================
function updateWizardUI() {
    const stepItems = document.querySelectorAll('.outlet-step-item');
    const stepCurrentSpan = document.getElementById('stepCurrent');
    const actionButtonsFinal = document.getElementById('actionButtonsFinal');
    const btnPrevTop = document.getElementById('btnPrevTop');
    
    stepItems.forEach((step, idx) => {
        if (idx + 1 === currentStep) step.classList.add('active');
        else step.classList.remove('active');
    });
    
    if (stepCurrentSpan) stepCurrentSpan.textContent = currentStep;
    
    if (actionButtonsFinal) {
        if (currentStep === 3) {
            actionButtonsFinal.style.display = 'flex';
            actionButtonsFinal.style.animation = 'outletFadeInUp 0.5s ease forwards';
        } else {
            actionButtonsFinal.style.display = 'none';
        }
    }
    
    if (btnPrevTop) btnPrevTop.disabled = currentStep === 1;
}

function cambiarPanel(direction) {
    if (isTransitioning) return;
    
    const panels = document.querySelectorAll('.outlet-carousel-panel');
    const currentPanel = document.querySelector('.outlet-carousel-panel.active');
    const currentIndex = Array.from(panels).indexOf(currentPanel);
    const newIndex = currentIndex + direction;
    
    if (newIndex < 0 || newIndex >= panels.length) return;
    
    isTransitioning = true;
    const newPanel = panels[newIndex];
    
    if (currentPanel) {
        currentPanel.style.animation = 'outletFadeOutDown 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
    }
    
    setTimeout(() => {
        if (currentPanel) {
            currentPanel.classList.remove('active');
            currentPanel.style.animation = '';
        }
        newPanel.classList.add('active');
        newPanel.style.animation = 'outletFadeInUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
        
        currentStep = newIndex + 1;
        updateWizardUI();
        
        setTimeout(() => { isTransitioning = false; }, 300);
    }, 300);
}

function irAlPaso(step) {
    if (isTransitioning || step === currentStep) return;
    const direction = step > currentStep ? 1 : -1;
    cambiarPanel(direction);
}

// ========================================
// Modal de tarjetas
// ========================================
function openModal() {
    const modal = document.getElementById('cardModalOverlay');
    if (modal) modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('cardModalOverlay');
    if (modal) modal.classList.remove('active');
    // Limpiar campos
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCvv = document.getElementById('cardCvv');
    const cardName = document.getElementById('cardName');
    if (cardNumber) cardNumber.value = '';
    if (cardExpiry) cardExpiry.value = '';
    if (cardCvv) cardCvv.value = '';
    if (cardName) cardName.value = '';
}

function saveCard() {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardName = document.getElementById('cardName');
    
    if (!cardNumber?.value.trim() || !cardExpiry?.value.trim() || !cardName?.value.trim()) {
        showNotification('Completa todos los campos', 'error');
        return;
    }
    
    agregarTarjeta(cardNumber.value.trim(), cardExpiry.value.trim(), cardName.value.trim());
    closeModal();
    showNotification('Tarjeta agregada', 'success');
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // Avatar
    const btnCambiarAvatar = document.getElementById('btnCambiarAvatar');
    btnCambiarAvatar?.addEventListener('click', () => {
        showNotification('Avatar actualizado', 'success');
    });
    
    // Campos para iniciales
    const nombreInput = document.getElementById('nombre');
    const apellidoPaInput = document.getElementById('apellidoPa');
    nombreInput?.addEventListener('input', actualizarIniciales);
    apellidoPaInput?.addEventListener('input', actualizarIniciales);
    
    // Dirección
    const direccionInputs = ['destinatario', 'dirTelefono1', 'dirTelefono2', 'calle', 'numeroExterior', 
                             'numeroInterior', 'colonia', 'ciudad', 'estado', 'codigoPostal', 'pais', 'referencias'];
    direccionInputs.forEach(id => {
        const input = document.getElementById(id);
        input?.addEventListener('input', actualizarEstadoDireccion);
    });
    
    // Cambiar contraseña
    const btnCambiarPass = document.getElementById('btnCambiarPass');
    const emailInput = document.getElementById('email');
    btnCambiarPass?.addEventListener('click', () => {
        const email = emailInput?.value || '';
        if (!email) {
            showNotification('No hay correo registrado', 'error');
            return;
        }
        const btn = btnCambiarPass;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Enviando...';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            showNotification(`✨ Enlace de restablecimiento enviado a ${email}`, 'success');
        }, 1500);
    });
    
    // Toggles de preferencias
    const newsletterToggle = document.getElementById('newsletterToggle');
    const notificacionesToggle = document.getElementById('notificacionesToggle');
    newsletterToggle?.addEventListener('change', (e) => showNotification(`Newsletter ${e.target.checked ? 'activada' : 'desactivada'}`, 'info'));
    notificacionesToggle?.addEventListener('change', (e) => showNotification(`Notificaciones ${e.target.checked ? 'activadas' : 'desactivadas'}`, 'info'));
    
    // Toggles de métodos de pago
    const transferenciaToggle = document.getElementById('transferenciaToggle');
    const paypalToggle = document.getElementById('paypalToggle');
    const contraentregaToggle = document.getElementById('contraentregaToggle');
    transferenciaToggle?.addEventListener('change', (e) => showNotification(`Transferencia bancaria ${e.target.checked ? 'activada' : 'desactivada'}`, 'info'));
    paypalToggle?.addEventListener('change', (e) => showNotification(`PayPal ${e.target.checked ? 'activado' : 'desactivado'}`, 'info'));
    contraentregaToggle?.addEventListener('change', (e) => showNotification(`Pago contra entrega ${e.target.checked ? 'activado' : 'desactivado'}`, 'info'));
    
    // Tarjetas
    const btnAddCard = document.getElementById('btnAddCard');
    btnAddCard?.addEventListener('click', openModal);
    
    // Modal
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const saveCardBtn = document.getElementById('saveCardBtn');
    const modalOverlay = document.getElementById('cardModalOverlay');
    
    closeModalBtn?.addEventListener('click', closeModal);
    cancelModalBtn?.addEventListener('click', closeModal);
    saveCardBtn?.addEventListener('click', saveCard);
    modalOverlay?.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    
    // Navegación
    const btnPrevTop = document.getElementById('btnPrevTop');
    const btnNextTop = document.getElementById('btnNextTop');
    const stepItems = document.querySelectorAll('.outlet-step-item');
    
    btnPrevTop?.addEventListener('click', () => cambiarPanel(-1));
    btnNextTop?.addEventListener('click', () => cambiarPanel(1));
    stepItems.forEach((step, idx) => step.addEventListener('click', () => irAlPaso(idx + 1)));
    
    // Botones finales
    const btnGuardar = document.getElementById('btnGuardar');
    const btnCancelar = document.getElementById('btnCancelar');
    
    btnGuardar?.addEventListener('click', () => {
        btnGuardar.style.transform = 'scale(0.98)';
        setTimeout(() => { if (btnGuardar) btnGuardar.style.transform = ''; }, 200);
        showNotification('✨ Todos los cambios han sido guardados', 'success');
        document.querySelector('.outlet-profile-header')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    btnCancelar?.addEventListener('click', () => {
        showNotification('Cambios descartados', 'info');
    });
}

// ========================================
// Sincronización con modo oscuro
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
    if (e.detail?.isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});

// ========================================
// Cargar datos de ejemplo
// ========================================
function loadExampleData() {
    // Datos personales
    const nombre = document.getElementById('nombre');
    const apellidoPa = document.getElementById('apellidoPa');
    const apellidoMa = document.getElementById('apellidoMa');
    const email = document.getElementById('email');
    const telefonoPrincipal = document.getElementById('telefonoPrincipal');
    
    if (nombre) nombre.value = 'Ana';
    if (apellidoPa) apellidoPa.value = 'García';
    if (apellidoMa) apellidoMa.value = 'López';
    if (email) email.value = 'ana.garcia@email.com';
    if (telefonoPrincipal) telefonoPrincipal.value = '5512345678';
    
    // Dirección
    const destinatario = document.getElementById('destinatario');
    const dirTelefono1 = document.getElementById('dirTelefono1');
    const calle = document.getElementById('calle');
    const numeroExterior = document.getElementById('numeroExterior');
    const colonia = document.getElementById('colonia');
    const ciudad = document.getElementById('ciudad');
    const estado = document.getElementById('estado');
    const codigoPostal = document.getElementById('codigoPostal');
    const pais = document.getElementById('pais');
    
    if (destinatario) destinatario.value = 'Ana García López';
    if (dirTelefono1) dirTelefono1.value = '5512345678';
    if (calle) calle.value = 'Av. Insurgentes';
    if (numeroExterior) numeroExterior.value = '123';
    if (colonia) colonia.value = 'Condesa';
    if (ciudad) ciudad.value = 'Ciudad de México';
    if (estado) estado.value = 'CDMX';
    if (codigoPostal) codigoPostal.value = '06100';
    if (pais) pais.value = 'México';
    
    actualizarIniciales();
    actualizarEstadoDireccion();
}

// ========================================
// Inicialización
// ========================================
export async function userProfileEditController() {
    console.log('👤 User Profile Edit Controller - Edición de perfil');
    
    // Cargar tarjetas de ejemplo
    cards = [...defaultCards];
    
    // Cargar datos de ejemplo
    loadExampleData();
    
    // Renderizar tarjetas
    renderCards();
    
    // Sincronizar modo oscuro
    syncDarkMode();
    
    // Actualizar UI del wizard
    updateWizardUI();
    
    // Inicializar event listeners
    initEventListeners();
    
    console.log('✅ User Profile Edit page loaded');
}