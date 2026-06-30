/* ========================================
   CACHE SERVICE - IndexedDB
   ======================================== */

const DB_NAME = 'OutletVal_Cache';
const DB_VERSION = 4; // 👈 INCREMENTA A 4

export const STORES = {
    USERS: 'users',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    CATEGORIES: 'categories',
};

let db = null;
let dbReady = false;
let initializationPromise = null;

async function initDB() {
    // Si ya hay una promesa de inicialización en curso, esperarla
    if (initializationPromise) {
        return initializationPromise;
    }
    
    if (db && dbReady) {
        return db;
    }
    
    initializationPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('❌ Error abriendo IndexedDB:', request.error);
            dbReady = false;
            initializationPromise = null;
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            dbReady = true;
            initializationPromise = null;
            console.log('✅ IndexedDB inicializado correctamente');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            console.log('🔄 Actualizando IndexedDB a versión', DB_VERSION);
            
            // ✅ Crear TODOS los stores sin eliminar los existentes primero
            const allStores = Object.values(STORES);
            allStores.forEach(storeName => {
                if (!database.objectStoreNames.contains(storeName)) {
                    database.createObjectStore(storeName, { keyPath: 'id' });
                    console.log(`✅ Store ${storeName} creado`);
                } else {
                    console.log(`ℹ️ Store ${storeName} ya existe`);
                }
            });
        };
    });
    
    return initializationPromise;
}

export async function setCache(storeName, id, data, ttl = 3600000) {
    try {
        const database = await initDB();
        
        if (!database.objectStoreNames.contains(storeName)) {
            console.warn(`⚠️ Store "${storeName}" no existe, omitiendo guardado`);
            return false;
        }
        
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const cacheItem = {
            id: id,
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        };
        
        return new Promise((resolve, reject) => {
            const request = store.put(cacheItem);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error guardando en caché:', error);
        return false;
    }
}

export async function getCache(storeName, id) {
    try {
        const database = await initDB();
        
        if (!database.objectStoreNames.contains(storeName)) {
            console.warn(`⚠️ Store "${storeName}" no existe, retornando null`);
            return null;
        }
        
        const transaction = database.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => {
                const result = request.result;
                if (result && (Date.now() - result.timestamp) < result.ttl) {
                    resolve(result.data);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error obteniendo de caché:', error);
        return null;
    }
}

export async function clearCache(storeName) {
    try {
        const database = await initDB();
        
        if (!database.objectStoreNames.contains(storeName)) {
            console.warn(`⚠️ Store "${storeName}" no existe, omitiendo limpieza`);
            return true;
        }
        
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error limpiando caché:', error);
        return false;
    }
}

export const CacheService = {
    setCache,
    getCache,
    clearCache,
    STORES
};