const mongoose = require('mongoose');
const PriceListRuleSchema = require('./PriceListRule');

const PriceListSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    selectable: { type: Boolean, default: true },
    rules: [PriceListRuleSchema],
  },
  { timestamps: true }
);

PriceListSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('PriceList', PriceListSchema);
