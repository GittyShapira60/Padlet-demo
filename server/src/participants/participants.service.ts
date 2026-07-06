import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, PadletPermission } from '@prisma/client';
import { RealtimeGateway } from '../gateway/realtime.gateway';
import { NotificationService } from '../notification/notification.service';
import { PadletAccessService } from '../padlet-access/padlet-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantPermissionDto } from './dto/update-participant-permission.dto';

export interface ParticipantResponseDto {
  id: string;
  username: string;
  permission: PadletPermission;
}

const ASSIGNABLE_PERMISSIONS = new Set<PadletPermission>([
  PadletPermission.viewer,
  PadletPermission.commenter,
  PadletPermission.editor,
  PadletPermission.admin,
]);

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly padletAccess: PadletAccessService,
    private readonly notificationService: NotificationService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async getParticipants(
    userId: string,
    padletIdRaw: string,
  ): Promise<ParticipantResponseDto[]> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    await this.padletAccess.assertCanManageSharing(requesterId, padletId);

    const participants = await this.prisma.participant.findMany({
      where: { padlet_id: padletId },
      include: { user: true },
      orderBy: { user: { username: 'asc' } },
    });

    return participants.map((participant) =>
      this.toParticipantResponse(participant.user.id, participant),
    );
  }

  async inviteParticipant(
    userId: string,
    actorUsername: string,
    padletIdRaw: string,
    dto: CreateParticipantDto,
  ): Promise<ParticipantResponseDto> {
    const ownerId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const inviteeId = this.parseId(dto.user_id, 'משתמש לא נמצא');

    await this.padletAccess.assertCanManageSharing(ownerId, padletId);
    this.assertAssignablePermission(dto.permission);

    if (ownerId === inviteeId) {
      throw new ConflictException('לא ניתן להזמין את בעל הלוח');
    }

    const invitee = await this.prisma.user.findUnique({
      where: { id: inviteeId },
      select: { id: true, username: true },
    });

    if (!invitee) {
      throw new NotFoundException('משתמש לא נמצא');
    }

    const existingParticipant = await this.prisma.participant.findUnique({
      where: {
        padlet_id_user_id: {
          padlet_id: padletId,
          user_id: inviteeId,
        },
      },
    });

    if (existingParticipant) {
      throw new ConflictException('המשתמש כבר משותף בלוח');
    }

    const participant = await this.prisma.participant.create({
      data: {
        padlet_id: padletId,
        user_id: inviteeId,
        permission: dto.permission,
      },
      include: { user: true },
    });

    await this.touchPadlet(padletId);

    void this.notificationService.create({
      userId: inviteeId,
      type: NotificationType.padlet_share,
      actorUsername,
      padletId,
    });

    this.realtimeGateway.emitToUser(inviteeId.toString(), 'padlet:shared', {
      padletId: padletId.toString(),
    });

    return this.toParticipantResponse(invitee.id, participant);
  }

  async updateParticipantPermission(
    userId: string,
    padletIdRaw: string,
    participantUserIdRaw: string,
    dto: UpdateParticipantPermissionDto,
  ): Promise<ParticipantResponseDto> {
    const ownerId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const participantUserId = this.parseId(
      participantUserIdRaw,
      'משתמש לא נמצא',
    );

    await this.padletAccess.assertCanManageSharing(ownerId, padletId);
    this.assertAssignablePermission(dto.permission);

    const participant = await this.prisma.participant.findUnique({
      where: {
        padlet_id_user_id: {
          padlet_id: padletId,
          user_id: participantUserId,
        },
      },
      include: { user: true },
    });

    if (!participant) {
      throw new NotFoundException('משתף הפעולה לא נמצא');
    }

    const updatedParticipant = await this.prisma.participant.update({
      where: {
        padlet_id_user_id: {
          padlet_id: padletId,
          user_id: participantUserId,
        },
      },
      data: { permission: dto.permission },
      include: { user: true },
    });

    await this.touchPadlet(padletId);

    this.realtimeGateway.emitToUser(participantUserId.toString(), 'permission:changed', {
      padletId: padletId.toString(),
      permission: dto.permission,
    });

    return this.toParticipantResponse(
      updatedParticipant.user.id,
      updatedParticipant,
    );
  }

  async removeParticipant(
    userId: string,
    padletIdRaw: string,
    participantUserIdRaw: string,
  ): Promise<void> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const participantUserId = this.parseId(participantUserIdRaw, 'משתמש לא נמצא');

    await this.padletAccess.assertCanManageSharing(requesterId, padletId);

    const participant = await this.prisma.participant.findUnique({
      where: { padlet_id_user_id: { padlet_id: padletId, user_id: participantUserId } },
    });
    if (!participant) throw new NotFoundException('משתף הפעולה לא נמצא');

    await this.prisma.participant.delete({
      where: { padlet_id_user_id: { padlet_id: padletId, user_id: participantUserId } },
    });

    await this.prisma.notification.deleteMany({
      where: {
        padlet_id: padletId,
        user_id: participantUserId,
        type: NotificationType.padlet_share,
      },
    });

    this.realtimeGateway.emitToUser(participantUserId.toString(), 'padlet:removed', {
      padletId: padletId.toString(),
    });
  }

  async leavePadlet(userId: string, padletIdRaw: string): Promise<void> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    const padlet = await this.prisma.padlet.findUnique({
      where: { padlet_id: padletId },
      select: { padlet_id: true, user_id: true },
    });

    if (!padlet) {
      throw new NotFoundException('הלוח לא נמצא');
    }

    if (padlet.user_id === requesterId) {
      throw new ForbiddenException('בעל הלוח לא יכול לעזוב אותו, ניתן למחוק אותו');
    }

    const participant = await this.prisma.participant.findUnique({
      where: {
        padlet_id_user_id: {
          padlet_id: padletId,
          user_id: requesterId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('אינך משתתף בלוח זה');
    }

    await this.prisma.participant.delete({
      where: {
        padlet_id_user_id: {
          padlet_id: padletId,
          user_id: requesterId,
        },
      },
    });

    await this.prisma.notification.deleteMany({
      where: {
        padlet_id: padletId,
        user_id: requesterId,
        type: NotificationType.padlet_share,
      },
    });

    this.realtimeGateway.emitToUser(requesterId.toString(), 'padlet:removed', {
      padletId: padletId.toString(),
    });
  }

  private toParticipantResponse(
    userId: bigint,
    participant: { user: { username: string }; permission: PadletPermission },
  ): ParticipantResponseDto {
    return {
      id: userId.toString(),
      username: participant.user.username,
      permission: participant.permission,
    };
  }

  private assertAssignablePermission(permission: PadletPermission): void {
    if (!ASSIGNABLE_PERMISSIONS.has(permission)) {
      throw new ForbiddenException('הרשאה לא חוקית להזמנה');
    }
  }

  private async touchPadlet(padletId: bigint): Promise<void> {
    await this.prisma.padlet.update({
      where: { padlet_id: padletId },
      data: { updated_at: new Date() },
    });
  }

  private parseId(raw: string, errorMessage: string): bigint {
    try {
      return BigInt(raw);
    } catch {
      throw new NotFoundException(errorMessage);
    }
  }
}
