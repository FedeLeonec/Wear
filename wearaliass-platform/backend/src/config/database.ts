import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// Configuración de la base de datos principal
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'wearaliass',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: (msg) => logger.debug(msg),
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Función para crear un esquema para un tenant específico
export const createTenantSchema = async (tenantId: string): Promise<void> => {
  try {
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS tenant_${tenantId}`);
    logger.info(`Schema created for tenant: ${tenantId}`);
  } catch (error) {
    logger.error(`Error creating schema for tenant ${tenantId}:`, error);
    throw error;
  }
};

// Función para obtener un modelo específico para un tenant
export const getTenantModel = (Model: any, tenantId: string) => {
  return Model.schema(`tenant_${tenantId}`);
};

// Función para inicializar la conexión a la base de datos
export const initializeDatabase = async (): Promise<void> => {
  // Si SKIP_DB_CONNECTION está establecido, omitir la conexión a la base de datos
  if (process.env.SKIP_DB_CONNECTION === 'true') {
    logger.info('Database connection skipped due to SKIP_DB_CONNECTION flag.');
    return;
  }
  
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;