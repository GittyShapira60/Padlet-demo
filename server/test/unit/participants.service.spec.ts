import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PadletPermission } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ParticipantsService } from '../../src/participants/participants.service';

const USER_5 = '000000000000000000000005';
const USER_7 = '000000000000000000000007';
const PADLET_10 = '000000000000000000000010';

describe('ParticipantsService', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
    participant: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    padlet: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      deleteMany: vi.fn(),
    },
  };

  const padletAccess = {
    assertCanManageSharing: vi.fn(),
  };

  const notificationService = {
    create: vi.fn(),
  };

  const realtimeGateway = {
    emitToUser: vi.fn(),
    broadcastToPadlet: vi.fn(),
  };

  let service: ParticipantsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ParticipantsService(
      prisma as never,
      padletAccess as never,
      notificationService as never,
      realtimeGateway as never,
    );
  });

  describe('inviteParticipant', () => {
    it('invites user when invitee exists and is not already a participant', async () => {
      padletAccess.assertCanManageSharing.mockResolvedValue({
        padletId: PADLET_10,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: USER_7,
        username: 'bob',
      });
      prisma.participant.findUnique.mockResolvedValue(null);
      prisma.participant.create.mockResolvedValue({
        padlet_id: PADLET_10,
        user_id: USER_7,
        permission: PadletPermission.editor,
        user: { id: USER_7, username: 'bob' },
      });
      prisma.padlet.update.mockResolvedValue({});

      const result = await service.inviteParticipant(USER_5, 'alice', PADLET_10, {
        user_id: USER_7,
        permission: PadletPermission.editor,
      });

      expect(prisma.participant.create).toHaveBeenCalledOnce();
      expect(result.username).toBe('bob');
      expect(result.permission).toBe(PadletPermission.editor);
      expect(realtimeGateway.emitToUser).toHaveBeenCalledWith(
        USER_7,
        'padlet:shared',
        { padletId: PADLET_10 },
      );
    });

    it('throws when invitee user is not found', async () => {
      padletAccess.assertCanManageSharing.mockResolvedValue({
        padletId: PADLET_10,
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.inviteParticipant(USER_5, 'alice', PADLET_10, {
          user_id: USER_7,
          permission: PadletPermission.viewer,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.participant.create).not.toHaveBeenCalled();
    });
  });

  describe('leavePadlet', () => {
    it('removes participant when user is shared member', async () => {
      prisma.padlet.findUnique.mockResolvedValue({
        padlet_id: PADLET_10,
        user_id: USER_5,
      });
      prisma.participant.findUnique.mockResolvedValue({
        padlet_id: PADLET_10,
        user_id: USER_7,
        permission: PadletPermission.viewer,
      });
      prisma.participant.delete.mockResolvedValue({});
      prisma.notification.deleteMany.mockResolvedValue({ count: 0 });

      await service.leavePadlet(USER_7, PADLET_10);

      expect(prisma.participant.delete).toHaveBeenCalledWith({
        where: {
          padlet_id_user_id: {
            padlet_id: PADLET_10,
            user_id: USER_7,
          },
        },
      });
    });

    it('throws when owner tries to leave padlet', async () => {
      prisma.padlet.findUnique.mockResolvedValue({
        padlet_id: PADLET_10,
        user_id: USER_5,
      });

      await expect(service.leavePadlet(USER_5, PADLET_10)).rejects.toThrow(
        ForbiddenException,
      );

      expect(prisma.participant.delete).not.toHaveBeenCalled();
    });
  });
});
