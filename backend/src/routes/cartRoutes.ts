import express from 'express';
import { checkoutCart } from '../controllers/cartController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/checkout').post(requireAuth, checkoutCart);

export default router;
