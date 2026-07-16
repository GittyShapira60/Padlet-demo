import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationType,
  PadletBoardType,
  PostContentKind,
  Prisma,
  type Poll,
  type PollOption,
  type PollVote,
} from '@prisma/client';
import { RealtimeGateway } from '../gateway/realtime.gateway';
import { NotificationService } from '../notification/notification.service';
import { PadletAccessService } from '../padlet-access/padlet-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostContentInputDto } from './dto/post-content-input.dto';
import { PostLayoutDto } from './dto/post-layout.dto';
import { SwapPostsDto } from './dto/swap-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export type { PostLayoutDto };

export interface PollOptionResponseDto {
  id: string;
  label: string;
  sortOrder: number;
  voteCount: number;
}

export interface PollResponseDto {
  id: string;
  question: string;
  options: PollOptionResponseDto[];
  totalVotes: number;
  userVotedOptionId: string | null;
}

export type PostType = 'text' | 'image' | 'link' | 'poll';

export interface PostResponseDto {
  id: string;
  padletId: string;
  authorUsername: string;
  postType: PostType;
  title: string | null;
  subject: string | null;
  description: string | null;
  color: string | null;
  layout: PostLayoutDto | null;
  createdAt: string;
  poll: PollResponseDto | null;
  imageUrl: string | null;
}

type PollWithOptionsAndVotes = Poll & {
  poll_options: (PollOption & { poll_votes: PollVote[] })[];
  poll_votes: PollVote[];
};

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    user: true;
    attachment: true;
    poll: {
      include: {
        poll_options: { include: { poll_votes: true } };
        poll_votes: true;
      };
    };
  };
}>;

const FREE_WALL_ORDER_START = 0;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly padletAccess: PadletAccessService,
    private readonly notificationService: NotificationService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly storageService: StorageService,
  ) {}

  async createPost(
    userId: string,
    actorUsername: string,
    padletIdRaw: string,
    dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const authorId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    const access = await this.padletAccess.assertCanCreatePost(authorId, padletId);

    const { contentKind, title, subject } = this.mapPostContent(dto);
    const now = new Date();

    const dataLayout =
      access.boardType === PadletBoardType.free_wall
        ? await this.buildFreeWallOrderForPadlet(padletId)
        : null;

    const imageUrl =
      dto.content_kind === 'image' && dto.image_data
        ? await this.storageService.uploadImage(dto.image_data)
        : null;

    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          padlet_id: padletId,
          user_id: authorId,
          content_kind: contentKind,
          post_type: dto.content_kind,
          title,
          subject,
          description: dto.description ?? null,
          color: dto.color ?? null,
          data_layout: dataLayout ? this.toJsonLayout(dataLayout) : null,
          created_at: now,
          updated_at: now,
        },
        include: {
          user: true,
          attachment: true,
          poll: {
            include: {
              poll_options: { include: { poll_votes: true }, orderBy: { sort_order: 'asc' } },
              poll_votes: true,
            },
          },
        },
      });

      if (imageUrl) {
        await tx.postAttachment.create({
          data: {
            post_id: created.post_id,
            attachment_type: 'picture',
            attachment_data: imageUrl,
          },
        });
      }

      if (
        dto.content_kind === 'poll' &&
        dto.content &&
        dto.poll_answers &&
        dto.poll_answers.length >= 2
      ) {
        await tx.poll.create({
          data: {
            post_id: created.post_id,
            question: dto.content,
            poll_options: {
              create: dto.poll_answers
                .filter((label) => label.trim().length > 0)
                .map((label, index) => ({
                  label: label.trim(),
                  sort_order: index,
                })),
            },
          },
        });
      }

      return created;
    });

    await this.recordPostVisit(padletId, authorId, dto.visit_id, now).catch(() => {});

    await this.touchPadlet(padletId, now);

    void this.notifyPadletMembers(padletId, authorId, actorUsername, post.post_id);

    const postWithPoll = await this.findPostWithPoll(post.post_id);
    const postResponse = this.toPostResponse(postWithPoll, authorId);
    this.realtimeGateway.broadcastToPadlet(padletId, 'post:created', postResponse);
    return postResponse;
  }

  private async notifyPadletMembers(
    padletId: string,
    authorId: string,
    actorUsername: string,
    postId: string,
  ): Promise<void> {
    const padletWithMembers = await this.prisma.padlet.findUnique({
      where: { padlet_id: padletId },
      select: {
        user_id: true,
        participants: { select: { user_id: true } },
      },
    });

    if (!padletWithMembers) return;

    const recipientIds = [
      padletWithMembers.user_id,
      ...padletWithMembers.participants.map((p: { user_id: string }) => p.user_id),
    ].filter((id) => id !== authorId);

    await Promise.all(
      recipientIds.map((recipientId) =>
        this.notificationService.create({
          userId: recipientId,
          type: NotificationType.new_post,
          actorUsername,
          padletId,
          postId,
        }),
      ),
    );
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

    await this.prisma.post.update({
      where: { post_id: postId },
      data: {
        content_kind: contentKind,
        post_type: dto.content_kind,
        title,
        subject,
        description: dto.description ?? null,
        color: dto.color ?? null,
        updated_at: now,
      },
      include: { user: true },
    });

    if (dto.content_kind === 'image' && dto.image_data) {
      const imageUrl = await this.storageService.uploadImage(dto.image_data);
      await this.prisma.postAttachment.upsert({
        where: { post_id: postId },
        create: {
          post_id: postId,
          attachment_type: 'picture',
          attachment_data: imageUrl,
        },
        update: { attachment_data: imageUrl },
      });
    }

    if (dto.content_kind === 'poll' && dto.content) {
      const existingPoll = await this.prisma.poll.findUnique({
        where: { post_id: postId },
      });

      if (existingPoll) {
        await this.prisma.pollVote.deleteMany({ where: { poll_id: existingPoll.poll_id } });
        await this.prisma.pollOption.deleteMany({ where: { poll_id: existingPoll.poll_id } });
        await this.prisma.poll.update({
          where: { poll_id: existingPoll.poll_id },
          data: {
            question: dto.content,
            poll_options: {
              create: (dto.poll_answers ?? [])
                .filter((label) => label.trim().length > 0)
                .map((label, index) => ({
                  label: label.trim(),
                  sort_order: index,
                })),
            },
          },
        });
      } else if (dto.poll_answers && dto.poll_answers.length >= 2) {
        await this.prisma.poll.create({
          data: {
            post_id: postId,
            question: dto.content,
            poll_options: {
              create: dto.poll_answers
                .filter((label) => label.trim().length > 0)
                .map((label, index) => ({
                  label: label.trim(),
                  sort_order: index,
                })),
            },
          },
        });
      }
    }

    await this.touchPadlet(padletId, now);

    const postWithPoll = await this.findPostWithPoll(postId);
    const postResponse = this.toPostResponse(postWithPoll, requesterId);
    this.realtimeGateway.broadcastToPadlet(padletId, 'post:updated', postResponse);
    return postResponse;
  }

  async swapPostPositions(
    userId: string,
    padletIdRaw: string,
    dto: SwapPostsDto,
  ): Promise<{ source: PostResponseDto; target: PostResponseDto }> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const sourcePostId = this.parseId(dto.sourcePostId, 'הפוסט לא נמצא');
    const targetPostId = this.parseId(dto.targetPostId, 'הפוסט לא נמצא');

    if (sourcePostId === targetPostId) {
      throw new BadRequestException('לא ניתן להחליף פוסט עם עצמו');
    }

    const padlet = await this.padletAccess.assertCanView(requesterId, padletId);

    if (padlet.boardType !== PadletBoardType.free_wall) {
      throw new BadRequestException('החלפת מיקום פוסטים זמינה רק בלוח קיר חופשי');
    }

    const sourcePost = await this.findPostForUser(requesterId, padletId, sourcePostId);
    const targetPost = await this.findPostForUser(requesterId, padletId, targetPostId);

    await this.padletAccess.assertCanEditPost(
      requesterId,
      padletId,
      sourcePost.user_id,
    );

    await this.ensureFreeWallOrders(padletId);

    const refreshedSource = await this.findPostForUser(requesterId, padletId, sourcePostId);
    const refreshedTarget = await this.findPostForUser(requesterId, padletId, targetPostId);

    const sourceOrder = this.resolveFreeWallOrder(refreshedSource.data_layout);
    const targetOrder = this.resolveFreeWallOrder(refreshedTarget.data_layout);
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.post.update({
        where: { post_id: sourcePostId },
        data: {
          data_layout: this.toJsonLayout({ order: targetOrder }),
          updated_at: now,
        },
      }),
      this.prisma.post.update({
        where: { post_id: targetPostId },
        data: {
          data_layout: this.toJsonLayout({ order: sourceOrder }),
          updated_at: now,
        },
      }),
    ]);

    await this.touchPadlet(padletId, now);

    const sourceResponse = this.toPostResponse(
      await this.findPostWithPoll(sourcePostId),
      requesterId,
    );
    const targetResponse = this.toPostResponse(
      await this.findPostWithPoll(targetPostId),
      requesterId,
    );

    this.realtimeGateway.broadcastToPadlet(padletId, 'post:updated', sourceResponse);
    this.realtimeGateway.broadcastToPadlet(padletId, 'post:updated', targetResponse);

    return { source: sourceResponse, target: targetResponse };
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

    await this.padletAccess.assertCanView(requesterId, padletId);
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { post_id: postId } }),
      this.prisma.notification.deleteMany({ where: { post_id: postId } }),
      this.prisma.post.delete({ where: { post_id: postId } }),
    ]);

    await this.touchPadlet(padletId, now);

    this.realtimeGateway.broadcastToPadlet(padletId, 'post:deleted', { postId: postIdRaw });
    return this.getPadletPosts(padletId, requesterId);
  }

  async deletePoll(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
  ): Promise<PostResponseDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    const existingPost = await this.findPostForUser(requesterId, padletId, postId);

    await this.padletAccess.assertCanDeletePost(requesterId, padletId, existingPost.user_id);

    if (!existingPost.poll) throw new NotFoundException('הסקר לא נמצא');

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.notification.deleteMany({ where: { post_id: postId } }),
      this.prisma.poll.delete({ where: { post_id: postId } }),
      this.prisma.post.update({
        where: { post_id: postId },
        data: { content_kind: PostContentKind.none, post_type: null, title: null, subject: null, updated_at: now },
      }),
    ]);

    await this.touchPadlet(padletId, now);

    const postWithPoll = await this.findPostWithPoll(postId);
    const postResponse = this.toPostResponse(postWithPoll, requesterId);
    this.realtimeGateway.broadcastToPadlet(padletId, 'post:updated', postResponse);
    return postResponse;
  }

  async votePoll(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
    optionIdRaw: string,
  ): Promise<PostResponseDto> {
    const voterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');
    const optionId = this.parseId(optionIdRaw, 'אפשרות לא נמצאה');

    await this.padletAccess.assertCanReact(voterId, padletId);

    const poll = await this.prisma.poll.findFirst({
      where: { post_id: postId, post: { padlet_id: padletId } },
      include: { poll_options: true },
    });

    if (!poll) throw new NotFoundException('הסקר לא נמצא');

    const optionExists = poll.poll_options.some((o) => o.option_id === optionId);
    if (!optionExists) throw new NotFoundException('אפשרות לא נמצאה');

    await this.prisma.pollVote.upsert({
      where: { poll_id_user_id: { poll_id: poll.poll_id, user_id: voterId } },
      create: { poll_id: poll.poll_id, user_id: voterId, option_id: optionId },
      update: { option_id: optionId },
    });

    const postWithPoll = await this.findPostWithPoll(postId);
    const postResponse = this.toPostResponse(postWithPoll, voterId);
    this.realtimeGateway.broadcastToPadlet(padletId, 'post:updated', postResponse);
    return postResponse;
  }

  toPostResponse(post: PostWithAuthor, requesterId?: string): PostResponseDto {
    let pollData: PollResponseDto | null = null;

    if (post.poll) {
      const poll = post.poll as PollWithOptionsAndVotes;
      const totalVotes = poll.poll_votes.length;
      const userVote = requesterId
        ? poll.poll_votes.find((v) => v.user_id === requesterId)
        : null;

      pollData = {
        id: poll.poll_id,
        question: poll.question,
        totalVotes,
        userVotedOptionId: userVote ? userVote.option_id : null,
        options: poll.poll_options.map((opt) => ({
          id: opt.option_id,
          label: opt.label,
          sortOrder: opt.sort_order,
          voteCount: opt.poll_votes.length,
        })),
      };
    }

    const postType: PostType =
      (post.post_type as PostType | null) ??
      (post.poll ? 'poll'
        : post.attachment ? 'image'
        : post.content_kind === 'attachment' ? 'link'
        : 'text');

    return {
      id: post.post_id,
      padletId: post.padlet_id,
      authorUsername: post.user.username,
      postType,
      title: post.title,
      subject: post.subject,
      description: post.description ?? null,
      color: post.color,
      layout: post.data_layout
        ? this.normalizeFreeWallLayout(post.data_layout as unknown as PostLayoutDto)
        : null,
      createdAt: post.created_at.toISOString(),
      poll: pollData,
      imageUrl: post.attachment?.attachment_data ?? null,
    };
  }

  private async findPostWithPoll(
    postId: string,
  ): Promise<PostWithAuthor> {
    const post = await this.prisma.post.findUnique({
      where: { post_id: postId },
      include: {
        user: true,
        attachment: true,
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
    });

    if (!post) throw new NotFoundException('הפוסט לא נמצא');
    return post as PostWithAuthor;
  }

  private async findPostForUser(
    userId: string,
    padletId: string,
    postId: string,
  ): Promise<PostWithAuthor> {
    await this.padletAccess.assertCanView(userId, padletId);

    const post = await this.prisma.post.findFirst({
      where: { post_id: postId, padlet_id: padletId },
      include: {
        user: true,
        attachment: true,
        poll: {
          include: {
            poll_options: { include: { poll_votes: true }, orderBy: { sort_order: 'asc' } },
            poll_votes: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('הפוסט לא נמצא');
    return post as PostWithAuthor;
  }

  private async getPadletPosts(
    padletId: string,
    requesterId?: string,
  ): Promise<PostResponseDto[]> {
    const posts = await this.prisma.post.findMany({
      where: { padlet_id: padletId },
      include: {
        user: true,
        attachment: true,
        poll: {
          include: {
            poll_options: { include: { poll_votes: true }, orderBy: { sort_order: 'asc' } },
            poll_votes: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return posts.map((post) => this.toPostResponse(post as PostWithAuthor, requesterId));
  }

  private async touchPadlet(padletId: string, updatedAt: Date): Promise<void> {
    await this.prisma.padlet.update({
      where: { padlet_id: padletId },
      data: { updated_at: updatedAt },
    });
  }

  buildFreeWallOrder(existingOrders: number[]): PostLayoutDto {
    const maxOrder = existingOrders.reduce(
      (max, order) => Math.max(max, order),
      FREE_WALL_ORDER_START - 1,
    );

    return { order: maxOrder + 1 };
  }

  private async buildFreeWallOrderForPadlet(
    padletId: string,
  ): Promise<PostLayoutDto> {
    await this.ensureFreeWallOrders(padletId);
    const existingOrders = await this.getFreeWallOrders(padletId);
    return this.buildFreeWallOrder(existingOrders);
  }

  private async ensureFreeWallOrders(padletId: string): Promise<void> {
    const posts = await this.prisma.post.findMany({
      where: { padlet_id: padletId },
      orderBy: { created_at: 'asc' },
      select: { post_id: true, data_layout: true },
    });

    const needsMigration = posts.some((post) => {
      const raw = post.data_layout as Record<string, unknown> | null;
      return !raw || typeof raw.order !== 'number';
    });

    if (!needsMigration) {
      return;
    }

    await this.prisma.$transaction(
      posts.map((post, index) =>
        this.prisma.post.update({
          where: { post_id: post.post_id },
          data: { data_layout: { order: index } },
        }),
      ),
    );
  }

  private async getFreeWallOrders(padletId: string): Promise<number[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        padlet_id: padletId,
        data_layout: { not: null },
      },
      select: { data_layout: true },
    });

    return posts.map((post) =>
      this.resolveFreeWallOrder(post.data_layout),
    );
  }

  private resolveFreeWallOrder(dataLayout: unknown): number {
    const raw = dataLayout as Record<string, unknown> | null;
    if (raw && typeof raw.order === 'number' && Number.isFinite(raw.order)) {
      return Math.round(raw.order);
    }

    return FREE_WALL_ORDER_START;
  }

  private normalizeFreeWallLayout(layout: PostLayoutDto): PostLayoutDto {
    return { order: this.resolveFreeWallOrder(layout) };
  }

  toJsonLayout(layout: PostLayoutDto): Prisma.InputJsonValue {
    const normalized = this.normalizeFreeWallLayout(layout);
    return { order: normalized.order };
  }

  private mapPostContent(dto: PostContentInputDto): {
    contentKind: PostContentKind;
    title: string | null;
    subject: string | null;
  } {
    switch (dto.content_kind) {
      case 'image':
        return { contentKind: PostContentKind.attachment, title: null, subject: dto.image_file_name ?? null };
      case 'link':
        return { contentKind: PostContentKind.attachment, title: null, subject: dto.content ?? null };
      case 'poll':
        return { contentKind: PostContentKind.poll, title: dto.content ?? null, subject: 'סקר' };
      case 'text':
      default:
        return { contentKind: PostContentKind.none, title: null, subject: dto.content ?? null };
    }
  }

  private parseId(raw: string, errorMessage: string): string {
    if (!/^[0-9a-f]{24}$/i.test(raw)) {
      throw new NotFoundException(errorMessage);
    }
    return raw;
  }

  private safeParseId(raw: string | undefined): string | null {
    if (!raw || !/^[0-9a-f]{24}$/i.test(raw)) return null;
    return raw;
  }

  private async recordPostVisit(
    padletId: string,
    authorId: string,
    visitIdRaw: string | undefined,
    now: Date,
  ): Promise<void> {
    const entryVisitId = this.safeParseId(visitIdRaw);

    if (entryVisitId !== null) {
      const entryVisit = await this.prisma.padletVisit.findFirst({
        where: { visit_id: entryVisitId, padlet_id: padletId, user_id: authorId },
      });
      if (entryVisit) {
        // הכניסה כבר נספרה כביקור - יצירת פוסט באותה כניסה לא מוסיפה ביקור נוסף
        return;
      }
    }

    // אין כניסה תקפה מקושרת (למשל recordVisit נכשל) - רשת ביטחון, רושמים ביקור
    await this.prisma.padletVisit.create({
      data: { padlet_id: padletId, user_id: authorId, visited_at: now },
    });
  }
}