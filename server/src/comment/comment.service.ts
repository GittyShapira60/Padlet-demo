import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Comment, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

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
  constructor(private readonly prisma: PrismaService) {}

  async listComments(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
  ): Promise<CommentResponseDto[]> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    await this.assertPostInPadlet(requesterId, padletId, postId);

    const comments = await this.prisma.comment.findMany({
      where: { post_id: postId },
      include: { user: true },
      orderBy: { created_at: 'asc' },
    });

    return comments.map((comment) => this.toCommentResponse(comment));
  }

  async createComment(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const authorId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    await this.assertPostInPadlet(authorId, padletId, postId);

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

    return this.toCommentResponse(comment);
  }

  async deleteComment(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
    commentIdRaw: string,
  ): Promise<void> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');
    const commentId = this.parseId(commentIdRaw, 'התגובה לא נמצאה');

    await this.assertPostInPadlet(requesterId, padletId, postId);

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

  private async assertPostInPadlet(
    userId: bigint,
    padletId: bigint,
    postId: bigint,
  ): Promise<void> {
    const padlet = await this.prisma.padlet.findFirst({
      where: {
        padlet_id: padletId,
        OR: [
          { user_id: userId },
          { participants: { some: { user_id: userId } } },
        ],
      },
      select: { padlet_id: true },
    });

    if (!padlet) {
      throw new NotFoundException('הלוח לא נמצא');
    }

    const post = await this.prisma.post.findFirst({
      where: {
        post_id: postId,
        padlet_id: padletId,
      },
      select: { post_id: true },
    });

    if (!post) {
      throw new NotFoundException('הפוסט לא נמצא');
    }
  }

  private parseId(raw: string, errorMessage: string): bigint {
    try {
      return BigInt(raw);
    } catch {
      throw new NotFoundException(errorMessage);
    }
  }
}
