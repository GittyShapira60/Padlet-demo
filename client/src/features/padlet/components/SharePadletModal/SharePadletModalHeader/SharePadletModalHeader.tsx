import headerStyles from './SharePadletModalHeader.module.css';

interface SharePadletModalHeaderProps {
  title: string;
  titleId: string;
  onClose: () => void;
}

export default function SharePadletModalHeader({
  title,
  titleId,
  onClose,
}: SharePadletModalHeaderProps) {
  return (
    <div className={headerStyles.header}>
      <h2 id={titleId} className={headerStyles.title}>
        {title}
      </h2>
      <button
        type="button"
        className={headerStyles.closeBtn}
        onClick={onClose}
        aria-label="סגור"
      >
        ×
      </button>
    </div>
  );
}
