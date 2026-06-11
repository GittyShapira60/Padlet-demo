import type { Padlet } from './padlet';

export interface PostLayout {
  x: number;
  y: number;
}

export interface Post {
  id: string;
  padletId: string;
  authorUsername: string;
  title: string | null;
  subject: string | null;
  color: string | null;
  layout: PostLayout | null;
  createdAt: string;
}

export interface PadletDetail {
  padlet: Padlet;
  posts: Post[];
}
