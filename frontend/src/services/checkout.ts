import { ordersApi, CreateOrderPayload } from '../api/orders';
import { paymentsApi } from '../api/payments';
import { useCartStore } from '../stores/cartStore';
import { useCheckoutStore } from '../stores/checkoutStore';
import { Order } from '../types';

export const processCustomerCheckout = async (): Promise<Order> => {
  const { items, clearCart } = useCartStore.getState();
  const { deliveryType, shippingAddress, pickupWindow, idempotencyKey, setIsSubmitting } =
    useCheckoutStore.getState();

  if (items.length === 0) {
    throw new Error('Your cart is empty.');
  }

  setIsSubmitting(true);

  try {
    const payload: CreateOrderPayload = {
      items,
      deliveryType,
      shippingAddress: deliveryType === 'delivery' ? shippingAddress : undefined,
      pickupWindow: deliveryType === 'pickup' ? pickupWindow : undefined,
      idempotencyKey
    };

    // 1. Create order authoritatively on backend
    const order = await ordersApi.createOrder(payload);

    // 2. Initiate payment processing
    const payment = await paymentsApi.initiatePayment(order.id, order.totalAmount);

    // 3. Verify payment success
    await paymentsApi.verifyPayment(payment.paymentId);

    // 4. Clear cart & reset checkout
    clearCart();

    return order;
  } finally {
    setIsSubmitting(false);
  }
};
