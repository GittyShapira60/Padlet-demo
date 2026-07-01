import { useState, useEffect, useRef } from 'react';
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

const POST_TYPE_COLORS = ['#f59032', '#a855f7', '#3b82f6', '#22c55e', '#ef4444'];

const LAYOUT_LABELS: Record<string, string> = {
  free_wall: 'קיר חופשי',
  brainstorming: 'סיעור מוחות',
  grid: 'רשת',
  timeline: 'ציר זמן',
};

const LAYOUT_COLORS = ['#f59e0b', '#ec4899', '#10b981', '#6366f1'];

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
        <span className={styles.chartIcon}>{icon}</span>
        <h3 className={styles.chartTitle}>{title}</h3>
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
  title,
  icon,
}: {
  items: (PostTypeStat | LayoutStat)[];
  colors: string[];
  labelMap: Record<string, string>;
  title: string;
  icon: ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.chartHeader}>
        <span className={styles.chartIcon}>{icon}</span>
        <h3 className={styles.chartTitle}>{title}</h3>
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

// ─── Popular Calendar ─────────────────────────────────────────────────────────

const DAY_HEADERS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

function PopularCalendar({
  fromDate,
  toDate,
  minDate,
  maxDate,
  onChange,
}: {
  fromDate: string;
  toDate: string;
  minDate: string;
  maxDate: string;
  onChange: (from: string, to: string) => void;
}) {
  const now = new Date();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setPendingFrom(null);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  function pad(n: number) { return String(n).padStart(2, '0'); }
  function toStr(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const cells: Array<string | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toStr(viewYear, viewMonth, d));
  while (cells.length % 7 !== 0) cells.push(null);

  function handleDayClick(date: string) {
    if (date < minDate || date > maxDate) return;
    if (pendingFrom === null || date < pendingFrom) {
      setPendingFrom(date);
    } else {
      onChange(pendingFrom, date);
      setPendingFrom(null);
      setIsOpen(false);
    }
  }

  const minDate0 = new Date(minDate);
  const canPrev = viewYear > minDate0.getFullYear() || (viewYear === minDate0.getFullYear() && viewMonth > minDate0.getMonth());
  const canNext = viewYear < now.getFullYear() || viewMonth < now.getMonth();

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
  const fmt = (d: string) => `${parseInt(d.split('-')[2])}/${parseInt(d.split('-')[1])}`;

  return (
    <div className={styles.calPickerWrapper} ref={wrapperRef}>
      <button className={styles.calTrigger} onClick={() => setIsOpen(o => !o)}>
        <Eye size={12} color="#22c55e" />
        <span>
          {pendingFrom
            ? `${fmt(pendingFrom)} → ...`
            : `${fmt(fromDate)} → ${fmt(toDate)}`}
        </span>
        <span className={styles.calChevron}>{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <div className={styles.calDropdown}>
          <div className={styles.calHeader}>
            <button className={styles.calNav} onClick={prevMonth} disabled={!canPrev}>›</button>
            <span className={styles.calMonthName}>{monthLabel}</span>
            <button className={styles.calNav} onClick={nextMonth} disabled={!canNext}>‹</button>
          </div>
          {pendingFrom && (
            <p className={styles.calHint}>בחרי תאריך סיום</p>
          )}
          <div className={styles.calGrid}>
            {DAY_HEADERS.map(h => <span key={h} className={styles.calDayHeader}>{h}</span>)}
            {cells.map((date, idx) => {
              if (!date) return <span key={idx} className={styles.calDayEmpty} />;
              const disabled = date < minDate || date > maxDate;
              const isStart = date === (pendingFrom ?? fromDate);
              const isEnd   = !pendingFrom && date === toDate;
              const inRange = !pendingFrom && date > fromDate && date < toDate;
              const single  = fromDate === toDate;
              let cls = styles.calDay;
              if (disabled) cls = styles.calDayDisabled;
              else if (isStart && (isEnd || single)) cls = styles.calDaySingle;
              else if (isStart) cls = styles.calDayStart;
              else if (isEnd)   cls = styles.calDayEnd;
              else if (inRange) cls = styles.calDayInRange;
              return (
                <button key={idx} className={cls} onClick={() => handleDayClick(date)} disabled={disabled}>
                  {parseInt(date.split('-')[2])}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Most Visited ─────────────────────────────────────────────────────────────

function MostVisited({ padlets }: { padlets: MostVisitedPadlet[] }) {
  const [visibleCount, setVisibleCount] = useState(5);
  const withVisits = padlets.filter((p) => p.visits > 0);
  const maxVisits = Math.max(...withVisits.map((p) => p.visits), 1);
  const visible = withVisits.slice(0, visibleCount);
  const hasMore = visibleCount < withVisits.length;

  return (
    <div className={styles.card}>
      <div className={styles.chartHeader}>
        <Eye size={16} color="#6b7280" />
        <h3 className={styles.chartTitle}>הלוחות הכי מבוקשים (לפי ביקורים)</h3>
      </div>
      {withVisits.length === 0 ? (
        <p className={styles.empty}>אין נתוני ביקורים עדיין</p>
      ) : (
        <>
          <div className={styles.mostVisitedList}>
            {visible.map((padlet) => (
              <div key={padlet.id} className={styles.mostVisitedItem}>
                <div className={styles.mostVisitedHeader}>
                  <div className={styles.mostVisitedMeta}>
                    <Eye size={13} color="#6b7280" />
                    <span>{padlet.visits} ביקורים</span>
                    <span className={styles.dot}>·</span>
                    <span>{formatDuration(padlet.avg_duration_sec)} ממוצע</span>
                  </div>
                  <div className={styles.mostVisitedTitle}>
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
          <div className={styles.showMoreRow}>
            {visibleCount > 5 && (
              <button
                className={styles.arrowBtn}
                onClick={() => setVisibleCount(5)}
                title="סגור"
              >
                ▲
              </button>
            )}
            {hasMore && (
              <button
                className={styles.arrowBtn}
                onClick={() => setVisibleCount((c) => c + 5)}
                title="הצג עוד"
              >
                ▼
              </button>
            )}
          </div>
        </>
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
    fromDate,
    toDate,
    minDate,
    maxDate,
    mostVisited,
    isLoadingMostVisited,
    handleDateRangeChange,
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
              <div className={styles.summaryCardPopular}>
                <div className={styles.summaryCardPopularTop}>
                  <div className={styles.summaryText}>
                    <div className={styles.summaryValue}>
                      {isLoadingMostVisited ? '…' : (mostVisited[0]?.visits ?? 0)}
                    </div>
                    <div className={styles.summaryLabel}>ביקורים בלוח הפופולרי</div>
                  </div>
                  <div className={styles.summaryIcon} style={{ backgroundColor: '#dcfce7' }}>
                    <Eye size={20} color="#22c55e" />
                  </div>
                </div>
                <PopularCalendar
                  fromDate={fromDate}
                  toDate={toDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  onChange={handleDateRangeChange}
                />
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
                <Users size={16} color="#6b7280" />
                <h3 className={styles.chartTitle}>ביקורים לפי לוח ספציפי</h3>
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
                title="סוגי פוסטים"
                icon={<FileText size={16} color="#6b7280" />}
              />
              <ProgressList
                items={stats.layout_distribution}
                colors={LAYOUT_COLORS}
                labelMap={LAYOUT_LABELS}
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
