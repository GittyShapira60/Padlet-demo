import type { Post } from '../interfaces/post';
import type { PostContentTab } from '../enums/post-content-tab';
import { httpClient } from '../../../shared/services';

export interface PostInput {
  color: string;
  contentTab: PostContentTab;
  content?: string;
  imageFileName?: string;
}

/**
 * Creates a post on a padlet board.
 */
export function createPost(
  padletId: string,
  input: PostInput,
): Promise<Post> {
  return httpClient<Post>(`padlets/${padletId}/posts`, {
    method: 'POST',
    body: toRequestBody(input),
  });
}

/**
 * Updates an existing post on a padlet board.
 */
export function updatePost(
  padletId: string,
  postId: string,
  input: PostInput,
): Promise<Post> {
  return httpClient<Post>(`padlets/${padletId}/posts/${postId}`, {
    method: 'PATCH',
    body: toRequestBody(input),
  });
}

/**
 * Deletes a post from a padlet board.
 */
export function deletePost(padletId: string, postId: string): Promise<void> {
  return httpClient<void>(`padlets/${padletId}/posts/${postId}`, {
    method: 'DELETE',
  });
}

function toRequestBody(input: PostInput) {
  return {
    color: input.color,
    content_kind: input.contentTab,
    content: input.content,
    image_file_name: input.imageFileName,
  };
}
