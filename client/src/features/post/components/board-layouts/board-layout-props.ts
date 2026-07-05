import type { Post } from '../../interfaces/post';

export interface BoardLayoutProps {
  padletId: string;
  posts: Post[];
  canComment: boolean;
  canEditPost: (post: Post) => boolean;
  canDragPost: (post: Post) => boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onPostSwap?: (sourcePostId: string, targetPostId: string) => void;
}
