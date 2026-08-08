const mongoose = require('mongoose');

// Embedded schema used inside RentalOrder.lines
const OrderLineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, default: 1 },
    unit: String,
    unitPrice: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 18 },
    amount: { type: Number, default: 0 },
    rentalStart: Date,
    rentalEnd: Date,
    appliedRule: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { _id: true }
);

module.exports = OrderLineSchema;
