import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  getProductAvailability,
} from '../controllers/productController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(requireAuth, requireRole('ADMIN', 'OPERATIONS_MANAGER'), createProduct);

router.route('/:id').get(getProductById);
router.route('/:id/availability').get(getProductAvailability);

export default router;
