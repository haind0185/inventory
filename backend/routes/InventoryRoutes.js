import InventoryController from '../controllers/InventoryController';
const express = require('express');
const router = express.Router();


router.get('/', InventoryController.index);

const InventoryRouter = router;

export default InventoryRouter;
