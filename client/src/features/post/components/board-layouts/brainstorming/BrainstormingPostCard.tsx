import { Pencil, Trash2 } from '../../../../../shared/icons';
import type { Post } from '../../../interfaces/post';
import { PostReaction } from '../../../../reaction';
import cardStyles from '../../PadletPostCard/PadletPostCard.module.css';
import ThoughtBubble from './ThoughtBubble/ThoughtBubble';

interface BrainstormingPostCardProps {
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
    <div
      className={`${cardStyles.actions} ${cardStyles.actionsInline} padlet-post-actions`}
    >
      <button
        type="button"
        className={cardStyles.actionBtn}
        aria-label="עריכת פוסט"
        onClick={() => onEdit?.(post)}
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        className={`${cardStyles.actionBtn} ${cardStyles.deleteBtn}`}
        aria-label="מחיקת פוסט"
        onClick={() => onDelete?.(post)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function BrainstormingPostCard({
  post,
  canManage = false,
  onEdit,
  onDelete,
}: BrainstormingPostCardProps) {
  const background = post.color ?? '#ffffff';

  return (
    <ThoughtBubble
      color={background}
      footer={
        <>
          <p className={`${cardStyles.author} ${cardStyles.bubbleAuthor}`}>
            {post.authorUsername}
          </p>
          {canManage ? (
            <PostActions post={post} onEdit={onEdit} onDelete={onDelete} />
          ) : null}
        </>
      }
    >
      <div className={`${cardStyles.content} ${cardStyles.bubbleContent}`}>
        {post.title ? <h3 className={cardStyles.title}>{post.title}</h3> : null}
        {post.subject ? (
          <p className={cardStyles.subject}>{post.subject}</p>
        ) : null}
      </div>
      <PostReaction postId={post.id} />
    </ThoughtBubble>
  );
}
