import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export const POST_CONTENT_INPUT_KINDS = [
  'text',
  'image',
  'link',
  'poll',
] as const;

export type PostContentInputKind = (typeof POST_CONTENT_INPUT_KINDS)[number];

export class CreatePostDto {
  @ApiProperty({ example: '#fff9c4', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;

  @ApiProperty({ enum: POST_CONTENT_INPUT_KINDS, example: 'text' })
  @IsIn(POST_CONTENT_INPUT_KINDS)
  content_kind!: PostContentInputKind;

  @ApiProperty({ example: 'תוכן הפוסט', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: 'image.png', required: false })
  @IsOptional()
  @IsString()
  image_file_name?: string;

  @ApiProperty({
    example: ['צהוב', 'כחול', 'ירוק'],
    required: false,
    description: 'תשובות לסקר (נדרש כאשר content_kind הוא poll)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  poll_options?: string[];
}
