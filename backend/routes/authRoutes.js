import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// Endpoint de Inicio de Sesión
router.post('/login', authController.login);

// Endpoint para consultar datos de la sesión actual
router.get('/me', auth, authController.getMe);

// Endpoint de Cierre de Sesión
router.post('/logout', auth, authController.logout);

export default router;

