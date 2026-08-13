/* ========================================
   ADMIN PROFILE CONTROLLER - OUTLET
   Controlador para perfil de administrador
   ======================================== */

import { AdminService } from '../../../services/adminService.js';
import { ROLES } from '../../../services/adminService.js';

// ========================================
// DOM Elements
// ========================================
let currentStep = 1;
let isTransitioning = false;
let currentAdmin = null;

// ========================================
// UI Helpers - CON SWEETALERT2
// ========================================

function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    const toastExistente = document.querySelector('.outlet-toast');
    if (toastExistente) toastExistente.remove();

    const toast = document.createElement('div');
    toast.className = `outlet-toast ${tipo}`;
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

function mostrarLoading(mensaje) {
    mensaje = mensaje || 'Procesando...';
    return mostrarSweetAlert({
        title: mensaje,
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
// Cargar datos del admin desde Firebase
// ========================================
async function loadAdminData() {
    try {
        console.log('📥 Cargando datos del administrador desde Firebase...');

        const admin = await AdminService.getCurrentAdmin(true);

        if (!admin) {
            console.warn('⚠️ No hay administrador autenticado');
            await mostrarError('Sesión no activa', 'No hay una sesión activa. Por favor, inicia sesión.');
            return false;
        }

        currentAdmin = admin;
        console.log('✅ Administrador cargado:', currentAdmin.nombreCompleto, 'Rol:', currentAdmin.rol);

        updateAdminSession();
        loadDataToForm(currentAdmin);
        actualizarIniciales();
        updateAdminAvatar();
        mostrarInfoRol(currentAdmin);
        mostrarPermisos(currentAdmin);
        cargarActividad();

        return true;
    } catch (error) {
        console.error('❌ Error cargando datos del administrador:', error);
        await mostrarError('Error al cargar perfil', error.message || 'No se pudieron cargar los datos del perfil.');
        return false;
    }
}

function updateAdminSession() {
    try {
        const session = JSON.parse(localStorage.getItem('outlet_admin') || '{}');
        if (currentAdmin) {
            session.nombre = currentAdmin.nombre;
            session.apellidoPa = currentAdmin.apellidoPa;
            session.apellidoMa = currentAdmin.apellidoMa;
            session.nombreCompleto = currentAdmin.nombreCompleto;
            session.rol = currentAdmin.rol;
            session.estado = currentAdmin.estado;
            session.email = currentAdmin.email;
            session.ultimoAcceso = new Date().toISOString();
            localStorage.setItem('outlet_admin', JSON.stringify(session));
        }
    } catch (error) {
        console.error('Error actualizando sesión:', error);
    }
}

// ========================================
// Cargar datos al formulario
// ========================================
function loadDataToForm(admin) {
    const nombre = document.getElementById('adminNombre');
    const apellidoPa = document.getElementById('adminApellidoPa');
    const apellidoMa = document.getElementById('adminApellidoMa');
    const email = document.getElementById('adminEmail');
    const telefono = document.getElementById('adminTelefono');

    if (nombre) nombre.value = admin.nombre || '';
    if (apellidoPa) apellidoPa.value = admin.apellidoPa || '';
    if (apellidoMa) apellidoMa.value = admin.apellidoMa || '';
    if (email) {
        email.value = admin.email || '';
        email.readOnly = true;
        email.disabled = true;
    }
    if (telefono) telefono.value = admin.telefono || '';

    const userId = document.getElementById('adminUserId');
    const userRole = document.getElementById('adminUserRole');
    const userStatus = document.getElementById('adminUserStatus');
    const lastAccess = document.getElementById('adminLastAccess');
    const creationDate = document.getElementById('adminCreationDate');
    const provider = document.getElementById('adminProvider');

    if (userId) userId.textContent = admin.id || '---';
    if (userRole) {
        userRole.textContent = formatRol(admin.rol);
        userRole.className = 'outlet-info-value outlet-role-value';
    }
    if (userStatus) {
        userStatus.textContent = admin.estado || 'activo';
        userStatus.className = `outlet-info-value ${admin.estado === 'activo' ? 'text-success' : 'text-danger'}`;
    }
    if (lastAccess) lastAccess.textContent = admin.ultimoAcceso ? formatDate(admin.ultimoAcceso) : '---';
    if (creationDate) creationDate.textContent = admin.fechaCreacion ? formatDate(admin.fechaCreacion) : '---';
    if (provider) provider.textContent = admin.provider || 'Email';

    const notificationsToggle = document.getElementById('adminNotificationsToggle');
    const dashboardToggle = document.getElementById('adminDashboardToggle');
    const preferencias = admin.preferencias || {};
    if (notificationsToggle) notificationsToggle.checked = preferencias.notificaciones !== false;
    if (dashboardToggle) dashboardToggle.checked = preferencias.dashboard !== false;

    const roleBadge = document.getElementById('adminRoleBadge');
    if (roleBadge) {
        roleBadge.textContent = formatRol(admin.rol);
        roleBadge.className = `outlet-role-tag ${admin.rol === 'super_admin' ? 'super-admin' : ''} ${admin.rol === 'editor' ? 'editor' : ''}`;
    }

    const statusBadge = document.getElementById('adminStatusBadge');
    if (statusBadge) {
        statusBadge.textContent = admin.estado === 'activo' ? 'Activo' : 'Inactivo';
        statusBadge.className = `outlet-admin-status ${admin.estado === 'activo' ? 'active' : 'inactive'}`;
    }

    const nameDisplay = document.getElementById('adminNameDisplay');
    const emailDisplay = document.getElementById('adminEmailDisplay');
    if (nameDisplay) nameDisplay.textContent = admin.nombreCompleto || admin.nombre || 'Administrador';
    if (emailDisplay) emailDisplay.textContent = admin.email || '';
}

function formatRol(rol) {
    const roles = {
        'super_admin': 'Super Administrador',
        'admin': 'Administrador',
        'editor': 'Editor'
    };
    return roles[rol] || rol || 'Administrador';
}

function formatDate(dateString) {
    if (!dateString) return '---';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

// ========================================
// Actualizar avatar
// ========================================
function updateAdminAvatar() {
    try {
        const session = JSON.parse(localStorage.getItem('outlet_admin') || '{}');
        if (!session && !currentAdmin) return;

        const data = currentAdmin || session;
        const avatarImg = document.getElementById('adminProfileAvatar');
        const placeholder = document.getElementById('adminAvatarPlaceholder');
        const initialsSpan = document.getElementById('adminAvatarInitials');

        let nombre = data.nombre || '';
        let apellido = data.apellidoPa || '';
        let iniciales = '';
        if (nombre) iniciales += nombre.charAt(0);
        if (apellido) iniciales += apellido.charAt(0);
        if (iniciales === '') iniciales = 'A';
        if (initialsSpan) initialsSpan.textContent = iniciales.toUpperCase();

        const fotoUrl = data.fotoPerfil || data.avatar || data.photoURL || null;

        if (avatarImg && fotoUrl && fotoUrl.startsWith('http')) {
            avatarImg.src = fotoUrl;
            avatarImg.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        } else {
            if (avatarImg) avatarImg.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error actualizando avatar:', error);
    }
}

function actualizarIniciales() {
    const nombreInput = document.getElementById('adminNombre');
    const apellidoPaInput = document.getElementById('adminApellidoPa');
    const initialsSpan = document.getElementById('adminAvatarInitials');

    if (!initialsSpan) return;

    let nombre = nombreInput?.value.trim() || currentAdmin?.nombre || '';
    let apellido = apellidoPaInput?.value.trim() || currentAdmin?.apellidoPa || '';
    let iniciales = '';
    if (nombre) iniciales += nombre.charAt(0);
    if (apellido) iniciales += apellido.charAt(0);
    if (iniciales === '') iniciales = 'A';

    initialsSpan.textContent = iniciales.toUpperCase();
}

// ========================================
// Mostrar permisos - CON BORDES DORADOS Y ESTILO BOTÓN
// ========================================
function mostrarPermisos(admin) {
    const container = document.getElementById('adminPermissionsList');
    const countBadge = document.getElementById('permisosCount');

    if (!container) return;

    const permisos = admin.permisos || [];

    if (admin.rol === ROLES.SUPER_ADMIN) {
        container.innerHTML = `
            <div class="outlet-permission-item" style="grid-column: 1 / -1; justify-content: center; background: rgba(221, 171, 59, 0.08); padding: 16px;">
                <span class="material-symbols-outlined" style="font-size: 24px;">verified</span>
                <span style="font-weight: 600; font-size: 14px;">Acceso completo a todos los permisos</span>
            </div>
        `;
        if (countBadge) countBadge.textContent = 'Todos los permisos';
        return;
    }

    if (!permisos || permisos.length === 0) {
        container.innerHTML = `
            <div class="outlet-permission-item" style="grid-column: 1 / -1; justify-content: center; color: var(--outlet-text-secondary);">
                <span class="material-symbols-outlined">info</span>
                <span>No hay permisos específicos asignados</span>
            </div>
        `;
        if (countBadge) countBadge.textContent = '0 permisos';
        return;
    }

    // Agrupar permisos por categoría
    const grupos = {};
    permisos.forEach(p => {
        const categoria = p.split('.')[0] || 'otros';
        if (!grupos[categoria]) grupos[categoria] = [];
        grupos[categoria].push(p);
    });

    // Ordenar categorías
    const categoriasOrdenadas = ['admin', 'products', 'orders', 'users', 'reports', 'dashboard', 'settings', 'otros'];
    const categorias = Object.keys(grupos).sort((a, b) => {
        const idxA = categoriasOrdenadas.indexOf(a);
        const idxB = categoriasOrdenadas.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    let html = '';
    categorias.forEach(categoria => {
        const items = grupos[categoria];
        // Extraer acciones únicas
        const accionesUnicas = [...new Set(items.map(p => p.split('.').pop() || p))];
        // Ordenar acciones por prioridad
        const ordenAcciones = ['view', 'create', 'edit', 'delete', 'export', 'import', 'manage'];
        const accionesOrdenadas = accionesUnicas.sort((a, b) => {
            const idxA = ordenAcciones.indexOf(a);
            const idxB = ordenAcciones.indexOf(b);
            if (idxA === -1 && idxB === -1) return a.localeCompare(b);
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });

        const icon = getIconForCategoria(categoria);
        const nombreCategoria = getNombreCategoria(categoria);

        html += `
            <div class="outlet-permission-group" style="grid-column: 1 / -1; margin-bottom: 8px;">
                <div class="group-header" style="display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--outlet-border-light); margin-bottom: 6px;">
                    <span class="material-symbols-outlined" style="font-size: 18px; color: var(--outlet-gold);">${icon}</span>
                    <span class="group-name" style="font-weight: 600; font-size: 13px; color: var(--outlet-text-primary); text-transform: capitalize;">${nombreCategoria}</span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 0;">
                    ${accionesOrdenadas.map(action => {
            const actionIcon = getIconForAction(action);
            const actionLabel = getLabelForAction(action);
            return `
                            <span class="outlet-permission-tag" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; background: var(--outlet-bg-container-low); border: 1px solid var(--outlet-border-light); border-radius: var(--outlet-radius-full); font-size: 11px; color: var(--outlet-text-secondary);">
                                <span class="material-symbols-outlined" style="font-size: 14px; color: var(--outlet-gold);">${actionIcon}</span>
                                ${actionLabel}
                            </span>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    if (countBadge) {
        // Contar permisos únicos
        const permisosUnicos = [...new Set(permisos)];
        countBadge.textContent = `${permisosUnicos.length} permisos`;
    }
}

function getNombreCategoria(categoria) {
    const nombres = {
        'admin': 'Administración',
        'products': 'Productos',
        'orders': 'Pedidos',
        'users': 'Usuarios',
        'reports': 'Reportes',
        'dashboard': 'Dashboard',
        'settings': 'Configuración',
        'otros': 'Otros'
    };
    return nombres[categoria] || categoria;
}

function getLabelForAction(action) {
    const labels = {
        'view': 'Ver',
        'create': 'Crear',
        'edit': 'Editar',
        'delete': 'Eliminar',
        'export': 'Exportar',
        'import': 'Importar',
        'manage': 'Gestionar'
    };
    return labels[action] || action;
}

function getIconForCategoria(categoria) {
    const icons = {
        'admin': 'admin_panel_settings',
        'products': 'inventory',
        'orders': 'shopping_bag',
        'users': 'people',
        'reports': 'analytics',
        'dashboard': 'dashboard',
        'settings': 'settings'
    };
    return icons[categoria] || 'check_circle';
}

function getIconForAction(action) {
    const icons = {
        'view': 'visibility',
        'create': 'add_circle',
        'edit': 'edit',
        'delete': 'delete',
        'export': 'file_download',
        'import': 'file_upload',
        'manage': 'settings'
    };
    return icons[action] || 'check_circle';
}

function getActionClass(action) {
    const classes = {
        'view': 'view',
        'create': 'create',
        'edit': 'edit',
        'delete': 'delete',
        'export': 'view',
        'import': 'create'
    };
    return classes[action] || '';
}

// ========================================
// Mostrar información de rol
// ========================================
function mostrarInfoRol(admin) {
    const roleName = document.getElementById('roleNameDisplay');
    const roleDescription = document.getElementById('roleDescriptionDisplay');
    const capabilities = document.getElementById('roleCapabilities');

    if (!roleName || !roleDescription || !capabilities) return;

    const roleInfo = {
        'super_admin': {
            nombre: 'Super Administrador',
            descripcion: 'Acceso completo a todas las funciones del sistema. Puede gestionar usuarios, productos, pedidos y configuraciones.',
            capacidades: ['Gestión de administradores', 'Acceso a todas las secciones', 'Configuración del sistema', 'Permisos ilimitados']
        },
        'admin': {
            nombre: 'Administrador',
            descripcion: 'Acceso a la mayoría de las funciones administrativas. Puede gestionar productos, pedidos y ver reportes.',
            capacidades: ['Gestión de productos', 'Gestión de pedidos', 'Ver reportes', 'Gestionar usuarios']
        },
        'editor': {
            nombre: 'Editor',
            descripcion: 'Acceso limitado para gestión de contenido. Puede editar productos y ver pedidos.',
            capacidades: ['Editar productos', 'Ver pedidos', 'Ver reportes básicos']
        }
    };

    const info = roleInfo[admin.rol] || roleInfo['admin'];

    roleName.textContent = info.nombre;
    roleDescription.textContent = info.descripcion;

    capabilities.innerHTML = info.capacidades.map(cap =>
        `<span class="outlet-capability-tag">${cap}</span>`
    ).join('');
}

// ========================================
// Actividad simulada
// ========================================
function cargarActividad() {
    const container = document.getElementById('adminActivityList');
    if (!container) return;

    const actividades = [
        { icon: 'login', texto: 'Inicio de sesión', tiempo: 'Hace 1 hora' },
        { icon: 'edit', texto: 'Actualización de perfil', tiempo: 'Hace 3 horas' },
        { icon: 'visibility', texto: 'Vista del panel de administración', tiempo: 'Hace 5 horas' },
        { icon: 'settings', texto: 'Cambio de preferencias', tiempo: 'Ayer' }
    ];

    let html = '';
    actividades.forEach(act => {
        html += `
            <div class="outlet-activity-item">
                <div class="outlet-activity-icon">
                    <span class="material-symbols-outlined">${act.icon}</span>
                </div>
                <div class="outlet-activity-content">
                    <div class="outlet-activity-text">${act.texto}</div>
                    <div class="outlet-activity-time">${act.tiempo}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
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
// Cambiar contraseña
// ========================================
async function cambiarContrasena() {
    try {
        if (!currentAdmin) {
            await mostrarError('Sesión no activa', 'No hay una sesión activa.');
            return;
        }

        const email = currentAdmin.email;
        if (!email) {
            await mostrarError('Sin correo', 'No hay correo electrónico registrado.');
            return;
        }

        const btn = document.getElementById('btnCambiarPass');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Enviando...';
        btn.disabled = true;

        mostrarLoading('Enviando enlace de recuperación...');

        try {
            const auth = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
            const { getAuth, sendPasswordResetEmail } = auth;
            const authInstance = getAuth();
            await sendPasswordResetEmail(authInstance, email);

            cerrarLoading();
            await mostrarExito(
                '¡Enlace enviado!',
                `Se ha enviado un enlace de restablecimiento a ${email}. Revisa tu correo.`
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
// Ver sesiones
// ========================================
async function verSesiones() {
    await mostrarSweetAlert({
        title: 'Dispositivos conectados',
        html: `
            <div style="text-align: left; padding: 8px 0;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--outlet-border-light);">
                    <span><strong>${currentAdmin?.email || 'admin@outlet.com'}</strong></span>
                    <span style="color: var(--outlet-success);">● Activo ahora</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--outlet-border-light);">
                    <span>Chrome - Windows 10</span>
                    <span style="color: var(--outlet-text-secondary);">Hace 2 horas</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span>Firefox - MacOS</span>
                    <span style="color: var(--outlet-text-secondary);">Ayer</span>
                </div>
            </div>
        `,
        confirmButtonText: 'Cerrar'
    });
}

// ========================================
// Guardar cambios
// ========================================
async function guardarCambios() {
    try {
        if (!currentAdmin) {
            await mostrarError('Sesión no activa', 'No hay una sesión activa.');
            return;
        }

        const nombre = document.getElementById('adminNombre')?.value || '';
        const apellidoPa = document.getElementById('adminApellidoPa')?.value || '';
        const apellidoMa = document.getElementById('adminApellidoMa')?.value || '';
        const telefono = document.getElementById('adminTelefono')?.value || '';

        const preferencias = {
            notificaciones: document.getElementById('adminNotificationsToggle')?.checked || false,
            dashboard: document.getElementById('adminDashboardToggle')?.checked || false
        };

        const updateData = {
            nombre: nombre,
            apellidoPa: apellidoPa,
            apellidoMa: apellidoMa,
            telefono: telefono,
            preferencias: preferencias
        };

        console.log('📤 Guardando cambios del administrador...');

        mostrarLoading('Guardando cambios...');

        const updatedAdmin = await AdminService.updateAdmin(
            currentAdmin.id,
            updateData
        );

        cerrarLoading();

        if (updatedAdmin) {
            currentAdmin = { ...currentAdmin, ...updatedAdmin };
            await mostrarExito('¡Cambios guardados!', 'Todos los cambios han sido guardados correctamente.');

            updateAdminAvatar();
            updateAdminSession();
            await loadAdminData();

            window.dispatchEvent(new CustomEvent('admin:authStateChanged', {
                detail: updatedAdmin
            }));

            document.querySelector('.outlet-admin-header')?.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        cerrarLoading();
        console.error('❌ Error guardando cambios:', error);
        await mostrarError('Error al guardar', error.message || 'Error al guardar los cambios.');
    }
}

// ========================================
// Manejar cambio de foto - SOLO CÁMARA
// ========================================
function setupAdminAvatar() {
    const avatarOverlay = document.getElementById('adminAvatarOverlay');
    const avatarInput = document.getElementById('adminAvatarInput');

    if (avatarOverlay && avatarInput) {
        avatarOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
            avatarInput.click();
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                await mostrarError('Tipo no válido', 'Por favor, selecciona una imagen válida.');
                avatarInput.value = '';
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                await mostrarError('Imagen muy grande', 'La imagen no debe superar los 5MB.');
                avatarInput.value = '';
                return;
            }

            try {
                mostrarLoading('Subiendo foto de perfil...');

                const formData = new FormData();
                formData.append('foto', file);
                formData.append('adminId', currentAdmin?.id || '');

                const response = await fetch('/api/admin/upload-avatar', {
                    method: 'POST',
                    body: formData
                });

                cerrarLoading();

                if (!response.ok) {
                    throw new Error('Error al subir la foto');
                }

                const result = await response.json();

                if (result.success && result.fotoUrl) {
                    const session = JSON.parse(localStorage.getItem('outlet_admin') || '{}');
                    session.fotoPerfil = result.fotoUrl;
                    session.avatar = result.fotoUrl;
                    localStorage.setItem('outlet_admin', JSON.stringify(session));

                    if (currentAdmin) {
                        currentAdmin.fotoPerfil = result.fotoUrl;
                    }

                    updateAdminAvatar();

                    window.dispatchEvent(new CustomEvent('admin:authStateChanged', {
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
// Cerrar sesión
// ========================================
async function handleLogout() {
    try {
        console.log('🚪 Cerrando sesión del administrador...');

        const result = await mostrarConfirmacion(
            '¿Cerrar sesión?',
            '¿Estás seguro de que deseas cerrar sesión?',
            'Sí, cerrar sesión'
        );

        if (!result.isConfirmed) return;

        const btnLogout = document.getElementById('btnAdminLogout');
        const originalHTML = btnLogout.innerHTML;
        btnLogout.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Cerrando sesión...';
        btnLogout.disabled = true;

        mostrarLoading('Cerrando sesión...');

        await AdminService.logout();

        cerrarLoading();
        console.log('✅ Sesión cerrada exitosamente');

        await mostrarExito('Sesión cerrada', 'Has cerrado sesión exitosamente.');

        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/admin/login');
            } else {
                window.location.href = '/admin/login';
            }
        }, 500);

    } catch (error) {
        cerrarLoading();
        console.error('❌ Error al cerrar sesión:', error);
        await mostrarError('Error al cerrar sesión', error.message || 'Ocurrió un error al cerrar sesión.');

        const btnLogout = document.getElementById('btnAdminLogout');
        if (btnLogout) {
            btnLogout.innerHTML = originalHTML || '<span class="material-symbols-outlined">logout</span> Cerrar sesión';
            btnLogout.disabled = false;
        }
    }
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
// FIX: MANEJAR MENÚ LATERAL
// ========================================

function setupSidebarFix() {
    // Buscar el botón de toggle del menú
    const menuToggle = document.querySelector('[data-menu-toggle]') ||
        document.querySelector('.menu-toggle') ||
        document.querySelector('.sidebar-toggle') ||
        document.querySelector('[aria-label*="menu"]') ||
        document.querySelector('.nav-toggle');

    // Función para verificar si el menú está abierto
    function checkMenuState() {
        const sidebar = document.querySelector('.outlet-sidebar, .sidebar, .nav-sidebar, [class*="sidebar"]');
        if (sidebar) {
            const isOpen = sidebar.classList.contains('open') ||
                sidebar.classList.contains('active') ||
                sidebar.classList.contains('show') ||
                sidebar.style.transform !== 'translateX(-100%)' ||
                sidebar.style.transform !== 'translateX(-100vw)' ||
                sidebar.style.display !== 'none';

            if (isOpen) {
                document.body.classList.add('menu-open');
            } else {
                document.body.classList.remove('menu-open');
            }
        }
    }

    // Si hay botón de toggle, agregar listener
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            // Esperar a que el menú termine de animarse
            setTimeout(checkMenuState, 100);
        });
    }

    // Observar cambios en el menú (por si se abre/cierra de otra forma)
    const sidebar = document.querySelector('.outlet-sidebar, .sidebar, .nav-sidebar, [class*="sidebar"]');
    if (sidebar) {
        const observer = new MutationObserver(() => {
            checkMenuState();
        });

        observer.observe(sidebar, {
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    // También escuchar clicks en el overlay/backdrop si existe
    const backdrop = document.querySelector('.sidebar-backdrop, .nav-backdrop, [class*="backdrop"]');
    if (backdrop) {
        backdrop.addEventListener('click', function () {
            setTimeout(checkMenuState, 100);
        });
    }

    // Escuchar eventos de teclado (escape)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            setTimeout(checkMenuState, 100);
        }
    });

    // Verificar estado inicial después de un momento
    setTimeout(checkMenuState, 200);
}

// ========================================
// FIX: BOTÓN DE CÁMARA - MEJORAR INTERACCIÓN
// ========================================

function setupCameraButton() {
    const avatarOverlay = document.getElementById('adminAvatarOverlay');
    const avatarInput = document.getElementById('adminAvatarInput');

    if (avatarOverlay && avatarInput) {
        // Asegurar que el overlay sea clickeable
        avatarOverlay.style.cursor = 'pointer';
        avatarOverlay.style.pointerEvents = 'auto';

        // Remover listeners duplicados y agregar uno nuevo
        avatarOverlay.removeEventListener('click', function (e) {
            e.stopPropagation();
            avatarInput.click();
        });

        avatarOverlay.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            avatarInput.click();
        });

        // También permitir drag and drop
        avatarOverlay.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.style.transform = 'scale(1.1)';
        });

        avatarOverlay.addEventListener('dragleave', function (e) {
            e.preventDefault();
            this.style.transform = 'scale(1)';
        });

        avatarOverlay.addEventListener('drop', function (e) {
            e.preventDefault();
            this.style.transform = 'scale(1)';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                avatarInput.files = files;
                avatarInput.dispatchEvent(new Event('change'));
            }
        });
    }
}

// ========================================
// EJECUTAR FIXES
// ========================================

function runFixes() {
    setupSidebarFix();
    setupCameraButton();
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    runFixes();
});

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    const nombreInput = document.getElementById('adminNombre');
    const apellidoPaInput = document.getElementById('adminApellidoPa');
    nombreInput?.addEventListener('input', actualizarIniciales);
    apellidoPaInput?.addEventListener('input', actualizarIniciales);

    const btnCambiarPass = document.getElementById('btnCambiarPass');
    btnCambiarPass?.addEventListener('click', cambiarContrasena);

    const btnSessions = document.getElementById('btnSessions');
    btnSessions?.addEventListener('click', verSesiones);

    const btnPrevTop = document.getElementById('btnPrevTop');
    const btnNextTop = document.getElementById('btnNextTop');
    const stepItems = document.querySelectorAll('.outlet-step-item');

    btnPrevTop?.addEventListener('click', () => cambiarPanel(-1));
    btnNextTop?.addEventListener('click', () => cambiarPanel(1));
    stepItems.forEach((step, idx) => {
        step.addEventListener('click', () => irAlPaso(idx + 1));
    });

    const btnLogout = document.getElementById('btnAdminLogout');
    if (btnLogout) {
        btnLogout.removeEventListener('click', handleLogout);
        btnLogout.addEventListener('click', handleLogout);
        console.log('✅ Listener de logout configurado');
    } else {
        console.warn('⚠️ No se encontró #btnAdminLogout en el DOM');
    }

    const btnGuardar = document.getElementById('btnGuardar');
    const btnCancelar = document.getElementById('btnCancelar');

    btnGuardar?.addEventListener('click', guardarCambios);

    btnCancelar?.addEventListener('click', () => {
        mostrarToast('Cambios descartados', 'info');
        loadAdminData();
    });

    // Usar la nueva función en lugar de setupAdminAvatar
    setupCameraButton();
}

// ========================================
// Inicialización
// ========================================
export async function adminProfileController() {
    console.log('👤 Admin Profile Controller - Perfil de administrador');

    try {
        const loaded = await loadAdminData();

        if (!loaded) {
            console.warn('⚠️ No se pudieron cargar los datos del administrador');
            await mostrarError('Error al cargar perfil', 'No se pudieron cargar los datos del perfil. Redirigiendo al login...');

            setTimeout(() => {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/admin/login');
                } else {
                    window.location.href = '/admin/login';
                }
            }, 2000);
            return;
        }

        syncDarkMode();
        updateWizardUI();
        initEventListeners();

        // Ejecutar fixes adicionales
        runFixes();

        window.addEventListener('admin:authStateChanged', async (event) => {
            console.log('🔄 Auth state changed, recargando datos...');
            await loadAdminData();
        });

        console.log('✅ Admin Profile page loaded');
    } catch (error) {
        console.error('❌ Error inicializando:', error);
        await mostrarError('Error al cargar perfil', error.message || 'Ocurrió un error al cargar el perfil.');
    }
}
