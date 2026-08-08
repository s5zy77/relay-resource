import express from 'express';
import { updateRentalStatus, getRentals } from '../controllers/rentalController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(requireAuth, getRentals);
router.route('/:id/status').patch(requireAuth, requireRole('ADMIN', 'OPERATIONS_MANAGER', 'STAFF'), updateRentalStatus);

export default router;
