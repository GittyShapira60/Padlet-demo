import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostContentKind, type Post, type User, type Poll, type PollOption, type PollVote } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export type PostLayoutDto = {
  x: number;
  y: number;
};

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

type PostWithAuthorAndPoll = Post & {
  user: User;
  poll: PollWithOptionsAndVotes | null;
};

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
      include: {
        user: true,
        poll: { include: { poll_options: { include: { poll_votes: true } }, poll_votes: true } },
      },
    });

    // If poll — create Poll + PollOption records
    if (dto.content_kind === 'poll' && dto.content && dto.poll_options && dto.poll_options.length >= 2) {
      await this.prisma.poll.create({
        data: {
          post_id: post.post_id,
          question: dto.content,
          poll_options: {
            create: dto.poll_options
              .filter((label) => label.trim().length > 0)
              .map((label, index) => ({
                label: label.trim(),
                sort_order: index,
              })),
          },
        },
      });
    }

    await this.touchPadlet(padletId, now);

    // Reload with poll data
    const postWithPoll = await this.findPostWithPoll(post.post_id, authorId);
    return this.toPostResponse(postWithPoll, authorId);
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

    const existingPost = await this.findPostForUser(requesterId, padletId, postId);
    this.assertPostAuthor(existingPost, requesterId);

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

    // Update poll if needed
    if (dto.content_kind === 'poll' && dto.content) {
      const existingPoll = await this.prisma.poll.findUnique({ where: { post_id: postId } });

      if (existingPoll) {
        // Delete existing options + votes and recreate
        await this.prisma.pollVote.deleteMany({ where: { poll_id: existingPoll.poll_id } });
        await this.prisma.pollOption.deleteMany({ where: { poll_id: existingPoll.poll_id } });
        await this.prisma.poll.update({
          where: { poll_id: existingPoll.poll_id },
          data: {
            question: dto.content,
            poll_options: {
              create: (dto.poll_options ?? [])
                .filter((label) => label.trim().length > 0)
                .map((label, index) => ({
                  label: label.trim(),
                  sort_order: index,
                })),
            },
          },
        });
      } else if (dto.poll_options && dto.poll_options.length >= 2) {
        await this.prisma.poll.create({
          data: {
            post_id: postId,
            question: dto.content,
            poll_options: {
              create: dto.poll_options
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

    const postWithPoll = await this.findPostWithPoll(postId, requesterId);
    return this.toPostResponse(postWithPoll, requesterId);
  }

  async deletePost(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
  ): Promise<void> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    const existingPost = await this.findPostForUser(requesterId, padletId, postId);
    this.assertPostAuthor(existingPost, requesterId);

    const now = new Date();

    await this.prisma.post.delete({ where: { post_id: postId } });
    await this.touchPadlet(padletId, now);
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

    await this.assertPadletAccess(voterId, padletId);

    const poll = await this.prisma.poll.findUnique({
      where: { post_id: postId },
      include: { poll_options: true },
    });

    if (!poll) {
      throw new NotFoundException('הסקר לא נמצא');
    }

    const optionExists = poll.poll_options.some((o) => o.option_id === optionId);
    if (!optionExists) {
      throw new NotFoundException('אפשרות לא נמצאה');
    }

    // Upsert vote (one vote per user per poll)
    await this.prisma.pollVote.upsert({
      where: { poll_id_user_id: { poll_id: poll.poll_id, user_id: voterId } },
      create: { poll_id: poll.poll_id, user_id: voterId, option_id: optionId },
      update: { option_id: optionId },
    });

    const postWithPoll = await this.findPostWithPoll(postId, voterId);
    return this.toPostResponse(postWithPoll, voterId);
  }

  private async findPostWithPoll(
    postId: bigint,
    userId: bigint,
  ): Promise<PostWithAuthorAndPoll> {
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

    if (!post) {
      throw new NotFoundException('הפוסט לא נמצא');
    }

    return post as PostWithAuthorAndPoll;
  }

  toPostResponse(post: PostWithAuthorAndPoll, requesterId?: bigint): PostResponseDto {
    let pollData: PollResponseDto | null = null;

    if (post.poll) {
      const poll = post.poll;
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
      layout: post.data_layout ? (post.data_layout as unknown as PostLayoutDto) : null,
      createdAt: post.created_at.toISOString(),
      poll: pollData,
    };
  }

  private async assertPadletAccess(userId: bigint, padletId: bigint): Promise<void> {
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
  ): Promise<PostWithAuthorAndPoll> {
    await this.assertPadletAccess(userId, padletId);

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

    if (!post) {
      throw new NotFoundException('הפוסט לא נמצא');
    }

    return post as PostWithAuthorAndPoll;
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
