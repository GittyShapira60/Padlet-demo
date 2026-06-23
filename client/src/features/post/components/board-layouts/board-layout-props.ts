import type { Post, PostLayout } from '../../interfaces/post';

export interface BoardLayoutProps {
  posts: Post[];
  canEditPost: (post: Post) => boolean;
  canDragPost: (post: Post) => boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onLayoutChange?: (postId: string, layout: PostLayout) => void;
}
