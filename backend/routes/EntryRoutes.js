import EntryController from '../controllers/EntryController';
import { upload, setPermissions } from './multer';
const express = require('express');
const router = express.Router();


router.get('/', EntryController.index);

router.post('/', EntryController.store);

router.post('/delete', EntryController.delete);

router.post('/import', upload.single('file'), setPermissions, EntryController.import);

router.get('/product', EntryController.product);

router.get('/date', EntryController.date);

const EntryRouter = router;

export default EntryRouter;
