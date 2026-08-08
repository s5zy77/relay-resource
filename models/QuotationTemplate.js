const mongoose = require('mongoose');

const TemplateLineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, default: 1 },
    unit: String,
  },
  { _id: false }
);

const QuotationTemplateSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // e.g. "Home Rental Furniture"
    validityDays: { type: Number, default: 7 },
    paymentTermsPercent: { type: Number, default: 100 },
    lines: [TemplateLineSchema],
  },
  { timestamps: true }
);

QuotationTemplateSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('QuotationTemplate', QuotationTemplateSchema);
