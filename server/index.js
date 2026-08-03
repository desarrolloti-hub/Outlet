/* ========================================
   SERVIDOR DE NOTIFICACIONES - Outlet Val
   Expone POST /api/notifications/send
   Este servidor corre APARTE del frontend (Vite).
   ======================================== */

import express from 'express';
import cors from 'cors';
import { sendNotification } from './sendNotification.js';

const app = express();
const PORT = process.env.PORT || 3000;

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

    try {
        const messageId = await sendNotification({
            token,
            title: notification.title,
            body: notification.body,
            clickAction: notification.click_action || data?.click_action || '/',
            data: data || {}
        });

        return res.json({ message: 'Notificación enviada correctamente', messageId });
    } catch (error) {
        console.error('❌ Error enviando notificación:', error);

        // Token inválido o expirado: útil para que el frontend lo detecte y lo borre
        if (error.code === 'messaging/registration-token-not-registered') {
            return res.status(410).json({ message: 'El token ya no es válido (dispositivo desregistrado)' });
        }

        return res.status(500).json({ message: error.message || 'Error interno al enviar la notificación' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de notificaciones corriendo en http://localhost:${PORT}`);
});
