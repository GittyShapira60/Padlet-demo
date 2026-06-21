import type { ReactionSummary } from '../types/post-reaction';
import styles from './PostReaction.module.css';

interface ReactionPillProps {
  summary: ReactionSummary;
  isOwnReaction: boolean;
  onRemove?: () => void;
}

export default function ReactionPill({
  summary,
  isOwnReaction,
  onRemove,
}: ReactionPillProps) {
  const pillContent = (
    <>
      <span className={styles.count}>{summary.count}</span>
      <span className={styles.glyph} aria-hidden>
        {summary.glyph}
      </span>
    </>
  );

  const reactorsLabel = summary.reactors
    .map((reactor) => reactor.username)
    .join(', ');

  return (
    <div className={styles.pillWrap}>
      {summary.reactors.length > 0 ? (
        <div className={styles.reactorsPopover} role="tooltip">
          <ul className={styles.reactorsList}>
            {summary.reactors.map((reactor) => (
              <li key={reactor.userId} className={styles.reactorItem}>
                {reactor.username}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {isOwnReaction ? (
        <button
          type="button"
          className={`${styles.pill} ${styles.pillOwn}`}
          aria-label={`${summary.count} תגובות עם ${summary.glyph}. ${reactorsLabel}. לחץ להסרת התגובה שלך`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
        >
          {pillContent}
        </button>
      ) : (
        <div
          className={styles.pill}
          aria-label={`${summary.count} תגובות עם ${summary.glyph}. ${reactorsLabel}`}
        >
          {pillContent}
        </div>
      )}
    </div>
  );
}
