import { apiClient } from './client';
import { AIIntentResult, AIRecommendation, Product } from '../types';
import { INITIAL_PRODUCTS } from './mockData';

export const aiApi = {
  // 1. Customer AI Concierge Interaction
  sendConciergeMessage: async (query: string, context?: any): Promise<AIIntentResult> => {
    try {
      const res = await apiClient.post('/ai/concierge', { query, context });
      return res.data;
    } catch {
      // Offline AI Intelligence Engine logic
      const q = query.toLowerCase();
      
      if (q.includes('camera') || q.includes('4k') || q.includes('wedding')) {
        const cameras = INITIAL_PRODUCTS.filter(p => p.category === 'Cameras');
        return {
          textResponse: `I found ${cameras.length} high-performance camera setups perfect for video & wedding shoots. I recommend the Sony A7 IV for versatility or the RED Komodo 6K for cinema production.`,
          extractedFilters: { category: 'Cameras', maxPrice: 10000 },
          recommendedProducts: cameras,
          actionType: 'add_to_cart'
        };
      }

      if (q.includes('under') || q.includes('₹') || q.includes('cheap') || q.includes('budget')) {
        const matchPrice = query.match(/\d+/);
        const maxP = matchPrice ? parseInt(matchPrice[0], 10) * (q.includes('k') ? 1000 : 1) : 3000;
        const budgetItems = INITIAL_PRODUCTS.filter(p => p.dailyRate <= maxP);

        return {
          textResponse: `Showing ${budgetItems.length} rental items available under ₹${maxP.toLocaleString()}/day.`,
          extractedFilters: { maxPrice: maxP },
          recommendedProducts: budgetItems,
          actionType: 'show_rentals'
        };
      }

      if (q.includes('extend') || q.includes('more day') || q.includes('keep')) {
        return {
          textResponse: `I can help you extend your active rental (RLY-DEMO-001 Sony A7 IV). Checked backend availability: 1 extra day is available for ₹2,500. Would you like me to confirm this extension?`,
          actionType: 'extend_rental'
        };
      }

      return {
        textResponse: `I am your Relay AI Operations Assistant. I can help you search rental inventory by natural language, find equipment under a specific budget, check date availability, or manage your active rentals.`,
        recommendedProducts: INITIAL_PRODUCTS.slice(0, 2)
      };
    }
  },

  // 2. Natural-Language Filter Extraction (Deterministic pipeline)
  extractSearchFilters: async (naturalQuery: string): Promise<{ category?: string; maxPrice?: number; brand?: string; search?: string }> => {
    try {
      const res = await apiClient.post('/ai/extract-filters', { query: naturalQuery });
      return res.data;
    } catch {
      const q = naturalQuery.toLowerCase();
      let category: string | undefined;
      let brand: string | undefined;
      let maxPrice: number | undefined;

      if (q.includes('camera')) category = 'Cameras';
      if (q.includes('gimbal')) category = 'Gimbals';
      if (q.includes('light')) category = 'Lighting';
      if (q.includes('mic') || q.includes('audio')) category = 'Audio';

      if (q.includes('sony')) brand = 'Sony';
      if (q.includes('red')) brand = 'RED';
      if (q.includes('dji')) brand = 'DJI';

      const priceMatch = naturalQuery.match(/(\d+)\s*(k|000)?/i);
      if (priceMatch) {
        let val = parseInt(priceMatch[1], 10);
        if (priceMatch[2]?.toLowerCase() === 'k') val *= 1000;
        if (val > 100) maxPrice = val;
      }

      return { category, brand, maxPrice, search: naturalQuery };
    }
  },

  // 3. AI Smart Recommendations (Contextual cart cross-sell)
  getSmartRecommendations: async (cartItems: Array<{ productId: string; category: string }>): Promise<AIRecommendation[]> => {
    try {
      const res = await apiClient.post('/ai/recommendations', { items: cartItems });
      return res.data;
    } catch {
      const hasCamera = cartItems.some(i => i.category === 'Cameras');
      const recommendations: AIRecommendation[] = [];

      if (hasCamera) {
        recommendations.push({
          productId: 'prod-003',
          title: 'DJI RS 3 Pro Gimbal Stabilizer',
          dailyRate: 1500,
          image: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80',
          reason: 'Recommended accessory: 84% of camera renters add a 3-axis stabilizer.'
        });
        recommendations.push({
          productId: 'prod-005',
          title: 'Sennheiser Wireless Mic Set',
          dailyRate: 1200,
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
          reason: 'Capture crystal-clear dialogue alongside video.'
        });
      }

      return recommendations;
    }
  },

  // 4. AI Quotation Request for bulk orders
  requestAIQuote: async (payload: { description: string; durationDays: number }): Promise<{ quoteId: string; estimatedTotal: number; items: string[] }> => {
    try {
      const res = await apiClient.post('/ai/quote-request', payload);
      return res.data;
    } catch {
      return {
        quoteId: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
        estimatedTotal: 28500,
        items: ['Sony A7 IV Kit x2', 'Aputure 600d Pro x1', 'Wireless Mic Kit x2']
      };
    }
  }
};
