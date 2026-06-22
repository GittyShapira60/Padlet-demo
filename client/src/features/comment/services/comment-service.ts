import type { Comment } from '../types/comment';
import { httpClient } from '../../../shared/services';

export function listComments(
  padletId: string,
  postId: string,
): Promise<Comment[]> {
  return httpClient<Comment[]>(
    `padlets/${padletId}/posts/${postId}/comments`,
  );
}

export function createComment(
  padletId: string,
  postId: string,
  body: string,
): Promise<Comment> {
  return httpClient<Comment>(`padlets/${padletId}/posts/${postId}/comments`, {
    method: 'POST',
    body: { body },
  });
}

export function deleteComment(
  padletId: string,
  postId: string,
  commentId: string,
): Promise<void> {
  return httpClient<void>(
    `padlets/${padletId}/posts/${postId}/comments/${commentId}`,
    { method: 'DELETE' },
  );
}
