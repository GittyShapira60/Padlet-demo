import { resolveBackgroundStyle, isLightBackground } from '../../../../../shared/constants/background-colors';
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
  const isLight = isLightBackground(background);
  const textColor = isLight ? '#1e293b' : '#ffffff';
  const btnBg = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.22)';
  const btnBgHover = isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.35)';

  return (
    <header
      className={styles.header}
      style={{
        ...resolveBackgroundStyle(background),
        '--modal-title-color': textColor,
        '--modal-btn-bg': btnBg,
        '--modal-btn-bg-hover': btnBgHover,
      } as React.CSSProperties}
    >
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
