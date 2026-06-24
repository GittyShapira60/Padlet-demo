import headerStyles from './SharePadletModalHeader.module.css';

interface SharePadletModalHeaderProps {
  title: string;
  onClose: () => void;
}

export default function SharePadletModalHeader({
  title,
  onClose,
}: SharePadletModalHeaderProps) {
  return (
    <div className={headerStyles.header}>
      <h2 className={headerStyles.title}>{title}</h2>
      <button
        type="button"
        className={headerStyles.closeBtn}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}
