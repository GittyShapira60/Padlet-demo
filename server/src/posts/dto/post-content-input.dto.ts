export const POST_CONTENT_INPUT_KINDS = [
  'text',
  'image',
  'link',
  'poll',
] as const;

export type PostContentInputKind = (typeof POST_CONTENT_INPUT_KINDS)[number];

export class PostContentInputDto {
  color?: string;

  content_kind!: PostContentInputKind;

  content?: string;

  image_file_name?: string;

  image_data?: string;

  description?: string;

  poll_options?: string[];
}