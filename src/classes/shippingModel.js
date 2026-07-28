/* ========================================
   SHIPPING MODEL - Outlet Val
   Estructura de datos del envío
   ======================================== */

export class Shipping {
    constructor(data = {}) {
        // Identificación
        this.id = data.id || null;
        this.shipmentNumber = data.shipmentNumber || '';    // Número único de envío

        // Relación con venta
        this.saleId = data.saleId || null;                  // ID de la venta asociada
        this.orderNumber = data.orderNumber || '';          // Número de orden

        // Datos del cliente
        this.customerId = data.customerId || null;
        this.customerName = data.customerName || '';
        this.customerEmail = data.customerEmail || '';
        this.customerPhone = data.customerPhone || '';

        // Información de envío
        this.carrier = data.carrier || 'no_asignado';       // estafeta, fedex, dhl, ups, correos, redpack, otro, no_asignado
        this.trackingNumber = data.trackingNumber || '';
        this.shippingMethod = data.shippingMethod || 'estandar'; // estandar, express, same_day
        this.shippingCost = data.shippingCost || 0;

        // Dirección de envío
        this.shippingAddress = data.shippingAddress || {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'México'
        };

        // Estado del envío
        this.status = data.status || 'pendiente';           // pendiente, preparando, enviado, en_transito, entregado, fallido, devuelto
        this.statusHistory = data.statusHistory || [];      // Array de { status, date, note }

        // Fechas importantes
        this.shippedDate = data.shippedDate || null;        // Fecha de envío
        this.estimatedDelivery = data.estimatedDelivery || null; // Fecha estimada de entrega
        this.deliveredDate = data.deliveredDate || null;    // Fecha de entrega real
        this.returnDate = data.returnDate || null;          // Fecha de devolución

        // Seguimiento
        this.trackingHistory = data.trackingHistory || [];  // Array de { location, status, date, description }

        // Notas y comentarios
        this.notes = data.notes || '';
        this.internalNotes = data.internalNotes || '';

        // Metadata
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || null;
        this.createdBy = data.createdBy || null;            // ID del admin que lo creó
        this.updatedBy = data.updatedBy || null;            // ID del admin que lo actualizó
    }

    // ========== GETTERS ==========

    // Número de envío formateado
    get shipmentNumberFormatted() {
        if (!this.shipmentNumber) return 'N/A';
        return this.shipmentNumber;
    }

    // Etiqueta de la paquetería
    get carrierLabel() {
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
        return labels[this.carrier] || this.carrier;
    }

    // Etiqueta del método de envío
    get shippingMethodLabel() {
        const labels = {
            estandar: 'Estándar',
            express: 'Express',
            same_day: 'Mismo día'
        };
        return labels[this.shippingMethod] || this.shippingMethod;
    }

    // Etiqueta del estado
    get statusLabel() {
        const labels = {
            pendiente: 'Pendiente',
            preparando: 'Preparando',
            enviado: 'Enviado',
            en_transito: 'En Tránsito',
            entregado: 'Entregado',
            fallido: 'Fallido',
            devuelto: 'Devuelto'
        };
        return labels[this.status] || this.status;
    }

    // Color del estado
    get statusColor() {
        const colors = {
            pendiente: '#ffc107',
            preparando: '#17a2b8',
            enviado: '#007bff',
            en_transito: '#6610f2',
            entregado: '#28a745',
            fallido: '#dc3545',
            devuelto: '#ff4400'
        };
        return colors[this.status] || '#6c757d';
    }

    // ¿El envío está completado?
    get isCompleted() {
        return this.status === 'entregado' || this.status === 'devuelto';
    }

    // ¿El envío está en proceso?
    get isInProgress() {
        return ['pendiente', 'preparando', 'enviado', 'en_transito'].includes(this.status);
    }

    // Tiempo transcurrido desde la creación
    get timeElapsed() {
        const created = new Date(this.createdAt);
        const now = new Date();
        const diff = now - created;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} día${days > 1 ? 's' : ''} ${hours}h`;
        }
        return `${hours}h`;
    }

    // Datos resumidos para listados
    get datosResumidos() {
        return {
            id: this.id,
            shipmentNumber: this.shipmentNumber,
            orderNumber: this.orderNumber,
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            carrier: this.carrier,
            carrierLabel: this.carrierLabel,
            trackingNumber: this.trackingNumber,
            status: this.status,
            statusLabel: this.statusLabel,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // ========== MÉTODOS ==========

    // Agregar al historial de estados
    addStatusHistory(status, note = '') {
        this.statusHistory.push({
            status: status,
            date: new Date().toISOString(),
            note: note
        });
        this.updatedAt = new Date().toISOString();
    }

    // Agregar al historial de tracking
    addTrackingHistory(location, status, description = '') {
        this.trackingHistory.push({
            location: location,
            status: status,
            date: new Date().toISOString(),
            description: description
        });
        this.updatedAt = new Date().toISOString();
    }

    // Cambiar estado del envío
    updateStatus(newStatus, note = '') {
        if (newStatus === this.status) {
            return false;
        }

        // Actualizar fechas según el estado
        if (newStatus === 'enviado' && !this.shippedDate) {
            this.shippedDate = new Date().toISOString();
        }
        if (newStatus === 'entregado' && !this.deliveredDate) {
            this.deliveredDate = new Date().toISOString();
        }
        if (newStatus === 'devuelto' && !this.returnDate) {
            this.returnDate = new Date().toISOString();
        }

        this.status = newStatus;
        this.addStatusHistory(newStatus, note);
        this.updatedAt = new Date().toISOString();

        return true;
    }

    // Actualizar tracking
    updateTracking(trackingNumber, carrier = null) {
        this.trackingNumber = trackingNumber;
        if (carrier) {
            this.carrier = carrier;
        }
        this.updatedAt = new Date().toISOString();

        this.addTrackingHistory(
            'Tracking actualizado',
            'actualizado',
            `Número de tracking: ${trackingNumber}`
        );
    }

    // Validar envío completo
    validarParaEnvio() {
        const errores = [];

        if (!this.saleId) errores.push('Se requiere una orden asociada');
        if (!this.customerName) errores.push('Nombre del cliente requerido');
        if (!this.shippingAddress?.street) errores.push('Dirección de envío requerida');
        if (!this.shippingAddress?.city) errores.push('Ciudad de envío requerida');
        if (!this.shippingAddress?.state) errores.push('Estado de envío requerido');
        if (!this.shippingAddress?.postalCode) errores.push('Código postal requerido');

        return {
            valido: errores.length === 0,
            errores
        };
    }

    // ========== CONVERSIÓN PARA FIRESTORE ==========

    toFirestore() {
        return {
            shipmentNumber: this.shipmentNumber,
            saleId: this.saleId,
            orderNumber: this.orderNumber,
            customerId: this.customerId,
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            customerPhone: this.customerPhone,
            carrier: this.carrier,
            trackingNumber: this.trackingNumber,
            shippingMethod: this.shippingMethod,
            shippingCost: this.shippingCost,
            shippingAddress: this.shippingAddress,
            status: this.status,
            statusHistory: this.statusHistory,
            shippedDate: this.shippedDate,
            estimatedDelivery: this.estimatedDelivery,
            deliveredDate: this.deliveredDate,
            returnDate: this.returnDate,
            trackingHistory: this.trackingHistory,
            notes: this.notes,
            internalNotes: this.internalNotes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy
        };
    }
}