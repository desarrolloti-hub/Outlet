/* ========================================
   SALES REPOSITORY - Outlet Val
   Operaciones CRUD directas con Firebase para ventas
   ======================================== */

import { db } from '../../config/firebaseConfig.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    endBefore
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const SALES_COLLECTION = 'ventas';

export const SalesRepository = {
    // salesRepository.js - corregir método save
    async save(saleData) {
        try {
            // Si no tiene ID, generar uno
            const id = saleData.id || `sale_${Date.now()}`;
            const saleRef = doc(db, SALES_COLLECTION, id);

            // Asegurar que los datos estén limpios
            const dataToSave = {
                ...saleData,
                id: id, // Asegurar que el ID esté en los datos
                updatedAt: new Date().toISOString()
            };

            await setDoc(saleRef, dataToSave);
            console.log('✅ Venta guardada:', { id, orderNumber: saleData.orderNumber });
            return { id, ...dataToSave };
        } catch (error) {
            console.error('Error guardando venta:', error);
            throw new Error(`Error al guardar venta: ${error.message}`);
        }
    },

    /**
     * Obtener venta por ID
     */
    async getById(saleId) {
        try {
            const saleRef = doc(db, SALES_COLLECTION, saleId);
            const docSnap = await getDoc(saleRef);

            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                console.log('📖 Venta obtenida por ID:', { id: data.id, orderNumber: data.orderNumber });
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo venta:', error);
            throw new Error(`Error al obtener venta: ${error.message}`);
        }
    },

    /**
     * Obtener venta por número de orden
     */
    async getByOrderNumber(orderNumber) {
        try {
            const q = query(
                collection(db, SALES_COLLECTION),
                where('orderNumber', '==', orderNumber),
                limit(1)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error buscando venta por número de orden:', error);
            throw new Error(`Error al buscar venta: ${error.message}`);
        }
    },

    /**
     * Obtener ventas por cliente
     */
    async getByCustomerId(customerId, limitCount = 50) {
        try {
            const q = query(
                collection(db, SALES_COLLECTION),
                where('customerId', '==', customerId),
                orderBy('orderDate', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);

            const sales = [];
            querySnapshot.forEach(doc => {
                sales.push({ id: doc.id, ...doc.data() });
            });

            console.log(`📋 Ventas del cliente ${customerId}: ${sales.length}`);
            return sales;
        } catch (error) {
            console.error('Error obteniendo ventas por cliente:', error);
            throw new Error(`Error al obtener ventas: ${error.message}`);
        }
    },

    /**
     * Obtener ventas por estado
     */
    async getByStatus(orderStatus, limitCount = 50) {
        try {
            const q = query(
                collection(db, SALES_COLLECTION),
                where('orderStatus', '==', orderStatus),
                orderBy('orderDate', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);

            const sales = [];
            querySnapshot.forEach(doc => {
                sales.push({ id: doc.id, ...doc.data() });
            });

            console.log(`📋 Ventas con estado ${orderStatus}: ${sales.length}`);
            return sales;
        } catch (error) {
            console.error('Error obteniendo ventas por estado:', error);
            throw new Error(`Error al obtener ventas: ${error.message}`);
        }
    },

    /**
     * Obtener todas las ventas con filtros
     */
    async getAll(filters = {}, sortBy = 'orderDate', sortDir = 'desc', limitCount = 50, lastDoc = null) {
        try {
            let constraints = [];
            const collectionRef = collection(db, SALES_COLLECTION);

            // Filtros
            if (filters.orderStatus) {
                constraints.push(where('orderStatus', '==', filters.orderStatus));
            }
            if (filters.paymentStatus) {
                constraints.push(where('paymentStatus', '==', filters.paymentStatus));
            }
            if (filters.customerId) {
                constraints.push(where('customerId', '==', filters.customerId));
            }

            // Rango de fechas
            if (filters.dateFrom) {
                constraints.push(where('orderDate', '>=', filters.dateFrom));
            }
            if (filters.dateTo) {
                constraints.push(where('orderDate', '<=', filters.dateTo));
            }

            // Ordenamiento
            const orderDirection = sortDir === 'desc' ? 'desc' : 'asc';
            constraints.push(orderBy(sortBy, orderDirection));

            // Paginación
            if (lastDoc) {
                constraints.push(startAfter(lastDoc));
            }
            constraints.push(limit(limitCount));

            const q = query(collectionRef, ...constraints);
            const querySnapshot = await getDocs(q);

            const sales = [];
            let lastVisible = null;

            querySnapshot.forEach(doc => {
                sales.push({ id: doc.id, ...doc.data() });
                lastVisible = doc;
            });

            console.log(`📋 Total ventas obtenidas: ${sales.length}`);
            return {
                items: sales,
                lastDoc: lastVisible,
                hasMore: sales.length === limitCount
            };
        } catch (error) {
            console.error('Error obteniendo ventas:', error);
            throw new Error(`Error al obtener ventas: ${error.message}`);
        }
    },

    /**
     * Obtener ventas por rango de fechas
     */
    async getByDateRange(dateFrom, dateTo, limitCount = 100) {
        try {
            const q = query(
                collection(db, SALES_COLLECTION),
                where('orderDate', '>=', dateFrom),
                where('orderDate', '<=', dateTo),
                orderBy('orderDate', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);

            const sales = [];
            querySnapshot.forEach(doc => {
                sales.push({ id: doc.id, ...doc.data() });
            });

            console.log(`📋 Ventas del ${dateFrom} al ${dateTo}: ${sales.length}`);
            return sales;
        } catch (error) {
            console.error('Error obteniendo ventas por fecha:', error);
            throw new Error(`Error al obtener ventas: ${error.message}`);
        }
    },

    /**
     * Actualizar venta
     */
    async update(saleId, updateData) {
        try {
            const saleRef = doc(db, SALES_COLLECTION, saleId);
            await updateDoc(saleRef, {
                ...updateData,
                updatedAt: new Date().toISOString()
            });

            const updated = await this.getById(saleId);
            console.log('✏️ Venta actualizada:', { id: saleId });
            return updated;
        } catch (error) {
            console.error('Error actualizando venta:', error);
            throw new Error(`Error al actualizar venta: ${error.message}`);
        }
    },

    /**
     * Actualizar estado de la orden
     */
    async updateOrderStatus(saleId, newStatus, note = '') {
        try {
            const saleRef = doc(db, SALES_COLLECTION, saleId);

            // Obtener venta actual para historial
            const current = await this.getById(saleId);
            if (!current) {
                throw new Error('Venta no encontrada');
            }

            const statusHistory = current.statusHistory || [];
            statusHistory.push({
                status: newStatus,
                date: new Date().toISOString(),
                note: note || `Estado cambiado a ${newStatus}`
            });

            const updateData = {
                orderStatus: newStatus,
                statusHistory: statusHistory,
                updatedAt: new Date().toISOString()
            };

            // Actualizar fechas específicas
            if (newStatus === 'enviada' && !current.shippedDate) {
                updateData.shippedDate = new Date().toISOString();
            }
            if (newStatus === 'entregada' && !current.deliveredDate) {
                updateData.deliveredDate = new Date().toISOString();
            }

            await updateDoc(saleRef, updateData);

            const updated = await this.getById(saleId);
            console.log('✏️ Estado de orden actualizado:', { id: saleId, newStatus });
            return updated;
        } catch (error) {
            console.error('Error actualizando estado de orden:', error);
            throw new Error(`Error al actualizar estado: ${error.message}`);
        }
    },

    /**
     * Actualizar estado de pago
     */
    async updatePaymentStatus(saleId, newStatus) {
        try {
            const saleRef = doc(db, SALES_COLLECTION, saleId);

            const updateData = {
                paymentStatus: newStatus,
                updatedAt: new Date().toISOString()
            };

            if (newStatus === 'pagado') {
                updateData.paymentDate = new Date().toISOString();
            }

            await updateDoc(saleRef, updateData);

            const updated = await this.getById(saleId);
            console.log('✏️ Estado de pago actualizado:', { id: saleId, newStatus });
            return updated;
        } catch (error) {
            console.error('Error actualizando estado de pago:', error);
            throw new Error(`Error al actualizar estado de pago: ${error.message}`);
        }
    },

    /**
     * Eliminar venta (hard delete o soft delete)
     */
    async delete(saleId, hardDelete = false) {
        try {
            if (hardDelete) {
                const saleRef = doc(db, SALES_COLLECTION, saleId);
                await deleteDoc(saleRef);
                console.log('🗑️ Venta eliminada permanentemente:', saleId);
                return true;
            } else {
                // Soft delete: cambiar estado a cancelada
                return await this.updateOrderStatus(saleId, 'cancelada', 'Venta cancelada por administrador');
            }
        } catch (error) {
            console.error('Error eliminando venta:', error);
            throw new Error(`Error al eliminar venta: ${error.message}`);
        }
    },

    /**
     * Obtener resumen de ventas para dashboard
     */
    async getSalesSummary(dateFrom, dateTo) {
        try {
            const sales = await this.getByDateRange(dateFrom, dateTo, 1000);

            let totalVentas = 0;
            let totalIngresos = 0;
            let totalDescuentos = 0;
            let totalIva = 0;
            let totalItems = 0;
            let totalClientes = new Set();
            let statusCount = {};
            let paymentStatusCount = {};

            sales.forEach(sale => {
                totalVentas++;
                totalIngresos += sale.total || 0;
                totalDescuentos += sale.descuentoTotal || 0;
                totalIva += sale.iva || 0;
                totalItems += sale.totalItems || 0;

                if (sale.customerId) {
                    totalClientes.add(sale.customerId);
                }

                const status = sale.orderStatus || 'desconocido';
                statusCount[status] = (statusCount[status] || 0) + 1;

                const payment = sale.paymentStatus || 'desconocido';
                paymentStatusCount[payment] = (paymentStatusCount[payment] || 0) + 1;
            });

            return {
                totalVentas,
                totalIngresos,
                totalDescuentos,
                totalIva,
                totalItems,
                totalClientes: totalClientes.size,
                ticketPromedio: totalVentas > 0 ? totalIngresos / totalVentas : 0,
                statusCount,
                paymentStatusCount,
                sales
            };
        } catch (error) {
            console.error('Error obteniendo resumen de ventas:', error);
            throw new Error(`Error al obtener resumen: ${error.message}`);
        }
    }
};