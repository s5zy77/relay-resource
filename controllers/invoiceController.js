const Invoice = require('../models/Invoice');
const { ok, paginated, ApiError } = require('../utils/apiResponse');
const PDFDocument = require('pdfkit');

function scopeToVendor(req, filter) {
  if (req.user.role === 'vendor') filter.vendor = req.user.id;
  if (req.user.role === 'customer') filter.customer = req.user.id;
  return filter;
}

async function listInvoices(req, res) {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.invoiceNo = new RegExp(search, 'i');
  scopeToVendor(req, filter);

  const total = await Invoice.countDocuments(filter);
  const items = await Invoice.find(filter)
    .populate('customer', 'name email')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return paginated(res, items, total, page, limit);
}

async function getInvoice(req, res) {
  const inv = await Invoice.findById(req.params.id).populate('customer').populate('lines.product');
  if (!inv) throw new ApiError(404, 'Invoice not found', 'NOT_FOUND');
  return ok(res, inv);
}

async function updateInvoice(req, res) {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found', 'NOT_FOUND');
  if (inv.status !== 'draft') throw new ApiError(409, 'Only draft invoices can be edited', 'INVALID_STATE');

  const editable = ['lines', 'invoiceAddress', 'deliveryAddress'];
  for (const key of editable) {
    if (req.body[key] !== undefined) inv[key] = req.body[key];
  }

  if (req.body.lines) {
    let untaxed = 0, tax = 0;
    inv.lines.forEach((l) => {
      if (l.isNote) return;
      untaxed += l.amount;
      tax += l.amount * ((l.taxPercent || 0) / 100);
    });
    inv.untaxed = untaxed;
    inv.tax = tax;
    inv.total = untaxed + tax;
  }

  await inv.save();
  return ok(res, inv);
}

async function addLine(req, res) {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found', 'NOT_FOUND');
  if (inv.status !== 'draft') throw new ApiError(409, 'Only draft invoices can be edited', 'INVALID_STATE');

  inv.lines.push(req.body);
  if (!req.body.isNote) {
    const amount = req.body.amount || (req.body.qty || 1) * (req.body.unitPrice || 0);
    inv.untaxed += amount;
    inv.tax += amount * ((req.body.taxPercent || 0) / 100);
    inv.total = inv.untaxed + inv.tax;
  }
  await inv.save();
  return ok(res, inv, 201);
}

async function sendInvoice(req, res) {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found', 'NOT_FOUND');
  console.log(`[mock email] Sending invoice ${inv.invoiceNo} to customer ${inv.customer}`);
  return ok(res, { sent: true });
}

async function postInvoice(req, res) {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found', 'NOT_FOUND');
  if (inv.status !== 'draft') throw new ApiError(409, 'Only draft invoices can be posted', 'INVALID_STATE');
  inv.status = 'posted';
  await inv.save();
  return ok(res, inv);
}

async function payInvoice(req, res) {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found', 'NOT_FOUND');
  if (inv.status !== 'posted') throw new ApiError(409, 'Only posted invoices can be paid', 'INVALID_STATE');
  inv.status = 'paid';
  inv.paidAt = new Date();
  await inv.save();
  return ok(res, inv);
}

async function invoicePdf(req, res) {
  const inv = await Invoice.findById(req.params.id).populate('customer');
  if (!inv) throw new ApiError(404, 'Invoice not found', 'NOT_FOUND');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${inv.invoiceNo}.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text('RELAY', { align: 'left' });
  doc.fontSize(10).text('Rental Invoice', { align: 'left' });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice: ${inv.invoiceNo}`);
  doc.fontSize(10).text(`Status: ${inv.status}`);
  doc.text(`Customer: ${inv.customer?.name || ''}`);
  doc.moveDown();

  doc.fontSize(11).text('Lines:', { underline: true });
  inv.lines.forEach((l) => {
    doc.text(
      `${l.description || 'Item'}  x${l.qty}  @ ${l.unitPrice}  = ${l.amount.toFixed(2)}`
    );
  });

  doc.moveDown();
  doc.text(`Untaxed Amount: ${inv.untaxed.toFixed(2)}`);
  doc.text(`Tax: ${inv.tax.toFixed(2)}`);
  doc.fontSize(13).text(`Total: ${inv.total.toFixed(2)}`, { underline: true });

  doc.end();
}

module.exports = {
  listInvoices,
  getInvoice,
  updateInvoice,
  addLine,
  sendInvoice,
  postInvoice,
  payInvoice,
  invoicePdf,
};
