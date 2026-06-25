import PadletPostCard from '../PadletPostCard/PadletPostCard';
import type { Post } from '../../interfaces/post';

interface BoardPostCardProps {
  post: Post;
  padletId: string;
  currentUsername?: string;
  canComment?: boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
}

export default function BoardPostCard({
  post,
  padletId,
  currentUsername,
  canComment,
  onEditPost,
  onDeletePost,
}: BoardPostCardProps) {
  const canManage = currentUsername === post.authorUsername;

  return (
    <PadletPostCard
      post={post}
      padletId={padletId}
      canComment={canComment}
      canManage={canManage}
      onEdit={onEditPost}
      onDelete={onDeletePost}
    />
  );
}