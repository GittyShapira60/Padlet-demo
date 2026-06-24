import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetReactionDto } from './dto/set-reaction.dto';

export interface ReactionSummaryDto {
  reactionCode: string;
  count: number;
  reactors: ReactionReactorDto[];
}

export interface ReactionReactorDto {
  userId: string;
  username: string;
}

export interface PostReactionsViewDto {
  postId: string;
  summaries: ReactionSummaryDto[];
  currentUserReactionCode: string | null;
}

export interface PadletReactionsResponseDto {
  reactions: PostReactionsViewDto[];
}

@Injectable()
export class ReactionService {
  constructor(private readonly prisma: PrismaService) {}

  async getPadletReactions(
    userId: string,
    padletIdRaw: string,
  ): Promise<PadletReactionsResponseDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');

    await this.assertPadletAccess(requesterId, padletId);

    const reactions = await this.prisma.postReaction.findMany({
      where: {
        post: { padlet_id: padletId },
      },
      select: {
        post_id: true,
        user_id: true,
        reaction_code: true,
        user: {
          select: { username: true },
        },
      },
    });

    const grouped = new Map<string, (typeof reactions)[number][]>();
    for (const reaction of reactions) {
      const postId = reaction.post_id.toString();
      const current = grouped.get(postId) ?? [];
      current.push(reaction);
      grouped.set(postId, current);
    }

    return {
      reactions: Array.from(grouped.entries()).map(([postId, postReactions]) =>
        this.toPostReactionsView(postId, postReactions, requesterId),
      ),
    };
  }

  async getPostReactions(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
  ): Promise<PostReactionsViewDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    await this.assertPostAccess(requesterId, padletId, postId);

    const reactions = await this.prisma.postReaction.findMany({
      where: { post_id: postId },
      select: {
        post_id: true,
        user_id: true,
        reaction_code: true,
        user: {
          select: { username: true },
        },
      },
    });

    return this.toPostReactionsView(postId.toString(), reactions, requesterId);
  }

  async setPostReaction(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
    dto: SetReactionDto,
  ): Promise<PostReactionsViewDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    await this.assertPostAccess(requesterId, padletId, postId);

    const existingForUser = await this.prisma.postReaction.findMany({
      where: {
        post_id: postId,
        user_id: requesterId,
      },
      select: { reaction_code: true },
    });

    const hasSameReaction = existingForUser.some(
      (reaction) => reaction.reaction_code === dto.reaction_code,
    );

    await this.prisma.$transaction(async (tx) => {
      if (hasSameReaction) {
        await tx.postReaction.delete({
          where: {
            post_id_user_id_reaction_code: {
              post_id: postId,
              user_id: requesterId,
              reaction_code: dto.reaction_code,
            },
          },
        });
        return;
      }

      await tx.postReaction.deleteMany({
        where: {
          post_id: postId,
          user_id: requesterId,
        },
      });

      await tx.postReaction.create({
        data: {
          post_id: postId,
          user_id: requesterId,
          reaction_code: dto.reaction_code,
        },
      });
    });

    return this.getPostReactions(userId, padletIdRaw, postIdRaw);
  }

  async removePostReaction(
    userId: string,
    padletIdRaw: string,
    postIdRaw: string,
  ): Promise<PostReactionsViewDto> {
    const requesterId = this.parseId(userId, 'משתמש לא נמצא');
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const postId = this.parseId(postIdRaw, 'הפוסט לא נמצא');

    await this.assertPostAccess(requesterId, padletId, postId);

    await this.prisma.postReaction.deleteMany({
      where: {
        post_id: postId,
        user_id: requesterId,
      },
    });

    return this.getPostReactions(userId, padletIdRaw, postIdRaw);
  }

  private toPostReactionsView(
    postId: string,
    reactions: {
      user_id: bigint;
      reaction_code: string;
      user: { username: string };
    }[],
    requesterId: bigint,
  ): PostReactionsViewDto {
    const summaries = new Map<
      string,
      { count: number; reactors: ReactionReactorDto[] }
    >();

    for (const reaction of reactions) {
      const current = summaries.get(reaction.reaction_code) ?? {
        count: 0,
        reactors: [],
      };

      current.count += 1;
      current.reactors.push({
        userId: reaction.user_id.toString(),
        username: reaction.user.username,
      });
      summaries.set(reaction.reaction_code, current);
    }

    const currentUserReaction = reactions.find(
      (reaction) => reaction.user_id === requesterId,
    );

    return {
      postId,
      summaries: Array.from(summaries.entries()).map(
        ([reactionCode, { count, reactors }]) => ({
          reactionCode,
          count,
          reactors: reactors.sort((left, right) =>
            left.username.localeCompare(right.username, 'he'),
          ),
        }),
      ),
      currentUserReactionCode: currentUserReaction?.reaction_code ?? null,
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

  private async assertPostAccess(
    userId: bigint,
    padletId: bigint,
    postId: bigint,
  ): Promise<void> {
    await this.assertPadletAccess(userId, padletId);

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
