import { Router } from 'express';
import { boardController } from '../controllers/boardController.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = Router();

// Tableros
router.get('/', auth, boardController.getBoards);
router.get('/:id', auth, boardController.getBoardById);
router.post('/', auth, boardController.createBoard);
router.patch('/:id', auth, boardController.updateBoard);
router.delete('/:id', auth, authorize('admin'), boardController.deleteBoard);

// Miembros de Tablero
router.post('/:id/members', auth, boardController.addMember);
router.delete('/:id/members/:userId', auth, boardController.removeMember);

// Listas / Columnas de un Tablero
router.get('/:id/lists', auth, boardController.getLists);
router.post('/:id/lists', auth, boardController.createList);

export default router;

