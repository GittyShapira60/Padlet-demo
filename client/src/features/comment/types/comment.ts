export interface Comment {
  id: string;
  postId: string;
  authorUsername: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
}
