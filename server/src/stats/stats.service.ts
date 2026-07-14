import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface DayCount {
  date: string;
  count: number;
}

interface PostTypeStat {
  type: string;
  count: number;
  percentage: number;
}

interface LayoutStat {
  type: string;
  count: number;
  percentage: number;
}

export interface MostVisitedPadlet {
  id: string;
  title: string;
  visits: number;
  unique_visitors: number;
  avg_duration_sec: number;
  posts_count: number;
}

export interface StatsResponseDto {
  summary: {
    top_padlet_visits: number;
    shared_with_me: number;
    total_posts: number;
    my_padlets_count: number;
  };
  posts_last_14_days: DayCount[];
  visits_last_14_days: DayCount[];
  post_types: PostTypeStat[];
  layout_distribution: LayoutStat[];
  most_visited_padlets: MostVisitedPadlet[];
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordVisit(padletIdRaw: string, userId: string): Promise<{ visitId: string }> {
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const userId_ = this.parseId(userId, 'משתמש לא נמצא');

    const padlet = await this.prisma.padlet.findUnique({
      where: { padlet_id: padletId },
      select: { padlet_id: true },
    });
    if (!padlet) throw new NotFoundException('הלוח לא נמצא');

    const visit = await this.prisma.padletVisit.create({
      data: {
        padlet_id: padletId,
        user_id: userId_,
        visited_at: new Date(),
      },
    });

    return { visitId: visit.visit_id };
  }

  async updateVisitDuration(
    visitIdRaw: string,
    userId: string,
    durationSec: number,
  ): Promise<void> {
    const visitId = this.parseId(visitIdRaw, 'הביקור לא נמצא');
    const userId_ = this.parseId(userId, 'משתמש לא נמצא');

    const visit = await this.prisma.padletVisit.findFirst({
      where: { visit_id: visitId, user_id: userId_ },
    });
    if (!visit) throw new NotFoundException('הביקור לא נמצא');

    await this.prisma.padletVisit.update({
      where: { visit_id: visitId },
      data: { duration_sec: durationSec },
    });
  }

  async getStats(userId: string): Promise<StatsResponseDto> {
    const userId_ = this.parseId(userId, 'משתמש לא נמצא');
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const userPadlets = await this.prisma.padlet.findMany({
      where: { user_id: userId_ },
      select: { padlet_id: true },
    });
    const padletIds = userPadlets.map((p) => p.padlet_id);
    const myPadletsCount = padletIds.length;

    const [sharedWithMe, totalPosts] = await Promise.all([
      this.prisma.participant.count({
        where: { user_id: userId_, permission: { not: 'owner' } },
      }),
      padletIds.length > 0
        ? this.prisma.post.count({ where: { padlet_id: { in: padletIds } } })
        : Promise.resolve(0),
    ]);

    const [recentPostDates, recentVisitDates, mostVisitedRaw, layouts, posts] = await Promise.all([
      padletIds.length > 0
        ? this.prisma.post.findMany({
            where: { padlet_id: { in: padletIds }, created_at: { gte: fourteenDaysAgo } },
            select: { created_at: true },
          })
        : Promise.resolve([]),
      padletIds.length > 0
        ? this.prisma.padletVisit.findMany({
            where: { padlet_id: { in: padletIds }, visited_at: { gte: fourteenDaysAgo } },
            select: { visited_at: true },
          })
        : Promise.resolve([]),
      this.queryMostVisitedPadlets(userId_),
      this.prisma.padlet.groupBy({
        by: ['board_type'],
        where: { user_id: userId_ },
        _count: { board_type: true },
      }),
      padletIds.length > 0
        ? this.prisma.post.findMany({
            where: { padlet_id: { in: padletIds } },
            select: { content_kind: true, attachment: { select: { attachment_type: true } } },
          })
        : Promise.resolve([]),
    ]);

    const topPadletVisits = mostVisitedRaw.length > 0 ? mostVisitedRaw[0].visits : 0;

    const totalLayouts = layouts.reduce((sum, l) => sum + l._count.board_type, 0) || 1;

    return {
      summary: {
        top_padlet_visits: topPadletVisits,
        shared_with_me: sharedWithMe,
        total_posts: totalPosts,
        my_padlets_count: myPadletsCount,
      },
      posts_last_14_days: this.groupByDate(recentPostDates.map((p) => p.created_at)),
      visits_last_14_days: this.groupByDate(recentVisitDates.map((v) => v.visited_at)),
      post_types: this.computePostTypes(posts),
      layout_distribution: layouts.map((l) => ({
        type: l.board_type,
        count: l._count.board_type,
        percentage: Math.round((l._count.board_type / totalLayouts) * 100),
      })),
      most_visited_padlets: mostVisitedRaw,
    };
  }

  async getMostVisitedPadlets(userId: string, from: Date, to: Date): Promise<MostVisitedPadlet[]> {
    const userId_ = this.parseId(userId, 'משתמש לא נמצא');
    return this.queryMostVisitedPadlets(userId_, { from, to });
  }

  /**
   * Mongo equivalent of the old Postgres JOIN/GROUP BY query. Runs as a raw
   * aggregation pipeline because it needs cross-collection counts/averages
   * that Prisma's query builder can't express. `aggregateRaw` returns MongoDB
   * extended JSON, so ObjectIds come back as `{ $oid: string }`.
   */
  private async queryMostVisitedPadlets(
    userId: string,
    dateRange?: { from: Date; to: Date },
  ): Promise<MostVisitedPadlet[]> {
    const visitMatch: unknown[] = [{ $eq: ['$padlet_id', '$$padletId'] }];
    if (dateRange) {
      visitMatch.push(
        { $gte: ['$visited_at', { $date: dateRange.from.toISOString() }] },
        { $lte: ['$visited_at', { $date: dateRange.to.toISOString() }] },
      );
    }

    const rows = await this.prisma.padlet.aggregateRaw({
      pipeline: [
        { $match: { user_id: { $oid: userId } } },
        {
          $lookup: {
            from: 'PadletVisit',
            let: { padletId: '$_id' },
            pipeline: [{ $match: { $expr: { $and: visitMatch } } }],
            as: 'visits',
          },
        },
        {
          $lookup: {
            from: 'Post',
            localField: '_id',
            foreignField: 'padlet_id',
            as: 'posts',
          },
        },
        {
          $project: {
            title: 1,
            created_at: 1,
            visits: { $size: '$visits' },
            unique_visitors: {
              $size: {
                $setUnion: [
                  {
                    $filter: {
                      input: '$visits.user_id',
                      as: 'uid',
                      cond: { $ne: ['$$uid', null] },
                    },
                  },
                  [],
                ],
              },
            },
            avg_duration_sec: {
              $ifNull: [{ $round: [{ $avg: '$visits.duration_sec' }, 0] }, 0],
            },
            posts_count: { $size: '$posts' },
          },
        },
        { $sort: { visits: -1, avg_duration_sec: -1, created_at: -1 } },
      ] as Prisma.InputJsonValue[],
    });

    return (rows as unknown as MostVisitedRawRow[]).map((row) => ({
      id: this.extractOid(row._id),
      title: row.title,
      visits: row.visits,
      unique_visitors: row.unique_visitors,
      avg_duration_sec: row.avg_duration_sec,
      posts_count: row.posts_count,
    }));
  }

  private extractOid(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && '$oid' in value) {
      return (value as { $oid: string }).$oid;
    }
    throw new Error('Expected ObjectId value from aggregateRaw result');
  }

  async getPadletVisits(padletIdRaw: string, userId: string): Promise<DayCount[]> {
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const userId_ = this.parseId(userId, 'משתמש לא נמצא');

    const padlet = await this.prisma.padlet.findFirst({
      where: {
        padlet_id: padletId,
        OR: [
          { user_id: userId_ },
          { participants: { some: { user_id: userId_ } } },
        ],
      },
      select: { padlet_id: true },
    });
    if (!padlet) throw new NotFoundException('הלוח לא נמצא');

    const visits = await this.prisma.padletVisit.findMany({
      where: { padlet_id: padletId },
      select: { visited_at: true },
      orderBy: { visited_at: 'asc' },
    });

    return this.groupByDate(visits.map((v) => v.visited_at));
  }

  private groupByDate(dates: Date[]): DayCount[] {
    const counts = new Map<string, number>();
    for (const date of dates) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }

  private computePostTypes(
    posts: { content_kind: string; attachment: { attachment_type: string } | null }[],
  ): PostTypeStat[] {
    const counts: Record<string, number> = {};

    for (const post of posts) {
      if (post.content_kind === 'poll') {
        counts['poll'] = (counts['poll'] ?? 0) + 1;
      } else if (post.content_kind === 'attachment' && post.attachment) {
        const type = post.attachment.attachment_type;
        counts[type] = (counts[type] ?? 0) + 1;
      } else {
        counts['text'] = (counts['text'] ?? 0) + 1;
      }
    }

    const total = posts.length || 1;
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  private parseId(raw: string, errorMessage: string): string {
    if (!/^[0-9a-f]{24}$/i.test(raw)) {
      throw new NotFoundException(errorMessage);
    }
    return raw;
  }
}

interface MostVisitedRawRow {
  _id: unknown;
  title: string;
  visits: number;
  unique_visitors: number;
  avg_duration_sec: number;
  posts_count: number;
}
