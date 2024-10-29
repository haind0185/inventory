import InventoryController from '../controllers/InventoryController';
const express = require('express');
const router = express.Router();


router.get('/', InventoryController.index);
router.get('/list', InventoryController.list);
router.get('/total', InventoryController.total);
router.get('/totalPrice', InventoryController.totalPrice);
router.get('/product', InventoryController.product);

const InventoryRouter = router;

export default InventoryRouter;
