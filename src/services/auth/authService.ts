/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */

import { api, setAccessToken, ApiResponse } from '../api/client';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id: string;
    userId: string;
    avatar?: string;
    bio?: string;
    department?: string;
    position?: string;
    phone?: string;
    timezone: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  department?: string;
  position?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// Auth Service Class
class AuthService {
  private currentUser: User | null = null;

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; accessToken: string }> {
    const response = await api.post<{ user: User; accessToken: string }>(
      '/auth/login',
      credentials
    );

    const { user, accessToken } = response.data;
    
    // Store token
    setAccessToken(accessToken);
    localStorage.setItem('access_token', accessToken);
    
    // Store user
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set remember me
    if (credentials.rememberMe) {
      localStorage.setItem('remember_me', 'true');
    }

    return { user, accessToken };
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ user: User; accessToken: string }> {
    const response = await api.post<{ user: User; accessToken: string }>(
      '/auth/register',
      data
    );

    const { user, accessToken } = response.data;
    
    // Store token
    setAccessToken(accessToken);
    localStorage.setItem('access_token', accessToken);
    
    // Store user
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));

    return { user, accessToken };
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      setAccessToken(null);
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('remember_me');
      
      // Clear current user
      this.currentUser = null;
      
      // Redirect to login
      window.location.href = '/login';
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    });

    const tokens = response.data;
    
    // Update tokens
    setAccessToken(tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);

    return tokens;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    // Check cache first
    if (this.currentUser) {
      return this.currentUser;
    }

    // Check local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    // Fetch from API if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await api.get<User>('/auth/me');
        this.currentUser = response.data;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        return this.currentUser;
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/auth/profile', data);
    const updatedUser = response.data;
    
    // Update cache
    this.currentUser = updatedUser;
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return updatedUser;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await api.post('/auth/reset-password', data);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.post('/auth/change-password', data);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
    
    // Update user in storage
    if (this.currentUser) {
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification');
  }

  /**
   * Setup MFA
   */
  async setupMFA(): Promise<MFASetupResponse> {
    const response = await api.post<MFASetupResponse>('/auth/mfa/setup');
    return response.data;
  }

  /**
   * Enable MFA with verification code
   * NOTE: MFA not yet implemented in backend
   */
  async enableMFA(code: string): Promise<void> {
    // MFA will be implemented in future iteration
    throw new Error('MFA not yet implemented');
  }

  /**
   * Disable MFA with verification code
   * NOTE: MFA not yet implemented in backend
   */
  async disableMFA(code: string): Promise<void> {
    // MFA will be implemented in future iteration
    throw new Error('MFA not yet implemented');
  }

  /**
   * Verify MFA code during login
   */
  async verifyMFA(code: string): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/mfa/verify', { code });
    const tokens = response.data;
    
    // Update tokens
    setAccessToken(tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);

    return tokens;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Check if user has permission
   * NOTE: Permission system will be implemented later
   */
  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    // For now, check based on role hierarchy
    const roleHierarchy = {
      'SUPER_ADMIN': 4,
      'ADMIN': 3,
      'MODERATOR': 2,
      'USER': 1
    };
    // Super admin has all permissions
    return this.currentUser.role === 'SUPER_ADMIN';
  }

  /**
   * Check if user has role
   */
  hasRole(roleName: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === roleName;
  }

  /**
   * Clear authentication state
   */
  clearAuth(): void {
    setAccessToken(null);
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember_me');
    this.currentUser = null;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
