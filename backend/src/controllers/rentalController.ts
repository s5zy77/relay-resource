import { Request, Response, NextFunction } from 'express';
import Rental from '../models/rentalModel';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['QUOTATION', 'CONFIRMED', 'CANCELLED'],
  QUOTATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PICKUP_PENDING', 'CANCELLED'],
  PICKUP_PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['RETURN_PENDING', 'OVERDUE', 'MAINTENANCE_HOLD'],
  OVERDUE: ['RETURN_PENDING', 'MAINTENANCE_HOLD'],
  RETURN_PENDING: ['RETURNED', 'DISPUTED'],
  RETURNED: ['COMPLETED', 'DISPUTED'],
  DISPUTED: ['COMPLETED', 'RETURNED'],
  COMPLETED: [],
  CANCELLED: [],
  MAINTENANCE_HOLD: ['ACTIVE', 'RETURN_PENDING'],
};

// @desc    Update Rental Status (State Machine)
// @route   PATCH /api/rentals/:id/status
// @access  Private/Operations
export const updateRentalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status: newStatus } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      res.status(404);
      throw new Error('Rental not found');
    }

    const currentStatus = rental.status;

    // Validate Transition
    if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
      res.status(400);
      throw new Error(`Invalid state transition from ${currentStatus} to ${newStatus}`);
    }

    rental.status = newStatus;
    const updatedRental = await rental.save();

    res.json(updatedRental);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rentals
// @route   GET /api/rentals
// @access  Private
export const getRentals = async (req: any, res: Response, next: NextFunction) => {
  try {
    const query = req.user.role === 'CUSTOMER' ? { customer: req.user._id } : {};
    const rentals = await Rental.find(query).populate('product');
    res.json(rentals);
  } catch (error) {
    next(error);
  }
};
