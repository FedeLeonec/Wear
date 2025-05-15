import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Extender la interfaz Request para incluir el usuario y el tenant
declare global {
  namespace Express {
    interface Request {
      user?: any;
      tenantId?: string;
    }
  }
}

// Middleware para verificar el token JWT
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    req.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    logger.error('Invalid token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware para verificar roles
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const hasRole = roles.includes(req.user.role);
    if (!hasRole) {
      logger.warn(`User ${req.user.id} attempted to access a resource without proper role`);
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    next();
  };
};

// Middleware para verificar que el usuario pertenece al tenant correcto
export const checkTenant = (req: Request, res: Response, next: NextFunction) => {
  const requestedTenantId = req.params.tenantId || req.body.tenantId;
  
  // Super Admin puede acceder a cualquier tenant
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }
  
  // Para otros roles, verificar que el tenant coincida
  if (req.user.tenantId !== requestedTenantId) {
    logger.warn(`User ${req.user.id} attempted to access tenant ${requestedTenantId} but belongs to ${req.user.tenantId}`);
    return res.status(403).json({ message: 'Forbidden: tenant mismatch' });
  }
  
  next();
};

// Middleware para registrar accesos de Super Admin a tenants (auditoría)
export const logSuperAdminAccess = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'SUPER_ADMIN' && req.params.tenantId) {
    logger.info(`AUDIT: Super Admin ${req.user.id} accessed tenant ${req.params.tenantId}`);
    // Aquí se podría guardar en una tabla de auditoría en la BD
  }
  next();
};