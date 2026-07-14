import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PadletBoardType, PadletPermission } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  canComment,
  canCreatePost,
  canDeletePadlet,
  canDeletePost,
  canEditPadlet,
  canEditPost,
  canManageSharing,
  canReact,
  canView,
} from './padlet-capabilities';

export interface PadletAccessContext {
  padletId: string;
  boardType: PadletBoardType;
  permission: PadletPermission;
  defaultPermission: PadletPermission | null;
  isOwner: boolean;
}

@Injectable()
export class PadletAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveAccess(
    userId: string,
    padletId: string,
  ): Promise<PadletAccessContext> {
    const padlet = await this.prisma.padlet.findUnique({
      where: { padlet_id: padletId },
      include: {
        participants: {
          where: { user_id: userId },
          take: 1,
        },
      },
    });

    if (!padlet) {
      throw new NotFoundException('הלוח לא נמצא');
    }

    const defaultPermission = padlet.default_permission;

    if (padlet.user_id === userId) {
      return {
        padletId,
        boardType: padlet.board_type,
        permission: PadletPermission.owner,
        defaultPermission,
        isOwner: true,
      };
    }

    const participant = padlet.participants[0];
    if (participant) {
      return {
        padletId,
        boardType: padlet.board_type,
        permission: participant.permission,
        defaultPermission,
        isOwner: false,
      };
    }

    if (defaultPermission !== null) {
      return {
        padletId,
        boardType: padlet.board_type,
        permission: defaultPermission,
        defaultPermission,
        isOwner: false,
      };
    }

    throw new NotFoundException('הלוח לא נמצא');
  }

  async assertCanView(userId: string, padletId: string): Promise<PadletAccessContext> {
    const access = await this.resolveAccess(userId, padletId);
    if (!canView(access.permission)) {
      throw new ForbiddenException('אין הרשאה לצפות בלוח זה');
    }
    return access;
  }

  async assertCanCreatePost(
    userId: string,
    padletId: string,
  ): Promise<PadletAccessContext> {
    const access = await this.assertCanView(userId, padletId);
    if (!canCreatePost(access.permission)) {
      throw new ForbiddenException('אין הרשאה ליצור פוסט בלוח זה');
    }
    return access;
  }

  async assertCanEditPost(
    userId: string,
    padletId: string,
    postAuthorId: string,
  ): Promise<PadletAccessContext> {
    const access = await this.assertCanView(userId, padletId);
    if (!canEditPost(access.permission, postAuthorId === userId)) {
      throw new ForbiddenException('אין הרשאה לערוך או למחוק פוסט זה');
    }
    return access;
  }

  async assertCanDeletePost(
    userId: string,
    padletId: string,
    postAuthorId: string,
  ): Promise<PadletAccessContext> {
    const access = await this.assertCanView(userId, padletId);
    if (!canDeletePost(access.permission, postAuthorId === userId)) {
      throw new ForbiddenException('אין הרשאה למחוק פוסט זה');
    }
    return access;
  }

  async assertCanReact(
    userId: string,
    padletId: string,
  ): Promise<PadletAccessContext> {
    const access = await this.assertCanView(userId, padletId);
    if (!canReact(access.permission)) {
      throw new ForbiddenException('אין הרשאה להגיב על פוסטים בלוח זה');
    }
    return access;
  }

  async assertCanComment(
    userId: string,
    padletId: string,
  ): Promise<PadletAccessContext> {
    const access = await this.assertCanView(userId, padletId);
    if (!canComment(access.permission)) {
      throw new ForbiddenException('אין הרשאה להגיב בתגובות בלוח זה');
    }
    return access;
  }

  async assertCanEditPadlet(
    userId: string,
    padletId: string,
  ): Promise<PadletAccessContext> {
    const access = await this.resolveAccess(userId, padletId);
    if (!canEditPadlet(access.permission)) {
      throw new ForbiddenException('אין הרשאה לערוך את הלוח');
    }
    return access;
  }

  async assertCanManageSharing(
    userId: string,
    padletId: string,
  ): Promise<PadletAccessContext> {
    const access = await this.resolveAccess(userId, padletId);
    if (!canManageSharing(access.permission)) {
      throw new ForbiddenException('אין הרשאה לנהל שיתוף לוח זה');
    }
    return access;
  }

  async assertCanDeletePadlet(
    userId: string,
    padletId: string,
  ): Promise<PadletAccessContext> {
    const access = await this.resolveAccess(userId, padletId);
    if (!canDeletePadlet(access.permission)) {
      throw new ForbiddenException('רק הבעלים יכול למחוק את הלוח');
    }
    return access;
  }
}
