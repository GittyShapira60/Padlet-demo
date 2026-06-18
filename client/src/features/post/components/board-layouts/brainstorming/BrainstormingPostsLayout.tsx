import type { PostLayout } from '../../../interfaces/post';
import type { BoardLayoutProps } from '../board-layout-props';
import BrainstormingPostCard from './BrainstormingPostCard';
import styles from './BrainstormingPostsLayout.module.css';

const TILTS = [-4.5, 3, -2.5, 4, -3.5, 2, -5, 1.5];

function getDefaultLayout(index: number): PostLayout {
  const column = index % 3;
  const row = Math.floor(index / 3);

  return {
    x: 4 + column * 31 + (row % 2 === 0 ? 2 : -1),
    y: 6 + row * 16 + (column % 2 === 0 ? 1 : 0),
  };
}

export default function BrainstormingPostsLayout({
  posts,
  currentUsername,
  onEditPost,
  onDeletePost,
}: BoardLayoutProps) {
  return (
    <div className={styles.canvas}>
      {posts.map((post, index) => {
        const layout = post.layout ?? getDefaultLayout(index);
        const tilt = TILTS[index % TILTS.length];
        const canManage = currentUsername === post.authorUsername;

        return (
          <div
            key={post.id}
            className={styles.post}
            style={{
              top: `${layout.y}%`,
              right: `${layout.x}%`,
              transform: `rotate(${tilt}deg)`,
            }}
          >
            <BrainstormingPostCard
              post={post}
              canManage={canManage}
              onEdit={onEditPost}
              onDelete={onDeletePost}
            />
          </div>
        );
      })}
    </div>
  );
}
