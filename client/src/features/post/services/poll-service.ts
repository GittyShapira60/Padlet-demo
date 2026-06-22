import type { Post } from '../interfaces/post';
import { httpClient } from '../../../shared/services';

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