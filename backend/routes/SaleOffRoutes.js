import SaleOffProductController from '../controllers/SaleOffProductController';
import SaleStaffController from '../controllers/SaleStaffController';
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
// router.get('/products/list', ProductController.list);

router.get('/sale-staffs', SaleStaffController.index);
router.post('/sale-staffs', SaleStaffController.store);
router.get('/sale-staffs/show', SaleStaffController.show);
router.put('/sale-staffs', SaleStaffController.update);
router.post('/sale-staffs/delete', SaleStaffController.delete);
// router.get('/sale-staffs/list', ProductController.list);


const SaleOffRouter = router;

export default SaleOffRouter;
