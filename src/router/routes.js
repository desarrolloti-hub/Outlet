/* ========================================
   ROUTES - Definición de rutas
   ======================================== */

// Importar controllers de vistas



//         ---------   visitor   ---------

import { homeController } from '../modules/visitor/home/homeController.js';
import { init404Controller } from '../modules/shared/errors/404Controller.js';
import { coleccionController } from '../modules/visitor/collection/collectionController.js';
import { loginController } from '../modules/visitor/login/loginController.js';
import { wishlistController } from '../modules/visitor/wishlist/wishlistController.js';
import { cartController } from '../modules/visitor/cart/cartController.js';
import { createAccountController } from '../modules/visitor/createAccount/createAccount.js';
import { adminController } from '../modules/admin/home/homeAdminController.js';
import { productsController } from '../modules/visitor/products/productsController.js';



//         ---------   customer   ---------
//  importar controllers de customer de edición de perfil

import { userProfileEditController } from '../modules/customer/editUser/editUser.js';



//         ---------   Admin   ---------
//  importar controllers de administración de productos

import { productCreateController } from '../modules/admin/products/create/createProductsController.js';
import { productListController } from '../modules/admin/products/productsListController.js';
import { editProductController }from '../modules/admin/products/edit/editProductController.js';

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



    /* ========================================
         Rutas de administración de productos
       ======================================== */
      "/createProducts": {
        view: "/modules/admin/products/create/createProducts.html",
        controller: productCreateController
    },
       "/productsList": {
        view: "/modules/admin/products/list/productsList.html",
        controller: productListController
    },
         "/editProducts": {
        view: "/modules/admin/products/edit/editProducts.html",
        controller: editProductController
    },


       /* ========================================
         Rutas de customer 
         ======================================== */
         
        "/editUser": {
        view: "/modules/customer/editUser/editUser.html",
        controller: userProfileEditController
    },


    

    /* ========================================
         Rutas de error y fallback  
   ======================================== */

    '/404': {
    view: '/modules/shared/errors/404.html',
    controller: init404Controller
    }
};