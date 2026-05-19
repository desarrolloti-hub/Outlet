/* ========================================
   FOOTER CONTROLLER - OUTLET
   Controlador del layout persistente footer
   ======================================== */

// Elementos DOM cacheados
let elements = {};

/**
 * Inicializa el controlador del footer
 */
export function initFooterController() {
    cacheElements();
    bindEvents();
    updateCurrentYear();
    
    console.log('✅ Footer OUTLET Controller inicializado');
}

/**
 * Cachea elementos del DOM
 */
function cacheElements() {
    elements = {
        footer: document.querySelector('.OUTLET-footer'),
        newsletterBtn: document.getElementById('footerNewsletterBtn'),
        newsletterInput: document.getElementById('footerNewsletterEmail'),
        yearElement: document.querySelector('.current-year')
    };
}

/**
 * Vincula eventos del DOM
 */
function bindEvents() {
    // Newsletter suscripción
    if (elements.newsletterBtn && elements.newsletterInput) {
        const handleSubscribe = () => {
            const email = elements.newsletterInput.value.trim();
            if (email && isValidEmail(email)) {
                // Guardar email (puedes enviar a API)
                console.log('📧 Newsletter suscripción:', email);
                
                // Mostrar mensaje de éxito
                alert(`✨ ¡Gracias por suscribirte! ✨\n\nRecibirás novedades en: ${email}`);
                elements.newsletterInput.value = '';
                
                // Opcional: guardar en localStorage o enviar a backend
                saveSubscriber(email);
            } else if (email) {
                alert('📧 Por favor, ingresa un email válido.');
            } else {
                alert('✉️ Por favor, ingresa tu email para suscribirte.');
            }
        };
        
        elements.newsletterBtn.addEventListener('click', handleSubscribe);
        elements.newsletterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubscribe();
        });
    }
    
    // Cerrar menú móvil cuando se hace clic en enlaces del footer
    const footerLinks = document.querySelectorAll('.footer-links a, .footer-legal a, .footer-social-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenuIfOpen();
        });
    });
}

/**
 * Valida formato de email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return re.test(email);
}

/**
 * Guarda suscriptor (opcional)
 */
function saveSubscriber(email) {
    // Aquí puedes enviar a tu backend
    // fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
    
    // O guardar en localStorage
    const subscribers = JSON.parse(localStorage.getItem('outlet_newsletter') || '[]');
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('outlet_newsletter', JSON.stringify(subscribers));
    }
}

/**
 * Actualiza año actual en el footer
 */
function updateCurrentYear() {
    if (elements.yearElement) {
        elements.yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Cierra menú móvil si está abierto
 */
function closeMobileMenuIfOpen() {
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (mobileMenu?.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        hamburgerBtn?.classList.remove('open');
        document.body.classList.remove('menu-open');
        
        if (overlay) {
            overlay.classList.remove('open');
            setTimeout(() => overlay.remove(), 300);
        }
    }
}

/**
 * Obtiene estado del footer
 */
export function getFooterState() {
    return {
        isLoaded: true,
        currentYear: new Date().getFullYear(),
        subscribers: JSON.parse(localStorage.getItem('outlet_newsletter') || '[]').length
    };
}