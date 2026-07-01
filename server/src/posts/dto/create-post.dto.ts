import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
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

  @ApiProperty({ example: 'data:image/png;base64,...', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(png|jpe?g|gif|webp);base64,/, { message: 'image_data must be a valid base64-encoded image' })
  image_data?: string;

  @ApiProperty({ example: 'תיאור הפוסט', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: ['תשובה 1', 'תשובה 2'],
    required: false,
    type: [String],
  })
  @ValidateIf((dto: CreatePostDto) => dto.content_kind === 'poll')
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  poll_answers?: string[];

  @ApiProperty({ example: '12345', required: false, description: 'מזהה הביקור הנוכחי בלוח (לצורך מניעת ספירת ביקור כפולה)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  visit_id?: string;
}