import ProductController from '../controllers/ProductController';
const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get('/', ProductController.index);

router.post('/', ProductController.store);

router.post('/import', upload.single('file'), ProductController.import);

router.post('/bulkCreate', ProductController.bulkCreate);

router.get('/list', ProductController.list);


const ProductRouter = router;

export default ProductRouter;
