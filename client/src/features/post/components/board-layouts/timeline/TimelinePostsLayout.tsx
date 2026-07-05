import { useMemo } from 'react';
import type { BoardLayoutProps } from '../board-layout-props';
import BoardLayoutPostCard from '../shared/BoardLayoutPostCard';
import styles from './TimelinePostsLayout.module.css';

export default function TimelinePostsLayout({
  padletId,
  posts,
  canComment,
  canEditPost,
  onEditPost,
  onDeletePost,
}: BoardLayoutProps) {
  const cardProps = { padletId, canComment, canEditPost, onEditPost, onDeletePost };
  const timelinePosts = useMemo(
    () =>
      [...posts].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      ),
    [posts],
  );

  return (
    <div className={styles.root}>      <div className={styles.track} data-timeline-track>
        <div className={styles.trackInner}>
          <div className={styles.line} aria-hidden />
          {timelinePosts.map((post) => (
            <div key={post.id} className={styles.post} data-timeline-post={post.id}>
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
