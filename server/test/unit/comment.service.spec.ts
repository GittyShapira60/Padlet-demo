import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentService } from '../../src/comment/comment.service';

const USER_5 = '000000000000000000000005';
const USER_7 = '000000000000000000000007';
const PADLET_10 = '000000000000000000000010';
const POST_100 = '000000000000000000000100';
const COMMENT_1 = '000000000000000000000001';

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
        padletId: PADLET_10,
      });
      prisma.post.findFirst.mockResolvedValue({ user_id: USER_7 });
      prisma.comment.create.mockResolvedValue({
        comment_id: COMMENT_1,
        post_id: POST_100,
        user_id: USER_5,
        body: 'Nice post',
        created_at: now,
        updated_at: now,
        user: { username: 'alice' },
      });

      const result = await service.createComment(
        USER_5,
        'alice',
        PADLET_10,
        POST_100,
        { body: 'Nice post' },
      );

      expect(padletAccess.assertCanComment).toHaveBeenCalledWith(USER_5, PADLET_10);
      expect(result.body).toBe('Nice post');
      expect(result.authorUsername).toBe('alice');
      expect(realtimeGateway.broadcastToPadlet).toHaveBeenCalled();
    });

    it('throws when user cannot comment', async () => {
      padletAccess.assertCanComment.mockRejectedValue(
        new ForbiddenException('אין הרשאה להגיב בלוח זה'),
      );

      await expect(
        service.createComment(USER_5, 'alice', PADLET_10, POST_100, { body: 'Nice post' }),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.comment.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('deletes comment when user is the author', async () => {
      padletAccess.assertCanComment.mockResolvedValue({
        padletId: PADLET_10,
      });
      prisma.post.findFirst.mockResolvedValue({ user_id: USER_7 });
      prisma.comment.findFirst.mockResolvedValue({
        comment_id: COMMENT_1,
        post_id: POST_100,
        user_id: USER_5,
      });
      prisma.comment.delete.mockResolvedValue({});

      await service.deleteComment(USER_5, PADLET_10, POST_100, COMMENT_1);

      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { comment_id: COMMENT_1 },
      });
      expect(realtimeGateway.broadcastToPadlet).toHaveBeenCalledWith(
        PADLET_10,
        'comment:deleted',
        { postId: POST_100, commentId: COMMENT_1 },
      );
    });

    it('throws when comment does not exist', async () => {
      padletAccess.assertCanComment.mockResolvedValue({
        padletId: PADLET_10,
      });
      prisma.post.findFirst.mockResolvedValue({ user_id: USER_7 });
      prisma.comment.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteComment(USER_5, PADLET_10, POST_100, COMMENT_1),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });
  });
});
