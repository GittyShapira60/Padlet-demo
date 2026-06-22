import PadletPostCard from '../PadletPostCard/PadletPostCard';
import type { Post } from '../../interfaces/post';

interface BoardPostCardProps {
  post: Post;
  currentUsername?: string;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
}

export default function BoardPostCard({
  post,
  currentUsername,
  onEditPost,
  onDeletePost,
}: BoardPostCardProps) {
  const canManage = currentUsername === post.authorUsername;

  return (
    <PadletPostCard
      post={post}
      canManage={canManage}
      onEdit={onEditPost}
      onDelete={onDeletePost}
    />
  );
}