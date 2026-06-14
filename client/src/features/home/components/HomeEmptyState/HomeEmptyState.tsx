import { Pin } from '../../../../shared/icons';
import styles from './HomeEmptyState.module.css';

interface HomeEmptyStateProps {
  onCreateClick: () => void;
}

export default function HomeEmptyState({ onCreateClick }: HomeEmptyStateProps) {
  return (
    <section className={styles.empty}>
      <Pin className={styles.icon} size={48} aria-hidden="true" />
      <h2 className={styles.title}>אין לך לוחות עדיין</h2>
      <p className={styles.text}>צור את הלוח הראשון שלך!</p>
      <button type="button" className={styles.button} onClick={onCreateClick}>
        צור לוח חדש
      </button>
    </section>
  );
}
