import { Request, Response } from 'express';
import { User } from '../../models';
import { logger } from '../../utils/logger';

export const userController = {
  // Obtener todos los usuarios (filtrado por tenant si no es Super Admin)
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { role } = req.query;
      let whereClause: any = {};
      
      // Si no es Super Admin, solo puede ver usuarios de su tenant
      if (req.user.role !== 'SUPER_ADMIN') {
        whereClause.tenantId = req.user.tenantId;
      } else if (req.query.tenantId) {
        // Super Admin puede filtrar por tenant
        whereClause.tenantId = req.query.tenantId;
      }
      
      // Filtrar por rol si se especifica
      if (role) {
        whereClause.role = role;
      }

      const users = await User.findAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
      });

      return res.status(200).json(users);
    } catch (error) {
      logger.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Error fetching users' });
    }
  },

  // Obtener un usuario por ID
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verificar permisos: Super Admin puede ver cualquier usuario,
      // otros roles solo pueden ver usuarios de su tenant
      if (req.user.role !== 'SUPER_ADMIN' && user.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: 'Unauthorized to access this user' });
      }

      return res.status(200).json(user);
    } catch (error) {
      logger.error(`Error fetching user ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Error fetching user' });
    }
  },

  // Crear un usuario (por Admin o Super Admin)
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { firstName, lastName, email, password, role, tenantId } = req.body;

      // Validar datos requeridos
      if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Verificar permisos para crear usuarios
      if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized to create users' });
      }

      // Admin solo puede crear usuarios para su tenant y no puede crear Super Admin
      if (req.user.role === 'ADMIN') {
        if (role === 'SUPER_ADMIN') {
          return res.status(403).json({ message: 'Unauthorized to create Super Admin users' });
        }
        
        if (tenantId !== req.user.tenantId) {
          return res.status(403).json({ message: 'Unauthorized to create users for other tenants' });
        }
      }

      // Verificar si el correo ya está registrado
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Crear el usuario
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId: role === 'SUPER_ADMIN' ? null : tenantId,
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
        isActive: user.isActive,
      };

      logger.info(`User created: ${user.email} (${user.id}) with role ${user.role}`);
      return res.status(201).json(userData);
    } catch (error) {
      logger.error('Error creating user:', error);
      return res.status(500).json({ message: 'Error creating user' });
    }
  },

  // Actualizar un usuario
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role, isActive } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verificar permisos: Super Admin puede actualizar cualquier usuario,
      // Admin solo puede actualizar usuarios de su tenant (excepto otros Admin),
      // otros roles solo pueden actualizar su propio perfil
      if (req.user.role !== 'SUPER_ADMIN') {
        if (req.user.role === 'ADMIN') {
          if (user.tenantId !== req.user.tenantId) {
            return res.status(403).json({ message: 'Unauthorized to update users from other tenants' });
          }
          if (user.role === 'ADMIN' && user.id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update other Admin users' });
          }
        } else if (user.id !== req.user.id) {
          return res.status(403).json({ message: 'Unauthorized to update other users' });
        }
      }

      // No permitir cambiar el rol a Super Admin a menos que sea un Super Admin
      if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Unauthorized to assign Super Admin role' });
      }

      // Actualizar los campos
      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        role: role || user.role,
        isActive: isActive !== undefined ? isActive : user.isActive,
      });

      // No devolver la contraseña
      const userData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
      };

      logger.info(`User updated: ${user.email} (${user.id})`);
      return res.status(200).json(userData);
    } catch (error) {
      logger.error(`Error updating user ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Error updating user' });
    }
  },

  // Activar/desactivar un usuario
  async toggleActive(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verificar permisos: Super Admin puede activar/desactivar cualquier usuario,
      // Admin solo puede activar/desactivar usuarios de su tenant (excepto otros Admin)
      if (req.user.role !== 'SUPER_ADMIN') {
        if (req.user.role === 'ADMIN') {
          if (user.tenantId !== req.user.tenantId) {
            return res.status(403).json({ message: 'Unauthorized to modify users from other tenants' });
          }
          if (user.role === 'ADMIN' && user.id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to modify other Admin users' });
          }
        } else {
          return res.status(403).json({ message: 'Unauthorized to modify user status' });
        }
      }

      // No permitir desactivarse a sí mismo
      if (user.id === req.user.id) {
        return res.status(400).json({ message: 'Cannot deactivate your own account' });
      }

      await user.update({ isActive: !user.isActive });

      const status = user.isActive ? 'activated' : 'deactivated';
      logger.info(`User ${status}: ${user.email} (${user.id})`);
      return res.status(200).json({ message: `User ${status} successfully`, user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
      }});
    } catch (error) {
      logger.error(`Error toggling user ${req.params.id} status:`, error);
      return res.status(500).json({ message: 'Error updating user status' });
    }
  },

  // Eliminar un usuario (soft delete o marcar como inactivo)
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verificar permisos: Super Admin puede eliminar cualquier usuario,
      // Admin solo puede eliminar usuarios de su tenant (excepto otros Admin)
      if (req.user.role !== 'SUPER_ADMIN') {
        if (req.user.role === 'ADMIN') {
          if (user.tenantId !== req.user.tenantId) {
            return res.status(403).json({ message: 'Unauthorized to delete users from other tenants' });
          }
          if (user.role === 'ADMIN' && user.id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete other Admin users' });
          }
        } else {
          return res.status(403).json({ message: 'Unauthorized to delete users' });
        }
      }

      // No permitir eliminarse a sí mismo
      if (user.id === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      // Por seguridad, solo desactivamos el usuario en lugar de eliminarlo
      await user.update({ isActive: false });

      logger.info(`User deactivated (delete request): ${user.email} (${user.id})`);
      return res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
      logger.error(`Error deleting user ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Error deleting user' });
    }
  },
};