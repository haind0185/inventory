import EntryController from '../controllers/EntryController';
const express = require('express');
const router = express.Router();


router.get('/', EntryController.index);

router.post('/', EntryController.store);

const EntryRouter = router;

export default EntryRouter;
