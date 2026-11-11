import { Router } from 'express';
import { trelloController } from '../controllers/trelloController.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/status', auth, trelloController.getStatus);
router.get('/boards', auth, trelloController.getBoards);
router.get('/boards/:id/lists', auth, trelloController.getLists);
router.get('/lists/:id/cards', auth, trelloController.getCards);
router.post('/import', auth, authorize('admin'), trelloController.importCard);

export default router;

