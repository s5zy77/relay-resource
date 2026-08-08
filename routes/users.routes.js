const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { verifyAccessTokenMw, requireRole } = require('../middleware/auth');
const users = require('../controllers/userController');

const router = express.Router();
router.use(verifyAccessTokenMw);

router.get('/', requireRole('admin'), users.listUsers);
router.get('/:id', users.getUser);
router.patch('/:id', users.updateProfile);
router.patch('/me/profile', users.updateProfile);
router.post(
  '/me/change-password',
  validate(z.object({ currentPassword: z.string(), newPassword: z.string().min(6) })),
  users.changePassword
);
router.delete('/:id', requireRole('admin'), users.deleteUser);

module.exports = router;
