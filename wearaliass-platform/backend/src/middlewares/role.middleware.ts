import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to check if the authenticated user has one of the allowed roles
 * @param allowedRoles Array of roles that can access the resource
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized: Authentication required' 
      });
    }

    // Convert role to lowercase for case-insensitive comparison
    const userRole = req.user.role.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      logger.warn(`User ${req.user.id} with role ${userRole} attempted to access a resource that requires one of these roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        success: false,
        message: 'Forbidden: Insufficient permissions' 
      });
    }

    next();
  };
}; 