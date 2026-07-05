import type { Post } from '../../../interfaces/post';
import BoardPostCard from '../BoardPostCard';
import type { BoardLayoutProps } from '../board-layout-props';

type BoardLayoutPostCardProps = Pick<
  BoardLayoutProps,
  'padletId' | 'canComment' | 'canEditPost' | 'onEditPost' | 'onDeletePost'
> & {
  post: Post;
};

export default function BoardLayoutPostCard({
  post,
  padletId,
  canComment,
  canEditPost,
  onEditPost,
  onDeletePost,
}: BoardLayoutPostCardProps) {
  return (
    <BoardPostCard
      post={post}
      padletId={padletId}
      canManage={canEditPost(post)}
      canComment={canComment}
      onEditPost={onEditPost}
      onDeletePost={onDeletePost}
    />
  );
}
