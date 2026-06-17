import { PadletBoardType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePadletDto {
  title!: string;

  description?: string;

  background?: string;

  board_type!: PadletBoardType;
}

export class CopyPadletDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  includePosts!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  includeParticipants!: boolean;
}