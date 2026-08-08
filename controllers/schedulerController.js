const RentalOrder = require('../models/RentalOrder');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const { ok, ApiError } = require('../utils/apiResponse');
const { calcLateFee } = require('../utils/calcTotals');

function scopeToVendor(req, filter) {
  if (req.user.role === 'vendor') filter.vendor = req.user.id;
  if (req.user.role === 'customer') filter.customer = req.user.id;
  return filter;
}

function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function classifyType(order, day) {
  const now = new Date();
  const start = order.rentalPeriod?.start ? new Date(order.rentalPeriod.start) : null;
  const end = order.rentalPeriod?.end ? new Date(order.rentalPeriod.end) : null;

  if (start && dayKey(start) === day) {
    if (['sale_order'].includes(order.status) && now > start) return 'late_pickup';
    return 'pickup';
  }
  if (end && dayKey(end) === day) {
    if (['active', 'return_pending'].includes(order.status) && now > end) return 'late_return';
    return 'return';
  }
  return 'booked';
}

async function monthView(req, res) {
  const { month } = req.query; // YYYY-MM
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    throw new ApiError(400, 'month query param is required in YYYY-MM format', 'VALIDATION_ERROR');
  }

  const [y, m] = month.split('-').map(Number);
  const monthStart = new Date(Date.UTC(y, m - 1, 1));
  const monthEnd = new Date(Date.UTC(y, m, 0, 23, 59, 59));

  const filter = scopeToVendor(req, {
    $or: [
      { 'rentalPeriod.start': { $lte: monthEnd }, 'rentalPeriod.end': { $gte: monthStart } },
    ],
    status: { $nin: ['draft', 'cancelled'] },
  });

  const orders = await RentalOrder.find(filter).populate('customer', 'name').populate('lines.product', 'name');

  const byDay = {};
  for (const order of orders) {
    const start = new Date(Math.max(new Date(order.rentalPeriod.start), monthStart));
    const end = new Date(Math.min(new Date(order.rentalPeriod.end), monthEnd));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = dayKey(d);
      if (!byDay[key]) byDay[key] = [];
      for (const line of order.lines) {
        byDay[key].push({
          orderRef: order.orderRef,
          product: line.product?.name,
          customer: order.customer?.name,
          qty: line.qty,
          status: order.status === 'active' || order.status === 'pickup' ? 'Booked' : 'Available',
          type: classifyType(order, key),
        });
      }
    }
  }

  return ok(res, byDay);
}

async function dayView(req, res) {
  const { date } = req.params; // YYYY-MM-DD
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const filter = scopeToVendor(req, {
    'rentalPeriod.start': { $lte: dayEnd },
    'rentalPeriod.end': { $gte: dayStart },
    status: { $nin: ['draft', 'cancelled'] },
  });

  const orders = await RentalOrder.find(filter)
    .populate('customer', 'name email phone')
    .populate('lines.product', 'name');

  const rows = [];
  for (const order of orders) {
    for (const line of order.lines) {
      rows.push({
        orderRef: order.orderRef,
        product: line.product?.name,
        customer: order.customer?.name,
        qty: line.qty,
        status: order.status === 'active' || order.status === 'pickup' ? 'Booked' : 'Available',
        type: classifyType(order, date),
      });
    }
  }

  return ok(res, rows);
}

async function runOverdueCheck(req, res) {
  const now = new Date();
  const overdue = await RentalOrder.find({
    status: { $in: ['pickup', 'active'] },
    'rentalPeriod.end': { $lt: now },
  });

  let flagged = 0;
  for (const order of overdue) {
    const already = await Notification.findOne({ rentalOrder: order._id, type: 'overdue' });
    if (!already) {
      await Notification.create({
        user: order.customer,
        rentalOrder: order._id,
        type: 'overdue',
        message: `Order ${order.orderRef} is overdue for return.`,
      });
      flagged += 1;
    }
  }

  return ok(res, { checked: overdue.length, flagged });
}

module.exports = { monthView, dayView, runOverdueCheck };
