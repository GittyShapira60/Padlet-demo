import styles from './CreatePadletCard.module.css';

interface CreatePadletCardProps {
  onClick: () => void;
}

export default function CreatePadletCard({ onClick }: CreatePadletCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <span className={styles.plus} aria-hidden="true">
        +
      </span>
      <span className={styles.text}>צור לוח חדש</span>
    </button>
  );
}
