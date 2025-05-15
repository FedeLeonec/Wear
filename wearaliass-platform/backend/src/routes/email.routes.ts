import { Router } from 'express';
import { emailController } from '../controllers/email.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// All email routes require authentication
router.use(verifyToken);

// Global email configuration - Super admin only
router.get('/config', roleMiddleware(['super_admin']), emailController.getConfig);
router.put('/config', roleMiddleware(['super_admin']), emailController.updateConfig);

// Tenant email configuration - Admin/Tenant role
router.get('/tenant/:tenantId/config', roleMiddleware(['admin', 'super_admin']), emailController.getTenantEmailConfig);
router.put('/tenant/:tenantId/config', roleMiddleware(['admin', 'super_admin']), emailController.updateTenantEmailConfig);

// Test email connection - Super admin only
router.post('/test-connection', roleMiddleware(['super_admin']), emailController.testConnection);

// Send test email - Admin and Super admin
router.post('/send-test', roleMiddleware(['admin', 'super_admin']), emailController.sendTestEmail);

export default router;