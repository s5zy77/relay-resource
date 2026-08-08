export type Role = 'customer' | 'vendor' | 'admin';

export type RentalStatus =
  | 'Draft'
  | 'Quotation'
  | 'Confirmed'
  | 'Pickup Pending'
  | 'Active'
  | 'Return Pending'
  | 'Returned'
  | 'Completed'
  | 'Cancelled'
  | 'Overdue'
  | 'Payment Failed'
  | 'Maintenance Hold';

export type PaymentStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Refunded';

export type InvoiceStatus = 'Draft' | 'Posted' | 'Paid' | 'Partially Paid' | 'Refunded';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceModifier: number;
  attributes: Record<string, string>;
  inStock: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  dailyRate: number;
  securityDeposit: number;
  images: string[];
  variants: ProductVariant[];
  attributes: Record<string, string>;
  isAvailable: boolean;
  stockCount: number;
  highDemand?: boolean;
  rentalTerms?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  variantName?: string;
  dailyRate: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  quantity: number;
  image: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  rentalAmount: number;
  securityDeposit: number;
  taxes: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  deliveryType: 'delivery' | 'pickup';
  shippingAddress?: Address;
  pickupWindow?: {
    location: string;
    timeSlot: string;
  };
  createdAt: string;
  idempotencyKey?: string;
}

export interface RentalTimelineEvent {
  status: RentalStatus;
  timestamp: string;
  note: string;
  executedBy: 'customer' | 'admin' | 'ai';
}

export interface Rental {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  durationDays: number;
  dailyRate: number;
  totalRate: number;
  securityDeposit: number;
  pickupLocation: string;
  qrCodeData: string;
  invoiceId: string;
  timeline: RentalTimelineEvent[];
  isOverdue?: boolean;
  overdueHours?: number;
  estimatedLateFee?: number;
}

export interface DepositDeduction {
  reason: string;
  amount: number;
  category: 'damage' | 'late_fee' | 'cleaning' | 'missing_item';
  description: string;
}

export interface DepositStatus {
  rentalId: string;
  totalDeposit: number;
  refundedAmount: number;
  deductions: DepositDeduction[];
  status: 'held' | 'partially_refunded' | 'fully_refunded' | 'disputed';
  aiExplanation?: string;
}

export interface Invoice {
  id: string;
  rentalId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  rentalAmount: number;
  securityDeposit: number;
  taxes: number;
  totalAmount: number;
  status: InvoiceStatus;
  items: Array<{ description: string; amount: number }>;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  company?: string;
  gstNumber?: string;
  avatar?: string;
  address?: Address;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'pickup' | 'return' | 'overdue' | 'deposit' | 'invoice' | 'ai';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AIRecommendation {
  productId: string;
  title: string;
  dailyRate: number;
  image: string;
  reason: string;
}

export interface AIIntentResult {
  textResponse: string;
  extractedFilters?: {
    category?: string;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
    brand?: string;
  };
  recommendedProducts?: Product[];
  actionType?: 'add_to_cart' | 'show_rentals' | 'extend_rental' | 'explain_deposit';
}
