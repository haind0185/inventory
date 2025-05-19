import SaleOffProductController from '../controllers/SaleOffProductController';
import SaleStaffController from '../controllers/SaleStaffController';
import DeliveryStaffController from '../controllers/DeliveryStaffController';
import CustomerController from '../controllers/CustomerController';
import SaleOffStockInController from '../controllers/SaleOffStockInController';
import SaleOffStockController from '../controllers/SaleOffStockController';
import { upload, setPermissions } from './multer';
const express = require('express');
const multer = require('multer');
const router = express.Router();

router.get('/products', SaleOffProductController.index);
router.post('/products', SaleOffProductController.store);
router.get('/products/show', SaleOffProductController.show);
router.put('/products', SaleOffProductController.update);
router.post('/products/delete', SaleOffProductController.delete);
router.post('/products/import', upload.single('file'), setPermissions, SaleOffProductController.import);
router.post('/products/bulkCreate', SaleOffProductController.bulkCreate);
router.get('/products/list', SaleOffProductController.list);

router.get('/sale-staffs', SaleStaffController.index);
router.post('/sale-staffs', SaleStaffController.store);
router.get('/sale-staffs/show', SaleStaffController.show);
router.put('/sale-staffs', SaleStaffController.update);
router.post('/sale-staffs/delete', SaleStaffController.delete);
// router.get('/sale-staffs/list', SaleStaffController.list);

router.get('/delivery-staffs', DeliveryStaffController.index);
router.post('/delivery-staffs', DeliveryStaffController.store);
router.get('/delivery-staffs/show', DeliveryStaffController.show);
router.put('/delivery-staffs', DeliveryStaffController.update);
router.post('/delivery-staffs/delete', DeliveryStaffController.delete);
// router.get('/delivery-staffs/list', DeliveryStaffController.list);

router.get('/customers', CustomerController.index);
router.post('/customers', CustomerController.store);
router.get('/customers/show', CustomerController.show);
router.put('/customers', CustomerController.update);
router.post('/customers/delete', CustomerController.delete);
// router.get('/customers/list', CustomerController.list);

router.get('/stock-ins', SaleOffStockInController.index);
router.post('/stock-ins', SaleOffStockInController.store);
router.post('/stock-ins/import', upload.single('file'), setPermissions, SaleOffStockInController.import);
router.get('/stock-ins/show', SaleOffStockInController.show);
router.post('/stock-ins/update', SaleOffStockInController.update);

router.get('/stock/total', SaleOffStockController.total);
router.get('/stock/totalPrice', SaleOffStockController.totalPrice);


const SaleOffRouter = router;

export default SaleOffRouter;
