import ProductController from '../controllers/ProductController';
import { upload, setPermissions } from './multer';
const express = require('express');
const multer = require('multer');
const router = express.Router();

// const upload = multer({ dest: 'resources/app/uploads/' });

router.get('/', ProductController.index);

router.post('/', ProductController.store);

router.put('/', ProductController.update);

router.post('/import', upload.single('file'), setPermissions, ProductController.import);

router.post('/bulkCreate', ProductController.bulkCreate);

router.get('/show', ProductController.show);

router.get('/list', ProductController.list);

const ProductRouter = router;

export default ProductRouter;
