/* ========================================
   ENVÍO DE NOTIFICACIONES - Firebase Admin SDK
   Usa las rutas modulares (firebase-admin/app,
   firebase-admin/messaging) porque este proyecto
   es ESM ("type": "module" en package.json).
   El import "import admin from 'firebase-admin'"
   NO funciona bien con ESM en versiones recientes.
   ======================================== */

import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { readFileSync } from 'fs';

// ⚠️ Descarga este archivo desde:
// Firebase Console > Project settings > Service accounts > Generate new private key
// y colócalo en esta misma carpeta (server/serviceAccountKey.json).
// NUNCA lo subas a git (ya viene protegido en .gitignore).
const serviceAccount = JSON.parse(
    readFileSync(new URL('./serviceAccountKey.json', import.meta.url))
);

const app = initializeApp({
    credential: cert(serviceAccount)
});

const messaging = getMessaging(app);

/**
 * Envía una notificación push a un token específico.
 */
export async function sendNotification({ token, title, body, clickAction, data = {} }) {
    const message = {
        token,
        notification: { title, body },
        // Los valores de "data" deben ser strings
        data: {
            ...Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, String(value)])
            ),
            click_action: clickAction || '/'
        },
        webpush: {
            fcmOptions: {
                link: clickAction || '/'
            }
        }
    };

    const messageId = await messaging.send(message);
    console.log('✅ Notificación enviada:', messageId);
    return messageId;
}