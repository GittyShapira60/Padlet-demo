import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PadletBoardType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PadletsService } from '../../src/padlets/padlets.service';

function createPadletRecord() {
  const now = new Date('2026-01-01T00:00:00.000Z');

  return {
    padlet_id: 10n,
    user_id: 5n,
    board_type: PadletBoardType.grid,
    title: 'My Board',
    description: null,
    background: null,
    created_at: now,
    updated_at: now,
    _count: { posts: 0 },
    user: { username: 'alice' },
  };
}

describe('PadletsService', () => {
  const prisma = {
    padlet: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    postAttachment: { deleteMany: vi.fn() },
    post: { deleteMany: vi.fn() },
    notification: { deleteMany: vi.fn() },
    participant: { deleteMany: vi.fn() },
    padletVisit: { deleteMany: vi.fn() },
  };

  const postsService = {};
  const padletAccess = {
    assertCanDeletePadlet: vi.fn(),
    assertCanEditPadlet: vi.fn(),
    assertCanView: vi.fn(),
    assertCanManageSharing: vi.fn(),
  };
  const realtimeGateway = {
    broadcastToPadlet: vi.fn(),
    emitToUser: vi.fn(),
  };

  let service: PadletsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PadletsService(
      prisma as never,
      postsService as never,
      padletAccess as never,
      realtimeGateway as never,
    );
  });

  describe('createPadlet', () => {
    it('creates padlet when user id is valid', async () => {
      const padlet = createPadletRecord();
      prisma.padlet.create.mockResolvedValue(padlet);

      const result = await service.createPadlet('5', {
        title: 'My Board',
        board_type: PadletBoardType.grid,
      });

      expect(prisma.padlet.create).toHaveBeenCalledOnce();
      expect(result.title).toBe('My Board');
      expect(result.id).toBe('10');
    });

    it('throws when user id is invalid', async () => {
      await expect(
        service.createPadlet('not-a-number', {
          title: 'My Board',
          board_type: PadletBoardType.grid,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePadlet', () => {
    it('deletes padlet when requester is owner', async () => {
      padletAccess.assertCanDeletePadlet.mockResolvedValue({
        isOwner: true,
        padletId: 10n,
      });

      await service.deletePadlet('5', '10');

      expect(padletAccess.assertCanDeletePadlet).toHaveBeenCalledWith(5n, 10n);
      expect(prisma.padlet.delete).toHaveBeenCalledWith({
        where: { padlet_id: 10n },
      });
      expect(realtimeGateway.broadcastToPadlet).toHaveBeenCalledWith(
        '10',
        'padlet:deleted',
        {},
      );
    });

    it('throws when requester cannot delete padlet', async () => {
      padletAccess.assertCanDeletePadlet.mockRejectedValue(
        new ForbiddenException('אין הרשאה למחוק את הלוח'),
      );

      await expect(service.deletePadlet('5', '10')).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.padlet.delete).not.toHaveBeenCalled();
    });
  });

  describe('getBoards', () => {
    it('returns owned and shared boards', async () => {
      const padlet = createPadletRecord();
      prisma.padlet.findMany
        .mockResolvedValueOnce([padlet])
        .mockResolvedValueOnce([]);

      const result = await service.getBoards('5');

      expect(result.mine).toHaveLength(1);
      expect(result.shared).toHaveLength(0);
      expect(result.mine[0]?.title).toBe('My Board');
    });

    it('throws when user id is invalid', async () => {
      await expect(service.getBoards('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
