/* ========================================
   NOTIFICATION SERVICE - Outlet Val
   Orquesta permisos del navegador, obtención del
   token FCM y mensajes recibidos en foreground.
   ======================================== */

import { messaging, getToken, onMessage } from '../../config/firebaseConfig.js';
import { FcmTokenRepository } from '../repositories/fcmTokenRepository.js';
import { AuthService } from './authService.js';

// ⚠️ IMPORTANTE: reemplaza este valor con tu VAPID key real.
// Se genera en: Firebase Console > Project settings > Cloud Messaging
//               > Web Push certificates > Generate key pair
const VAPID_KEY = 'BOf7dexQ6Fa_IpMWXTuscTrzAssL9XYCXeFMbA6zd_pULyM1PsulCNYznf0e5vKxnGkpHJpLfxLUnRirPrTGwLQ';

export const NotificationService = {
    /**
     * Pide permiso de notificaciones al usuario y, si lo concede,
     * obtiene el token FCM y lo guarda en Firestore (si hay usuario logueado).
     * Llamar esto desde un clic del usuario (botón "Activar notificaciones"),
     * NO automáticamente al cargar la página — los navegadores penalizan
     * los prompts de permisos no solicitados.
     */
    async initPush() {
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

            if (VAPID_KEY === 'TU_VAPID_KEY_AQUI') {
                console.error('❌ Falta configurar la VAPID_KEY real en notificationService.js');
                return null;
            }

            // Reutiliza el Service Worker ya registrado en main.js
            // (registerServiceWorker registra '/firebase-messaging-sw.js')
            const registration = await navigator.serviceWorker.ready;

            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            });

            if (!token) {
                console.warn('⚠️ No se pudo generar el token FCM');
                return null;
            }

            console.log('📱 Token FCM obtenido:', token);

            const userId = this._getCurrentUserId();
            if (userId) {
                await FcmTokenRepository.saveToken(userId, token);
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
     * Obtiene el id del usuario logueado actual (admin o cliente),
     * reutilizando las sesiones que ya maneja tu AuthService.
     */
    _getCurrentUserId() {
        try {
            const role = AuthService.getUserRoleSync();
            if (role === 'guest') return null;

            const storageKey = role === 'admin' ? 'outlet_admin' : 'outlet_customer';
            const stored = localStorage.getItem(storageKey);
            const data = stored ? JSON.parse(stored) : null;
            return data?.id || null;
        } catch (error) {
            console.error('❌ Error obteniendo el usuario actual:', error);
            return null;
        }
    }
};
