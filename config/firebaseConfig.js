/* ========================================
   FIREBASE CONFIGURATION - Outlet Val
   ======================================== */

// Usar URLs CDN (más estable para build)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js';

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

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    analytics = getAnalytics(app);
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

// Exportar servicios
export { app, db, storage, auth, analytics };