import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api/client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  stellarPublicKey?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, role: string) => Promise<AuthUser>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

/** Global auth store backed by localStorage tokens managed in the API client. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
            '/auth/login',
            { email, password }
          );
          api.setTokens(res.accessToken, res.refreshToken);
          set({ user: res.user, isAuthenticated: true, isLoading: false });
          return res.user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (email, password, role) => {
        set({ isLoading: true });
        try {
          const res = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
            '/auth/register',
            { email, password, role }
          );
          api.setTokens(res.accessToken, res.refreshToken);
          set({ user: res.user, isAuthenticated: true, isLoading: false });
          return res.user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        api.clearTokens();
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') window.location.href = '/';
      },

      loadUser: async () => {
        try {
          const user = await api.get<AuthUser>('/auth/me');
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    { name: 'bayanfi-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);

/** Maps a user role to its default dashboard route. */
export function dashboardPathForRole(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ORG_ADMIN':
    case 'STAFF':
      return '/admin';
    case 'MERCHANT':
      return '/merchant';
    case 'AUDITOR':
      return '/auditor';
    case 'BENEFICIARY':
    default:
      return '/beneficiary';
  }
}
