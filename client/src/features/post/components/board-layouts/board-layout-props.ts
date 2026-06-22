import type { Post, PostLayout } from '../../interfaces/post';

export interface BoardLayoutProps {
  padletId: string;
  posts: Post[];
  currentUsername?: string;
  canComment?: boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onLayoutChange?: (postId: string, layout: PostLayout) => void;
}
