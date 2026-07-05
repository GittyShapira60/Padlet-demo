import type { BoardLayoutProps } from '../board-layout-props';
import MasonryCanvas from '../shared/MasonryCanvas';
import BrainstormingPostCard from './BrainstormingPostCard';
import styles from './BrainstormingPostsLayout.module.css';

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
  const cardProps = {
    padletId,
    canComment,
    onEdit: onEditPost,
    onDelete: onDeletePost,
  };

  return (
    <MasonryCanvas
      items={posts}
      canvasClassName={styles.canvas}
      itemClassName={styles.post}
      getItemStyle={(index) => ({
        transform: `rotate(${getBrainstormTilt(index)}deg)`,
      })}
      renderItem={(post) => (
        <BrainstormingPostCard
          post={post}
          {...cardProps}
          canManage={canEditPost(post)}
        />
      )}
    />
  );
}
