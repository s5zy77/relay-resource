require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const mongoose = require('mongoose');

const User = require('../models/User');
const Product = require('../models/Product');
const Attribute = require('../models/Attribute');
const PriceList = require('../models/PriceList');
const QuotationTemplate = require('../models/QuotationTemplate');
const RentalOrder = require('../models/RentalOrder');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');

async function clearAll() {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Attribute.deleteMany({}),
    PriceList.deleteMany({}),
    QuotationTemplate.deleteMany({}),
    RentalOrder.deleteMany({}),
    Invoice.deleteMany({}),
    Notification.deleteMany({}),
    Settings.deleteMany({}),
  ]);
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function run() {
  await connectDB();
  console.log('[seed] Clearing existing data...');
  await clearAll();

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('[seed] Creating users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@relay.app',
    passwordHash,
    role: 'admin',
    companyName: 'RELAY Platform',
  });

  const vendor = await User.create({
    name: 'Kabir Studio Rentals',
    email: 'vendor@relay.app',
    passwordHash,
    role: 'vendor',
    companyName: 'Kabir Studio Rentals',
    phone: '+91 98765 43210',
    gstIn: '27ABCDE1234F1Z5',
    address: { line1: '12 MG Road', city: 'Mumbai', state: 'MH', postalCode: '400001', country: 'India' },
  });

  const customerNames = [
    'Arjun Mehta', 'Rohan Kapoor', 'Priya Sen', 'Meera Thomas',
    'Neha Verma', 'Sameer Rao', 'Isha Desai',
  ];
  const customers = [];
  for (const name of customerNames) {
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const c = await User.create({ name, email, passwordHash, role: 'customer', phone: '+91 90000 00000' });
    customers.push(c);
  }

  console.log('[seed] Creating settings...');
  await Settings.create({ vendor: null, lateFee: { enabled: true, ratePerHour: 50 }, taxPercent: 18 });
  await Settings.create({ vendor: vendor._id, lateFee: { enabled: true, ratePerHour: 75 }, taxPercent: 18 });

  console.log('[seed] Creating attributes...');
  const colorAttr = await Attribute.create({
    vendor: vendor._id,
    name: 'Color',
    displayType: 'pills',
    values: [
      { value: 'Black', extraPrice: 0 },
      { value: 'Silver', extraPrice: 500 },
    ],
  });

  console.log('[seed] Creating products...');
  const productDefs = [
    { name: 'Sony A7 IV', salesPrice: 3500, costPrice: 2200, category: 'Cameras' },
    { name: 'Canon R6', salesPrice: 3200, costPrice: 2100, category: 'Cameras' },
    { name: 'DJI RS3 Gimbal', salesPrice: 1500, costPrice: 900, category: 'Accessories' },
    { name: 'Godox SL200 III', salesPrice: 900, costPrice: 500, category: 'Lighting' },
    { name: 'GoPro Hero 12', salesPrice: 800, costPrice: 450, category: 'Cameras' },
    { name: '24-70mm Lens', salesPrice: 1200, costPrice: 700, category: 'Lenses' },
    { name: 'Event PA System', salesPrice: 4500, costPrice: 3000, category: 'Audio' },
    { name: 'Speaker Set', salesPrice: 2200, costPrice: 1400, category: 'Audio' },
  ];

  const products = [];
  for (const def of productDefs) {
    const p = await Product.create({
      vendor: vendor._id,
      name: def.name,
      type: 'goods',
      publish: true,
      qtyOnHand: 10,
      salesPrice: def.salesPrice,
      costPrice: def.costPrice,
      category: def.category,
      attributes: [{ attribute: colorAttr._id, value: 'Black' }],
      rental: {
        periodicityUnit: 'day',
        padding: 30,
        pickupTime: '10:00',
        returnTime: '18:00',
        price: def.salesPrice,
        depositAmount: Math.round(def.salesPrice * 0.5),
        lateFeePerHour: null,
      },
    });
    products.push(p);
  }

  // A deposit/security-deposit product modeled as a Service-type product
  await Product.create({
    vendor: vendor._id,
    name: 'Security Deposit',
    type: 'service',
    publish: false,
    salesPrice: 0,
    costPrice: 0,
    category: 'Fees',
  });

  console.log('[seed] Creating price list...');
  const priceList = await PriceList.create({
    vendor: vendor._id,
    name: 'Standard Rental Pricing',
    selectable: true,
    rules: [
      {
        appliesTo: [],
        priceType: 'discount',
        discountPercent: 10,
        minQty: 3,
        validFrom: daysFromNow(-30),
        validTo: daysFromNow(60),
      },
      {
        appliesTo: [products[0]._id],
        priceType: 'fixed',
        fixedPrice: 3000,
        minQty: 1,
        validFrom: daysFromNow(-30),
        validTo: daysFromNow(60),
      },
    ],
  });

  console.log('[seed] Creating quotation templates...');
  await QuotationTemplate.create({
    vendor: vendor._id,
    name: 'Home Rental Furniture',
    validityDays: 7,
    paymentTermsPercent: 50,
    lines: [
      { product: products[3]._id, qty: 2, unit: 'day' },
      { product: products[7]._id, qty: 1, unit: 'day' },
    ],
  });
  await QuotationTemplate.create({
    vendor: vendor._id,
    name: 'Office Rental Furniture',
    validityDays: 14,
    paymentTermsPercent: 100,
    lines: [
      { product: products[6]._id, qty: 1, unit: 'week' },
    ],
  });

  console.log('[seed] Creating rental orders...');
  const orderDefs = [
    { ref: 'RL-1029', customer: customers[0], status: 'sale_order', startOffset: -2, endOffset: 3 },
    { ref: 'RL-1037', customer: customers[1], status: 'active', startOffset: -5, endOffset: -1 },
    { ref: 'RL-1040', customer: customers[2], status: 'quotation_sent', startOffset: 1, endOffset: 4 },
    { ref: 'RL-1041', customer: customers[3], status: 'completed', startOffset: -10, endOffset: -7 },
    { ref: 'RL-1042', customer: customers[4], status: 'quotation', startOffset: 5, endOffset: 8 },
    { ref: 'RL-1043', customer: customers[5], status: 'active', startOffset: -3, endOffset: -1 }, // late
    { ref: 'RL-1044', customer: customers[6], status: 'pickup', startOffset: 0, endOffset: 2 },
    { ref: 'RL-1045', customer: customers[0], status: 'cancelled', startOffset: 2, endOffset: 5 },
    { ref: 'RL-1046', customer: customers[1], status: 'sale_order', startOffset: 3, endOffset: 6 },
  ];

  for (const def of orderDefs) {
    const pickedProducts = [products[Math.floor(Math.random() * products.length)], products[(Math.floor(Math.random() * products.length) + 1) % products.length]];
    const start = daysFromNow(def.startOffset);
    const end = daysFromNow(def.endOffset);

    const lines = pickedProducts.map((p) => ({
      product: p._id,
      qty: 1,
      unit: 'day',
      unitPrice: p.salesPrice,
      taxPercent: 18,
      amount: p.salesPrice,
      rentalStart: start,
      rentalEnd: end,
    }));

    const untaxed = lines.reduce((s, l) => s + l.amount, 0);
    const tax = untaxed * 0.18;

    await RentalOrder.create({
      orderRef: def.ref,
      vendor: vendor._id,
      customer: def.customer._id,
      invoiceAddress: def.customer.address || { line1: 'N/A', city: 'Mumbai', country: 'India' },
      deliveryAddress: def.customer.address || { line1: 'N/A', city: 'Mumbai', country: 'India' },
      rentalPeriod: { start, end },
      priceList: priceList._id,
      lines,
      status: def.status,
      totals: { untaxed, tax, total: untaxed + tax },
      depositAmount: Math.round(untaxed * 0.5),
    });
  }

  console.log('[seed] Creating a demo notification...');
  await Notification.create({
    user: customers[0]._id,
    type: 'pickup_reminder',
    message: 'Reminder: your rental RL-1029 is scheduled for pickup soon.',
  });

  console.log('[seed] Done!');
  console.log('');
  console.log('Demo logins (password: password123):');
  console.log(`  Admin:    ${admin.email}`);
  console.log(`  Vendor:   ${vendor.email}`);
  console.log(`  Customer: ${customers[0].email}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
