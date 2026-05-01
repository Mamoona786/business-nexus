import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import User from './models/User.js';

const PORT = process.env.PORT || 5000;

const getAllowedOrigins = () => {
  return [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL
  ].filter(Boolean);
};

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: getAllowedOrigins(),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      }
    });

    const onlineUsers = new Map();
    const callRooms = new Map();

    app.set('io', io);
    app.set('onlineUsers', onlineUsers);

    io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Not authorised, no token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
          issuer: 'business-nexus',
          audience: 'business-nexus-users'
        });

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
          return next(new Error('Not authorised, user not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Not authorised, invalid token'));
      }
    });

    io.on('connection', (socket) => {
      const userId = socket.user._id.toString();

      onlineUsers.set(userId, socket.id);
      socket.join(`user:${userId}`);

      io.emit('users:online', Array.from(onlineUsers.keys()));

      socket.on('video:join-room', ({ roomId }) => {
        if (!roomId) return;

        socket.join(roomId);

        if (!callRooms.has(roomId)) {
          callRooms.set(roomId, new Set());
        }

        const roomUsers = callRooms.get(roomId);

        const existingUsers = Array.from(roomUsers).filter(
          (item) => item.socketId !== socket.id
        );

        socket.emit('video:room-users', existingUsers);

        roomUsers.add({
          userId,
          socketId: socket.id,
          name: socket.user.name
        });

        socket.to(roomId).emit('video:user-joined', {
          userId,
          socketId: socket.id,
          name: socket.user.name
        });
      });

      socket.on('video:offer', ({ roomId, offer }) => {
        socket.to(roomId).emit('video:offer', {
          offer,
          from: socket.id,
          userId,
          name: socket.user.name
        });
      });

      socket.on('video:answer', ({ roomId, answer }) => {
        socket.to(roomId).emit('video:answer', {
          answer,
          from: socket.id,
          userId,
          name: socket.user.name
        });
      });

      socket.on('video:ice-candidate', ({ roomId, candidate }) => {
        socket.to(roomId).emit('video:ice-candidate', {
          candidate,
          from: socket.id
        });
      });

      socket.on('video:leave-room', ({ roomId }) => {
        if (!roomId) return;

        socket.leave(roomId);
        socket.to(roomId).emit('video:user-left', {
          userId,
          socketId: socket.id
        });
      });

      socket.on('disconnect', () => {
        onlineUsers.delete(userId);

        callRooms.forEach((users, roomId) => {
          users.forEach((item) => {
            if (item.socketId === socket.id) {
              users.delete(item);

              socket.to(roomId).emit('video:user-left', {
                userId,
                socketId: socket.id
              });
            }
          });

          if (users.size === 0) {
            callRooms.delete(roomId);
          }
        });

        io.emit('users:online', Array.from(onlineUsers.keys()));
      });
    });

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
