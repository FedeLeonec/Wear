import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Tenant } from '../../models';
import { createTenantSchema } from '../../config/database';
import { logger } from '../../utils/logger';

// Controlador para la gestión de tenants (solo accesible por Super Admin)
export const tenantController = {
  // Crear un nuevo tenant
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, domain, contactEmail, logo, contactPhone, address, settings } = req.body;

      // Validar datos requeridos
      if (!name || !domain || !contactEmail) {
        return res.status(400).json({ message: 'Name, domain and contactEmail are required' });
      }

      // Verificar si el dominio ya existe
      const existingTenant = await Tenant.findOne({ where: { domain } });
      if (existingTenant) {
        return res.status(400).json({ message: 'Domain already in use' });
      }

      // Crear el tenant
      const tenantId = uuidv4();
      const tenant = await Tenant.create({
        id: tenantId,
        name,
        domain,
        logo,
        contactEmail,
        contactPhone,
        address,
        settings: settings || {},
        isActive: true,
      });

      // Crear el esquema para el tenant en la base de datos
      await createTenantSchema(tenantId);

      logger.info(`Tenant created: ${tenant.name} (${tenant.id})`);
      return res.status(201).json(tenant);
    } catch (error) {
      logger.error('Error creating tenant:', error);
      return res.status(500).json({ message: 'Error creating tenant' });
    }
  },

  // Obtener todos los tenants
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const tenants = await Tenant.findAll();
      return res.status(200).json(tenants);
    } catch (error) {
      logger.error('Error fetching tenants:', error);
      return res.status(500).json({ message: 'Error fetching tenants' });
    }
  },

  // Obtener un tenant por ID
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const tenant = await Tenant.findByPk(id);

      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      return res.status(200).json(tenant);
    } catch (error) {
      logger.error(`Error fetching tenant ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Error fetching tenant' });
    }
  },

  // Actualizar un tenant
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, logo, contactEmail, contactPhone, address, settings, isActive } = req.body;

      const tenant = await Tenant.findByPk(id);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      // Actualizar los campos
      await tenant.update({
        name: name || tenant.name,
        logo: logo || tenant.logo,
        contactEmail: contactEmail || tenant.contactEmail,
        contactPhone: contactPhone || tenant.contactPhone,
        address: address || tenant.address,
        settings: settings || tenant.settings,
        isActive: isActive !== undefined ? isActive : tenant.isActive,
      });

      logger.info(`Tenant updated: ${tenant.name} (${tenant.id})`);
      return res.status(200).json(tenant);
    } catch (error) {
      logger.error(`Error updating tenant ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Error updating tenant' });
    }
  },

  // Activar/desactivar un tenant
  async toggleActive(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const tenant = await Tenant.findByPk(id);

      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      await tenant.update({ isActive: !tenant.isActive });

      const status = tenant.isActive ? 'activated' : 'deactivated';
      logger.info(`Tenant ${status}: ${tenant.name} (${tenant.id})`);
      return res.status(200).json({ message: `Tenant ${status} successfully`, tenant });
    } catch (error) {
      logger.error(`Error toggling tenant ${req.params.id} status:`, error);
      return res.status(500).json({ message: 'Error updating tenant status' });
    }
  },

  // Eliminar un tenant (soft delete o marcar como inactivo)
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const tenant = await Tenant.findByPk(id);

      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      // Por seguridad, solo desactivamos el tenant en lugar de eliminarlo
      await tenant.update({ isActive: false });

      logger.info(`Tenant deactivated (delete request): ${tenant.name} (${tenant.id})`);
      return res.status(200).json({ message: 'Tenant deactivated successfully' });
    } catch (error) {
      logger.error(`Error deleting tenant ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Error deleting tenant' });
    }
  },
};