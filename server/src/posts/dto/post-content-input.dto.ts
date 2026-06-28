export const POST_CONTENT_INPUT_KINDS = [
  'text',
  'image',
  'link',
  'poll',
] as const;

export type PostContentInputKind = (typeof POST_CONTENT_INPUT_KINDS)[number];

/**
 * Internal DTO — not exposed as a request body.
 * Constructed by PostsController from validated CreatePostDto / UpdatePostDto before calling the service.
 */
export class PostContentInputDto {
  color?: string;

  content_kind!: PostContentInputKind;

  content?: string;

  image_file_name?: string;

  image_data?: string;

  description?: string;

  poll_options?: string[];
}