import BoardPostCard from '../BoardPostCard';
import type { BoardLayoutProps } from '../board-layout-props';
import styles from './GridPostsLayout.module.css';

export default function GridPostsLayout({
  posts,
  canEditPost,
  onEditPost,
  onDeletePost,
}: BoardLayoutProps) {
  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <div key={post.id} className={styles.item}>
          <BoardPostCard
            post={post}
            canManage={canEditPost(post)}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
          />
        </div>
      ))}
    </div>
  );
}
