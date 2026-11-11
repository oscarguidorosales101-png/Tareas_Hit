import { Router } from 'express';
import { historyController } from '../controllers/historyController.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = Router();

// Historial general de cambios de tareas (Admin)
router.get('/', auth, authorize('admin'), historyController.getHistory);

// Historial especializado de tareas completadas con filtros avanzados y paginación
router.get('/completed', auth, historyController.getCompletedHistory);

// Detalle individual de historial
router.get('/:id', auth, historyController.getHistoryById);

export default router;
