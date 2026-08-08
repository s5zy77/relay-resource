import express from 'express';
import { authUser, registerUser, getUserProfile } from '../controllers/userController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(registerUser);
router.post('/login', authUser);
router.route('/profile').get(requireAuth, getUserProfile);

export default router;
