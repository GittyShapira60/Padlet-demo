import { httpClient } from '../../../../shared/services';
import type {
  PadletReactionsResponse,
  PostReactionsView,
} from '../types/post-reaction';

/**
 * Fetches aggregated reactions for all posts on a padlet board.
 */
export function getPadletReactions(
  padletId: string,
): Promise<PadletReactionsResponse> {
  return httpClient<PadletReactionsResponse>(`padlets/${padletId}/reactions`);
}

/**
 * Fetches aggregated reactions for a post.
 */
export function getPostReactions(
  padletId: string,
  postId: string,
): Promise<PostReactionsView> {
  return httpClient<PostReactionsView>(
    `padlets/${padletId}/posts/${postId}/reactions`,
  );
}

/**
 * Sets or replaces the current user's reaction on a post.
 */
export function setPostReaction(
  padletId: string,
  postId: string,
  reactionCode: string,
): Promise<PostReactionsView> {
  return httpClient<PostReactionsView>(
    `padlets/${padletId}/posts/${postId}/reactions`,
    {
      method: 'PUT',
      body: { reaction_code: reactionCode },
    },
  );
}

/**
 * Removes the current user's reaction from a post.
 */
export function removePostReaction(
  padletId: string,
  postId: string,
): Promise<PostReactionsView> {
  return httpClient<PostReactionsView>(
    `padlets/${padletId}/posts/${postId}/reactions`,
    {
      method: 'DELETE',
    },
  );
}
