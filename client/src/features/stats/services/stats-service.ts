import { httpClient } from '../../../shared/services/http-client';

export interface DayCount {
  date: string;
  count: number;
}

export interface PostTypeStat {
  type: string;
  count: number;
  percentage: number;
}

export interface LayoutStat {
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

export interface StatsData {
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

export function getStats(): Promise<StatsData> {
  return httpClient<StatsData>('stats');
}

export function recordVisit(padletId: string): Promise<{ visitId: string }> {
  return httpClient<{ visitId: string }>(`stats/padlets/${padletId}/visit`, {
    method: 'POST',
  });
}

export function updateVisitDuration(visitId: string, durationSec: number): Promise<void> {
  return httpClient<void>(`stats/visits/${visitId}`, {
    method: 'PATCH',
    body: { duration_sec: durationSec },
  });
}

export function getPadletVisits(padletId: string): Promise<DayCount[]> {
  return httpClient<DayCount[]>(`stats/padlets/${padletId}/visits`);
}
