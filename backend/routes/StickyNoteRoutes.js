import StickyNoteController from '../controllers/StickyNoteController';
const express = require('express');
const router = express.Router();

router.get('/', StickyNoteController.index);

router.post('/', StickyNoteController.store);

router.put('/', StickyNoteController.update);

const StickyNoteRouter = router;

export default StickyNoteRouter;
