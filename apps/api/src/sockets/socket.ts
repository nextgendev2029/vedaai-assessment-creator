import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { getAllowedOrigins } from '../config/env';
import { setupProgressSubscriber } from '../services/progress-publisher.service';

export function initializeSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔗 Socket connected: ${socket.id}`);

    socket.on('assignment:join', (data: { assignmentId: string }) => {
      const room = `assignment:${data.assignmentId}`;
      socket.join(room);
      console.log(`📌 Socket ${socket.id} joined room ${room}`);
    });

    socket.on('assignment:leave', (data: { assignmentId: string }) => {
      const room = `assignment:${data.assignmentId}`;
      socket.leave(room);
      console.log(`📌 Socket ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  // Setup Redis Pub/Sub -> Socket.IO bridge
  setupProgressSubscriber(io);

  console.log('✅ Socket.IO initialized');
  return io;
}
