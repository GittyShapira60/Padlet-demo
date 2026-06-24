import { io, type Socket } from 'socket.io-client';
import { getAuthData } from '../../features/auth/utils/auth-token-storage';
import { env } from './env';

let socket: Socket | null = null;

function getBaseUrl(): string {
  return new URL(env.apiUrl).origin;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  socket = io(getBaseUrl(), {
    auth: { token: getAuthData()?.token },
    transports: ['websocket'],
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
