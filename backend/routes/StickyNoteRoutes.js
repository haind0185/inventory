import StickyNoteController from '../controllers/StickyNoteController';
const express = require('express');
const router = express.Router();

router.get('/', StickyNoteController.index);

router.post('/', StickyNoteController.store);

router.put('/', StickyNoteController.update);

router.post('/sync', StickyNoteController.async);

router.post('/delete', StickyNoteController.delete);

const StickyNoteRouter = router;

export default StickyNoteRouter;
