import { useState } from 'react';
import type { PostLayout } from '../../../interfaces/post';
import BoardPostCard from '../BoardPostCard';
import type { BoardLayoutProps } from '../board-layout-props';
import DraggablePost from './DraggablePost';
import styles from './FreeWallPostsLayout.module.css';

// Keep in sync with FREE_WALL_COLUMNS and default layout formula in posts.service.ts
const FREE_WALL_COLUMNS = 3;

function getDefaultLayout(index: number): PostLayout {
  return {
    x: 8 + (index % FREE_WALL_COLUMNS) * 26,
    y: 12 + Math.floor(index / FREE_WALL_COLUMNS) * 20,
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

  const handlePreviewSwap = (postIndex: number, targetId: string | null) => {
    if (targetId === null) {
      setPreviewSwap(null);
      return;
    }
    const targetIndex = posts.findIndex((p) => p.id === targetId);
    if (targetIndex !== -1) {
      setPreviewSwap({ dragIndex: postIndex, targetIndex });
    }
  };

  const handleSwap = (postIndex: number, targetId: string) => {
    const targetIndex = posts.findIndex((p) => p.id === targetId);
    setPreviewSwap(null);
    if (targetIndex === -1 || !onLayoutChange) return;

    const thisLayout = allLayouts[postIndex];
    const targetLayout = allLayouts[targetIndex];
    onLayoutChange(posts[postIndex].id, targetLayout);
    onLayoutChange(posts[targetIndex].id, thisLayout);
  };

  return (
    <div className={styles.canvas}>
      {posts.map((post, index) => {
        const layout = effectiveLayouts[index];
        const otherPosts = posts
          .map((p, i) => ({ id: p.id, layout: effectiveLayouts[i] }))
          .filter((_, i) => i !== index);

        return (
          <DraggablePost
            key={post.id}
            layout={layout}
            otherPosts={otherPosts}
            canDrag={canDragPost(post)}
            onSwapWith={(targetId) => handleSwap(index, targetId)}
            onPreviewSwap={(targetId) => handlePreviewSwap(index, targetId)}
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
