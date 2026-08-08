const express = require('express');
const { verifyAccessTokenMw } = require('../middleware/auth');
const notif = require('../controllers/notificationController');

const router = express.Router();
router.use(verifyAccessTokenMw);

router.get('/', notif.listNotifications);
router.patch('/:id/read', notif.markRead);
router.post('/ai-call', notif.triggerAiCall);

module.exports = router;
