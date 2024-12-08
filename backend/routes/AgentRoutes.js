import AgentController from '../controllers/AgentController';
import { upload, setPermissions } from './multer';
const express = require('express');
const multer = require('multer');
const router = express.Router();


router.get('/', AgentController.index);

router.post('/', AgentController.store);

router.put('/', AgentController.update);

router.post('/import', upload.single('file'), setPermissions, AgentController.import);

router.post('/bulkCreate', AgentController.bulkCreate);

router.get('/show', AgentController.show);

router.get('/list', AgentController.list);

router.post('/delete', AgentController.delete);

const AgentRouter = router;

export default AgentRouter;
