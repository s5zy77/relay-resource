import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'QUOTATION',
        'CONFIRMED',
        'PICKUP_PENDING',
        'ACTIVE',
        'RETURN_PENDING',
        'RETURNED',
        'COMPLETED',
        'CANCELLED',
        'OVERDUE',
        'MAINTENANCE_HOLD',
        'DISPUTED',
      ],
      default: 'DRAFT',
    },
    basePrice: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    lateFee: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
