import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';
import type { Comment } from '../types/comment';
import styles from './PostComments.module.css';

interface PostCommentsProps {
  comments: Comment[];
  error?: string;
  currentUsername?: string | null;
  canComment?: boolean;
  onSendComment: (body: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onEditComment?: (commentId: string, body: string) => Promise<void>;
}

export default function PostComments({
  comments,
  error = '',
  currentUsername,
  canComment = true,
  onSendComment,
  onDeleteComment,
  onEditComment,
}: PostCommentsProps) {
  const hasComments = comments.length > 0;

  return (
    <section className={styles.section}>
      {error ? <p className={styles.error}>{error}</p> : null}

      {hasComments ? (
        <div className={styles.list}>
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
