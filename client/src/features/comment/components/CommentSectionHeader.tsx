import { MessageCircle } from '../../../shared/icons';
import styles from './PostComments.module.css';

interface CommentSectionHeaderProps {
  count: number;
  onToggle?: () => void;
}

export default function CommentSectionHeader({
  count,
  onToggle,
}: CommentSectionHeaderProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <div className={styles.header}>
      <button type="button" className={styles.countBtn} onClick={onToggle}>
        <MessageCircle size={15} strokeWidth={1.75} />
        <span className={styles.count}>{count}</span>
      </button>
    </div>
  );
}
