import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  defaultStartDate: string;
  defaultEndDate: string;
  addItem: (product: Product, variantId?: string, startDate?: string, endDate?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemDates: (itemId: string, startDate: string, endDate: string) => void;
  clearCart: () => void;
  getTotals: () => {
    rentalSubtotal: number;
    securityDeposit: number;
    taxes: number;
    estimatedTotal: number;
    itemCount: number;
  };
}

const getToday = () => new Date().toISOString().split('T')[0];
const getFutureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [
        {
          id: 'cart-item-1',
          productId: 'prod-001',
          variantId: 'v1',
          title: 'Sony A7 IV Mirrorless Camera',
          variantName: 'Body Only',
          dailyRate: 2500,
          securityDeposit: 35000,
          startDate: getFutureDate(2),
          endDate: getFutureDate(4),
          durationDays: 2,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
        }
      ],
      defaultStartDate: getFutureDate(2),
      defaultEndDate: getFutureDate(4),

      addItem: (product, variantId, startDate, endDate) => {
        const items = get().items;
        const start = startDate || get().defaultStartDate;
        const end = endDate || get().defaultEndDate;
        const startD = new Date(start);
        const endD = new Date(end);
        const durationDays = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));

        const selectedVariant = product.variants.find(v => v.id === variantId) || product.variants[0];
        const dailyRate = product.dailyRate + (selectedVariant ? selectedVariant.priceModifier : 0);

        const existingIndex = items.findIndex(
          i => i.productId === product.id && i.variantId === variantId && i.startDate === start && i.endDate === end
        );

        if (existingIndex > -1) {
          const updated = [...items];
          updated[existingIndex].quantity += 1;
          set({ items: updated });
        } else {
          const newItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            productId: product.id,
            variantId: selectedVariant?.id,
            title: product.title,
            variantName: selectedVariant?.name,
            dailyRate,
            securityDeposit: product.securityDeposit,
            startDate: start,
            endDate: end,
            durationDays,
            quantity: 1,
            image: product.images[0]
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter(i => i.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map(i => (i.id === itemId ? { ...i, quantity } : i))
        });
      },

      updateItemDates: (itemId, startDate, endDate) => {
        const startD = new Date(startDate);
        const endD = new Date(endDate);
        const durationDays = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));

        set({
          items: get().items.map(i =>
            i.id === itemId ? { ...i, startDate, endDate, durationDays } : i
          )
        });
      },

      clearCart: () => set({ items: [] }),

      getTotals: () => {
        const items = get().items;
        const rentalSubtotal = items.reduce(
          (sum, item) => sum + item.dailyRate * item.durationDays * item.quantity,
          0
        );
        const securityDeposit = items.reduce(
          (sum, item) => sum + item.securityDeposit * item.quantity,
          0
        );
        const taxes = Math.round(rentalSubtotal * 0.18);
        const estimatedTotal = rentalSubtotal + securityDeposit + taxes;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return { rentalSubtotal, securityDeposit, taxes, estimatedTotal, itemCount };
      }
    }),
    {
      name: 'relay_cart_storage'
    }
  )
);
