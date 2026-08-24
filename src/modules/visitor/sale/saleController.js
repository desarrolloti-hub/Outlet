import { coleccionController } from '../collection/collectionController.js';

export async function saleController() {
    window.__outletSaleMode = true;

    try {
        await coleccionController();
        const sidebar = document.querySelector('.coleccion-sidebar');
        if (sidebar) {
            sidebar.remove();
        }

        const main = document.querySelector('.coleccion-main-container');
        if (main) {
            main.style.gridTemplateColumns = '1fr';
        }
    } finally {
        delete window.__outletSaleMode;
    }
}
