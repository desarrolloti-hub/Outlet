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
import { productsController } from '../modules/visitor/products/productsController.js';


//         ---------   customer   ---------
//  importar controllers de customer de edición de perfil

import { userProfileEditController } from '../modules/customer/editUser/editUser.js';
import { homeCustomerController } from '../modules/customer/home/homeCustumerController.js';



//         ---------   Admin   ---------
//  importar controllers de administración de productos
import { adminController } from '../modules/admin/home/homeAdminController.js';
import { createAccountAdminController} from '../modules/admin/createAccount/createAccountAdminController.js';

import {readCategoriesController} from '../modules/admin/categories/read/readCategoriesController.js';
import {categoriesCreateController } from '../modules/admin/categories/create/createCategoriesController.js';
import { updateCategoryController } from '../modules/admin/categories/update/updateCategoriesController.js';

import { productCreateController } from '../modules/admin/products/create/createProductsController.js';
import { productListController } from '../modules/admin/products/productsListController.js';
import { editProductController }from '../modules/admin/products/edit/editProductController.js';

import {readCustomersController}from '../modules/admin/user/create/viewCustumer.js'
import {readAdminsController}from '../modules/admin/user/read/readAdminsController.js'
import {updateAdminController} from '../modules/admin/user/update/updateAdminsController.js'



export const routes = {

        /* ========================================
                        visitor
       ======================================== */

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
    

    /* ========================================
         Rutas de administración de productos
       ======================================== */
    "/homeAdmin": {
        view: "/modules/admin/home/homeAdmin.html",
        controller: adminController
    },
    "/createCategories": {
        view: "/modules/admin/categories/create/createCategories.html",
        controller: categoriesCreateController
    },
    "/readCategories": {
    view: "/modules/admin/categories/read/readCategories.html",
    controller: readCategoriesController 
    },
    "/updateCategories": {
        view: "/modules/admin/categories/update/updateCategories.html",
        controller: updateCategoryController
    },
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
        "/createAccountAdmin": {
        view: "/modules/admin/createAccount/createAccountAdmin.html",
        controller: createAccountAdminController
    
    },
        "/viewCustumer":{
        view:"/modules/admin/user/create/viewCustumer.html",
        controller: readCustomersController
    },

    "/readAdmins":{
        view:"/modules/admin/user/read/readAdmins.html",
        controller: readAdminsController 
    },

    "/updateAdmins":{
        view:"/modules/admin/user/update/updateAdmins.html",
        controller: updateAdminController
    },

       /* ========================================
         Rutas de customer 
         ======================================== */
         
    "/editUser":{
        view: "/modules/customer/editUser/editUser.html",
        controller: userProfileEditController
    },
    "/homeCustomer":{
        view: "/modules/customer/home/homeCustomer.html",
        controller: homeCustomerController
    },
    



    

    /* ========================================
         Rutas de error y fallback  
   ======================================== */

    '/404': {
    view: '/modules/shared/errors/404.html',
    controller: init404Controller
    }
};