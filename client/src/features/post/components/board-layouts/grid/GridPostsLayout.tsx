import type { BoardLayoutProps } from '../board-layout-props';
import BoardLayoutPostCard from '../shared/BoardLayoutPostCard';
import MasonryCanvas from '../shared/MasonryCanvas';
import styles from './GridPostsLayout.module.css';

export default function GridPostsLayout({
  padletId,
  posts,
  canComment,
  canEditPost,
  onEditPost,
  onDeletePost,
}: BoardLayoutProps) {
  const cardProps = { padletId, canComment, canEditPost, onEditPost, onDeletePost };

  return (
    <MasonryCanvas
      items={posts}
      canvasClassName={styles.canvas}
      itemClassName={styles.item}
      renderItem={(post) => <BoardLayoutPostCard post={post} {...cardProps} />}
    />
  );
}
