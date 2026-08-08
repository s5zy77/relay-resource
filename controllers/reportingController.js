const RentalOrder = require('../models/RentalOrder');
const { ok, ApiError } = require('../utils/apiResponse');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

function rangeToDates(range) {
  const end = new Date();
  const start = new Date();
  if (range === '30d') start.setDate(start.getDate() - 30);
  else start.setDate(start.getDate() - 7); // default 7d
  return { start, end };
}

function scopeFilter(req) {
  const filter = {};
  if (req.user.role === 'vendor') {
    filter.vendor = req.user.id;
  } else if (req.user.role === 'admin' && req.query.vendor) {
    filter.vendor = req.query.vendor;
  }
  return filter;
}

async function summary(req, res) {
  const { range = '7d' } = req.query;
  const { start, end } = rangeToDates(range);
  const filter = { ...scopeFilter(req), createdAt: { $gte: start, $lte: end } };

  const orders = await RentalOrder.find(filter).populate('lines.product', 'name category');

  // Revenue trend by day
  const trendMap = {};
  let totalSales = 0;
  let totalLateFees = 0;
  let totalDeposits = 0;
  const categoryUtilization = {};
  const productCounts = {};

  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    trendMap[day] = (trendMap[day] || 0) + (order.totals?.total || 0);
    totalSales += order.totals?.total || 0;
    totalLateFees += order.returnInfo?.lateFee || 0;
    totalDeposits += order.depositAmount || 0;

    for (const line of order.lines) {
      const catKey = line.product?.category || 'Uncategorized';
      categoryUtilization[catKey] = (categoryUtilization[catKey] || 0) + line.qty;

      const prodKey = line.product?.name || 'Unknown';
      productCounts[prodKey] = (productCounts[prodKey] || 0) + line.qty;
    }
  }

  const revenueTrend = Object.entries(trendMap)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }));

  const utilizationByCategory = Object.entries(categoryUtilization).map(([category, qty]) => ({
    category,
    qty,
  }));

  const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
  const mostRentedTop5 = sortedProducts.slice(0, 5).map(([name, qty]) => ({ name, qty }));
  const underutilized = sortedProducts.slice(-5).reverse().map(([name, qty]) => ({ name, qty }));

  // Simple rule-of-thumb forecast: avg daily bookings per category * 7
  const days = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
  const demandForecast = Object.entries(categoryUtilization).map(([category, qty]) => ({
    category,
    forecastNext7Days: Math.round((qty / days) * 7),
  }));

  return ok(res, {
    range,
    lastNDays: {
      sales: Math.round(totalSales * 100) / 100,
      lateFees: Math.round(totalLateFees * 100) / 100,
      deposits: Math.round(totalDeposits * 100) / 100,
    },
    revenueTrend,
    utilizationByCategory,
    mostRentedTop5,
    underutilized,
    demandForecast,
  });
}

async function exportReport(req, res) {
  const { format = 'csv' } = req.query;
  const filter = scopeFilter(req);
  const orders = await RentalOrder.find(filter).populate('customer', 'name');

  if (format === 'csv') {
    const rows = orders.map((o) => ({
      orderRef: o.orderRef,
      customer: o.customer?.name,
      status: o.status,
      pickupDate: o.rentalPeriod?.start,
      returnDate: o.rentalPeriod?.end,
      total: o.totals?.total,
    }));
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="relay-report.csv"');
    return res.send(csv);
  }

  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relay-report.pdf"');
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    doc.fontSize(18).text('RELAY — Orders Report');
    doc.moveDown();
    orders.forEach((o) => {
      doc
        .fontSize(10)
        .text(`${o.orderRef} | ${o.customer?.name || ''} | ${o.status} | Total: ${o.totals?.total ?? 0}`);
    });
    doc.end();
    return;
  }

  throw new ApiError(400, 'format must be csv or pdf', 'VALIDATION_ERROR');
}

module.exports = { summary, exportReport };
