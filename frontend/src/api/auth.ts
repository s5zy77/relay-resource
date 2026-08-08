import { apiClient } from './client';
import { UserSession } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface VendorSignupCredentials {
  companyName: string;
  email: string;
  phone: string;
  gstNumber: string;
  category: string;
}

// Fallback session for standalone client demo
const MOCK_USER: UserSession = {
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

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: UserSession; token: string }> => {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      localStorage.setItem('relay_token', res.data.token);
      return res.data;
    } catch {
      // Fallback for offline hackathon mode
      const token = 'mock-jwt-token-customer';
      localStorage.setItem('relay_token', token);
      return { user: MOCK_USER, token };
    }
  },

  signup: async (credentials: SignupCredentials): Promise<{ user: UserSession; token: string }> => {
    try {
      const res = await apiClient.post('/auth/signup', credentials);
      localStorage.setItem('relay_token', res.data.token);
      return res.data;
    } catch {
      const token = 'mock-jwt-token-customer';
      localStorage.setItem('relay_token', token);
      const newUser: UserSession = { ...MOCK_USER, name: credentials.name, email: credentials.email, phone: credentials.phone };
      return { user: newUser, token };
    }
  },

  vendorSignup: async (credentials: VendorSignupCredentials): Promise<{ user: UserSession; success: boolean }> => {
    try {
      const res = await apiClient.post('/auth/vendor-signup', credentials);
      return res.data;
    } catch {
      const vendorUser: UserSession = {
        id: 'vendor-001',
        name: credentials.companyName,
        email: credentials.email,
        phone: credentials.phone,
        role: 'vendor',
        company: credentials.companyName,
        gstNumber: credentials.gstNumber
      };
      return { user: vendorUser, success: true };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('relay_token');
    }
  },

  getCurrentUser: async (): Promise<UserSession> => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data.user;
    } catch {
      return MOCK_USER;
    }
  }
};
