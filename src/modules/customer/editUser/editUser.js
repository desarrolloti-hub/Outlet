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
        updateEditUserAvatar();
        
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
    var nombre = document.getElementById('editUserNombre');
    var apellidoPa = document.getElementById('editUserApellidoPa');
    var apellidoMa = document.getElementById('editUserApellidoMa');
    var email = document.getElementById('editUserEmail');
    var telefonoPrincipal = document.getElementById('editUserTelefonoPrincipal');
    
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
    var destinatario = document.getElementById('editUserDestinatario');
    var dirTelefono1 = document.getElementById('editUserDirTelefono1');
    var dirTelefono2 = document.getElementById('editUserDirTelefono2');
    var calle = document.getElementById('editUserCalle');
    var numeroExterior = document.getElementById('editUserNumeroExterior');
    var numeroInterior = document.getElementById('editUserNumeroInterior');
    var colonia = document.getElementById('editUserColonia');
    var ciudad = document.getElementById('editUserCiudad');
    var estado = document.getElementById('editUserEstado');
    var codigoPostal = document.getElementById('editUserCodigoPostal');
    var pais = document.getElementById('editUserPais');
    var referencias = document.getElementById('editUserReferencias');
    
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
    var newsletterToggle = document.getElementById('editUserNewsletterToggle');
    var notificacionesToggle = document.getElementById('editUserNotificacionesToggle');
    
    if (newsletterToggle) newsletterToggle.checked = preferencias.newsletter || false;
    if (notificacionesToggle) notificacionesToggle.checked = preferencias.notificaciones !== false;
}

// ========================================
// Actualizar avatar del editUser (NO del navbar)
// ========================================
function updateEditUserAvatar() {
    try {
        var session = JSON.parse(localStorage.getItem('outlet_customer'));
        if (!session) return;
        
        var avatarImg = document.getElementById('editUserProfileAvatar');
        var placeholder = document.getElementById('editUserAvatarPlaceholder');
        var initialsSpan = document.getElementById('editUserAvatarInitials');
        var nameDisplay = document.getElementById('editUserNameDisplay');
        var emailDisplay = document.getElementById('editUserEmailDisplay');
        
        // Actualizar nombre y email
        if (nameDisplay) {
            nameDisplay.textContent = session.nombreCompleto || session.nombre || 'Usuario';
        }
        if (emailDisplay) {
            emailDisplay.textContent = session.email || '';
        }
        
        // Calcular iniciales
        var nombre = session.nombre || '';
        var apellido = session.apellidoPa || '';
        var iniciales = '';
        if (nombre) iniciales += nombre.charAt(0);
        if (apellido) iniciales += apellido.charAt(0);
        if (iniciales === '') iniciales = 'U';
        if (initialsSpan) initialsSpan.textContent = iniciales.toUpperCase();
        
        // Mostrar foto si existe
        if (avatarImg && session.fotoPerfil && session.fotoPerfil.startsWith('http')) {
            avatarImg.src = session.fotoPerfil;
            avatarImg.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        } else {
            if (avatarImg) avatarImg.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error actualizando avatar de editUser:', error);
    }
}

// ========================================
// Funciones de UI
// ========================================

function actualizarIniciales() {
    var nombreInput = document.getElementById('editUserNombre');
    var apellidoPaInput = document.getElementById('editUserApellidoPa');
    var initialsSpan = document.getElementById('editUserAvatarInitials');
    
    if (!initialsSpan) return;
    
    var nombre = nombreInput?.value.trim() || currentCustomer?.nombre || '';
    var apellido = apellidoPaInput?.value.trim() || currentCustomer?.apellidoPa || '';
    var iniciales = '';
    if (nombre) iniciales += nombre.charAt(0);
    if (apellido) iniciales += apellido.charAt(0);
    if (iniciales === '') iniciales = 'U';
    
    initialsSpan.textContent = iniciales.toUpperCase();
}

function actualizarEstadoDireccion() {
    var calle = document.getElementById('editUserCalle');
    var numeroExterior = document.getElementById('editUserNumeroExterior');
    var colonia = document.getElementById('editUserColonia');
    var ciudad = document.getElementById('editUserCiudad');
    var estado = document.getElementById('editUserEstado');
    var codigoPostal = document.getElementById('editUserCodigoPostal');
    var dirTelefono1 = document.getElementById('editUserDirTelefono1');
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
    var paymentCardsList = document.getElementById('editUserPaymentCardsList');
    var defaultPaymentDisplay = document.getElementById('editUserDefaultPaymentDisplay');
    
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
    var cardNumber = document.getElementById('editUserCardNumber');
    var cardExpiry = document.getElementById('editUserCardExpiry');
    var cardCvv = document.getElementById('editUserCardCvv');
    var cardName = document.getElementById('editUserCardName');
    if (cardNumber) cardNumber.value = '';
    if (cardExpiry) cardExpiry.value = '';
    if (cardCvv) cardCvv.value = '';
    if (cardName) cardName.value = '';
}

async function saveCard() {
    var cardNumber = document.getElementById('editUserCardNumber');
    var cardExpiry = document.getElementById('editUserCardExpiry');
    var cardName = document.getElementById('editUserCardName');
    
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
        
        var nombre = document.getElementById('editUserNombre')?.value || '';
        var apellidoPa = document.getElementById('editUserApellidoPa')?.value || '';
        var apellidoMa = document.getElementById('editUserApellidoMa')?.value || '';
        var telefonoPrincipal = document.getElementById('editUserTelefonoPrincipal')?.value || '';
        
        var direccion = {
            destinatario: document.getElementById('editUserDestinatario')?.value || '',
            telefono1: document.getElementById('editUserDirTelefono1')?.value || '',
            telefono2: document.getElementById('editUserDirTelefono2')?.value || '',
            calle: document.getElementById('editUserCalle')?.value || '',
            numeroExterior: document.getElementById('editUserNumeroExterior')?.value || '',
            numeroInterior: document.getElementById('editUserNumeroInterior')?.value || '',
            colonia: document.getElementById('editUserColonia')?.value || '',
            ciudad: document.getElementById('editUserCiudad')?.value || '',
            estado: document.getElementById('editUserEstado')?.value || '',
            codigoPostal: document.getElementById('editUserCodigoPostal')?.value || '',
            pais: document.getElementById('editUserPais')?.value || 'México',
            referencias: document.getElementById('editUserReferencias')?.value || ''
        };
        
        var preferencias = {
            newsletter: document.getElementById('editUserNewsletterToggle')?.checked || false,
            notificaciones: document.getElementById('editUserNotificacionesToggle')?.checked || true
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
            
            updateEditUserAvatar();
            
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
// Manejar cambio de foto de perfil
// ========================================

function setupEditUserAvatar() {
    var avatarInput = document.getElementById('editUserAvatarInput');
    var avatarOverlay = document.getElementById('editUserAvatarOverlay');
    
    if (avatarOverlay && avatarInput) {
        avatarOverlay.addEventListener('click', function() {
            avatarInput.click();
        });
    }
    
    if (avatarInput) {
        avatarInput.addEventListener('change', async function(e) {
            var file = e.target.files[0];
            if (!file) return;
            
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                await mostrarError('Tipo no válido', 'Por favor, selecciona una imagen válida (JPG, PNG, GIF).');
                avatarInput.value = '';
                return;
            }
            
            // Validar tamaño (máx 5MB)
            if (file.size > 5 * 1024 * 1024) {
                await mostrarError('Imagen muy grande', 'La imagen no debe superar los 5MB.');
                avatarInput.value = '';
                return;
            }
            
            try {
                mostrarLoading('Subiendo foto de perfil...');
                
                // Crear FormData para subir
                var formData = new FormData();
                formData.append('foto', file);
                formData.append('customerId', currentCustomer?.id || '');
                
                // Subir al servidor (ajusta la URL según tu API)
                var response = await fetch('/api/customer/upload-avatar', {
                    method: 'POST',
                    body: formData
                });
                
                cerrarLoading();
                
                if (!response.ok) {
                    throw new Error('Error al subir la foto');
                }
                
                var result = await response.json();
                
                if (result.success && result.fotoUrl) {
                    // Actualizar sesión local
                    var session = JSON.parse(localStorage.getItem('outlet_customer') || '{}');
                    session.fotoPerfil = result.fotoUrl;
                    localStorage.setItem('outlet_customer', JSON.stringify(session));
                    
                    // Actualizar avatar en la UI
                    updateEditUserAvatar();
                    
                    // Notificar al navbar que el avatar cambió
                    if (typeof window.updateProfileAvatar === 'function') {
                        setTimeout(window.updateProfileAvatar, 100);
                    }
                    
                    // Disparar evento de auth state changed
                    window.dispatchEvent(new CustomEvent('customer:authStateChanged', {
                        detail: session
                    }));
                    
                    await mostrarExito('¡Foto actualizada!', 'Tu foto de perfil ha sido actualizada correctamente.');
                } else {
                    throw new Error(result.message || 'Error al subir la foto');
                }
            } catch (error) {
                cerrarLoading();
                console.error('Error subiendo foto:', error);
                await mostrarError('Error al subir foto', error.message || 'No se pudo subir la foto de perfil.');
                avatarInput.value = '';
            }
        });
    }
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    var nombreInput = document.getElementById('editUserNombre');
    var apellidoPaInput = document.getElementById('editUserApellidoPa');
    nombreInput?.addEventListener('input', actualizarIniciales);
    apellidoPaInput?.addEventListener('input', actualizarIniciales);
    
    var direccionInputs = ['editUserDestinatario', 'editUserDirTelefono1', 'editUserDirTelefono2', 'editUserCalle', 'editUserNumeroExterior', 
                             'editUserNumeroInterior', 'editUserColonia', 'editUserCiudad', 'editUserEstado', 'editUserCodigoPostal', 'editUserPais', 'editUserReferencias'];
    direccionInputs.forEach(function(id) {
        var input = document.getElementById(id);
        input?.addEventListener('input', actualizarEstadoDireccion);
    });
    
    var btnCambiarPass = document.getElementById('btnCambiarPass');
    btnCambiarPass?.addEventListener('click', cambiarContrasena);
    
    var newsletterToggle = document.getElementById('editUserNewsletterToggle');
    var notificacionesToggle = document.getElementById('editUserNotificacionesToggle');
    newsletterToggle?.addEventListener('change', function(e) {
        mostrarToast('Newsletter ' + (e.target.checked ? 'activada' : 'desactivada'), 'info');
    });
    notificacionesToggle?.addEventListener('change', function(e) {
        mostrarToast('Notificaciones ' + (e.target.checked ? 'activadas' : 'desactivadas'), 'info');
    });
    
    var transferenciaToggle = document.getElementById('editUserTransferenciaToggle');
    var paypalToggle = document.getElementById('editUserPaypalToggle');
    var contraentregaToggle = document.getElementById('editUserContraentregaToggle');
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
    
    // Configurar avatar
    setupEditUserAvatar();
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