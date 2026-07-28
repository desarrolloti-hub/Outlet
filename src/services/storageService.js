/* ========================================
   STORAGE SERVICE - Outlet Val
   Servicio para manejar Firebase Storage
   ======================================== */

import { storage } from '../../config/firebaseConfig.js';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    getMetadata
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';

// ========================================
// CONFIGURACIÓN
// ========================================
const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_QUALITY = 0.85;

/**
 * Comprimir imagen usando Canvas
 */
function compressImage(file, maxSizeMB = DEFAULT_MAX_SIZE_MB, quality = DEFAULT_QUALITY) {
    return new Promise((resolve, reject) => {
        // Si el archivo ya es pequeño, devolverlo sin comprimir
        if (file.size / (1024 * 1024) <= maxSizeMB) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar si es muy grande (máximo 2000px)
                const MAX_SIZE = 2000;
                if (width > MAX_SIZE || height > MAX_SIZE) {
                    const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Determinar formato
                const mimeType = file.type || 'image/jpeg';
                let outputFormat = mimeType;

                // Si es webp, mantenerlo, sino usar jpeg
                if (mimeType !== 'image/webp') {
                    outputFormat = 'image/jpeg';
                }

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Error al comprimir la imagen'));
                        return;
                    }

                    // Crear nuevo archivo
                    const compressedFile = new File([blob], file.name, {
                        type: outputFormat,
                        lastModified: Date.now()
                    });

                    // Verificar tamaño
                    const sizeMB = compressedFile.size / (1024 * 1024);
                    if (sizeMB > maxSizeMB) {
                        // Si aún es muy grande, comprimir con menos calidad
                        const newQuality = quality * 0.7;
                        if (newQuality > 0.3) {
                            compressImage(file, maxSizeMB, newQuality).then(resolve).catch(reject);
                            return;
                        }
                    }

                    resolve(compressedFile);
                }, outputFormat, quality);
            };

            img.onerror = () => {
                reject(new Error('Error al cargar la imagen para comprimir'));
            };
        };

        reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
        };
    });
}

// ========================================
// MÉTODOS PRINCIPALES
// ========================================

export const StorageService = {

    /**
     * Subir una imagen a Firebase Storage
     * @param {File} file - Archivo de imagen
     * @param {string} path - Ruta en Storage (ej: 'productos/OUT-001/main.jpg')
     * @param {Object} options - Opciones de compresión
     * @returns {Promise<{url: string, path: string, metadata: Object}>}
     */
    async uploadImage(file, path, options = {}) {
        try {
            const { maxSizeMB = DEFAULT_MAX_SIZE_MB, quality = DEFAULT_QUALITY } = options;

            // Validar archivo
            if (!file) {
                throw new Error('No se proporcionó ningún archivo');
            }

            // Validar tipo
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                throw new Error(`Formato de imagen no soportado: ${file.type}. Usa JPG, PNG o WEBP.`);
            }

            // Comprimir imagen si es necesario
            console.log(`📸 Comprimiendo imagen: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            const compressedFile = await compressImage(file, maxSizeMB, quality);
            console.log(`✅ Imagen comprimida: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

            // Crear referencia en Storage
            const storageRef = ref(storage, path);

            // Subir archivo con progreso
            const uploadTask = uploadBytesResumable(storageRef, compressedFile);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Progreso
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`📤 Subiendo: ${progress.toFixed(1)}%`);
                    },
                    (error) => {
                        // Error
                        console.error('❌ Error al subir archivo:', error);
                        reject(new Error(`Error al subir imagen: ${error.message}`));
                    },
                    async () => {
                        // Completado
                        try {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            console.log('✅ Imagen subida exitosamente:', url);
                            resolve({
                                url: url,
                                path: path,
                                metadata: {
                                    size: compressedFile.size,
                                    type: compressedFile.type,
                                    name: file.name
                                }
                            });
                        } catch (error) {
                            reject(new Error(`Error al obtener URL de descarga: ${error.message}`));
                        }
                    }
                );
            });

        } catch (error) {
            console.error('❌ Error en uploadImage:', error);
            throw error;
        }
    },

    /**
     * Subir múltiples imágenes
     * @param {File[]} files - Array de archivos de imagen
     * @param {string} basePath - Ruta base en Storage
     * @param {Object} options - Opciones de compresión
     * @returns {Promise<{urls: string[], paths: string[], metadata: Object[]}>}
     */
    async uploadMultipleImages(files, basePath, options = {}) {
        try {
            if (!files || files.length === 0) {
                return { urls: [], paths: [], metadata: [] };
            }

            const results = [];

            // Subir en paralelo con límite de concurrencia
            const BATCH_SIZE = 5;
            for (let i = 0; i < files.length; i += BATCH_SIZE) {
                const batch = files.slice(i, i + BATCH_SIZE);
                const batchPromises = batch.map((file, idx) => {
                    const path = `${basePath}/img_${i + idx}_${Date.now()}.jpg`;
                    return this.uploadImage(file, path, options);
                });

                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
            }

            return {
                urls: results.map(r => r.url),
                paths: results.map(r => r.path),
                metadata: results.map(r => r.metadata)
            };

        } catch (error) {
            console.error('❌ Error en uploadMultipleImages:', error);
            throw new Error(`Error al subir imágenes: ${error.message}`);
        }
    },

    /**
     * Eliminar una imagen de Firebase Storage
     * @param {string} path - Ruta del archivo en Storage
     * @returns {Promise<void>}
     */
    async deleteImage(path) {
        try {
            if (!path) {
                throw new Error('Se requiere la ruta del archivo');
            }

            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
            console.log(`🗑️ Imagen eliminada: ${path}`);

        } catch (error) {
            console.error('❌ Error al eliminar imagen:', error);
            throw new Error(`Error al eliminar imagen: ${error.message}`);
        }
    },

    /**
     * Eliminar múltiples imágenes
     * @param {string[]} paths - Array de rutas en Storage
     * @returns {Promise<{success: string[], failed: string[]}>}
     */
    async deleteMultipleImages(paths) {
        const results = {
            success: [],
            failed: []
        };

        if (!paths || paths.length === 0) {
            return results;
        }

        const deletePromises = paths.map(path => {
            return this.deleteImage(path)
                .then(() => results.success.push(path))
                .catch((error) => {
                    results.failed.push({ path, error: error.message });
                });
        });

        await Promise.all(deletePromises);
        return results;
    },

    /**
     * Obtener URL de una imagen
     * @param {string} path - Ruta del archivo en Storage
     * @returns {Promise<string>}
     */
    async getImageUrl(path) {
        try {
            if (!path) {
                throw new Error('Se requiere la ruta del archivo');
            }

            const storageRef = ref(storage, path);
            const url = await getDownloadURL(storageRef);
            return url;

        } catch (error) {
            console.error('❌ Error al obtener URL de imagen:', error);
            throw new Error(`Error al obtener URL: ${error.message}`);
        }
    },

    /**
     * Listar todas las imágenes en una carpeta
     * @param {string} folderPath - Ruta de la carpeta
     * @returns {Promise<{urls: string[], paths: string[], metadata: Object[]}>}
     */
    async listImages(folderPath) {
        try {
            if (!folderPath) {
                throw new Error('Se requiere la ruta de la carpeta');
            }

            const folderRef = ref(storage, folderPath);
            const result = await listAll(folderRef);

            const items = await Promise.all(
                result.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    const metadata = await getMetadata(itemRef);
                    return {
                        url,
                        path: itemRef.fullPath,
                        metadata
                    };
                })
            );

            return {
                urls: items.map(i => i.url),
                paths: items.map(i => i.path),
                metadata: items.map(i => i.metadata)
            };

        } catch (error) {
            console.error('❌ Error al listar imágenes:', error);
            throw new Error(`Error al listar imágenes: ${error.message}`);
        }
    },

    /**
     * Generar ruta para imagen de producto
     * @param {string} sku - SKU del producto
     * @param {string} type - Tipo de imagen ('main', 'gallery')
     * @param {number} index - Índice (para galería)
     * @returns {string}
     */
    generateProductImagePath(sku, type = 'main', index = 0) {
        const timestamp = Date.now();
        const cleanSku = sku.replace(/[^a-zA-Z0-9-_]/g, '');

        if (type === 'main') {
            return `productos/${cleanSku}/main_${timestamp}.jpg`;
        } else {
            return `productos/${cleanSku}/gallery_${timestamp}_${index}.jpg`;
        }
    },

    /**
     * Convertir File a base64 (para preview)
     * @param {File} file
     * @returns {Promise<string>}
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No se proporcionó ningún archivo'));
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
        });
    }
};

export default StorageService;