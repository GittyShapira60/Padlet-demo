import BoardPostCard from '../BoardPostCard';
import type { BoardLayoutProps } from '../board-layout-props';
import styles from './TimelinePostsLayout.module.css';

export default function TimelinePostsLayout({
  posts,
  currentUsername,
  onEditPost,
  onDeletePost,
}: BoardLayoutProps) {
  const timelinePosts = [...posts].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );

  return (
    <div className={styles.track}>
      <div className={styles.line} />
      {timelinePosts.map((post) => (
        <div key={post.id} className={styles.post}>
          <time className={styles.date} dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString('he-IL', {
              day: 'numeric',
              month: 'short',
            })}
          </time>
          <BoardPostCard
            post={post}
            currentUsername={currentUsername}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
          />
        </div>
      ))}
    </div>
  );
}
