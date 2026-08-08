import express from 'express';
import { schedulePickup, recordInspection } from '../controllers/logisticsController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/pickup').post(requireAuth, requireRole('ADMIN', 'OPERATIONS_MANAGER', 'STAFF'), schedulePickup);
router.route('/inspection').post(requireAuth, requireRole('ADMIN', 'OPERATIONS_MANAGER', 'STAFF'), recordInspection);

export default router;
