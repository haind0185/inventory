import moment from 'moment';
import InventoryController from '../controllers/InventoryController';
import { Service } from '../controllers/common/download';
import { upload, setPermissions } from './multer';
const express = require('express');
const router = express.Router();
const path = require('path');
const { app } = require('electron');

router.get('/', InventoryController.index);
router.get('/list', InventoryController.list);
router.get('/total', InventoryController.total);
router.get('/totalPrice', InventoryController.totalPrice);
router.get('/product', InventoryController.product);

router.get('/download-database', async (req, res) => {
    const databasePath = app.isPackaged
        ? path.join(process.resourcesPath, '../database.sqlite')
        : path.join(__dirname, '../../database.sqlite');
    let filename = moment().format('YYYYMMDD_HHmmss') + '_database.sqlite';

    const r = await Service.copy(databasePath, filename);
    return res.json({ path: r });
});

router.get('/export-report', InventoryController.exportReport);
router.post('/stocktaking', upload.single('file'), setPermissions, InventoryController.stocktaking);
router.post('/export-stocktaking', InventoryController.exportStocktaking);

const InventoryRouter = router;

export default InventoryRouter;
