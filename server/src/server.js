import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import User from './models/User.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
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

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

    socket.on('call:join-room', ({ roomId }) => {
      if (!roomId) return;

      socket.join(`call:${roomId}`);

      const existingUsers = callRooms.get(roomId) || [];
      const otherUsers = existingUsers.filter((item) => item.socketId !== socket.id);

      callRooms.set(roomId, [
        ...otherUsers,
        {
          socketId: socket.id,
          userId,
          name: socket.user.name
        }
      ]);

      socket.emit('call:existing-users', otherUsers);

      socket.to(`call:${roomId}`).emit('call:user-joined', {
        socketId: socket.id,
        userId,
        name: socket.user.name
      });
    });

    socket.on('call:offer', ({ to, offer }) => {
      if (!to || !offer) return;
      io.to(to).emit('call:offer', {
        from: socket.id,
        offer,
        userId,
        name: socket.user.name
      });
    });

    socket.on('call:answer', ({ to, answer }) => {
      if (!to || !answer) return;
      io.to(to).emit('call:answer', {
        from: socket.id,
        answer
      });
    });

    socket.on('call:ice-candidate', ({ to, candidate }) => {
      if (!to || !candidate) return;
      io.to(to).emit('call:ice-candidate', {
        from: socket.id,
        candidate
      });
    });

    socket.on('call:leave-room', ({ roomId }) => {
      if (!roomId) return;

      socket.leave(`call:${roomId}`);

      const users = callRooms.get(roomId) || [];
      const updatedUsers = users.filter((item) => item.socketId !== socket.id);

      if (updatedUsers.length > 0) {
        callRooms.set(roomId, updatedUsers);
      } else {
        callRooms.delete(roomId);
      }

      socket.to(`call:${roomId}`).emit('call:user-left', {
        socketId: socket.id,
        userId
      });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('users:online', Array.from(onlineUsers.keys()));

      callRooms.forEach((users, roomId) => {
        const updatedUsers = users.filter((item) => item.socketId !== socket.id);

        if (updatedUsers.length > 0) {
          callRooms.set(roomId, updatedUsers);
        } else {
          callRooms.delete(roomId);
        }

        socket.to(`call:${roomId}`).emit('call:user-left', {
          socketId: socket.id,
          userId
        });
      });
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
