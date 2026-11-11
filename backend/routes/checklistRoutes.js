import { Router } from 'express';
import { checklistController } from '../controllers/checklistController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/:id/items', auth, checklistController.addItem);

export default router;

