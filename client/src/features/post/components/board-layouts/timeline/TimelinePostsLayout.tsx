import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import type { BoardLayoutProps } from '../board-layout-props';
import BoardLayoutPostCard from '../shared/BoardLayoutPostCard';
import { scrollTimelinePostIntoView } from '../../../../../shared/utils/scroll-activity-into-view';
import styles from './TimelinePostsLayout.module.css';

type TimelinePostsLayoutProps = BoardLayoutProps & {
  scrollToPostId?: string | null;
  onScrollToPostComplete?: () => void;
};

export default function TimelinePostsLayout({
  padletId,
  posts,
  canComment,
  canEditPost,
  onEditPost,
  onDeletePost,
  scrollToPostId = null,
  onScrollToPostComplete,
}: TimelinePostsLayoutProps) {
  const cardProps = { padletId, canComment, canEditPost, onEditPost, onDeletePost };
  const scrolledToPostIdRef = useRef<string | null>(null);
  const timelinePosts = useMemo(
    () =>
      [...posts].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      ),
    [posts],
  );

  useLayoutEffect(() => {
    if (!scrollToPostId) {
      scrolledToPostIdRef.current = null;
    }
  }, [scrollToPostId]);

  const scrollToNewPost = useCallback(
    (postId: string, node: HTMLDivElement | null) => {
      if (
        !node
        || scrollToPostId !== postId
        || scrolledToPostIdRef.current === postId
      ) {
        return;
      }

      scrolledToPostIdRef.current = postId;
      requestAnimationFrame(() => {
        scrollTimelinePostIntoView(node);
        onScrollToPostComplete?.();
      });
    },
    [scrollToPostId, onScrollToPostComplete],
  );

  return (
    <div className={styles.root}>
      <div className={styles.track} data-timeline-track>
        <div className={styles.trackInner}>
          <div className={styles.line} aria-hidden />
          {timelinePosts.map((post) => (
            <div
              key={post.id}
              ref={scrollToPostId === post.id ? (node) => scrollToNewPost(post.id, node) : undefined}
              className={styles.post}
              data-timeline-post={post.id}
            >
              <time className={styles.date} dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString('he-IL', {
                  day: 'numeric',
                  month: 'short',
                })}
              </time>
              <BoardLayoutPostCard post={post} {...cardProps} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
