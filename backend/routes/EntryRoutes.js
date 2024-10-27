import EntryController from '../controllers/EntryController';
import { upload, setPermissions } from './multer';
const express = require('express');
const router = express.Router();


router.get('/', EntryController.index);

router.post('/', EntryController.store);

router.post('/import', upload.single('file'), setPermissions, EntryController.import);

const EntryRouter = router;

export default EntryRouter;
