import { Router } from 'express';
import { tenantController } from '../modules/tenant/tenant.controller';
import { logSuperAdminAccess } from '../middlewares/auth.middleware';

const router = Router();

// Middleware para auditoría de acceso de Super Admin
router.use('/:tenantId', logSuperAdminAccess);

// Rutas para la gestión de tenants (solo accesible por Super Admin)
router.post('/', tenantController.create);
router.get('/', tenantController.getAll);
router.get('/:id', tenantController.getById);
router.put('/:id', tenantController.update);
router.patch('/:id/toggle-active', tenantController.toggleActive);
router.delete('/:id', tenantController.delete);

export default router;