/* ========================================
   ADMIN REPOSITORY - Outlet Val
   Operaciones CRUD directas con Firebase para administradores
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

const ADMINS_COLLECTION = 'administradores';

export const AdminRepository = {
    /**
     * Guardar admin en Firestore
     */
    async save(adminData) {
        try {
            const adminRef = doc(db, ADMINS_COLLECTION, adminData.id);
            await setDoc(adminRef, adminData);
            console.log('✅ Admin guardado en Firestore:', { id: adminData.id, rol: adminData.rol });
            return { id: adminData.id, ...adminData };
        } catch (error) {
            console.error('Error guardando administrador:', error);
            throw new Error(`Error al guardar administrador: ${error.message}`);
        }
    },

    /**
     * Obtener admin por ID
     */
    async getById(adminId) {
        try {
            const adminRef = doc(db, ADMINS_COLLECTION, adminId);
            const docSnap = await getDoc(adminRef);
            
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                console.log('📖 Admin obtenido por ID:', { id: data.id, rol: data.rol });
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo administrador:', error);
            throw new Error(`Error al obtener administrador: ${error.message}`);
        }
    },

    /**
     * Obtener admin por email
     */
    async getByEmail(email) {
        try {
            const q = query(
                collection(db, ADMINS_COLLECTION), 
                where('email', '==', email.toLowerCase()),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = { id: doc.id, ...doc.data() };
                console.log('📖 Admin obtenido por email:', { email: data.email, rol: data.rol });
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error buscando admin por email:', error);
            throw new Error(`Error al buscar administrador: ${error.message}`);
        }
    },

    /**
     * Obtener todos los administradores
     */
    async getAll() {
        try {
            const q = query(
                collection(db, ADMINS_COLLECTION),
                orderBy('fechaCreacion', 'desc')
            );
            const querySnapshot = await getDocs(q);
            
            const admins = [];
            querySnapshot.forEach(doc => {
                admins.push({ id: doc.id, ...doc.data() });
            });
            console.log(`📋 Total admins obtenidos: ${admins.length}`);
            return admins;
        } catch (error) {
            console.error('Error obteniendo administradores:', error);
            throw new Error(`Error al obtener administradores: ${error.message}`);
        }
    },

    /**
     * Actualizar admin
     */
    async update(adminId, updateData) {
        try {
            const adminRef = doc(db, ADMINS_COLLECTION, adminId);
            await updateDoc(adminRef, {
                ...updateData,
                fechaActualizacion: new Date().toISOString()
            });
            
            const updated = await this.getById(adminId);
            console.log('✏️ Admin actualizado:', { id: adminId, rol: updated?.rol });
            return updated;
        } catch (error) {
            console.error('Error actualizando administrador:', error);
            throw new Error(`Error al actualizar administrador: ${error.message}`);
        }
    },

    /**
     * Eliminar admin
     */
    async delete(adminId) {
        try {
            const adminRef = doc(db, ADMINS_COLLECTION, adminId);
            await deleteDoc(adminRef);
            console.log('🗑️ Admin eliminado:', adminId);
            return true;
        } catch (error) {
            console.error('Error eliminando administrador:', error);
            throw new Error(`Error al eliminar administrador: ${error.message}`);
        }
    },

    /**
     * Registrar admin con email y contraseña
     */
    async registerWithEmail(email, password, adminData) {
        try {
            console.log('📝 1. Creando admin en Auth con rol:', adminData.rol);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            console.log('✅ Admin creado en Auth:', firebaseUser.uid);
            
            const nombreCompleto = [
                adminData.nombre || '',
                adminData.apellidoPa || '',
                adminData.apellidoMa || ''
            ].filter(p => p).join(' ').trim();
            
            console.log('📝 2. Actualizando perfil...');
            await updateProfile(firebaseUser, {
                displayName: nombreCompleto || email
            });
            
            const adminToSave = {
                id: firebaseUser.uid,
                nombre: adminData.nombre || '',
                apellidoPa: adminData.apellidoPa || '',
                apellidoMa: adminData.apellidoMa || '',
                email: firebaseUser.email,
                rol: adminData.rol || 'admin', // ✅ Usar el rol del adminData
                estado: adminData.estado || 'activo',
                permisos: adminData.permisos || null,
                provider: 'email',
                emailVerified: false,
                intentosFallidos: 0,
                bloqueadoHasta: null,
                fechaCreacion: new Date().toISOString(),
                ultimoAcceso: null,
                activo: true
            };
            
            console.log('📝 3. Guardando en Firestore con rol:', adminToSave.rol);
            await this.save(adminToSave);
            console.log('✅ Admin guardado exitosamente');
            
            return {
                user: firebaseUser,
                adminData: adminToSave
            };
        } catch (error) {
            console.error('❌ Error en registro de admin:', error);
            throw this._handleAuthError(error);
        }
    },

    /**
     * Login de admin con email y contraseña
     */
    async loginWithEmail(email, password) {
        try {
            console.log('🔐 Intentando login con email:', email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            const adminData = await this.getById(firebaseUser.uid);
            
            if (!adminData) {
                throw new Error('No tiene permisos de administrador');
            }
            
            console.log('✅ Admin autenticado:', { id: firebaseUser.uid, rol: adminData.rol });
            
            await this.update(firebaseUser.uid, {
                ultimoAcceso: new Date().toISOString()
            });
            
            return {
                user: firebaseUser,
                adminData: adminData
            };
        } catch (error) {
            console.error('Error en login de admin:', error);
            throw this._handleAuthError(error);
        }
    },

    /**
     * Login de admin con Google
     */
    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const firebaseUser = userCredential.user;
            
            let adminData = await this.getById(firebaseUser.uid);
            
            if (!adminData) {
                throw new Error('No tiene permisos de administrador. Contacte al soporte.');
            }
            
            console.log('✅ Admin autenticado con Google:', { id: firebaseUser.uid, rol: adminData.rol });
            
            await this.update(firebaseUser.uid, {
                ultimoAcceso: new Date().toISOString()
            });
            
            adminData = await this.getById(firebaseUser.uid);
            
            return {
                user: firebaseUser,
                adminData: adminData
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
     * Actualizar intentos fallidos
     */
    async updateFailedAttempts(email, increment = true) {
        try {
            const admin = await this.getByEmail(email);
            if (!admin) return null;
            
            const updateData = {
                intentosFallidos: increment ? (admin.intentosFallidos || 0) + 1 : 0
            };
            
            if (increment && updateData.intentosFallidos >= 5) {
                const bloqueoFecha = new Date();
                bloqueoFecha.setMinutes(bloqueoFecha.getMinutes() + 15);
                updateData.bloqueadoHasta = bloqueoFecha.toISOString();
            } else if (!increment) {
                updateData.bloqueadoHasta = null;
            }
            
            await this.update(admin.id, updateData);
            return await this.getByEmail(email);
        } catch (error) {
            console.error('Error actualizando intentos fallidos:', error);
            return null;
        }
    },

    /**
     * Inicializar admin por defecto (solo si no existen)
     */
    async initializeDefaultAdmin() {
        const admins = await this.getAll();
        
        if (admins.length === 0) {
            console.log('⚠️ No hay admins, creando admin por defecto...');
            
            const defaultAdmin = {
                id: 'default-admin-001',
                email: 'admin@outlet.com',
                nombre: 'Administrador',
                apellidoPa: 'Principal',
                apellidoMa: '',
                rol: 'admin', // ✅ Rol 'admin'
                estado: 'activo',
                provider: 'email',
                emailVerified: true,
                intentosFallidos: 0,
                bloqueadoHasta: null,
                fechaCreacion: new Date().toISOString(),
                activo: true,
                permisos: []
            };
            
            await this.save(defaultAdmin);
            console.log('✅ Admin por defecto creado con rol: admin');
        }
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