// Frontend Password Reset Service for React/Mobile Apps
// Integrates with the secure password reset API

interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

interface ApiError {
  success: boolean;
  message: string;
}

class PasswordResetClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Request a password reset code
   * POST /api/auth/request-password-reset
   */
  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || 'Failed to request password reset');
      }

      return await response.json();
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  }

  /**
   * Verify the reset code and get reset token
   * POST /api/auth/verify-reset-code
   */
  async verifyResetCode(email: string, code: string): Promise<PasswordResetResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || 'Failed to verify reset code');
      }

      return await response.json();
    } catch (error) {
      console.error('Verify reset code error:', error);
      throw error;
    }
  }

  /**
   * Reset the password using reset token
   * POST /api/auth/reset-password
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<PasswordResetResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    return { isValid: true };
  }

  /**
   * Validate verification code format
   */
  isValidVerificationCode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }
}

// React Hook for Password Reset
import { useState, useCallback } from 'react';

export const usePasswordReset = (baseUrl?: string) => {
  const client = new PasswordResetClient(baseUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!client.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const result = await client.requestPasswordReset(email);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const verifyCode = useCallback(async (email: string, code: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!client.isValidVerificationCode(code)) {
        throw new Error('Verification code must be 6 digits');
      }

      const result = await client.verifyResetCode(email, code);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const passwordValidation = client.isValidPassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message || 'Invalid password');
      }

      const result = await client.resetPassword(resetToken, newPassword);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    requestReset,
    verifyCode,
    resetPassword,
    clearError,
    validators: {
      isValidEmail: client.isValidEmail,
      isValidPassword: client.isValidPassword,
      isValidVerificationCode: client.isValidVerificationCode,
    }
  };
};

// Export the client and hook
export { PasswordResetClient };
export type { PasswordResetResponse, ApiError };
