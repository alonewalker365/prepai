import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connect error:', err.message);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
