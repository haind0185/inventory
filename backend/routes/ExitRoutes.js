import ExitController from '../controllers/ExitController';
const express = require('express');
const router = express.Router();


router.get('/', ExitController.index);

router.post('/', ExitController.store);

const ExitRouter = router;

export default ExitRouter;
