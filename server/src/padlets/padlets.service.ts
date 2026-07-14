import { Injectable, NotFoundException } from '@nestjs/common';
import { PadletBoardType, PadletPermission, type Padlet } from '@prisma/client';
import { RealtimeGateway } from '../gateway/realtime.gateway';
import { PadletAccessService } from '../padlet-access/padlet-access.service';
import { PostsService, type PostResponseDto, type PostWithAuthor } from '../posts/posts.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CopyPadletDto,
  CreatePadletDto,
  UpdatePadletDto,
} from './dto/create-padlet.dto';
import { GetPadletDetailQueryDto } from './dto/padlet-filter.dto';
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
  ownerUsername: string;
  createdAt: string;
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

type PadletWithCount = Padlet & { _count: { posts: number }; user: { username: string } };

@Injectable()
export class PadletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly padletAccess: PadletAccessService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async getBoards(userId: string): Promise<PadletBoardsResponseDto> {
    const ownerId = this.parseId(userId, 'משתמש לא נמצא');

    const [mine, shared] = await Promise.all([
      this.prisma.padlet.findMany({
        where: { user_id: ownerId },
        include: { _count: { select: { posts: true } }, user: { select: { username: true } } },
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.padlet.findMany({
        where: { participants: { some: { user_id: ownerId } } },
        include: { _count: { select: { posts: true } }, user: { select: { username: true } } },
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
      include: { _count: { select: { posts: true } }, user: { select: { username: true } } },
    });

    return this.toPadletResponse(padlet, false);
  }

  async updatePadlet(
    userId: string,
    padletIdRaw: string,
    dto: UpdatePadletDto,
  ): Promise<PadletResponseDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    const access = await this.padletAccess.assertCanEditPadlet(requesterId, padletId);

    const updated = await this.prisma.padlet.update({
      where: { padlet_id: padletId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
        ...(dto.background !== undefined ? { background: dto.background } : {}),
        ...(dto.board_type !== undefined ? { board_type: dto.board_type } : {}),
        updated_at: new Date(),
      },
      include: { _count: { select: { posts: true } }, user: { select: { username: true } } },
    });

    const response = this.toPadletResponse(updated, !access.isOwner);
    this.realtimeGateway.broadcastToPadlet(padletId, 'padlet:updated', response);
    return response;
  }

  async getPadletDetail(
    userId: string,
    padletIdRaw: string,
    query: GetPadletDetailQueryDto = {},
  ): Promise<PadletDetailResponseDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    const access = await this.padletAccess.assertCanView(requesterId, padletId);

    const postWhere = {
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search } },
              { subject: { contains: query.search } },
            ],
          }
        : {}),
      ...(query.author
        ? { user: { username: { contains: query.author } } }
        : {}),
    };

    const padlet = await this.prisma.padlet.findUnique({
      where: { padlet_id: padletId },
      include: {
        _count: { select: { posts: true } },
        user: { select: { username: true } },
        posts: {
          where: Object.keys(postWhere).length ? postWhere : undefined,
          include: {
            user: true,
            attachment: true,
            poll: {
              include: {
                poll_options: {
                  include: { poll_votes: true },
                  orderBy: { sort_order: 'asc' as const },
                },
                poll_votes: true,
              },
            },
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!padlet) throw new NotFoundException('הלוח לא נמצא');

    return {
      padlet: this.toPadletResponse(padlet, !access.isOwner),
      posts: padlet.posts.map((post) =>
        this.postsService.toPostResponse(post as PostWithAuthor, requesterId),
      ),
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

    this.realtimeGateway.broadcastToPadlet(padletId, 'padlet:permission-changed', {
      defaultPermission: updated.default_permission,
    });
    return { defaultPermission: updated.default_permission };
  }

  async deletePadlet(userId: string, padletIdRaw: string): Promise<void> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    await this.padletAccess.assertCanDeletePadlet(requesterId, padletId);

    this.realtimeGateway.broadcastToPadlet(padletId, 'padlet:deleted', {});

    await this.prisma.postAttachment.deleteMany({ where: { post: { padlet_id: padletId } } });
    await this.prisma.post.deleteMany({ where: { padlet_id: padletId } });
    await this.prisma.notification.deleteMany({ where: { padlet_id: padletId } });
    await this.prisma.participant.deleteMany({ where: { padlet_id: padletId } });
    await this.prisma.padletVisit.deleteMany({ where: { padlet_id: padletId } });
    await this.prisma.padlet.delete({ where: { padlet_id: padletId } });
  }

  async copyPadlet(
    userId: string,
    padletIdRaw: string,
    dto: CopyPadletDto,
  ): Promise<PadletResponseDto> {
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
    const freeWallOrders: number[] = [];

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
                create: original.posts.map((p) => {
                  const layout =
                    original.board_type === PadletBoardType.free_wall
                      ? this.postsService.buildFreeWallOrder(freeWallOrders)
                      : null;

                  if (layout) {
                    freeWallOrders.push(layout.order);
                  }

                  return {
                    user_id: ownerId,
                    content_kind: p.content_kind,
                    title: p.title,
                    subject: p.subject,
                    color: p.color,
                    data_layout: layout ? this.postsService.toJsonLayout(layout) : null,
                    created_at: now,
                    updated_at: now,
                  };
                }),
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
      include: { _count: { select: { posts: true } }, user: { select: { username: true } } },
    });

    return this.toPadletResponse(copy as PadletWithCount, false);
  }

  private toPadletResponse(
    padlet: PadletWithCount,
    isShared: boolean,
  ): PadletResponseDto {
    return {
      id: padlet.padlet_id,
      title: padlet.title,
      description: padlet.description,
      boardType: padlet.board_type,
      background: padlet.background,
      postCount: padlet._count.posts,
      isShared,
      updatedAt: padlet.updated_at.toISOString(),
      ownerUsername: padlet.user.username,
      createdAt: padlet.created_at.toISOString(),
    };
  }

  private parseId(raw: string, errorMessage: string): string {
    if (!/^[0-9a-f]{24}$/i.test(raw)) {
      throw new NotFoundException(errorMessage);
    }
    return raw;
  }
}
