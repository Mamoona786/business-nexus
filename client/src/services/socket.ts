import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocketBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  return apiUrl.replace(/\/api\/?$/, '');
};

export const connectSocket = (): Socket | null => {
  const token = localStorage.getItem('business_nexus_token');

  if (!token) return null;

  const baseUrl = getSocketBaseUrl();

  if (socket?.connected) return socket;

  socket = io(baseUrl, {
    transports: ['websocket'],
    withCredentials: true,
    auth: { token }
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
