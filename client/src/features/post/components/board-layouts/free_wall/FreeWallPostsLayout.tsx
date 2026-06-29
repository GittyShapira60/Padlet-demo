import { useState } from 'react';
import type { PostLayout } from '../../../interfaces/post';
import BoardPostCard from '../BoardPostCard';
import type { BoardLayoutProps } from '../board-layout-props';
import DraggablePost from './DraggablePost';
import styles from './FreeWallPostsLayout.module.css';

function getDefaultLayout(index: number): PostLayout {
  return {
    x: 4 + (index % 3) * 24,
    y: 2 + Math.floor(index / 3) * 14,
  };
}

export default function FreeWallPostsLayout({
  padletId,
  posts,
  canComment,
  canEditPost,
  canDragPost,
  onEditPost,
  onDeletePost,
  onLayoutChange,
}: BoardLayoutProps) {
  const [previewSwap, setPreviewSwap] = useState<{
    dragIndex: number;
    targetIndex: number;
  } | null>(null);

  const allLayouts = posts.map((post, index) => post.layout ?? getDefaultLayout(index));

  // Target post visually moves to the dragged post's home position during drag
  const effectiveLayouts = allLayouts.map((layout, i) => {
    if (previewSwap && i === previewSwap.targetIndex) {
      return allLayouts[previewSwap.dragIndex];
    }
    return layout;
  });

  const handlePreviewSwap = (postIndex: number, targetLayout: PostLayout | null) => {
    if (targetLayout === null) {
      setPreviewSwap(null);
      return;
    }
    const targetIndex = allLayouts.findIndex(
      (l) => l.x === targetLayout.x && l.y === targetLayout.y,
    );
    if (targetIndex !== -1) {
      setPreviewSwap({ dragIndex: postIndex, targetIndex });
    }
  };

  const handleSwap = (postIndex: number, targetLayout: PostLayout) => {
    const targetIndex = allLayouts.findIndex(
      (l) => l.x === targetLayout.x && l.y === targetLayout.y,
    );
    setPreviewSwap(null);
    if (targetIndex === -1 || !onLayoutChange) return;

    const thisLayout = allLayouts[postIndex];
    onLayoutChange(posts[postIndex].id, targetLayout);
    onLayoutChange(posts[targetIndex].id, thisLayout);
  };

  return (
    <div className={styles.canvas}>
      {posts.map((post, index) => {
        const layout = effectiveLayouts[index];
        const otherLayouts = allLayouts.filter((_, i) => i !== index);

        return (
          <DraggablePost
            key={post.id}
            layout={layout}
            otherLayouts={otherLayouts}
            canDrag={canDragPost(post)}
            onSwapWith={(targetLayout) => handleSwap(index, targetLayout)}
            onPreviewSwap={(targetLayout) => handlePreviewSwap(index, targetLayout)}
          >
            <BoardPostCard
              post={post}
              padletId={padletId}
              canManage={canEditPost(post)}
              canComment={canComment}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
            />
          </DraggablePost>
        );
      })}
    </div>
  );
}
