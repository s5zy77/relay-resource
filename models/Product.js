const mongoose = require('mongoose');

const VariantAttributeSchema = new mongoose.Schema(
  {
    attribute: { type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' },
    value: String,
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    images: [String],
    sku: String,
    type: { type: String, enum: ['goods', 'service'], default: 'goods' },
    publish: { type: Boolean, default: false }, // admin-only toggle
    qtyOnHand: { type: Number, default: 0 },
    salesPrice: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    attributes: [VariantAttributeSchema],
    variants: [
      {
        sku: String,
        attributeValues: [VariantAttributeSchema],
        qtyOnHand: Number,
        priceDelta: Number,
      },
    ],
    rental: {
      periodicityUnit: { type: String, enum: ['hours', 'day', 'night', 'weekly'], default: 'day' },
      padding: { type: Number, default: 0 }, // minutes/hours buffer between bookings
      pickupTime: String,
      returnTime: String,
      price: { type: Number, default: 0 },
      depositAmount: { type: Number, default: 0 },
      lateFeePerHour: { type: Number, default: null }, // override; null = use global settings
    },
    category: String,
  },
  { timestamps: true }
);

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Product', ProductSchema);
