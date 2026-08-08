const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { verifyAccessTokenMw } = require('../middleware/auth');
const auth = require('../controllers/authController');

const router = express.Router();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'vendor', 'customer']).optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  gstIn: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/signup', validate(signupSchema), auth.signup);
router.post('/login', validate(loginSchema), auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', verifyAccessTokenMw, auth.me);

module.exports = router;
