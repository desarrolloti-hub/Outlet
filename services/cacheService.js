/* ========================================
   CACHE SERVICE - IndexedDB
   ======================================== */

const DB_NAME = 'OutletVal_Cache';
const DB_VERSION = 1;

export const STORES = {
    USERS: 'users',
    PRODUCTS: 'products',
    ORDERS: 'orders'
};

let db = null;

async function initDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('Error abriendo IndexedDB:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('✅ IndexedDB inicializado');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            
            if (!database.objectStoreNames.contains(STORES.USERS)) {
                database.createObjectStore(STORES.USERS, { keyPath: 'id' });
            }
            if (!database.objectStoreNames.contains(STORES.PRODUCTS)) {
                database.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
            }
            if (!database.objectStoreNames.contains(STORES.ORDERS)) {
                database.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
            }
        };
    });
}

export async function setCache(storeName, id, data, ttl = 3600000) {
    try {
        const database = await initDB();
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