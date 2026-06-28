import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'שלום!' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}
