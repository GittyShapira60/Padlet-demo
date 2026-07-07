import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PadletPermission } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ParticipantsService } from '../../src/participants/participants.service';

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
        padletId: 10n,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 7n,
        username: 'bob',
      });
      prisma.participant.findUnique.mockResolvedValue(null);
      prisma.participant.create.mockResolvedValue({
        padlet_id: 10n,
        user_id: 7n,
        permission: PadletPermission.editor,
        user: { id: 7n, username: 'bob' },
      });
      prisma.padlet.update.mockResolvedValue({});

      const result = await service.inviteParticipant('5', 'alice', '10', {
        user_id: '7',
        permission: PadletPermission.editor,
      });

      expect(prisma.participant.create).toHaveBeenCalledOnce();
      expect(result.username).toBe('bob');
      expect(result.permission).toBe(PadletPermission.editor);
      expect(realtimeGateway.emitToUser).toHaveBeenCalledWith(
        '7',
        'padlet:shared',
        { padletId: '10' },
      );
    });

    it('throws when invitee user is not found', async () => {
      padletAccess.assertCanManageSharing.mockResolvedValue({
        padletId: 10n,
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.inviteParticipant('5', 'alice', '10', {
          user_id: '7',
          permission: PadletPermission.viewer,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.participant.create).not.toHaveBeenCalled();
    });
  });

  describe('leavePadlet', () => {
    it('removes participant when user is shared member', async () => {
      prisma.padlet.findUnique.mockResolvedValue({
        padlet_id: 10n,
        user_id: 5n,
      });
      prisma.participant.findUnique.mockResolvedValue({
        padlet_id: 10n,
        user_id: 7n,
        permission: PadletPermission.viewer,
      });
      prisma.participant.delete.mockResolvedValue({});
      prisma.notification.deleteMany.mockResolvedValue({ count: 0 });

      await service.leavePadlet('7', '10');

      expect(prisma.participant.delete).toHaveBeenCalledWith({
        where: {
          padlet_id_user_id: {
            padlet_id: 10n,
            user_id: 7n,
          },
        },
      });
    });

    it('throws when owner tries to leave padlet', async () => {
      prisma.padlet.findUnique.mockResolvedValue({
        padlet_id: 10n,
        user_id: 5n,
      });

      await expect(service.leavePadlet('5', '10')).rejects.toThrow(
        ForbiddenException,
      );

      expect(prisma.participant.delete).not.toHaveBeenCalled();
    });
  });
});
