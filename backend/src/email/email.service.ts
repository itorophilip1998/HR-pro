import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Configure email transporter
    // For production, use environment variables for SMTP settings
    const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPassword = process.env.SMTP_PASSWORD || '';

    console.log('Email Service Configuration:', {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NOT SET',
      password: smtpPassword ? '***SET***' : 'NOT SET',
    });

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports (587 uses STARTTLS)
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      tls: {
        // Office365 requires proper TLS
        rejectUnauthorized: false, // Set to false for Office365 to avoid certificate issues
        ciphers: 'SSLv3',
      },
      debug: true, // Enable debug output
      logger: true, // Enable logging
    });

    // Verify connection on startup
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        await this.transporter.verify();
        console.log('✅ SMTP server connection verified successfully');
      } else {
        console.warn(
          '⚠️ SMTP credentials not configured - emails will not be sent',
        );
      }
    } catch (error) {
      console.error('❌ SMTP connection verification failed:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          code: (error as any).code,
          command: (error as any).command,
        });
      }
    }
  }

  async sendProjectAssignmentEmail(
    email: string,
    projectName: string,
    deadline: string,
    budget: number,
  ) {
    // Format budget as currency
    const formattedBudget = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(budget);

    // Format deadline
    const formattedDeadline = new Date(deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const mailOptions = {
      from:
        process.env.SMTP_SENDER ||
        process.env.SUPPORT_EMAIL ||
        'noreply@superbudget.com',
      to: email,
      replyTo: process.env.SMTP_REPLY_TO || process.env.SUPPORT_EMAIL,
      subject: `You've been assigned to a new project: ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Project Assignment Notification</h2>
          <p>Hello,</p>
          <p>You have been assigned to a new project:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Project Name:</strong> ${projectName}</p>
            <p><strong>Deadline:</strong> ${formattedDeadline}</p>
            <p><strong>Budget:</strong> ${formattedBudget}</p>
          </div>
          <p>Please log in to the dashboard to view more details and start working on this project.</p>
          <p>Best regards,<br>Hr-Pro Team</p>
        </div>
      `,
    };

    try {
      // Only send email if SMTP is configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn(
          `⚠️ Email would be sent to ${email} for project ${projectName} (SMTP not configured)`,
        );
        return null;
      }

      console.log(
        `📧 Attempting to send email to ${email} for project ${projectName}`,
      );
      console.log('Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        replyTo: mailOptions.replyTo,
        subject: mailOptions.subject,
      });

      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Email sent successfully to ${email} for project ${projectName}`,
        {
          messageId: info.messageId,
          response: info.response,
        },
      );
      return info;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          code: (error as any).code,
          command: (error as any).command,
          response: (error as any).response,
          responseCode: (error as any).responseCode,
        });
      }
      // Don't throw error - email failure shouldn't break project creation
      // Return null to indicate failure without breaking the flow
      return null;
    }
  }
}
