import { ArrowRight, LogOut, Share2 } from '../../../../shared/icons';
import styles from './PadletBoardHeader.module.css';

interface PadletBoardHeaderProps {
  title: string;
  isShared?: boolean;
  onBack: () => void;
  onShareClick: () => void;
  onLeaveClick?: () => void;
}

export default function PadletBoardHeader({
  title,
  isShared = false,
  onBack,
  onShareClick,
  onLeaveClick,
}: PadletBoardHeaderProps) {
  return (
    <>
      <button type="button" className={styles.back} onClick={onBack}>
        <ArrowRight size={18} strokeWidth={2} />
        חזרה לבית
      </button>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.actions}>
          {isShared && onLeaveClick ? (
            <button
              type="button"
              className={styles.leave}
              aria-label="עזיבת לוח"
              onClick={onLeaveClick}
            >
              <LogOut size={16} strokeWidth={2} aria-hidden="true" />
              עזוב לוח
            </button>
          ) : null}
          <button
            type="button"
            className={styles.share}
            aria-label="שיתוף"
            onClick={onShareClick}
          >
            <Share2 size={16} strokeWidth={2} aria-hidden="true" />
            שיתוף
          </button>
        </div>
      </header>
    </>
  );
}
