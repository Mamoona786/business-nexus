import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import userRoutes from './routes/userRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'Business Nexus API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meetings', meetingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
