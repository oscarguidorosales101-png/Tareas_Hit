import { Router } from 'express';
import { activityController } from '../controllers/activityController.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = Router();

// GET /api/logs (y /api/activity) - Consulta de bitácora de actividad (Exclusivo para admin)
router.get('/', auth, authorize('admin'), activityController.getLogs);

export default router;

