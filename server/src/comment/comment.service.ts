import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Comment, User } from '@prisma/client';
import { NotificationType } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PadletAccessService } from '../padlet-access/padlet-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

export interface CommentResponseDto {
  id: string;
  postId: string;
  authorUsername: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
}

type CommentWithAuthor = Comment & { user: User };

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly padletAccess: PadletAccessService,
    private readonly notificationService: NotificationService,
  ) {}

  async listComments(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
  ): Promise<CommentResponseDto[]> {
    const requesterId = this.parseId(userId);
    const padletId = this.parseId(padletIdRaw);
    const postId = this.parseId(postIdRaw);

    await this.padletAccess.assertCanView(requesterId, padletId);
    await this.findPostInPadlet(padletId, postId);

    const comments = await this.prisma.comment.findMany({
      where: { post_id: postId },
      include: { user: true },
      orderBy: { created_at: 'asc' },
    });

    return comments.map((comment) => this.toCommentResponse(comment));
  }

  async createComment(
    userId: string,
    actorUsername: string,
    padletIdRaw: string,
    postIdRaw: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const authorId = this.parseId(userId);
    const padletId = this.parseId(padletIdRaw);
    const postId = this.parseId(postIdRaw);

    await this.padletAccess.assertCanComment(authorId, padletId);
    const post = await this.findPostInPadlet(padletId, postId);

    const now = new Date();
    const comment = await this.prisma.comment.create({
      data: {
        post_id: postId,
        user_id: authorId,
        body: dto.body.trim(),
        created_at: now,
        updated_at: now,
      },
      include: { user: true },
    });

    if (post.user_id !== authorId) {
      void this.notificationService.create({
        userId: post.user_id,
        type: NotificationType.comment,
        actorUsername,
        padletId,
        postId,
      });
    }

    return this.toCommentResponse(comment);
  }

  async updateComment(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
    commentIdRaw: string,
    dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const requesterId = this.parseId(userId);
    const padletId = this.parseId(padletIdRaw);
    const postId = this.parseId(postIdRaw);
    const commentId = this.parseId(commentIdRaw);

    await this.padletAccess.assertCanComment(requesterId, padletId);
    await this.findPostInPadlet(padletId, postId);

    const comment = await this.prisma.comment.findFirst({
      where: {
        comment_id: commentId,
        post_id: postId,
      },
    });

    if (!comment) {
      throw new NotFoundException('התגובה לא נמצאה');
    }

    if (comment.user_id !== requesterId) {
      throw new ForbiddenException('אין הרשאה לערוך תגובה זו');
    }

    const updated = await this.prisma.comment.update({
      where: { comment_id: commentId },
      data: {
        body: dto.body.trim(),
        updated_at: new Date(),
      },
      include: { user: true },
    });

    return this.toCommentResponse(updated);
  }

  async deleteComment(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
    commentIdRaw: string,
  ): Promise<void> {
    const requesterId = this.parseId(userId);
    const padletId = this.parseId(padletIdRaw);
    const postId = this.parseId(postIdRaw);
    const commentId = this.parseId(commentIdRaw);

    await this.padletAccess.assertCanComment(requesterId, padletId);
    await this.findPostInPadlet(padletId, postId);

    const comment = await this.prisma.comment.findFirst({
      where: {
        comment_id: commentId,
        post_id: postId,
      },
    });

    if (!comment) {
      throw new NotFoundException('התגובה לא נמצאה');
    }

    if (comment.user_id !== requesterId) {
      throw new ForbiddenException('אין הרשאה למחוק תגובה זו');
    }

    await this.prisma.comment.delete({
      where: { comment_id: commentId },
    });
  }

  private toCommentResponse(comment: CommentWithAuthor): CommentResponseDto {
    return {
      id: comment.comment_id.toString(),
      postId: comment.post_id.toString(),
      authorUsername: comment.user.username,
      body: comment.body,
      createdAt: comment.created_at.toISOString(),
      updatedAt: comment.updated_at?.toISOString() ?? null,
    };
  }

  private async findPostInPadlet(
    padletId: bigint,
    postId: bigint,
  ): Promise<{ user_id: bigint }> {
    const post = await this.prisma.post.findFirst({
      where: {
        post_id: postId,
        padlet_id: padletId,
      },
      select: { user_id: true },
    });

    if (!post) {
      throw new NotFoundException('הפוסט לא נמצא');
    }

    return post;
  }

  private parseId(raw: string): bigint {
    try {
      return BigInt(raw);
    } catch {
      throw new BadRequestException('Invalid ID format');
    }
  }
}
