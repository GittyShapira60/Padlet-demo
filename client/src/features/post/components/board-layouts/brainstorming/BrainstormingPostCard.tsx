import { BACKGROUND_COLOR_LIGHT } from '../../../../../shared/constants/background-colors';
import { ExternalLink, Pencil, Trash2 } from '../../../../../shared/icons';
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
        onClick={() => onEdit?.(post)}
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        className={`${cardStyles.actionBtn} ${cardStyles.deleteBtn}`}
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
  const background = BACKGROUND_COLOR_LIGHT[post.color ?? ''] ?? post.color ?? '#ffffff';

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
      {post.postType === 'image' ? (
        <div className={`${cardStyles.imageContent} ${cardStyles.bubbleContent}`}>
          {post.title ? <p className={cardStyles.imageDescription}>{post.title}</p> : null}
          <img src={post.imageUrl ?? ''} alt={post.title ?? 'תמונה'} className={cardStyles.postImage} />
        </div>
      ) : post.postType === 'link' ? (
        <div className={`${cardStyles.content} ${cardStyles.bubbleContent}`}>
          {post.title && post.title !== 'קישור' ? <p className={cardStyles.linkDescription}>{post.title}</p> : null}
          <a
            href={post.subject ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={cardStyles.linkAnchor}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
            <span className={cardStyles.linkUrl}>{post.subject}</span>
          </a>
        </div>
      ) : (
        <div className={`${cardStyles.content} ${cardStyles.bubbleContent}`}>
          {post.title ? <h3 className={cardStyles.title}>{post.title}</h3> : null}
          {post.subject ? (
            <p className={cardStyles.subject}>{post.subject}</p>
          ) : null}
        </div>
      )}
      <PostReaction postId={post.id} />
    </ThoughtBubble>
  );
}
