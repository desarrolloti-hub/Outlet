/* ========================================
   CUSTOMER NAVBAR CONTROLLER - Outlet Val
   Controlador independiente para el navbar de clientes
   CON PRIORIDAD SOBRE OTROS NAVBARS
   ======================================== */

import { CustomerService } from '/services/customerService.js';
import { ThemeService } from '../../shared/layout/themeService.js';

// Estado del navbar
let isNavbarInitialized = false;
let currentUser = null;
let isApplyingTheme = false;

// ===== CONFIGURACIÓN DE TEMA - CON PRIORIDAD =====
const THEME_KEY = 'outlet_theme';

/**
 * APLICAR TEMA CON PRIORIDAD - Sobrescribe cualquier otro navbar
 */
function applyThemeWithPriority(theme) {
    if (isApplyingTheme) {
        console.log('⚠️ Ya aplicando tema, ignorando...');
        return;
    }
    
    isApplyingTheme = true;
    
    try {
        console.log('🌓 [CUSTOMER NAVBAR] Aplicando tema con prioridad:', theme);
        
        // 🔥 FORZAR la aplicación del tema en el body
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // 🔥 FORZAR guardado en localStorage
        localStorage.setItem(THEME_KEY, theme);
        
        // 🔥 FORZAR actualización del ícono
        forceUpdateThemeIcon();
        
        // 🔥 FORZAR evento para otros componentes
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { isDarkMode: theme === 'dark' } 
        }));
        
        // 🔥 FORZAR que el ThemeService esté sincronizado
        if (ThemeService && typeof ThemeService.sync === 'function') {
            ThemeService.sync();
        }
        
        console.log('✅ [CUSTOMER NAVBAR] Tema aplicado con prioridad:', theme);
    } catch (error) {
        console.error('❌ Error aplicando tema:', error);
    } finally {
        isApplyingTheme = false;
    }
}

/**
 * FORZAR actualización del ícono - Sobrescribe cualquier otro
 */
function forceUpdateThemeIcon() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (!themeToggleBtn) {
        console.warn('⚠️ Botón de tema no encontrado');
        return;
    }
    
    // Buscar o crear el ícono
    let icon = themeToggleBtn.querySelector('i');
    if (!icon) {
        icon = document.createElement('i');
        icon.style.fontSize = '18px';
        themeToggleBtn.appendChild(icon);
    }
    
    const isDark = document.body.classList.contains('dark-mode');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    console.log('🌓 [CUSTOMER NAVBAR] Ícono FORZADO a:', isDark ? '☀️ sol (dark)' : '🌙 luna (light)');
}

/**
 * Actualizar la foto de perfil en el navbar
 */
function updateProfileAvatar() {
    try {
        console.log('🔄 Actualizando avatar del navbar customer...');
        
        // Primero intentar obtener la sesión
        let session = null;
        try {
            session = JSON.parse(localStorage.getItem('outlet_customer'));
        } catch (e) {
            console.error('Error parseando sesión:', e);
        }
        
        console.log('📦 Sesión en navbar customer:', session ? 'existe' : 'no existe');
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
            
            console.log('✅ Mostrando iniciales');
        }
    } catch (error) {
        console.error('❌ Error actualizando avatar:', error);
    }
}

/**
 * Crear elementos del avatar si no existen
 */
function createAvatarElements() {
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
    const navbar = document.querySelector('.OUTLET-nav, nav, header');
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
        console.log('📥 Cargando perfil del usuario customer...');
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
    console.log('👤 Mostrando UI de invitado en customer navbar');
    
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
    
    console.log('🖱️ Click en perfil/avatar customer');
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
 * Manejar click en el botón de favoritos - NAVEGAR A WISHLIST
 */
function handleWishlistClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('❤️ Click en favoritos - navegando a wishlist');
    
    // Verificar si el usuario está logueado
    const session = JSON.parse(localStorage.getItem('outlet_customer'));
    
    if (session) {
        // Usuario logueado → wishlist de customer
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/wishlistCustomer');
        } else {
            window.location.href = '/wishlistCustomer';
        }
    } else {
        // Usuario invitado → wishlist de visitor
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/wishlist');
        } else {
            window.location.href = '/wishlist';
        }
    }
}

/**
 * Manejar click en el botón del carrito
 */
function handleCartClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('🛒 Click en carrito - navegando a cart');
    
    const session = JSON.parse(localStorage.getItem('outlet_customer'));
    
    if (session) {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/cartCustomer');
        } else {
            window.location.href = '/cartCustomer';
        }
    } else {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/cart');
        } else {
            window.location.href = '/cart';
        }
    }
}

/**
 * Manejar click en el logo
 */
function handleLogoClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('🏠 Click en logo - navegando a home');
    
    const session = JSON.parse(localStorage.getItem('outlet_customer'));
    
    if (session) {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/homeCustomer');
        } else {
            window.location.href = '/homeCustomer';
        }
    } else {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/');
        } else {
            window.location.href = '/';
        }
    }
}

/**
 * Actualizar el contador de favoritos
 */
function updateWishlistBadge() {
    const badge = document.getElementById('wishlistCount');
    if (!badge) return;
    
    try {
        const wishlist = JSON.parse(localStorage.getItem('outlet_wishlist') || '[]');
        const count = wishlist.length;
        
        if (count > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = count;
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Error actualizando contador de wishlist:', error);
        badge.style.display = 'none';
    }
}

/**
 * Actualizar el contador del carrito
 */
function updateCartBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    
    try {
        const cart = JSON.parse(localStorage.getItem('outlet_cart') || '[]');
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        if (total > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = total;
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Error actualizando contador del carrito:', error);
        badge.style.display = 'none';
    }
}

/**
 * Configurar eventos del navbar customer
 */
function setupNavbarEvents() {
    console.log('🔧 Configurando eventos del Customer Navbar...');
    
    // ===== PERFIL =====
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
    
    // Configurar eventos de perfil
    if (profileBtn) {
        console.log('✅ Configurando #profileBtn customer');
        profileBtn.removeEventListener('click', handleProfileClick);
        profileBtn.addEventListener('click', handleProfileClick);
    }
    
    if (profileAvatar) {
        console.log('✅ Configurando #profileAvatar customer');
        profileAvatar.style.cursor = 'pointer';
        profileAvatar.removeEventListener('click', handleProfileClick);
        profileAvatar.addEventListener('click', handleProfileClick);
    }
    
    if (profileBadge) {
        console.log('✅ Configurando #profileBadge customer');
        profileBadge.style.cursor = 'pointer';
        profileBadge.removeEventListener('click', handleProfileClick);
        profileBadge.addEventListener('click', handleProfileClick);
    }
    
    // ===== WISHLIST (FAVORITOS) =====
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        console.log('✅ Configurando #wishlistBtn customer');
        wishlistBtn.removeEventListener('click', handleWishlistClick);
        wishlistBtn.addEventListener('click', handleWishlistClick);
    } else {
        console.warn('⚠️ Botón de wishlist no encontrado');
    }
    
    // ===== CARRITO =====
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        console.log('✅ Configurando #cartBtn customer');
        cartBtn.removeEventListener('click', handleCartClick);
        cartBtn.addEventListener('click', handleCartClick);
    } else {
        console.warn('⚠️ Botón de carrito no encontrado');
    }
    
    // ===== LOGO =====
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        console.log('✅ Configurando #logoLink customer');
        logoLink.removeEventListener('click', handleLogoClick);
        logoLink.addEventListener('click', handleLogoClick);
    }
    
    // ===== TEMA =====
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        console.log('✅ Configurando #themeToggleBtn customer con prioridad');
        themeToggleBtn.removeEventListener('click', handleThemeToggle);
        themeToggleBtn.addEventListener('click', handleThemeToggle);
        forceUpdateThemeIcon();
    } else {
        console.warn('⚠️ Botón de tema no encontrado en Customer Navbar');
    }
    
    // ===== BÚSQUEDA =====
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        console.log('✅ Configurando #searchBtn customer');
        searchBtn.removeEventListener('click', handleSearchClick);
        searchBtn.addEventListener('click', handleSearchClick);
    }
    
    // ===== MENÚ MÓVIL =====
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (hamburgerBtn && mobileMenu) {
        console.log('✅ Configurando menú móvil customer');
        hamburgerBtn.removeEventListener('click', toggleMobileMenu);
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }
    
    if (mobileCloseBtn && mobileMenu) {
        mobileCloseBtn.removeEventListener('click', closeMobileMenu);
        mobileCloseBtn.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileOverlay && mobileMenu) {
        mobileOverlay.removeEventListener('click', closeMobileMenu);
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // ===== LOGOUT =====
    const logoutBtn = document.getElementById('logoutBtn') || document.getElementById('mobileLogoutBtn');
    if (logoutBtn) {
        console.log('✅ Configurando #logoutBtn customer');
        logoutBtn.removeEventListener('click', handleLogout);
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    console.log('✅ Eventos del Customer Navbar configurados');
}

/**
 * Manejar click en búsqueda
 */
function handleSearchClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('🔍 Click en búsqueda');
    // Aquí puedes abrir el modal de búsqueda o redirigir a la página de búsqueda
    // Por ahora solo mostramos un mensaje
    const searchInput = document.querySelector('.search-input') || document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
    } else {
        // Si no hay input de búsqueda, podrías abrir un modal
        console.log('🔍 Abrir modal de búsqueda');
        showNotification('🔍 Buscar productos...', 'info');
    }
}

/**
 * Manejar cambio de tema - CON PRIORIDAD
 */
function handleThemeToggle(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('🎨 [CUSTOMER NAVBAR] Click en botón de tema');
    
    // Determinar nuevo tema
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    
    console.log('🌓 Tema actual:', isDark ? 'oscuro' : 'claro');
    console.log('🌓 Nuevo tema:', newTheme);
    
    // Aplicar nuevo tema CON PRIORIDAD
    applyThemeWithPriority(newTheme);
    
    // 🔥 Forzar actualización en todos los botones de tema
    setTimeout(() => {
        const allThemeBtns = document.querySelectorAll('.theme-toggle-btn');
        allThemeBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }, 50);
    
    console.log('✅ [CUSTOMER NAVBAR] Tema cambiado a:', newTheme);
}

// ========================================
// Funciones de menú móvil
// ========================================

function toggleMobileMenu(e) {
    if (e) e.preventDefault();
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('mobileOverlay');
    
    if (mobileMenu) {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen) {
            closeMobileMenu();
        } else {
            mobileMenu.classList.add('open');
            if (hamburgerBtn) hamburgerBtn.classList.add('open');
            if (overlay) overlay.classList.add('open');
            document.body.classList.add('menu-open');
        }
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('mobileOverlay');
    
    if (mobileMenu) {
        mobileMenu.classList.remove('open');
        if (hamburgerBtn) hamburgerBtn.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.classList.remove('menu-open');
    }
}

// ========================================
// Funciones auxiliares
// ========================================

async function handleLogout(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('🚪 Cerrando sesión desde customer...');
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
    console.log('🔄 Inicializando sistema de foto de perfil customer...');
    
    function updateFromSession() {
        try {
            const session = JSON.parse(localStorage.getItem('outlet_customer'));
            console.log('📸 Actualizando desde sesión customer:', session ? 'tiene sesión' : 'sin sesión');
            
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
                    
                    console.log('✅ Foto de perfil actualizada desde sesión customer');
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
                console.log('✅ Mostrando iniciales customer');
                return true;
            }
        } catch (e) {
            console.error('Error actualizando foto customer:', e);
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

// ========================================
// INICIALIZACIÓN PRINCIPAL
// ========================================

export async function initCustomerNavbarController() {
    if (isNavbarInitialized) {
        console.log('🔄 Customer Navbar ya inicializado');
        setTimeout(updateProfileAvatar, 100);
        updateWishlistBadge();
        updateCartBadge();
        return;
    }
    
    console.log('🔄 [CUSTOMER NAVBAR] Inicializando CON PRIORIDAD MÁXIMA...');
    
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
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // ===== FORZAR EL TEMA INICIAL =====
        const savedTheme = localStorage.getItem(THEME_KEY);
        let initialTheme = 'light'; // POR DEFECTO CLARO
        
        if (savedTheme === 'dark') {
            initialTheme = 'dark';
        }
        
        // FORZAR aplicación del tema
        applyThemeWithPriority(initialTheme);
        
        // Cargar perfil del usuario
        await loadUserProfile();
        
        // Configurar eventos
        setupNavbarEvents();
        
        // Actualizar contadores
        updateWishlistBadge();
        updateCartBadge();
        
        // Escuchar cambios en la autenticación
        window.addEventListener('customer:authStateChanged', async (event) => {
            console.log('🔄 Auth state changed en customer:', event.detail);
            await loadUserProfile();
            setTimeout(updateProfileAvatar, 100);
            updateWishlistBadge();
            updateCartBadge();
        });
        
        // Escuchar cambios en localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === 'outlet_customer') {
                console.log('🔄 Sesión actualizada desde otra pestaña');
                setTimeout(updateProfileAvatar, 100);
            }
            if (event.key === 'outlet_wishlist') {
                console.log('🔄 Wishlist actualizada desde otra pestaña');
                updateWishlistBadge();
            }
            if (event.key === 'outlet_cart') {
                console.log('🔄 Carrito actualizado desde otra pestaña');
                updateCartBadge();
            }
            if (event.key === THEME_KEY) {
                console.log('🔄 Tema actualizado desde otra pestaña');
                const newTheme = event.newValue || 'light';
                applyThemeWithPriority(newTheme);
            }
        });
        
        // Escuchar cambios de tema desde otros componentes
        document.addEventListener('themeChanged', (event) => {
            console.log('🔄 ThemeChanged event recibido en customer:', event.detail);
            forceUpdateThemeIcon();
        });
        
        // Escuchar eventos de wishlist
        document.addEventListener('wishlistUpdated', updateWishlistBadge);
        document.addEventListener('cartUpdated', updateCartBadge);
        
        // Actualizaciones forzadas
        setTimeout(updateProfileAvatar, 300);
        setTimeout(updateProfileAvatar, 600);
        setTimeout(updateWishlistBadge, 500);
        setTimeout(updateCartBadge, 500);
        setTimeout(() => {
            const currentTheme = localStorage.getItem(THEME_KEY) || 'light';
            applyThemeWithPriority(currentTheme);
        }, 500);
        
        // 🔥 PREVENIR que otros navbars cambien el tema
        setTimeout(() => {
            const allThemeBtns = document.querySelectorAll('.theme-toggle-btn');
            if (allThemeBtns.length > 1) {
                console.log('🔒 Bloqueando botones de tema de otros navbars...');
                allThemeBtns.forEach((btn, index) => {
                    if (index > 0) {
                        btn.style.pointerEvents = 'none';
                        btn.style.opacity = '0.5';
                        btn.title = 'Usa el botón de tema del navbar principal';
                    }
                });
            }
        }, 1000);
        
        isNavbarInitialized = true;
        console.log('✅ [CUSTOMER NAVBAR] Inicializado con prioridad máxima');
        
    } catch (error) {
        console.error('❌ Error inicializando customer navbar:', error);
    }
}

// Inicializar sistema de foto
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfilePhotoSystem);
    } else {
        initProfilePhotoSystem();
    }
}

// Exportar todo
export { 
    loadUserProfile, 
    updateProfileAvatar, 
    showGuestUI,
    applyThemeWithPriority,
    forceUpdateThemeIcon,
    handleWishlistClick,
    updateWishlistBadge,
    updateCartBadge,
    handleCartClick,
    handleLogoClick,
    handleSearchClick
};

console.log('📦 Customer Navbar Controller cargado CON PRIORIDAD - COMPLETO');