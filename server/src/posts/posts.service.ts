import {
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
import { CreatePostDto } from './dto/create-post.dto';
import { PostContentInputDto } from './dto/post-content-input.dto';
import { PostLayoutDto } from './dto/post-layout.dto';
import { UpdatePostLayoutDto } from './dto/update-post-layout.dto';
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

export interface PostResponseDto {
  id: string;
  padletId: string;
  authorUsername: string;
  title: string | null;
  subject: string | null;
  color: string | null;
  layout: PostLayoutDto | null;
  createdAt: string;
  poll: PollResponseDto | null;
}

type PollWithOptionsAndVotes = Poll & {
  poll_options: (PollOption & { poll_votes: PollVote[] })[];
  poll_votes: PollVote[];
};

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    user: true;
    poll: {
      include: {
        poll_options: { include: { poll_votes: true } };
        poll_votes: true;
      };
    };
  };
}>;

const FREE_WALL_COLUMNS = 3;
const GRID_COLUMNS = 4;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly padletAccess: PadletAccessService,
    private readonly notificationService: NotificationService,
    private readonly realtimeGateway: RealtimeGateway,
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

    const existingCount = await this.prisma.post.count({
      where: { padlet_id: padletId },
    });

    const { contentKind, title, subject } = this.mapPostContent(dto);
    const now = new Date();

    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          padlet_id: padletId,
          user_id: authorId,
          content_kind: contentKind,
          title,
          subject,
          color: dto.color ?? null,
          data_layout: this.toJsonLayout(
            this.buildLayout(access.boardType, existingCount),
          ),
          created_at: now,
          updated_at: now,
        },
        include: {
          user: true,
          poll: {
            include: {
              poll_options: { include: { poll_votes: true }, orderBy: { sort_order: 'asc' } },
              poll_votes: true,
            },
          },
        },
      });

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

    await this.touchPadlet(padletId, now);

    void this.notifyPadletMembers(padletId, authorId, actorUsername, post.post_id);

    const postWithPoll = await this.findPostWithPoll(post.post_id);
    const postResponse = this.toPostResponse(postWithPoll, authorId);
    this.realtimeGateway.broadcastToPadlet(padletId.toString(), 'post:created', postResponse);
    return postResponse;
  }

  private async notifyPadletMembers(
    padletId: bigint,
    authorId: bigint,
    actorUsername: string,
    postId: bigint,
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
      ...padletWithMembers.participants.map((p: { user_id: bigint }) => p.user_id),
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
        title,
        subject,
        color: dto.color ?? null,
        updated_at: now,
      },
      include: { user: true },
    });

    // עדכון הסקר
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
    this.realtimeGateway.broadcastToPadlet(padletId.toString(), 'post:updated', postResponse);
    return postResponse;
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

    await this.prisma.post.update({
      where: { post_id: postId },
      data: {
        data_layout: this.toJsonLayout(dto),
        updated_at: now,
      },
    });

    await this.touchPadlet(padletId, now);

    const postWithPoll = await this.findPostWithPoll(postId);
   return this.toPostResponse(postWithPoll, requesterId);
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

    await this.prisma.post.delete({ where: { post_id: postId } });

    if (padlet.boardType !== PadletBoardType.free_wall) {
      await this.reindexPostLayouts(padletId, padlet.boardType);
    }

    await this.touchPadlet(padletId, now);

    this.realtimeGateway.broadcastToPadlet(padletId.toString(), 'post:deleted', { postId: postIdRaw });
    return this.getPadletPosts(padletId, requesterId);
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
    return this.toPostResponse(postWithPoll, voterId);
  }

  toPostResponse(post: PostWithAuthor, requesterId?: bigint): PostResponseDto {
    let pollData: PollResponseDto | null = null;

    if (post.poll) {
      const poll = post.poll as PollWithOptionsAndVotes;
      const totalVotes = poll.poll_votes.length;
      const userVote = requesterId
        ? poll.poll_votes.find((v) => v.user_id === requesterId)
        : null;

      pollData = {
        id: poll.poll_id.toString(),
        question: poll.question,
        totalVotes,
        userVotedOptionId: userVote ? userVote.option_id.toString() : null,
        options: poll.poll_options.map((opt) => ({
          id: opt.option_id.toString(),
          label: opt.label,
          sortOrder: opt.sort_order,
          voteCount: opt.poll_votes.length,
        })),
      };
    }

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
      poll: pollData,
    };
  }

  private async findPostWithPoll(
    postId: bigint,
  ): Promise<PostWithAuthor> {
    const post = await this.prisma.post.findUnique({
      where: { post_id: postId },
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
    });

    if (!post) throw new NotFoundException('הפוסט לא נמצא');
    return post as PostWithAuthor;
  }

  private async findPostForUser(
    userId: bigint,
    padletId: bigint,
    postId: bigint,
  ): Promise<PostWithAuthor> {
    await this.padletAccess.assertCanView(userId, padletId);

    const post = await this.prisma.post.findFirst({
      where: { post_id: postId, padlet_id: padletId },
      include: {
        user: true,
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
    padletId: bigint,
    requesterId?: bigint,
  ): Promise<PostResponseDto[]> {
    const posts = await this.prisma.post.findMany({
      where: { padlet_id: padletId },
      include: {
        user: true,
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
            data_layout: this.toJsonLayout(this.buildLayout(boardType, index)),
          },
        }),
      ),
    );
  }

  buildLayout(boardType: PadletBoardType, index: number): PostLayoutDto {
    switch (boardType) {
      case PadletBoardType.brainstorming:
        return { x: 6 + (index % 3) * 30, y: 8 + index * 14 };
      case PadletBoardType.grid:
        return { x: index % GRID_COLUMNS, y: Math.floor(index / GRID_COLUMNS) };
      case PadletBoardType.timeline:
        return { x: index, y: 0 };
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
        return { contentKind: PostContentKind.attachment, title: 'תמונה', subject: dto.image_file_name ?? null };
      case 'link':
        return { contentKind: PostContentKind.attachment, title: 'קישור', subject: dto.content ?? null };
      case 'poll':
        return { contentKind: PostContentKind.poll, title: dto.content ?? null, subject: 'סקר' };
      case 'text':
      default:
        return { contentKind: PostContentKind.none, title: null, subject: dto.content ?? null };
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