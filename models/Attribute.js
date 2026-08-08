const mongoose = require('mongoose');

const AttributeValueSchema = new mongoose.Schema(
  {
    value: { type: String, required: true },
    extraPrice: { type: Number, default: 0 },
  },
  { _id: true }
);

const AttributeSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    displayType: { type: String, enum: ['radio', 'pills', 'checkbox', 'image'], default: 'radio' },
    values: [AttributeValueSchema],
  },
  { timestamps: true }
);

AttributeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Attribute', AttributeSchema);
