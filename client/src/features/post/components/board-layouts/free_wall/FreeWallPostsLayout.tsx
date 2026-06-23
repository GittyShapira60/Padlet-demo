import type { PostLayout } from '../../../interfaces/post';
import BoardPostCard from '../BoardPostCard';
import type { BoardLayoutProps } from '../board-layout-props';
import DraggablePost from './DraggablePost';
import styles from './FreeWallPostsLayout.module.css';

function getDefaultLayout(index: number): PostLayout {
  return {
    x: 6 + (index % 3) * 28,
    y: 8 + Math.floor(index / 3) * 22,
  };
}

export default function FreeWallPostsLayout({
  posts,
  canEditPost,
  canDragPost,
  onEditPost,
  onDeletePost,
  onLayoutChange,
}: BoardLayoutProps) {
  return (
    <div className={styles.canvas}>
      {posts.map((post, index) => {
        const layout = post.layout ?? getDefaultLayout(index);

        return (
          <DraggablePost
            key={post.id}
            layout={layout}
            canDrag={canDragPost(post)}
            onLayoutChange={(nextLayout) =>
              onLayoutChange?.(post.id, nextLayout)
            }
          >
            <BoardPostCard
              post={post}
              canManage={canEditPost(post)}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
            />
          </DraggablePost>
        );
      })}
    </div>
  );
}
