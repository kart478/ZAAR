// Authentication API service for ZAAR
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    statusCode: number;
  };
  meta?: any;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface RequestCodeData {
  email: string;
  purpose: 'login' | 'signup';
}

export interface VerifyCodeData {
  email: string;
  code: string;
  purpose: 'login' | 'signup';
}

export interface RequestPasswordResetData {
  email: string;
}

export interface VerifyPasswordResetData {
  email: string;
  code: string;
  newPassword: string;
}

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL ? `${API_BASE_URL}/api/v1` : '/api/v1';
  }

  // Helper method to get access token from localStorage
  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  // Helper method to set access token
  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  // Helper method to clear tokens
  public clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      // Note: refresh token is stored in httpOnly cookie, cleared by server
    }
  }

  // Generic API request method with auto-refresh
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get current access token
    const token = this.getAccessToken();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Make initial request
    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for httpOnly refresh token
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && token) {
      try {
        await this.refreshToken();
        
        // Retry with new token
        const newToken = this.getAccessToken();
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
        }
        
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        this.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
        throw refreshError;
      }
    }

    const responseText = await response.text();
    let data: ApiResponse<T> = { success: false };

    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText) as ApiResponse<T>;
      } catch {
        if (!response.ok) {
          throw new Error(responseText);
        }
      }
    }

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Request failed');
    }

    return data;
  }

  // Login with email and password
  async login(data: LoginData): Promise<ApiResponse<{ user: User; accessToken: string }>> {
    const response = await this.request<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store access token
    if (response.data?.accessToken) {
      this.setAccessToken(response.data.accessToken);
    }

    return response;
  }

  // Register new user
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens if returned
    if (response.data && 'accessToken' in response.data) {
      this.setAccessToken((response.data as any).accessToken);
    }

    return response;
  }

  // Request OTP code
  async requestCode(data: RequestCodeData): Promise<ApiResponse<{ cooldownSeconds: number }>> {
    return this.request<{ cooldownSeconds: number }>('/auth/request-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Verify OTP code
  async verifyCode(data: VerifyCodeData): Promise<ApiResponse<{ user: User; accessToken: string }>> {
    const response = await this.request<{ user: User; accessToken: string }>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store access token
    if (response.data?.accessToken) {
      this.setAccessToken(response.data.accessToken);
    }

    return response;
  }

  // Resend OTP code
  async resendCode(data: RequestCodeData): Promise<ApiResponse<{ cooldownSeconds: number }>> {
    return this.request<{ cooldownSeconds: number }>('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Refresh access token using the HTTP-only refresh token cookie
  async refreshToken(): Promise<ApiResponse<{ accessToken: string; user: User }>> {
    const response = await this.request<{ accessToken: string; user: User }>('/auth/refresh', {
      method: 'POST',
    });

    // Store new access token
    if (response.data?.accessToken) {
      this.setAccessToken(response.data.accessToken);
    }

    return response;
  }

  // Logout user
  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    // Clear tokens
    this.clearTokens();

    return response;
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Get stored user data (for quick UI updates)
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Store user data
  setStoredUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Clear stored user data
  clearStoredUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  // Request password reset code
  async requestPasswordReset(data: RequestPasswordResetData): Promise<ApiResponse<{ cooldownSeconds: number }>> {
    return this.request<{ cooldownSeconds: number }>('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Verify password reset code and set new password
  async verifyPasswordReset(data: VerifyPasswordResetData): Promise<ApiResponse> {
    return this.request('/auth/password-reset/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export types for use in components
export type { AuthService };
