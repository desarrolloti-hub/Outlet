/* ========================================
   NOTIFICATION TEST CONTROLLER
   Vista de pruebas para FCM Notificaciones
   ======================================== */

import { NotificationService } from '../../../services/notificationService.js';

export async function notificationTestController() {
    console.log('🔔 Notification Test Controller iniciado');

    const form = document.getElementById('notificationTestForm');
    const fcmTokenInput = document.getElementById('fcmToken');
    const titleInput = document.getElementById('notificationTitle');
    const bodyInput = document.getElementById('notificationBody');
    const clickActionInput = document.getElementById('clickAction');
    const sendBtn = document.getElementById('sendNotificationBtn');
    const resultContainer = document.getElementById('notificationResult');
    const resultMessage = document.getElementById('resultMessage');
    const closeResultBtn = document.getElementById('closeResultBtn');
    const getTokenBtn = document.getElementById('getDeviceTokenBtn');
    const pasteTokenBtn = document.getElementById('pasteTokenBtn');
    const fillExampleBtn = document.getElementById('fillExampleBtn');
    const fcmStatusDot = document.querySelector('.status-dot');
    const fcmStatusText = document.getElementById('fcmStatusText');

    // Verificar disponibilidad de Firebase Messaging
    checkFCMAvailability();

    // Escuchar notificaciones en foreground para verlas en esta misma vista de pruebas
    NotificationService.listenForegroundMessages((payload) => {
        showToast(`📨 ${payload.notification?.title || 'Notificación'}: ${payload.notification?.body || ''}`, 'success');
    });

    // Evento: Obtener token REAL del dispositivo actual
    if (getTokenBtn) {
        getTokenBtn.addEventListener('click', async () => {
            try {
                showFCMStatus('loading', 'Obteniendo token FCM...');

                const token = await NotificationService.initPush();

                if (token) {
                    fcmTokenInput.value = token;
                    showFCMStatus('connected', '✅ Token obtenido correctamente');
                    showToast('📱 Token FCM obtenido');
                } else {
                    showFCMStatus('error', '❌ No se pudo obtener el token. Revisa la consola para más detalle (permiso denegado, VAPID key faltante, etc.).');
                }
            } catch (error) {
                console.error('❌ Error obteniendo token FCM:', error);
                showFCMStatus('error', '❌ Error: ' + error.message);
            }
        });
    }

    // Evento: Pegar token del portapapeles
    if (pasteTokenBtn) {
        pasteTokenBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text && text.length > 20) {
                    fcmTokenInput.value = text;
                    showToast('📋 Token pegado desde el portapapeles');
                } else {
                    showToast('⚠️ No hay texto válido en el portapapeles', 'warning');
                }
            } catch (error) {
                console.error('❌ Error al pegar:', error);
                showToast('❌ No se pudo acceder al portapapeles', 'error');
            }
        });
    }

    // Evento: Rellenar con ejemplo (solo el texto, ya no un token falso)
    if (fillExampleBtn) {
        fillExampleBtn.addEventListener('click', () => {
            titleInput.value = '🔥 ¡Oferta Flash! 50% OFF';
            bodyInput.value = 'No te pierdas nuestra nueva colección de primavera. Descuentos exclusivos por tiempo limitado.';
            clickActionInput.value = '/products';

            showToast('✨ Ejemplo cargado (usa "Obtener token" para un token real)');
        });
    }

    // Evento: Cerrar resultado
    if (closeResultBtn) {
        closeResultBtn.addEventListener('click', () => {
            resultContainer.style.display = 'none';
        });
    }

    // Evento: Limpiar formulario
    form?.addEventListener('reset', () => {
        resultContainer.style.display = 'none';
        showToast('🧹 Formulario limpiado');
    });

    // Evento: Enviar notificación (llama a tu backend real)
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = fcmTokenInput.value.trim();
        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();
        const clickAction = clickActionInput.value.trim();

        if (!token) {
            showToast('❌ El FCM Token es requerido', 'error');
            fcmTokenInput.focus();
            return;
        }
        if (token.length < 20) {
            showToast('❌ El FCM Token parece inválido (muy corto)', 'error');
            fcmTokenInput.focus();
            return;
        }
        if (!title) {
            showToast('❌ El título es requerido', 'error');
            titleInput.focus();
            return;
        }
        if (!body) {
            showToast('❌ La descripción es requerida', 'error');
            bodyInput.focus();
            return;
        }

        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        resultContainer.style.display = 'none';

        try {
            console.log('📤 Enviando notificación FCM...', { token, title, body, clickAction });

            const response = await sendFCMNotification(token, title, body, clickAction);

            resultContainer.className = 'notification-result';
            resultContainer.style.display = 'flex';
            resultMessage.textContent = response.message || 'Notificación enviada exitosamente';
            showToast('✅ Notificación enviada con éxito', 'success');

        } catch (error) {
            console.error('❌ Error enviando notificación:', error);
            resultContainer.className = 'notification-result error';
            resultContainer.style.display = 'flex';
            resultMessage.textContent = 'Error: ' + (error.message || 'Error desconocido');
            showToast('❌ Error: ' + error.message, 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Notificación';
        }
    });

    // Función para verificar disponibilidad de FCM (ya no depende del SDK compat global)
    function checkFCMAvailability() {
        const supported = 'Notification' in window && 'serviceWorker' in navigator;

        if (supported) {
            showFCMStatus('connected', '✅ FCM disponible. Usa "Obtener token" para generar un token real.');
        } else {
            showFCMStatus('error', '⚠️ Este navegador no soporta notificaciones push.');
        }
    }

    function showFCMStatus(status, message) {
        if (fcmStatusDot) {
            fcmStatusDot.className = 'status-dot';
            if (status === 'loading') fcmStatusDot.classList.add('status-loading');
            if (status === 'connected') fcmStatusDot.classList.add('status-connected');
            if (status === 'error') fcmStatusDot.classList.add('status-error');
        }
        if (fcmStatusText) {
            fcmStatusText.textContent = message;
        }
    }

    // Envía la notificación a TU backend real (ver carpeta /server)
    // Ya NO simula un envío falso si el backend falla: si algo sale mal,
    // se reporta el error real para no ocultar problemas de configuración.
    async function sendFCMNotification(token, title, body, clickAction) {
        const payload = {
            token,
            notification: {
                title,
                body,
                click_action: clickAction || '/'
            },
            data: {
                title,
                body,
                click_action: clickAction || '/',
                timestamp: new Date().toISOString()
            }
        };

        const response = await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return { success: true, message: result.message || 'Notificación enviada' };
    }

    function showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;

        let bgColor = '#1f1b13';
        if (type === 'success') bgColor = '#2e7d32';
        if (type === 'error') bgColor = '#ba1a1a';
        if (type === 'warning') bgColor = '#f59e0b';

        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: ${bgColor}; color: white;
            padding: 12px 24px; border-radius: 40px; font-size: 13px;
            z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border-left: 3px solid #ddab3b;
            animation: slideUp 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    console.log('✅ Notification Test Controller listo');
}