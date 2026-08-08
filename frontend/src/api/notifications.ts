import { apiClient } from './client';
import { CustomerNotification } from '../types';
import { INITIAL_NOTIFICATIONS } from './mockData';

let inMemoryNotifs = [...INITIAL_NOTIFICATIONS];

export const notificationsApi = {
  getNotifications: async (): Promise<CustomerNotification[]> => {
    try {
      const res = await apiClient.get('/notifications');
      return res.data;
    } catch {
      return inMemoryNotifs;
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      const n = inMemoryNotifs.find(x => x.id === id);
      if (n) n.read = true;
    }
  }
};
