import { resolveBackgroundStyle } from '../../../../../shared/constants/background-colors';
import styles from './CreatePadletModalHeader.module.css';

interface CreatePadletModalHeaderProps {
  title: string;
  background: string;
  onClose: () => void;
}

export default function CreatePadletModalHeader({
  title,
  background,
  onClose,
}: CreatePadletModalHeaderProps) {
  return (
    <header className={styles.header} style={resolveBackgroundStyle(background)}>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={onClose}
      >
        ✕
      </button>
      <h2 className={styles.title}>
        {title.trim() || 'שם הלוח...'}
      </h2>
    </header>
  );
}
