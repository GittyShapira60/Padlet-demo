import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentService } from '../../src/comment/comment.service';

describe('CommentService', () => {
  const prisma = {
    comment: {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    post: {
      findFirst: vi.fn(),
    },
  };

  const padletAccess = {
    assertCanComment: vi.fn(),
    assertCanView: vi.fn(),
  };

  const notificationService = {
    create: vi.fn(),
  };

  const realtimeGateway = {
    broadcastToPadlet: vi.fn(),
  };

  let service: CommentService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CommentService(
      prisma as never,
      padletAccess as never,
      notificationService as never,
      realtimeGateway as never,
    );
  });

  describe('createComment', () => {
    it('creates comment when user can comment', async () => {
      const now = new Date('2026-01-01T00:00:00.000Z');

      padletAccess.assertCanComment.mockResolvedValue({
        padletId: 10n,
      });
      prisma.post.findFirst.mockResolvedValue({ user_id: 7n });
      prisma.comment.create.mockResolvedValue({
        comment_id: 1n,
        post_id: 100n,
        user_id: 5n,
        body: 'Nice post',
        created_at: now,
        updated_at: now,
        user: { username: 'alice' },
      });

      const result = await service.createComment(
        '5',
        'alice',
        '10',
        '100',
        { body: 'Nice post' },
      );

      expect(padletAccess.assertCanComment).toHaveBeenCalledWith(5n, 10n);
      expect(result.body).toBe('Nice post');
      expect(result.authorUsername).toBe('alice');
      expect(realtimeGateway.broadcastToPadlet).toHaveBeenCalled();
    });

    it('throws when user cannot comment', async () => {
      padletAccess.assertCanComment.mockRejectedValue(
        new ForbiddenException('אין הרשאה להגיב בלוח זה'),
      );

      await expect(
        service.createComment('5', 'alice', '10', '100', { body: 'Nice post' }),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.comment.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('deletes comment when user is the author', async () => {
      padletAccess.assertCanComment.mockResolvedValue({
        padletId: 10n,
      });
      prisma.post.findFirst.mockResolvedValue({ user_id: 7n });
      prisma.comment.findFirst.mockResolvedValue({
        comment_id: 1n,
        post_id: 100n,
        user_id: 5n,
      });
      prisma.comment.delete.mockResolvedValue({});

      await service.deleteComment('5', '10', '100', '1');

      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { comment_id: 1n },
      });
      expect(realtimeGateway.broadcastToPadlet).toHaveBeenCalledWith(
        '10',
        'comment:deleted',
        { postId: '100', commentId: '1' },
      );
    });

    it('throws when comment does not exist', async () => {
      padletAccess.assertCanComment.mockResolvedValue({
        padletId: 10n,
      });
      prisma.post.findFirst.mockResolvedValue({ user_id: 7n });
      prisma.comment.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteComment('5', '10', '100', '1'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });
  });
});
