import { create } from 'zustand';
import {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  getActiveSession,
  subscribeToAuthState,
} from '../services/supabase/auth';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  isGuest: boolean;
}

export interface UserStoreState {
  user: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;

  // Actions
  initializeAuth: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, name?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest-local-audiophile',
  email: 'audiophile.guest@local.lab',
  displayName: 'Audiophile Guest',
  isGuest: true,
};

export const useUserStore = create<UserStoreState>((set) => ({
  user: DEFAULT_GUEST_USER,
  isAuthenticated: false,
  isLoading: false,
  authError: null,

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const { user } = await getActiveSession();
      if (user) {
        set({
          user: {
            id: user.id,
            email: user.email || '',
            displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Audiophile User',
            isGuest: false,
          },
          isAuthenticated: true,
          authError: null,
        });
      } else {
        set({ user: DEFAULT_GUEST_USER, isAuthenticated: false });
      }

      // Subscribe to remote auth state changes
      subscribeToAuthState((remoteUser) => {
        if (remoteUser) {
          set({
            user: {
              id: remoteUser.id,
              email: remoteUser.email || '',
              displayName: remoteUser.user_metadata?.display_name || remoteUser.email?.split('@')[0] || 'Audiophile User',
              isGuest: false,
            },
            isAuthenticated: true,
          });
        } else {
          set({ user: DEFAULT_GUEST_USER, isAuthenticated: false });
        }
      });
    } catch (err: any) {
      console.warn('[useUserStore] Auth initialization warning:', err?.message || err);
      set({ user: DEFAULT_GUEST_USER, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, pass) => {
    set({ isLoading: true, authError: null });
    try {
      const { user, error } = await signInWithEmail(email, pass);
      if (error || !user) {
        set({ authError: error || 'Failed to authenticate.', isLoading: false });
        return false;
      }

      set({
        user: {
          id: user.id,
          email: user.email || email,
          displayName: user.user_metadata?.display_name || email.split('@')[0],
          isGuest: false,
        },
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      return true;
    } catch (err: any) {
      set({ authError: err.message || 'Authentication error', isLoading: false });
      return false;
    }
  },

  signUp: async (email, pass, name) => {
    set({ isLoading: true, authError: null });
    try {
      const { user, error } = await signUpWithEmail(email, pass, name);
      if (error || !user) {
        set({ authError: error || 'Failed to register account.', isLoading: false });
        return false;
      }

      set({
        user: {
          id: user.id,
          email: user.email || email,
          displayName: name || email.split('@')[0],
          isGuest: false,
        },
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      return true;
    } catch (err: any) {
      set({ authError: err.message || 'Registration error', isLoading: false });
      return false;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await signOutUser();
    set({
      user: DEFAULT_GUEST_USER,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
    });
  },

  clearError: () => set({ authError: null }),
}));

