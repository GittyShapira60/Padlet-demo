import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';
import CommentSectionHeader from './CommentSectionHeader';
import { usePostComments } from '../hooks/usePostComments';
import styles from './PostComments.module.css';

interface PostCommentsProps {
  padletId: string;
  postId: string;
  canComment?: boolean;
}

export default function PostComments({
  padletId,
  postId,
  canComment = true,
}: PostCommentsProps) {
  const { comments, sendComment } = usePostComments(padletId, postId);
  const hasComments = comments.length > 0;

  return (
    <section className={styles.section}>
      {hasComments ? (
        <>
          <CommentSectionHeader count={comments.length} />
          <div className={styles.list}>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </>
      ) : null}

      {canComment ? (
        <CommentComposer onSend={(body) => void sendComment(body)} />
      ) : null}
    </section>
  );
}
