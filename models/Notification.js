const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rentalOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalOrder', default: null },
    type: {
      type: String,
      enum: [
        'pickup_reminder',
        'return_reminder',
        'overdue',
        'payment',
        'deposit_refund',
        'ai_call_outcome',
      ],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);
