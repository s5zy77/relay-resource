const express = require('express');
const app = require('../app');
const connectDB = require('../config/db');

const vercelApp = express();
let dbConnected = false;

// Middleware to ensure DB is connected only for API routes
vercelApp.use('/api', async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error('[vercel-api] DB Connection Error:', err);
      return res.status(500).json({ success: false, error: 'Database connection failed' });
    }
  }
  next();
});

vercelApp.use(app);

module.exports = vercelApp;
