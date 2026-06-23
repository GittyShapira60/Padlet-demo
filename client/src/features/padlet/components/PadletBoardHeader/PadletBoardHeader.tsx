import { ArrowRight, Share2 } from '../../../../shared/icons';
import styles from './PadletBoardHeader.module.css';

interface PadletBoardHeaderProps {
  title: string;
  onBack: () => void;
  onShareClick: () => void;
  showShare?: boolean;
}

export default function PadletBoardHeader({
  title,
  onBack,
  onShareClick,
  showShare = true,
}: PadletBoardHeaderProps) {
  return (
    <>
      <button type="button" className={styles.back} onClick={onBack}>
        <ArrowRight size={18} strokeWidth={2} />
        חזרה לבית
      </button>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {showShare ? (
          <button
            type="button"
            className={styles.share}
            onClick={onShareClick}
          >
            <Share2 size={16} strokeWidth={2} />
            שיתוף
          </button>
        ) : null}
      </header>
    </>
  );
}
