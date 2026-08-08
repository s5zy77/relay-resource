import { apiClient } from './client';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from './mockData';

export interface ProductFilterParams {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'popular';
  startDate?: string;
  endDate?: string;
}

export const productsApi = {
  getProducts: async (params?: ProductFilterParams): Promise<{ products: Product[]; total: number }> => {
    try {
      const res = await apiClient.get('/products', { params });
      return res.data;
    } catch {
      // Offline fallback & deterministic filtering logic
      let filtered = [...INITIAL_PRODUCTS];
      if (params?.category && params.category !== 'All') {
        filtered = filtered.filter(p => p.category.toLowerCase() === params.category?.toLowerCase());
      }
      if (params?.brand && params.brand !== 'All') {
        filtered = filtered.filter(p => p.brand.toLowerCase() === params.brand?.toLowerCase());
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
      }
      if (params?.maxPrice) {
        filtered = filtered.filter(p => p.dailyRate <= (params.maxPrice || Infinity));
      }
      if (params?.sortBy === 'price_asc') {
        filtered.sort((a, b) => a.dailyRate - b.dailyRate);
      } else if (params?.sortBy === 'price_desc') {
        filtered.sort((a, b) => b.dailyRate - a.dailyRate);
      }
      return { products: filtered, total: filtered.length };
    }
  },

  getProductById: async (id: string): Promise<Product> => {
    try {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    } catch {
      const product = INITIAL_PRODUCTS.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    }
  },

  checkAvailability: async (
    productId: string,
    startDate: string,
    endDate: string,
    variantId?: string
  ): Promise<{ isAvailable: boolean; availableStock: number; estimatedRentalPrice: number; securityDeposit: number }> => {
    try {
      const res = await apiClient.get(`/products/${productId}/availability`, {
        params: { startDate, endDate, variantId }
      });
      return res.data;
    } catch {
      const product = INITIAL_PRODUCTS.find(p => p.id === productId);
      if (!product) return { isAvailable: false, availableStock: 0, estimatedRentalPrice: 0, securityDeposit: 0 };
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      
      return {
        isAvailable: product.isAvailable && product.stockCount > 0,
        availableStock: product.stockCount,
        estimatedRentalPrice: product.dailyRate * days,
        securityDeposit: product.securityDeposit
      };
    }
  }
};
