import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  PadletBoardType,
  PadletPermission,
  PostContentKind,
} from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostsService } from '../../src/posts/posts.service';

const USER_5 = '000000000000000000000005';
const PADLET_10 = '000000000000000000000010';
const POST_100 = '000000000000000000000100';

function createPostRecord() {
  const now = new Date('2026-01-01T00:00:00.000Z');

  return {
    post_id: POST_100,
    padlet_id: PADLET_10,
    user_id: USER_5,
    content_kind: PostContentKind.none,
    post_type: 'text',
    title: null,
    subject: 'Hello',
    description: null,
    color: null,
    data_layout: null,
    created_at: now,
    updated_at: now,
    user: { username: 'alice' },
    attachment: null,
    poll: null,
  };
}

describe('PostsService', () => {
  const prisma = {
    $transaction: vi.fn(),
    post: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    comment: { deleteMany: vi.fn() },
    notification: { deleteMany: vi.fn() },
    padlet: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    padletVisit: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  };

  const padletAccess = {
    assertCanCreatePost: vi.fn(),
    assertCanDeletePost: vi.fn(),
    assertCanView: vi.fn(),
    assertCanEditPost: vi.fn(),
  };

  const notificationService = {
    create: vi.fn(),
  };

  const realtimeGateway = {
    broadcastToPadlet: vi.fn(),
  };

  let service: PostsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PostsService(
      prisma as never,
      padletAccess as never,
      notificationService as never,
      realtimeGateway as never,
    );
  });

  describe('createPost', () => {
    it('creates post when user has permission', async () => {
      const post = createPostRecord();

      padletAccess.assertCanCreatePost.mockResolvedValue({
        padletId: PADLET_10,
        boardType: PadletBoardType.grid,
        permission: PadletPermission.editor,
        defaultPermission: null,
        isOwner: true,
      });

      prisma.$transaction.mockImplementation(async (callback) => {
        if (typeof callback === 'function') {
          return callback({
            post: { create: vi.fn().mockResolvedValue(post) },
          });
        }

        return callback;
      });

      prisma.post.findUnique.mockResolvedValue(post);
      prisma.padlet.findUnique.mockResolvedValue(null);
      prisma.padlet.update.mockResolvedValue({});

      const result = await service.createPost(USER_5, 'alice', PADLET_10, {
        content_kind: 'text',
        content: 'Hello',
      });

      expect(padletAccess.assertCanCreatePost).toHaveBeenCalledWith(USER_5, PADLET_10);
      expect(result.id).toBe(POST_100);
      expect(result.subject).toBe('Hello');
      expect(realtimeGateway.broadcastToPadlet).toHaveBeenCalledWith(
        PADLET_10,
        'post:created',
        expect.objectContaining({ id: POST_100 }),
      );
    });

    it('throws when user cannot create post', async () => {
      padletAccess.assertCanCreatePost.mockRejectedValue(
        new ForbiddenException('אין הרשאה ליצור פוסט בלוח זה'),
      );

      await expect(
        service.createPost(USER_5, 'alice', PADLET_10, {
          content_kind: 'text',
          content: 'Hello',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    it('deletes post when user is allowed', async () => {
      const post = createPostRecord();

      padletAccess.assertCanView.mockResolvedValue({
        padletId: PADLET_10,
        boardType: PadletBoardType.grid,
        permission: PadletPermission.editor,
        defaultPermission: null,
        isOwner: true,
      });
      padletAccess.assertCanDeletePost.mockResolvedValue({
        padletId: PADLET_10,
        boardType: PadletBoardType.grid,
        permission: PadletPermission.editor,
        defaultPermission: null,
        isOwner: true,
      });
      prisma.post.findFirst.mockResolvedValue(post);
      prisma.$transaction.mockResolvedValue([]);
      prisma.post.findMany.mockResolvedValue([]);
      prisma.padlet.update.mockResolvedValue({});

      const result = await service.deletePost(USER_5, PADLET_10, POST_100);

      expect(padletAccess.assertCanDeletePost).toHaveBeenCalledWith(USER_5, PADLET_10, USER_5);
      expect(prisma.$transaction).toHaveBeenCalledOnce();
      expect(result).toEqual([]);
      expect(realtimeGateway.broadcastToPadlet).toHaveBeenCalledWith(
        PADLET_10,
        'post:deleted',
        { postId: POST_100 },
      );
    });

    it('throws when user cannot delete post', async () => {
      const post = createPostRecord();

      padletAccess.assertCanView.mockResolvedValue({
        padletId: PADLET_10,
        boardType: PadletBoardType.grid,
        permission: PadletPermission.viewer,
        defaultPermission: null,
        isOwner: false,
      });
      prisma.post.findFirst.mockResolvedValue(post);
      padletAccess.assertCanDeletePost.mockRejectedValue(
        new ForbiddenException('אין הרשאה למחוק פוסט זה'),
      );

      await expect(service.deletePost(USER_5, PADLET_10, POST_100)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
