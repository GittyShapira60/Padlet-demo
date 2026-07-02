import { MessageCircle } from '../../../../shared/icons';
import { PostReaction } from '../../../reaction';
import styles from './PostInteractionBar.module.css';

interface PostInteractionBarProps {
  postId: string;
  commentCount: number;
  showCommentCount?: boolean;
  showReactionAddButton?: boolean;
  onCommentToggle?: () => void;
  commentsExpanded?: boolean;
}

export default function PostInteractionBar({
  postId,
  commentCount,
  showCommentCount = true,
  showReactionAddButton = true,
  onCommentToggle,
  commentsExpanded = false,
}: PostInteractionBarProps) {
  const commentIndicator = (
    <>
      <MessageCircle size={15} strokeWidth={1.75} />
      <span className={styles.count}>{commentCount}</span>
    </>
  );

  return (
    <div className={styles.bar}>
      <div className={styles.reactionsWrap}>
        <PostReaction
          postId={postId}
          variant="inline"
          showAddButton={showReactionAddButton}
        />
      </div>

      {showCommentCount ? (
        onCommentToggle ? (
          <button
            type="button"
            className={`${styles.commentToggle} ${commentsExpanded ? styles.commentToggleActive : ''}`}
            onClick={onCommentToggle}
            aria-expanded={commentsExpanded}
            aria-label="הצג תגובות"
          >
            {commentIndicator}
          </button>
        ) : (
          <div className={styles.commentCount}>{commentIndicator}</div>
        )
      ) : null}
    </div>
  );
}
