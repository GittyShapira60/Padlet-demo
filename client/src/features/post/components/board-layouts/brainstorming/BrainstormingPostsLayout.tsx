import type { BoardLayoutProps } from '../board-layout-props';
import BrainstormingPostCard from './BrainstormingPostCard';
import styles from './BrainstormingPostsLayout.module.css';
import { useBrainstormMasonry } from './useBrainstormMasonry';

function getBrainstormTilt(index: number): number {
  return index % 2 === 0 ? 2.5 : -2.5;
}

export default function BrainstormingPostsLayout({
  padletId,
  posts,
  canComment,
  canEditPost,
  onEditPost,
  onDeletePost,
}: BoardLayoutProps) {
  const { containerRef, setItemRef, layout } = useBrainstormMasonry(posts.length);

  return (
    <div
      ref={containerRef}
      className={styles.canvas}
      style={layout ? { height: layout.height } : undefined}
    >
      {posts.map((post, index) => {
        const tilt = getBrainstormTilt(index);
        const position = layout?.positions[index];

        return (
          <div
            key={post.id}
            ref={(el) => setItemRef(index, el)}
            className={styles.post}
            style={
              position
                ? {
                    top: position.top,
                    right: position.right,
                    width: position.width,
                    transform: `rotate(${tilt}deg)`,
                    visibility: 'visible',
                  }
                : {
                    top: 0,
                    right: 0,
                    transform: `rotate(${tilt}deg)`,
                    visibility: 'hidden',
                  }
            }
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
