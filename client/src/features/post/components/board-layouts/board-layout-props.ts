import type { Post, PostLayout } from '../../interfaces/post';

export interface BoardLayoutProps {
  padletId: string;
  posts: Post[];
  canComment: boolean;
  canEditPost: (post: Post) => boolean;
  canDragPost: (post: Post) => boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onLayoutChange?: (postId: string, layout: PostLayout) => void;
}
