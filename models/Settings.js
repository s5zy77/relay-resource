const mongoose = require('mongoose');

// One document per vendor (vendor: null => global/admin default)
const SettingsSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, unique: true, sparse: true },
    lateFee: {
      enabled: { type: Boolean, default: true },
      ratePerHour: { type: Number, default: 50 },
    },
    productDefaults: {
      variantsEnabled: { type: Boolean, default: true },
      priceListEnabled: { type: Boolean, default: true },
    },
    taxPercent: { type: Number, default: 18 },
  },
  { timestamps: true }
);

SettingsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Settings', SettingsSchema);
