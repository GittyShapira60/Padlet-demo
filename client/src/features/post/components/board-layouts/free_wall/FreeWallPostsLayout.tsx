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
  padletId,
  posts,
  currentUsername,
  canComment,
  onEditPost,
  onDeletePost,
  onLayoutChange,
}: BoardLayoutProps) {
  return (
    <div className={styles.canvas}>
      {posts.map((post, index) => {
        const layout = post.layout ?? getDefaultLayout(index);
        const canDrag = currentUsername === post.authorUsername;

        return (
          <DraggablePost
            key={post.id}
            layout={layout}
            canDrag={canDrag}
            onLayoutChange={(nextLayout) =>
              onLayoutChange?.(post.id, nextLayout)
            }
          >
            <BoardPostCard
              post={post}
              padletId={padletId}
              currentUsername={currentUsername}
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
