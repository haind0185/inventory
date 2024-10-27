import ExitController from '../controllers/ExitController';
import { upload, setPermissions } from './multer';
const express = require('express');
const router = express.Router();


router.get('/', ExitController.index);

router.post('/', ExitController.store);

router.post('/import', upload.single('file'), setPermissions, ExitController.import);

const ExitRouter = router;

export default ExitRouter;
