/* ========================================
   ROUTES - Definición de rutas
   ======================================== */

// Importar controllers de vistas
import { homeController } from '../modules/visitor/home/homeController.js';
import { init404Controller } from '../modules/shared/errors/404Controller.js';
import { coleccionController } from '../modules/visitor/collection/collectionController.js';
import { loginController } from '../modules/visitor/login/loginController.js';
import { wishlistController } from '../modules/visitor/wishlist/wishlistController.js';
import { cartController } from '../modules/visitor/cart/cartController.js';
import { createAccountController } from '../modules/visitor/createAccount/createAccount.js';
import { adminController } from '../modules/admin/home/homeAdminController.js';
import { productsController } from '../modules/admin/products/productsAdminController.js';

export const routes = {
    "/": {
        view: "/modules/visitor/home/home.html",
        controller: homeController
    },
      "/products": {
        view: "/modules/visitor/products/products.html",
        controller: productsController  
    },
    "/collection": {
        view: "/modules/visitor/collection/collection.html",
        controller: coleccionController  
    },
    "/login": {
    view: "/modules/visitor/login/login.html",
    controller: loginController  
    },
    "/wishlist": {
        view: "/modules/visitor/wishlist/wishlist.html",
        controller: wishlistController
    },
    "/cart":{
         view: "/modules/visitor/cart/cart.html",
        controller:cartController 
    },
    "/createAccount": {
        view: "/modules/visitor/createAccount/createAccount.html",
        controller: createAccountController
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
    "/homeAdmin": {
        view: "/modules/admin/home/homeAdmin.html",
        controller: adminController
    },
      "/productsAdmin": {
        view: "/modules/admin/products/add/productsAdmin.html",
        controller: productsController
    },
    

    '/404': {
    view: '/modules/shared/errors/404.html',
    controller: init404Controller
    }
};