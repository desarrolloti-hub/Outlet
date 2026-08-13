/* ========================================
   FCM TOKEN REPOSITORY - Outlet Val
   Guarda y gestiona tokens de notificaciones push
   directamente dentro del documento del usuario
   (colección "clientes" o "administradores"),
   en un campo `fcmTokens` (arreglo).
   Ya NO se usa una colección aparte "fcmTokens".
   ======================================== */

import { db } from '../../config/firebaseConfig.js';
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const CUSTOMERS_COLLECTION = 'clientes';
const ADMINS_COLLECTION = 'administradores';

/**
 * Resuelve el nombre de la colección según el rol del usuario.
 * Por defecto se asume 'customer' (colección "clientes").
 */
function getCollectionName(role) {
    return role === 'admin' ? ADMINS_COLLECTION : CUSTOMERS_COLLECTION;
}

export const FcmTokenRepository = {
    /**
     * Guarda un token FCM en el documento del usuario (clientes/administradores).
     * Un mismo usuario puede tener varios tokens (uno por dispositivo/navegador),
     * por eso se guardan en un arreglo `fcmTokens` y se usa arrayUnion para no duplicar.
     *
     * @param {string} userId - id del documento del cliente/admin (mismo id que Auth uid)
     * @param {string} token - token FCM a guardar
     * @param {'customer'|'admin'} [role='customer'] - determina en qué colección se guarda
     */
    async saveToken(userId, token, role = 'customer') {
        if (!userId || !token) {
            throw new Error('userId y token son requeridos para guardar el token FCM');
        }

        const collectionName = getCollectionName(role);

        try {
            const userRef = doc(db, collectionName, userId);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                console.warn(`⚠️ No existe documento en "${collectionName}/${userId}", no se puede guardar el token FCM`);
                return;
            }

            await updateDoc(userRef, {
                fcmTokens: arrayUnion(token),
                fcmTokensUpdatedAt: serverTimestamp()
            });

            console.log(`✅ Token FCM guardado en ${collectionName}/${userId}`);
        } catch (error) {
            console.error('❌ Error guardando token FCM:', error);
            throw new Error(`Error al guardar token FCM: ${error.message}`);
        }
    },

    /**
     * Obtiene todos los tokens FCM guardados de un usuario.
     * Útil desde el backend/admin para saber a qué dispositivos enviarle la notificación.
     *
     * @param {string} userId
     * @param {'customer'|'admin'} [role='customer']
     */
    async getTokensByUser(userId, role = 'customer') {
        const collectionName = getCollectionName(role);
        try {
            const userRef = doc(db, collectionName, userId);
            const docSnap = await getDoc(userRef);
            return docSnap.exists() ? (docSnap.data().fcmTokens || []) : [];
        } catch (error) {
            console.error('❌ Error obteniendo tokens FCM:', error);
            return [];
        }
    },

    /**
     * Elimina un token específico, por ejemplo al cerrar sesión en ese dispositivo
     * (evita seguir mandando notificaciones a un dispositivo donde el usuario ya salió).
     *
     * @param {string} userId
     * @param {string} token
     * @param {'customer'|'admin'} [role='customer']
     */
    async removeToken(userId, token, role = 'customer') {
        if (!userId || !token) return;
        const collectionName = getCollectionName(role);
        try {
            const userRef = doc(db, collectionName, userId);
            await updateDoc(userRef, {
                fcmTokens: arrayRemove(token),
                fcmTokensUpdatedAt: serverTimestamp()
            });
            console.log(`🗑️ Token FCM eliminado de ${collectionName}/${userId}`);
        } catch (error) {
            console.error('❌ Error eliminando token FCM:', error);
        }
    }
};