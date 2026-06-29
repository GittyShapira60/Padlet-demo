import type { PostLayout } from '../../../interfaces/post';
import type { BoardLayoutProps } from '../board-layout-props';
import BrainstormingPostCard from './BrainstormingPostCard';
import styles from './BrainstormingPostsLayout.module.css';

const TILTS = [-4.5, 3, -2.5, 4, -3.5, 2, -5, 1.5];

function getDefaultLayout(index: number): PostLayout {
  const column = index % 2;
  const row = Math.floor(index / 2);

  return {
    x: 6 + column * 48 + (row % 2 === 0 ? 2 : -2),
    y: 4 + row * 32 + (column % 2 === 0 ? 4 : 0),
  };
}

export default function BrainstormingPostsLayout({
  padletId,
  posts,
  canComment,
  canEditPost,
  onEditPost,
  onDeletePost,
}: BoardLayoutProps) {
  return (
    <div className={styles.canvas}>
      {posts.map((post, index) => {
        const layout = getDefaultLayout(index);
        const tilt = TILTS[index % TILTS.length];

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
              padletId={padletId}
              canManage={canEditPost(post)}
              canComment={canComment}
              onEdit={onEditPost}
              onDelete={onDeletePost}
            />
          </div>
        );
      })}
    </div>
  );
}
