const express = require('express');
const { verifyAccessTokenMw, requireRole } = require('../middleware/auth');
const inv = require('../controllers/invoiceController');

const router = express.Router();
router.use(verifyAccessTokenMw);

router.get('/', inv.listInvoices);
router.get('/:id', inv.getInvoice);
router.get('/:id/pdf', inv.invoicePdf);
router.patch('/:id', requireRole('admin', 'vendor'), inv.updateInvoice);
router.post('/:id/lines', requireRole('admin', 'vendor'), inv.addLine);
router.post('/:id/send', requireRole('admin', 'vendor'), inv.sendInvoice);
router.post('/:id/post', requireRole('admin', 'vendor'), inv.postInvoice);
router.post('/:id/pay', requireRole('admin', 'vendor'), inv.payInvoice);

module.exports = router;
