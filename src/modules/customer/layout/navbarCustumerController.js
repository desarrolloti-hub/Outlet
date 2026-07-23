/* ========================================
   CUSTOMER NAVBAR CONTROLLER - Outlet Val
   Controlador independiente para el navbar de clientes
   CON PRIORIDAD SOBRE OTROS NAVBARS
   ======================================== */

import { CustomerService } from '../../../services/customerService.js';
import { ThemeService } from '../../shared/layout/themeService.js';
import { ProductService } from '../../../services/productService.js';

// Estado del navbar
let isNavbarInitialized = false;
let currentUser = null;
let isApplyingTheme = false;
let eventCleanupFunctions = [];
let searchTimeout = null;
let isProfileMenuOpen = false;

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
            updateProfileDropdown();
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

    const nameElements = document.querySelectorAll('.user-name, .nav-username, .profile-name, .profile-dropdown-name');
    nameElements.forEach(el => {
        if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'A') {
            el.textContent = 'Invitado';
        }
    });

    const emailElements = document.querySelectorAll('.user-email, .nav-email, .profile-email, .profile-dropdown-email');
    emailElements.forEach(el => {
        if (el.tagName === 'SPAN' || el.tagName === 'DIV') {
            el.textContent = 'invitado@outlet.com';
        }
    });

    const avatarImg = document.getElementById('profileAvatar');
    if (avatarImg) {
        avatarImg.style.display = 'none';
    }

    const dropdownAvatar = document.getElementById('profileDropdownAvatar');
    if (dropdownAvatar) {
        dropdownAvatar.src = '/assets/imagenes/usuario-default.png';
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

// ========================================
// MENÚ DESPLEGABLE DE PERFIL
// ========================================

/**
 * Alternar menú desplegable de perfil
 */
function toggleProfileMenu(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const menu = document.getElementById('profileDropdownMenu');
    if (!menu) return;

    isProfileMenuOpen = !isProfileMenuOpen;
    menu.classList.toggle('open', isProfileMenuOpen);

    if (isProfileMenuOpen) {
        updateProfileDropdown();
    }
}

/**
 * Cerrar menú desplegable de perfil
 */
function closeProfileMenu() {
    const menu = document.getElementById('profileDropdownMenu');
    if (menu) {
        menu.classList.remove('open');
        isProfileMenuOpen = false;
    }
}

/**
 * Manejar click en el botón de perfil - Abre el menú desplegable
 */
function handleProfileClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    console.log('🖱️ Click en perfil/avatar - abriendo menú desplegable');
    toggleProfileMenu(e);
}

/**
 * Manejar click en opción del menú de perfil
 */
function handleProfileMenuItemClick(e, action) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    closeProfileMenu();

    const session = JSON.parse(localStorage.getItem('outlet_customer'));

    switch (action) {
        case 'profile':
            console.log('👤 Navegando a perfil');
            if (session) {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/editUser');
                } else {
                    window.location.href = '/editUser';
                }
            } else {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/login');
                } else {
                    window.location.href = '/login';
                }
            }
            break;

        case 'orders':
            console.log('📦 Navegando a compras realizadas');
            if (session) {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/ordersCustumer');
                } else {
                    window.location.href = 'ordersCustumer';
                }
            } else {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/login');
                } else {
                    window.location.href = '/login';
                }
            }
            break;

        case 'payment':
            console.log('💳 Navegando a métodos de pago');
            if (session) {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/payment');
                } else {
                    window.location.href = '/payment';
                }
            } else {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/login');
                } else {
                    window.location.href = '/login';
                }
            }
            break;

        case 'logout':
            handleLogout(e);
            break;

        default:
            console.warn('⚠️ Acción desconocida:', action);
    }
}

/**
 * Manejar click fuera del menú de perfil para cerrarlo
 */
function handleProfileOutside(e) {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileDropdownMenu');

    if (profileBtn && profileMenu) {
        if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
            closeProfileMenu();
        }
    }
}

/**
 * Actualizar datos del dropdown de perfil
 */
function updateProfileDropdown() {
    try {
        const session = JSON.parse(localStorage.getItem('outlet_customer'));
        const nameEl = document.getElementById('profileDropdownName');
        const emailEl = document.getElementById('profileDropdownEmail');
        const avatarEl = document.getElementById('profileDropdownAvatar');

        if (session) {
            if (nameEl) nameEl.textContent = session.nombreCompleto || session.nombre || 'Usuario';
            if (emailEl) emailEl.textContent = session.email || '';
            if (avatarEl && session.fotoPerfil && session.fotoPerfil.startsWith('http')) {
                avatarEl.src = session.fotoPerfil;
            } else if (avatarEl) {
                avatarEl.src = '/assets/imagenes/usuario-default.png';
            }
        } else {
            if (nameEl) nameEl.textContent = 'Invitado';
            if (emailEl) emailEl.textContent = 'invitado@outlet.com';
            if (avatarEl) avatarEl.src = '/assets/imagenes/usuario-default.png';
        }
    } catch (error) {
        console.error('Error actualizando dropdown de perfil:', error);
    }
}

// ========================================
// HANDLERS DEL NAVBAR
// ========================================

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
// FUNCIÓN DE LOGOUT
// ========================================

/**
 * Cerrar sesión - LIMPIA TODO
 */
async function handleLogout(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    console.log('🚪 Cerrando sesión desde customer...');

    try {
        // 1. Limpiar localStorage manualmente
        console.log('🧹 Limpiando localStorage...');

        const keysToRemove = [
            'outlet_customer',
            'outlet_cart',
            'outlet_wishlist',
            'outlet_session',
            'outlet_token',
            'outlet_user',
            'outlet_theme'
        ];

        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`🗑️ Eliminada clave: ${key}`);
            }
        });

        // 2. Intentar cerrar sesión con CustomerService
        try {
            if (CustomerService && typeof CustomerService.logout === 'function') {
                await CustomerService.logout();
                console.log('✅ CustomerService.logout() ejecutado');
            }
        } catch (serviceError) {
            console.warn('⚠️ Error en CustomerService.logout():', serviceError);
        }

        // 3. Limpiar estado
        currentUser = null;
        closeProfileMenu();

        // 4. Actualizar UI a estado de invitado
        showGuestUI();
        updateWishlistBadge();
        updateCartBadge();
        forceUpdateThemeIcon();

        // 5. Disparar evento de autenticación
        window.dispatchEvent(new CustomEvent('customer:authStateChanged', {
            detail: null
        }));

        console.log('✅ Sesión cerrada exitosamente');
        showNotification('Sesión cerrada correctamente', 'success');

        // 6. Redirigir al login
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/login');
            } else {
                window.location.href = '/login';
            }
        }, 300);

    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        showNotification('Error al cerrar sesión', 'error');
    }
}

// ========================================
// FUNCIÓN DE NOTIFICACIONES
// ========================================

/**
 * Mostrar notificación toast
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
    toast.style.background = type === 'error' ? '#ba1a1a' : '#28a745';
    toast.style.color = '#fff';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    toast.style.transition = 'all 0.3s ease';
    toast.style.fontWeight = '500';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2800);
}

// ========================================
// FUNCIONES DE BÚSQUEDA
// ========================================

/**
 * Manejar entrada de búsqueda
 */
function handleSearchInput(e) {
    const termino = e.target.value.trim();
    const clearBtn = document.getElementById('searchClearBtn');
    const resultsDropdown = document.getElementById('searchResultsDropdown');

    if (termino.length > 0) {
        clearBtn.style.display = 'flex';
    } else {
        clearBtn.style.display = 'none';
    }

    if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
    }

    if (termino.length < 2) {
        showSearchPlaceholder('Escribe al menos 2 caracteres para buscar');
        resultsDropdown.classList.remove('open');
        return;
    }

    showSearchLoading();
    resultsDropdown.classList.add('open');

    searchTimeout = setTimeout(async () => {
        try {
            const results = await ProductService.search(termino, 10);
            renderSearchResults(results, termino);
        } catch (error) {
            console.error('Error en búsqueda:', error);
            showSearchError('Error al buscar productos. Intenta nuevamente.');
        }
    }, 300);
}

/**
 * Manejar tecla Enter en búsqueda
 */
function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        const termino = e.target.value.trim();
        if (termino.length >= 2) {
            const session = JSON.parse(localStorage.getItem('outlet_customer'));
            const basePath = session ? '/homeCustomer' : '/';
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(`${basePath}?search=${encodeURIComponent(termino)}`);
            } else {
                window.location.href = `${basePath}?search=${encodeURIComponent(termino)}`;
            }
            closeSearchResults();
        }
    }
}

/**
 * Limpiar búsqueda
 */
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    const resultsDropdown = document.getElementById('searchResultsDropdown');

    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    resultsDropdown.classList.remove('open');
    showSearchPlaceholder('Escribe para buscar productos');
}

/**
 * Mostrar estado de carga
 */
function showSearchLoading() {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (!resultsDropdown) return;

    resultsDropdown.innerHTML = `
        <div class="search-loading">
            <div class="search-spinner"></div>
            <span>Buscando...</span>
        </div>
    `;
}

/**
 * Mostrar placeholder
 */
function showSearchPlaceholder(text) {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (!resultsDropdown) return;

    resultsDropdown.innerHTML = `
        <div class="search-placeholder">
            <span>🔍 ${text}</span>
        </div>
    `;
}

/**
 * Mostrar error
 */
function showSearchError(text) {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (!resultsDropdown) return;

    resultsDropdown.innerHTML = `
        <div class="search-error">
            <i class="fas fa-exclamation-circle"></i>
            <span>${text}</span>
        </div>
    `;
}

/**
 * Cerrar resultados
 */
function closeSearchResults() {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (resultsDropdown) {
        resultsDropdown.classList.remove('open');
    }
}

/**
 * Renderizar resultados de búsqueda
 */
function renderSearchResults(products, termino) {
    const resultsDropdown = document.getElementById('searchResultsDropdown');
    if (!resultsDropdown) return;

    if (!products || products.length === 0) {
        resultsDropdown.innerHTML = `
            <div class="search-no-results">
                <span>No encontramos productos para "<strong>${termino}</strong>"</span>
                <small>Intenta con otras palabras</small>
            </div>
        `;
        resultsDropdown.classList.add('open');
        return;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    let html = `<div class="search-results-header"><span>${products.length} resultado${products.length > 1 ? 's' : ''}</span></div>`;
    html += `<div class="search-results-list">`;

    products.forEach(product => {
        const imagen = product.imagenPrincipal || product.primeraImagen || '';
        const precioFinal = product.precioFinal || product.precioVenta;
        const tieneOferta = product.porcentajeDescuento > 0;
        const session = JSON.parse(localStorage.getItem('outlet_customer'));
        const basePath = session ? '/homeCustomer' : '/';
        const productUrl = `${basePath}?product=${product.id}`;

        html += `
            <div class="search-result-item" data-product-id="${product.id}" data-url="${productUrl}">
                <div class="search-result-image">
                    ${imagen ? `<img src="${imagen}" alt="${product.nombre}" loading="lazy">` :
                `<div class="search-result-no-image"><i class="fas fa-image"></i></div>`}
                    ${tieneOferta ? `<span class="search-result-badge">-${product.porcentajeDescuento}%</span>` : ''}
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${product.nombre}</div>
                    <div class="search-result-marca">${product.marca || ''}</div>
                    <div class="search-result-prices">
                        ${tieneOferta ?
                `<span class="search-result-price-old">${formatPrice(product.precioVenta)}</span>
                             <span class="search-result-price">${formatPrice(precioFinal)}</span>` :
                `<span class="search-result-price">${formatPrice(precioFinal)}</span>`}
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    resultsDropdown.innerHTML = html;
    resultsDropdown.classList.add('open');

    resultsDropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.dataset.url;
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(url);
            } else {
                window.location.href = url;
            }
            closeSearchResults();
        });
    });
}

/**
 * Manejar click fuera del buscador
 */
function handleSearchOutside(e) {
    const searchContainer = document.getElementById('searchContainer');
    const resultsDropdown = document.getElementById('searchResultsDropdown');

    if (searchContainer && !searchContainer.contains(e.target)) {
        if (resultsDropdown) {
            resultsDropdown.classList.remove('open');
        }
    }
}

// ========================================
// MENÚ MÓVIL
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
// CONTADORES
// ========================================

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

// ========================================
// LIMPIAR EVENTOS
// ========================================

function cleanupNavbarEvents() {
    console.log('🧹 Limpiando eventos antiguos del navbar...');
    eventCleanupFunctions.forEach(cleanup => {
        try {
            cleanup();
        } catch (e) {
            console.warn('Error en cleanup:', e);
        }
    });
    eventCleanupFunctions = [];
}

// ========================================
// CONFIGURAR EVENTOS DEL NAVBAR
// ========================================

function setupNavbarEvents() {
    console.log('🔧 Configurando eventos del Customer Navbar...');

    cleanupNavbarEvents();

    // ===== PERFIL - MENÚ DESPLEGABLE =====
    const profileBtn = document.getElementById('profileBtn');
    const profileAvatar = document.getElementById('profileAvatar');

    if (profileBtn) {
        console.log('✅ Configurando #profileBtn customer - menú desplegable');
        const handler = handleProfileClick;
        profileBtn.addEventListener('click', handler);
        eventCleanupFunctions.push(() => profileBtn.removeEventListener('click', handler));
    }

    if (profileAvatar) {
        console.log('✅ Configurando #profileAvatar customer - menú desplegable');
        profileAvatar.style.cursor = 'pointer';
        const handler = handleProfileClick;
        profileAvatar.addEventListener('click', handler);
        eventCleanupFunctions.push(() => profileAvatar.removeEventListener('click', handler));
    }

    document.addEventListener('click', handleProfileOutside);
    eventCleanupFunctions.push(() => document.removeEventListener('click', handleProfileOutside));

    // ===== OPCIONES DEL MENÚ DESPLEGABLE =====
    const profileMenuItems = document.querySelectorAll('.profile-dropdown-list a[data-action]');
    profileMenuItems.forEach(item => {
        const action = item.dataset.action;
        const handler = (e) => {
            if (action === 'logout') {
                handleLogout(e);
            } else {
                handleProfileMenuItemClick(e, action);
            }
        };
        item.addEventListener('click', handler);
        eventCleanupFunctions.push(() => item.removeEventListener('click', handler));
    });

    // ===== WISHLIST =====
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        console.log('✅ Configurando #wishlistBtn customer');
        const handler = handleWishlistClick;
        wishlistBtn.addEventListener('click', handler);
        eventCleanupFunctions.push(() => wishlistBtn.removeEventListener('click', handler));
    }

    // ===== CARRITO =====
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        console.log('✅ Configurando #cartBtn customer');
        const handler = handleCartClick;
        cartBtn.addEventListener('click', handler);
        eventCleanupFunctions.push(() => cartBtn.removeEventListener('click', handler));
    }

    // ===== LOGO =====
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        console.log('✅ Configurando #logoLink customer');
        const handler = handleLogoClick;
        logoLink.addEventListener('click', handler);
        eventCleanupFunctions.push(() => logoLink.removeEventListener('click', handler));
    }

    // ===== TEMA =====
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        console.log('✅ Configurando #themeToggleBtn customer con prioridad');
        const handler = handleThemeToggle;
        themeToggleBtn.addEventListener('click', handler);
        eventCleanupFunctions.push(() => themeToggleBtn.removeEventListener('click', handler));
        forceUpdateThemeIcon();
    }

    // ===== BUSCADOR =====
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClearBtn');

    if (searchInput) {
        console.log('✅ Configurando #searchInput customer');
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleSearchKeydown);
        searchInput.addEventListener('focus', () => {
            const termino = searchInput.value.trim();
            if (termino.length >= 2) {
                const resultsDropdown = document.getElementById('searchResultsDropdown');
                if (resultsDropdown) {
                    resultsDropdown.classList.add('open');
                }
            }
        });
        eventCleanupFunctions.push(() => searchInput.removeEventListener('input', handleSearchInput));
        eventCleanupFunctions.push(() => searchInput.removeEventListener('keydown', handleSearchKeydown));
    }

    if (clearBtn) {
        console.log('✅ Configurando #searchClearBtn customer');
        clearBtn.addEventListener('click', clearSearch);
        eventCleanupFunctions.push(() => clearBtn.removeEventListener('click', clearSearch));
    }

    document.addEventListener('click', handleSearchOutside);
    eventCleanupFunctions.push(() => document.removeEventListener('click', handleSearchOutside));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSearchResults();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.blur();
            }
        }
    });

    // ===== MENÚ MÓVIL =====
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (hamburgerBtn && mobileMenu) {
        console.log('✅ Configurando menú móvil customer');
        const toggleHandler = toggleMobileMenu;
        hamburgerBtn.addEventListener('click', toggleHandler);
        eventCleanupFunctions.push(() => hamburgerBtn.removeEventListener('click', toggleHandler));
    }

    if (mobileCloseBtn && mobileMenu) {
        const closeHandler = closeMobileMenu;
        mobileCloseBtn.addEventListener('click', closeHandler);
        eventCleanupFunctions.push(() => mobileCloseBtn.removeEventListener('click', closeHandler));
    }

    if (mobileOverlay && mobileMenu) {
        const closeHandler = closeMobileMenu;
        mobileOverlay.addEventListener('click', closeHandler);
        eventCleanupFunctions.push(() => mobileOverlay.removeEventListener('click', closeHandler));
    }

    // ===== LOGOUT MÓVIL =====
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
        console.log('✅ Configurando #mobileLogoutBtn customer');
        const handler = handleLogout;
        mobileLogoutBtn.addEventListener('click', handler);
        eventCleanupFunctions.push(() => mobileLogoutBtn.removeEventListener('click', handler));
    }

    updateProfileDropdown();

    console.log('✅ Eventos del Customer Navbar configurados');
}

// ========================================
// RECONECTAR EVENTOS
// ========================================

function reconnectNavbarEvents() {
    console.log('🔄 Re-conectando eventos del navbar...');
    setupNavbarEvents();
    updateProfileAvatar();
    updateWishlistBadge();
    updateCartBadge();
    forceUpdateThemeIcon();
    updateProfileDropdown();
}

// ========================================
// INICIALIZACIÓN
// ========================================

function initProfilePhotoSystem() {
    console.log('🔄 Inicializando sistema de foto de perfil customer...');

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
                    avatar.style.cursor = 'pointer';
                    return true;
                }
            } else {
                const avatar = document.getElementById('profileAvatar');
                if (avatar) {
                    avatar.style.display = 'none';
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
        setTimeout(updateProfileDropdown, 100);
    });

    window.addEventListener('storage', (event) => {
        if (event.key === 'outlet_customer') {
            setTimeout(updateFromSession, 100);
            setTimeout(updateProfileDropdown, 100);
        }
    });

    window.updateProfileAvatar = updateFromSession;
}

export async function initCustomerNavbarController() {
    if (isNavbarInitialized) {
        console.log('🔄 Customer Navbar ya inicializado - reconectando eventos...');
        reconnectNavbarEvents();
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
        applyThemeWithPriority(savedTheme === 'dark' ? 'dark' : 'light');

        await loadUserProfile();
        setupNavbarEvents();
        updateWishlistBadge();
        updateCartBadge();
        updateProfileDropdown();
        showSearchPlaceholder('Escribe para buscar productos');

        window.addEventListener('customer:authStateChanged', async (event) => {
            console.log('🔄 Auth state changed en customer:', event.detail);
            await loadUserProfile();
            setTimeout(updateProfileAvatar, 100);
            setTimeout(updateProfileDropdown, 100);
            updateWishlistBadge();
            updateCartBadge();
        });

        window.addEventListener('storage', (event) => {
            if (event.key === 'outlet_customer') {
                setTimeout(updateProfileAvatar, 100);
                setTimeout(updateProfileDropdown, 100);
            }
            if (event.key === 'outlet_wishlist') updateWishlistBadge();
            if (event.key === 'outlet_cart') updateCartBadge();
            if (event.key === THEME_KEY) {
                applyThemeWithPriority(event.newValue || 'light');
            }
        });

        document.addEventListener('themeChanged', forceUpdateThemeIcon);
        document.addEventListener('wishlistUpdated', updateWishlistBadge);
        document.addEventListener('cartUpdated', updateCartBadge);

        document.addEventListener('routeChanged', () => {
            setTimeout(reconnectNavbarEvents, 50);
        });

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
    reconnectNavbarEvents,
    setupNavbarEvents,
    clearSearch,
    closeSearchResults,
    toggleProfileMenu,
    closeProfileMenu,
    updateProfileDropdown,
    handleLogout
};

console.log('📦 Customer Navbar Controller cargado CON PRIORIDAD - COMPLETO');