import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
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
export class RealtimeGateway
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

  /** Client joins the padlet room to receive real-time post/reaction updates. */
  @SubscribeMessage('padlet:join')
  handleJoinPadlet(client: Socket, padletId: string): void {
    void client.join(`padlet:${padletId}`);
  }

  /** Client leaves the padlet room on page exit. */
  @SubscribeMessage('padlet:leave')
  handleLeavePadlet(client: Socket, padletId: string): void {
    void client.leave(`padlet:${padletId}`);
  }

  /** Send a notification event to a specific user. */
  notifyUser(userId: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }

  /** Broadcast any event to all users currently viewing a padlet. */
  broadcastToPadlet(padletId: string, event: string, payload: unknown): void {
    this.server.to(`padlet:${padletId}`).emit(event, payload);
  }

  /** Send a targeted event to a specific user (e.g. padlet:shared). */
  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
