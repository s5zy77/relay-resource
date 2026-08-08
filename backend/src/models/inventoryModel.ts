import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
    },
    serialNumber: { type: String, unique: true, sparse: true },
    barcode: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'RESERVED',
        'ON_RENTAL',
        'PICKUP_PENDING',
        'RETURN_PENDING',
        'MAINTENANCE',
        'UNAVAILABLE',
      ],
      default: 'AVAILABLE',
    },
    condition: {
      type: String,
      enum: ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'],
      default: 'GOOD',
    },
    location: { type: String }, // Physical location like "Warehouse A"
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
