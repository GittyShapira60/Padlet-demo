import { BACKGROUND_COLOR_LIGHT } from '../../../../shared/constants/background-colors';
import { formatRelativeTime } from '../../../../shared/utils/format-relative-time';
import { ExternalLink, Pencil, Trash2 } from '../../../../shared/icons';
import { useAuth } from '../../../auth/context/AuthProvider';
import type { Post } from '../../interfaces/post';
import { PostComments } from '../../../comment';
import { usePostComments } from '../../../comment/hooks/usePostComments';
import PostInteractionBar from '../PostInteractionBar/PostInteractionBar';
import PollView from './PollView/PollView';
import styles from './PadletPostCard.module.css';

interface PadletPostCardProps {
  post: Post;
  padletId: string;
  canManage?: boolean;
  canComment?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

function PostActions({ post, onEdit, onDelete }: {
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
  padletId,
  canManage = false,
  canComment = false,
  onEdit,
  onDelete,
}: PadletPostCardProps) {
  const { user } = useAuth();
  const { comments, error, sendComment, removeComment, editComment } = usePostComments(
    padletId,
    post.id,
    canComment,
  );
  const background = BACKGROUND_COLOR_LIGHT[post.color ?? ''] ?? post.color ?? '#ffffff';
  const authorInitial = post.authorUsername.charAt(0).toUpperCase();
  const cardStyle = post.poll
    ? {
        background: '#ffffff',
        border: `2px solid ${post.color ?? '#e5e7eb'}`,
      }
    : { background };

  return (
    <article className={styles.card} style={cardStyle}>
      {canManage ? <PostActions post={post} onEdit={onEdit} onDelete={onDelete} /> : null}

      <header className={styles.header}>
        <div className={styles.authorMeta}>
          <span className={styles.avatar}>{authorInitial}</span>
          <div className={styles.authorInfo}>
            <p className={styles.authorName}>{post.authorUsername}</p>
            <p className={styles.authorTime}>{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>
      </header>

      {post.poll ? (
        <PollView postId={post.id} poll={post.poll} accentColor={post.color ?? '#7c3aed'} />
      ) : post.postType === 'image' ? (
        <div className={styles.imageContent}>
          {post.title ? <p className={styles.imageDescription}>{post.title}</p> : null}
          <img src={post.imageUrl ?? ''} alt={post.title ?? 'תמונה'} className={styles.postImage} />
        </div>
      ) : post.postType === 'link' ? (
        <div className={styles.content}>
          {post.title && post.title !== 'קישור' ? <p className={styles.linkDescription}>{post.title}</p> : null}
          <a
            href={post.subject ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkAnchor}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
            <span className={styles.linkUrl}>{post.subject}</span>
          </a>
        </div>
      ) : (
        <div className={styles.content}>
          {post.title ? <h3 className={styles.title}>{post.title}</h3> : null}
          {post.subject ? <p className={styles.subject}>{post.subject}</p> : null}
        </div>
      )}

      <PostInteractionBar
        postId={post.id}
        commentCount={comments.length}
        showCommentCount={canComment}
      />

      {canComment ? (
        <PostComments
          comments={comments}
          error={error}
          currentUsername={user?.username}
          canComment={canComment}
          onSendComment={sendComment}
          onDeleteComment={removeComment}
          onEditComment={editComment}
        />
      ) : null}
    </article>
  );
}