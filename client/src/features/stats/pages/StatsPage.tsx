import type { ReactNode } from 'react';
import { Eye, Share2, FileText, LayoutDashboard, Users } from 'lucide-react';
import type { DayCount, MostVisitedPadlet, PostTypeStat, LayoutStat } from '../services/stats-service';
import { useStatsPage } from './useStatsPage';
import styles from './StatsPage.module.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${parseInt(day)}/${parseInt(month)}`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} שנ'`;
  return `${Math.round(seconds / 60)} דק'`;
}

function computeTicks(maxVal: number): number[] {
  const step =
    maxVal <= 5 ? 1 :
    maxVal <= 20 ? 5 :
    maxVal <= 50 ? 10 :
    maxVal <= 100 ? 20 : 50;
  const ticks: number[] = [];
  for (let v = 0; v <= maxVal + step; v += step) {
    ticks.push(v);
    if (v >= maxVal) break;
  }
  return ticks;
}

const POST_TYPE_LABELS: Record<string, string> = {
  text: 'טקסט',
  poll: 'סקר',
  picture: 'תמונה',
  file: 'קובץ',
  link: 'לינק',
};

const POST_TYPE_ICONS: Record<string, string> = {
  text: '🖊',
  poll: '📊',
  picture: '🖼',
  file: '📄',
  link: '🔗',
};

const POST_TYPE_COLORS = ['#f59032', '#a855f7', '#3b82f6', '#22c55e', '#ef4444'];

const LAYOUT_LABELS: Record<string, string> = {
  free_wall: 'קיר חופשי',
  brainstorming: 'סיעור מוחות',
  grid: 'רשת',
  timeline: 'ציר זמן',
};

const LAYOUT_ICONS: Record<string, string> = {
  free_wall: '🧱',
  brainstorming: '💡',
  grid: '📋',
  timeline: '📅',
};

const LAYOUT_COLORS = ['#f59e0b', '#ec4899', '#10b981', '#6366f1'];

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({
  data,
  color,
  title,
  icon,
}: {
  data: DayCount[];
  color: string;
  title: string;
  icon: ReactNode;
}) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const ticks = computeTicks(maxVal);
  const topTick = ticks[ticks.length - 1];

  return (
    <div className={styles.card}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <span className={styles.chartIcon}>{icon}</span>
      </div>
      {data.length === 0 ? (
        <p className={styles.empty}>אין נתונים לתצוגה</p>
      ) : (
        <div className={styles.chartWrapper}>
          {/* Y-axis */}
          <div className={styles.yAxis}>
            {[...ticks].reverse().map((t) => (
              <span
                key={t}
                className={styles.yTick}
                style={{ bottom: `${(t / topTick) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Chart area */}
          <div className={styles.chartArea}>
            {/* Grid lines */}
            <div className={styles.gridLayer}>
              {ticks.map((t) => (
                <div
                  key={t}
                  className={styles.gridLine}
                  style={{ bottom: `${(t / topTick) * 100}%` }}
                />
              ))}
            </div>

            {/* Bars */}
            <div className={styles.barsRow}>
              {data.map(({ date, count }) => (
                <div key={date} className={styles.barCol}>
                  <span className={styles.barValue} style={{ color }}>{count}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        height: `${(count / topTick) * 100}%`,
                        background: `linear-gradient(to top, ${color}88, ${color})`,
                      }}
                    />
                  </div>
                  <span className={styles.barDate}>{formatDate(date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Progress List ────────────────────────────────────────────────────────────

function ProgressList({
  items,
  colors,
  labelMap,
  iconMap,
  title,
  icon,
}: {
  items: (PostTypeStat | LayoutStat)[];
  colors: string[];
  labelMap: Record<string, string>;
  iconMap: Record<string, string>;
  title: string;
  icon: ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <span className={styles.chartIcon}>{icon}</span>
      </div>
      {items.length === 0 ? (
        <p className={styles.empty}>אין נתונים לתצוגה</p>
      ) : (
        <div className={styles.progressList}>
          {items.map((item, i) => (
            <div key={item.type} className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <span className={styles.progressStats}>
                  ({item.percentage}%) {item.count}
                </span>
                <span className={styles.progressLabel}>
                  {labelMap[item.type] ?? item.type}
                  {iconMap[item.type] && (
                    <span className={styles.typeIcon}>{iconMap[item.type]}</span>
                  )}
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: colors[i % colors.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Most Visited ─────────────────────────────────────────────────────────────

function MostVisited({ padlets }: { padlets: MostVisitedPadlet[] }) {
  const withVisits = padlets.filter((p) => p.visits > 0);
  const maxVisits = Math.max(...withVisits.map((p) => p.visits), 1);

  return (
    <div className={styles.card}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>הלוחות הכי מבוקשים (לפי ביקורים)</h3>
        <Eye size={16} color="#6b7280" />
      </div>
      {withVisits.length === 0 ? (
        <p className={styles.empty}>אין נתוני ביקורים עדיין</p>
      ) : (
        <div className={styles.mostVisitedList}>
          {withVisits.map((padlet, i) => (
            <div key={padlet.id} className={styles.mostVisitedItem}>
              <div className={styles.mostVisitedHeader}>
                <div className={styles.mostVisitedMeta}>
                  <Eye size={13} color="#6b7280" />
                  <span>{padlet.visits} ביקורים</span>
                  <span className={styles.dot}>·</span>
                  <span>{formatDuration(padlet.avg_duration_sec)} ממוצע</span>
                </div>
                <div className={styles.mostVisitedTitle}>
                  {i < 3 ? (
                    <span className={styles.medal}>{RANK_MEDALS[i]}</span>
                  ) : (
                    <span className={styles.rankNumber}>{i + 1}</span>
                  )}
                  <span>{padlet.title}</span>
                </div>
              </div>
              <div className={styles.mostVisitedBarWrap}>
                <div
                  className={styles.mostVisitedFill}
                  style={{ width: `${(padlet.visits / maxVisits) * 100}%` }}
                />
              </div>
              <div className={styles.mostVisitedFooter}>
                {padlet.unique_visitors} מבקרים ייחודיים · {padlet.posts_count} פוסטים
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const {
    stats,
    isLoading,
    error,
    selectedPadletId,
    padletVisits,
    isLoadingPadletVisits,
    handlePadletSelect,
    handleBack,
  } = useStatsPage();

  return (
    <div className={styles.page} dir="rtl">
      {/* Hero */}
      <div className={styles.hero}>
        <button className={styles.backBtn} onClick={handleBack}>
          חזרה ללוחות ←
        </button>
        <h1 className={styles.heroTitle}>סטטיסטיקות</h1>
        <p className={styles.heroSub}>נתוני הפעילות שלך ב-Padlet</p>
      </div>

      <div className={styles.content}>
        {isLoading && <p className={styles.loading}>טוען...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {stats && (
          <>
            {/* Summary cards */}
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryText}>
                  <div className={styles.summaryValue}>{stats.summary.top_padlet_visits}</div>
                  <div className={styles.summaryLabel}>ביקורים בלוח הפופולרי</div>
                </div>
                <div className={styles.summaryIcon} style={{ backgroundColor: '#dcfce7' }}>
                  <Eye size={20} color="#22c55e" />
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryText}>
                  <div className={styles.summaryValue}>{stats.summary.shared_with_me}</div>
                  <div className={styles.summaryLabel}>משותף איתי</div>
                </div>
                <div className={styles.summaryIcon} style={{ backgroundColor: '#dbeafe' }}>
                  <Share2 size={20} color="#3b82f6" />
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryText}>
                  <div className={styles.summaryValue}>{stats.summary.total_posts}</div>
                  <div className={styles.summaryLabel}>סך פוסטים</div>
                </div>
                <div className={styles.summaryIcon} style={{ backgroundColor: '#f3e8ff' }}>
                  <FileText size={20} color="#a855f7" />
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryText}>
                  <div className={styles.summaryValue}>{stats.summary.my_padlets_count}</div>
                  <div className={styles.summaryLabel}>לוחות שיצרתי</div>
                </div>
                <div className={styles.summaryIcon} style={{ backgroundColor: '#fff7ed' }}>
                  <LayoutDashboard size={20} color="#f59032" />
                </div>
              </div>
            </div>

            {/* Bar charts */}
            <div className={styles.chartsGrid}>
              <BarChart
                data={stats.posts_last_14_days}
                color="#f59032"
                title="פוסטים ב-14 הימים האחרונים"
                icon={<span style={{ color: '#f59032', fontSize: 16 }}>↗</span>}
              />
              <BarChart
                data={stats.visits_last_14_days}
                color="#5b8ff9"
                title="ביקורים ב-14 הימים האחרונים"
                icon={<Eye size={16} color="#5b8ff9" />}
              />
            </div>

            {/* Per-padlet visits */}
            <div className={styles.card}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>ביקורים לפי לוח ספציפי</h3>
                <Users size={16} color="#6b7280" />
              </div>
              <p className={styles.padletSelectSub}>בחר לוח לצפייה בנתוניו</p>
              <select
                className={styles.padletSelect}
                value={selectedPadletId}
                onChange={(e) => void handlePadletSelect(e.target.value)}
              >
                <option value="">— בחר לוח —</option>
                {stats.most_visited_padlets.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>

              {!selectedPadletId && (
                <p className={styles.empty}>בחר לוח כדי לראות נתוני הביקורים שלו</p>
              )}

              {selectedPadletId && isLoadingPadletVisits && (
                <p className={styles.empty}>טוען...</p>
              )}

              {selectedPadletId && !isLoadingPadletVisits && padletVisits.length === 0 && (
                <p className={styles.empty}>אין ביקורים ללוח זה עדיין</p>
              )}

              {selectedPadletId && !isLoadingPadletVisits && padletVisits.length > 0 && (() => {
                const maxV = Math.max(...padletVisits.map((d) => d.count), 1);
                const tks = computeTicks(maxV);
                const topTk = tks[tks.length - 1];
                return (
                  <div className={styles.chartWrapper} style={{ marginTop: 20 }}>
                    <div className={styles.yAxis}>
                      {[...tks].reverse().map((t) => (
                        <span key={t} className={styles.yTick} style={{ bottom: `${(t / topTk) * 100}%` }}>{t}</span>
                      ))}
                    </div>
                    <div className={styles.chartArea}>
                      <div className={styles.gridLayer}>
                        {tks.map((t) => (
                          <div key={t} className={styles.gridLine} style={{ bottom: `${(t / topTk) * 100}%` }} />
                        ))}
                      </div>
                      <div className={styles.barsRow}>
                        {padletVisits.map(({ date, count }) => (
                          <div key={date} className={styles.barCol}>
                            <span className={styles.barValue} style={{ color: '#5b8ff9' }}>{count}</span>
                            <div className={styles.barTrack}>
                              <div
                                className={styles.barFill}
                                style={{
                                  height: `${(count / topTk) * 100}%`,
                                  background: 'linear-gradient(to top, #5b8ff988, #5b8ff9)',
                                }}
                              />
                            </div>
                            <span className={styles.barDate}>{formatDate(date)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Post types + Layout distribution */}
            <div className={styles.chartsGrid}>
              <ProgressList
                items={stats.post_types}
                colors={POST_TYPE_COLORS}
                labelMap={POST_TYPE_LABELS}
                iconMap={POST_TYPE_ICONS}
                title="סוגי פוסטים"
                icon={<FileText size={16} color="#6b7280" />}
              />
              <ProgressList
                items={stats.layout_distribution}
                colors={LAYOUT_COLORS}
                labelMap={LAYOUT_LABELS}
                iconMap={LAYOUT_ICONS}
                title="פיזור פריסות"
                icon={<LayoutDashboard size={16} color="#6b7280" />}
              />
            </div>

            {/* Most visited */}
            <MostVisited padlets={stats.most_visited_padlets} />
          </>
        )}
      </div>
    </div>
  );
}
