import { Router } from 'express';
import { listController } from '../controllers/listController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.patch('/:id', auth, listController.updateList);
router.delete('/:id', auth, listController.deleteList);
router.patch('/:id/reorder', auth, listController.reorderList);

export default router;

