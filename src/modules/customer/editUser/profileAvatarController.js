/* ========================================
   PROFILE AVATAR CONTROLLER - Outlet Val
   Controlador para actualizar automáticamente la foto de perfil
   ======================================== */

/**
 * Actualizar la foto de perfil en el navbar/header
 * Esta función busca automáticamente los elementos comunes
 * para mostrar la foto de perfil o las iniciales
 */
function updateProfileAvatar() {
    // Obtener la sesión
    let session = null;
    try {
        const sessionData = localStorage.getItem('outlet_customer');
        if (sessionData) {
            session = JSON.parse(sessionData);
        }
    } catch (error) {
        console.error('❌ Error al leer la sesión:', error);
        return;
    }
    
    if (!session || !session.id) {
        console.log('❌ No hay sesión activa');
        return;
    }
    
    console.log('🔄 Actualizando avatar para:', session.nombreCompleto || session.nombre);
    
    // Buscar elementos de avatar (por ID o clase)
    const avatarImg = document.getElementById('profileAvatar') || 
                     document.querySelector('.profile-avatar img') ||
                     document.querySelector('.user-avatar img') ||
                     document.querySelector('[class*="avatar"] img');
    
    const badgeSpan = document.getElementById('profileBadge') ||
                     document.querySelector('.profile-badge') ||
                     document.querySelector('.user-initials') ||
                     document.querySelector('[class*="initials"]');
    
    // Buscar contenedor del avatar
    const avatarContainer = document.getElementById('profileAvatar')?.parentElement ||
                           document.querySelector('.profile-avatar') ||
                           document.querySelector('.user-avatar') ||
                           document.querySelector('[class*="avatar-container"]');
    
    // Si no hay elementos, buscar en el navbar
    if (!avatarContainer && !avatarImg) {
        const nav = document.querySelector('nav, .navbar, .header, .top-bar');
        if (nav) {
            console.log('🔍 Buscando avatar en el navbar...');
            // Buscar cualquier imagen dentro del navbar
            const navImages = nav.querySelectorAll('img');
            for (const img of navImages) {
                if (img.alt?.toLowerCase().includes('perfil') || 
                    img.alt?.toLowerCase().includes('profile') ||
                    img.className?.toLowerCase().includes('avatar')) {
                    // Actualizar esta imagen
                    if (session.fotoPerfil) {
                        img.src = session.fotoPerfil;
                        img.style.display = 'block';
                        img.style.width = '40px';
                        img.style.height = '40px';
                        img.style.borderRadius = '50%';
                        img.style.objectFit = 'cover';
                        console.log('✅ Foto actualizada en imagen del navbar');
                    }
                    return;
                }
            }
        }
        console.log('⚠️ No se encontraron elementos de avatar en el DOM');
        return;
    }
    
    // Actualizar la imagen del avatar
    if (avatarImg) {
        if (session.fotoPerfil && session.fotoPerfil.startsWith('http')) {
            // ✅ Mostrar foto
            avatarImg.src = session.fotoPerfil;
            avatarImg.style.display = 'block';
            avatarImg.style.width = '40px';
            avatarImg.style.height = '40px';
            avatarImg.style.borderRadius = '50%';
            avatarImg.style.objectFit = 'cover';
            avatarImg.style.border = '2px solid var(--outlet-gold, #c9a84c)';
            
            // Ocultar badge si existe
            if (badgeSpan) {
                badgeSpan.style.display = 'none';
            }
            
            console.log('✅ Foto de perfil actualizada:', session.fotoPerfil);
        } else {
            // ❌ No hay foto - mostrar iniciales
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
            
            console.log('📝 Mostrando iniciales:', session.iniciales);
        }
    }
    
    // También actualizar el nombre del usuario si existe
    const nameElements = document.querySelectorAll('.user-name, .nav-username, .profile-name, [class*="userName"], [class*="nombre-usuario"]');
    nameElements.forEach(el => {
        if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'A') {
            el.textContent = session.nombreCompleto || session.nombre || 'Usuario';
        }
    });
}

/**
 * Inicializar el sistema de actualización de avatar
 */
function initProfileAvatarSystem() {
    console.log('🔄 Inicializando sistema de foto de perfil...');
    
    // Ejecutar inmediatamente si el DOM está listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(updateProfileAvatar, 100);
        });
    } else {
        setTimeout(updateProfileAvatar, 100);
    }
    
    // Escuchar cambios en la sesión
    window.addEventListener('customer:authStateChanged', function(event) {
        console.log('🔄 Auth state changed, actualizando avatar...');
        setTimeout(updateProfileAvatar, 50);
    });
    
    // Escuchar cambios en localStorage (para otras pestañas)
    window.addEventListener('storage', function(event) {
        if (event.key === 'outlet_customer') {
            console.log('🔄 Sesión actualizada desde otra pestaña');
            setTimeout(updateProfileAvatar, 50);
        }
    });
    
    // Escuchar cuando la página se muestra (para navegación SPA)
    window.addEventListener('pageshow', function() {
        setTimeout(updateProfileAvatar, 50);
    });
    
    // Escuchar cuando el DOM cambia (para elementos dinámicos)
    const observer = new MutationObserver(function(mutations) {
        // Verificar si apareció un avatar
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // Elemento
                        if (node.id === 'profileAvatar' || 
                            node.classList?.contains('profile-avatar') ||
                            node.classList?.contains('user-avatar') ||
                            node.querySelector?.('#profileAvatar') ||
                            node.querySelector?.('.profile-avatar')) {
                            console.log('🔄 Avatar detectado en DOM, actualizando...');
                            setTimeout(updateProfileAvatar, 50);
                            return;
                        }
                    }
                }
            }
        }
    });
    
    // Iniciar observador después de un tiempo
    setTimeout(() => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }, 500);
    
    // Exponer función globalmente
    window.updateProfileAvatar = updateProfileAvatar;
    
    console.log('✅ Sistema de foto de perfil inicializado');
}

// Inicializar automáticamente
if (typeof window !== 'undefined') {
    initProfileAvatarSystem();
}

// Exportar para uso en otros módulos
export { updateProfileAvatar, initProfileAvatarSystem };