import { apiClient } from './client';
import { UserSession } from '../types';

export const profileApi = {
  getProfile: async (): Promise<UserSession> => {
    const res = await apiClient.get('/profile');
    return res.data;
  },

  updateProfile: async (updated: Partial<UserSession>): Promise<UserSession> => {
    try {
      const res = await apiClient.put('/profile', updated);
      return res.data;
    } catch {
      return {
        id: 'user-001',
        name: updated.name || 'Anushka Ghosh',
        email: updated.email || 'anushka@example.com',
        role: 'customer',
        phone: updated.phone || '+91 98765 43210',
        address: updated.address
      };
    }
  }
};
