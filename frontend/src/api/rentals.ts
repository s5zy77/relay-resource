import { apiClient } from './client';
import { Rental, RentalStatus } from '../types';
import { INITIAL_RENTALS } from './mockData';

let inMemoryRentals = [...INITIAL_RENTALS];

export const rentalsApi = {
  getMyRentals: async (statusFilter?: string): Promise<Rental[]> => {
    try {
      const res = await apiClient.get('/rentals', { params: { status: statusFilter } });
      return res.data;
    } catch {
      if (!statusFilter || statusFilter === 'All') return inMemoryRentals;
      return inMemoryRentals.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }
  },

  getRentalById: async (id: string): Promise<Rental> => {
    try {
      const res = await apiClient.get(`/rentals/${id}`);
      return res.data;
    } catch {
      const rental = inMemoryRentals.find(r => r.id === id);
      if (!rental) throw new Error('Rental not found');
      return rental;
    }
  },

  requestExtension: async (
    rentalId: string,
    newEndDate: string
  ): Promise<{ success: boolean; rental: Rental; additionalAmount: number; newEndDate: string }> => {
    try {
      const res = await apiClient.post(`/rentals/${rentalId}/extend`, { newEndDate });
      return res.data;
    } catch {
      const rentalIndex = inMemoryRentals.findIndex(r => r.id === rentalId);
      if (rentalIndex === -1) throw new Error('Rental not found');
      
      const rental = inMemoryRentals[rentalIndex];
      const oldEnd = new Date(rental.endDate);
      const newEnd = new Date(newEndDate);
      const extraDays = Math.max(1, Math.ceil((newEnd.getTime() - oldEnd.getTime()) / (1000 * 60 * 60 * 24)));
      const additionalAmount = rental.dailyRate * extraDays;

      const updatedRental: Rental = {
        ...rental,
        endDate: newEndDate,
        durationDays: rental.durationDays + extraDays,
        totalRate: rental.totalRate + additionalAmount,
        status: 'Active',
        isOverdue: false,
        timeline: [
          ...rental.timeline,
          {
            status: 'Active',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            note: `Rental extended by ${extraDays} day(s) until ${newEndDate}. Additional charge: ₹${additionalAmount}`,
            executedBy: 'customer'
          }
        ]
      };

      inMemoryRentals[rentalIndex] = updatedRental;

      return {
        success: true,
        rental: updatedRental,
        additionalAmount,
        newEndDate
      };
    }
  },

  confirmPickup: async (rentalId: string): Promise<Rental> => {
    try {
      const res = await apiClient.post(`/rentals/${rentalId}/pickup`);
      return res.data;
    } catch {
      const rental = inMemoryRentals.find(r => r.id === rentalId);
      if (rental) {
        rental.status = 'Active';
        rental.timeline.push({
          status: 'Active',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          note: 'Pickup confirmed via QR scanner.',
          executedBy: 'customer'
        });
      }
      return rental || inMemoryRentals[0];
    }
  },

  confirmReturn: async (rentalId: string): Promise<Rental> => {
    try {
      const res = await apiClient.post(`/rentals/${rentalId}/return`);
      return res.data;
    } catch {
      const rental = inMemoryRentals.find(r => r.id === rentalId);
      if (rental) {
        rental.status = 'Return Pending';
        rental.timeline.push({
          status: 'Return Pending',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          note: 'Return initiated by customer. Awaiting inspection settlement.',
          executedBy: 'customer'
        });
      }
      return rental || inMemoryRentals[0];
    }
  }
};
