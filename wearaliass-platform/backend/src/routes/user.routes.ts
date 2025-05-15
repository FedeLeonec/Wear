import { Router } from 'express';
import { userController } from '../modules/user/user.controller';
import { checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Rutas para la gestión de usuarios (con diferentes niveles de acceso)
router.get('/', checkRole(['SUPER_ADMIN', 'ADMIN']), userController.getAll);
router.get('/:id', userController.getById); // Verificación de permisos en el controlador
router.post('/', checkRole(['SUPER_ADMIN', 'ADMIN']), userController.create);
router.put('/:id', userController.update); // Verificación de permisos en el controlador
router.patch('/:id/toggle-active', checkRole(['SUPER_ADMIN', 'ADMIN']), userController.toggleActive);
router.delete('/:id', checkRole(['SUPER_ADMIN', 'ADMIN']), userController.delete);

export default router;