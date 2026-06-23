import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PadletBoardType,
  PostContentKind,
  Prisma,
} from '@prisma/client';
import { PadletAccessService } from '../padlet-access/padlet-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostContentInputDto } from './dto/post-content-input.dto';
import { PostLayoutDto } from './dto/post-layout.dto';
import { UpdatePostLayoutDto } from './dto/update-post-layout.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export type { PostLayoutDto };

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

type PostWithAuthor = Prisma.PostGetPayload<{ include: { user: true } }>;

const FREE_WALL_COLUMNS = 3;
const GRID_COLUMNS = 4;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly padletAccess: PadletAccessService,
  ) {}

  async createPost(
    userId: string,
    padletIdRaw: string,
    dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const authorId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    const padlet = await this.padletAccess.assertCanCreatePost(authorId, padletId);

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
        data_layout: this.toJsonLayout(
          this.buildLayout(padlet.boardType, existingCount),
        ),
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

    await this.padletAccess.assertCanEditPost(
      requesterId,
      padletId,
      existingPost.user_id,
    );

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

  async updatePostLayout(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
    dto: UpdatePostLayoutDto,
  ): Promise<PostResponseDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    const existingPost = await this.findPostForUser(
      requesterId,
      padletId,
      postId,
    );

    await this.padletAccess.assertCanEditPost(
      requesterId,
      padletId,
      existingPost.user_id,
    );

    const now = new Date();

    const post = await this.prisma.post.update({
      where: { post_id: postId },
      data: {
        data_layout: this.toJsonLayout(dto),
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
  ): Promise<PostResponseDto[]> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    const existingPost = await this.findPostForUser(
      requesterId,
      padletId,
      postId,
    );

    await this.padletAccess.assertCanDeletePost(
      requesterId,
      padletId,
      existingPost.user_id,
    );

    const padlet = await this.padletAccess.assertCanView(requesterId, padletId);
    const now = new Date();

    await this.prisma.post.delete({
      where: { post_id: postId },
    });

    if (padlet.boardType !== PadletBoardType.free_wall) {
      await this.reindexPostLayouts(padletId, padlet.boardType);
    }

    await this.touchPadlet(padletId, now);

    return this.getPadletPosts(padletId);
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

  private async findPostForUser(
    userId: bigint,
    padletId: bigint,
    postId: bigint,
  ): Promise<PostWithAuthor> {
    await this.padletAccess.assertCanView(userId, padletId);

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

  private async getPadletPosts(padletId: bigint): Promise<PostResponseDto[]> {
    const posts = await this.prisma.post.findMany({
      where: { padlet_id: padletId },
      include: { user: true },
      orderBy: { created_at: 'asc' },
    });

    return posts.map((post) => this.toPostResponse(post));
  }

  private async touchPadlet(padletId: bigint, updatedAt: Date): Promise<void> {
    await this.prisma.padlet.update({
      where: { padlet_id: padletId },
      data: { updated_at: updatedAt },
    });
  }

  private async reindexPostLayouts(
    padletId: bigint,
    boardType: PadletBoardType,
  ): Promise<void> {
    const posts = await this.prisma.post.findMany({
      where: { padlet_id: padletId },
      orderBy: { created_at: 'asc' },
      select: { post_id: true },
    });

    await Promise.all(
      posts.map((post, index) =>
        this.prisma.post.update({
          where: { post_id: post.post_id },
          data: {
            data_layout: this.toJsonLayout(
              this.buildLayout(boardType, index),
            ),
          },
        }),
      ),
    );
  }

  buildLayout(boardType: PadletBoardType, index: number): PostLayoutDto {
    switch (boardType) {
      case PadletBoardType.brainstorming:
        return {
          x: 6 + (index % 3) * 30,
          y: 8 + index * 14,
        };
      case PadletBoardType.grid:
        return {
          x: index % GRID_COLUMNS,
          y: Math.floor(index / GRID_COLUMNS),
        };
      case PadletBoardType.timeline:
        return {
          x: index,
          y: 0,
        };
      case PadletBoardType.free_wall:
      default:
        return {
          x: 8 + (index % FREE_WALL_COLUMNS) * 26,
          y: 12 + Math.floor(index / FREE_WALL_COLUMNS) * 20,
        };
    }
  }

  private toJsonLayout(layout: PostLayoutDto): Prisma.InputJsonValue {
    return { x: layout.x, y: layout.y };
  }

  private mapPostContent(dto: PostContentInputDto): {
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
