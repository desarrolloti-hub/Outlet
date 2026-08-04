/* ========================================
   CLOUD FUNCTION - Envío de notificaciones
   Reemplaza a server/index.js + sendNotification.js
   Corre en la nube de Firebase: no depende de que
   tengas tu computadora, "npm run dev" ni
   "node server/index.js" prendidos.
   ======================================== */

import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import express from 'express';
import cors from 'cors';

// En Cloud Functions NO necesitas serviceAccountKey.json:
// las credenciales las provee Firebase automáticamente.
initializeApp();
const messaging = getMessaging();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/notifications/send', async (req, res) => {
    const { token, notification, data } = req.body || {};

    if (!token) {
        return res.status(400).json({ message: 'Falta el campo "token"' });
    }
    if (!notification?.title || !notification?.body) {
        return res.status(400).json({ message: 'Falta "notification.title" o "notification.body"' });
    }

    const clickAction = notification.click_action || data?.click_action || '/';

    const message = {
        token,
        notification: { title: notification.title, body: notification.body },
        data: {
            ...Object.fromEntries(
                Object.entries(data || {}).map(([key, value]) => [key, String(value)])
            ),
            click_action: clickAction
        },
        webpush: {
            fcmOptions: { link: clickAction }
        }
    };

    try {
        const messageId = await messaging.send(message);
        console.log('✅ Notificación enviada:', messageId);
        return res.json({ message: 'Notificación enviada correctamente', messageId });
    } catch (error) {
        console.error('❌ Error enviando notificación:', error);

        if (error.code === 'messaging/registration-token-not-registered') {
            return res.status(410).json({ message: 'El token ya no es válido (dispositivo desregistrado)' });
        }
        return res.status(500).json({ message: error.message || 'Error interno al enviar la notificación' });
    }
});

// Se expone como función HTTPS llamada "api".
// El rewrite de firebase.json manda /api/** hacia acá.
export const api = onRequest({ region: 'us-central1' }, app);
