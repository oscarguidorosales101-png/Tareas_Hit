import { Router } from 'express';
import { commentController } from '../controllers/commentController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.delete('/:id', auth, commentController.deleteComment);

export default router;

