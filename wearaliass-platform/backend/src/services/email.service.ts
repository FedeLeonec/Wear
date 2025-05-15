import nodemailer from 'nodemailer';
import { getEmailConfig } from '../config/email.config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: any;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  async init() {
    try {
      const config = await getEmailConfig();
      
      if (!config) {
        console.warn('Email configuration not found. Email service will not be available.');
        return false;
      }

      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log('Email service initialized successfully');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.initialized = false;
      return false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.initialized || !this.transporter) {
      await this.init();
      if (!this.initialized || !this.transporter) {
        console.error('Email service not initialized');
        return false;
      }
    }

    try {
      const config = await getEmailConfig();
      if (!config) {
        console.error('Email configuration not found');
        return false;
      }

      const mailOptions = {
        from: `"${config.senderName}" <${config.senderEmail}>`,
        ...options,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.initialized) {
      await this.init();
    }
    
    if (!this.transporter) {
      return false;
    }
    
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();