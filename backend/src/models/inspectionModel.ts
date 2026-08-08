import mongoose from 'mongoose';

const inspectionSchema = new mongoose.Schema(
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The staff handling the inspection
      required: true,
    },
    condition: {
      type: String,
      enum: ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'],
      required: true,
    },
    damageDetected: { type: Boolean, default: false },
    damageDescription: { type: String },
    missingItems: [{ type: String }],
    photos: [{ type: String }], // URLs to photos
    severity: {
      type: String,
      enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'NONE',
    },
  },
  {
    timestamps: true,
  }
);

const Inspection = mongoose.model('Inspection', inspectionSchema);
export default Inspection;
