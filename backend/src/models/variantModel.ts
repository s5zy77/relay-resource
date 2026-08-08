import mongoose from 'mongoose';

const variantAttributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // e.g. "Body Only", "24-70mm Kit"
    priceAdjustment: { type: Number, default: 0 },
    depositAdjustment: { type: Number, default: 0 },
    attributes: [variantAttributeSchema],
  },
  {
    timestamps: true,
  }
);

const Variant = mongoose.model('Variant', variantSchema);
export default Variant;
