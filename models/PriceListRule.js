const mongoose = require('mongoose');

// Embedded schema, exported so it can be reused/validated independently.
const PriceListRuleSchema = new mongoose.Schema(
  {
    appliesTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // empty = all products
    priceType: { type: String, enum: ['fixed', 'discount'], required: true },
    fixedPrice: { type: Number, default: null },
    discountPercent: { type: Number, default: null },
    minQty: { type: Number, default: 1 },
    validFrom: Date,
    validTo: Date,
    unitPrice: Number, // reference/display unit price for the rule
  },
  { timestamps: true }
);

module.exports = PriceListRuleSchema;
