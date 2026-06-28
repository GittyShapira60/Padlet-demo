import { MessageCircle } from '../../../../shared/icons';
import { PostReaction } from '../../../reaction';
import styles from './PostInteractionBar.module.css';

interface PostInteractionBarProps {
  postId: string;
  commentCount: number;
  showCommentCount?: boolean;
}

export default function PostInteractionBar({
  postId,
  commentCount,
  showCommentCount = true,
}: PostInteractionBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.reactionsWrap}>
        <PostReaction postId={postId} variant="inline" />
      </div>

      {showCommentCount ? (
        <div className={styles.commentCount}>
          <MessageCircle size={15} strokeWidth={1.75} />
          <span className={styles.count}>{commentCount}</span>
        </div>
      ) : null}
    </div>
  );
}
