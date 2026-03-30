// Email service for sending verification codes and password reset emails
// This would integrate with services like SendGrid, AWS SES, or other email providers

interface EmailService {
  sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean>;
  sendVerificationCode(email: string, code: string): Promise<boolean>;
  verifyCode(email: string, code: string): Promise<boolean>;
  generateVerificationCode(): string;
  generateResetToken(): string;
}

class MockEmailService implements EmailService {
  private verificationCodes: Map<string, { code: string; expires: number }> = new Map();
  private resetTokens: Map<string, { email: string; expires: number }> = new Map();

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would call your email service API
      // Example with SendGrid:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: email,
      //     subject: 'Reset Your Password',
      //     template: 'password-reset',
      //     data: {
      //       resetLink: `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`,
      //       expirationHours: 24
      //     }
      //   })
      // });
      
      console.log(`📧 Password reset email sent to ${email}`);
      console.log(`🔗 Reset link: ${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
      
      // Store token with 24-hour expiration
      this.resetTokens.set(resetToken, {
        email,
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<boolean> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would call your email service API
      // Example with AWS SES:
      // const response = await fetch('/api/send-verification-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: email,
      //     subject: 'Your Verification Code',
      //     template: 'verification-code',
      //     data: {
      //       code,
      //       expirationMinutes: 10
      //     }
      //   })
      // });
      
      console.log(`📧 Verification code sent to ${email}: ${code}`);
      
      // Store code with 10-minute expiration
      this.verificationCodes.set(email, {
        code,
        expires: Date.now() + (10 * 60 * 1000) // 10 minutes
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send verification code:', error);
      return false;
    }
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    try {
      const stored = this.verificationCodes.get(email);
      
      if (!stored) {
        console.log('❌ No verification code found for email');
        return false;
      }
      
      if (Date.now() > stored.expires) {
        console.log('❌ Verification code expired');
        this.verificationCodes.delete(email);
        return false;
      }
      
      if (stored.code !== code) {
        console.log('❌ Invalid verification code');
        return false;
      }
      
      // Code is valid, remove it
      this.verificationCodes.delete(email);
      console.log('✅ Verification code validated successfully');
      return true;
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  }

  // Helper method to validate reset tokens
  validateResetToken(token: string): { valid: boolean; email?: string } {
    const stored = this.resetTokens.get(token);
    
    if (!stored) {
      return { valid: false };
    }
    
    if (Date.now() > stored.expires) {
      this.resetTokens.delete(token);
      return { valid: false };
    }
    
    return { valid: true, email: stored.email };
  }

  // Generate random verification code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate secure reset token
  generateResetToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Real email service implementation (for production)
class RealEmailService implements EmailService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = '/api/email') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          to: email,
          resetLink: `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`,
          expirationHours: 24
        })
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          to: email,
          code,
          expirationMinutes: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send verification code:', error);
      return false;
    }
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          email,
          code
        })
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.valid;
    } catch (error) {
      console.error('Failed to verify code:', error);
      return false;
    }
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateResetToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Export the appropriate service based on environment
export const emailService = process.env.NODE_ENV === 'production' 
  ? new RealEmailService(process.env.EMAIL_SERVICE_API_KEY || '')
  : new MockEmailService();

// Export types and classes for testing
export { MockEmailService, RealEmailService };
export type { EmailService };
