import { Request, Response, NextFunction } from 'express';
import Pickup from '../models/pickupModel';
import Inspection from '../models/inspectionModel';
import AuditLog from '../models/auditLogModel';
import Rental from '../models/rentalModel';

// @desc    Schedule a pickup
// @route   POST /api/logistics/pickup
// @access  Private/Operations
export const schedulePickup = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { rentalId, location, scheduledTime } = req.body;
    
    const pickup = new Pickup({
      rental: rentalId,
      location,
      scheduledTime,
      staff: req.user._id,
      status: 'SCHEDULED'
    });

    const createdPickup = await pickup.save();

    await AuditLog.create({
      actor: req.user._id,
      actorType: 'USER',
      action: 'SCHEDULED_PICKUP',
      entity: 'Rental',
      entityId: rentalId,
      metadata: { pickupId: createdPickup._id }
    });

    res.status(201).json(createdPickup);
  } catch (error) {
    next(error);
  }
};

// @desc    Record an inspection (Return)
// @route   POST /api/logistics/inspection
// @access  Private/Operations
export const recordInspection = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { rentalId, condition, damageDetected, damageDescription, missingItems, severity } = req.body;
    
    const inspection = new Inspection({
      rental: rentalId,
      inspector: req.user._id,
      condition,
      damageDetected,
      damageDescription,
      missingItems,
      severity
    });

    const createdInspection = await inspection.save();

    await AuditLog.create({
      actor: req.user._id,
      actorType: 'USER',
      action: 'RECORDED_INSPECTION',
      entity: 'Rental',
      entityId: rentalId,
      metadata: { inspectionId: createdInspection._id, damageDetected }
    });
    
    // Also update rental status to RETURNED if it was RETURN_PENDING
    await Rental.findByIdAndUpdate(rentalId, { status: 'RETURNED' });

    res.status(201).json(createdInspection);
  } catch (error) {
    next(error);
  }
};
