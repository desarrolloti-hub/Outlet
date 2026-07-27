/* ========================================
   SALES MODEL - Outlet Val
   Modelo de datos para ventas (orders)
   ======================================== */

export class Sale {
    constructor(data = {}) {
        // Identificación
        this.id = data.id || null;
        this.orderNumber = data.orderNumber || '';
        this.orderDate = data.orderDate || new Date().toISOString();

        // Cliente
        this.customerId = data.customerId || null;
        this.customerName = data.customerName || '';
        this.customerEmail = data.customerEmail || '';

        // Productos
        this.items = (data.items || []).map(item => ({
            productId: item.productId || item.id || '',
            productName: item.productName || item.nombre || 'Producto',
            productSku: item.productSku || item.sku || '',
            cantidad: parseInt(item.cantidad || item.quantity || 1),
            precioUnitario: parseFloat(item.precioUnitario || item.precioVenta || item.price || 0),
            precioFinal: parseFloat(item.precioFinal || item.price || item.precioVenta || 0),
            descuento: parseFloat(item.descuento || item.discount || 0),
            talla: item.talla || item.size || '',
            color: item.color || ''
        }));

        this.totalItems = data.totalItems || 0;

        // Precios
        this.subtotal = parseFloat(data.subtotal) || 0;
        this.descuentoTotal = parseFloat(data.descuentoTotal) || 0;
        this.iva = parseFloat(data.iva) || 0;
        this.total = parseFloat(data.total) || 0;

        // Envío
        this.shippingAddress = data.shippingAddress || {};
        this.shippingMethod = data.shippingMethod || 'estandar';
        this.shippingCost = parseFloat(data.shippingCost) || 0;

        // Pago
        this.paymentMethod = data.paymentMethod || 'efectivo';
        this.paymentStatus = data.paymentStatus || 'pendiente';
        this.paymentDate = data.paymentDate || null;

        // Estado
        this.orderStatus = data.orderStatus || 'confirmada';
        this.statusHistory = data.statusHistory || [];

        // Seguimiento
        this.trackingNumber = data.trackingNumber || '';
        this.shippedDate = data.shippedDate || null;
        this.deliveredDate = data.deliveredDate || null;

        // Notas
        this.notes = data.notes || '';
        this.internalNotes = data.internalNotes || '';

        // Metadata
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || null;
        this.createdBy = data.createdBy || null;

        // 🔥 RECALCULAR TOTALES SIEMPRE
        this._recalculateTotals();
    }
    // salesModel.js - agregar al final de la clase
    toJSON() {
        return {
            id: this.id,
            orderNumber: this.orderNumber,
            orderDate: this.orderDate,
            customerId: this.customerId,
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            items: this.items,
            totalItems: this.totalItems,
            subtotal: this.subtotal,
            descuentoTotal: this.descuentoTotal,
            iva: this.iva,
            total: this.total,
            shippingAddress: this.shippingAddress,
            shippingMethod: this.shippingMethod,
            shippingCost: this.shippingCost,
            paymentMethod: this.paymentMethod,
            paymentStatus: this.paymentStatus,
            paymentDate: this.paymentDate,
            orderStatus: this.orderStatus,
            statusHistory: this.statusHistory,
            trackingNumber: this.trackingNumber,
            shippedDate: this.shippedDate,
            deliveredDate: this.deliveredDate,
            notes: this.notes,
            internalNotes: this.internalNotes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy
        };
    }

    // ========== GETTERS ==========

    get orderNumberFormatted() {
        if (!this.orderNumber) return 'N/A';
        return `#${this.orderNumber}`;
    }

    get statusColor() {
        const colors = {
            'confirmada': '#ffc107',
            'preparando': '#17a2b8',
            'enviada': '#007bff',
            'entregada': '#28a745',
            'cancelada': '#dc3545'
        };
        return colors[this.orderStatus] || '#6c757d';
    }

    get paymentStatusColor() {
        const colors = {
            'pendiente': '#ffc107',
            'pagado': '#28a745',
            'fallido': '#dc3545'
        };
        return colors[this.paymentStatus] || '#6c757d';
    }

    get paymentMethodLabel() {
        const labels = {
            'efectivo': 'Efectivo',
            'tarjeta': 'Tarjeta',
            'transferencia': 'Transferencia'
        };
        return labels[this.paymentMethod] || this.paymentMethod;
    }

    get orderStatusLabel() {
        const labels = {
            'confirmada': 'Confirmada',
            'preparando': 'Preparando',
            'enviada': 'Enviada',
            'entregada': 'Entregada',
            'cancelada': 'Cancelada'
        };
        return labels[this.orderStatus] || this.orderStatus;
    }

    get shippingMethodLabel() {
        const labels = {
            'estandar': 'Estándar',
            'express': 'Express',
            'recogida': 'Recogida en tienda'
        };
        return labels[this.shippingMethod] || this.shippingMethod;
    }

    get uniqueProducts() {
        return this.items.length;
    }

    // En los getters, cambiar el símbolo
    get subtotalFormatted() {
        return `$${this.subtotal.toFixed(2)}`;
    }

    get totalFormatted() {
        return `$${this.total.toFixed(2)}`;
    }

    get descuentoFormatted() {
        return `$${this.descuentoTotal.toFixed(2)}`;
    }

    get ivaFormatted() {
        return `$${this.iva.toFixed(2)}`;
    }
    get ivaFormatted() {
        return `$${this.iva.toFixed(2)}`;
    }

    get datosResumidos() {
        return {
            id: this.id,
            orderNumber: this.orderNumber,
            orderDate: this.orderDate,
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            totalItems: this.totalItems,
            uniqueProducts: this.uniqueProducts,
            subtotal: this.subtotal,
            total: this.total,
            orderStatus: this.orderStatus,
            orderStatusLabel: this.orderStatusLabel,
            paymentStatus: this.paymentStatus,
            paymentMethod: this.paymentMethod,
            shippingMethod: this.shippingMethod,
            createdAt: this.createdAt
        };
    }

    // ========== MÉTODOS ==========

    addItem(item) {
        this.items.push({
            productId: item.productId || item.id || '',
            productName: item.productName || item.nombre || 'Producto',
            productSku: item.productSku || item.sku || '',
            cantidad: parseInt(item.cantidad || item.quantity || 1),
            precioUnitario: parseFloat(item.precioUnitario || item.precioVenta || item.price || 0),
            precioFinal: parseFloat(item.precioFinal || item.price || item.precioVenta || 0),
            descuento: parseFloat(item.descuento || item.discount || 0),
            talla: item.talla || item.size || '',
            color: item.color || ''
        });
        this._recalculateTotals();
        this.updatedAt = new Date().toISOString();
        return this;
    }

    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            this._recalculateTotals();
            this.updatedAt = new Date().toISOString();
        }
        return this;
    }

    _recalculateTotals() {
        let subtotal = 0;
        let totalDescuento = 0;
        let totalItems = 0;

        this.items.forEach(item => {
            const precioFinal = parseFloat(item.precioFinal) || parseFloat(item.precioUnitario) || 0;
            const cantidad = parseInt(item.cantidad) || 1;
            const descuento = parseFloat(item.descuento) || 0;

            const totalItem = precioFinal * cantidad;
            subtotal += totalItem;
            totalDescuento += descuento * cantidad;
            totalItems += cantidad;
        });

        this.subtotal = subtotal;
        this.descuentoTotal = totalDescuento;
        this.totalItems = totalItems;

        // Calcular IVA (21% sobre subtotal - descuento)
        const base = subtotal - totalDescuento;
        this.iva = base * 0.21;
        this.total = base + this.iva + (parseFloat(this.shippingCost) || 0);

        this.updatedAt = new Date().toISOString();
    }

    updateOrderStatus(newStatus, nota = '') {
        const validStatus = ['confirmada', 'preparando', 'enviada', 'entregada', 'cancelada'];
        if (!validStatus.includes(newStatus)) {
            throw new Error(`Estado inválido: ${newStatus}`);
        }

        this.orderStatus = newStatus;
        this.updatedAt = new Date().toISOString();

        this.statusHistory.push({
            status: newStatus,
            date: new Date().toISOString(),
            note: nota || `Estado cambiado a ${newStatus}`
        });

        if (newStatus === 'enviada' && !this.shippedDate) {
            this.shippedDate = new Date().toISOString();
        }
        if (newStatus === 'entregada' && !this.deliveredDate) {
            this.deliveredDate = new Date().toISOString();
        }

        return this;
    }

    updatePaymentStatus(newStatus) {
        const validStatus = ['pendiente', 'pagado', 'fallido'];
        if (!validStatus.includes(newStatus)) {
            throw new Error(`Estado de pago inválido: ${newStatus}`);
        }

        this.paymentStatus = newStatus;
        this.updatedAt = new Date().toISOString();

        if (newStatus === 'pagado' && !this.paymentDate) {
            this.paymentDate = new Date().toISOString();
        }

        return this;
    }

    validate() {
        const errors = [];

        if (!this.customerId && !this.customerName) {
            errors.push('Cliente requerido (ID o nombre)');
        }

        if (this.items.length === 0) {
            errors.push('La venta debe tener al menos un producto');
        }

        if (this.total <= 0) {
            errors.push('El total debe ser mayor a 0');
        }

        this.items.forEach((item, index) => {
            if (!item.productId) {
                errors.push(`Item ${index + 1}: Producto sin ID`);
            }
            if (item.cantidad <= 0) {
                errors.push(`Item ${index + 1}: Cantidad inválida`);
            }
            if (item.precioFinal < 0) {
                errors.push(`Item ${index + 1}: Precio inválido`);
            }
        });

        return {
            valido: errors.length === 0,
            errores: errors
        };
    }

    static generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        return `OUT-${year}${month}${day}-${random}`;
    }

    static fromCart(cartData, customerData) {
        const items = cartData.items.map(item => ({
            productId: item.productId || item.id || '',
            productName: item.nombre || item.name || 'Producto',
            productSku: item.sku || item.productSku || '',
            cantidad: parseInt(item.cantidad || 1),
            precioUnitario: parseFloat(item.precioVenta || item.price || 0),
            precioFinal: parseFloat(item.precioFinal || item.finalPrice || item.precioVenta || item.price || 0),
            descuento: parseFloat(item.descuento || 0),
            talla: item.talla || '',
            color: item.color || ''
        }));

        const sale = new Sale({
            orderNumber: this.generateOrderNumber(),
            customerId: customerData.id || null,
            customerName: customerData.nombreCompleto || customerData.nombre || '',
            customerEmail: customerData.email || '',
            items: items,
            shippingAddress: customerData.direccion || {}
        });

        sale._recalculateTotals();
        return sale;
    }
}