/* ========================================
   CUSTOMER SERVICE - Outlet Val
   Lógica de negocio para clientes
   ======================================== */

import { Customer } from '../classes/customerModel.js';
import { CustomerRepository } from '../repositories/customerRepository.js';

export const ROLES = {
    CUSTOMER: 'customer'
};

export const CustomerService = {
    /**
     * Registrar nuevo cliente
     */
    async register(customerData, password) {
        // Validaciones de negocio
        if (!customerData.nombre || customerData.nombre.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        if (!customerData.email || !this._validateEmail(customerData.email)) {
            throw new Error('Correo electrónico inválido');
        }
        
        if (!password || password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Verificar si el email ya existe
        const existing = await CustomerRepository.getByEmail(customerData.email);
        if (existing) {
            throw new Error('Ya existe un cliente con este correo electrónico');
        }
        
        // Crear modelo con rol 'customer' fijo
        const customer = new Customer({
            nombre: customerData.nombre.trim(),
            apellidoPa: customerData.apellidoPa?.trim() || '',
            apellidoMa: customerData.apellidoMa?.trim() || '',
            email: customerData.email.toLowerCase().trim(),
            fotoPerfil: customerData.fotoPerfil || '',
            direccion: customerData.direccion || {},
            preferencias: customerData.preferencias || {},
            provider: 'email',
            estado: 'activo'
        });
        
        console.log('📝 Creando customer con rol:', customer.rol);
        
        // Registrar en Firebase
        const result = await CustomerRepository.registerWithEmail(
            customer.email,
            password,
            customer
        );
        
        return result;
    },
    
    /**
     * Iniciar sesión como cliente
     */
    async login(email, password, isGoogle = false) {
        if (!isGoogle) {
            if (!email || !this._validateEmail(email)) {
                throw new Error('Correo electrónico inválido');
            }
            
            if (!password) {
                throw new Error('La contraseña es requerida');
            }
            
            // Verificar que sea un cliente (no admin)
            const customer = await CustomerRepository.getByEmail(email.toLowerCase().trim());
            
            if (customer) {
                const customerObj = new Customer(customer);
                
                if (!customerObj.isActive()) {
                    throw new Error('Cuenta inactiva o suspendida. Contacte a soporte.');
                }
            } else {
                throw new Error('No existe una cuenta con este correo');
            }
            
            const result = await CustomerRepository.loginWithEmail(email.toLowerCase().trim(), password);
            
            if (result.customerData) {
                const customerObj = new Customer(result.customerData);
                await CustomerRepository.update(result.customerData.id, {
                    ultimoLogin: new Date().toISOString()
                });
                
                // Guardar sesión
                const sessionData = this._buildSessionData(customerObj);
                this._saveSession(sessionData);
                this._dispatchAuthChange(result.customerData);
            }
            
            return result;
        } else {
            console.log('🔐 Iniciando login con Google desde Service...');
            const result = await CustomerRepository.loginWithGoogle();
            
            console.log('📊 Resultado del login:', {
                tieneUser: !!result.user,
                tieneCustomerData: !!result.customerData,
                tieneFoto: result.customerData?.fotoPerfil ? '✅ Sí' : '❌ No',
                fotoUrl: result.customerData?.fotoPerfil
            });
            
            if (result.customerData) {
                const customerObj = new Customer(result.customerData);
                
                console.log('📸 CustomerObj:', {
                    tieneFoto: !!customerObj.fotoPerfil,
                    fotoUrl: customerObj.fotoPerfil
                });
                
                const sessionData = this._buildSessionData(customerObj);
                
                console.log('📦 SessionData a guardar:', {
                    tieneFoto: !!sessionData.fotoPerfil,
                    fotoUrl: sessionData.fotoPerfil
                });
                
                this._saveSession(sessionData);
                this._dispatchAuthChange(result.customerData);
                
                console.log('✅ Sesión guardada correctamente');
            }
            return result;
        }
    },
    
    /**
     * Construye el objeto JSON para localStorage
     */
    _buildSessionData(customer) {
        console.log('🏗️ Construyendo sesión para customer:', {
            id: customer.id,
            nombre: customer.nombre,
            rol: customer.rol,
            tieneFoto: !!customer.fotoPerfil,
            fotoUrl: customer.fotoPerfil ? customer.fotoPerfil.substring(0, 50) + '...' : 'sin foto'
        });
        
        return {
            id: customer.id,
            nombre: customer.nombre,
            apellidoPa: customer.apellidoPa || '',
            apellidoMa: customer.apellidoMa || '',
            nombreCompleto: customer.nombreCompleto,
            email: customer.email,
            fotoPerfil: customer.fotoPerfil || '',
            rol: customer.rol,
            estado: customer.estado,
            iniciales: customer.iniciales,
            fechaSesion: new Date().toISOString(),
            provider: customer.provider,
            ultimoAcceso: new Date().toISOString(),
            version: '1.0'
        };
    },
    
    /**
     * Cerrar sesión
     */
    async logout() {
        await CustomerRepository.logout();
        this._clearSession();
        this._dispatchAuthChange(null);
        return true;
    },
    
    /**
     * Obtener cliente actual (con caché)
     */
    async getCurrentCustomer(forceRefresh = false) {
        const authUser = CustomerRepository.getCurrentAuthUser();
        
        if (!authUser) {
            return null;
        }
        
        if (!forceRefresh) {
            const session = this._getSession();
            if (session && session.id === authUser.uid && session.rol === ROLES.CUSTOMER) {
                console.log('📦 Usando sesión cacheada, rol:', session.rol);
                return new Customer(session);
            }
        }
        
        const customerData = await CustomerRepository.getById(authUser.uid);
        
        if (customerData) {
            const customer = new Customer(customerData);
            const sessionData = this._buildSessionData(customer);
            this._saveSession(sessionData);
            console.log('📦 Customer actualizado desde DB, rol:', customer.rol);
            return customer;
        }
        
        return null;
    },
    
    /**
     * Obtener todos los clientes (solo para admin)
     */
    async getAllCustomers() {
        const customers = await CustomerRepository.getAll();
        return customers.map(customer => new Customer(customer).datosResumidos);
    },
    
    /**
     * Obtener cliente por ID
     */
    async getCustomerById(customerId) {
        const customerData = await CustomerRepository.getById(customerId);
        if (!customerData) {
            throw new Error('Cliente no encontrado');
        }
        return new Customer(customerData);
    },
    
    /**
     * Actualizar perfil del cliente
     */
    async updateProfile(customerId, updateData) {
        const currentCustomer = await this.getCurrentCustomer(true);
        
        if (!currentCustomer || currentCustomer.id !== customerId) {
            throw new Error('No autorizado para modificar este perfil');
        }
        
        // Validaciones
        if (updateData.nombre && updateData.nombre.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        if (updateData.email && !this._validateEmail(updateData.email)) {
            throw new Error('Correo electrónico inválido');
        }
        
        // No permitir cambiar el rol
        if (updateData.rol) {
            delete updateData.rol;
        }
        
        const updated = await CustomerRepository.update(customerId, updateData);
        
        // Actualizar sesión local
        const updatedCustomer = new Customer(updated);
        const sessionData = this._buildSessionData(updatedCustomer);
        this._saveSession(sessionData);
        this._dispatchAuthChange(updatedCustomer);
        
        return updatedCustomer;
    },
    
    /**
     * Actualizar foto de perfil
     */
    async updateProfilePicture(customerId, imageUrl) {
        const currentCustomer = await this.getCurrentCustomer(true);
        
        if (!currentCustomer || currentCustomer.id !== customerId) {
            throw new Error('No autorizado');
        }
        
        if (!imageUrl || !imageUrl.startsWith('http')) {
            throw new Error('URL de imagen inválida');
        }
        
        const updated = await CustomerRepository.update(customerId, {
            fotoPerfil: imageUrl
        });
        
        const updatedCustomer = new Customer(updated);
        const sessionData = this._buildSessionData(updatedCustomer);
        this._saveSession(sessionData);
        this._dispatchAuthChange(updatedCustomer);
        
        return updatedCustomer;
    },
    
    /**
     * Actualizar dirección de envío
     */
    async updateDireccion(customerId, direccionData) {
        const currentCustomer = await this.getCurrentCustomer(true);
        
        if (!currentCustomer || currentCustomer.id !== customerId) {
            throw new Error('No autorizado');
        }
        
        // Validar datos requeridos para envío
        if (direccionData.telefono1 && !this._validatePhone(direccionData.telefono1)) {
            throw new Error('Teléfono inválido (10 dígitos requeridos)');
        }
        
        if (direccionData.codigoPostal && !this._validatePostalCode(direccionData.codigoPostal)) {
            throw new Error('Código postal inválido (5 dígitos requeridos)');
        }
        
        const updated = await CustomerRepository.updateDireccion(customerId, direccionData);
        
        // Actualizar sesión local
        const updatedCustomer = new Customer(updated);
        const sessionData = this._buildSessionData(updatedCustomer);
        this._saveSession(sessionData);
        
        return updatedCustomer;
    },
    
    /**
     * Actualizar preferencias
     */
    async updatePreferencias(customerId, preferenciasData) {
        const currentCustomer = await this.getCurrentCustomer(true);
        
        if (!currentCustomer || currentCustomer.id !== customerId) {
            throw new Error('No autorizado');
        }
        
        const updated = await CustomerRepository.updatePreferencias(customerId, preferenciasData);
        
        // Actualizar sesión local
        const updatedCustomer = new Customer(updated);
        const sessionData = this._buildSessionData(updatedCustomer);
        this._saveSession(sessionData);
        
        return updatedCustomer;
    },
    
    /**
     * Eliminar cliente (soft delete)
     */
    async deactivateCustomer(customerId) {
        const currentCustomer = await this.getCurrentCustomer(true);
        
        if (!currentCustomer) {
            throw new Error('No autenticado');
        }
        
        if (customerId === currentCustomer.id) {
            // Auto-desactivación
            const updated = await CustomerRepository.update(customerId, {
                estado: 'inactivo',
                activo: false
            });
            await this.logout();
            return new Customer(updated);
        }
        
        // Admin desactivando a otro
        const updated = await CustomerRepository.update(customerId, {
            estado: 'inactivo',
            activo: false
        });
        return new Customer(updated);
    },
    
    /**
     * Reactivar cliente
     */
    async activateCustomer(customerId) {
        const updated = await CustomerRepository.update(customerId, {
            estado: 'activo',
            activo: true
        });
        return new Customer(updated);
    },
    
    /**
     * Cambiar contraseña
     */
    async changePassword(customerId, currentPassword, newPassword) {
        const currentCustomer = await this.getCurrentCustomer(true);
        
        if (!currentCustomer || currentCustomer.id !== customerId) {
            throw new Error('No autorizado');
        }
        
        if (!newPassword || newPassword.length < 6) {
            throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
        }
        
        return { success: true, message: 'Contraseña actualizada exitosamente' };
    },
    
    /**
     * Verificar si está autenticado como cliente
     */
    isAuthenticated() {
        const session = this._getSession();
        return !!session && 
               session.rol === ROLES.CUSTOMER && 
               !!CustomerRepository.getCurrentAuthUser();
    },
    
    /**
     * Verificar si es cliente (versión síncrona)
     */
    isCustomerSync() {
        const session = this._getSession();
        if (!session) return false;
        return session.rol === ROLES.CUSTOMER;
    },
    
    /**
     * Obtener sesión actual
     */
    getCurrentSession() {
        return this._getSession();
    },
    
    /**
     * Validar dirección para compra
     */
    validateCheckout(customerData) {
        const customer = new Customer(customerData);
        return customer.validarParaCompra();
    },
    
    // ========== MÉTODOS PRIVADOS ==========
    
    _validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    _validatePhone(phone) {
        const re = /^\d{10}$/;
        return re.test(phone.replace(/\D/g, ''));
    },
    
    _validatePostalCode(cp) {
        const re = /^\d{5}$/;
        return re.test(cp);
    },
    
    _saveSession(customerData) {
        if (!customerData || typeof customerData !== 'object') {
            console.error('❌ Intento de guardar sesión inválida');
            return;
        }
        
        const validSession = {
            id: customerData.id || null,
            nombre: customerData.nombre || '',
            apellidoPa: customerData.apellidoPa || '',
            apellidoMa: customerData.apellidoMa || '',
            nombreCompleto: customerData.nombreCompleto || '',
            email: customerData.email || '',
            fotoPerfil: customerData.fotoPerfil || '',
            rol: ROLES.CUSTOMER,
            estado: customerData.estado || 'activo',
            iniciales: customerData.iniciales || 'C',
            fechaSesion: new Date().toISOString(),
            provider: customerData.provider || 'email',
            ultimoAcceso: new Date().toISOString(),
            version: '1.0'
        };
        
        localStorage.setItem('outlet_customer', JSON.stringify(validSession));
        console.log('✅ Sesión de customer guardada:', { 
            id: validSession.id, 
            rol: validSession.rol, 
            tieneFoto: !!validSession.fotoPerfil 
        });
    },
    
    _getSession() {
        const session = localStorage.getItem('outlet_customer');
        if (!session) return null;
        
        try {
            const parsed = JSON.parse(session);
            return parsed;
        } catch (error) {
            console.error('❌ Error parseando sesión:', error);
            return null;
        }
    },
    
    _clearSession() {
        localStorage.removeItem('outlet_customer');
        console.log('🗑️ Sesión de customer eliminada');
    },
    
    _dispatchAuthChange(customerData) {
        const event = new CustomEvent('customer:authStateChanged', { 
            detail: customerData 
        });
        window.dispatchEvent(event);
    }
};