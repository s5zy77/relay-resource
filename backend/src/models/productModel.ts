import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Color", "Size", "Brand"
  value: { type: String, required: true }, // e.g., "Red", "Large", "Sony"
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    basePrice: { type: Number, required: true },
    baseDeposit: { type: Number, required: true },
    attributes: [attributeSchema],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
      default: 'DRAFT',
    },
    productType: {
      type: String,
      enum: ['GOODS', 'SERVICES', 'RENTAL_ASSET', 'FEE'],
      default: 'RENTAL_ASSET',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
