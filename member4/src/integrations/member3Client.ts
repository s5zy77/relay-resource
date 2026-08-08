import axios, { AxiosInstance } from 'axios';
import { CONFIG } from '../../config/env';

export class Member3Client {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: CONFIG.MEMBER3_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, `GET ${url}`);
      throw error;
    }
  }

  private async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error, `POST ${url}`);
      throw error;
    }
  }

  private handleError(error: any, context: string) {
    if (axios.isAxiosError(error)) {
      console.error(`Member3Client Error in ${context}:`, error.message, error.response?.data);
    } else {
      console.error(`Member3Client Unknown Error in ${context}:`, error);
    }
  }

  async lookupCustomer(customerId: string) {
    return this.get(`/customers/${customerId}`);
  }

  async getCustomerRentals(customerId: string) {
    return this.get(`/customers/${customerId}/rentals`);
  }

  async getRental(rentalId: string) {
    return this.get(`/rentals/${rentalId}`);
  }

  async checkProductAvailability(productId: string, startDate: string, endDate: string) {
    return this.get(`/products/${productId}/availability`, { startDate, endDate });
  }

  async getProductDetails(productId: string) {
    return this.get(`/products/${productId}`);
  }

  async getPricing(productId: string, duration: number) {
    return this.get(`/products/${productId}/pricing`, { duration });
  }

  async calculateLateFee(rentalId: string) {
    return this.get(`/rentals/${rentalId}/late-fee`);
  }

  async getDepositStatus(rentalId: string) {
    return this.get(`/rentals/${rentalId}/deposit`);
  }

  async checkExtensionAvailability(rentalId: string, newEndDate: string) {
    return this.post(`/rentals/${rentalId}/check-extension`, { newEndDate });
  }

  async extendRental(rentalId: string, newEndDate: string) {
    return this.post(`/rentals/${rentalId}/extend`, { newEndDate });
  }

  async createRentalBooking(bookingData: any) {
    return this.post(`/rentals`, bookingData);
  }

  async cancelRental(rentalId: string, reason: string) {
    return this.post(`/rentals/${rentalId}/cancel`, { reason });
  }

  async getPickupInformation(rentalId: string) {
    return this.get(`/rentals/${rentalId}/pickup`);
  }

  async getReturnInformation(rentalId: string) {
    return this.get(`/rentals/${rentalId}/return`);
  }

  async getDeliveryInformation(rentalId: string) {
    return this.get(`/rentals/${rentalId}/delivery`);
  }

  async createPaymentLink(rentalId: string, amount: number) {
    return this.post(`/payments/create-link`, { rentalId, amount });
  }

  async createSupportTicket(customerId: string, issue: string) {
    return this.post(`/tickets`, { customerId, issue });
  }

  async submitCallResult(callId: string, result: any) {
    return this.post(`/internal/ai/calls/${callId}/result`, result);
  }

  async getOverdueRentals() {
    return this.get(`/rentals/overdue`);
  }

  async getDueTodayRentals() {
    return this.get(`/rentals/due-today`);
  }
}

export default new Member3Client();
