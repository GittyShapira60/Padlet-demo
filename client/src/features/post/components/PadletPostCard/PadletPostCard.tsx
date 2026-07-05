import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { BACKGROUND_COLOR_LIGHT } from '../../../../shared/constants/background-colors';
import { formatRelativeTime } from '../../../../shared/utils/format-relative-time';
import { scrollActivityIntoViewAfterLayout, hasActiveScrollActivity } from '../../../../shared/utils/scroll-activity-into-view';
import { MoreVertical, Pencil, Trash2 } from '../../../../shared/icons';
import { useAuth } from '../../../auth/context/AuthProvider';
import type { Post } from '../../interfaces/post';
import { PostComments } from '../../../comment';
import { COMMENTS_SCROLL_THRESHOLD } from '../../../comment/constants/comments-scroll';
import { usePostComments } from '../../../comment/hooks/usePostComments';
import PostInteractionBar from '../PostInteractionBar/PostInteractionBar';
import PollView from './PollView/PollView';
import styles from './PadletPostCard.module.css';
import scrollableStyles from '../../../../shared/styles/scrollable.module.css';

type PadletPostCardVariant = 'card' | 'bubble';

interface PadletPostCardProps {
  post: Post;
  padletId: string;
  canManage?: boolean;
  canComment?: boolean;
  variant?: PadletPostCardVariant;
  commentsCollapsible?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onContentResize?: () => void;
}

function getPostBodyClassName(variant: PadletPostCardVariant, isImage: boolean): string {
  if (isImage) {
    return variant === 'bubble'
      ? `${styles.imageContent} ${styles.bubbleContent}`
      : styles.imageContent;
  }

  return variant === 'bubble'
    ? `${styles.content} ${scrollableStyles.scrollableY} ${styles.bubbleContent}`
    : `${styles.content} ${scrollableStyles.scrollableY}`;
}

function PostActions({ post, onEdit, onDelete }: {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`${styles.actions} padlet-post-actions`}>
      <button
        type="button"
        className={styles.actionBtn}
        aria-label="אפשרויות"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MoreVertical size={14} />
      </button>
      {isOpen ? (
        <div className={styles.actionsDropdown}>
          <button
            type="button"
            className={styles.actionsDropdownItem}
            onClick={() => { setIsOpen(false); onEdit?.(post); }}
          >
            <Pencil size={13} strokeWidth={2} aria-hidden="true" />
            עריכה
          </button>
          <button
            type="button"
            className={`${styles.actionsDropdownItem} ${styles.actionsDropdownItemDelete}`}
            onClick={() => { setIsOpen(false); onDelete?.(post); }}
          >
            <Trash2 size={13} strokeWidth={2} aria-hidden="true" />
            מחיקה
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function PadletPostCard({
  post,
  padletId,
  canManage = false,
  canComment = false,
  variant = 'card',
  commentsCollapsible = false,
  onEdit,
  onDelete,
  onContentResize,
}: PadletPostCardProps) {
  const { user } = useAuth();
  const cardRef = useRef<HTMLElement>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { comments, error, sendComment, removeComment, editComment } = usePostComments(
    padletId,
    post.id,
    canComment,
  );
  const scrollableComments = comments.length > COMMENTS_SCROLL_THRESHOLD;
  const background = BACKGROUND_COLOR_LIGHT[post.color ?? ''] ?? post.color ?? '#ffffff';
  const authorInitial = post.authorUsername.charAt(0).toUpperCase();
  const cardStyle = post.poll
    ? {
        background: '#ffffff',
        border: `2px solid ${post.color ?? '#e5e7eb'}`,
      }
    : { background };
  const showComments = canComment && (!commentsCollapsible || commentsOpen);

  useEffect(() => {
    onContentResize?.();
  }, [comments.length, post.imageUrl, post.poll, post.postType, post.title, post.description, post.subject, showComments, onContentResize]);

  useEffect(() => {
    if (!showComments) {
      return;
    }

    const node = cardRef.current;
    if (!node) {
      return;
    }

    let frameId = 0;
    const observer = new ResizeObserver(() => {
      if (!hasActiveScrollActivity(node)) {
        return;
      }

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        scrollActivityIntoViewAfterLayout(node);
      });
    });

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [post.id, showComments]);

  const body = (
    <>
      {canManage ? (
        <PostActions post={post} onEdit={onEdit} onDelete={onDelete} />
      ) : null}

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
        <div className={getPostBodyClassName(variant, true)}>
          {(post.description ?? post.title) ? <p className={styles.imageDescription}>{post.description ?? post.title}</p> : null}
          <img
            src={post.imageUrl ?? ''}
            alt={post.description ?? post.title ?? 'תמונה'}
            className={styles.postImage}
            data-no-drag
            onClick={() => setIsImageOpen(true)}
            onLoad={onContentResize}
          />
          {isImageOpen ? createPortal(
            <div
              className={styles.lightboxOverlay}
              onClick={() => setIsImageOpen(false)}
              data-no-drag
              role="dialog"
              aria-modal="true"
              aria-label="תמונה בגודל מלא"
            >
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setIsImageOpen(false)}
                aria-label="סגור"
                data-no-drag
              >
                ✕
              </button>
              <img
                src={post.imageUrl ?? ''}
                alt={post.description ?? post.title ?? 'תמונה'}
                className={styles.lightboxImage}
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body
          ) : null}
        </div>
      ) : post.postType === 'link' ? (
        <div className={getPostBodyClassName(variant, false)}>
          {(post.description ?? post.title) ? <p className={styles.linkDescription}>{post.description ?? post.title}</p> : null}
          <a
            href={post.subject ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkAnchor}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.linkUrl}>{post.subject}</span>
          </a>
        </div>
      ) : (
        <div className={getPostBodyClassName(variant, false)}>
          {post.title ? <h3 className={styles.title}>{post.title}</h3> : null}
          {post.subject ? <p className={styles.subject}>{post.subject}</p> : null}
        </div>
      )}

      <PostInteractionBar
        postId={post.id}
        commentCount={comments.length}
        showCommentCount={canComment}
        onCommentToggle={
          commentsCollapsible ? () => setCommentsOpen((open) => !open) : undefined
        }
        commentsExpanded={commentsCollapsible ? commentsOpen : false}
      />

      {showComments ? (
        <PostComments
          comments={comments}
          error={error}
          currentUsername={user?.username}
          canComment={canComment}
          scrollableList={scrollableComments}
          compactScrollableList={scrollableComments}
          onSendComment={sendComment}
          onDeleteComment={removeComment}
          onEditComment={editComment}
        />
      ) : null}
    </>
  );

  if (variant === 'bubble') {
    return (
      <div ref={cardRef as RefObject<HTMLDivElement>}>
        {body}
      </div>
    );
  }

  return (
    <article ref={cardRef as RefObject<HTMLElement>} className={styles.card} style={cardStyle}>
      {body}
    </article>
  );
}