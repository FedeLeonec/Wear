import sequelize from './database';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  senderEmail: string;
  senderName: string;
}

export interface TenantEmailConfig {
  tenantId: string;
  notificationEmails: string[];  // Múltiples correos para notificaciones
  salesNotifications: boolean;   // Notificaciones de ventas
  receiptNotifications: boolean; // Notificaciones de comprobantes
  alertNotifications: boolean;   // Notificaciones de alertas
  customFooter?: string;         // Pie de página personalizado
}

// Default configuration for development
const defaultConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER || 'user@example.com',
  password: process.env.EMAIL_PASSWORD || 'password',
  senderEmail: process.env.EMAIL_SENDER || 'noreply@example.com',
  senderName: process.env.EMAIL_SENDER_NAME || 'WearAliass Platform',
};

/**
 * Get email configuration from database or environment variables
 */
export async function getEmailConfig(): Promise<EmailConfig | null> {
  try {
    // Try to get configuration from database first
    const settings = await sequelize.query(
      'SELECT * FROM system_settings WHERE key = $1',
      ['email_config']
    );

    if (settings.rows.length > 0 && settings.rows[0].value) {
      return JSON.parse(settings.rows[0].value);
    }

    // If not found in database, return default config
    return defaultConfig;
  } catch (error) {
    console.error('Error fetching email configuration:', error);
    return defaultConfig;
  }
}

/**
 * Save email configuration to database
 */
export async function saveEmailConfig(config: EmailConfig): Promise<boolean> {
  try {
    const configJson = JSON.stringify(config);
    
    // Check if config already exists
    const existingConfig = await sequelize.query(
      'SELECT * FROM system_settings WHERE key = $1',
      ['email_config']
    );

    if (existingConfig.rows.length > 0) {
      // Update existing config
      await sequelize.query(
        'UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = $2',
        [configJson, 'email_config']
      );
    } else {
      // Insert new config
      await sequelize.query(
        'INSERT INTO system_settings (key, value, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        ['email_config', configJson]
      );
    }

    return true;
  } catch (error) {
    console.error('Error saving email configuration:', error);
    return false;
  }
}

/**
 * Get tenant email notification configuration
 */
export async function getTenantEmailConfig(tenantId: string): Promise<TenantEmailConfig | null> {
  try {
    const settings = await sequelize.query(
      'SELECT * FROM tenant_settings WHERE tenant_id = $1 AND key = $2',
      [tenantId, 'email_notification_config']
    );

    if (settings.rows.length > 0 && settings.rows[0].value) {
      return JSON.parse(settings.rows[0].value);
    }

    // Return default config if not found
    return {
      tenantId,
      notificationEmails: [],
      salesNotifications: true,
      receiptNotifications: true,
      alertNotifications: true
    };
  } catch (error) {
    console.error(`Error fetching email notification config for tenant ${tenantId}:`, error);
    return null;
  }
}

/**
 * Save tenant email notification configuration
 */
export async function saveTenantEmailConfig(config: TenantEmailConfig): Promise<boolean> {
  try {
    const configJson = JSON.stringify(config);
    
    // Check if config already exists
    const existingConfig = await sequelize.query(
      'SELECT * FROM tenant_settings WHERE tenant_id = $1 AND key = $2',
      [config.tenantId, 'email_notification_config']
    );

    if (existingConfig.rows.length > 0) {
      // Update existing config
      await sequelize.query(
        'UPDATE tenant_settings SET value = $1, updated_at = NOW() WHERE tenant_id = $2 AND key = $3',
        [configJson, config.tenantId, 'email_notification_config']
      );
    } else {
      // Insert new config
      await sequelize.query(
        'INSERT INTO tenant_settings (tenant_id, key, value, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [config.tenantId, 'email_notification_config', configJson]
      );
    }

    return true;
  } catch (error) {
    console.error(`Error saving email notification config for tenant ${config.tenantId}:`, error);
    return false;
  }
}