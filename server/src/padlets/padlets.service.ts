import { Injectable, NotFoundException } from '@nestjs/common';
import { PadletBoardType, PadletPermission, type Padlet } from '@prisma/client';
import { PadletAccessService } from '../padlet-access/padlet-access.service';
import { PostsService, type PostResponseDto } from '../posts/posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CopyPadletDto, CreatePadletDto } from './dto/create-padlet.dto';
import { UpdatePadletDefaultPermissionDto } from './dto/update-padlet-default-permission.dto';

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
  currentUserPermission: PadletPermission;
  defaultPermission: PadletPermission | null;
}

type PadletWithCount = Padlet & { _count: { posts: number } };

const POSTS_PER_ROW = 3;

@Injectable()
export class PadletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly padletAccess: PadletAccessService,
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

  async createPadlet(userId: string, dto: CreatePadletDto): Promise<PadletResponseDto> {
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

  async getPadletDetail(userId: string, padletIdRaw: string): Promise<PadletDetailResponseDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    const access = await this.padletAccess.assertCanView(requesterId, padletId);

    const padlet = await this.prisma.padlet.findUnique({
      where: { padlet_id: padletId },
      include: {
        _count: { select: { posts: true } },
        posts: {
          include: { user: true },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!padlet) throw new NotFoundException('הלוח לא נמצא');

    return {
      padlet: this.toPadletResponse(padlet, !access.isOwner),
      posts: padlet.posts.map((post) => this.postsService.toPostResponse(post)),
      currentUserPermission: access.permission,
      defaultPermission: access.defaultPermission,
    };
  }

  async updateDefaultPermission(
    userId: string,
    padletIdRaw: string,
    dto: UpdatePadletDefaultPermissionDto,
  ): Promise<{ defaultPermission: PadletPermission | null }> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    await this.padletAccess.assertCanManageSharing(requesterId, padletId);

    const updated = await this.prisma.padlet.update({
      where: { padlet_id: padletId },
      data: {
        default_permission: dto.default_permission,
        updated_at: new Date(),
      },
      select: { default_permission: true },
    });

    return { defaultPermission: updated.default_permission };
  }

  async deletePadlet(userId: string, padletIdRaw: string): Promise<void> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    await this.padletAccess.assertCanDeletePadlet(requesterId, padletId);

  await this.prisma.post.deleteMany({ where: { padlet_id: padletId } });
  await this.prisma.participant.deleteMany({ where: { padlet_id: padletId } });
  await this.prisma.padlet.delete({ where: { padlet_id: padletId } });
}

  // async deletePadlet(userId: string, padletIdRaw: string): Promise<void> {
  //   const ownerId = this.parseId(userId, 'משתמש לא נמצא');
  //   const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

  //   const padlet = await this.prisma.padlet.findUnique({
  //     where: { padlet_id: padletId },
  //   });

  //   if (!padlet) throw new NotFoundException('הלוח לא נמצא');
  //   if (padlet.user_id !== ownerId) throw new ForbiddenException('רק הבעלים יכול למחוק את הלוח');

  //   await this.prisma.padlet.delete({ where: { padlet_id: padletId } });
  // }

  async copyPadlet(userId: string, padletIdRaw: string, dto: CopyPadletDto): Promise<PadletResponseDto> {
    const ownerId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    await this.padletAccess.assertCanView(ownerId, padletId);

    const original = await this.prisma.padlet.findUnique({
      where: { padlet_id: padletId },
      include: {
        posts: dto.includePosts ? { where: { user_id: ownerId } } : false,
        participants: dto.includeParticipants ? true : false,
      },
    });

    if (!original) throw new NotFoundException('הלוח לא נמצא');

    const now = new Date();

    const copy = await this.prisma.padlet.create({
      data: {
        user_id: ownerId,
        board_type: original.board_type,
        title: `${original.title} (עותק)`,
        description: original.description,
        background: original.background,
        created_at: now,
        updated_at: now,
        ...(dto.includePosts && original.posts?.length
          ? {
              posts: {
                create: original.posts.map((p, i) => ({
                  user_id: ownerId,
                  content_kind: p.content_kind,
                  title: p.title,
                  subject: p.subject,
                  color: p.color,
                  data_layout: this.buildLayout(i),
                  created_at: now,
                  updated_at: now,
                })),
              },
            }
          : {}),
        ...(dto.includeParticipants && original.participants?.length
          ? {
              participants: {
                create: original.participants.map((p) => ({
                  user_id: p.user_id,
                  permission: p.permission as PadletPermission,
                })),
              },
            }
          : {}),
      },
      include: { _count: { select: { posts: true } } },
    });

    return this.toPadletResponse(copy, false);
  }

  private buildLayout(index: number) {
    return {
      x: 8 + (index % POSTS_PER_ROW) * 26,
      y: 12 + Math.floor(index / POSTS_PER_ROW) * 20,
    };
  }

  private toPadletResponse(padlet: PadletWithCount, isShared: boolean): PadletResponseDto {
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