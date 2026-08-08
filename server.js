const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const RentalOrder = require('./models/RentalOrder');
const Notification = require('./models/Notification');

const OVERDUE_CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

async function runOverdueCheck() {
  try {
    const overdue = await RentalOrder.find({
      status: { $in: ['pickup', 'active'] },
      'rentalPeriod.end': { $lt: new Date() },
    });
    for (const order of overdue) {
      const already = await Notification.findOne({ rentalOrder: order._id, type: 'overdue' });
      if (!already) {
        await Notification.create({
          user: order.customer,
          rentalOrder: order._id,
          type: 'overdue',
          message: `Order ${order.orderRef} is overdue for return.`,
        });
      }
    }
  } catch (err) {
    console.error('[scheduler] Overdue check failed:', err.message);
  }
}

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[server] RELAY backend listening on http://localhost:${PORT}`);
    });
    setInterval(runOverdueCheck, OVERDUE_CHECK_INTERVAL_MS);
  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
}

start();
