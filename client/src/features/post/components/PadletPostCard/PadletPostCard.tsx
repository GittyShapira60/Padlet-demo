import { BACKGROUND_COLOR_LIGHT } from '../../../../shared/constants/background-colors';
import { Pencil, Trash2 } from '../../../../shared/icons';
import type { Post } from '../../interfaces/post';
import { PostReaction } from '../../../reaction';
import styles from './PadletPostCard.module.css';

interface PadletPostCardProps {
  post: Post;
  canManage?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

function PostActions({
  post,
  onEdit,
  onDelete,
}: {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}) {
  return (
    <div className={`${styles.actions} padlet-post-actions`}>
      <button
        type="button"
        className={styles.actionBtn}
        onClick={() => onEdit?.(post)}
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        className={`${styles.actionBtn} ${styles.deleteBtn}`}
        onClick={() => onDelete?.(post)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function PadletPostCard({
  post,
  canManage = false,
  onEdit,
  onDelete,
}: PadletPostCardProps) {
  const background = BACKGROUND_COLOR_LIGHT[post.color ?? ''] ?? post.color ?? '#ffffff';

  return (
    <article className={styles.card} style={{ background }}>
      {canManage ? (
        <PostActions post={post} onEdit={onEdit} onDelete={onDelete} />
      ) : null}
      <div className={styles.content}>
        {post.title ? <h3 className={styles.title}>{post.title}</h3> : null}
        {post.subject ? <p className={styles.subject}>{post.subject}</p> : null}
      </div>
      <PostReaction postId={post.id} />
      <p className={styles.author}>{post.authorUsername}</p>
    </article>
  );
}
