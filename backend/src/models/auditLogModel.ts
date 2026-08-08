import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId, // Could be User or AI ID
      ref: 'User',
      required: true,
    },
    actorType: {
      type: String,
      enum: ['USER', 'ADMIN', 'SYSTEM', 'AI'],
      required: true,
    },
    action: { type: String, required: true },
    entity: { type: String, required: true }, // e.g. "Rental", "Order"
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Detailed diffs or AI reasoning
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
