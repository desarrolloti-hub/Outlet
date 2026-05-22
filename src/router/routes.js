/* ========================================
   ROUTES - Definición de rutas
   ======================================== */

// Importar controllers de vistas
import { homeController } from '../modules/visitor/home/homeController.js';
import { init404Controller } from '../modules/shared/errors/404Controller.js';
import { productsController } from '../modules/visitor/products/productsController.js';
import { coleccionController } from '../modules/visitor/collection/collectionController.js';
import { loginController } from '../modules/visitor/login/loginController.js';
import { wishlistController } from '../modules/visitor/wishlist/wishlist.js';

export const routes = {
    "/": {
        view: "/modules/visitor/home/home.html",
        controller: homeController
    },
      "/products": {
        view: "/modules/visitor/products/products.html",
        controller: productsController  // ← Cambiar null por productsController
    },
    "/collection": {
        view: "/modules/visitor/collection/collection.html",
        controller: coleccionController  // ← CAMBIAR null por coleccionController
    },
    "/login": {
    view: "/modules/visitor/login/login.html",
    controller: loginController  // ← CAMBIAR null por loginController
    },
    "/wishlist": {
        view: "/modules/visitor/wishlist/wishlist.html",
        controller: wishlistController
    },
    "/services": {
        view: "/src/views/services.html",
        controller: null
    },
    "/nosotros": {
        view: "/src/views/nosotros.html",
        controller: null
    },
    "/contacto": {
        view: "/src/views/contacto.html",
        controller: null
    },
    "/blogs": {
        view: "/src/views/blogs.html",
        controller: null
    },
    "/admin": {
        view: "/src/views/admin.html",
        controller: null
    },
    '/404': {
    view: '/modules/shared/errors/404.html',
    controller: init404Controller
    }
};