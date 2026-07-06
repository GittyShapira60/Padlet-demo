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
    const userIdBig = BigInt(userId);

    const notifications = await this.prisma.notification.findMany({
      where: { user_id: userIdBig },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    const padletIds = [
      ...new Set(
        notifications
          .map((n) => n.padlet_id)
          .filter((id): id is bigint => id !== null),
      ),
    ];

    const staleIdSet = new Set<string>();

    if (padletIds.length > 0) {
      // Check which padlets still exist
      const existingPadlets = await this.prisma.padlet.findMany({
        where: { padlet_id: { in: padletIds } },
        select: { padlet_id: true },
      });
      const existingPadletIds = new Set(existingPadlets.map((p) => p.padlet_id.toString()));

      // For padlet_share: also verify user is still owner or participant
      const sharePadletIds = notifications
        .filter((n) => n.type === 'padlet_share' && n.padlet_id !== null)
        .map((n) => n.padlet_id as bigint);

      let accessibleSharePadletIds = new Set<string>();
      if (sharePadletIds.length > 0) {
        const accessible = await this.prisma.padlet.findMany({
          where: {
            padlet_id: { in: sharePadletIds },
            OR: [
              { user_id: userIdBig },
              { participants: { some: { user_id: userIdBig } } },
            ],
          },
          select: { padlet_id: true },
        });
        accessibleSharePadletIds = new Set(accessible.map((p) => p.padlet_id.toString()));
      }

      for (const n of notifications) {
        if (n.padlet_id === null) continue;
        const idStr = n.padlet_id.toString();
        if (!existingPadletIds.has(idStr)) {
          staleIdSet.add(n.id.toString());
        } else if (n.type === 'padlet_share' && !accessibleSharePadletIds.has(idStr)) {
          staleIdSet.add(n.id.toString());
        }
      }
    }

    if (staleIdSet.size > 0) {
      void this.prisma.notification.deleteMany({
        where: { id: { in: [...staleIdSet].map(BigInt) } },
      });
    }

    return notifications
      .filter((n) => !staleIdSet.has(n.id.toString()))
      .map((n) => this.toDto(n));
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
