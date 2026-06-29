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
import { PadletAccessService } from '../padlet-access/padlet-access.service';

interface AccessTokenPayload extends JwtPayload {
  sub: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly padletAccess: PadletAccessService,
  ) {}

  handleConnection(client: Socket): void {
    const token = client.handshake.auth?.token as string | undefined;
    const secret = this.configService.get<string>('JWT_SECRET', 'dev-secret');

    try {
      const payload = verify(token ?? '', secret) as AccessTokenPayload;
      client.data.userId = payload.sub;
      void client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket): void {}

  @SubscribeMessage('padlet:join')
  async handleJoinPadlet(client: Socket, padletId: string): Promise<void> {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      return;
    }
    try {
      await this.padletAccess.assertCanView(BigInt(userId), BigInt(padletId));
      void client.join(`padlet:${padletId}`);
    } catch { /* noop */ }
  }

  @SubscribeMessage('padlet:leave')
  handleLeavePadlet(client: Socket, padletId: string): void {
    void client.leave(`padlet:${padletId}`);
  }

  notifyUser(userId: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }

  broadcastToPadlet(padletId: string, event: string, payload: unknown): void {
    this.server.to(`padlet:${padletId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
