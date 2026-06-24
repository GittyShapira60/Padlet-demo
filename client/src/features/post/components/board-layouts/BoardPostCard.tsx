import PadletPostCard from '../PadletPostCard/PadletPostCard';
import type { Post } from '../../interfaces/post';

interface BoardPostCardProps {
  post: Post;
  canManage: boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
}

export default function BoardPostCard({
  post,
  canManage,
  onEditPost,
  onDeletePost,
}: BoardPostCardProps) {
  return (
    <PadletPostCard
      post={post}
      canManage={canManage}
      onEdit={onEditPost}
      onDelete={onDeletePost}
    />
  );
}