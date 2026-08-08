const express = require('express');
const { verifyAccessTokenMw } = require('../middleware/auth');
const sched = require('../controllers/schedulerController');

const router = express.Router();
router.use(verifyAccessTokenMw);

router.get('/', sched.monthView);
router.get('/day/:date', sched.dayView);
router.post('/run-overdue-check', sched.runOverdueCheck);

module.exports = router;
