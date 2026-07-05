import { useMemo } from 'react';
import type { BoardLayoutProps } from '../board-layout-props';
import BoardLayoutPostCard from '../shared/BoardLayoutPostCard';
import SwappableMasonryCanvas from '../shared/SwappableMasonryCanvas';
import { sortFreeWallPosts } from './free-wall-order';
import styles from './FreeWallPostsLayout.module.css';

export default function FreeWallPostsLayout({
  padletId,
  posts,
  canComment,
  canEditPost,
  canDragPost,
  onEditPost,
  onDeletePost,
  onPostSwap,
}: BoardLayoutProps) {
  const orderedPosts = useMemo(() => sortFreeWallPosts(posts), [posts]);
  const cardProps = { padletId, canComment, canEditPost, onEditPost, onDeletePost };

  return (
    <SwappableMasonryCanvas
      items={orderedPosts}
      canvasClassName={styles.canvas}
      itemClassName={styles.item}
      draggingItemClassName={styles.dragging}
      canDragItem={canDragPost}
      onSwap={onPostSwap}
      renderItem={(post) => <BoardLayoutPostCard post={post} {...cardProps} />}
    />
  );
}
