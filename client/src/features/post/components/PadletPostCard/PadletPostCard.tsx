import { Pencil, Trash2 } from '../../../../shared/icons';
import type { Post } from '../../interfaces/post';
import styles from './PadletPostCard.module.css';

interface PadletPostCardProps {
  post: Post;
  canManage?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

export default function PadletPostCard({
  post,
  canManage = false,
  onEdit,
  onDelete,
}: PadletPostCardProps) {
  return (
    <article
      className={styles.card}
      style={{ background: post.color ?? '#ffffff' }}
    >
      {canManage ? (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            aria-label="עריכת פוסט"
            onClick={() => onEdit?.(post)}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            aria-label="מחיקת פוסט"
            onClick={() => onDelete?.(post)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : null}

      {post.title ? <h3 className={styles.title}>{post.title}</h3> : null}
      {post.subject ? <p className={styles.subject}>{post.subject}</p> : null}
      <p className={styles.author}>{post.authorUsername}</p>
    </article>
  );
}
