/* ========================================
   VERIFICAR EMAIL - OUTLET
   Controlador para verificación de correo (SPA)
   ======================================== */

import { auth, db } from '/configuracionFB/configuracionFB.js';
import { 
    applyActionCode,
    checkActionCode
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { 
    doc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

/**
 * Controller principal para verificación de email
 */
export async function verificarEmailController() {
    console.log('📧 Verificar Email Controller - OUTLET');
    
    const container = document.getElementById('verificationContent');
    if (!container) return;
    
    // Mostrar estado de carga
    mostrarLoading(container);
    
    // Procesar verificación
    await procesarVerificacion(container);
}

/**
 * Muestra estado de carga
 */
function mostrarLoading(container) {
    container.innerHTML = `
        <div class="outlet-loading-state">
            <div class="outlet-spinner"></div>
            <p>Verificando tu correo electrónico...</p>
        </div>
    `;
}

/**
 * Muestra estado de éxito
 */
function mostrarExito(container, email) {
    container.innerHTML = `
        <div class="outlet-success-state">
            <div class="outlet-success-icon">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <h1 class="outlet-success-title">¡Correo Verificado!</h1>
            <div class="outlet-success-message">
                <p>Tu correo electrónico ha sido verificado exitosamente.</p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                    <span class="email-highlight">${email}</span>
                </p>
                <p style="margin-top: 1rem;">Ahora puedes acceder a todas las funciones de OUTLET.</p>
            </div>
            <a href="/login" class="outlet-verification-btn" data-link>
                <i class="fa-solid fa-right-to-bracket"></i>
                Iniciar Sesión
            </a>
            <div class="outlet-countdown-container">
                <div class="outlet-countdown-text">
                    Redirigiendo en <span class="outlet-countdown-number" id="countdown">5</span> segundos...
                </div>
                <div class="outlet-progress-bar">
                    <div class="outlet-progress-fill" id="progressFill"></div>
                </div>
            </div>
        </div>
    `;
    
    // Iniciar contador de redirección
    iniciarContador(5, '/login');
}

/**
 * Muestra estado de error
 */
function mostrarError(container, mensaje, esExpirado = false) {
    const botonUrl = '/login';
    const botonTexto = 'Volver al Inicio de Sesión';
    
    container.innerHTML = `
        <div class="outlet-error-state">
            <div class="outlet-error-icon">
                <i class="fa-solid fa-circle-exclamation"></i>
            </div>
            <h1 class="outlet-error-title">Error de Verificación</h1>
            <div class="outlet-error-message">
                <p>${mensaje}</p>
                ${esExpirado ? '<p style="margin-top: 1rem;">¿No recibiste el correo? Puedes solicitar uno nuevo desde el inicio de sesión.</p>' : ''}
            </div>
            <a href="${botonUrl}" class="outlet-verification-btn outlet-verification-btn-outline" data-link>
                <i class="fa-solid fa-arrow-left"></i>
                ${botonTexto}
            </a>
            ${esExpirado ? `
                <div class="outlet-countdown-container">
                    <div class="outlet-countdown-text">
                        Redirigiendo en <span class="outlet-countdown-number" id="countdown">5</span> segundos...
                    </div>
                    <div class="outlet-progress-bar">
                        <div class="outlet-progress-fill" id="progressFill"></div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    if (esExpirado) {
        iniciarContador(5, '/login');
    }
}

/**
 * Inicia contador y barra de progreso
 */
function iniciarContador(segundos, url) {
    let tiempoRestante = segundos;
    const countdownSpan = document.getElementById('countdown');
    const progressFill = document.getElementById('progressFill');
    
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    const interval = setInterval(() => {
        tiempoRestante--;
        
        if (countdownSpan) {
            countdownSpan.textContent = tiempoRestante;
        }
        
        if (progressFill) {
            const porcentaje = ((segundos - tiempoRestante) / segundos) * 100;
            progressFill.style.width = `${porcentaje}%`;
        }
        
        if (tiempoRestante <= 0) {
            clearInterval(interval);
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(url);
            } else {
                window.location.href = url;
            }
        }
    }, 1000);
}

/**
 * Actualiza Firestore con emailVerificado = true
 */
async function actualizarFirestorePorEmail(email) {
    try {
        console.log('🔍 Buscando usuario con email:', email);
        
        const usuariosRef = collection(db, "usuarios");
        const q = query(usuariosRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.error('❌ No se encontró usuario con ese email');
            return false;
        }
        
        const userDoc = querySnapshot.docs[0];
        const uid = userDoc.id;
        
        console.log('✅ Usuario encontrado, UID:', uid);
        
        const userRef = doc(db, "usuarios", uid);
        await updateDoc(userRef, { 
            emailVerificado: true,
            fechaVerificacion: new Date()
        });
        
        console.log('✅ Firestore actualizado: emailVerificado = true');
        return true;
        
    } catch (error) {
        console.error('❌ Error al actualizar Firestore:', error);
        return false;
    }
}

/**
 * Procesa la verificación
 */
async function procesarVerificacion(container) {
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const actionCode = urlParams.get('oobCode');
    
    console.log('🔑 Mode:', mode);
    console.log('🔑 Action Code:', actionCode);
    
    // Si no hay actionCode o no es verificación de email
    if (!actionCode || mode !== 'verifyEmail') {
        mostrarError(
            container,
            'El enlace de verificación no es válido. Asegúrate de usar el enlace completo que recibiste en tu correo.',
            false
        );
        return;
    }
    
    try {
        // Primero, obtener información del actionCode
        const actionCodeInfo = await checkActionCode(auth, actionCode);
        const email = actionCodeInfo.data.email;
        console.log('📧 Email a verificar:', email);
        
        // Aplicar la verificación en Firebase Auth
        await applyActionCode(auth, actionCode);
        console.log('✅ Correo verificado en Authentication');
        
        // Actualizar Firestore
        const actualizado = await actualizarFirestorePorEmail(email);
        
        if (actualizado) {
            mostrarExito(container, email);
        } else {
            mostrarError(
                container,
                'Tu correo fue verificado, pero hubo un problema al actualizar tu perfil. Por favor, intenta iniciar sesión o contacta a soporte.',
                false
            );
        }
        
    } catch (error) {
        console.error('❌ Error en verificación:', error);
        
        let mensaje = '';
        let esExpirado = false;
        
        switch (error.code) {
            case 'auth/expired-action-code':
                mensaje = 'El enlace de verificación ha expirado. Los enlaces son válidos por 1 hora. Solicita un nuevo correo desde el inicio de sesión.';
                esExpirado = true;
                break;
            case 'auth/invalid-action-code':
                mensaje = 'El enlace de verificación no es válido. Asegúrate de usar el enlace completo que recibiste en tu correo.';
                esExpirado = false;
                break;
            case 'auth/user-disabled':
                mensaje = 'Tu cuenta ha sido deshabilitada. Contacta a soporte para más información.';
                esExpirado = false;
                break;
            case 'auth/user-not-found':
                mensaje = 'No se encontró una cuenta asociada a este enlace de verificación.';
                esExpirado = false;
                break;
            default:
                mensaje = error.message || 'Ocurrió un error inesperado al verificar tu correo. Intenta nuevamente.';
                esExpirado = false;
        }
        
        mostrarError(container, mensaje, esExpirado);
    }
}