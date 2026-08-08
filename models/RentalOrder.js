const mongoose = require('mongoose');
const OrderLineSchema = require('./OrderLine');

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

const STATUSES = [
  'draft',
  'quotation',
  'quotation_sent',
  'sale_order',
  'pickup',
  'active',
  'return_pending',
  'returned',
  'completed',
  'cancelled',
];

const RentalOrderSchema = new mongoose.Schema(
  {
    orderRef: { type: String, required: true, unique: true }, // e.g. RL-1029
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceAddress: AddressSchema,
    deliveryAddress: AddressSchema,
    rentalPeriod: {
      start: Date,
      end: Date,
    },
    priceList: { type: mongoose.Schema.Types.ObjectId, ref: 'PriceList', default: null },
    lines: [OrderLineSchema],
    status: { type: String, enum: STATUSES, default: 'draft' },
    totals: {
      untaxed: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    depositAmount: { type: Number, default: 0 },
    returnInfo: {
      condition: String,
      notes: String,
      lateFee: { type: Number, default: 0 },
      damageDeduction: { type: Number, default: 0 },
      refundAmount: { type: Number, default: 0 },
      returnedAt: Date,
    },
    invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
  },
  { timestamps: true }
);

RentalOrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

RentalOrderSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('RentalOrder', RentalOrderSchema);
