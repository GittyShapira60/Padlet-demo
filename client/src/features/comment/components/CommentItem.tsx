import { MoreVertical } from '../../../shared/icons';
import type { Comment } from '../types/comment';
import styles from './PostComments.module.css';

interface CommentItemProps {
  comment: Comment;
  onMenuClick?: (comment: Comment) => void;
}

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return 'לפני פחות מדקה';
  }

  if (diffMinutes < 60) {
    return `לפני ${diffMinutes} דקות`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `לפני ${diffHours} שעות`;
  }

  return new Date(isoDate).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
  });
}

export default function CommentItem({ comment, onMenuClick }: CommentItemProps) {
  const initial = comment.authorUsername.charAt(0).toUpperCase();

  return (
    <article className={styles.item}>
      <div className={styles.content}>
        <div className={styles.metaRow}>
          <span className={styles.avatar}>{initial}</span>
          <div className={styles.meta}>
            <p className={styles.commentAuthor}>{comment.authorUsername}</p>
            <p className={styles.time}>{formatRelativeTime(comment.createdAt)}</p>
          </div>
        </div>
        <p className={styles.body}>{comment.body}</p>
      </div>

      <button
        type="button"
        className={styles.menuBtn}
        onClick={() => onMenuClick?.(comment)}
      >
        <MoreVertical size={15} strokeWidth={1.75} />
      </button>
    </article>
  );
}
