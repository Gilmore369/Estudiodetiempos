import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, GoogleUser, GoogleSheetsConfig } from '@/types';
import { authService } from '@/services/authService';

interface AuthStore extends Omit<AuthState, 'refreshToken'> {
  // Actions
  initialize: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: GoogleUser | null) => void;
  setSheetsConfig: (config: GoogleSheetsConfig | null) => void;
  refreshToken: () => Promise<void>;
  checkAuthStatus: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      accessToken: null,
      sheetsConfig: null,

      // Actions
      initialize: async () => {
        try {
          await authService.initialize();
          
          // Check if user is already signed in
          if (authService.isSignedIn()) {
            const user = authService.getCurrentUser();
            const accessToken = authService.getAccessToken();
            
            set({
              isAuthenticated: true,
              user,
              accessToken
            });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null
          });
        }
      },

      signIn: async () => {
        try {
          const user = await authService.signIn();
          const accessToken = authService.getAccessToken();

          set({
            isAuthenticated: true,
            user,
            accessToken
          });
        } catch (error) {
          console.error('Sign in failed:', error);
          throw error;
        }
      },

      signOut: async () => {
        try {
          await authService.signOut();
          
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            sheetsConfig: null
          });
        } catch (error) {
          console.error('Sign out failed:', error);
          throw error;
        }
      },

      setUser: (user) => {
        set({ user });
      },

      setSheetsConfig: (config) => {
        set({ sheetsConfig: config });
      },

      refreshToken: async () => {
        try {
          const accessToken = await authService.refreshToken();
          set({ accessToken });
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, sign out user
          get().signOut();
          throw error;
        }
      },

      checkAuthStatus: () => {
        const isSignedIn = authService.isSignedIn();
        const currentState = get();

        if (isSignedIn && !currentState.isAuthenticated) {
          // User is signed in but store doesn't reflect it
          const user = authService.getCurrentUser();
          const accessToken = authService.getAccessToken();
          
          set({
            isAuthenticated: true,
            user,
            accessToken
          });
        } else if (!isSignedIn && currentState.isAuthenticated) {
          // User is signed out but store still shows authenticated
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        sheetsConfig: state.sheetsConfig
      })
    }
  )
);