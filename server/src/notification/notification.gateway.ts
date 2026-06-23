import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { verify, type JwtPayload } from 'jsonwebtoken';
import type { Server, Socket } from 'socket.io';

interface AccessTokenPayload extends JwtPayload {
  sub: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(private readonly configService: ConfigService) {}

  handleConnection(client: Socket): void {
    const token = client.handshake.auth?.token as string | undefined;
    const secret = this.configService.get<string>('JWT_SECRET', 'dev-secret');

    try {
      const payload = verify(token ?? '', secret) as AccessTokenPayload;
      void client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket): void {
    // socket.io handles room cleanup automatically
  }

  notifyUser(userId: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }
}
