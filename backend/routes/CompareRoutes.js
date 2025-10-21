
import CompareController from '../controllers/CompareController';
import { upload, setPermissions } from './multer';
const express = require('express');
const router = express.Router();


router.post('/import', upload.fields([ { name: "file1" }, { name: "file2" } ]), setPermissions, CompareController.import);

const CompareRouter = router;

export default CompareRouter;
