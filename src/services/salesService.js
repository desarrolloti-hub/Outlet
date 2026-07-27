/* ========================================
   SALES SERVICE - Outlet Val
   Lógica de negocio para ventas
   ======================================== */

import { Sale } from '../classes/salesModel.js';
import { SalesRepository } from '../repositories/salesRepository.js';
import { ProductService } from '../services/productService.js';
import { CacheService, STORES } from '../services/cacheService.js';

export const SalesService = {
    /**
     * Crear nueva venta
     */
    async create(saleData, adminUserId = null) {
        // ========== VALIDACIONES ==========
        if (!saleData.customerId && !saleData.customerName) {
            throw new Error('Cliente requerido (ID o nombre)');
        }

        if (!saleData.items || saleData.items.length === 0) {
            throw new Error('La venta debe tener al menos un producto');
        }

        // 🔥 VALIDAR QUE TODOS LOS ITEMS TENGAN PRECIO
        for (const item of saleData.items) {
            const precioFinal = parseFloat(item.precioFinal || item.precioVenta || item.price || 0);
            if (precioFinal <= 0) {
                throw new Error(`El producto "${item.productName || item.productId}" no tiene un precio válido`);
            }
            // Asignar precioFinal si no existe
            if (!item.precioFinal) {
                item.precioFinal = precioFinal;
            }
            if (!item.precioUnitario) {
                item.precioUnitario = precioFinal;
            }
            // Asegurar cantidad
            if (!item.cantidad || item.cantidad <= 0) {
                item.cantidad = 1;
            }
        }

        // Validar stock de productos
        for (const item of saleData.items) {
            if (!item.productId) {
                throw new Error(`Item sin ID de producto`);
            }

            const hasStock = await ProductService.hasStock(item.productId, item.cantidad);
            if (!hasStock) {
                throw new Error(`Stock insuficiente para ${item.productName || item.productId}`);
            }
        }

        // ========== CREAR MODELO ==========
        const sale = new Sale({
            orderNumber: Sale.generateOrderNumber(),
            customerId: saleData.customerId || null,
            customerName: saleData.customerName || 'Cliente',
            customerEmail: saleData.customerEmail || '',
            items: saleData.items,
            shippingAddress: saleData.shippingAddress || {},
            shippingMethod: saleData.shippingMethod || 'estandar',
            shippingCost: parseFloat(saleData.shippingCost) || 0,
            paymentMethod: saleData.paymentMethod || 'efectivo',
            paymentStatus: saleData.paymentStatus || 'pendiente',
            orderStatus: saleData.orderStatus || 'confirmada',
            notes: saleData.notes || '',
            createdBy: adminUserId
        });

        // 🔥 GENERAR ID PARA FIRESTORE
        sale.id = `venta_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // 🔥 VERIFICAR QUE EL TOTAL SEA VÁLIDO
        if (sale.total <= 0) {
            console.error('❌ Error: Total calculado es 0 o negativo');
            console.error('Items:', JSON.stringify(saleData.items, null, 2));
            console.error('Subtotal calculado:', sale.subtotal);
            console.error('Total calculado:', sale.total);
            throw new Error('El total de la venta debe ser mayor a 0. Verifica que los productos tengan precios válidos.');
        }

        // Validar modelo
        const validation = sale.validate();
        if (!validation.valido) {
            throw new Error(`Datos inválidos: ${validation.errores.join(', ')}`);
        }

        // ========== REDUCIR STOCK ==========
        try {
            for (const item of sale.items) {
                await ProductService.updateStock(item.productId, -item.cantidad);
            }
        } catch (error) {
            console.error('Error reduciendo stock:', error);
            throw new Error(`Error al reducir stock: ${error.message}`);
        }

        // ========== CONVERTIR A OBJETO PLANO ==========
        const salePlain = {
            id: sale.id,
            orderNumber: sale.orderNumber,
            orderDate: sale.orderDate,
            customerId: sale.customerId,
            customerName: sale.customerName,
            customerEmail: sale.customerEmail,
            items: sale.items,
            totalItems: sale.totalItems,
            subtotal: sale.subtotal,
            descuentoTotal: sale.descuentoTotal,
            iva: sale.iva,
            total: sale.total,
            shippingAddress: sale.shippingAddress,
            shippingMethod: sale.shippingMethod,
            shippingCost: sale.shippingCost,
            paymentMethod: sale.paymentMethod,
            paymentStatus: sale.paymentStatus,
            paymentDate: sale.paymentDate,
            orderStatus: sale.orderStatus,
            statusHistory: sale.statusHistory || [],
            trackingNumber: sale.trackingNumber,
            shippedDate: sale.shippedDate,
            deliveredDate: sale.deliveredDate,
            notes: sale.notes,
            internalNotes: sale.internalNotes,
            createdAt: sale.createdAt,
            updatedAt: sale.updatedAt || new Date().toISOString(),
            createdBy: sale.createdBy
        };

        console.log('📝 Guardando venta en Firestore:', JSON.stringify(salePlain, null, 2));

        // ========== GUARDAR EN FIRESTORE ==========
        const result = await SalesRepository.save(salePlain);

        // Limpiar caché
        await CacheService.clearCache(STORES.ORDERS);

        window.dispatchEvent(new CustomEvent('sales:updated', {
            detail: {
                action: 'create',
                saleId: sale.id,
                orderNumber: sale.orderNumber
            }
        }));

        return new Sale(result);
    },

    /**
     * Obtener venta por ID
     */
    async getById(saleId, forceRefresh = false) {
        if (!saleId) return null;

        if (!forceRefresh) {
            const cached = await CacheService.getCache(STORES.ORDERS, saleId);
            if (cached) {
                return new Sale(cached);
            }
        }

        const saleData = await SalesRepository.getById(saleId);

        if (saleData) {
            await CacheService.setCache(STORES.ORDERS, saleId, saleData, 3600000);
            return new Sale(saleData);
        }

        return null;
    },

    /**
     * Obtener venta por número de orden
     */
    async getByOrderNumber(orderNumber) {
        if (!orderNumber) return null;

        const saleData = await SalesRepository.getByOrderNumber(orderNumber);
        return saleData ? new Sale(saleData) : null;
    },

    /**
     * Obtener ventas de un cliente
     */
    async getByCustomerId(customerId, limitCount = 50) {
        if (!customerId) return [];

        const salesData = await SalesRepository.getByCustomerId(customerId, limitCount);
        return salesData.map(s => new Sale(s));
    },

    /**
     * Obtener ventas por estado
     */
    async getByStatus(orderStatus, limitCount = 50) {
        if (!orderStatus) return [];

        const salesData = await SalesRepository.getByStatus(orderStatus, limitCount);
        return salesData.map(s => new Sale(s));
    },

    /**
     * Obtener todas las ventas
     */
    async getAll(filters = {}, sortBy = 'orderDate', sortDir = 'desc', limitCount = 20, lastDoc = null) {
        const result = await SalesRepository.getAll(filters, sortBy, sortDir, limitCount, lastDoc);
        return {
            items: result.items.map(s => new Sale(s)),
            lastDoc: result.lastDoc,
            hasMore: result.hasMore
        };
    },

    /**
     * Obtener ventas por rango de fechas
     */
    async getByDateRange(dateFrom, dateTo, limitCount = 100) {
        if (!dateFrom || !dateTo) return [];

        const salesData = await SalesRepository.getByDateRange(dateFrom, dateTo, limitCount);
        return salesData.map(s => new Sale(s));
    },

    /**
     * Actualizar venta
     */
    async update(saleId, updateData) {
        if (!saleId) throw new Error('ID de venta requerido');

        const currentSale = await this.getById(saleId, true);

        if (!currentSale) {
            throw new Error('Venta no encontrada');
        }

        if (updateData.items) {
            throw new Error('Use métodos específicos para modificar items');
        }

        const updated = await SalesRepository.update(saleId, updateData);

        await CacheService.clearCache(STORES.ORDERS);

        window.dispatchEvent(new CustomEvent('sales:updated', {
            detail: {
                action: 'update',
                saleId: saleId
            }
        }));

        return updated ? new Sale(updated) : null;
    },

    /**
     * Cambiar estado de la orden
     */
    async updateOrderStatus(saleId, newStatus, note = '') {
        if (!saleId) throw new Error('ID de venta requerido');
        if (!newStatus) throw new Error('Estado requerido');

        const sale = await this.getById(saleId, true);

        if (!sale) {
            throw new Error('Venta no encontrada');
        }

        if (sale.orderStatus === 'cancelada') {
            throw new Error('No se puede modificar una venta cancelada');
        }

        if (sale.orderStatus === 'entregada') {
            throw new Error('No se puede modificar una venta ya entregada');
        }

        const updated = await SalesRepository.updateOrderStatus(saleId, newStatus, note);

        await CacheService.clearCache(STORES.ORDERS);

        window.dispatchEvent(new CustomEvent('sales:updated', {
            detail: {
                action: 'updateStatus',
                saleId: saleId,
                newStatus: newStatus
            }
        }));

        return updated ? new Sale(updated) : null;
    },

    /**
     * Cambiar estado de pago
     */
    async updatePaymentStatus(saleId, newStatus) {
        if (!saleId) throw new Error('ID de venta requerido');
        if (!newStatus) throw new Error('Estado de pago requerido');

        const sale = await this.getById(saleId, true);

        if (!sale) {
            throw new Error('Venta no encontrada');
        }

        if (sale.orderStatus === 'cancelada') {
            throw new Error('No se puede modificar el pago de una venta cancelada');
        }

        const updated = await SalesRepository.updatePaymentStatus(saleId, newStatus);

        await CacheService.clearCache(STORES.ORDERS);

        window.dispatchEvent(new CustomEvent('sales:updated', {
            detail: {
                action: 'updatePayment',
                saleId: saleId,
                newStatus: newStatus
            }
        }));

        return updated ? new Sale(updated) : null;
    },

    /**
     * Agregar item a una venta
     */
    async addItem(saleId, itemData) {
        if (!saleId) throw new Error('ID de venta requerido');
        if (!itemData || !itemData.productId) throw new Error('Datos del item requeridos');

        const sale = await this.getById(saleId, true);

        if (!sale) {
            throw new Error('Venta no encontrada');
        }

        if (sale.orderStatus === 'cancelada' || sale.orderStatus === 'entregada') {
            throw new Error('No se puede modificar una venta cancelada o entregada');
        }

        const hasStock = await ProductService.hasStock(itemData.productId, itemData.cantidad || 1);
        if (!hasStock) {
            throw new Error(`Stock insuficiente para ${itemData.productName || itemData.productId}`);
        }

        sale.addItem(itemData);
        await ProductService.updateStock(itemData.productId, -(itemData.cantidad || 1));

        const updated = await SalesRepository.update(saleId, {
            items: sale.items,
            totalItems: sale.totalItems,
            subtotal: sale.subtotal,
            descuentoTotal: sale.descuentoTotal,
            iva: sale.iva,
            total: sale.total,
            updatedAt: sale.updatedAt
        });

        await CacheService.clearCache(STORES.ORDERS);

        window.dispatchEvent(new CustomEvent('sales:updated', {
            detail: {
                action: 'addItem',
                saleId: saleId
            }
        }));

        return updated ? new Sale(updated) : null;
    },

    /**
     * Quitar item de una venta
     */
    async removeItem(saleId, index) {
        if (!saleId) throw new Error('ID de venta requerido');
        if (index === undefined || index === null) throw new Error('Índice del item requerido');

        const sale = await this.getById(saleId, true);

        if (!sale) {
            throw new Error('Venta no encontrada');
        }

        if (sale.orderStatus === 'cancelada' || sale.orderStatus === 'entregada') {
            throw new Error('No se puede modificar una venta cancelada o entregada');
        }

        if (index < 0 || index >= sale.items.length) {
            throw new Error('Item no encontrado');
        }

        const item = sale.items[index];
        sale.removeItem(index);
        await ProductService.updateStock(item.productId, item.cantidad);

        const updated = await SalesRepository.update(saleId, {
            items: sale.items,
            totalItems: sale.totalItems,
            subtotal: sale.subtotal,
            descuentoTotal: sale.descuentoTotal,
            iva: sale.iva,
            total: sale.total,
            updatedAt: sale.updatedAt
        });

        await CacheService.clearCache(STORES.ORDERS);

        window.dispatchEvent(new CustomEvent('sales:updated', {
            detail: {
                action: 'removeItem',
                saleId: saleId
            }
        }));

        return updated ? new Sale(updated) : null;
    },

    /**
     * Eliminar venta
     */
    async delete(saleId, hardDelete = false) {
        if (!saleId) throw new Error('ID de venta requerido');

        const sale = await this.getById(saleId, true);

        if (!sale) {
            throw new Error('Venta no encontrada');
        }

        if (!hardDelete) {
            if (sale.orderStatus !== 'cancelada' && sale.orderStatus !== 'entregada') {
                for (const item of sale.items) {
                    await ProductService.updateStock(item.productId, item.cantidad);
                }
            }
        }

        const result = await SalesRepository.delete(saleId, hardDelete);

        await CacheService.clearCache(STORES.ORDERS);

        window.dispatchEvent(new CustomEvent('sales:updated', {
            detail: {
                action: 'delete',
                saleId: saleId,
                hardDelete: hardDelete
            }
        }));

        return result;
    },

    /**
     * Obtener resumen de ventas
     */
    async getSalesSummary(dateFrom, dateTo) {
        if (!dateFrom || !dateTo) {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            dateFrom = startOfMonth.toISOString();
            dateTo = endOfMonth.toISOString();
        }

        return await SalesRepository.getSalesSummary(dateFrom, dateTo);
    },

    /**
     * Validar venta
     */
    validateForCreate(saleData) {
        if (!saleData) return { valido: false, errores: ['Datos de venta requeridos'] };

        const sale = new Sale(saleData);
        return sale.validate();
    },

    /**
     * Crear venta desde carrito
     */
    async createFromCart(cartData, customerData, adminUserId = null) {
        if (!cartData || !cartData.items || cartData.items.length === 0) {
            throw new Error('El carrito está vacío');
        }
        if (!customerData) {
            throw new Error('Datos del cliente requeridos');
        }

        const sale = Sale.fromCart(cartData, customerData);
        sale.createdBy = adminUserId;
        sale.id = `venta_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        const validation = sale.validate();
        if (!validation.valido) {
            throw new Error(`Datos inválidos: ${validation.errores.join(', ')}`);
        }

        for (const item of sale.items) {
            await ProductService.updateStock(item.productId, -item.cantidad);
        }

        const salePlain = {
            id: sale.id,
            orderNumber: sale.orderNumber,
            orderDate: sale.orderDate,
            customerId: sale.customerId,
            customerName: sale.customerName,
            customerEmail: sale.customerEmail,
            items: sale.items,
            totalItems: sale.totalItems,
            subtotal: sale.subtotal,
            descuentoTotal: sale.descuentoTotal,
            iva: sale.iva,
            total: sale.total,
            shippingAddress: sale.shippingAddress,
            shippingMethod: sale.shippingMethod,
            shippingCost: sale.shippingCost,
            paymentMethod: sale.paymentMethod,
            paymentStatus: sale.paymentStatus,
            paymentDate: sale.paymentDate,
            orderStatus: sale.orderStatus,
            statusHistory: sale.statusHistory || [],
            trackingNumber: sale.trackingNumber,
            shippedDate: sale.shippedDate,
            deliveredDate: sale.deliveredDate,
            notes: sale.notes,
            internalNotes: sale.internalNotes,
            createdAt: sale.createdAt,
            updatedAt: sale.updatedAt || new Date().toISOString(),
            createdBy: sale.createdBy
        };

        const result = await SalesRepository.save(salePlain);

        await CacheService.clearCache(STORES.ORDERS);

        window.dispatchEvent(new CustomEvent('sales:updated', {
            detail: {
                action: 'create',
                saleId: sale.id,
                orderNumber: sale.orderNumber
            }
        }));

        return new Sale(result);
    },

    /**
     * Obtener estadísticas rápidas
     */
    async getQuickStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        try {
            const daySales = await this.getByDateRange(
                today.toISOString(),
                now.toISOString()
            );

            const monthSales = await this.getByDateRange(
                startOfMonth.toISOString(),
                endOfMonth.toISOString()
            );

            const totalHoy = daySales.reduce((sum, s) => sum + (s.total || 0), 0);
            const totalMes = monthSales.reduce((sum, s) => sum + (s.total || 0), 0);

            const statusCount = {
                confirmada: 0,
                preparando: 0,
                enviada: 0,
                entregada: 0,
                cancelada: 0
            };

            monthSales.forEach(s => {
                if (statusCount.hasOwnProperty(s.orderStatus)) {
                    statusCount[s.orderStatus]++;
                }
            });

            return {
                ventasHoy: daySales.length,
                ventasMes: monthSales.length,
                totalHoy: totalHoy,
                totalMes: totalMes,
                statusCount: statusCount,
                ticketPromedio: monthSales.length > 0 ? totalMes / monthSales.length : 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                ventasHoy: 0,
                ventasMes: 0,
                totalHoy: 0,
                totalMes: 0,
                statusCount: {},
                ticketPromedio: 0
            };
        }
    }
};