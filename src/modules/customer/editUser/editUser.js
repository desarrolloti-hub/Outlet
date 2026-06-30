/* ========================================
   USER PROFILE EDIT CONTROLLER - OUTLET
   Controlador para edición de perfil de usuario
   Wizard de 3 pasos | Diseño premium con variables globales
   Conectado a Firebase mediante CustomerService
   ======================================== */

import { CustomerService } from '/services/customerService.js';

// ========================================
// DOM Elements
// ========================================
let currentStep = 1;
let cards = [];
let isTransitioning = false;
let currentCustomer = null;

// ========================================
// Toast Notifications
// ========================================
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

// ========================================
// Cargar datos del usuario desde Firebase
// ========================================
async function loadCustomerData() {
    try {
        console.log('📥 Cargando datos del customer desde Firebase...');
        
        const customer = await CustomerService.getCurrentCustomer(true);
        
        if (!customer) {
            console.warn('⚠️ No hay customer autenticado');
            showNotification('No hay sesión activa', 'error');
            return false;
        }
        
        currentCustomer = customer;
        console.log('✅ Customer cargado:', currentCustomer.nombreCompleto);
        
        // Cargar datos en el formulario
        loadDataToForm(currentCustomer);
        
        // Cargar tarjetas desde la base de datos (si existen)
        if (currentCustomer.tarjetas && Array.isArray(currentCustomer.tarjetas)) {
            cards = currentCustomer.tarjetas;
        } else {
            cards = [];
        }
        renderCards();
        
        // Actualizar avatar y UI
        actualizarIniciales();
        actualizarEstadoDireccion();
        updateAvatarFromSession();
        
        return true;
    } catch (error) {
        console.error('❌ Error cargando datos del customer:', error);
        showNotification('Error al cargar perfil', 'error');
        return false;
    }
}

/**
 * Cargar datos del customer al formulario
 */
function loadDataToForm(customer) {
    // Datos personales
    const nombre = document.getElementById('nombre');
    const apellidoPa = document.getElementById('apellidoPa');
    const apellidoMa = document.getElementById('apellidoMa');
    const email = document.getElementById('email');
    const telefonoPrincipal = document.getElementById('telefonoPrincipal');
    
    if (nombre) nombre.value = customer.nombre || '';
    if (apellidoPa) apellidoPa.value = customer.apellidoPa || '';
    if (apellidoMa) apellidoMa.value = customer.apellidoMa || '';
    if (email) {
        email.value = customer.email || '';
        email.readOnly = true;
        email.disabled = true;
    }
    if (telefonoPrincipal) telefonoPrincipal.value = customer.telefono || customer.direccion?.telefono1 || '';
    
    // Dirección
    const direccion = customer.direccion || {};
    const destinatario = document.getElementById('destinatario');
    const dirTelefono1 = document.getElementById('dirTelefono1');
    const dirTelefono2 = document.getElementById('dirTelefono2');
    const calle = document.getElementById('calle');
    const numeroExterior = document.getElementById('numeroExterior');
    const numeroInterior = document.getElementById('numeroInterior');
    const colonia = document.getElementById('colonia');
    const ciudad = document.getElementById('ciudad');
    const estado = document.getElementById('estado');
    const codigoPostal = document.getElementById('codigoPostal');
    const pais = document.getElementById('pais');
    const referencias = document.getElementById('referencias');
    
    if (destinatario) destinatario.value = direccion.destinatario || customer.nombreCompleto || '';
    if (dirTelefono1) dirTelefono1.value = direccion.telefono1 || '';
    if (dirTelefono2) dirTelefono2.value = direccion.telefono2 || '';
    if (calle) calle.value = direccion.calle || '';
    if (numeroExterior) numeroExterior.value = direccion.numeroExterior || '';
    if (numeroInterior) numeroInterior.value = direccion.numeroInterior || '';
    if (colonia) colonia.value = direccion.colonia || '';
    if (ciudad) ciudad.value = direccion.ciudad || '';
    if (estado) estado.value = direccion.estado || '';
    if (codigoPostal) codigoPostal.value = direccion.codigoPostal || '';
    if (pais) pais.value = direccion.pais || 'México';
    if (referencias) referencias.value = direccion.referencias || '';
    
    // Preferencias
    const preferencias = customer.preferencias || {};
    const newsletterToggle = document.getElementById('newsletterToggle');
    const notificacionesToggle = document.getElementById('notificacionesToggle');
    
    if (newsletterToggle) newsletterToggle.checked = preferencias.newsletter || false;
    if (notificacionesToggle) notificacionesToggle.checked = preferencias.notificaciones !== false;
}

/**
 * Actualizar avatar desde la sesión
 */
function updateAvatarFromSession() {
    try {
        const session = JSON.parse(localStorage.getItem('outlet_customer'));
        if (!session) return;
        
        const avatarImg = document.getElementById('profileAvatar');
    
        
        if (avatarImg && session.fotoPerfil && session.fotoPerfil.startsWith('http')) {
            avatarImg.src = session.fotoPerfil;
            avatarImg.style.display = 'block';
            avatarImg.style.width = '40px';
            avatarImg.style.height = '40px';
            avatarImg.style.borderRadius = '50%';
            avatarImg.style.objectFit = 'cover';
            avatarImg.style.border = '2px solid var(--outlet-gold, #c9a84c)';
            if (badgeSpan) badgeSpan.style.display = 'none';
        } else if (badgeSpan) {
            avatarImg.style.display = 'none';
            badgeSpan.style.display = 'flex';
            badgeSpan.textContent = session.iniciales || session.nombre?.charAt(0) || 'U';
            badgeSpan.style.width = '40px';
            badgeSpan.style.height = '40px';
            badgeSpan.style.borderRadius = '50%';
            badgeSpan.style.background = 'var(--outlet-gold, #c9a84c)';
            badgeSpan.style.color = '#1a1a1a';
            badgeSpan.style.fontWeight = '700';
            badgeSpan.style.fontSize = '16px';
            badgeSpan.style.alignItems = 'center';
            badgeSpan.style.justifyContent = 'center';
            badgeSpan.style.display = 'flex';
            badgeSpan.style.textTransform = 'uppercase';
        }
    } catch (error) {
        console.error('Error actualizando avatar:', error);
    }
    function updateAvatarFromSession() {
    try {
        const session = JSON.parse(localStorage.getItem('outlet_customer'));
        if (!session) return;
        
        // ... tu código existente ...
        
        // Forzar actualización del navbar
        if (typeof window.updateProfileAvatar === 'function') {
            setTimeout(window.updateProfileAvatar, 100);
        }
        
        // También disparar evento para que el navbar lo escuche
        window.dispatchEvent(new CustomEvent('customer:authStateChanged', {
            detail: session
        }));
    } catch (error) {
        console.error('Error actualizando avatar:', error);
    }
}
}

// ========================================
// Funciones de UI
// ========================================

/**
 * Actualiza las iniciales del avatar
 */
function actualizarIniciales() {
    const nombreInput = document.getElementById('nombre');
    const apellidoPaInput = document.getElementById('apellidoPa');
    const avatarIniciales = document.getElementById('avatarIniciales');
    
    if (!avatarIniciales) return;
    
    const nombre = nombreInput?.value.trim() || currentCustomer?.nombre || '';
    const apellido = apellidoPaInput?.value.trim() || currentCustomer?.apellidoPa || '';
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
        badgeEnvio.style.background = 'var(--outlet-success, #28a745)';
        badgeEnvio.style.color = '#fff';
    } else {
        badgeEnvio.textContent = 'Incompleta';
        badgeEnvio.classList.remove('completa');
        badgeEnvio.style.background = 'var(--outlet-danger, #dc3545)';
        badgeEnvio.style.color = '#fff';
    }
}

// ========================================
// Tarjetas de pago
// ========================================

/**
 * Renderiza las tarjetas de pago
 */
function renderCards() {
    const paymentCardsList = document.getElementById('paymentCardsList');
    const defaultPaymentDisplay = document.getElementById('defaultPaymentDisplay');
    
    if (!paymentCardsList) return;
    
    if (!cards || cards.length === 0) {
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
                    <span class="outlet-card-number">${card.number || '**** **** **** ****'}</span>
                    <span class="outlet-card-expiry">Expira: ${card.expiry || '12/28'}</span>
                    <span style="font-size: 10px; color: var(--outlet-text-secondary);">${card.name || ''}</span>
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
                    <strong>${defaultCard.number || '**** **** **** ****'}</strong>
                    <p style="font-size: 11px; margin-top: 4px;">Expira: ${defaultCard.expiry || '12/28'}</p>
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
// Guardar cambios en Firebase
// ========================================

async function guardarCambios() {
    function updateAvatarFromSession() {
    try {
        const session = JSON.parse(localStorage.getItem('outlet_customer'));
        if (!session) return;
        
        // ... tu código existente ...
        
        // Forzar actualización del navbar
        if (typeof window.updateProfileAvatar === 'function') {
            setTimeout(window.updateProfileAvatar, 100);
        }
        
        // También disparar evento para que el navbar lo escuche
        window.dispatchEvent(new CustomEvent('customer:authStateChanged', {
            detail: session
        }));
    } catch (error) {
        console.error('Error actualizando avatar:', error);
    }
}
    try {
        if (!currentCustomer) {
            showNotification('No hay sesión activa', 'error');
            return;
        }
        
        // Recopilar datos del formulario
        const nombre = document.getElementById('nombre')?.value || '';
        const apellidoPa = document.getElementById('apellidoPa')?.value || '';
        const apellidoMa = document.getElementById('apellidoMa')?.value || '';
        const telefonoPrincipal = document.getElementById('telefonoPrincipal')?.value || '';
        
        // Dirección
        const direccion = {
            destinatario: document.getElementById('destinatario')?.value || '',
            telefono1: document.getElementById('dirTelefono1')?.value || '',
            telefono2: document.getElementById('dirTelefono2')?.value || '',
            calle: document.getElementById('calle')?.value || '',
            numeroExterior: document.getElementById('numeroExterior')?.value || '',
            numeroInterior: document.getElementById('numeroInterior')?.value || '',
            colonia: document.getElementById('colonia')?.value || '',
            ciudad: document.getElementById('ciudad')?.value || '',
            estado: document.getElementById('estado')?.value || '',
            codigoPostal: document.getElementById('codigoPostal')?.value || '',
            pais: document.getElementById('pais')?.value || 'México',
            referencias: document.getElementById('referencias')?.value || ''
        };
        
        // Preferencias
        const preferencias = {
            newsletter: document.getElementById('newsletterToggle')?.checked || false,
            notificaciones: document.getElementById('notificacionesToggle')?.checked || true
        };
        
        // Datos a actualizar
        const updateData = {
            nombre: nombre,
            apellidoPa: apellidoPa,
            apellidoMa: apellidoMa,
            telefono: telefonoPrincipal,
            direccion: direccion,
            preferencias: preferencias,
            tarjetas: cards
        };
        
        console.log('📤 Guardando cambios en Firebase...');
        
        // Usar CustomerService para actualizar
        const updatedCustomer = await CustomerService.updateProfile(
            currentCustomer.id,
            updateData
        );
        
        if (updatedCustomer) {
            currentCustomer = updatedCustomer;
            showNotification('✨ Todos los cambios han sido guardados', 'success');
            
            // Actualizar avatar
            updateAvatarFromSession();
            
            // Disparar evento de actualización
            window.dispatchEvent(new CustomEvent('customer:authStateChanged', {
                detail: updatedCustomer
            }));
            
            // Scroll al header
            document.querySelector('.outlet-profile-header')?.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('❌ Error guardando cambios:', error);
        showNotification(error.message || 'Error al guardar cambios', 'error');
    }
}

// ========================================
// Cambiar contraseña
// ========================================

async function cambiarContrasena() {
    try {
        if (!currentCustomer) {
            showNotification('No hay sesión activa', 'error');
            return;
        }
        
        const email = currentCustomer.email;
        if (!email) {
            showNotification('No hay correo registrado', 'error');
            return;
        }
        
        const btn = document.getElementById('btnCambiarPass');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Enviando...';
        btn.disabled = true;
        
        try {
            const { getAuth, sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
            const auth = getAuth();
            await sendPasswordResetEmail(auth, email);
            
            showNotification(`✨ Enlace de restablecimiento enviado a ${email}`, 'success');
        } catch (error) {
            console.error('Error enviando email:', error);
            showNotification('Error al enviar el enlace. Intenta de nuevo.', 'error');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cambiar contraseña', 'error');
    }
}

// ========================================
// Cerrar sesión
// ========================================

async function handleLogout() {
    try {
        console.log('🚪 Cerrando sesión desde el perfil...');
        
        // Mostrar confirmación
        const confirmLogout = confirm('¿Estás seguro de que deseas cerrar sesión?');
        if (!confirmLogout) return;
        
        // Mostrar estado de carga en el botón
        const btnLogout = document.getElementById('btnLogout');
        const originalHTML = btnLogout.innerHTML;
        btnLogout.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Cerrando sesión...';
        btnLogout.disabled = true;
        
        // Cerrar sesión con CustomerService
        await CustomerService.logout();
        
        console.log('✅ Sesión cerrada exitosamente');
        
        // Mostrar notificación
        showNotification('Sesión cerrada exitosamente', 'success');
        
        // Redirigir al login después de un breve delay
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/login');
            } else {
                window.location.href = '/login';
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        showNotification('Error al cerrar sesión: ' + error.message, 'error');
        
        // Restaurar botón
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.innerHTML = originalHTML || '<span class="material-symbols-outlined">logout</span> Cerrar sesión';
            btnLogout.disabled = false;
        }
    }
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    // Avatar
    const btnCambiarAvatar = document.getElementById('btnCambiarAvatar');
    btnCambiarAvatar?.addEventListener('click', () => {
        showNotification('Función de avatar disponible próximamente', 'info');
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
    btnCambiarPass?.addEventListener('click', cambiarContrasena);
    
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
    
    // Botón de cerrar sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.removeEventListener('click', handleLogout);
        btnLogout.addEventListener('click', handleLogout);
        console.log('✅ Listener de logout configurado');
    } else {
        console.warn('⚠️ No se encontró #btnLogout en el DOM');
    }
    
    // Botones finales
    const btnGuardar = document.getElementById('btnGuardar');
    const btnCancelar = document.getElementById('btnCancelar');
    
    btnGuardar?.addEventListener('click', guardarCambios);
    
    btnCancelar?.addEventListener('click', () => {
        showNotification('Cambios descartados', 'info');
        // Recargar datos desde Firebase
        loadCustomerData();
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
// Inicialización
// ========================================

export async function userProfileEditController() {
    console.log('👤 User Profile Edit Controller - Edición de perfil');
    
    try {
        // Cargar datos del usuario desde Firebase
        const loaded = await loadCustomerData();
        
        if (!loaded) {
            console.warn('⚠️ No se pudieron cargar los datos del usuario');
            showNotification('Error al cargar perfil. Redirigiendo al login...', 'error');
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/login');
                } else {
                    window.location.href = '/login';
                }
            }, 2000);
            return;
        }
        
        // Renderizar tarjetas
        renderCards();
        
        // Sincronizar modo oscuro
        syncDarkMode();
        
        // Actualizar UI del wizard
        updateWizardUI();
        
        // Inicializar event listeners
        initEventListeners();
        
        // Escuchar cambios en la sesión
        window.addEventListener('customer:authStateChanged', async (event) => {
            console.log('🔄 Auth state changed, recargando datos...');
            await loadCustomerData();
        });
        
        console.log('✅ User Profile Edit page loaded');
    } catch (error) {
        console.error('❌ Error inicializando:', error);
        showNotification('Error al cargar el perfil', 'error');
    }
}