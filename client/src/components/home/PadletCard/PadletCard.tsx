import { useNavigate } from 'react-router-dom';
import type { Padlet } from '../../../interfaces/padlet';
import { Calendar, LayoutDashboard, Lock, Users } from '../../icons';
import styles from './PadletCard.module.css';

interface PadletCardProps {
  padlet: Padlet;
}

export default function PadletCard({ padlet }: PadletCardProps) {
  const navigate = useNavigate();
  const postLabel = padlet.postCount === 1 ? 'פוסט' : 'פוסטים';
  const cardClassName = padlet.isShared
    ? `${styles.card} ${styles.shared}`
    : styles.card;

  function handleOpen() {
    navigate(`/padlets/${padlet.id}`);
  }

  return (
    <button
      type="button"
      className={cardClassName}
      style={{ background: padlet.background ?? undefined }}
      onClick={handleOpen}
      aria-label={`פתיחת לוח ${padlet.title}`}
    >
      <div className={styles.top}>
        {padlet.isShared ? (
          <div className={styles.meta}>
            <span className={styles.sharedBadge}>
              <Users size={11} strokeWidth={1.5} aria-hidden="true" />
              משותף איתי
            </span>
            <span className={styles.utilityIcon} aria-hidden="true">
              <Lock size={12} strokeWidth={1.5} />
            </span>
            <span className={styles.utilityIcon} aria-hidden="true">
              <Calendar size={12} strokeWidth={1.5} />
            </span>
          </div>
        ) : (
          <span className={styles.cardIcon} aria-hidden="true">
            <LayoutDashboard size={14} strokeWidth={1.5} />
          </span>
        )}
      </div>

      <div className={styles.footer}>
        <h4 className={styles.title}>{padlet.title}</h4>
        {padlet.description ? (
          <p className={styles.description}>{padlet.description}</p>
        ) : null}
        <p className={styles.posts}>
          {padlet.postCount} {postLabel}
        </p>
      </div>
    </button>
  );
}
