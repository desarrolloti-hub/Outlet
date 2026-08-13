/* ========================================
   FIREBASE CONFIGURATION - Outlet Val
   ======================================== */

// Todo el SDK debe venir del mismo CDN y misma versión
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js';
import {
    getMessaging,
    getToken,
    onMessage,
    isSupported
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js';

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD-SR-t4CcwHwblmHr8P-2xU6L2KHkdbW4",
    authDomain: "otril-mx.firebaseapp.com",
    projectId: "otril-mx",
    storageBucket: "otril-mx.firebasestorage.app",
    messagingSenderId: "37416439692",
    appId: "1:37416439692:web:9f431322dcd03800d1d0a9",
    measurementId: "G-YQEE57QYDW"
};

// Inicializar Firebase
let app;
let db;
let storage;
let auth;
let analytics;
let messaging; // minúscula, por convención (las variables no se capitalizan)

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

// Analytics aparte: puede fallar por adblockers, no debe tumbar el resto
try {
    analytics = getAnalytics(app);
} catch (error) {
    console.warn('⚠️ Analytics no disponible:', error.message);
}

// Messaging aparte: no todos los navegadores lo soportan
isSupported().then((supported) => {
    if (supported) {
        messaging = getMessaging(app);
        console.log('✅ Firebase Messaging inicializado');
    } else {
        console.warn('⚠️ Este navegador no soporta Firebase Messaging');
    }
}).catch((error) => {
    console.error('❌ Error verificando soporte de Messaging:', error);
});

// VAPID key (Web Push certificate) — usada por notificationService.js para
// generar tokens FCM con getToken(). Firebase Console > Project settings >
// Cloud Messaging > Web Push certificates.
// (Antes solo existía en src/config/firebaseConfig.js, un archivo duplicado
// que ningún módulo del proyecto importa, así que getToken() nunca la
// encontraba y fallaba en silencio.)
export const VAPID_KEY = 'BOf7dexQ6Fa_IpMWXTuscTrzAssL9XYCXeFMbA6zd_pULyM1PsulCNYznf0e5vKxnGkpHJpLfxLUnRirPrTGwLQ';

// Exportar servicios
export { app, db, storage, auth, analytics, messaging, getToken, onMessage };