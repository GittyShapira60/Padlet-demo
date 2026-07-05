import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';
import type { Comment } from '../types/comment';
import scrollableStyles from '../../../shared/styles/scrollable.module.css';
import styles from './PostComments.module.css';

interface PostCommentsProps {
  comments: Comment[];
  error?: string;
  currentUsername?: string | null;
  canComment?: boolean;
  scrollableList?: boolean;
  compactScrollableList?: boolean;
  onSendComment: (body: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onEditComment?: (commentId: string, body: string) => Promise<void>;
}

export default function PostComments({
  comments,
  error = '',
  currentUsername,
  canComment = true,
  scrollableList = false,
  compactScrollableList = false,
  onSendComment,
  onDeleteComment,
  onEditComment,
}: PostCommentsProps) {
  const hasComments = comments.length > 0;
  const listClassName = [
    styles.list,
    scrollableList ? scrollableStyles.scrollableY : '',
    scrollableList ? styles.listScrollable : '',
    compactScrollableList ? styles.listScrollableCompact : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={styles.section} data-no-drag>
      {error ? <p className={styles.error}>{error}</p> : null}

      {hasComments ? (
        <div className={listClassName}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={
                Boolean(currentUsername) &&
                comment.authorUsername === currentUsername
              }
              onDelete={onDeleteComment}
              onEdit={onEditComment}
            />
          ))}
        </div>
      ) : null}

      {canComment ? (
        <CommentComposer onSend={onSendComment} />
      ) : null}
    </section>
  );
}
