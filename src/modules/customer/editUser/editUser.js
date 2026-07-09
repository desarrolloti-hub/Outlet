/* ========================================
   USER PROFILE EDIT CONTROLLER - OUTLET
   Controlador para edición de perfil de usuario
   Wizard de 3 pasos | Diseño premium con variables globales
   Conectado a Firebase mediante CustomerService
   CON SWEETALERT2 INTEGRADO
   ======================================== */

import { CustomerService } from '../../../services/customerService.js';

// ========================================
// DOM Elements
// ========================================
var currentStep = 1;
var cards = [];
var isTransitioning = false;
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
        
        loadDataToForm(currentCustomer);
        
        if (currentCustomer.tarjetas && Array.isArray(currentCustomer.tarjetas)) {
            cards = currentCustomer.tarjetas;
        } else {
            cards = [];
        }
        renderCards();
        
        actualizarIniciales();
        actualizarEstadoDireccion();
        updateAvatarFromSession();
        
        return true;
    } catch (error) {
        console.error('❌ Error cargando datos del customer:', error);
        await mostrarError('Error al cargar perfil', error.message || 'No se pudieron cargar los datos del perfil.');
        return false;
    }
}

// ========================================
// Cargar datos del customer al formulario
// ========================================
function loadDataToForm(customer) {
    var nombre = document.getElementById('nombre');
    var apellidoPa = document.getElementById('apellidoPa');
    var apellidoMa = document.getElementById('apellidoMa');
    var email = document.getElementById('email');
    var telefonoPrincipal = document.getElementById('telefonoPrincipal');
    
    if (nombre) nombre.value = customer.nombre || '';
    if (apellidoPa) apellidoPa.value = customer.apellidoPa || '';
    if (apellidoMa) apellidoMa.value = customer.apellidoMa || '';
    if (email) {
        email.value = customer.email || '';
        email.readOnly = true;
        email.disabled = true;
    }
    if (telefonoPrincipal) telefonoPrincipal.value = customer.telefono || customer.direccion?.telefono1 || '';
    
    var direccion = customer.direccion || {};
    var destinatario = document.getElementById('destinatario');
    var dirTelefono1 = document.getElementById('dirTelefono1');
    var dirTelefono2 = document.getElementById('dirTelefono2');
    var calle = document.getElementById('calle');
    var numeroExterior = document.getElementById('numeroExterior');
    var numeroInterior = document.getElementById('numeroInterior');
    var colonia = document.getElementById('colonia');
    var ciudad = document.getElementById('ciudad');
    var estado = document.getElementById('estado');
    var codigoPostal = document.getElementById('codigoPostal');
    var pais = document.getElementById('pais');
    var referencias = document.getElementById('referencias');
    
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
    
    var preferencias = customer.preferencias || {};
    var newsletterToggle = document.getElementById('newsletterToggle');
    var notificacionesToggle = document.getElementById('notificacionesToggle');
    
    if (newsletterToggle) newsletterToggle.checked = preferencias.newsletter || false;
    if (notificacionesToggle) notificacionesToggle.checked = preferencias.notificaciones !== false;
}

// ========================================
// Actualizar avatar desde la sesión
// ========================================
function updateAvatarFromSession() {
    try {
        var session = JSON.parse(localStorage.getItem('outlet_customer'));
        if (!session) return;
        
        var avatarImg = document.getElementById('profileAvatar');
        var badgeSpan = document.querySelector('.admin-avatar .avatar-badge');
        
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
        
        if (typeof window.updateProfileAvatar === 'function') {
            setTimeout(window.updateProfileAvatar, 100);
        }
        
        window.dispatchEvent(new CustomEvent('customer:authStateChanged', {
            detail: session
        }));
    } catch (error) {
        console.error('Error actualizando avatar:', error);
    }
}

// ========================================
// Funciones de UI
// ========================================

function actualizarIniciales() {
    var nombreInput = document.getElementById('nombre');
    var apellidoPaInput = document.getElementById('apellidoPa');
    var avatarIniciales = document.getElementById('avatarIniciales');
    
    if (!avatarIniciales) return;
    
    var nombre = nombreInput?.value.trim() || currentCustomer?.nombre || '';
    var apellido = apellidoPaInput?.value.trim() || currentCustomer?.apellidoPa || '';
    var iniciales = '';
    if (nombre) iniciales += nombre.charAt(0);
    if (apellido) iniciales += apellido.charAt(0);
    if (iniciales === '') iniciales = 'U';
    
    avatarIniciales.textContent = iniciales.toUpperCase();
    
    var avatarCircle = document.getElementById('avatarCircle');
    if (avatarCircle) {
        avatarCircle.style.transform = 'scale(1.02)';
        setTimeout(function() { if (avatarCircle) avatarCircle.style.transform = 'scale(1)'; }, 300);
    }
}

function actualizarEstadoDireccion() {
    var calle = document.getElementById('calle');
    var numeroExterior = document.getElementById('numeroExterior');
    var colonia = document.getElementById('colonia');
    var ciudad = document.getElementById('ciudad');
    var estado = document.getElementById('estado');
    var codigoPostal = document.getElementById('codigoPostal');
    var dirTelefono1 = document.getElementById('dirTelefono1');
    var badgeEnvio = document.getElementById('badgeEnvio');
    
    if (!badgeEnvio) return;
    
    var tieneDireccionCompleta = (
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

function renderCards() {
    var paymentCardsList = document.getElementById('paymentCardsList');
    var defaultPaymentDisplay = document.getElementById('defaultPaymentDisplay');
    
    if (!paymentCardsList) return;
    
    if (!cards || cards.length === 0) {
        paymentCardsList.innerHTML = '<div class="outlet-card-item" style="justify-content: center; text-align: center;"><span style="color: var(--outlet-text-secondary);">No tienes tarjetas guardadas</span></div>';
        if (defaultPaymentDisplay) {
            defaultPaymentDisplay.innerHTML = '<div class="outlet-default-placeholder"><span class="material-symbols-outlined">credit_card</span><p>No hay tarjeta seleccionada</p></div>';
        }
        return;
    }
    
    var html = '';
    cards.forEach(function(card) {
        html += 
            '<div class="outlet-card-item ' + (card.isDefault ? 'selected' : '') + '" data-card-id="' + card.id + '">' +
                '<div class="outlet-card-info">' +
                    '<span class="material-symbols-outlined outlet-card-icon">credit_card</span>' +
                    '<div class="outlet-card-details">' +
                        '<span class="outlet-card-number">' + (card.number || '**** **** **** ****') + '</span>' +
                        '<span class="outlet-card-expiry">Expira: ' + (card.expiry || '12/28') + '</span>' +
                        '<span style="font-size: 10px; color: var(--outlet-text-secondary);">' + (card.name || '') + '</span>' +
                    '</div>' +
                    (card.isDefault ? '<span class="outlet-default-badge">Predeterminada</span>' : '') +
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
    
    var defaultCard = cards.find(function(c) { return c.isDefault; });
    if (defaultPaymentDisplay) {
        if (defaultCard) {
            defaultPaymentDisplay.innerHTML = '<div class="outlet-default-placeholder" style="flex-direction: row; justify-content: center; gap: 12px;">' +
                '<span class="material-symbols-outlined" style="color: var(--outlet-gold);">credit_card</span>' +
                '<div>' +
                    '<strong>' + (defaultCard.number || '**** **** **** ****') + '</strong>' +
                    '<p style="font-size: 11px; margin-top: 4px;">Expira: ' + (defaultCard.expiry || '12/28') + '</p>' +
                '</div>' +
            '</div>';
        } else {
            defaultPaymentDisplay.innerHTML = '<div class="outlet-default-placeholder"><span class="material-symbols-outlined">credit_card</span><p>No hay tarjeta seleccionada</p></div>';
        }
    }
    
    document.querySelectorAll('.outlet-btn-card-action.star').forEach(function(btn) {
        btn.removeEventListener('click', handleStarClick);
        btn.addEventListener('click', handleStarClick);
    });
    
    document.querySelectorAll('.outlet-btn-card-action.delete').forEach(function(btn) {
        btn.removeEventListener('click', handleDeleteClick);
        btn.addEventListener('click', handleDeleteClick);
    });
}

async function handleStarClick(e) {
    e.stopPropagation();
    var id = parseInt(e.currentTarget.dataset.id);
    cards = cards.map(function(c) { return { ...c, isDefault: c.id === id }; });
    renderCards();
    await mostrarExito('Tarjeta actualizada', 'Tarjeta predeterminada actualizada correctamente.');
}

async function handleDeleteClick(e) {
    e.stopPropagation();
    var id = parseInt(e.currentTarget.dataset.id);
    var cardToDelete = cards.find(function(c) { return c.id === id; });
    
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
        cards = cards.filter(function(c) { return c.id !== id; });
        if (cards.length > 0 && !cards.some(function(c) { return c.isDefault; })) {
            cards[0].isDefault = true;
        }
        renderCards();
        await mostrarExito('Tarjeta eliminada', 'La tarjeta ha sido eliminada correctamente.');
    }
}

function agregarTarjeta(numero, expiry, nombre) {
    var newId = cards.length > 0 ? Math.max.apply(null, cards.map(function(c) { return c.id; })) + 1 : 1;
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
    var stepItems = document.querySelectorAll('.outlet-step-item');
    var stepCurrentSpan = document.getElementById('stepCurrent');
    var actionButtonsFinal = document.getElementById('actionButtonsFinal');
    var btnPrevTop = document.getElementById('btnPrevTop');
    
    stepItems.forEach(function(step, idx) {
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
    
    var panels = document.querySelectorAll('.outlet-carousel-panel');
    var currentPanel = document.querySelector('.outlet-carousel-panel.active');
    var currentIndex = Array.from(panels).indexOf(currentPanel);
    var newIndex = currentIndex + direction;
    
    if (newIndex < 0 || newIndex >= panels.length) return;
    
    isTransitioning = true;
    var newPanel = panels[newIndex];
    
    if (currentPanel) {
        currentPanel.style.animation = 'outletFadeOutDown 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
    }
    
    setTimeout(function() {
        if (currentPanel) {
            currentPanel.classList.remove('active');
            currentPanel.style.animation = '';
        }
        newPanel.classList.add('active');
        newPanel.style.animation = 'outletFadeInUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
        
        currentStep = newIndex + 1;
        updateWizardUI();
        
        setTimeout(function() { isTransitioning = false; }, 300);
    }, 300);
}

function irAlPaso(step) {
    if (isTransitioning || step === currentStep) return;
    var direction = step > currentStep ? 1 : -1;
    cambiarPanel(direction);
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
    var cardNumber = document.getElementById('cardNumber');
    var cardExpiry = document.getElementById('cardExpiry');
    var cardCvv = document.getElementById('cardCvv');
    var cardName = document.getElementById('cardName');
    if (cardNumber) cardNumber.value = '';
    if (cardExpiry) cardExpiry.value = '';
    if (cardCvv) cardCvv.value = '';
    if (cardName) cardName.value = '';
}

async function saveCard() {
    var cardNumber = document.getElementById('cardNumber');
    var cardExpiry = document.getElementById('cardExpiry');
    var cardName = document.getElementById('cardName');
    
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
        
        var nombre = document.getElementById('nombre')?.value || '';
        var apellidoPa = document.getElementById('apellidoPa')?.value || '';
        var apellidoMa = document.getElementById('apellidoMa')?.value || '';
        var telefonoPrincipal = document.getElementById('telefonoPrincipal')?.value || '';
        
        var direccion = {
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
        
        var preferencias = {
            newsletter: document.getElementById('newsletterToggle')?.checked || false,
            notificaciones: document.getElementById('notificacionesToggle')?.checked || true
        };
        
        var updateData = {
            nombre: nombre,
            apellidoPa: apellidoPa,
            apellidoMa: apellidoMa,
            telefono: telefonoPrincipal,
            direccion: direccion,
            preferencias: preferencias,
            tarjetas: cards
        };
        
        console.log('📤 Guardando cambios en Firebase...');
        
        mostrarLoading('Guardando cambios...');
        
        var updatedCustomer = await CustomerService.updateProfile(
            currentCustomer.id,
            updateData
        );
        
        cerrarLoading();
        
        if (updatedCustomer) {
            currentCustomer = updatedCustomer;
            await mostrarExito('¡Cambios guardados!', 'Todos los cambios han sido guardados correctamente.');
            
            updateAvatarFromSession();
            
            window.dispatchEvent(new CustomEvent('customer:authStateChanged', {
                detail: updatedCustomer
            }));
            
            document.querySelector('.outlet-profile-header')?.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        cerrarLoading();
        console.error('❌ Error guardando cambios:', error);
        await mostrarError('Error al guardar', error.message || 'Error al guardar los cambios.');
    }
}

// ========================================
// Cambiar contraseña
// ========================================

async function cambiarContrasena() {
    try {
        if (!currentCustomer) {
            await mostrarError('Sesión no activa', 'No hay una sesión activa.');
            return;
        }
        
        var email = currentCustomer.email;
        if (!email) {
            await mostrarError('Sin correo', 'No hay correo electrónico registrado.');
            return;
        }
        
        var btn = document.getElementById('btnCambiarPass');
        var originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Enviando...';
        btn.disabled = true;
        
        mostrarLoading('Enviando enlace de recuperación...');
        
        try {
            var auth = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
            var getAuth = auth.getAuth;
            var sendPasswordResetEmail = auth.sendPasswordResetEmail;
            var authInstance = getAuth();
            await sendPasswordResetEmail(authInstance, email);
            
            cerrarLoading();
            await mostrarExito(
                '¡Enlace enviado!',
                'Se ha enviado un enlace de restablecimiento a ' + email + '. Revisa tu correo.'
            );
        } catch (error) {
            cerrarLoading();
            console.error('Error enviando email:', error);
            await mostrarError('Error al enviar', 'No se pudo enviar el enlace. Intenta de nuevo.');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        await mostrarError('Error', 'Error al cambiar la contraseña.');
    }
}

// ========================================
// Cerrar sesión
// ========================================

async function handleLogout() {
    try {
        console.log('🚪 Cerrando sesión desde el perfil...');
        
        var result = await mostrarConfirmacion(
            '¿Cerrar sesión?',
            '¿Estás seguro de que deseas cerrar sesión?',
            'Sí, cerrar sesión'
        );
        
        if (!result.isConfirmed) return;
        
        var btnLogout = document.getElementById('btnLogout');
        var originalHTML = btnLogout.innerHTML;
        btnLogout.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Cerrando sesión...';
        btnLogout.disabled = true;
        
        mostrarLoading('Cerrando sesión...');
        
        await CustomerService.logout();
        
        cerrarLoading();
        console.log('✅ Sesión cerrada exitosamente');
        
        await mostrarExito('Sesión cerrada', 'Has cerrado sesión exitosamente.');
        
        setTimeout(function() {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/login');
            } else {
                window.location.href = '/login';
            }
        }, 500);
        
    } catch (error) {
        cerrarLoading();
        console.error('❌ Error al cerrar sesión:', error);
        await mostrarError('Error al cerrar sesión', error.message || 'Ocurrió un error al cerrar sesión.');
        
        var btnLogout = document.getElementById('btnLogout');
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
    var btnCambiarAvatar = document.getElementById('btnCambiarAvatar');
    btnCambiarAvatar?.addEventListener('click', function() {
        mostrarToast('Función de avatar disponible próximamente', 'info');
    });
    
    var nombreInput = document.getElementById('nombre');
    var apellidoPaInput = document.getElementById('apellidoPa');
    nombreInput?.addEventListener('input', actualizarIniciales);
    apellidoPaInput?.addEventListener('input', actualizarIniciales);
    
    var direccionInputs = ['destinatario', 'dirTelefono1', 'dirTelefono2', 'calle', 'numeroExterior', 
                             'numeroInterior', 'colonia', 'ciudad', 'estado', 'codigoPostal', 'pais', 'referencias'];
    direccionInputs.forEach(function(id) {
        var input = document.getElementById(id);
        input?.addEventListener('input', actualizarEstadoDireccion);
    });
    
    var btnCambiarPass = document.getElementById('btnCambiarPass');
    btnCambiarPass?.addEventListener('click', cambiarContrasena);
    
    var newsletterToggle = document.getElementById('newsletterToggle');
    var notificacionesToggle = document.getElementById('notificacionesToggle');
    newsletterToggle?.addEventListener('change', function(e) {
        mostrarToast('Newsletter ' + (e.target.checked ? 'activada' : 'desactivada'), 'info');
    });
    notificacionesToggle?.addEventListener('change', function(e) {
        mostrarToast('Notificaciones ' + (e.target.checked ? 'activadas' : 'desactivadas'), 'info');
    });
    
    var transferenciaToggle = document.getElementById('transferenciaToggle');
    var paypalToggle = document.getElementById('paypalToggle');
    var contraentregaToggle = document.getElementById('contraentregaToggle');
    transferenciaToggle?.addEventListener('change', function(e) {
        mostrarToast('Transferencia bancaria ' + (e.target.checked ? 'activada' : 'desactivada'), 'info');
    });
    paypalToggle?.addEventListener('change', function(e) {
        mostrarToast('PayPal ' + (e.target.checked ? 'activado' : 'desactivado'), 'info');
    });
    contraentregaToggle?.addEventListener('change', function(e) {
        mostrarToast('Pago contra entrega ' + (e.target.checked ? 'activado' : 'desactivado'), 'info');
    });
    
    var btnAddCard = document.getElementById('btnAddCard');
    btnAddCard?.addEventListener('click', openModal);
    
    var closeModalBtn = document.getElementById('closeModalBtn');
    var cancelModalBtn = document.getElementById('cancelModalBtn');
    var saveCardBtn = document.getElementById('saveCardBtn');
    var modalOverlay = document.getElementById('cardModalOverlay');
    
    closeModalBtn?.addEventListener('click', closeModal);
    cancelModalBtn?.addEventListener('click', closeModal);
    saveCardBtn?.addEventListener('click', saveCard);
    modalOverlay?.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });
    
    var btnPrevTop = document.getElementById('btnPrevTop');
    var btnNextTop = document.getElementById('btnNextTop');
    var stepItems = document.querySelectorAll('.outlet-step-item');
    
    btnPrevTop?.addEventListener('click', function() { cambiarPanel(-1); });
    btnNextTop?.addEventListener('click', function() { cambiarPanel(1); });
    stepItems.forEach(function(step, idx) {
        step.addEventListener('click', function() { irAlPaso(idx + 1); });
    });
    
    var btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.removeEventListener('click', handleLogout);
        btnLogout.addEventListener('click', handleLogout);
        console.log('✅ Listener de logout configurado');
    } else {
        console.warn('⚠️ No se encontró #btnLogout en el DOM');
    }
    
    var btnGuardar = document.getElementById('btnGuardar');
    var btnCancelar = document.getElementById('btnCancelar');
    
    btnGuardar?.addEventListener('click', guardarCambios);
    
    btnCancelar?.addEventListener('click', function() {
        mostrarToast('Cambios descartados', 'info');
        loadCustomerData();
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

document.addEventListener('themeChanged', function(e) {
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
        var loaded = await loadCustomerData();
        
        if (!loaded) {
            console.warn('⚠️ No se pudieron cargar los datos del usuario');
            await mostrarError('Error al cargar perfil', 'No se pudieron cargar los datos del perfil. Redirigiendo al login...');
            
            setTimeout(function() {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/login');
                } else {
                    window.location.href = '/login';
                }
            }, 2000);
            return;
        }
        
        renderCards();
        syncDarkMode();
        updateWizardUI();
        initEventListeners();
        
        window.addEventListener('customer:authStateChanged', async function(event) {
            console.log('🔄 Auth state changed, recargando datos...');
            await loadCustomerData();
        });
        
        console.log('✅ User Profile Edit page loaded');
    } catch (error) {
        console.error('❌ Error inicializando:', error);
        await mostrarError('Error al cargar perfil', error.message || 'Ocurrió un error al cargar el perfil.');
    }
}