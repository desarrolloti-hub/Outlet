/* ========================================
   USER REPOSITORY - Outlet Val
   Operaciones CRUD directas con Firebase
   ======================================== */

import { db, auth } from '/firebase/config.js';
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
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendEmailVerification,
    updateProfile,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const USERS_COLLECTION = 'usuarios';

export const UserRepository = {
    // ========== FIRESTORE OPERATIONS ==========
    
    /**
     * Crear/Guardar usuario en Firestore
     */
    async save(userData) {
        try {
            const userRef = doc(db, USERS_COLLECTION, userData.id);
            await setDoc(userRef, userData);
            return { id: userData.id, ...userData };
        } catch (error) {
            console.error('Error guardando usuario:', error);
            throw new Error(`Error al guardar usuario: ${error.message}`);
        }
    },
    
    /**
     * Obtener usuario por ID
     */
    async getById(userId) {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            throw new Error(`Error al obtener usuario: ${error.message}`);
        }
    },
    
    /**
     * Obtener usuario por email
     */
    async getByEmail(email) {
        try {
            const q = query(
                collection(db, USERS_COLLECTION), 
                where('email', '==', email),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error buscando por email:', error);
            throw new Error(`Error al buscar usuario: ${error.message}`);
        }
    },
    
    /**
     * Actualizar usuario
     */
    async update(userId, updateData) {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            await updateDoc(userRef, {
                ...updateData,
                fechaActualizacion: new Date().toISOString()
            });
            
            // Obtener datos actualizados
            const updated = await this.getById(userId);
            return updated;
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    },
    
    /**
     * Actualizar solo dirección
     */
    async updateDireccion(userId, direccionData) {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            await updateDoc(userRef, {
                'direccion': direccionData,
                fechaActualizacion: new Date().toISOString()
            });
            
            return await this.getById(userId);
        } catch (error) {
            console.error('Error actualizando dirección:', error);
            throw new Error(`Error al actualizar dirección: ${error.message}`);
        }
    },
    
    /**
     * Eliminar usuario (soft delete)
     */
    async delete(userId) {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            await updateDoc(userRef, {
                activo: false,
                fechaActualizacion: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    },
    
    /**
     * Eliminar usuario permanentemente
     */
    async deletePermanently(userId) {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            await deleteDoc(userRef);
            return true;
        } catch (error) {
            console.error('Error eliminando usuario permanentemente:', error);
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    },
    
    /**
     * Obtener todos los usuarios (admin)
     */
    async getAll() {
        try {
            const q = query(
                collection(db, USERS_COLLECTION),
                orderBy('fechaRegistro', 'desc')
            );
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    },
    
    // ========== AUTHENTICATION OPERATIONS ==========
    
    /**
     * Registro con email y contraseña
     */
    async registerWithEmail(email, password, userData) {
        try {
            // Crear usuario en Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            // Actualizar perfil con nombre
            await updateProfile(firebaseUser, {
                displayName: userData.nombreCompleto || `${userData.nombre} ${userData.apellidoPa}`
            });
            
            // Enviar verificación de email
            await sendEmailVerification(firebaseUser);
            
            // Guardar en Firestore
            const userToSave = {
                id: firebaseUser.uid,
                nombre: userData.nombre,
                apellidoPa: userData.apellidoPa || '',
                apellidoMa: userData.apellidoMa || '',
                email: firebaseUser.email,
                provider: 'email',
                emailVerified: false,
                direccion: userData.direccion || {
                    destinatario: '',
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
                fechaRegistro: new Date().toISOString(),
                activo: true,
                preferencias: {
                    newsletter: false,
                    notificaciones: true
                }
            };
            
            await this.save(userToSave);
            
            return {
                user: firebaseUser,
                userData: userToSave
            };
        } catch (error) {
            console.error('Error en registro:', error);
            throw this._handleAuthError(error);
        }
    },
    
    /**
     * Login con email y contraseña
     */
    async loginWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            // Obtener datos adicionales de Firestore
            const userData = await this.getById(firebaseUser.uid);
            
            // Actualizar último login
            await this.update(firebaseUser.uid, {
                ultimoLogin: new Date().toISOString()
            });
            
            return {
                user: firebaseUser,
                userData: userData || null
            };
        } catch (error) {
            console.error('Error en login:', error);
            throw this._handleAuthError(error);
        }
    },
    
    /**
     * Login con Google
     */
    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const firebaseUser = userCredential.user;
            
            // Verificar si ya existe en Firestore
            let userData = await this.getById(firebaseUser.uid);
            
            if (!userData) {
                // Usuario nuevo - crear registro
                userData = {
                    id: firebaseUser.uid,
                    nombre: firebaseUser.displayName?.split(' ')[0] || '',
                    apellidoPa: firebaseUser.displayName?.split(' ')[1] || '',
                    apellidoMa: '',
                    email: firebaseUser.email,
                    provider: 'google',
                    emailVerified: firebaseUser.emailVerified,
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
                    fechaRegistro: new Date().toISOString(),
                    ultimoLogin: new Date().toISOString(),
                    activo: true,
                    preferencias: {
                        newsletter: false,
                        notificaciones: true
                    }
                };
                
                await this.save(userData);
            } else {
                // Actualizar último login
                await this.update(firebaseUser.uid, {
                    ultimoLogin: new Date().toISOString()
                });
                userData = await this.getById(firebaseUser.uid);
            }
            
            return {
                user: firebaseUser,
                userData: userData
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