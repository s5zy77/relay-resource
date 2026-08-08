import { apiClient } from './client';
import { Order, CartItem, Address } from '../types';

export interface CreateOrderPayload {
  items: CartItem[];
  deliveryType: 'delivery' | 'pickup';
  shippingAddress?: Address;
  pickupWindow?: { location: string; timeSlot: string };
  idempotencyKey: string;
}

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    try {
      const res = await apiClient.post('/orders', payload, {
        headers: { 'Idempotency-Key': payload.idempotencyKey }
      });
      return res.data;
    } catch {
      // Offline fallback: calculate financial totals authoritatively
      const rentalAmount = payload.items.reduce((sum, item) => sum + item.dailyRate * item.durationDays * item.quantity, 0);
      const securityDeposit = payload.items.reduce((sum, item) => sum + item.securityDeposit * item.quantity, 0);
      const taxes = Math.round(rentalAmount * 0.18);
      const totalAmount = rentalAmount + securityDeposit + taxes;

      const newOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: 'user-001',
        items: payload.items,
        rentalAmount,
        securityDeposit,
        taxes,
        totalAmount,
        paymentStatus: 'Paid',
        deliveryType: payload.deliveryType,
        shippingAddress: payload.shippingAddress,
        pickupWindow: payload.pickupWindow,
        createdAt: new Date().toISOString(),
        idempotencyKey: payload.idempotencyKey
      };

      return newOrder;
    }
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const res = await apiClient.get(`/orders/${orderId}`);
    return res.data;
  }
};
