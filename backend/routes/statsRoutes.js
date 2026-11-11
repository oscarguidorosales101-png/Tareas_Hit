import { Router } from 'express';
import { statsController } from '../controllers/statsController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', auth, statsController.getDashboardStats);

export default router;

