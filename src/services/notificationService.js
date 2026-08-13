/* ========================================
   NOTIFICATION SERVICE - Outlet Val
   Orquesta permisos del navegador, obtención del
   token FCM y mensajes recibidos en foreground.
   ======================================== */

import { messaging, getToken, onMessage } from '../../config/firebaseConfig.js';
import { FcmTokenRepository } from '../repositories/fcmTokenRepository.js';
import { AuthService } from './authService.js';

/* VAPID_KEY is exported from src/config/firebaseConfig.js — replace it there with your Web Push certificate key from Firebase Console (Project settings > Cloud Messaging > Web Push certificates) */

export const NotificationService = {
    /**
     * Pide permiso de notificaciones al usuario y, si lo concede,
     * obtiene el token FCM y lo guarda en Firestore (si hay usuario logueado).
     * Llamar esto desde un clic del usuario (botón "Activar notificaciones"),
     * NO automáticamente al cargar la página — los navegadores penalizan
     * los prompts de permisos no solicitados.
     *
     * @param {string} [userId] - id explícito del cliente/admin al que guardar el
     *   token. Úsalo justo después de un registro/login, cuando todavía no existe
     *   sesión guardada en localStorage (p. ej. AuthService aún no la escribió).
     *   Si se omite, se intenta detectar automáticamente con la sesión actual.
     * @param {'customer'|'admin'} [role] - rol del userId anterior, para saber en
     *   qué colección de Firestore guardar el token ("clientes" o "administradores").
     */
    async initPush(userId = null, role = null) {
        if (!('Notification' in window)) {
            console.warn('⚠️ Este navegador no soporta notificaciones');
            return null;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('⚠️ Permiso de notificaciones denegado por el usuario');
                return null;
            }

            if (!messaging) {
                console.warn('⚠️ Firebase Messaging no está disponible en este navegador/contexto');
                return null;
            }

            // Cargar la VAPID_KEY en tiempo de ejecución para evitar problemas de bundling
            const fbCfg = await import('../../config/firebaseConfig.js');
            const runtimeVapid = fbCfg?.VAPID_KEY;

            if (!runtimeVapid || runtimeVapid === 'TU_VAPID_KEY_AQUI') {
                console.error('❌ Falta configurar la VAPID_KEY real en src/config/firebaseConfig.js');
                return null;
            }

            // Reutiliza el Service Worker ya registrado en main.js
            // (registerServiceWorker registra '/firebase-messaging-sw.js')
            const registration = await navigator.serviceWorker.ready;

            const token = await getToken(messaging, {
                vapidKey: runtimeVapid,
                serviceWorkerRegistration: registration
            });

            if (!token) {
                console.warn('⚠️ No se pudo generar el token FCM');
                return null;
            }

            console.log('📱 Token FCM obtenido:', token);

            // Si no nos pasaron un userId/role explícito, intentamos detectarlo
            // a partir de la sesión guardada (AuthService / localStorage).
            let targetUserId = userId;
            let targetRole = role;
            if (!targetUserId) {
                const current = this._getCurrentUser();
                targetUserId = current?.id || null;
                targetRole = current?.role || null;
            }

            if (targetUserId) {
                await FcmTokenRepository.saveToken(targetUserId, token, targetRole || 'customer');
            } else {
                console.log('ℹ️ No hay usuario logueado: el token no se guarda en Firestore');
            }

            return token;
        } catch (error) {
            console.error('❌ Error inicializando notificaciones push:', error);
            return null;
        }
    },

    /**
     * Escucha mensajes que llegan mientras la pestaña está ABIERTA (foreground).
     * Los mensajes en background/cerrado los maneja firebase-messaging-sw.js.
     *
     * Uso: NotificationService.listenForegroundMessages(payload => { ... });
     */
    listenForegroundMessages(onNotification) {
        if (!messaging) return;

        onMessage(messaging, (payload) => {
            console.log('📨 Mensaje recibido en foreground:', payload);
            if (typeof onNotification === 'function') {
                onNotification(payload);
            }
        });
    },

    /**
     * Obtiene el id y rol del usuario logueado actual (admin o cliente),
     * reutilizando las sesiones que ya maneja tu AuthService.
     */
    _getCurrentUser() {
        try {
            const role = AuthService.getUserRoleSync();
            if (role === 'guest') return null;

            const storageKey = role === 'admin' ? 'outlet_admin' : 'outlet_customer';
            const stored = localStorage.getItem(storageKey);
            const data = stored ? JSON.parse(stored) : null;
            if (!data?.id) return null;

            return { id: data.id, role };
        } catch (error) {
            console.error('❌ Error obteniendo el usuario actual:', error);
            return null;
        }
    }
};