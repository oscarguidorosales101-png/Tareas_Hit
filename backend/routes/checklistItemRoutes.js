import { Router } from 'express';
import { checklistController } from '../controllers/checklistController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.patch('/:id', auth, checklistController.updateItem);
router.delete('/:id', auth, checklistController.deleteItem);

export default router;

