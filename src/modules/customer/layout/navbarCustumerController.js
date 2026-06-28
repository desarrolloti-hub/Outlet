/* ========================================
   CUSTOMER NAVBAR CONTROLLER - Outlet Val
   Controlador para el navbar de clientes
   ======================================== */

import { CustomerService } from '/services/customerService.js';
import { ThemeService } from '../../shared/layout/themeService.js';

// Estado del navbar
let isNavbarInitialized = false;
let currentUser = null;

/**
 * Actualizar la foto de perfil en el navbar
 */
function updateProfileAvatar() {
    try {
        const session = JSON.parse(localStorage.getItem('outlet_customer'));
        if (!session) {
            console.log('❌ No hay sesión para actualizar avatar');
            return;
        }

        // Buscar elementos del avatar
        const avatarImg = document.getElementById('profileAvatar');
        const badgeSpan = document.getElementById('profileBadge');
        
        if (!avatarImg) {
            console.log('⚠️ No se encontró #profileAvatar en el DOM');
            return;
        }

        if (session.fotoPerfil && session.fotoPerfil.startsWith('http')) {
            // ✅ Mostrar foto
            avatarImg.src = session.fotoPerfil;
            avatarImg.style.display = 'block';
            avatarImg.style.width = '40px';
            avatarImg.style.height = '40px';
            avatarImg.style.borderRadius = '50%';
            avatarImg.style.objectFit = 'cover';
            avatarImg.style.border = '2px solid var(--outlet-gold, #c9a84c)';
            
            if (badgeSpan) {
                badgeSpan.style.display = 'none';
            }
            
            console.log('✅ Foto de perfil actualizada');
        } else {
            // ❌ Mostrar iniciales
            avatarImg.style.display = 'none';
            
            if (badgeSpan) {
                badgeSpan.style.display = 'flex';
                badgeSpan.textContent = session.iniciales || session.nombre?.charAt(0) || 'C';
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
        }
    } catch (error) {
        console.error('Error actualizando avatar:', error);
    }
}

/**
 * Cargar perfil del usuario (usando CustomerService en lugar de AuthService)
 */
async function loadUserProfile() {
    try {
        // Usar CustomerService en lugar de AuthService
        const customer = await CustomerService.getCurrentCustomer(true);
        
        if (customer) {
            currentUser = customer;
            console.log('👤 Usuario cargado:', customer.nombreCompleto || customer.nombre);
            
            // Actualizar UI
            updateUserUI(customer);
            
            // Actualizar avatar con la foto
            updateProfileAvatar();
        } else {
            console.log('👤 No hay usuario autenticado');
            // Mostrar estado de invitado
            showGuestUI();
        }
    } catch (error) {
        console.error('Error cargando perfil:', error);
        showGuestUI();
    }
}

/**
 * Actualizar la UI con los datos del usuario
 */
function updateUserUI(customer) {
    const nameElements = document.querySelectorAll('.user-name, .nav-username, .profile-name, [class*="userName"]');
    nameElements.forEach(el => {
        if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'A') {
            el.textContent = customer.nombreCompleto || customer.nombre || 'Usuario';
        }
    });
    
    const emailElements = document.querySelectorAll('.user-email, .nav-email, .profile-email');
    emailElements.forEach(el => {
        if (el.tagName === 'SPAN' || el.tagName === 'DIV') {
            el.textContent = customer.email || '';
        }
    });
}

/**
 * Mostrar UI de invitado
 */
function showGuestUI() {
    const nameElements = document.querySelectorAll('.user-name, .nav-username, .profile-name');
    nameElements.forEach(el => {
        if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'A') {
            el.textContent = 'Invitado';
        }
    });
    
    // Mostrar avatar por defecto
    const avatarImg = document.getElementById('profileAvatar');
    const badgeSpan = document.getElementById('profileBadge');
    
    if (avatarImg) {
        avatarImg.style.display = 'none';
    }
    if (badgeSpan) {
        badgeSpan.style.display = 'flex';
        badgeSpan.textContent = '?';
        badgeSpan.style.width = '40px';
        badgeSpan.style.height = '40px';
        badgeSpan.style.borderRadius = '50%';
        badgeSpan.style.background = 'var(--outlet-text-secondary, #666)';
        badgeSpan.style.color = 'white';
        badgeSpan.style.fontWeight = '700';
        badgeSpan.style.fontSize = '16px';
        badgeSpan.style.alignItems = 'center';
        badgeSpan.style.justifyContent = 'center';
        badgeSpan.style.display = 'flex';
        badgeSpan.style.textTransform = 'uppercase';
    }
}

/**
 * Manejar click en perfil/avatar
 */
function handleProfileClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('🖱️ Click en perfil/avatar');
    const session = JSON.parse(localStorage.getItem('outlet_customer'));
    
    if (session) {
        // Usuario logueado - ir a editUser
        console.log('👤 Usuario logueado, redirigiendo a /editUser');
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/editUser');
        } else {
            window.location.href = '/editUser';
        }
    } else {
        // Usuario no logueado - ir a login
        console.log('👤 Usuario no logueado, redirigiendo a /login');
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/login');
        } else {
            window.location.href = '/login';
        }
    }
}

/**
 * Inicializar el controlador del navbar
 */
export async function initCustomerNavbarController() {
    if (isNavbarInitialized) {
        console.log('🔄 Navbar ya inicializado');
        return;
    }
    
    console.log('🔄 Inicializando Customer Navbar Controller...');
    
    try {
        // Esperar a que el DOM esté listo
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
        
        // Cargar perfil del usuario
        await loadUserProfile();
        
        // Escuchar cambios en la autenticación
        window.addEventListener('customer:authStateChanged', async (event) => {
            console.log('🔄 Auth state changed:', event.detail);
            await loadUserProfile();
            updateProfileAvatar();
        });
        
        // Escuchar cambios en localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === 'outlet_customer') {
                console.log('🔄 Sesión actualizada desde otra pestaña');
                updateProfileAvatar();
            }
        });
        
        // Inicializar avatar cuando el DOM esté listo
        setTimeout(updateProfileAvatar, 200);
        
        // Configurar event listeners para botones del navbar
        setupNavbarEvents();
        
        isNavbarInitialized = true;
        console.log('✅ Customer Navbar Controller inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando navbar:', error);
    }
}

/**
 * Configurar eventos del navbar
 */
function setupNavbarEvents() {
    console.log('🔧 Configurando eventos del navbar...');
    
    // ========================================
    // 1. Botón de perfil (profileBtn)
    // ========================================
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        console.log('✅ Encontrado #profileBtn');
        // Remover listeners anteriores para evitar duplicados
        profileBtn.removeEventListener('click', handleProfileClick);
        profileBtn.addEventListener('click', handleProfileClick);
    } else {
        console.warn('⚠️ No se encontró #profileBtn en el DOM');
    }
    
    // ========================================
    // 2. Avatar (profileAvatar)
    // ========================================
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        console.log('✅ Encontrado #profileAvatar');
        profileAvatar.style.cursor = 'pointer';
        profileAvatar.removeEventListener('click', handleProfileClick);
        profileAvatar.addEventListener('click', handleProfileClick);
    } else {
        console.warn('⚠️ No se encontró #profileAvatar en el DOM');
    }
    
    // ========================================
    // 3. Badge (profileBadge)
    // ========================================
    const profileBadge = document.getElementById('profileBadge');
    if (profileBadge) {
        console.log('✅ Encontrado #profileBadge');
        profileBadge.style.cursor = 'pointer';
        profileBadge.removeEventListener('click', handleProfileClick);
        profileBadge.addEventListener('click', handleProfileClick);
    } else {
        console.warn('⚠️ No se encontró #profileBadge en el DOM');
    }
    
    // ========================================
    // 4. Botón de logout
    // ========================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log('✅ Encontrado #logoutBtn');
        logoutBtn.removeEventListener('click', handleLogout);
        logoutBtn.addEventListener('click', handleLogout);
    } else {
        console.warn('⚠️ No se encontró #logoutBtn en el DOM');
    }
    
    // ========================================
    // 5. Botón de cambio de tema
    // ========================================
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        console.log('✅ Encontrado #themeToggleBtn');
        themeToggleBtn.removeEventListener('click', handleThemeToggle);
        themeToggleBtn.addEventListener('click', handleThemeToggle);
        
        // Actualizar el icono (luna/sol) según el tema actual
        const updateThemeIcon = () => {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = ThemeService.isDarkMode() ? 'fas fa-sun' : 'fas fa-moon';
            }
        };
        updateThemeIcon();
        document.addEventListener('themeChanged', updateThemeIcon);
    } else {
        console.warn('⚠️ No se encontró #themeToggleBtn en el DOM');
    }
    
    console.log('✅ Eventos del navbar configurados');
}

/**
 * Manejar logout
 */
async function handleLogout(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('🚪 Cerrando sesión...');
    try {
        await CustomerService.logout();
        console.log('✅ Sesión cerrada exitosamente');
        
        // Redirigir al login
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/login');
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        showNotification('Error al cerrar sesión', 'error');
    }
}

/**
 * Manejar toggle de tema
 */
function handleThemeToggle(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log('🎨 Cambiando tema...');
    ThemeService.toggle();
}

/**
 * Mostrar notificación temporal
 */
function showNotification(message, type = 'info') {
    const existingToast = document.querySelector('.outlet-toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'outlet-toast-notification';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.background = type === 'error' ? '#dc3545' : '#28a745';
    toast.style.color = '#fff';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    toast.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// ========================================
// SISTEMA DE FOTO DE PERFIL AUTO-ACTUALIZABLE
// ========================================

/**
 * Sistema para actualizar automáticamente la foto de perfil
 * cuando la sesión cambia o el DOM se actualiza
 */
function initProfilePhotoSystem() {
    console.log('🔄 Inicializando sistema de foto de perfil...');
    
    // Función para actualizar desde la sesión
    function updateFromSession() {
        try {
            const session = JSON.parse(localStorage.getItem('outlet_customer'));
            if (session?.fotoPerfil) {
                const avatar = document.getElementById('profileAvatar');
                if (avatar) {
                    avatar.src = session.fotoPerfil;
                    avatar.style.display = 'block';
                    avatar.style.width = '40px';
                    avatar.style.height = '40px';
                    avatar.style.borderRadius = '50%';
                    avatar.style.objectFit = 'cover';
                    avatar.style.border = '2px solid var(--outlet-gold, #c9a84c)';
                    
                    const badge = document.getElementById('profileBadge');
                    if (badge) badge.style.display = 'none';
                    
                    console.log('✅ Foto de perfil actualizada desde sesión');
                    return true;
                }
            }
        } catch (e) {
            console.error('Error actualizando foto:', e);
        }
        return false;
    }
    
    // Ejecutar inmediatamente si el DOM está listo
    if (document.readyState !== 'loading') {
        setTimeout(updateFromSession, 100);
    }
    
    // Escuchar eventos de autenticación
    window.addEventListener('customer:authStateChanged', () => {
        setTimeout(updateFromSession, 50);
    });
    
    // Escuchar cambios en localStorage
    window.addEventListener('storage', (event) => {
        if (event.key === 'outlet_customer') {
            setTimeout(updateFromSession, 50);
        }
    });
    
    // Observador de DOM para cuando se cargue el navbar dinámicamente
    const observer = new MutationObserver(() => {
        if (document.getElementById('profileAvatar')) {
            updateFromSession();
            observer.disconnect();
        }
    });
    
    setTimeout(() => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }, 200);
    
    // Exponer función para uso manual
    window.updateProfileAvatar = updateFromSession;
}

// Inicializar sistema de foto
if (typeof window !== 'undefined') {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfilePhotoSystem);
    } else {
        initProfilePhotoSystem();
    }
}

// Exportar funciones
export { loadUserProfile, updateProfileAvatar, showGuestUI };

// Inicialización automática cuando se importa
console.log('📦 Customer Navbar Controller cargado');