import type { Post } from '../interfaces/post';
import type { PostContentTab } from '../enums/post-content-tab';
import { httpClient } from '../../../shared/services';

export interface PostInput {
  color: string;
  contentTab: PostContentTab;
  content?: string;
  imageFileName?: string;
  imageData?: string;
  description?: string;
  pollAnswers?: string[];
}

/**
 * Creates a post on a padlet board.
 */
export function createPost(
  padletId: string,
  input: PostInput,
  visitId?: string | null,
): Promise<Post> {
  return httpClient<Post>(`padlets/${padletId}/posts`, {
    method: 'POST',
    body: { ...toContentBody(input), visit_id: visitId ?? undefined },
  });
}

/**
 * Updates an existing post's content on a padlet board.
 */
export function updatePost(
  padletId: string,
  postId: string,
  input: PostInput,
): Promise<Post> {
  return httpClient<Post>(`padlets/${padletId}/posts/${postId}`, {
    method: 'PATCH',
    body: toContentBody(input),
  });
}

/**
 * Swaps two post positions on a free-wall board.
 */
export function swapPosts(
  padletId: string,
  sourcePostId: string,
  targetPostId: string,
): Promise<{ source: Post; target: Post }> {
  return httpClient<{ source: Post; target: Post }>(`padlets/${padletId}/posts/swap`, {
    method: 'POST',
    body: { sourcePostId, targetPostId },
  });
}

/**
 * Deletes a post and returns the remaining posts (with refreshed layouts).
 */
export function deletePost(padletId: string, postId: string): Promise<Post[]> {
  return httpClient<Post[]>(`padlets/${padletId}/posts/${postId}`, {
    method: 'DELETE',
  });
}

function toContentBody(input: PostInput) {
  return {
    color: input.color,
    content_kind: input.contentTab,
    content: input.content,
    image_file_name: input.imageFileName,
    image_data: input.imageData,
    description: input.description,
    poll_answers: input.pollAnswers,
  };
}