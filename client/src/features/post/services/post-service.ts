import type { Post, PostLayout } from '../interfaces/post';
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
    body: toContentBody(input),
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
 * Updates a post's position on a padlet board.
 */
export function updatePostLayout(
  padletId: string,
  postId: string,
  layout: PostLayout,
): Promise<Post> {
  return httpClient<Post>(`padlets/${padletId}/posts/${postId}/layout`, {
    method: 'PATCH',
    body: layout,
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
  };
}
