import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
import { initializeSocketIO } from './services/realtimeService';
import cron from 'node-cron';
import { detectOverdueRentals } from './workers/overdueWorker';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  const server = http.createServer(app);
  
  // Initialize Real-time Hub
  initializeSocketIO(server);

  // Initialize Background Workers (Run every 15 minutes)
  cron.schedule('*/15 * * * *', () => {
    console.log('[CRON] Running overdue rental detection...');
    detectOverdueRentals();
  });

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
