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
  const allLayouts = posts.map((post, index) => post.layout ?? getDefaultLayout(index));

  return (
    <div className={styles.canvas}>
      {posts.map((post, index) => {
        const layout = allLayouts[index];
        const otherLayouts = allLayouts.filter((_, i) => i !== index);

        return (
          <DraggablePost
            key={post.id}
            layout={layout}
            otherLayouts={otherLayouts}
            canDrag={canDragPost(post)}
            onLayoutChange={(nextLayout) =>
              onLayoutChange?.(post.id, nextLayout)
            }
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
