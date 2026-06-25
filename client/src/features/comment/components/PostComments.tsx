import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';
import type { Comment } from '../types/comment';
import styles from './PostComments.module.css';

interface PostCommentsProps {
  comments: Comment[];
  currentUsername?: string | null;
  canComment?: boolean;
  onSendComment: (body: string) => void | Promise<void>;
  onDeleteComment?: (commentId: string) => void | Promise<void>;
  onEditComment?: (commentId: string, body: string) => void | Promise<void>;
}

export default function PostComments({
  comments,
  currentUsername,
  canComment = true,
  onSendComment,
  onDeleteComment,
  onEditComment,
}: PostCommentsProps) {
  const hasComments = comments.length > 0;

  return (
    <section className={styles.section}>
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
              onDelete={(item) => void onDeleteComment?.(item.id)}
              onEdit={(item, body) => void onEditComment?.(item.id, body)}
            />
          ))}
        </div>
      ) : null}

      {canComment ? (
        <CommentComposer onSend={(body) => void onSendComment(body)} />
      ) : null}
    </section>
  );
}
