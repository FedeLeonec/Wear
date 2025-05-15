import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models';
import { logger } from '../../utils/logger';

export const authController = {
  // Registro de usuario (solo para clientes o por Admin/Super Admin)
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { firstName, lastName, email, password, role, tenantId } = req.body;

      // Validar datos requeridos
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Verificar si el correo ya está registrado
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Determinar el rol según el contexto
      let userRole = role || 'CUSTOMER';
      
      // Si el usuario que hace la solicitud es un SUPER_ADMIN, puede crear cualquier tipo de usuario
      // Si es un ADMIN, solo puede crear usuarios para su tenant y no puede crear SUPER_ADMIN
      if (req.user) {
        if (req.user.role !== 'SUPER_ADMIN' && userRole === 'SUPER_ADMIN') {
          return res.status(403).json({ message: 'Unauthorized to create Super Admin users' });
        }
        
        if (req.user.role === 'ADMIN' && req.user.tenantId !== tenantId) {
          return res.status(403).json({ message: 'Unauthorized to create users for other tenants' });
        }
      } else {
        // Si no hay usuario autenticado, solo se puede registrar como CUSTOMER
        userRole = 'CUSTOMER';
      }

      // Crear el usuario
      const user = await User.create({
        firstName,
        lastName,
        email,
        password, // Se encripta automáticamente en el hook beforeCreate
        role: userRole,
        tenantId: userRole === 'SUPER_ADMIN' ? null : tenantId,
        isActive: true,
      });

      // No devolver la contraseña
      const userData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      };

      logger.info(`User registered: ${user.email} (${user.id}) with role ${user.role}`);
      return res.status(201).json(userData);
    } catch (error) {
      logger.error('Error registering user:', error);
      return res.status(500).json({ message: 'Error registering user' });
    }
  },

  // Inicio de sesión
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      // Validar datos requeridos
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Buscar el usuario
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return res.status(401).json({ message: 'User account is inactive' });
      }

      // Verificar la contraseña
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          tenantId: user.tenantId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );

      // Actualizar último login
      await user.update({ lastLogin: new Date() });

      logger.info(`User logged in: ${user.email} (${user.id})`);
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      });
    } catch (error) {
      logger.error('Error during login:', error);
      return res.status(500).json({ message: 'Error during login' });
    }
  },

  // Verificar token y obtener información del usuario
  async verifyToken(req: Request, res: Response): Promise<Response> {
    try {
      // El middleware verifyToken ya ha validado el token y añadido req.user
      if (!req.user) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Buscar el usuario para obtener datos actualizados
      const user = await User.findByPk(req.user.id);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      });
    } catch (error) {
      logger.error('Error verifying token:', error);
      return res.status(500).json({ message: 'Error verifying token' });
    }
  },

  // Cambiar contraseña
  async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Validar datos requeridos
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      // Buscar el usuario
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verificar la contraseña actual
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Actualizar la contraseña
      await user.update({ password: newPassword });

      logger.info(`Password changed for user: ${user.email} (${user.id})`);
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Error changing password:', error);
      return res.status(500).json({ message: 'Error changing password' });
    }
  },
};