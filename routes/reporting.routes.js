const express = require('express');
const { verifyAccessTokenMw, requireRole } = require('../middleware/auth');
const rep = require('../controllers/reportingController');

const router = express.Router();
router.use(verifyAccessTokenMw, requireRole('admin', 'vendor'));

router.get('/summary', rep.summary);
router.get('/export', rep.exportReport);

module.exports = router;
