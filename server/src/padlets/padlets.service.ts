import { Injectable, NotFoundException } from '@nestjs/common';
import { PadletBoardType, type Padlet } from '@prisma/client';
import { PostsService, type PostResponseDto } from '../posts/posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePadletDto } from './dto/create-padlet.dto';

export interface PadletResponseDto {
  id: string;
  title: string;
  description: string | null;
  boardType: PadletBoardType;
  background: string | null;
  postCount: number;
  isShared: boolean;
  updatedAt: string;
}

export interface PadletBoardsResponseDto {
  mine: PadletResponseDto[];
  shared: PadletResponseDto[];
}

export interface PadletDetailResponseDto {
  padlet: PadletResponseDto;
  posts: PostResponseDto[];
}

type PadletWithCount = Padlet & { _count: { posts: number } };

@Injectable()
export class PadletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
  ) {}

  async getBoards(userId: string): Promise<PadletBoardsResponseDto> {
    const ownerId = this.parseId(userId, 'משתמש לא נמצא');

    const [mine, shared] = await Promise.all([
      this.prisma.padlet.findMany({
        where: { user_id: ownerId },
        include: { _count: { select: { posts: true } } },
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.padlet.findMany({
        where: { participants: { some: { user_id: ownerId } } },
        include: { _count: { select: { posts: true } } },
        orderBy: { updated_at: 'desc' },
      }),
    ]);

    return {
      mine: mine.map((padlet) => this.toPadletResponse(padlet, false)),
      shared: shared.map((padlet) => this.toPadletResponse(padlet, true)),
    };
  }

  async createPadlet(
    userId: string,
    dto: CreatePadletDto,
  ): Promise<PadletResponseDto> {
    const ownerId = this.parseId(userId, 'משתמש לא נמצא');
    const now = new Date();

    const padlet = await this.prisma.padlet.create({
      data: {
        user_id: ownerId,
        board_type: dto.board_type,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        background: dto.background ?? null,
        created_at: now,
        updated_at: now,
      },
      include: { _count: { select: { posts: true } } },
    });

    return this.toPadletResponse(padlet, false);
  }

  async getPadletDetail(
    userId: string,
    padletIdRaw: string,
  ): Promise<PadletDetailResponseDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    const padlet = await this.prisma.padlet.findFirst({
      where: {
        padlet_id: padletId,
        OR: [
          { user_id: requesterId },
          { participants: { some: { user_id: requesterId } } },
        ],
      },
      include: {
        _count: { select: { posts: true } },
        posts: {
          include: {
            user: true,
            poll: {
              include: {
                poll_options: {
                  include: { poll_votes: true },
                  orderBy: { sort_order: 'asc' },
                },
                poll_votes: true,
              },
            },
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!padlet) {
      throw new NotFoundException('הלוח לא נמצא');
    }

    return {
      padlet: this.toPadletResponse(padlet, padlet.user_id !== requesterId),
      posts: padlet.posts.map((post) =>
        this.postsService.toPostResponse(post as any, requesterId),
      ),
    };
  }

  private toPadletResponse(
    padlet: PadletWithCount,
    isShared: boolean,
  ): PadletResponseDto {
    return {
      id: padlet.padlet_id.toString(),
      title: padlet.title,
      description: padlet.description,
      boardType: padlet.board_type,
      background: padlet.background,
      postCount: padlet._count.posts,
      isShared,
      updatedAt: padlet.updated_at.toISOString(),
    };
  }

  private parseId(raw: string, errorMessage: string): bigint {
    try {
      return BigInt(raw);
    } catch {
      throw new NotFoundException(errorMessage);
    }
  }
}
