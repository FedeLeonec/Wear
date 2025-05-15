import { Router } from 'express';
import { authController } from '../modules/auth/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas
router.get('/verify', verifyToken, authController.verifyToken);
router.post('/change-password', verifyToken, authController.changePassword);

export default router;