const express = require('express');
const { verifyAccessTokenMw, requireRole } = require('../middleware/auth');
const ro = require('../controllers/rentalOrderController');

const router = express.Router();
router.use(verifyAccessTokenMw);

router.get('/', ro.listOrders);
router.get('/:id', ro.getOrder);
router.post('/', requireRole('admin', 'vendor'), ro.createOrder);
router.patch('/:id', requireRole('admin', 'vendor'), ro.updateOrder);
router.post('/:id/send', requireRole('admin', 'vendor'), ro.sendOrder);
router.post('/:id/confirm', requireRole('admin', 'vendor'), ro.confirmOrder);
router.post('/:id/cancel', requireRole('admin', 'vendor'), ro.cancelOrder);
router.post('/:id/pickup', requireRole('admin', 'vendor'), ro.pickupOrder);
router.post('/:id/return', requireRole('admin', 'vendor'), ro.returnOrder);
router.post('/:id/create-invoice', requireRole('admin', 'vendor'), ro.createInvoiceFromOrder);
router.delete('/:id', requireRole('admin', 'vendor'), ro.deleteOrder);

module.exports = router;
