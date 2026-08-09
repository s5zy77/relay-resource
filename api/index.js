const app = require('../app');
const connectDB = require('../config/db');

// Connect to DB once when the lambda initializes
connectDB().catch(err => {
  console.error('[vercel-api] Failed to connect to DB', err);
});

// Export the Express app for Vercel's serverless environment
module.exports = app;
