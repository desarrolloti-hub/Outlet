/* ========================================
   CUSTOMER REPOSITORY - Outlet Val
   Operaciones CRUD directas con Firebase para clientes
   ======================================== */

import { db, auth } from '../config/firebaseConfig.js';
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
    limit
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendEmailVerification,
    updateProfile,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const CUSTOMERS_COLLECTION = 'clientes';

export const CustomerRepository = {
    /**
     * Guardar customer en Firestore
     */
    async save(customerData) {
        try {
            const customerRef = doc(db, CUSTOMERS_COLLECTION, customerData.id);
            await setDoc(customerRef, customerData);
            console.log('✅ Customer guardado en Firestore:', { id: customerData.id, rol: customerData.rol });
            return { id: customerData.id, ...customerData };
        } catch (error) {
            console.error('Error guardando cliente:', error);
            throw new Error(`Error al guardar cliente: ${error.message}`);
        }
    },

    /**
     * Obtener customer por ID
     */
    async getById(customerId) {
        try {
            const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
            const docSnap = await getDoc(customerRef);
            
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                console.log('📖 Customer obtenido por ID:', { id: data.id, rol: data.rol });
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo cliente:', error);
            throw new Error(`Error al obtener cliente: ${error.message}`);
        }
    },

    /**
     * Obtener customer por email
     */
    async getByEmail(email) {
        try {
            const q = query(
                collection(db, CUSTOMERS_COLLECTION), 
                where('email', '==', email.toLowerCase()),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = { id: doc.id, ...doc.data() };
                console.log('📖 Customer obtenido por email:', { email: data.email, rol: data.rol });
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error buscando customer por email:', error);
            throw new Error(`Error al buscar cliente: ${error.message}`);
        }
    },

    /**
     * Obtener todos los clientes
     */
    async getAll() {
        try {
            const q = query(
                collection(db, CUSTOMERS_COLLECTION),
                orderBy('fechaRegistro', 'desc')
            );
            const querySnapshot = await getDocs(q);
            
            const customers = [];
            querySnapshot.forEach(doc => {
                customers.push({ id: doc.id, ...doc.data() });
            });
            console.log(`📋 Total clientes obtenidos: ${customers.length}`);
            return customers;
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            throw new Error(`Error al obtener clientes: ${error.message}`);
        }
    },

    /**
     * Actualizar customer
     */
    async update(customerId, updateData) {
        try {
            const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
            await updateDoc(customerRef, {
                ...updateData,
                fechaActualizacion: new Date().toISOString()
            });
            
            const updated = await this.getById(customerId);
            console.log('✏️ Customer actualizado:', { id: customerId });
            return updated;
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            throw new Error(`Error al actualizar cliente: ${error.message}`);
        }
    },

    /**
     * Actualizar dirección del customer
     */
    async updateDireccion(customerId, direccionData) {
        try {
            const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
            await updateDoc(customerRef, {
                'direccion': direccionData,
                fechaActualizacion: new Date().toISOString()
            });
            
            return await this.getById(customerId);
        } catch (error) {
            console.error('Error actualizando dirección:', error);
            throw new Error(`Error al actualizar dirección: ${error.message}`);
        }
    },

    /**
     * Actualizar preferencias del customer
     */
    async updatePreferencias(customerId, preferenciasData) {
        try {
            const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
            await updateDoc(customerRef, {
                'preferencias': preferenciasData,
                fechaActualizacion: new Date().toISOString()
            });
            
            return await this.getById(customerId);
        } catch (error) {
            console.error('Error actualizando preferencias:', error);
            throw new Error(`Error al actualizar preferencias: ${error.message}`);
        }
    },

    /**
     * Eliminar customer (hard delete)
     */
    async delete(customerId) {
        try {
            const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
            await deleteDoc(customerRef);
            console.log('🗑️ Customer eliminado:', customerId);
            return true;
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            throw new Error(`Error al eliminar cliente: ${error.message}`);
        }
    },

    /**
     * Registrar customer con email y contraseña
     */
    async registerWithEmail(email, password, customerData) {
        try {
            console.log('📝 1. Creando customer en Auth con rol:', customerData.rol);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            console.log('✅ Customer creado en Auth:', firebaseUser.uid);
            
            const nombreCompleto = [
                customerData.nombre || '',
                customerData.apellidoPa || '',
                customerData.apellidoMa || ''
            ].filter(p => p).join(' ').trim();
            
            console.log('📝 2. Actualizando perfil...');
            await updateProfile(firebaseUser, {
                displayName: nombreCompleto || email
            });
            
            console.log('📝 3. Enviando email de verificación...');
            await sendEmailVerification(firebaseUser);
            
            const customerToSave = {
                id: firebaseUser.uid,
                nombre: customerData.nombre || '',
                apellidoPa: customerData.apellidoPa || '',
                apellidoMa: customerData.apellidoMa || '',
                email: firebaseUser.email,
                rol: 'customer', // Rol fijo
                direccion: customerData.direccion || {},
                preferencias: customerData.preferencias || {},
                provider: 'email',
                emailVerified: false,
                estado: 'activo',
                activo: true,
                fechaRegistro: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString(),
                ultimoLogin: null
            };
            
            console.log('📝 4. Guardando en Firestore con rol:', customerToSave.rol);
            await this.save(customerToSave);
            console.log('✅ Customer guardado exitosamente');
            
            return {
                user: firebaseUser,
                customerData: customerToSave
            };
        } catch (error) {
            console.error('❌ Error en registro de customer:', error);
            throw this._handleAuthError(error);
        }
    },

    /**
     * Login de customer con email y contraseña
     */
    async loginWithEmail(email, password) {
        try {
            console.log('🔐 Intentando login con email:', email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            const customerData = await this.getById(firebaseUser.uid);
            
            if (!customerData) {
                throw new Error('No se encontró perfil de cliente');
            }
            
            if (customerData.rol !== 'customer') {
                throw new Error('Esta cuenta no es de cliente');
            }
            
            console.log('✅ Customer autenticado:', { id: firebaseUser.uid, rol: customerData.rol });
            
            return {
                user: firebaseUser,
                customerData: customerData
            };
        } catch (error) {
            console.error('Error en login de customer:', error);
            throw this._handleAuthError(error);
        }
    },

    /**
     * Login de customer con Google
     */
    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const firebaseUser = userCredential.user;
            
            let customerData = await this.getById(firebaseUser.uid);
            
            if (!customerData) {
                // Registrar nuevo cliente con Google
                const newCustomer = {
                    id: firebaseUser.uid,
                    nombre: firebaseUser.displayName?.split(' ')[0] || '',
                    apellidoPa: firebaseUser.displayName?.split(' ')[1] || '',
                    apellidoMa: '',
                    email: firebaseUser.email,
                    rol: 'customer',
                    direccion: {
                        destinatario: firebaseUser.displayName || '',
                        telefono1: '',
                        telefono2: '',
                        calle: '',
                        numeroExterior: '',
                        numeroInterior: '',
                        colonia: '',
                        ciudad: '',
                        estado: '',
                        codigoPostal: '',
                        pais: 'México',
                        referencias: ''
                    },
                    preferencias: {
                        newsletter: false,
                        notificaciones: true
                    },
                    provider: 'google',
                    emailVerified: firebaseUser.emailVerified,
                    estado: 'activo',
                    activo: true,
                    fechaRegistro: new Date().toISOString(),
                    fechaActualizacion: new Date().toISOString(),
                    ultimoLogin: new Date().toISOString()
                };
                
                await this.save(newCustomer);
                customerData = newCustomer;
                console.log('✅ Nuevo customer registrado con Google');
            } else {
                await this.update(firebaseUser.uid, {
                    ultimoLogin: new Date().toISOString()
                });
                customerData = await this.getById(firebaseUser.uid);
            }
            
            console.log('✅ Customer autenticado con Google:', { id: firebaseUser.uid, rol: customerData.rol });
            
            return {
                user: firebaseUser,
                customerData: customerData
            };
        } catch (error) {
            console.error('Error en login con Google:', error);
            throw this._handleAuthError(error);
        }
    },

    /**
     * Cerrar sesión
     */
    async logout() {
        try {
            await signOut(auth);
            console.log('👋 Sesión cerrada');
            return true;
        } catch (error) {
            console.error('Error en logout:', error);
            throw new Error(`Error al cerrar sesión: ${error.message}`);
        }
    },

    /**
     * Obtener usuario actual de Auth
     */
    getCurrentAuthUser() {
        return auth.currentUser;
    },

    /**
     * Manejar errores de autenticación
     */
    _handleAuthError(error) {
        const errors = {
            'auth/email-already-in-use': 'Este correo ya está registrado',
            'auth/invalid-email': 'Correo electrónico inválido',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/popup-closed-by-user': 'Ventana de Google cerrada',
            'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo usando otro método'
        };
        
        return new Error(errors[error.code] || `Error de autenticación: ${error.message}`);
    }
};