import { PostContentInputDto } from './post-content-input.dto';

export {
  POST_CONTENT_INPUT_KINDS,
  type PostContentInputKind,
} from './post-content-input.dto';

export class CreatePostDto extends PostContentInputDto {}
