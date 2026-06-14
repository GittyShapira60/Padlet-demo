export const PostContentTab = {
  Text: 'text',
  Image: 'image',
  Link: 'link',
  Poll: 'poll',
} as const;

export type PostContentTab =
  (typeof PostContentTab)[keyof typeof PostContentTab];
