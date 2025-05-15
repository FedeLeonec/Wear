import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { getEmailConfig, saveEmailConfig, EmailConfig, getTenantEmailConfig, saveTenantEmailConfig, TenantEmailConfig } from '../config/email.config';

export const emailController = {
  /**
   * Get email configuration
   */
  async getConfig(req: Request, res: Response) {
    try {
      const config = await getEmailConfig();
      
      // Remove password for security
      if (config) {
        const { password, ...safeConfig } = config;
        return res.status(200).json({
          success: true,
          data: {
            ...safeConfig,
            // Include a masked password indicator
            passwordConfigured: !!config.password,
          },
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Email configuration not found',
      });
    } catch (error) {
      console.error('Error fetching email config:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch email configuration',
      });
    }
  },

  /**
   * Update email configuration
   */
  async updateConfig(req: Request, res: Response) {
    try {
      const {
        host,
        port,
        secure,
        user,
        password,
        senderEmail,
        senderName,
      } = req.body;

      // Validate required fields
      if (!host || !port || !user || !senderEmail || !senderName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      // Get current config to preserve password if not provided
      const currentConfig = await getEmailConfig();
      
      const newConfig: EmailConfig = {
        host,
        port: parseInt(port, 10),
        secure: !!secure,
        user,
        // Only update password if provided
        password: password || (currentConfig?.password || ''),
        senderEmail,
        senderName,
      };

      const saved = await saveEmailConfig(newConfig);
      
      if (!saved) {
        return res.status(500).json({
          success: false,
          message: 'Failed to save email configuration',
        });
      }

      // Remove password for response
      const { password: _, ...safeConfig } = newConfig;
      
      return res.status(200).json({
        success: true,
        message: 'Email configuration updated successfully',
        data: {
          ...safeConfig,
          passwordConfigured: !!newConfig.password,
        },
      });
    } catch (error) {
      console.error('Error updating email config:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update email configuration',
      });
    }
  },

  /**
   * Get tenant email notification configuration
   */
  async getTenantEmailConfig(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
      }

      const config = await getTenantEmailConfig(tenantId);
      
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Tenant email configuration not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error(`Error fetching tenant email config:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tenant email configuration',
      });
    }
  },

  /**
   * Update tenant email notification configuration
   */
  async updateTenantEmailConfig(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const {
        notificationEmails,
        salesNotifications,
        receiptNotifications,
        alertNotifications,
        customFooter,
      } = req.body;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
      }

      // Validate notification emails
      if (!Array.isArray(notificationEmails)) {
        return res.status(400).json({
          success: false,
          message: 'notificationEmails must be an array',
        });
      }

      // Validate email format
      if (notificationEmails.some(email => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))) {
        return res.status(400).json({
          success: false,
          message: 'One or more email addresses are invalid',
        });
      }

      const config: TenantEmailConfig = {
        tenantId,
        notificationEmails,
        salesNotifications: !!salesNotifications,
        receiptNotifications: !!receiptNotifications,
        alertNotifications: !!alertNotifications,
        customFooter,
      };

      const saved = await saveTenantEmailConfig(config);
      
      if (!saved) {
        return res.status(500).json({
          success: false,
          message: 'Failed to save tenant email configuration',
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Tenant email configuration updated successfully',
        data: config,
      });
    } catch (error) {
      console.error(`Error updating tenant email config:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update tenant email configuration',
      });
    }
  },

  /**
   * Test email configuration
   */
  async testConnection(req: Request, res: Response) {
    try {
      const success = await emailService.testConnection();
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Email connection test successful',
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Email connection test failed',
      });
    } catch (error) {
      console.error('Error testing email connection:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to test email connection',
      });
    }
  },

  /**
   * Send test email
   */
  async sendTestEmail(req: Request, res: Response) {
    try {
      const { recipient } = req.body;
      
      if (!recipient) {
        return res.status(400).json({
          success: false,
          message: 'Recipient email is required',
        });
      }
      
      const success = await emailService.sendEmail({
        to: recipient,
        subject: 'WearAliass Platform - Test Email',
        html: `
          <h1>Email Configuration Test</h1>
          <p>This is a test email from WearAliass Platform.</p>
          <p>If you received this email, your email configuration is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        `,
      });
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Test email sent successfully',
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Failed to send test email',
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email',
      });
    }
  },
};