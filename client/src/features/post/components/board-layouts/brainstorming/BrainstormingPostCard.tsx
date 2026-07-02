import { BACKGROUND_COLOR_LIGHT } from '../../../../../shared/constants/background-colors';
import type { Post } from '../../../interfaces/post';
import PadletPostCard from '../../PadletPostCard/PadletPostCard';
import ThoughtBubble from './ThoughtBubble/ThoughtBubble';

interface BrainstormingPostCardProps {
  post: Post;
  padletId: string;
  canManage?: boolean;
  canComment?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

export default function BrainstormingPostCard({
  post,
  padletId,
  canManage = false,
  canComment = false,
  onEdit,
  onDelete,
}: BrainstormingPostCardProps) {
  const background = BACKGROUND_COLOR_LIGHT[post.color ?? ''] ?? post.color ?? '#ffffff';

  return (
    <ThoughtBubble color={background}>
      <PadletPostCard
        post={post}
        padletId={padletId}
        canManage={canManage}
        canComment={canComment}
        onEdit={onEdit}
        onDelete={onDelete}
        variant="bubble"
        commentsCollapsible
        scrollableComments
      />
    </ThoughtBubble>
  );
}
