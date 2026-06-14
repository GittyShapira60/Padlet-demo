import { ArrowRight } from '../../../../shared/icons';
import styles from './PadletBoardHeader.module.css';

interface PadletBoardHeaderProps {
  title: string;
  onBack: () => void;
}

export default function PadletBoardHeader({
  title,
  onBack,
}: PadletBoardHeaderProps) {
  return (
    <>
      <button type="button" className={styles.back} onClick={onBack}>
        <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
        חזרה לבית
      </button>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
      </header>
    </>
  );
}
