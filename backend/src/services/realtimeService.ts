import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

/**
 * Real-Time Event Hub
 * 
 * Provides WebSocket-based real-time state propagation
 * so the frontend (Member 1/2) and AI agent (Member 4)
 * can receive instant updates when business state changes.
 * 
 * Events emitted:
 * - rental:status_changed
 * - rental:overdue_detected
 * - order:created
 * - inventory:status_changed
 * - ai:action_executed
 * - logistics:pickup_scheduled
 * - logistics:inspection_recorded
 */

let io: SocketIOServer | null = null;

export const initializeSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // In production, restrict to specific origins
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Allow clients to join specific rooms for targeted updates
    socket.on('join:rental', (rentalId: string) => {
      socket.join(`rental:${rentalId}`);
      console.log(`[WS] ${socket.id} joined rental:${rentalId}`);
    });

    socket.on('join:customer', (customerId: string) => {
      socket.join(`customer:${customerId}`);
      console.log(`[WS] ${socket.id} joined customer:${customerId}`);
    });

    socket.on('join:admin', () => {
      socket.join('admin');
      console.log(`[WS] ${socket.id} joined admin room`);
    });

    socket.on('join:ai-agent', () => {
      socket.join('ai-agent');
      console.log(`[WS] ${socket.id} joined ai-agent room`);
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[WS] Socket.IO initialized');
  return io;
};

export const getIO = (): SocketIOServer | null => io;

// === Emission helpers ===

export const emitRentalStatusChange = (rentalId: string, newStatus: string, rental: any) => {
  if (!io) return;
  const payload = { rentalId, newStatus, rental, timestamp: new Date() };
  io.to(`rental:${rentalId}`).emit('rental:status_changed', payload);
  io.to('admin').emit('rental:status_changed', payload);
  io.to('ai-agent').emit('rental:status_changed', payload);
};

export const emitOverdueDetected = (rental: any) => {
  if (!io) return;
  const payload = { rentalId: rental._id, rental, timestamp: new Date() };
  io.to(`customer:${rental.customer}`).emit('rental:overdue_detected', payload);
  io.to('admin').emit('rental:overdue_detected', payload);
  io.to('ai-agent').emit('rental:overdue_detected', payload);
};

export const emitOrderCreated = (order: any) => {
  if (!io) return;
  const payload = { orderId: order._id, order, timestamp: new Date() };
  io.to(`customer:${order.customer}`).emit('order:created', payload);
  io.to('admin').emit('order:created', payload);
};

export const emitAIActionExecuted = (action: string, details: any) => {
  if (!io) return;
  const payload = { action, details, timestamp: new Date() };
  io.to('admin').emit('ai:action_executed', payload);
};

export const emitInventoryChange = (inventoryId: string, newStatus: string) => {
  if (!io) return;
  const payload = { inventoryId, newStatus, timestamp: new Date() };
  io.to('admin').emit('inventory:status_changed', payload);
};
