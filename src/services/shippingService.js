/* ========================================
   SHIPPING SERVICE - Outlet Val
   Lógica de negocio para envíos
   CON SOPORTE PARA CACHÉ Y NOTIFICACIONES
   ======================================== */

import { Shipping } from '../classes/shippingModel.js';
import { ShippingRepository } from '../repositories/shippingRepository.js';
import { CacheService, STORES } from '../services/cacheService.js';
import { SalesService } from '../services/salesService.js';

export const ShippingService = {
    /**
     * Crear nuevo envío
     * @param {Object} shippingData - Datos del envío
     * @param {string} adminUserId - ID del admin que crea el envío
     * @returns {Promise<Shipping>}
     */
    async create(shippingData, adminUserId = null) {
        // ========== VALIDACIONES ==========
        if (!shippingData.saleId) {
            throw new Error('Se requiere una orden asociada');
        }

        if (!shippingData.customerName) {
            throw new Error('El nombre del cliente es requerido');
        }

        // Verificar que la venta existe
        const sale = await SalesService.getById(shippingData.saleId, true);
        if (!sale) {
            throw new Error('La orden asociada no existe');
        }

        // Verificar que la venta no tenga ya un envío
        const existingShipments = await ShippingRepository.getBySaleId(shippingData.saleId);
        if (existingShipments.length > 0) {
            throw new Error('Esta orden ya tiene un envío asociado');
        }

        // ========== CREAR MODELO ==========
        const shipment = new Shipping({
            saleId: shippingData.saleId,
            orderNumber: sale.orderNumber || '',
            customerId: sale.customerId || null,
            customerName: shippingData.customerName || sale.customerName || 'Cliente',
            customerEmail: shippingData.customerEmail || sale.customerEmail || '',
            customerPhone: shippingData.customerPhone || sale.customerPhone || '',
            carrier: shippingData.carrier || 'no_asignado',
            trackingNumber: shippingData.trackingNumber || '',
            shippingMethod: shippingData.shippingMethod || 'estandar',
            shippingCost: shippingData.shippingCost || 0,
            shippingAddress: shippingData.shippingAddress || sale.shippingAddress || {
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'México'
            },
            status: shippingData.status || 'pendiente',
            notes: shippingData.notes || '',
            internalNotes: shippingData.internalNotes || '',
            createdBy: adminUserId
        });

        // Generar número de envío
        shipment.shipmentNumber = await this.generateShipmentNumber();

        // Establecer fecha estimada de entrega (por defecto +5 días)
        if (!shipment.estimatedDelivery) {
            const estimatedDate = new Date();
            estimatedDate.setDate(estimatedDate.getDate() + 5);
            shipment.estimatedDelivery = estimatedDate.toISOString();
        }

        // Agregar estado inicial al historial
        shipment.addStatusHistory('pendiente', 'Envío creado');

        // ========== CONVERTIR A OBJETO PLANO ==========
        const shipmentPlain = shipment.toFirestore();

        // ========== GUARDAR EN FIRESTORE ==========
        const result = await ShippingRepository.save(shipmentPlain);

        // Limpiar caché de envíos
        await CacheService.clearCache(STORES.SHIPPINGS);

        // ✅ NOTIFICAR QUE HUBO CAMBIOS
        window.dispatchEvent(new CustomEvent('shipping:updated', {
            detail: {
                action: 'create',
                shipmentId: result.id,
                shipmentNumber: shipment.shipmentNumber
            }
        }));

        return new Shipping({ id: result.id, ...shipment });
    },

    /**
     * Obtener envío por ID (con caché)
     */
    async getById(shippingId, forceRefresh = false) {
        if (!forceRefresh) {
            const cached = await CacheService.getCache(STORES.SHIPPINGS, shippingId);
            if (cached) {
                return new Shipping(cached);
            }
        }

        const shippingData = await ShippingRepository.getById(shippingId);

        if (shippingData) {
            await CacheService.setCache(STORES.SHIPPINGS, shippingId, shippingData, 3600000);
            return new Shipping(shippingData);
        }

        return null;
    },

    /**
     * Obtener envío por número de envío
     */
    async getByShipmentNumber(shipmentNumber) {
        const shippingData = await ShippingRepository.getByShipmentNumber(shipmentNumber);
        return shippingData ? new Shipping(shippingData) : null;
    },

    /**
     * Obtener envíos por ID de venta
     */
    async getBySaleId(saleId) {
        const shipmentsData = await ShippingRepository.getBySaleId(saleId);
        return shipmentsData.map(s => new Shipping(s));
    },

    /**
     * Obtener todos los envíos
     * ✅ OPTIMIZADO CON ÍNDICES
     */
    async getAll(filters = {}, sortBy = 'createdAt', sortDir = 'desc', limitCount = 50, startAfter = null) {
        // Generar clave de caché basada en los filtros
        const cacheKey = `shippings_list_${JSON.stringify(filters)}_${sortBy}_${sortDir}_${limitCount}`;

        // Intentar obtener de caché (solo si no hay paginación)
        if (!startAfter) {
            const cached = await CacheService.getCache(STORES.SHIPPINGS, cacheKey);
            if (cached) {
                return {
                    items: cached.items.map(s => new Shipping(s)),
                    lastDoc: cached.lastDoc,
                    hasMore: cached.hasMore
                };
            }
        }

        const result = await ShippingRepository.getAll(filters, sortBy, sortDir, limitCount, startAfter);
        const items = result.items.map(s => new Shipping(s));

        // Guardar en caché (30 minutos) solo si no hay paginación
        if (!startAfter) {
            await CacheService.setCache(STORES.SHIPPINGS, cacheKey, {
                items: result.items,
                lastDoc: result.lastDoc,
                hasMore: result.hasMore
            }, 1800000);
        }

        return {
            items,
            lastDoc: result.lastDoc,
            hasMore: result.hasMore
        };
    },

    /**
     * Actualizar envío
     */
    async update(shippingId, updateData) {
        const currentShipment = await this.getById(shippingId, true);

        if (!currentShipment) {
            throw new Error('Envío no encontrado');
        }

        const updated = await ShippingRepository.update(shippingId, updateData);

        // Limpiar caché de envíos
        await CacheService.clearCache(STORES.SHIPPINGS);

        // ✅ NOTIFICAR QUE HUBO CAMBIOS
        window.dispatchEvent(new CustomEvent('shipping:updated', {
            detail: {
                action: 'update',
                shipmentId: shippingId
            }
        }));

        return new Shipping(updated);
    },

    /**
     * Actualizar estado del envío
     */
    async updateStatus(shippingId, newStatus, note = '') {
        const currentShipment = await this.getById(shippingId, true);

        if (!currentShipment) {
            throw new Error('Envío no encontrado');
        }

        if (currentShipment.status === newStatus) {
            throw new Error(`El envío ya está en estado "${currentShipment.statusLabel}"`);
        }

        // Si se marca como entregado, actualizar la venta también
        if (newStatus === 'entregado' && currentShipment.saleId) {
            try {
                await SalesService.updateOrderStatus(currentShipment.saleId, 'entregada', 'Envío entregado');
            } catch (error) {
                console.warn('No se pudo actualizar la venta:', error);
            }
        }

        const updated = await ShippingRepository.updateStatus(shippingId, newStatus, note);

        // Limpiar caché de envíos
        await CacheService.clearCache(STORES.SHIPPINGS);

        // ✅ NOTIFICAR QUE HUBO CAMBIOS
        window.dispatchEvent(new CustomEvent('shipping:updated', {
            detail: {
                action: 'updateStatus',
                shipmentId: shippingId,
                newStatus: newStatus
            }
        }));

        return new Shipping(updated);
    },

    /**
     * Actualizar tracking
     */
    async updateTracking(shippingId, trackingNumber, carrier = null) {
        const currentShipment = await this.getById(shippingId, true);

        if (!currentShipment) {
            throw new Error('Envío no encontrado');
        }

        if (!trackingNumber || trackingNumber.trim().length < 4) {
            throw new Error('El número de tracking debe tener al menos 4 caracteres');
        }

        const updated = await ShippingRepository.updateTracking(shippingId, trackingNumber, carrier);

        // Limpiar caché de envíos
        await CacheService.clearCache(STORES.SHIPPINGS);

        // ✅ NOTIFICAR QUE HUBO CAMBIOS
        window.dispatchEvent(new CustomEvent('shipping:updated', {
            detail: {
                action: 'updateTracking',
                shipmentId: shippingId,
                trackingNumber: trackingNumber
            }
        }));

        return new Shipping(updated);
    },

    /**
     * ELIMINAR ENVÍO PERMANENTEMENTE DE LA BASE DE DATOS
     */
    async delete(shippingId) {
        // Verificar que el envío existe
        const shipment = await this.getById(shippingId, true);
        if (!shipment) {
            throw new Error('Envío no encontrado');
        }

        // Eliminar el envío de Firestore
        const result = await ShippingRepository.delete(shippingId);

        // Limpiar caché
        await CacheService.clearCache(STORES.SHIPPINGS);

        // Notificar cambio
        window.dispatchEvent(new CustomEvent('shipping:updated', {
            detail: {
                action: 'delete',
                shipmentId: shippingId,
                shipmentNumber: shipment.shipmentNumber
            }
        }));

        return result;
    },

    /**
     * Generar número de envío
     */
    async generateShipmentNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const prefix = `ENV${year}${month}${day}`;

        // Obtener el último número de envío del día
        const lastShipment = await ShippingRepository.getLastShipmentOfDay(prefix);
        let sequential = 1;

        if (lastShipment) {
            const parts = lastShipment.shipmentNumber.split('-');
            sequential = parseInt(parts[parts.length - 1]) + 1;
        }

        return `${prefix}-${String(sequential).padStart(4, '0')}`;
    },

    /**
     * Obtener estadísticas rápidas
     */
    async getQuickStats() {
        return await ShippingRepository.getQuickStats();
    },

    /**
     * Contar envíos por estado
     */
    async countByStatus(status) {
        return await ShippingRepository.countByStatus(status);
    },

    // ========== UTILIDADES ==========

    /**
     * Formatear estado para mostrar
     */
    getStatusLabel(status) {
        const labels = {
            pendiente: 'Pendiente',
            preparando: 'Preparando',
            enviado: 'Enviado',
            en_transito: 'En Tránsito',
            entregado: 'Entregado',
            fallido: 'Fallido',
            devuelto: 'Devuelto'
        };
        return labels[status] || status;
    },

    /**
     * Formatear paquetería para mostrar
     */
    getCarrierLabel(carrier) {
        const labels = {
            estafeta: 'Estafeta',
            fedex: 'FedEx',
            dhl: 'DHL',
            ups: 'UPS',
            correos: 'Correos de México',
            redpack: 'RedPack',
            otro: 'Otro',
            no_asignado: 'No asignado'
        };
        return labels[carrier] || carrier;
    },

    /**
     * Validar envío para crear
     */
    validateForCreate(shippingData) {
        const shipment = new Shipping(shippingData);
        return shipment.validarParaEnvio();
    }
};