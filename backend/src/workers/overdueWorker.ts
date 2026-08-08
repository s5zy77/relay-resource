import Rental from '../models/rentalModel';
import { emitOverdueDetected } from '../services/realtimeService';
import AuditLog from '../models/auditLogModel';

/**
 * Overdue Detection Cron Worker
 * 
 * Runs periodically to scan for rentals that have passed
 * their end date but are still marked ACTIVE. Transitions
 * them to OVERDUE and emits real-time events.
 */

export const detectOverdueRentals = async () => {
  const now = new Date();

  try {
    const newlyOverdue = await Rental.find({
      status: 'ACTIVE',
      endDate: { $lt: now },
    }).populate('customer', 'name email').populate('product', 'name');

    for (const rental of newlyOverdue) {
      rental.status = 'OVERDUE';
      await rental.save();

      // Emit real-time event
      emitOverdueDetected(rental);

      // Audit log
      await AuditLog.create({
        actor: rental.customer._id || rental.customer,
        actorType: 'SYSTEM',
        action: 'AUTO_OVERDUE_DETECTION',
        entity: 'Rental',
        entityId: rental._id,
        metadata: {
          endDate: rental.endDate,
          detectedAt: now,
        },
      });
    }

    if (newlyOverdue.length > 0) {
      console.log(`[CRON] Detected ${newlyOverdue.length} newly overdue rentals`);
    }
  } catch (error) {
    console.error('[CRON] Overdue detection error:', error);
  }
};
