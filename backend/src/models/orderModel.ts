import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rentals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rental',
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED'],
      default: 'PENDING',
    },
    totalPrice: { type: Number, required: true },
    totalDeposit: { type: Number, required: true },
    paymentMethod: { type: String, default: 'MOCK_PAYMENT' },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
