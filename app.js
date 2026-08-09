require('express-async-errors');
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const productsRoutes = require('./routes/products.routes');
const attributesRoutes = require('./routes/attributes.routes');
const pricelistsRoutes = require('./routes/pricelists.routes');
const quotationTemplatesRoutes = require('./routes/quotationTemplates.routes');
const rentalOrdersRoutes = require('./routes/rentalOrders.routes');
const invoicesRoutes = require('./routes/invoices.routes');
const schedulerRoutes = require('./routes/scheduler.routes');
const reportingRoutes = require('./routes/reporting.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const settingsRoutes = require('./routes/settings.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false, // frontend is a single inline-styled HTML file
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static frontend + uploaded files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/attributes', attributesRoutes);
app.use('/api/pricelists', pricelistsRoutes);
app.use('/api/quotation-templates', quotationTemplatesRoutes);
app.use('/api/rental-orders', rentalOrdersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/reports', reportingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

// Anything not matched under /api/* falls through to the SPA index
app.use(notFoundHandler);

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

module.exports = app;
