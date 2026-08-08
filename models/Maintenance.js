const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    condition: { type: String, enum: ['good', 'fair', 'damaged', 'needs_repair'], default: 'good' },
    notes: String,
    scheduledDate: Date,
    status: { type: String, enum: ['scheduled', 'in_progress', 'done', 'cancelled'], default: 'scheduled' },
  },
  { timestamps: true }
);

MaintenanceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
