import type { Post } from '../interfaces/post';
import type { PostContentTab } from '../enums/post-content-tab';
import { httpClient } from '../../../shared/services';

export interface PostInput {
  color: string;
  contentTab: PostContentTab;
  content?: string;
  imageFileName?: string;
  pollOptions?: string[];
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

/**
 * Votes on a poll option.
 */
export function votePoll(
  padletId: string,
  postId: string,
  optionId: string,
): Promise<Post> {
  return httpClient<Post>(`padlets/${padletId}/posts/${postId}/vote`, {
    method: 'POST',
    body: { option_id: optionId },
  });
}

function toRequestBody(input: PostInput) {
  return {
    color: input.color,
    content_kind: input.contentTab,
    content: input.content,
    image_file_name: input.imageFileName,
    poll_options: input.pollOptions,
  };
}
