import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostContentKind, type Post, type User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export type PostLayoutDto = {
  x: number;
  y: number;
};

export interface PostResponseDto {
  id: string;
  padletId: string;
  authorUsername: string;
  title: string | null;
  subject: string | null;
  color: string | null;
  layout: PostLayoutDto | null;
  createdAt: string;
}

type PostWithAuthor = Post & { user: User };

const POSTS_PER_ROW = 3;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(
    userId: string,
    padletIdRaw: string,
    dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const authorId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    await this.assertPadletAccess(authorId, padletId);

    const existingCount = await this.prisma.post.count({
      where: { padlet_id: padletId },
    });

    const { contentKind, title, subject } = this.mapPostContent(dto);
    const now = new Date();

    const post = await this.prisma.post.create({
      data: {
        padlet_id: padletId,
        user_id: authorId,
        content_kind: contentKind,
        title,
        subject,
        color: dto.color ?? null,
        data_layout: this.buildLayout(existingCount),
        created_at: now,
        updated_at: now,
      },
      include: { user: true },
    });

    await this.touchPadlet(padletId, now);

    return this.toPostResponse(post);
  }

  async updatePost(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
    dto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    const existingPost = await this.findPostForUser(
      requesterId,
      padletId,
      postId,
    );

    this.assertPostAuthor(existingPost, requesterId);

    const { contentKind, title, subject } = this.mapPostContent(dto);
    const now = new Date();

    const post = await this.prisma.post.update({
      where: { post_id: postId },
      data: {
        content_kind: contentKind,
        title,
        subject,
        color: dto.color ?? null,
        updated_at: now,
      },
      include: { user: true },
    });

    await this.touchPadlet(padletId, now);

    return this.toPostResponse(post);
  }

  async deletePost(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
  ): Promise<void> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    const existingPost = await this.findPostForUser(
      requesterId,
      padletId,
      postId,
    );

    this.assertPostAuthor(existingPost, requesterId);

    const now = new Date();

    await this.prisma.post.delete({
      where: { post_id: postId },
    });

    await this.touchPadlet(padletId, now);
  }

  toPostResponse(post: PostWithAuthor): PostResponseDto {
    return {
      id: post.post_id.toString(),
      padletId: post.padlet_id.toString(),
      authorUsername: post.user.username,
      title: post.title,
      subject: post.subject,
      color: post.color,
      layout: post.data_layout
        ? (post.data_layout as unknown as PostLayoutDto)
        : null,
      createdAt: post.created_at.toISOString(),
    };
  }

  private async assertPadletAccess(
    userId: bigint,
    padletId: bigint,
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
  }

  private async findPostForUser(
    userId: bigint,
    padletId: bigint,
    postId: bigint,
  ): Promise<PostWithAuthor> {
    await this.assertPadletAccess(userId, padletId);

    const post = await this.prisma.post.findFirst({
      where: {
        post_id: postId,
        padlet_id: padletId,
      },
      include: { user: true },
    });

    if (!post) {
      throw new NotFoundException('הפוסט לא נמצא');
    }

    return post;
  }

  private assertPostAuthor(post: Post, requesterId: bigint): void {
    if (post.user_id !== requesterId) {
      throw new ForbiddenException('אין הרשאה לערוך או למחוק פוסט זה');
    }
  }

  private async touchPadlet(padletId: bigint, updatedAt: Date): Promise<void> {
    await this.prisma.padlet.update({
      where: { padlet_id: padletId },
      data: { updated_at: updatedAt },
    });
  }

  private buildLayout(existingCount: number): PostLayoutDto {
    return {
      x: 8 + (existingCount % POSTS_PER_ROW) * 26,
      y: 12 + Math.floor(existingCount / POSTS_PER_ROW) * 20,
    };
  }

  private mapPostContent(dto: CreatePostDto | UpdatePostDto): {
    contentKind: PostContentKind;
    title: string | null;
    subject: string | null;
  } {
    switch (dto.content_kind) {
      case 'image':
        return {
          contentKind: PostContentKind.attachment,
          title: 'תמונה',
          subject: dto.image_file_name ?? null,
        };
      case 'link':
        return {
          contentKind: PostContentKind.attachment,
          title: 'קישור',
          subject: dto.content ?? null,
        };
      case 'poll':
        return {
          contentKind: PostContentKind.poll,
          title: dto.content ?? null,
          subject: 'סקר',
        };
      case 'text':
      default:
        return {
          contentKind: PostContentKind.none,
          title: null,
          subject: dto.content ?? null,
        };
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
