import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../enums/post-content-tab';
import type { Post } from '../interfaces/post';

export function inferContentTab(post: Post): PostContentTab {
  if (post.title === 'תמונה') {
    return PostContentTabValues.Image;
  }

  if (post.title === 'קישור') {
    return PostContentTabValues.Link;
  }

  if (post.subject === 'סקר') {
    return PostContentTabValues.Poll;
  }

  return PostContentTabValues.Text;
}

export function getInitialTextContent(
  post: Post,
  contentTab: PostContentTab,
): string {
  switch (contentTab) {
    case PostContentTabValues.Text:
    case PostContentTabValues.Link:
      return post.subject ?? '';
    case PostContentTabValues.Poll:
      return post.title ?? '';
    default:
      return '';
  }
}
