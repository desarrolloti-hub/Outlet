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
        console.log('🔄 Actualizando avatar del navbar...');
        
        // Primero intentar obtener la sesión
        let session = null;
        try {
            session = JSON.parse(localStorage.getItem('outlet_customer'));
        } catch (e) {
            console.error('Error parseando sesión:', e);
        }
        
        console.log('📦 Sesión en navbar:', session ? 'existe' : 'no existe');
        if (session) {
            console.log('📸 Foto en sesión:', session.fotoPerfil ? '✅ tiene foto' : '❌ sin foto');
            console.log('📸 URL foto:', session.fotoPerfil);
        }
        
        // Buscar elementos del avatar
        const avatarImg = document.getElementById('profileAvatar');
        const badgeSpan = document.getElementById('profileBadge');
        
        if (!avatarImg || !badgeSpan) {
            console.warn('⚠️ Elementos del avatar no encontrados');
            // Intentar crear los elementos
            createAvatarElements();
            setTimeout(updateProfileAvatar, 100);
            return;
        }
        
        if (!session) {
            console.log('❌ No hay sesión, mostrando invitado');
            showGuestUI();
            return;
        }
        
        // Verificar si tiene foto de perfil
        const tieneFoto = session.fotoPerfil && session.fotoPerfil.startsWith('http');
        console.log('📸 ¿Tiene foto de perfil?', tieneFoto);
        
        if (tieneFoto) {
            // ✅ Mostrar foto
            console.log('🖼️ Mostrando foto de perfil:', session.fotoPerfil.substring(0, 60) + '...');
            avatarImg.src = session.fotoPerfil;
            avatarImg.style.display = 'block';
            avatarImg.style.width = '40px';
            avatarImg.style.height = '40px';
            avatarImg.style.borderRadius = '50%';
            avatarImg.style.objectFit = 'cover';
            avatarImg.style.border = '2px solid var(--outlet-gold, #c9a84c)';
            avatarImg.style.cursor = 'pointer';
            
            if (badgeSpan) {
                badgeSpan.style.display = 'none';
            }
            
            console.log('✅ Foto de perfil actualizada');
        } else {
            // ❌ Mostrar iniciales
            console.log('🔤 Mostrando iniciales');
            avatarImg.style.display = 'none';
            
            if (badgeSpan) {
                const iniciales = session.iniciales || 
                                 (session.nombre ? session.nombre.charAt(0) : '') + 
                                 (session.apellidoPa ? session.apellidoPa.charAt(0) : '') || 
                                 'C';
                
                badgeSpan.style.display = 'flex';
                badgeSpan.textContent = iniciales.toUpperCase();
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
                badgeSpan.style.cursor = 'pointer';
            }
            
            console.log('✅ Mostrando iniciales:', iniciales);
        }
    } catch (error) {
        console.error('❌ Error actualizando avatar:', error);
    }
}

/**
 * Crear elementos del avatar si no existen
 */
function createAvatarElements() {
    // Buscar el contenedor del perfil
    const profileContainer = document.querySelector('.profile-avatar-wrapper, .nav-profile, [class*="profile-avatar"]');
    
    // Buscar el botón de perfil
    const profileBtn = document.getElementById('profileBtn');
    
    if (profileBtn) {
        // Verificar si ya tiene el avatar
        if (profileBtn.querySelector('#profileAvatar')) {
            return;
        }
        
        // Crear contenedor dentro del botón
        const container = document.createElement('span');
        container.className = 'profile-avatar-wrapper';
        container.style.cssText = 'display:inline-flex; align-items:center; gap:8px;';
        
        // Crear imagen
        const img = document.createElement('img');
        img.id = 'profileAvatar';
        img.alt = 'Avatar';
        img.style.cssText = 'display:none; width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid #c9a84c; cursor:pointer;';
        
        // Crear badge
        const badge = document.createElement('span');
        badge.id = 'profileBadge';
        badge.style.cssText = 'display:flex; width:40px; height:40px; border-radius:50%; background:#c9a84c; color:#1a1a1a; font-weight:700; font-size:16px; align-items:center; justify-content:center; text-transform:uppercase; cursor:pointer;';
        badge.textContent = 'C';
        
        container.appendChild(img);
        container.appendChild(badge);
        
        // Insertar al principio del botón
        profileBtn.prepend(container);
        console.log('✅ Elementos del avatar creados dentro de #profileBtn');
        return;
    }
    
    // Si no hay profileBtn, buscar el navbar
    const navbar = document.querySelector('nav, header, .navbar, [class*="nav"]');
    if (!navbar) {
        console.warn('⚠️ No se encontró navbar');
        return;
    }
    
    // Crear contenedor
    const container = document.createElement('div');
    container.className = 'profile-avatar-wrapper';
    container.style.cssText = 'display:inline-flex; align-items:center; gap:8px; cursor:pointer;';
    container.id = 'profileBtn';
    
    // Crear imagen
    const img = document.createElement('img');
    img.id = 'profileAvatar';
    img.alt = 'Avatar';
    img.style.cssText = 'display:none; width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid #c9a84c; cursor:pointer;';
    
    // Crear badge
    const badge = document.createElement('span');
    badge.id = 'profileBadge';
    badge.style.cssText = 'display:flex; width:40px; height:40px; border-radius:50%; background:#c9a84c; color:#1a1a1a; font-weight:700; font-size:16px; align-items:center; justify-content:center; text-transform:uppercase; cursor:pointer;';
    badge.textContent = 'C';
    
    container.appendChild(img);
    container.appendChild(badge);
    
    // Agregar al navbar
    navbar.appendChild(container);
    console.log('✅ Elementos del avatar creados en navbar');
}

/**
 * Cargar perfil del usuario
 */
async function loadUserProfile() {
    try {
        console.log('📥 Cargando perfil del usuario...');
        const customer = await CustomerService.getCurrentCustomer(true);
        
        if (customer) {
            currentUser = customer;
            console.log('👤 Usuario cargado:', {
                id: customer.id,
                nombre: customer.nombreCompleto,
                email: customer.email,
                tieneFoto: !!customer.fotoPerfil,
                fotoUrl: customer.fotoPerfil ? customer.fotoPerfil.substring(0, 50) + '...' : 'sin foto'
            });
            
            // Actualizar UI
            updateUserUI(customer);
            
            // Actualizar avatar con la foto
            setTimeout(updateProfileAvatar, 100);
        } else {
            console.log('👤 No hay usuario autenticado');
            showGuestUI();
        }
    } catch (error) {
        console.error('❌ Error cargando perfil:', error);
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
    console.log('👤 Mostrando UI de invitado');
    
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
        badgeSpan.style.cursor = 'pointer';
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
        console.log('👤 Usuario logueado, redirigiendo a /editUser');
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/editUser');
        } else {
            window.location.href = '/editUser';
        }
    } else {
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
        // Forzar actualización del avatar
        setTimeout(updateProfileAvatar, 100);
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
        
        // Pequeño delay para asegurar que el DOM está renderizado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Cargar perfil del usuario
        await loadUserProfile();
        
        // Escuchar cambios en la autenticación
        window.addEventListener('customer:authStateChanged', async (event) => {
            console.log('🔄 Auth state changed:', event.detail);
            await loadUserProfile();
            setTimeout(updateProfileAvatar, 100);
        });
        
        // Escuchar cambios en localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === 'outlet_customer') {
                console.log('🔄 Sesión actualizada desde otra pestaña');
                setTimeout(updateProfileAvatar, 100);
            }
        });
        
        // Configurar event listeners
        setupNavbarEvents();
        
        // Actualización forzada del avatar
        setTimeout(updateProfileAvatar, 300);
        setTimeout(updateProfileAvatar, 600);
        
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
    
    // Buscar o crear elementos
    let profileBtn = document.getElementById('profileBtn');
    let profileAvatar = document.getElementById('profileAvatar');
    let profileBadge = document.getElementById('profileBadge');
    
    // Si no hay avatar, crearlo
    if (!profileAvatar || !profileBadge) {
        console.log('⚠️ No se encontraron elementos de avatar, creándolos...');
        createAvatarElements();
        // Reintentar después de crear
        setTimeout(() => {
            setupNavbarEvents();
        }, 200);
        return;
    }
    
    // Configurar eventos
    if (profileBtn) {
        console.log('✅ Configurando #profileBtn');
        profileBtn.removeEventListener('click', handleProfileClick);
        profileBtn.addEventListener('click', handleProfileClick);
    }
    
    if (profileAvatar) {
        console.log('✅ Configurando #profileAvatar');
        profileAvatar.style.cursor = 'pointer';
        profileAvatar.removeEventListener('click', handleProfileClick);
        profileAvatar.addEventListener('click', handleProfileClick);
    }
    
    if (profileBadge) {
        console.log('✅ Configurando #profileBadge');
        profileBadge.style.cursor = 'pointer';
        profileBadge.removeEventListener('click', handleProfileClick);
        profileBadge.addEventListener('click', handleProfileClick);
    }
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log('✅ Configurando #logoutBtn');
        logoutBtn.removeEventListener('click', handleLogout);
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Configurar tema
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        console.log('✅ Configurando #themeToggleBtn');
        themeToggleBtn.removeEventListener('click', handleThemeToggle);
        themeToggleBtn.addEventListener('click', handleThemeToggle);
        
        const updateThemeIcon = () => {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = ThemeService.isDarkMode() ? 'fas fa-sun' : 'fas fa-moon';
            }
        };
        updateThemeIcon();
        document.addEventListener('themeChanged', updateThemeIcon);
    }
    
    console.log('✅ Eventos del navbar configurados');
}

// ========================================
// Funciones auxiliares
// ========================================

async function handleLogout(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('🚪 Cerrando sesión...');
    try {
        await CustomerService.logout();
        console.log('✅ Sesión cerrada exitosamente');
        
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

function handleThemeToggle(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log('🎨 Cambiando tema...');
    ThemeService.toggle();
}

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
// Sistema de foto de perfil
// ========================================

function initProfilePhotoSystem() {
    console.log('🔄 Inicializando sistema de foto de perfil...');
    
    function updateFromSession() {
        try {
            const session = JSON.parse(localStorage.getItem('outlet_customer'));
            console.log('📸 Actualizando desde sesión:', session ? 'tiene sesión' : 'sin sesión');
            
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
                    avatar.style.cursor = 'pointer';
                    
                    const badge = document.getElementById('profileBadge');
                    if (badge) badge.style.display = 'none';
                    
                    console.log('✅ Foto de perfil actualizada desde sesión');
                    return true;
                }
            } else if (session) {
                // Mostrar iniciales
                const avatar = document.getElementById('profileAvatar');
                const badge = document.getElementById('profileBadge');
                if (avatar) avatar.style.display = 'none';
                if (badge) {
                    badge.style.display = 'flex';
                    const iniciales = session.iniciales || 
                                     (session.nombre ? session.nombre.charAt(0) : '') + 
                                     (session.apellidoPa ? session.apellidoPa.charAt(0) : '') || 
                                     'C';
                    badge.textContent = iniciales.toUpperCase();
                    badge.style.width = '40px';
                    badge.style.height = '40px';
                    badge.style.borderRadius = '50%';
                    badge.style.background = 'var(--outlet-gold, #c9a84c)';
                    badge.style.color = '#1a1a1a';
                    badge.style.fontWeight = '700';
                    badge.style.fontSize = '16px';
                    badge.style.alignItems = 'center';
                    badge.style.justifyContent = 'center';
                    badge.style.display = 'flex';
                    badge.style.textTransform = 'uppercase';
                    badge.style.cursor = 'pointer';
                }
                console.log('✅ Mostrando iniciales');
                return true;
            }
        } catch (e) {
            console.error('Error actualizando foto:', e);
        }
        return false;
    }
    
    // Ejecutar inmediatamente
    setTimeout(updateFromSession, 100);
    
    // Escuchar eventos
    window.addEventListener('customer:authStateChanged', () => {
        setTimeout(updateFromSession, 100);
    });
    
    window.addEventListener('storage', (event) => {
        if (event.key === 'outlet_customer') {
            setTimeout(updateFromSession, 100);
        }
    });
    
    // Observador de DOM
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
    
    window.updateProfileAvatar = updateFromSession;
}

// Inicializar
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfilePhotoSystem);
    } else {
        initProfilePhotoSystem();
    }
}

// Exportar
export { loadUserProfile, updateProfileAvatar, showGuestUI };

console.log('📦 Customer Navbar Controller cargado');