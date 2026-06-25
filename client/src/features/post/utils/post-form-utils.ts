import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../enums/post-content-tab';
import type { Post } from '../interfaces/post';

export function inferContentTab(post: Post): PostContentTab {
  switch (post.postType) {
    case 'image': return PostContentTabValues.Image;
    case 'link': return PostContentTabValues.Link;
    case 'poll': return PostContentTabValues.Poll;
    default: return PostContentTabValues.Text;
  }
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

export function getInitialDescription(post: Post): string {
  if (post.postType === 'image' || post.postType === 'link') {
    return post.title ?? '';
  }
  return '';
}
