import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema(
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },
    location: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The staff handling the pickup
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'READY', 'CONFIRMED', 'COMPLETED', 'MISSED'],
      default: 'SCHEDULED',
    },
    qrReference: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
  }
);

const Pickup = mongoose.model('Pickup', pickupSchema);
export default Pickup;
