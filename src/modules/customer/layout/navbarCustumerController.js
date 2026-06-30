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
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        localStorage.setItem(THEME_KEY, theme);
        forceUpdateThemeIcon();
        
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { isDarkMode: theme === 'dark' } 
        }));
        
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
            
            updateUserUI(customer);
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
 * Mostrar UI de invitado - SOLO ACTUALIZA TEXTO, NO CREA BADGE
 */
function showGuestUI() {
    console.log('👤 Mostrando UI de invitado en customer navbar');
    
    const nameElements = document.querySelectorAll('.user-name, .nav-username, .profile-name');
    nameElements.forEach(el => {
        if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'A') {
            el.textContent = 'Invitado';
        }
    });
    
    // ⚠️ ELIMINADO: Ya no se crea ni se manipula #profileBadge
    // Simplemente ocultamos el avatar si existe
    const avatarImg = document.getElementById('profileAvatar');
    if (avatarImg) {
        avatarImg.style.display = 'none';
    }
}

/**
 * Actualizar la foto de perfil en el navbar - SIN BADGE
 */
function updateProfileAvatar() {
    try {
        console.log('🔄 Actualizando avatar del navbar customer...');
        
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
        
        const avatarImg = document.getElementById('profileAvatar');
        
        if (!avatarImg) {
            console.warn('⚠️ Elemento profileAvatar no encontrado');
            return;
        }
        
        if (!session) {
            console.log('❌ No hay sesión, mostrando invitado');
            avatarImg.style.display = 'none';
            return;
        }
        
        const tieneFoto = session.fotoPerfil && session.fotoPerfil.startsWith('http');
        console.log('📸 ¿Tiene foto de perfil?', tieneFoto);
        
        if (tieneFoto) {
            console.log('🖼️ Mostrando foto de perfil:', session.fotoPerfil.substring(0, 60) + '...');
            avatarImg.src = session.fotoPerfil;
            avatarImg.style.display = 'block';
            avatarImg.style.width = '40px';
            avatarImg.style.height = '40px';
            avatarImg.style.borderRadius = '50%';
            avatarImg.style.objectFit = 'cover';
            avatarImg.style.border = '2px solid var(--outlet-gold, #c9a84c)';
            avatarImg.style.cursor = 'pointer';
            console.log('✅ Foto de perfil actualizada');
        } else {
            console.log('🔤 Sin foto, ocultando avatar');
            avatarImg.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Error actualizando avatar:', error);
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
    
    const session = JSON.parse(localStorage.getItem('outlet_customer'));
    
    if (session) {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/wishlistCustomer');
        } else {
            window.location.href = '/wishlistCustomer';
        }
    } else {
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
 * Configurar eventos del navbar customer - SIN BADGE
 */
function setupNavbarEvents() {
    console.log('🔧 Configurando eventos del Customer Navbar...');
    
    // ===== PERFIL - SOLO AVATAR =====
    const profileBtn = document.getElementById('profileBtn');
    const profileAvatar = document.getElementById('profileAvatar');
    
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
    const searchInput = document.querySelector('.search-input') || document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
    } else {
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
    
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    
    console.log('🌓 Tema actual:', isDark ? 'oscuro' : 'claro');
    console.log('🌓 Nuevo tema:', newTheme);
    
    applyThemeWithPriority(newTheme);
    
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
// Sistema de foto de perfil - SIN BADGE
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
                    console.log('✅ Foto de perfil actualizada desde sesión customer');
                    return true;
                }
            } else {
                const avatar = document.getElementById('profileAvatar');
                if (avatar) {
                    avatar.style.display = 'none';
                    console.log('✅ Avatar ocultado (sin foto o sin sesión)');
                    return true;
                }
            }
        } catch (e) {
            console.error('Error actualizando foto customer:', e);
        }
        return false;
    }
    
    setTimeout(updateFromSession, 100);
    
    window.addEventListener('customer:authStateChanged', () => {
        setTimeout(updateFromSession, 100);
    });
    
    window.addEventListener('storage', (event) => {
        if (event.key === 'outlet_customer') {
            setTimeout(updateFromSession, 100);
        }
    });
    
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
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const savedTheme = localStorage.getItem(THEME_KEY);
        let initialTheme = 'light';
        
        if (savedTheme === 'dark') {
            initialTheme = 'dark';
        }
        
        applyThemeWithPriority(initialTheme);
        
        await loadUserProfile();
        setupNavbarEvents();
        updateWishlistBadge();
        updateCartBadge();
        
        window.addEventListener('customer:authStateChanged', async (event) => {
            console.log('🔄 Auth state changed en customer:', event.detail);
            await loadUserProfile();
            setTimeout(updateProfileAvatar, 100);
            updateWishlistBadge();
            updateCartBadge();
        });
        
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
        
        document.addEventListener('themeChanged', (event) => {
            console.log('🔄 ThemeChanged event recibido en customer:', event.detail);
            forceUpdateThemeIcon();
        });
        
        document.addEventListener('wishlistUpdated', updateWishlistBadge);
        document.addEventListener('cartUpdated', updateCartBadge);
        
        setTimeout(updateProfileAvatar, 300);
        setTimeout(updateProfileAvatar, 600);
        setTimeout(updateWishlistBadge, 500);
        setTimeout(updateCartBadge, 500);
        setTimeout(() => {
            const currentTheme = localStorage.getItem(THEME_KEY) || 'light';
            applyThemeWithPriority(currentTheme);
        }, 500);
        
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

console.log('📦 Customer Navbar Controller cargado CON PRIORIDAD - COMPLETO (SIN BADGE)');