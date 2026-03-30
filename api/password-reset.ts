import express from 'express';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// Types and Interfaces
interface PasswordResetRequest {
  email: string;
}

interface VerifyCodeRequest {
  email: string;
  code: string;
}

interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

interface ResetCode {
  userId: string;
  hashedCode: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

interface ResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

// Database abstraction layer (replace with your actual DB)
abstract class DatabaseService {
  abstract findUserByEmail(email: string): Promise<any>;
  abstract findUserById(userId: string): Promise<any>;
  abstract updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  abstract storeResetCode(resetCode: ResetCode): Promise<void>;
  abstract findResetCode(email: string): Promise<ResetCode | null>;
  abstract markResetCodeUsed(email: string): Promise<void>;
  abstract storeResetToken(resetToken: ResetToken): Promise<void>;
  abstract findResetToken(token: string): Promise<ResetToken | null>;
  abstract markResetTokenUsed(token: string): Promise<void>;
  abstract cleanupExpiredCodes(): Promise<void>;
}

// Mock implementation (replace with your actual database)
class MockDatabaseService extends DatabaseService {
  private users: any[] = [
    {
      id: 'user1',
      email: 'user@example.com',
      password: '$2a$10$example.hashed.password'
    }
  ];
  
  private resetCodes: Map<string, ResetCode> = new Map();
  private resetTokens: Map<string, ResetToken> = new Map();

  async findUserByEmail(email: string): Promise<any> {
    return this.users.find(user => user.email === email);
  }

  async findUserById(userId: string): Promise<any> {
    return this.users.find(user => user.id === userId);
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].password = hashedPassword;
    }
  }

  async storeResetCode(resetCode: ResetCode): Promise<void> {
    // Clean up existing codes for this email
    for (const [key, code] of this.resetCodes.entries()) {
      if (code.userId === resetCode.userId) {
        this.resetCodes.delete(key);
      }
    }
    
    // Store new code with email as key for easy lookup
    const user = await this.findUserById(resetCode.userId);
    if (user) {
      this.resetCodes.set(user.email, resetCode);
    }
  }

  async findResetCode(email: string): Promise<ResetCode | null> {
    const code = this.resetCodes.get(email);
    return code || null;
  }

  async markResetCodeUsed(email: string): Promise<void> {
    const code = this.resetCodes.get(email);
    if (code) {
      code.isUsed = true;
    }
  }

  async storeResetToken(resetToken: ResetToken): Promise<void> {
    this.resetTokens.set(resetToken.token, resetToken);
  }

  async findResetToken(token: string): Promise<ResetToken | null> {
    return this.resetTokens.get(token) || null;
  }

  async markResetTokenUsed(token: string): Promise<void> {
    const resetToken = this.resetTokens.get(token);
    if (resetToken) {
      resetToken.isUsed = true;
    }
  }

  async cleanupExpiredCodes(): Promise<void> {
    const now = new Date();
    
    // Clean expired reset codes
    for (const [email, code] of this.resetCodes.entries()) {
      if (code.expiresAt < now) {
        this.resetCodes.delete(email);
      }
    }
    
    // Clean expired reset tokens
    for (const [token, resetToken] of this.resetTokens.entries()) {
      if (resetToken.expiresAt < now) {
        this.resetTokens.delete(token);
      }
    }
  }
}

// Email Service
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure for your email service
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetCode(email: string, code: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: email,
        subject: 'Reset Your Password - Verification Code',
        html: this.getPasswordResetTemplate(code),
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset code sent to ${email}: ${code}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private getPasswordResetTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .code { 
            background: #f4f4f4; 
            border: 2px solid #ddd; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            font-size: 24px; 
            font-weight: bold; 
            letter-spacing: 3px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #666; }
          .security { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          
          <p>Hello,</p>
          <p>You requested to reset your password. Use the verification code below to proceed:</p>
          
          <div class="code">${code}</div>
          
          <div class="security">
            <strong>Security Notice:</strong>
            <ul>
              <li>This code will expire in 10 minutes</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you have any questions, contact our support team.</p>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 Your Application. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Password Reset Service
class PasswordResetService {
  constructor(
    private db: DatabaseService,
    private emailService: EmailService
  ) {}

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Always return success for security (don't reveal if email exists)
      const user = await this.db.findUserByEmail(email);
      
      if (!user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        return {
          success: true,
          message: "If an account with this email exists, a verification code has been sent."
        };
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Hash the code before storing
      const hashedCode = await bcrypt.hash(code, 10);
      
      // Store reset code with 10-minute expiration
      const resetCode: ResetCode = {
        userId: user.id,
        hashedCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        isUsed: false,
        createdAt: new Date(),
      };
      
      await this.db.storeResetCode(resetCode);
      
      // Send email
      const emailSent = await this.emailService.sendPasswordResetCode(email, code);
      
      if (!emailSent) {
        return {
          success: false,
          message: "Failed to send verification code. Please try again."
        };
      }
      
      return {
        success: true,
        message: "If an account with this email exists, a verification code has been sent."
      };
      
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: "An error occurred while processing your request."
      };
    }
  }

  async verifyResetCode(email: string, code: string): Promise<{ success: boolean; resetToken?: string; message: string }> {
    try {
      const resetCode = await this.db.findResetCode(email);
      
      if (!resetCode) {
        return {
          success: false,
          message: "Invalid or expired verification code."
        };
      }
      
      // Check if expired
      if (resetCode.expiresAt < new Date()) {
        return {
          success: false,
          message: "Verification code has expired. Please request a new one."
        };
      }
      
      // Check if already used
      if (resetCode.isUsed) {
        return {
          success: false,
          message: "Verification code has already been used. Please request a new one."
        };
      }
      
      // Verify the code against hashed version
      const isValidCode = await bcrypt.compare(code, resetCode.hashedCode);
      
      if (!isValidCode) {
        return {
          success: false,
          message: "Invalid verification code."
        };
      }
      
      // Mark code as used
      await this.db.markResetCodeUsed(email);
      
      // Generate short-lived reset token (15 minutes)
      const resetToken = jwt.sign(
        { userId: resetCode.userId, type: 'password_reset' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' }
      );
      
      // Store reset token
      const tokenData: ResetToken = {
        userId: resetCode.userId,
        token: resetToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        isUsed: false,
        createdAt: new Date(),
      };
      
      await this.db.storeResetToken(tokenData);
      
      return {
        success: true,
        resetToken,
        message: "Code verified successfully. You can now reset your password."
      };
      
    } catch (error) {
      console.error('Code verification error:', error);
      return {
        success: false,
        message: "An error occurred while verifying the code."
      };
    }
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate reset token
      let decoded: any;
      try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
      } catch (error) {
        return {
          success: false,
          message: "Invalid or expired reset token."
        };
      }
      
      if (decoded.type !== 'password_reset') {
        return {
          success: false,
          message: "Invalid reset token."
        };
      }
      
      // Check token in database
      const tokenData = await this.db.findResetToken(resetToken);
      
      if (!tokenData) {
        return {
          success: false,
          message: "Invalid or expired reset token."
        };
      }
      
      if (tokenData.isUsed) {
        return {
          success: false,
          message: "Reset token has already been used."
        };
      }
      
      if (tokenData.expiresAt < new Date()) {
        return {
          success: false,
          message: "Reset token has expired."
        };
      }
      
      // Validate new password
      if (newPassword.length < 8) {
        return {
          success: false,
          message: "Password must be at least 8 characters long."
        };
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      await this.db.updateUserPassword(tokenData.userId, hashedPassword);
      
      // Mark token as used
      await this.db.markResetTokenUsed(resetToken);
      
      return {
        success: true,
        message: "Password has been reset successfully."
      };
      
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: "An error occurred while resetting your password."
      };
    }
  }
}

// Express App Setup
const app = express();
app.use(express.json());

// Initialize services
const db = new MockDatabaseService(); // Replace with your actual DB service
const emailService = new EmailService();
const passwordResetService = new PasswordResetService(db, emailService);

// Rate limiting
const resetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 verification attempts per windowMs
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Cleanup expired codes periodically
setInterval(() => {
  db.cleanupExpiredCodes();
}, 5 * 60 * 1000); // Every 5 minutes

// API Routes

/**
 * POST /api/auth/request-password-reset
 * Request a password reset code
 */
app.post('/api/auth/request-password-reset', resetRequestLimiter, async (req, res) => {
  try {
    const { email } = req.body as PasswordResetRequest;
    
    // Validate input
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required."
      });
    }
    
    const result = await passwordResetService.requestPasswordReset(email);
    
    // Always return 200 for security (don't reveal if email exists)
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request."
    });
  }
});

/**
 * POST /api/auth/verify-reset-code
 * Verify the reset code and get reset token
 */
app.post('/api/auth/verify-reset-code', verifyCodeLimiter, async (req, res) => {
  try {
    const { email, code } = req.body as VerifyCodeRequest;
    
    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required."
      });
    }
    
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Verification code must be 6 digits."
      });
    }
    
    const result = await passwordResetService.verifyResetCode(email, code);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying the code."
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset the password using reset token
 */
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body as ResetPasswordRequest;
    
    // Validate input
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required."
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }
    
    const result = await passwordResetService.resetPassword(resetToken, newPassword);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password."
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'password-reset-api'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found."
  });
});

export default app;
