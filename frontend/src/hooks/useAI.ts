import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { aiApi } from '../api/ai';
import { AIRecommendation, Product } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedProducts?: Product[];
  actionType?: 'add_to_cart' | 'show_rentals' | 'extend_rental' | 'explain_deposit';
  timestamp: string;
}

export const useAIConcierge = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Hello! I am your Relay AI Operations Concierge. Ask me anything like: "Show 4K cameras under ₹3,000/day" or "Extend my active rental".',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const conciergeMutation = useMutation({
    mutationFn: (query: string) => aiApi.sendConciergeMessage(query),
    onSuccess: (data, userQuery) => {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        sender: 'user',
        text: userQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: data.textResponse,
        recommendedProducts: data.recommendedProducts,
        actionType: data.actionType,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userMsg, aiMsg]);
    }
  });

  return {
    messages,
    sendMessage: conciergeMutation.mutateAsync,
    isThinking: conciergeMutation.isPending
  };
};

export const useAIRecommendations = (cartItems: Array<{ productId: string; category: string }>) => {
  return useQuery<AIRecommendation[]>({
    queryKey: ['ai-recommendations', cartItems],
    queryFn: () => aiApi.getSmartRecommendations(cartItems),
    enabled: cartItems.length > 0
  });
};
