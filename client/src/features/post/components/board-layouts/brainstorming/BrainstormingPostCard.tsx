import { useState } from 'react';
import { BACKGROUND_COLOR_LIGHT } from '../../../../../shared/constants/background-colors';
import { formatRelativeTime } from '../../../../../shared/utils/format-relative-time';
import { ExternalLink } from '../../../../../shared/icons';
import { useAuth } from '../../../../auth/context/AuthProvider';
import type { Post } from '../../../interfaces/post';
import { PostComments } from '../../../../comment';
import { usePostComments } from '../../../../comment/hooks/usePostComments';
import PostInteractionBar from '../../PostInteractionBar/PostInteractionBar';
import cardStyles from '../../PadletPostCard/PadletPostCard.module.css';
import ThoughtBubble from './ThoughtBubble/ThoughtBubble';

interface BrainstormingPostCardProps {
  post: Post;
  padletId: string;
  canManage?: boolean;
  canComment?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

export default function BrainstormingPostCard({
  post,
  padletId,
  canComment = false,
}: BrainstormingPostCardProps) {
  const { user } = useAuth();
  const { comments, error, sendComment, removeComment, editComment } = usePostComments(
    padletId,
    post.id,
    canComment,
  );
  const [commentsOpen, setCommentsOpen] = useState(false);
  const background = BACKGROUND_COLOR_LIGHT[post.color ?? ''] ?? post.color ?? '#ffffff';
  const authorInitial = post.authorUsername.charAt(0).toUpperCase();

  return (
    <ThoughtBubble color={background}>
      <header className={cardStyles.header}>
        <div className={cardStyles.authorMeta}>
          <span className={cardStyles.avatar}>{authorInitial}</span>
          <div className={cardStyles.authorInfo}>
            <p className={cardStyles.authorName}>{post.authorUsername}</p>
            <p className={cardStyles.authorTime}>{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>
      </header>

      {post.postType === 'image' ? (
        <div className={`${cardStyles.imageContent} ${cardStyles.bubbleContent}`}>
          {(post.description ?? post.title) ? <p className={cardStyles.imageDescription}>{post.description ?? post.title}</p> : null}
          <img src={post.imageUrl ?? ''} alt={post.description ?? post.title ?? 'תמונה'} className={cardStyles.postImage} />
        </div>
      ) : post.postType === 'link' ? (
        <div className={`${cardStyles.content} ${cardStyles.bubbleContent}`}>
          {(post.description ?? post.title) ? <p className={cardStyles.linkDescription}>{post.description ?? post.title}</p> : null}
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

      <PostInteractionBar
        postId={post.id}
        commentCount={comments.length}
        showCommentCount={canComment}
        onCommentToggle={() => setCommentsOpen((open) => !open)}
        commentsExpanded={commentsOpen}
      />

      {canComment && commentsOpen ? (
        <PostComments
          comments={comments}
          error={error}
          currentUsername={user?.username}
          canComment={canComment}
          scrollableList
          compactScrollableList
          onSendComment={sendComment}
          onDeleteComment={removeComment}
          onEditComment={editComment}
        />
      ) : null}
    </ThoughtBubble>
  );
}
