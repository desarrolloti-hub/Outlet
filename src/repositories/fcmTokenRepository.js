/* ========================================
   FCM TOKEN REPOSITORY - Outlet Val
   Guarda y gestiona tokens de notificaciones push
   Sigue el mismo patrón que customerRepository.js
   ======================================== */

import { db } from '../../config/firebaseConfig.js';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const FCM_TOKENS_COLLECTION = 'fcmTokens';

export const FcmTokenRepository = {
    /**
     * Guarda un token FCM para un usuario (admin o cliente).
     * Un mismo usuario puede tener varios tokens (uno por dispositivo/navegador),
     * por eso se guardan en un arreglo y se usa arrayUnion para no duplicar.
     */
    async saveToken(userId, token) {
        if (!userId || !token) {
            throw new Error('userId y token son requeridos para guardar el token FCM');
        }

        try {
            const tokenRef = doc(db, FCM_TOKENS_COLLECTION, userId);
            const docSnap = await getDoc(tokenRef);

            if (docSnap.exists()) {
                await updateDoc(tokenRef, {
                    tokens: arrayUnion(token),
                    updatedAt: serverTimestamp()
                });
            } else {
                await setDoc(tokenRef, {
                    userId,
                    tokens: [token],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }

            console.log('✅ Token FCM guardado para usuario:', userId);
        } catch (error) {
            console.error('❌ Error guardando token FCM:', error);
            throw new Error(`Error al guardar token FCM: ${error.message}`);
        }
    },

    /**
     * Obtiene todos los tokens FCM guardados de un usuario.
     * Útil desde el backend para saber a qué dispositivos enviarle la notificación.
     */
    async getTokensByUser(userId) {
        try {
            const tokenRef = doc(db, FCM_TOKENS_COLLECTION, userId);
            const docSnap = await getDoc(tokenRef);
            return docSnap.exists() ? (docSnap.data().tokens || []) : [];
        } catch (error) {
            console.error('❌ Error obteniendo tokens FCM:', error);
            return [];
        }
    },

    /**
     * Elimina un token específico, por ejemplo al cerrar sesión en ese dispositivo
     * (evita seguir mandando notificaciones a un dispositivo donde el usuario ya salió).
     */
    async removeToken(userId, token) {
        if (!userId || !token) return;
        try {
            const tokenRef = doc(db, FCM_TOKENS_COLLECTION, userId);
            await updateDoc(tokenRef, {
                tokens: arrayRemove(token),
                updatedAt: serverTimestamp()
            });
            console.log('🗑️ Token FCM eliminado para usuario:', userId);
        } catch (error) {
            console.error('❌ Error eliminando token FCM:', error);
        }
    }
};
