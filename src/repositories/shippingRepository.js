/* ========================================
   SHIPPING REPOSITORY - Outlet Val
   Operaciones CRUD para envíos en Firestore
   ======================================== */

import { db } from '../../config/firebaseConfig.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    updateDoc,
    deleteDoc,
    addDoc,
    Timestamp,
    writeBatch,
    runTransaction
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { Shipping } from '../classes/shippingModel.js';

const COLLECTION = 'shippings';

export const ShippingRepository = {
    /**
     * Guardar nuevo envío
     */
    async save(shippingData) {
        const docRef = await addDoc(collection(db, COLLECTION), {
            ...shippingData,
            createdAt: Timestamp.fromDate(new Date(shippingData.createdAt)),
            updatedAt: Timestamp.fromDate(new Date(shippingData.updatedAt || shippingData.createdAt)),
            shippedDate: shippingData.shippedDate ? Timestamp.fromDate(new Date(shippingData.shippedDate)) : null,
            estimatedDelivery: shippingData.estimatedDelivery ? Timestamp.fromDate(new Date(shippingData.estimatedDelivery)) : null,
            deliveredDate: shippingData.deliveredDate ? Timestamp.fromDate(new Date(shippingData.deliveredDate)) : null,
            returnDate: shippingData.returnDate ? Timestamp.fromDate(new Date(shippingData.returnDate)) : null
        });
        return { id: docRef.id, ...shippingData };
    },

    /**
     * Obtener envío por ID
     */
    async getById(shippingId) {
        const docRef = doc(db, COLLECTION, shippingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...this._convertTimestamps(data)
            };
        }
        return null;
    },

    /**
     * Obtener envío por número de envío
     */
    async getByShipmentNumber(shipmentNumber) {
        const q = query(
            collection(db, COLLECTION),
            where('shipmentNumber', '==', shipmentNumber),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }
        let data = null;
        snapshot.forEach(doc => {
            data = { id: doc.id, ...this._convertTimestamps(doc.data()) };
        });
        return data;
    },

    /**
     * Obtener envíos por ID de venta
     */
    async getBySaleId(saleId) {
        const q = query(
            collection(db, COLLECTION),
            where('saleId', '==', saleId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const items = [];
        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...this._convertTimestamps(doc.data()) });
        });
        return items;
    },

    /**
     * Obtener todos los envíos con filtros y paginación
     */
    async getAll(filters = {}, sortBy = 'createdAt', sortDir = 'desc', limitCount = 20, startAfterDoc = null) {
        let q = query(collection(db, COLLECTION));

        // Aplicar filtros
        if (filters.status) {
            q = query(q, where('status', '==', filters.status));
        }
        if (filters.carrier) {
            q = query(q, where('carrier', '==', filters.carrier));
        }
        if (filters.customerId) {
            q = query(q, where('customerId', '==', filters.customerId));
        }
        if (filters.saleId) {
            q = query(q, where('saleId', '==', filters.saleId));
        }
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            q = query(q, where('createdAt', '>=', Timestamp.fromDate(fromDate)));
        }
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            q = query(q, where('createdAt', '<=', Timestamp.fromDate(toDate)));
        }

        // Ordenar
        q = query(q, orderBy(sortBy, sortDir));

        // Paginación
        if (startAfterDoc) {
            q = query(q, startAfter(startAfterDoc));
        }

        q = query(q, limit(limitCount));

        const snapshot = await getDocs(q);
        const items = [];
        let lastDoc = null;

        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...this._convertTimestamps(doc.data()) });
            lastDoc = doc;
        });

        return {
            items,
            lastDoc,
            hasMore: items.length === limitCount
        };
    },

    /**
     * Actualizar envío
     */
    async update(shippingId, updateData) {
        const docRef = doc(db, COLLECTION, shippingId);

        // Convertir fechas si existen
        const firestoreData = {};
        Object.keys(updateData).forEach(key => {
            if (key === 'shippedDate' || key === 'estimatedDelivery' || key === 'deliveredDate' || key === 'returnDate') {
                if (updateData[key]) {
                    firestoreData[key] = Timestamp.fromDate(new Date(updateData[key]));
                } else {
                    firestoreData[key] = null;
                }
            } else {
                firestoreData[key] = updateData[key];
            }
        });

        firestoreData.updatedAt = Timestamp.now();

        await updateDoc(docRef, firestoreData);

        const updatedDoc = await getDoc(docRef);
        return { id: updatedDoc.id, ...this._convertTimestamps(updatedDoc.data()) };
    },

    /**
     * Actualizar estado del envío
     */
    async updateStatus(shippingId, newStatus, note = '') {
        const docRef = doc(db, COLLECTION, shippingId);

        const updateData = {
            status: newStatus,
            updatedAt: Timestamp.now()
        };

        // Agregar fecha según estado
        if (newStatus === 'enviado') {
            updateData.shippedDate = Timestamp.now();
        }
        if (newStatus === 'entregado') {
            updateData.deliveredDate = Timestamp.now();
        }
        if (newStatus === 'devuelto') {
            updateData.returnDate = Timestamp.now();
        }

        // Agregar al historial de estados
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const statusHistory = data.statusHistory || [];
            statusHistory.push({
                status: newStatus,
                date: Timestamp.now(),
                note: note
            });
            updateData.statusHistory = statusHistory;
        }

        await updateDoc(docRef, updateData);

        const updatedDoc = await getDoc(docRef);
        return { id: updatedDoc.id, ...this._convertTimestamps(updatedDoc.data()) };
    },

    /**
     * Actualizar tracking
     */
    async updateTracking(shippingId, trackingNumber, carrier = null) {
        const docRef = doc(db, COLLECTION, shippingId);

        const updateData = {
            trackingNumber: trackingNumber,
            updatedAt: Timestamp.now()
        };

        if (carrier) {
            updateData.carrier = carrier;
        }

        // Agregar al historial de tracking
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const trackingHistory = data.trackingHistory || [];
            trackingHistory.push({
                location: 'Sistema',
                status: 'actualizado',
                date: Timestamp.now(),
                description: `Número de tracking actualizado: ${trackingNumber}`
            });
            updateData.trackingHistory = trackingHistory;
        }

        await updateDoc(docRef, updateData);

        const updatedDoc = await getDoc(docRef);
        return { id: updatedDoc.id, ...this._convertTimestamps(updatedDoc.data()) };
    },

    /**
     * ELIMINAR ENVÍO PERMANENTEMENTE DE FIRESTORE
     */
    async delete(shippingId) {
        const docRef = doc(db, COLLECTION, shippingId);

        // Verificar que existe antes de eliminar
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error('El envío no existe en la base de datos');
        }

        // Eliminar el documento
        await deleteDoc(docRef);

        return {
            success: true,
            id: shippingId,
            message: 'Envío eliminado permanentemente de la base de datos'
        };
    },

    /**
     * Obtener estadísticas rápidas de envíos
     */
    async getQuickStats() {
        const q = query(
            collection(db, COLLECTION),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        let total = 0;
        let pendiente = 0;
        let en_transito = 0;
        let entregado = 0;
        let fallido = 0;
        let devuelto = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            total++;

            switch (data.status) {
                case 'pendiente':
                case 'preparando':
                    pendiente++;
                    break;
                case 'enviado':
                case 'en_transito':
                    en_transito++;
                    break;
                case 'entregado':
                    entregado++;
                    break;
                case 'fallido':
                    fallido++;
                    break;
                case 'devuelto':
                    devuelto++;
                    break;
            }
        });

        return {
            total,
            pendiente,
            en_transito,
            entregado,
            fallido,
            devuelto
        };
    },

    /**
     * Obtener el último número de envío del día
     */
    async getLastShipmentOfDay(prefix) {
        const q = query(
            collection(db, COLLECTION),
            where('shipmentNumber', '>=', prefix),
            where('shipmentNumber', '<', `${prefix}-9999`),
            orderBy('shipmentNumber', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }

        let lastShipment = null;
        snapshot.forEach(doc => {
            lastShipment = { id: doc.id, ...this._convertTimestamps(doc.data()) };
        });
        return lastShipment;
    },

    /**
     * Contar envíos por estado
     */
    async countByStatus(status) {
        const q = query(
            collection(db, COLLECTION),
            where('status', '==', status)
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    },

    /**
     * Convertir Timestamps de Firestore a fechas JS
     */
    _convertTimestamps(data) {
        const result = { ...data };
        const timestampFields = ['createdAt', 'updatedAt', 'shippedDate', 'estimatedDelivery', 'deliveredDate', 'returnDate'];

        timestampFields.forEach(field => {
            if (result[field] && typeof result[field].toDate === 'function') {
                result[field] = result[field].toDate().toISOString();
            }
            if (result[field] && typeof result[field] === 'object' && result[field].seconds) {
                result[field] = new Date(result[field].seconds * 1000).toISOString();
            }
        });

        // Convertir historiales
        if (result.statusHistory && Array.isArray(result.statusHistory)) {
            result.statusHistory = result.statusHistory.map(item => ({
                ...item,
                date: item.date && typeof item.date.toDate === 'function'
                    ? item.date.toDate().toISOString()
                    : item.date
            }));
        }

        if (result.trackingHistory && Array.isArray(result.trackingHistory)) {
            result.trackingHistory = result.trackingHistory.map(item => ({
                ...item,
                date: item.date && typeof item.date.toDate === 'function'
                    ? item.date.toDate().toISOString()
                    : item.date
            }));
        }

        return result;
    }
};