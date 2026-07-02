import { BACKGROUND_COLOR_LIGHT } from '../../../../../shared/constants/background-colors';
import type { Post } from '../../../interfaces/post';
import PadletPostCard from '../../PadletPostCard/PadletPostCard';
import ThoughtBubble from './ThoughtBubble/ThoughtBubble';

interface BrainstormingPostCardProps {
  post: Post;
  padletId: string;
  canComment?: boolean;
}

export default function BrainstormingPostCard({
  post,
  padletId,
  canComment = false,
}: BrainstormingPostCardProps) {
  const background = BACKGROUND_COLOR_LIGHT[post.color ?? ''] ?? post.color ?? '#ffffff';

  return (
    <ThoughtBubble color={background}>
      <PadletPostCard
        post={post}
        padletId={padletId}
        canComment={canComment}
        variant="bubble"
        commentsCollapsible
        scrollableComments
      />
    </ThoughtBubble>
  );
}
