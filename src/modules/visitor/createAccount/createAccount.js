/* ========================================
   CREATE ACCOUNT CONTROLLER - OUTLET
   Controlador para página de creación de cuenta
   ======================================== */

// Storage keys
const STORAGE_KEYS = {
    USERS: 'outlet_users',
    CURRENT_USER: 'outlet_current_user'
};

/**
 * Load styles for create account page
 */
function loadStyles() {
    if (document.querySelector('link[href*="createAccount.css"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/pages/createAccount.css';
    document.head.appendChild(link);
}

/**
 * Show toast notification
 */
function showNotification(message, isError = false) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.textContent = message;
    
    if (isError) {
        notification.style.borderLeftColor = 'var(--outlet-danger)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate full name (at least 2 words, min 2 chars each)
 */
function isValidFullName(name) {
    const trimmed = name.trim();
    if (trimmed.length < 4) return false;
    const words = trimmed.split(/\s+/);
    return words.length >= 2 && words.every(w => w.length >= 2);
}

/**
 * Validate password and return requirements object
 */
function validatePassword(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password)
    };
}

/**
 * Update password requirements UI
 */
function updatePasswordRequirements(password) {
    const requirements = validatePassword(password);
    
    const reqLength = document.getElementById('reqLength');
    const reqUppercase = document.getElementById('reqUppercase');
    const reqNumber = document.getElementById('reqNumber');
    
    if (reqLength) {
        reqLength.innerHTML = requirements.length ? '✓ Min. 8 characters' : '✗ Min. 8 characters';
        reqLength.className = `outlet-account-req ${requirements.length ? 'valid' : 'invalid'}`;
    }
    if (reqUppercase) {
        reqUppercase.innerHTML = requirements.uppercase ? '✓ One uppercase' : '✗ One uppercase';
        reqUppercase.className = `outlet-account-req ${requirements.uppercase ? 'valid' : 'invalid'}`;
    }
    if (reqNumber) {
        reqNumber.innerHTML = requirements.number ? '✓ One number' : '✗ One number';
        reqNumber.className = `outlet-account-req ${requirements.number ? 'valid' : 'invalid'}`;
    }
    
    return requirements.length && requirements.uppercase && requirements.number;
}

/**
 * Validate entire form
 */
function validateForm() {
    let isValid = true;
    
    // Validate full name
    const fullname = document.getElementById('fullname').value;
    const errorFullname = document.getElementById('errorFullname');
    if (!isValidFullName(fullname)) {
        errorFullname.textContent = 'Enter valid first and last name';
        isValid = false;
    } else {
        errorFullname.textContent = '';
    }
    
    // Validate email
    const email = document.getElementById('email').value;
    const errorEmail = document.getElementById('errorEmail');
    if (!email) {
        errorEmail.textContent = 'Email is required';
        isValid = false;
    } else if (!isValidEmail(email)) {
        errorEmail.textContent = 'Enter a valid email address';
        isValid = false;
    } else {
        errorEmail.textContent = '';
    }
    
    // Validate password
    const password = document.getElementById('password').value;
    const errorPassword = document.getElementById('errorPassword');
    const passwordValid = validatePassword(password);
    if (!password) {
        errorPassword.textContent = 'Password is required';
        isValid = false;
    } else if (!(passwordValid.length && passwordValid.uppercase && passwordValid.number)) {
        errorPassword.textContent = 'Password does not meet requirements';
        isValid = false;
    } else {
        errorPassword.textContent = '';
    }
    
    // Validate password confirmation
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorConfirm = document.getElementById('errorConfirm');
    if (password !== confirmPassword) {
        errorConfirm.textContent = 'Passwords do not match';
        isValid = false;
    } else {
        errorConfirm.textContent = '';
    }
    
    // Validate terms
    const terms = document.getElementById('terms').checked;
    if (!terms) {
        showNotification('❌ You must accept the Terms & Conditions', true);
        isValid = false;
    }
    
    return isValid;
}

/**
 * Save user to localStorage
 */
function saveUser(userData) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        showNotification('❌ This email is already registered', true);
        return false;
    }
    
    users.push(userData);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
}

/**
 * Handle form submission
 */
function handleRegister(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const newsletter = document.getElementById('newsletter').checked;
    
    const userData = {
        id: Date.now(),
        fullname,
        email,
        phone: phone || null,
        password: btoa(password), // Base64 encoded (DEMO only, not for production!)
        newsletter,
        createdAt: new Date().toISOString()
    };
    
    if (saveUser(userData)) {
        showNotification('✅ Account created successfully! Redirecting...');
        
        // Save simple session
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
            id: userData.id,
            fullname: userData.fullname,
            email: userData.email
        }));
        
        setTimeout(() => {
            window.navigateTo('/login');
        }, 2000);
    }
}

/**
 * Handle login redirect
 */
function handleLoginRedirect(e) {
    e.preventDefault();
    window.navigateTo('/login');
}

/**
 * Handle terms link click
 */
function handleTerms(e) {
    e.preventDefault();
    showNotification('📜 Please read our Terms & Conditions on the website');
}

/**
 * Initialize real-time validation
 */
function initRealtimeValidation() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordRequirements(e.target.value);
            
            // Also validate confirm password in real-time
            const confirm = document.getElementById('confirmPassword');
            if (confirm.value) {
                const errorConfirm = document.getElementById('errorConfirm');
                if (e.target.value !== confirm.value) {
                    errorConfirm.textContent = 'Passwords do not match';
                } else {
                    errorConfirm.textContent = '';
                }
            }
        });
    }
    
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput) {
        confirmInput.addEventListener('input', (e) => {
            const password = document.getElementById('password').value;
            const errorConfirm = document.getElementById('errorConfirm');
            if (password !== e.target.value) {
                errorConfirm.textContent = 'Passwords do not match';
            } else {
                errorConfirm.textContent = '';
            }
        });
    }
}

/**
 * Main controller
 */
export async function createAccountController() {
    console.log('📝 Create Account Controller - Registration page');
    
    // Load styles
    loadStyles();
    
    // Initialize real-time validation
    initRealtimeValidation();
    
    // Bind form events
    const registerForm = document.getElementById('createAccountForm');
    const loginBtn = document.getElementById('loginBtn');
    const termsLink = document.getElementById('termsLink');
    
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (loginBtn) loginBtn.addEventListener('click', handleLoginRedirect);
    if (termsLink) termsLink.addEventListener('click', handleTerms);
    
    console.log('✅ Create Account page loaded successfully');
}