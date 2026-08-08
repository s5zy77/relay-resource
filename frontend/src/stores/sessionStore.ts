import { create } from 'zustand';
import { UserSession, Role } from '../types';

interface SessionState {
  user: UserSession | null;
  isAuthenticated: boolean;
  token: string | null;
  role: Role;
  setSession: (user: UserSession, token: string) => void;
  clearSession: () => void;
  updateUser: (updated: Partial<UserSession>) => void;
}

const DEFAULT_USER: UserSession = {
  id: 'user-001',
  name: 'Anushka Ghosh',
  email: 'anushka@example.com',
  role: 'customer',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  address: {
    street: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560038',
    country: 'India'
  }
};

export const useSessionStore = create<SessionState>((set) => ({
  user: DEFAULT_USER,
  isAuthenticated: true,
  token: localStorage.getItem('relay_token') || 'mock-jwt-token-customer',
  role: 'customer',

  setSession: (user, token) => {
    localStorage.setItem('relay_token', token);
    set({ user, token, isAuthenticated: true, role: user.role });
  },

  clearSession: () => {
    localStorage.removeItem('relay_token');
    set({ user: null, token: null, isAuthenticated: false, role: 'customer' });
  },

  updateUser: (updated) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : null
    }));
  }
}));
