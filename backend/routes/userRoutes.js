import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = Router();

// GET /api/users - Consulta de usuarios (Exclusivo para admin)
router.get('/', auth, authorize('admin'), userController.getUsers);

export default router;

