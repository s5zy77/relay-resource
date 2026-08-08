const express = require('express');
const { verifyAccessTokenMw, requireRole } = require('../middleware/auth');
const settings = require('../controllers/settingsController');

const router = express.Router();
router.use(verifyAccessTokenMw, requireRole('admin'));

router.get('/', settings.getSettings);
router.patch('/', settings.updateSettings);

module.exports = router;
