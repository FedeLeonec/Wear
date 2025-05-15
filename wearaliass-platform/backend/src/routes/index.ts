import { Router } from 'express';
import { verifyToken, checkRole, logSuperAdminAccess } from '../middlewares/auth.middleware';
import tenantRoutes from './tenant.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import saleRoutes from './sale.routes';
import posRoutes from './pos.routes';
import accountingRoutes from './accounting.routes';
import reportRoutes from './report.routes';
import ecommerceRoutes from './ecommerce.routes';
import emailRoutes from './email.routes';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);
router.use('/ecommerce', ecommerceRoutes); // Rutas públicas para el eCommerce

// Middleware de autenticación para todas las rutas siguientes
router.use(verifyToken);

// Rutas para Super Admin
router.use('/tenants', checkRole(['SUPER_ADMIN']), tenantRoutes);

// Rutas para usuarios (con diferentes niveles de acceso según el rol)
router.use('/users', userRoutes);

// Rutas para productos y categorías
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

// Rutas para ventas
router.use('/sales', saleRoutes);

// Rutas para el POS
router.use('/pos', posRoutes);

// Rutas para contabilidad
router.use('/accounting', accountingRoutes);

// Rutas para reportes
router.use('/reports', reportRoutes);

// Rutas para configuración de email
router.use('/email', emailRoutes);

export default router;