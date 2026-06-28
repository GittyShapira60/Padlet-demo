import { Injectable } from '@nestjs/common';
import { type NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { NotificationResponseDto } from './dto/notification-response.dto';
import { RealtimeGateway } from '../gateway/realtime.gateway';

export interface CreateNotificationParams {
  userId: bigint;
  type: NotificationType;
  actorUsername: string;
  padletId?: bigint;
  postId?: bigint;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: RealtimeGateway,
  ) {}

  async create(params: CreateNotificationParams): Promise<void> {
    const notification = await this.prisma.notification.create({
      data: {
        user_id: params.userId,
        type: params.type,
        actor_username: params.actorUsername,
        padlet_id: params.padletId ?? null,
        post_id: params.postId ?? null,
        created_at: new Date(),
      },
    });

    this.gateway.notifyUser(params.userId.toString(), this.toDto(notification));
  }

  async findForUser(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { user_id: BigInt(userId) },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return notifications.map((n) => this.toDto(n));
  }

  async markRead(userId: string, notifId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: BigInt(notifId), user_id: BigInt(userId) },
      data: { is_read: true },
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { user_id: BigInt(userId), is_read: false },
      data: { is_read: true },
    });
  }

  async deleteOne(userId: string, notifId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { id: BigInt(notifId), user_id: BigInt(userId) },
    });
  }

  private toDto(notification: {
    id: bigint;
    type: NotificationType;
    actor_username: string;
    padlet_id: bigint | null;
    post_id: bigint | null;
    is_read: boolean;
    created_at: Date;
  }): NotificationResponseDto {
    return {
      id: notification.id.toString(),
      type: notification.type,
      actorUsername: notification.actor_username,
      padletId: notification.padlet_id?.toString() ?? null,
      postId: notification.post_id?.toString() ?? null,
      isRead: notification.is_read,
      createdAt: notification.created_at.toISOString(),
    };
  }
}
