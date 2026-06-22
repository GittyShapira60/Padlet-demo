import BoardPostCard from '../BoardPostCard';
import type { BoardLayoutProps } from '../board-layout-props';
import styles from './GridPostsLayout.module.css';

export default function GridPostsLayout({
  padletId,
  posts,
  currentUsername,
  canComment,
  onEditPost,
  onDeletePost,
}: BoardLayoutProps) {
  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <div key={post.id} className={styles.item}>
          <BoardPostCard
            post={post}
            padletId={padletId}
            currentUsername={currentUsername}
            canComment={canComment}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
          />
        </div>
      ))}
    </div>
  );
}
