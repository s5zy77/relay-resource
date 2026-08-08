require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Phases - Member 3 Work Allocation APIs
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Core API' });
});

// Rental endpoints stub
app.use('/api/rentals', (req, res) => {
  res.json({ message: "Rental endpoints placeholder. Implement Security Deposit / Late return fee logic here."});
});

// Admin endpoints stub
app.use('/api/admin', (req, res) => {
  res.json({ message: "Admin endpoints for rental tracking (due today, active)."});
});

app.listen(PORT, () => {
  console.log(`Core API Server running on http://localhost:${PORT}`);
});
