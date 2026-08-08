import { apiClient } from './client';
import { Invoice } from '../types';
import { INITIAL_INVOICES } from './mockData';

export const invoicesApi = {
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const res = await apiClient.get('/invoices');
      return res.data;
    } catch {
      return INITIAL_INVOICES;
    }
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    try {
      const res = await apiClient.get(`/invoices/${id}`);
      return res.data;
    } catch {
      const invoice = INITIAL_INVOICES.find(i => i.id === id);
      if (!invoice) throw new Error('Invoice not found');
      return invoice;
    }
  }
};
