import { ArrowRight, Share2 } from '../../../../shared/icons';
import styles from './PadletBoardHeader.module.css';

interface PadletBoardHeaderProps {
  title: string;
  onBack: () => void;
  onShareClick: () => void;
}

export default function PadletBoardHeader({
  title,
  onBack,
  onShareClick,
}: PadletBoardHeaderProps) {
  return (
    <>
      <button type="button" className={styles.back} onClick={onBack}>
        <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
        חזרה לבית
      </button>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <button
          type="button"
          className={styles.share}
          aria-label="שיתוף"
          onClick={onShareClick}
        >
          <Share2 size={16} strokeWidth={2} aria-hidden="true" />
          שיתוף
        </button>
      </header>
    </>
  );
}
