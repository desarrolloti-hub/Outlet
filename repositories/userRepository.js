/* ========================================
   USER REPOSITORY - Outlet Val
   Operaciones CRUD directas con Firebase
   ======================================== */

// ✅ Usar URLs CDN (como en el proyecto RSI)
import { db, auth } from '/config/firebaseConfig.js';
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

const USERS_COLLECTION = 'usuarios';

export const UserRepository = {
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
    
    async update(userId, updateData) {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            await updateDoc(userRef, {
                ...updateData,
                fechaActualizacion: new Date().toISOString()
            });
            
            const updated = await this.getById(userId);
            return updated;
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    },
    
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
    
    async registerWithEmail(email, password, userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            await updateProfile(firebaseUser, {
                displayName: userData.nombreCompleto
            });
            
            await sendEmailVerification(firebaseUser);
            
            const userToSave = {
                id: firebaseUser.uid,
                ...userData,
                email: firebaseUser.email,
                provider: 'email',
                emailVerified: false,
                fechaRegistro: new Date().toISOString(),
                activo: true
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
    
    async loginWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            const userData = await this.getById(firebaseUser.uid);
            
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
    
    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const firebaseUser = userCredential.user;
            
            let userData = await this.getById(firebaseUser.uid);
            
            if (!userData) {
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
    
    async logout() {
        try {
            await signOut(auth);
            return true;
        } catch (error) {
            console.error('Error en logout:', error);
            throw new Error(`Error al cerrar sesión: ${error.message}`);
        }
    },
    
    getCurrentAuthUser() {
        return auth.currentUser;
    },
    
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