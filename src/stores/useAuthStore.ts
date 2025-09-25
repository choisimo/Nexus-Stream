/**
 * Auth Store - Zustand
 * Global state management for authentication
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import authService, { User, LoginCredentials, RegisterData } from '@/services/auth/authService';

// Store State Interface
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// Create Auth Store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login Action
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const { user } = await authService.login(credentials);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } catch (error: any) {
            set({ 
              user: null,
              isAuthenticated: false,
              isLoading: false, 
              error: error.message || 'Login failed' 
            });
            throw error;
          }
        },

        // Register Action
        register: async (data: RegisterData) => {
          set({ isLoading: true, error: null });
          
          try {
            const { user } = await authService.register(data);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } catch (error: any) {
            set({ 
              user: null,
              isAuthenticated: false,
              isLoading: false, 
              error: error.message || 'Registration failed' 
            });
            throw error;
          }
        },

        // Logout Action
        logout: async () => {
          set({ isLoading: true });
          
          try {
            await authService.logout();
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
          } catch (error: any) {
            // Even if logout fails, clear local state
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: error.message 
            });
          }
        },

        // Refresh Authentication
        refreshAuth: async () => {
          const { isAuthenticated } = get();
          if (!isAuthenticated) return;

          set({ isLoading: true });
          
          try {
            const user = await authService.getCurrentUser();
            if (user) {
              set({ 
                user, 
                isAuthenticated: true, 
                isLoading: false,
                error: null 
              });
            } else {
              set({ 
                user: null, 
                isAuthenticated: false, 
                isLoading: false 
              });
            }
          } catch (error: any) {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: error.message 
            });
          }
        },

        // Check Authentication Status
        checkAuth: async () => {
          set({ isLoading: true });
          
          try {
            const user = await authService.getCurrentUser();
            if (user) {
              set({ 
                user, 
                isAuthenticated: true, 
                isLoading: false,
                error: null 
              });
            } else {
              set({ 
                user: null, 
                isAuthenticated: false, 
                isLoading: false 
              });
            }
          } catch (error: any) {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null // Don't show error on initial check
            });
          }
        },

        // Update User
        updateUser: (userData: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            set({ user: updatedUser });
          }
        },

        // Clear Error
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-storage', // Storage key
        partialize: (state) => ({ 
          // Only persist essential data
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store', // DevTools name
    }
  )
);

// Selector Hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Permission Hooks
export const useHasPermission = (permission: string) => {
  const user = useUser();
  return user ? user.permissions.includes(permission) : false;
};

export const useHasRole = (roleName: string) => {
  const user = useUser();
  return user ? user.roles.some(role => role.name === roleName) : false;
};

// Initialize auth check on app start
export const initializeAuth = async () => {
  const { checkAuth } = useAuthStore.getState();
  await checkAuth();
};
