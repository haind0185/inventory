import SaleOffProductController from '../controllers/SaleOffProductController';
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

// router.get('/list', ProductController.list);


const SaleOffRouter = router;

export default SaleOffRouter;
