const RentalOrder = require('../models/RentalOrder');
const Product = require('../models/Product');
const PriceList = require('../models/PriceList');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const { ok, paginated, ApiError } = require('../utils/apiResponse');
const { calcTotals, calcLateFee, settleReturn } = require('../utils/calcTotals');

const TRANSITIONS = {
  draft: ['quotation', 'cancelled'],
  quotation: ['quotation_sent', 'sale_order', 'cancelled'],
  quotation_sent: ['sale_order', 'cancelled'],
  sale_order: ['pickup', 'cancelled'],
  pickup: ['active', 'cancelled'],
  active: ['return_pending', 'returned'],
  return_pending: ['returned'],
  returned: ['completed'],
  completed: [],
  cancelled: [],
};

function assertTransition(from, to) {
  const allowed = TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new ApiError(409, `Cannot move order from '${from}' to '${to}'`, 'INVALID_TRANSITION');
  }
}

async function nextOrderRef() {
  const last = await RentalOrder.findOne().sort({ createdAt: -1 });
  let n = 1029;
  if (last && /^RL-(\d+)$/.test(last.orderRef)) {
    n = parseInt(last.orderRef.split('-')[1], 10) + 1;
  }
  return `RL-${n}`;
}

function scopeToVendor(req, filter) {
  if (req.user.role === 'vendor') filter.vendor = req.user.id;
  if (req.user.role === 'customer') filter.customer = req.user.id;
  return filter;
}

function computeLateTag(order) {
  const now = new Date();
  const end = order.rentalPeriod?.end ? new Date(order.rentalPeriod.end) : null;
  if (!end) return order.status;
  if (['active', 'pickup'].includes(order.status) && now > end) return 'late';
  return order.status;
}

async function recalcAndSave(order) {
  const productIds = order.lines.map((l) => l.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productsById = {};
  products.forEach((p) => (productsById[p._id.toString()] = p));

  let priceListDoc = null;
  if (order.priceList) priceListDoc = await PriceList.findById(order.priceList);

  const { lines, totals } = calcTotals(order.toObject(), priceListDoc, productsById);
  order.lines = lines.map((l) => ({ ...l, _id: l._id }));
  order.totals = totals;
  await order.save();
  return order;
}

async function listOrders(req, res) {
  const { page = 1, limit = 20, status, search, filter } = req.query;
  const q = {};
  if (status) q.status = status;
  scopeToVendor(req, q);

  if (search) {
    q.orderRef = new RegExp(search, 'i');
  }

  const now = new Date();
  if (filter === 'today') {
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    q.$or = [
      { 'rentalPeriod.start': { $gte: start, $lte: end } },
      { 'rentalPeriod.end': { $gte: start, $lte: end } },
    ];
  } else if (filter === 'pickup') {
    q.status = 'sale_order';
  } else if (filter === 'return') {
    q.status = { $in: ['active', 'return_pending'] };
  } else if (filter === 'late') {
    q.status = { $in: ['active', 'pickup'] };
    q['rentalPeriod.end'] = { $lt: new Date() };
  }

  const total = await RentalOrder.countDocuments(q);
  const items = await RentalOrder.find(q)
    .populate('customer', 'name email phone')
    .populate('vendor', 'name companyName')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return paginated(res, items, total, page, limit);
}

async function getOrder(req, res) {
  const order = await RentalOrder.findById(req.params.id)
    .populate('customer')
    .populate('vendor', 'name companyName')
    .populate('lines.product');
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  return ok(res, order);
}

async function createOrder(req, res) {
  const vendor = req.user.role === 'vendor' ? req.user.id : req.body.vendor;
  if (!vendor) throw new ApiError(400, 'vendor is required', 'VALIDATION_ERROR');

  const orderRef = req.body.orderRef || (await nextOrderRef());
  const order = await RentalOrder.create({
    ...req.body,
    vendor,
    orderRef,
    status: 'quotation',
  });

  await recalcAndSave(order);
  return ok(res, order, 201);
}

async function updateOrder(req, res) {
  const order = await RentalOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  if (!['draft', 'quotation', 'quotation_sent'].includes(order.status)) {
    throw new ApiError(409, 'Order lines can only be edited before confirmation', 'INVALID_STATE');
  }

  const editable = ['customer', 'invoiceAddress', 'deliveryAddress', 'rentalPeriod', 'priceList', 'lines'];
  for (const key of editable) {
    if (req.body[key] !== undefined) order[key] = req.body[key];
  }

  await recalcAndSave(order);
  return ok(res, order);
}

async function sendOrder(req, res) {
  const order = await RentalOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  assertTransition(order.status, 'quotation_sent');
  order.status = 'quotation_sent';
  await order.save();
  return ok(res, order);
}

async function confirmOrder(req, res) {
  const order = await RentalOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  assertTransition(order.status, 'sale_order');
  order.status = 'sale_order';
  await order.save();
  return ok(res, order);
}

async function cancelOrder(req, res) {
  const order = await RentalOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  assertTransition(order.status, 'cancelled');
  order.status = 'cancelled';
  await order.save();
  return ok(res, order);
}

async function pickupOrder(req, res) {
  const order = await RentalOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  assertTransition(order.status, 'pickup');
  order.status = 'pickup';
  await order.save();

  for (const line of order.lines) {
    await Product.findByIdAndUpdate(line.product, { $inc: { qtyOnHand: -line.qty } });
  }

  order.status = 'active';
  await order.save();

  await Notification.create({
    user: order.customer,
    rentalOrder: order._id,
    type: 'pickup_reminder',
    message: `Order ${order.orderRef} has been picked up. Rental is now active.`,
  });

  return ok(res, order);
}

async function returnOrder(req, res) {
  const order = await RentalOrder.findById(req.params.id).populate('lines.product');
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  if (!['active', 'return_pending'].includes(order.status)) {
    throw new ApiError(409, `Cannot return an order in status '${order.status}'`, 'INVALID_STATE');
  }

  const { condition, notes, damageDeduction = 0 } = req.body;
  const returnedAt = new Date();

  const settings = (await Settings.findOne({ vendor: order.vendor })) || (await Settings.findOne({ vendor: null }));
  const globalRate = settings?.lateFee?.enabled ? settings.lateFee.ratePerHour : 0;

  let lateFee = 0;
  for (const line of order.lines) {
    const rate = line.product?.rental?.lateFeePerHour ?? globalRate;
    lateFee += calcLateFee(order.rentalPeriod.end, returnedAt, rate);
  }

  const refundAmount = settleReturn({
    depositAmount: order.depositAmount,
    lateFee,
    damageDeduction,
  });

  order.returnInfo = { condition, notes, lateFee, damageDeduction, refundAmount, returnedAt };
  order.status = 'returned';
  await order.save();

  for (const line of order.lines) {
    await Product.findByIdAndUpdate(line.product._id || line.product, { $inc: { qtyOnHand: line.qty } });
  }

  await Notification.create({
    user: order.customer,
    rentalOrder: order._id,
    type: 'deposit_refund',
    message: `Order ${order.orderRef} returned. Refund of ${refundAmount} processed (late fee: ${lateFee}, damage: ${damageDeduction}).`,
  });

  order.status = 'completed';
  await order.save();

  return ok(res, order);
}

async function createInvoiceFromOrder(req, res) {
  const order = await RentalOrder.findById(req.params.id).populate('lines.product');
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');

  const allowedStatuses = ['sale_order', 'pickup', 'active', 'return_pending', 'returned', 'completed'];
  if (!allowedStatuses.includes(order.status)) {
    throw new ApiError(409, 'Order must be confirmed as a Sale Order before invoicing', 'INVALID_STATE');
  }

  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  let n = 5001;
  if (lastInvoice && /^INV-(\d+)$/.test(lastInvoice.invoiceNo)) {
    n = parseInt(lastInvoice.invoiceNo.split('-')[1], 10) + 1;
  }

  const invoice = await Invoice.create({
    invoiceNo: `INV-${n}`,
    rentalOrder: order._id,
    vendor: order.vendor,
    customer: order.customer,
    invoiceAddress: order.invoiceAddress,
    deliveryAddress: order.deliveryAddress,
    lines: order.lines.map((l) => ({
      product: l.product._id || l.product,
      description: l.product?.name,
      qty: l.qty,
      unitPrice: l.unitPrice,
      taxPercent: l.taxPercent,
      amount: l.amount,
      rentalStart: l.rentalStart || order.rentalPeriod.start,
      rentalEnd: l.rentalEnd || order.rentalPeriod.end,
    })),
    status: 'draft',
    untaxed: order.totals.untaxed,
    tax: order.totals.tax,
    total: order.totals.total,
  });

  order.invoices.push(invoice._id);
  await order.save();

  return ok(res, invoice, 201);
}

async function deleteOrder(req, res) {
  const order = await RentalOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  if (!['draft', 'quotation'].includes(order.status)) {
    throw new ApiError(409, 'Only draft/quotation orders can be deleted', 'INVALID_STATE');
  }
  await order.deleteOne();
  return ok(res, { deleted: true });
}

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  sendOrder,
  confirmOrder,
  cancelOrder,
  pickupOrder,
  returnOrder,
  createInvoiceFromOrder,
  deleteOrder,
  computeLateTag,
};
