import VRPController from '../controllers/VRPController';
import { upload, setPermissions } from './multer';
const express = require('express');
const multer = require('multer');
const router = express.Router();

router.post('/import', upload.single('file'), setPermissions, VRPController.import);

const VRPRouter = router;

export default VRPRouter;
