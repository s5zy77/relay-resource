const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

const InvoiceLineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    description: String,
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 18 },
    amount: { type: Number, default: 0 },
    rentalStart: Date,
    rentalEnd: Date,
    isNote: { type: Boolean, default: false },
  },
  { _id: true }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    rentalOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalOrder', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceAddress: AddressSchema,
    deliveryAddress: AddressSchema,
    lines: [InvoiceLineSchema],
    status: { type: String, enum: ['draft', 'posted', 'paid'], default: 'draft' },
    untaxed: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paidAt: Date,
  },
  { timestamps: true }
);

InvoiceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
