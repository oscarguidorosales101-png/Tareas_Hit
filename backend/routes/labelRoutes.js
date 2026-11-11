import { Router } from 'express';
import { labelController } from '../controllers/labelController.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', auth, labelController.getLabels);
router.post('/', auth, authorize('admin'), labelController.createLabel);

export default router;

