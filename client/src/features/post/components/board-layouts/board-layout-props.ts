import type { Post, PostLayout } from '../../interfaces/post';

export interface BoardLayoutProps {
  posts: Post[];
  currentUsername?: string;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onLayoutChange?: (postId: string, layout: PostLayout) => void;
}
