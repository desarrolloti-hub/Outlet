// ========================================
// SERVICE WORKER - OUTLET
// Para notificaciones push con Firebase
// ========================================

// 🔥 CONFIGURACIÓN DE FIREBASE (OUTLET)
const firebaseConfig = {
    apiKey: "AIzaSyD-SR-t4CcwHwblmHr8P-2xU6L2KHkdbW4",
    authDomain: "otril-mx.firebaseapp.com",
    projectId: "otril-mx",
    storageBucket: "otril-mx.firebasestorage.app",
    messagingSenderId: "37416439692",
    appId: "1:37416439692:web:9f431322dcd03800d1d0a9",
    measurementId: "G-YQEE57QYDW"
};

// Importar Firebase (usando compat para SW)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ============================================
// MANEJAR NOTIFICACIONES EN SEGUNDO PLANO
// ============================================

messaging.onBackgroundMessage(function(payload) {
    console.log('[SW] 📨 Notificación en background:', payload);

    const notificationTitle = payload.notification?.title || 'OUTLET';
    const notificationOptions = {
        body: payload.notification?.body || 'Nueva notificación',
        icon: '/assets/iconos/outlet_lineado_negro.png',
        badge: '/assets/iconos/outlet_lineado_negro.png',
        data: payload.data || {},
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Cerrar' }
        ],
        tag: 'outlet-notification-' + Date.now(),
        requireInteraction: true
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================
// MANEJAR CLIC EN NOTIFICACIÓN
// ============================================

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const data = event.notification.data || {};
    const urlToOpen = data.click_action || data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                for (let client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(urlToOpen);
            })
    );
});

// ============================================
// EVENTOS BÁSICOS DEL SERVICE WORKER
// ============================================

self.addEventListener('install', function(event) {
    console.log('[SW] ✅ Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('[SW] ✅ Service Worker activado');
    return self.clients.claim();
});

console.log('[SW] 🔥 Service Worker de OUTLET cargado');