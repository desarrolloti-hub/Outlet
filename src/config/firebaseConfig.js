/* ========================================
   Firebase client configuration centralizada
   - Exporta: firebaseConfig, app, db, auth, storage, messaging,
     getToken (re-export), onMessage (re-export), VAPID_KEY
   - Mantener la VAPID_KEY actualizada con la clave Web Push
   ======================================== */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';
import { getMessaging, getToken as _getToken, onMessage as _onMessage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js';

// ============================================
// CONFIGURACIÓN PÚBLICA DEL PROYECTO (WEB)
// Puedes reemplazar estos valores si los tienes en otro lugar.
// Estos valores vienen del service worker público incluido en /public.
// ============================================
export const firebaseConfig = {
    apiKey: "AIzaSyD-SR-t4CcwHwblmHr8P-2xU6L2KHkdbW4",
    authDomain: "otril-mx.firebaseapp.com",
    projectId: "otril-mx",
    storageBucket: "otril-mx.firebasestorage.app",
    messagingSenderId: "37416439692",
    appId: "1:37416439692:web:9f431322dcd03800d1d0a9",
    measurementId: "G-YQEE57QYDW"
};

// ============================================
// Inicializar la app de Firebase (cliente)
// ============================================
const app = initializeApp(firebaseConfig);

// Firestore, Auth y Storage (módulos utilizados por el proyecto)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Messaging (solo disponible en el navegador)
let messaging = null;
try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
        messaging = getMessaging(app);
    }
} catch (error) {
    // En entornos no-browser esto fallará; dejar messaging en null
    console.warn('⚠️ Firebase Messaging no pudo inicializarse en este entorno:', error);
}

export { messaging };

// Re-exportar helpers usados en el código (getToken, onMessage)
export const getToken = (...args) => _getToken(...args);
export const onMessage = (...args) => _onMessage(...args);

// VAPID key placeholder: reemplázala por la clave Web Push de Firebase Console
// Firebase Console > Project settings > Cloud Messaging > Web Push certificates
export const VAPID_KEY = 'BOf7dexQ6Fa_IpMWXTuscTrzAssL9XYCXeFMbA6zd_pULyM1PsulCNYznf0e5vKxnGkpHJpLfxLUnRirPrTGwLQ';

// Exportar app por si alguna parte la necesita
export default app;
