/* ========================================
   FOOTER CONTROLLER - OUTLET
   Controlador del layout persistente footer
   ======================================== */

let elements = {};

export function initFooterController() {
    cacheElements();
    bindEvents();
    updateCurrentYear();

    console.log('✅ Footer OUTLET Controller inicializado');
}

function cacheElements() {
    elements = {
        footer: document.querySelector('.OUTLET-footer'),
        newsletterBtn: document.getElementById('footerNewsletterBtn'),
        newsletterInput: document.getElementById('footerNewsletterEmail'),
        yearElement: document.querySelector('.current-year')
    };
}

function bindEvents() {
    if (elements.newsletterBtn && elements.newsletterInput) {
        const handleSubscribe = () => {
            const email = elements.newsletterInput.value.trim();
            if (email && isValidEmail(email)) {
                console.log('📧 Newsletter suscripción:', email);
                alert(`✨ ¡Gracias por suscribirte! ✨\n\nRecibirás novedades en: ${email}`);
                elements.newsletterInput.value = '';
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

    const footerLinks = document.querySelectorAll('.footer-links a, .footer-legal a, .footer-social-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenuIfOpen);
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return re.test(email);
}

function saveSubscriber(email) {
    const subscribers = JSON.parse(localStorage.getItem('outlet_newsletter') || '[]');
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('outlet_newsletter', JSON.stringify(subscribers));
    }
}

function updateCurrentYear() {
    if (elements.yearElement) {
        elements.yearElement.textContent = new Date().getFullYear();
    }
}

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

export function getFooterState() {
    return {
        isLoaded: true,
        currentYear: new Date().getFullYear(),
        subscribers: JSON.parse(localStorage.getItem('outlet_newsletter') || '[]').length
    };
}