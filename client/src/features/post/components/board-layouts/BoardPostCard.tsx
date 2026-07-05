import PadletPostCard from '../PadletPostCard/PadletPostCard';
import type { Post } from '../../interfaces/post';

interface BoardPostCardProps {
  post: Post;
  padletId: string;
  canManage: boolean;
  canComment: boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onContentResize?: () => void;
}

export default function BoardPostCard({
  post,
  padletId,
  canManage,
  canComment,
  onEditPost,
  onDeletePost,
  onContentResize,
}: BoardPostCardProps) {
  return (
    <PadletPostCard
      post={post}
      padletId={padletId}
      canManage={canManage}
      canComment={canComment}
      onEdit={onEditPost}
      onDelete={onDeletePost}
      onContentResize={onContentResize}
    />
  );
}
