import { create } from 'zustand';
import { Address } from '../types';

export type CheckoutStep = 'customer_info' | 'delivery_pickup' | 'dates_review' | 'payment' | 'confirmation';

interface CheckoutState {
  currentStep: CheckoutStep;
  deliveryType: 'delivery' | 'pickup';
  shippingAddress: Address;
  pickupWindow: {
    location: string;
    timeSlot: string;
  };
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'net_30';
  isSubmitting: boolean;
  idempotencyKey: string;
  setStep: (step: CheckoutStep) => void;
  setDeliveryType: (type: 'delivery' | 'pickup') => void;
  setShippingAddress: (address: Partial<Address>) => void;
  setPickupWindow: (location: string, timeSlot: string) => void;
  setPaymentMethod: (method: 'upi' | 'card' | 'netbanking' | 'net_30') => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  resetCheckout: () => void;
}

const DEFAULT_ADDRESS: Address = {
  street: 'Indiranagar 100ft Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  zip: '560038',
  country: 'India'
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  currentStep: 'customer_info',
  deliveryType: 'pickup',
  shippingAddress: DEFAULT_ADDRESS,
  pickupWindow: {
    location: 'Relay Tech Hub — Store #4, MG Road, Bengaluru',
    timeSlot: '10:00 AM - 02:00 PM'
  },
  paymentMethod: 'upi',
  isSubmitting: false,
  idempotencyKey: `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,

  setStep: (currentStep) => set({ currentStep }),
  setDeliveryType: (deliveryType) => set({ deliveryType }),
  setShippingAddress: (address) =>
    set((state) => ({ shippingAddress: { ...state.shippingAddress, ...address } })),
  setPickupWindow: (location, timeSlot) => set({ pickupWindow: { location, timeSlot } }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  resetCheckout: () =>
    set({
      currentStep: 'customer_info',
      isSubmitting: false,
      idempotencyKey: `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    })
}));
