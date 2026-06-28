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

interface MostVisitedPadlet {
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
    const userBigId = this.parseId(userId, 'משתמש לא נמצא');

    const padlet = await this.prisma.padlet.findUnique({
      where: { padlet_id: padletId },
      select: { padlet_id: true },
    });
    if (!padlet) throw new NotFoundException('הלוח לא נמצא');

    const visit = await this.prisma.padletVisit.create({
      data: {
        padlet_id: padletId,
        user_id: userBigId,
        visited_at: new Date(),
      },
    });

    return { visitId: visit.visit_id.toString() };
  }

  async updateVisitDuration(
    visitIdRaw: string,
    userId: string,
    durationSec: number,
  ): Promise<void> {
    const visitId = this.parseId(visitIdRaw, 'הביקור לא נמצא');
    const userBigId = this.parseId(userId, 'משתמש לא נמצא');

    const visit = await this.prisma.padletVisit.findFirst({
      where: { visit_id: visitId, user_id: userBigId },
    });
    if (!visit) throw new NotFoundException('הביקור לא נמצא');

    await this.prisma.padletVisit.update({
      where: { visit_id: visitId },
      data: { duration_sec: durationSec },
    });
  }

  async getStats(userId: string): Promise<StatsResponseDto> {
    const userBigId = this.parseId(userId, 'משתמש לא נמצא');
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const userPadlets = await this.prisma.padlet.findMany({
      where: { user_id: userBigId },
      select: { padlet_id: true },
    });
    const padletIds = userPadlets.map((p) => p.padlet_id);
    const myPadletsCount = padletIds.length;

    const [sharedWithMe, totalPosts] = await Promise.all([
      this.prisma.participant.count({
        where: { user_id: userBigId, permission: { not: 'owner' } },
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
      this.prisma.$queryRaw<MostVisitedRawRow[]>(Prisma.sql`
        SELECT
          p.padlet_id::text                           AS id,
          p.title,
          COUNT(v.visit_id)::int                      AS visits,
          COUNT(DISTINCT v.user_id)::int              AS unique_visitors,
          COALESCE(ROUND(AVG(v.duration_sec)), 0)::int AS avg_duration_sec,
          COUNT(DISTINCT po.post_id)::int             AS posts_count
        FROM "Padlet" p
        LEFT JOIN "PadletVisit" v  ON v.padlet_id  = p.padlet_id
        LEFT JOIN "Post"        po ON po.padlet_id = p.padlet_id
        WHERE p.user_id = ${userBigId}
        GROUP BY p.padlet_id, p.title
        ORDER BY visits DESC
        LIMIT 10
      `),
      this.prisma.padlet.groupBy({
        by: ['board_type'],
        where: { user_id: userBigId },
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

  async getPadletVisits(padletIdRaw: string, userId: string): Promise<DayCount[]> {
    const padletId = this.parseId(padletIdRaw, 'הלוח לא נמצא');
    const userBigId = this.parseId(userId, 'משתמש לא נמצא');

    const padlet = await this.prisma.padlet.findFirst({
      where: {
        padlet_id: padletId,
        OR: [
          { user_id: userBigId },
          { participants: { some: { user_id: userBigId } } },
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
      const key = date.toISOString().split('T')[0];
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

  private parseId(raw: string, errorMessage: string): bigint {
    try {
      return BigInt(raw);
    } catch {
      throw new NotFoundException(errorMessage);
    }
  }
}

interface MostVisitedRawRow {
  id: string;
  title: string;
  visits: number;
  unique_visitors: number;
  avg_duration_sec: number;
  posts_count: number;
}
